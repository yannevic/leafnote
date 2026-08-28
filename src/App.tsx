import { useState, useEffect, useMemo } from 'react'
import { usePresence } from './hooks/usePresence'
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
import { subscribePanicMode, setPanicMode } from './lib/garden'
import { subscribeCoins } from './lib/garden'
import HouseCalibrate from './HouseCalibrate'
import { CoupleProvider, useCoupleId } from './contexts/CoupleContext'
import CoupleSetup from './components/CoupleSetup'
import WaitingPartner from './components/WaitingPartner'
import { Loader2 } from 'lucide-react'
import CoinPopupLayer from './components/CoinPopupLayer'

function AppInner({ user, coupleId }: { user: User; coupleId: string }) {
  const { extraBoards, activeBoardId, setActiveBoardId, addBoard, removeBoard } = useBoards(
    coupleId,
    user.uid
  )
  const { partnerUid, myPresence, partnerPresence } = usePresence(
    coupleId,
    user.uid,
    user.displayName ?? ''
  )
  const myNick = myPresence?.displayName ?? ''
  const partnerNick = partnerPresence?.displayName ?? ''

  const extraBoardNames = useMemo(
    () => Object.fromEntries(extraBoards.map((b) => [b.id, b.name])),
    [extraBoards]
  )
  const { notifications, dismiss } = useNotificationCenter({
    uid: user.uid,
    partnerUid,
    coupleId,
    myNick,
    partnerNick,
    extraBoardNames,
  })

  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>('idle')
  const [updateProgress, setUpdateProgress] = useState(0)
  const [coins, setCoins] = useState(0)
  const [panicMode, setPanicModeState] = useState(false)

  useEffect(() => {
    const unsub = subscribePanicMode(coupleId, setPanicModeState)
    return unsub
  }, [coupleId])

  const handleTogglePanic = () => setPanicMode(coupleId, !panicMode)

  useEffect(() => {
    const unsub = subscribeCoins(coupleId, setCoins)
    return unsub
  }, [coupleId])

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
        onDismissNotification={dismiss}
        coupleId={coupleId}
        coins={coins}
        uid={user.uid}
        partnerUid={partnerUid}
        panicMode={panicMode}
        onTogglePanic={handleTogglePanic}
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
      <CoinPopupLayer />
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
          <Loader2 size={32} className="animate-spin" color="#7fb87f" />
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

  return (
    <CoupleProvider user={user}>
      <AppGate user={user} />
    </CoupleProvider>
  )
}

function AppGate({ user }: { user: User }) {
  const { coupleId, loadingCoupleId, waitingPartner, inviteCode } = useCoupleId()

  if (loadingCoupleId) {
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
          <Loader2 size={32} className="animate-spin" color="#7fb87f" />
        </div>
      </div>
    )
  }

  if (!coupleId) {
    return <CoupleSetup user={user} />
  }

  if (waitingPartner) {
    return <WaitingPartner inviteCode={inviteCode ?? ''} />
  }

  return <AppInner user={user} coupleId={coupleId} />
}

export default App
