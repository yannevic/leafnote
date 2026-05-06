import { useState, useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth } from './lib/firebase'
import Board from './pages/Board'
import Login from './pages/Login'
import TitleBar from './components/TitleBar'
import UpdateNotifier, { UpdateStatus } from './components/UpdateNotifier'
import { useBoards } from './hooks/useBoards'
import ChangelogModal from './components/ChangelogModal'
import { useNotificationCenter } from './hooks/useNotificationCenter'
import { subscribeCoins } from './lib/garden'
import HouseCalibrate from './HouseCalibrate'

function AppInner({ user }: { user: User }) {
  const { extraBoards, activeBoardId, setActiveBoardId, addBoard, removeBoard } = useBoards(
    user.uid
  )
  const [partnerUid, setPartnerUid] = useState<string>('')

  useEffect(() => {
    import('firebase/database').then(({ getDatabase, ref, onValue }) => {
      const db = getDatabase()
      const r = ref(db, 'users/' + user.uid + '/partnerUid')
      const unsub = onValue(r, (snap) => {
        setPartnerUid(snap.val() ?? '')
      })
      return () => unsub()
    })
  }, [user.uid])

  const extraBoardNames = Object.fromEntries(extraBoards.map((b) => [b.id, b.name]))
  const { notifications } = useNotificationCenter({ uid: user.uid, partnerUid, extraBoardNames })

  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>('idle')
  const [updateProgress, setUpdateProgress] = useState(0)
  const [coins, setCoins] = useState(0)

  useEffect(() => {
    const unsub = subscribeCoins(setCoins)
    return unsub
  }, [])

  return (
    <div className="fixed inset-0 flex flex-col">
      <ChangelogModal />
      <UpdateNotifier
        onStatus={setUpdateStatus}
        onProgress={setUpdateProgress}
        onError={() => {}}
      />
      <TitleBar
        extraBoards={extraBoards}
        activeBoardId={activeBoardId}
        onSwitchBoard={setActiveBoardId}
        onAddBoard={addBoard}
        onRemoveBoard={removeBoard}
        updateStatus={updateStatus}
        updateProgress={updateProgress}
        onInstallUpdate={() => window.api.installUpdate()}
        onCheckUpdate={() => window.api.checkForUpdates()}
        notifications={notifications}
        coins={coins}
      />
      <div className="flex-1 overflow-hidden">
        <HashRouter>
          <Routes>
            <Route path="/login" element={<Navigate to="/board" replace />} />
            <Route path="/board" element={<Board activeBoardId={activeBoardId} />} />
            <Route path="/calibrate" element={<HouseCalibrate />} />
            <Route path="*" element={<Navigate to="/board" replace />} />
          </Routes>
        </HashRouter>
      </div>
    </div>
  )
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setAuthLoading(false)
    })
    return unsub
  }, [])

  if (authLoading) {
    return (
      <div className="fixed inset-0 flex flex-col" style={{ background: '#fdf6f0' }}>
        <TitleBar
          extraBoards={[]}
          activeBoardId="default"
          onSwitchBoard={() => {}}
          onAddBoard={() => {}}
          onRemoveBoard={() => {}}
        />
        <div className="flex-1 flex items-center justify-center">
          <span className="text-3xl animate-spin">🌸</span>
        </div>
      </div>
    )
  }

  if (user === null) {
    return (
      <div className="fixed inset-0 flex flex-col">
        <TitleBar
          extraBoards={[]}
          activeBoardId="default"
          onSwitchBoard={() => {}}
          onAddBoard={() => {}}
          onRemoveBoard={() => {}}
        />
        <div className="flex-1 overflow-hidden">
          <HashRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </HashRouter>
        </div>
      </div>
    )
  }

  return <AppInner user={user} />
}

export default App
