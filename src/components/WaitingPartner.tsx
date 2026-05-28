import { useState } from 'react'
import { Copy, Check, Clock } from 'lucide-react'
import TitleBar from './TitleBar'

export default function WaitingPartner({ inviteCode }: { inviteCode: string }) {
  const [copied, setCopied] = useState(false)

  function copyCode() {
    navigator.clipboard.writeText(inviteCode).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
          className="flex flex-col items-center gap-6 rounded-2xl"
          style={{
            background: '#f2faf2',
            border: '1px solid #d8eed8',
            boxShadow: '0 2px 16px #4a7a4a0a',
            padding: '2.5rem 2rem',
            width: 340,
            fontFamily: 'Baloo 2, sans-serif',
            textAlign: 'center',
          }}
        >
          <Clock size={36} color="#7fb87f" strokeWidth={1.5} />

          <div className="flex flex-col gap-1">
            <p className="font-bold text-base" style={{ color: '#2d4a2d' }}>
              aguardando seu par
            </p>
            <p className="text-sm" style={{ color: '#4a7a4a', opacity: 0.8 }}>
              manda esse código pra pessoa que vai entrar no mural com você
            </p>
          </div>

          {/* Código */}
          <div className="flex flex-col items-center gap-2 w-full">
            <div
              className="font-bold tracking-widest text-2xl rounded-xl w-full text-center"
              style={{
                background: '#eaf5ea',
                border: '1.5px solid #a8d8a8',
                color: '#2d4a2d',
                padding: '0.85rem 1rem',
                letterSpacing: '0.25em',
              }}
            >
              {inviteCode}
            </div>
            <button
              onClick={copyCode}
              className="flex items-center gap-2 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-95 cursor-pointer w-full justify-center"
              style={{
                background: copied
                  ? 'linear-gradient(180deg, #a8d8a8 0%, #7fb87f 100%)'
                  : 'linear-gradient(180deg, #d4956a 0%, #b8744e 100%)',
                border: `2px solid ${copied ? '#4a7a4a' : '#8b5a2a'}`,
                color: copied ? '#1a2a1a' : '#5a2e0e',
                padding: '0.65rem 1rem',
                transition: 'all 0.2s',
              }}
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
              {copied ? 'copiado!' : 'copiar código'}
            </button>
          </div>

          <p className="text-xs" style={{ color: '#7fb87f', opacity: 0.7 }}>
            o mural abre automaticamente quando seu par entrar
          </p>
        </div>
      </div>
    </div>
  )
}
