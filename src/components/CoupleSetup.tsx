import { useState } from 'react'
import { Leaf, Link2, Plus, ArrowRight, AlertCircle } from 'lucide-react'
import TitleBar from './TitleBar'
import { createCouple, joinCouple } from '../lib/couple'
import { User } from 'firebase/auth'

type Step = 'choice' | 'joining'

export default function CoupleSetup({ user }: { user: User }) {
  const [step, setStep] = useState<Step>('choice')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCreate() {
    setLoading(true)
    setError('')
    try {
      await createCouple(user.uid)
      // CoupleContext detecta a mudança via onValue automaticamente
    } catch {
      setError('Erro ao criar o mural, tenta de novo')
    } finally {
      setLoading(false)
    }
  }

  async function handleJoin() {
    if (code.trim().length < 6) {
      setError('O código tem 6 caracteres')
      return
    }
    setLoading(true)
    setError('')
    try {
      await joinCouple(user.uid, code.trim())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Código inválido')
    } finally {
      setLoading(false)
    }
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
        className="flex-1 flex items-center justify-center"
        style={{ background: 'linear-gradient(160deg, #f0f7f0 0%, #e8f5e8 60%, #f5f0e8 100%)' }}
      >
        <div
          className="flex flex-col items-center gap-6"
          style={{ width: 360, fontFamily: 'Baloo 2, sans-serif' }}
        >
          {/* Logo */}
          <div className="flex flex-col items-center gap-1">
            <Leaf size={36} color="#4a7a4a" strokeWidth={1.5} />
            <h1 className="text-2xl font-bold" style={{ color: '#2d4a2d' }}>
              leafnote
            </h1>
            <p className="text-sm" style={{ color: '#4a7a4a' }}>
              bem-vindo, {user.displayName ?? 'você'}
            </p>
          </div>

          {step === 'choice' && (
            <div
              className="flex flex-col gap-3 rounded-2xl w-full"
              style={{
                background: '#f2faf2',
                border: '1px solid #d8eed8',
                boxShadow: '0 2px 12px #4a7a4a08',
                padding: '2rem',
              }}
            >
              <p className="text-sm font-semibold text-center mb-1" style={{ color: '#2d4a2d' }}>
                o que você quer fazer?
              </p>

              {/* Criar */}
              <button
                onClick={handleCreate}
                disabled={loading}
                className="flex items-center gap-3 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 cursor-pointer"
                style={{
                  background: 'linear-gradient(180deg, #d4956a 0%, #b8744e 100%)',
                  border: '2px solid #8b5a2a',
                  boxShadow: '0 3px 10px #8b5a2a44',
                  color: '#5a2e0e',
                  padding: '0.9rem 1.2rem',
                }}
              >
                <Plus size={18} strokeWidth={2.5} />
                <div className="text-left">
                  <div>{loading ? 'criando...' : 'criar um mural'}</div>
                  <div className="text-xs font-normal opacity-70">
                    você gera o código e chama seu par
                  </div>
                </div>
                <ArrowRight size={16} className="ml-auto opacity-60" />
              </button>

              {/* Entrar */}
              <button
                onClick={() => {
                  setStep('joining')
                  setError('')
                }}
                disabled={loading}
                className="flex items-center gap-3 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 cursor-pointer"
                style={{
                  background: 'linear-gradient(180deg, #a8d8a8 0%, #7fb87f 100%)',
                  border: '2px solid #4a7a4a',
                  boxShadow: '0 3px 10px #4a7a4a22',
                  color: '#1a2a1a',
                  padding: '0.9rem 1.2rem',
                }}
              >
                <Link2 size={18} strokeWidth={2.5} />
                <div className="text-left">
                  <div>entrar em um mural</div>
                  <div className="text-xs font-normal opacity-70">
                    você recebeu um código de 6 letras
                  </div>
                </div>
                <ArrowRight size={16} className="ml-auto opacity-60" />
              </button>

              {error !== '' && (
                <div className="flex items-center gap-2 text-xs" style={{ color: '#c0504a' }}>
                  <AlertCircle size={13} />
                  {error}
                </div>
              )}
            </div>
          )}

          {step === 'joining' && (
            <div
              className="flex flex-col gap-4 rounded-2xl w-full"
              style={{
                background: '#f2faf2',
                border: '1px solid #d8eed8',
                boxShadow: '0 2px 12px #4a7a4a08',
                padding: '2rem',
              }}
            >
              <p className="text-sm font-semibold text-center" style={{ color: '#2d4a2d' }}>
                qual é o código?
              </p>
              <input
                type="text"
                placeholder="ex: AB3X7K"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleJoin()
                }}
                maxLength={6}
                className="rounded-xl outline-none text-center font-bold tracking-widest text-lg"
                style={{
                  background: '#eaf5ea',
                  border: '1.5px solid #a8d8a8',
                  color: '#2d4a2d',
                  padding: '0.85rem 1.2rem',
                }}
                autoFocus
              />

              {error !== '' && (
                <div className="flex items-center gap-2 text-xs" style={{ color: '#c0504a' }}>
                  <AlertCircle size={13} />
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setStep('choice')
                    setError('')
                    setCode('')
                  }}
                  disabled={loading}
                  className="flex-1 rounded-xl text-sm font-bold transition-all hover:opacity-80 cursor-pointer"
                  style={{
                    background: '#e8f5e8',
                    border: '1.5px solid #a8d8a8',
                    color: '#4a7a4a',
                    padding: '0.75rem',
                  }}
                >
                  voltar
                </button>
                <button
                  onClick={handleJoin}
                  disabled={loading || code.length < 6}
                  className="flex-2 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 cursor-pointer"
                  style={{
                    flex: 2,
                    background: 'linear-gradient(180deg, #d4956a 0%, #b8744e 100%)',
                    border: '2px solid #8b5a2a',
                    color: '#5a2e0e',
                    padding: '0.75rem',
                  }}
                >
                  {loading ? 'entrando...' : 'entrar'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
