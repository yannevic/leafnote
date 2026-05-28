import { useState } from 'react'
import { auth } from '../lib/firebase'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  browserLocalPersistence,
  setPersistence,
  updateProfile,
} from 'firebase/auth'
import { Leaf, AlertCircle } from 'lucide-react'
import TitleBar from '../components/TitleBar'

type Mode = 'login' | 'register'

export default function Login() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setError('')
    if (mode === 'register' && nickname.trim() === '') {
      setError('coloca seu apelido aí')
      return
    }
    setLoading(true)
    try {
      await setPersistence(auth, browserLocalPersistence)
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password)
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email, password)
        await updateProfile(cred.user, { displayName: nickname.trim() })
      }
    } catch {
      setError('e-mail ou senha incorretos, tenta de novo')
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className="fixed inset-0 flex flex-col">
      <TitleBar
        extraBoards={[]}
        activeBoardId="default"
        onSwitchBoard={() => {}}
        onAddBoard={() => {}}
        onRemoveBoard={() => {}}
      />
      <div
        className="flex-1 flex items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #f0f7f0 0%, #e8f5e8 60%, #f5f0e8 100%)' }}
      >
        <div className="relative z-10 flex flex-col items-center gap-5 w-full max-w-sm px-8">
          <div className="flex flex-col items-center gap-1">
            <Leaf size={40} color="#4a7a4a" strokeWidth={1.5} />
            <h1
              className="text-2xl font-bold"
              style={{ color: '#2d4a2d', fontFamily: 'Baloo 2, sans-serif' }}
            >
              leafnote
            </h1>
            <p className="text-sm" style={{ color: '#4a7a4a', fontFamily: 'Baloo 2, sans-serif' }}>
              {mode === 'login' ? 'nosso cantinho' : 'vamos começar?'}
            </p>
          </div>

          <div
            className="flex flex-col gap-4 rounded-2xl"
            style={{
              background: '#f2faf2',
              border: '1px solid #d8eed8',
              boxShadow: '0 2px 12px #4a7a4a08',
              padding: '2rem 2.5rem',
              width: '360px',
              fontFamily: 'Baloo 2, sans-serif',
            }}
          >
            {mode === 'register' && (
              <input
                type="text"
                placeholder="seu apelido"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="nickname"
                className="rounded-xl outline-none"
                style={{
                  background: '#eaf5ea',
                  border: '1.5px solid #a8d8a8',
                  color: '#2d4a2d',
                  padding: '0.85rem 1.2rem',
                  fontSize: '0.9rem',
                  width: '100%',
                }}
              />
            )}
            <input
              type="email"
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="email"
              className="rounded-xl outline-none"
              style={{
                background: '#eaf5ea',
                border: '1.5px solid #a8d8a8',
                color: '#2d4a2d',
                padding: '0.85rem 1.2rem',
                fontSize: '0.9rem',
                width: '100%',
              }}
            />
            <input
              type="password"
              placeholder="senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              className="rounded-xl outline-none"
              style={{
                background: '#eaf5ea',
                border: '1.5px solid #a8d8a8',
                color: '#2d4a2d',
                padding: '0.85rem 1.2rem',
                fontSize: '0.9rem',
                width: '100%',
              }}
            />

            {error !== '' && (
              <div className="flex items-center gap-2 text-xs" style={{ color: '#c0504a' }}>
                <AlertCircle size={13} />
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="relative overflow-hidden font-bold text-sm transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-60 self-center cursor-pointer"
              style={{
                padding: '0.45rem 1.4rem',
                color: '#5a2e0e',
                textShadow: '0 1px 0 #e8c49866',
                letterSpacing: '0.04em',
                borderRadius: '10px',
                background: 'linear-gradient(180deg, #d4956a 0%, #c4845a 40%, #b8744e 100%)',
                boxShadow: '0 3px 10px #8b5a2a44, inset 0 1px 0 #e8b07844',
                border: '2px solid #8b5a2a',
                fontFamily: 'Baloo 2, sans-serif',
              }}
            >
              <svg
                aria-hidden="true"
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 160 48"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 28 Q30 18 55 26 Q75 32 95 24 Q115 16 148 26"
                  stroke="#5a2e0e"
                  strokeWidth="1.4"
                  fill="none"
                  opacity="0.6"
                />
                <path
                  d="M8 36 Q35 28 60 34 Q85 40 110 32 Q130 26 150 34"
                  stroke="#5a2e0e"
                  strokeWidth="1.2"
                  fill="none"
                  opacity="0.5"
                />
                <path
                  d="M20 20 Q40 14 65 20 Q80 24 100 18"
                  stroke="#5a2e0e"
                  strokeWidth="1.1"
                  fill="none"
                  opacity="0.45"
                />
              </svg>
              <span className="relative z-10">
                {loading ? '...' : mode === 'login' ? 'entrar' : 'criar conta'}
              </span>
            </button>
          </div>

          <button
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login')
              setError('')
            }}
            className="text-xs transition-opacity hover:opacity-80 cursor-pointer"
            style={{ color: '#4a7a4a', fontFamily: 'Baloo 2, sans-serif' }}
          >
            {mode === 'login' ? 'primeira vez aqui? cria sua conta' : 'já tem conta? entra aqui'}
          </button>

          <p
            className="text-xs"
            style={{ color: '#7fb87f', opacity: 0.6, fontFamily: 'Baloo 2, sans-serif' }}
          >
            leafnote
          </p>
        </div>
      </div>
    </div>
  )
}
