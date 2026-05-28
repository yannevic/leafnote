import { useEffect, useState } from 'react'
import { Spade, Layers, CircleCheck, Circle, Swords } from 'lucide-react'
import {
  subscribeLobby,
  setLobbyMode,
  setReady,
  setLobbyState,
  resetLobby,
  type GameMode,
  type GameLobby,
} from '../../lib/games'

interface Props {
  coupleId: string
  uid: string
  partnerUid: string
  myName: string
  partnerName: string
  roomId: string
  onStartGame: (mode: GameMode) => void
}

export default function GameLobbyTab({
  coupleId,
  uid,
  partnerUid,
  myName,
  partnerName,
  roomId,
  onStartGame,
}: Props) {
  const [lobby, setLobby] = useState<GameLobby | null>(null)

  useEffect(() => {
    const unsub = subscribeLobby(coupleId, roomId, setLobby)
    return unsub
  }, [coupleId, roomId])
  const mode = lobby?.mode ?? null
  const myReady = lobby?.ready?.[uid] ?? false
  const partnerReady = lobby?.ready?.[partnerUid] ?? false
  const bothReady = myReady && partnerReady

  // quando os dois ficam prontos, inicia
  useEffect(() => {
    if (bothReady && mode && lobby?.state === 'waiting') {
      setLobbyState(coupleId, roomId, 'starting').then(() => {
        onStartGame(mode)
      })
    }
  }, [bothReady, mode, lobby?.state])

  function handleSelectMode(m: GameMode) {
    resetLobby(coupleId, roomId).then(() => {
      setLobbyMode(coupleId, roomId, m)
      setLobbyState(coupleId, roomId, 'waiting')
    })
  }

  function handleToggleReady() {
    setReady(coupleId, roomId, uid, !myReady)
  }

  function handleCancel() {
    resetLobby(coupleId, roomId)
  }

  const MODES: { id: GameMode; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      id: 'blackjack',
      label: '21',
      desc: 'contra o dealer juntos',
      icon: <Spade size={20} strokeWidth={1.8} />,
    },
    {
      id: 'uno',
      label: 'UNO',
      desc: 'um contra o outro',
      icon: <Layers size={20} strokeWidth={1.8} />,
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* seletor de modo */}
      <div style={{ display: 'flex', gap: 8 }}>
        {MODES.map((m) => {
          const selected = mode === m.id
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => handleSelectMode(m.id)}
              style={{
                flex: 1,
                padding: '12px 8px',
                borderRadius: 12,
                border: selected
                  ? '2px solid rgba(232,160,176,0.8)'
                  : '1.5px solid rgba(232,160,176,0.25)',
                background: selected ? 'rgba(232,160,176,0.22)' : 'rgba(232,160,176,0.07)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 5,
                transition: 'all 0.15s',
                fontFamily: 'Baloo 2, sans-serif',
                color: '#3d1a10',
              }}
            >
              {m.icon}
              <span style={{ fontSize: 14, fontWeight: 800 }}>{m.label}</span>
              <span style={{ fontSize: 10, color: 'rgba(61,26,16,0.55)', fontWeight: 600 }}>
                {m.desc}
              </span>
            </button>
          )
        })}
      </div>

      {/* status dos jogadores */}
      {mode && (
        <>
          <div
            style={{
              background: 'rgba(232,160,176,0.1)',
              borderRadius: 12,
              padding: '10px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {[
              { uid, name: myName, ready: myReady, isMe: true },
              { uid: partnerUid, name: partnerName, ready: partnerReady, isMe: false },
            ].map((p) => (
              <div key={p.uid} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {p.ready ? (
                  <CircleCheck size={16} color="#4A7A4A" strokeWidth={2} />
                ) : (
                  <Circle size={16} color="rgba(61,26,16,0.3)" strokeWidth={2} />
                )}
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#3d1a10',
                    flex: 1,
                  }}
                >
                  {p.name} {p.isMe && '(você)'}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: p.ready ? '#4A7A4A' : 'rgba(61,26,16,0.4)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {p.ready ? 'pronto' : 'esperando...'}
                </span>
              </div>
            ))}
          </div>

          {/* botão pronto */}
          <button
            type="button"
            onClick={handleToggleReady}
            style={{
              padding: '10px 0',
              borderRadius: 12,
              cursor: 'pointer',
              fontSize: 13,
              fontFamily: 'Baloo 2, sans-serif',
              fontWeight: 800,
              background: myReady
                ? 'rgba(74,122,74,0.18)'
                : 'linear-gradient(135deg, rgba(232,160,176,0.6), rgba(200,120,150,0.5))',
              color: myReady ? '#4A7A4A' : '#3d1a10',
              border: myReady ? '1.5px solid rgba(74,122,74,0.4)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 7,
              transition: 'all 0.15s',
            }}
          >
            {myReady ? (
              <>
                <CircleCheck size={15} strokeWidth={2} /> pronto — aguardando parceiro
              </>
            ) : (
              <>
                <Swords size={15} strokeWidth={1.8} /> estou pronto
              </>
            )}
          </button>

          {/* cancelar */}
          <button
            type="button"
            onClick={handleCancel}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 11,
              fontFamily: 'Baloo 2, sans-serif',
              fontWeight: 700,
              color: 'rgba(61,26,16,0.4)',
              textAlign: 'center',
              padding: '4px 0',
            }}
          >
            cancelar
          </button>
        </>
      )}

      {!mode && (
        <p
          style={{
            textAlign: 'center',
            fontSize: 12,
            color: 'rgba(61,26,16,0.4)',
            fontFamily: 'Baloo 2, sans-serif',
            fontWeight: 600,
            margin: 0,
          }}
        >
          escolha um jogo para começar
        </p>
      )}
    </div>
  )
}
