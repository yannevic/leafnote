import { X } from 'lucide-react'
import { resetLobby } from '../../lib/games'
import type { GameMode } from '../../lib/games'
import { BlackjackModal } from './BlackjackModal'
import { UnoModal } from './UnoModal'

interface Props {
  mode: GameMode
  uid: string
  partnerUid: string
  myNick: string
  partnerNick: string
  myCoins: number
  roomId: string
  onClose: () => void
}

export default function GameModal({
  mode,
  partnerUid,
  myNick,
  partnerNick,
  myCoins,
  roomId,
  onClose,
}: Props) {
  function handleClose() {
    resetLobby(roomId)
    onClose()
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(44,20,8,0.55)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 680,
          maxHeight: '92vh',
          margin: '0 16px',
          background:
            'linear-gradient(160deg, rgba(253,246,240,0.98) 0%, rgba(252,232,238,0.98) 100%)',
          border: '1.5px solid rgba(232,160,176,0.4)',
          borderRadius: 20,
          boxShadow: '0 8px 48px rgba(200,120,140,0.25), inset 0 1px 0 rgba(255,255,255,0.6)',
          backdropFilter: 'blur(18px) saturate(1.4)',
          fontFamily: 'Baloo 2, sans-serif',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        data-modal="true"
      >
        {/* header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            borderBottom: '2px dashed rgba(232,160,176,0.4)',
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 800, color: '#3d1a10' }}>
            {mode === 'blackjack' ? '21' : 'UNO'}
          </span>
          <button
            type="button"
            onClick={handleClose}
            style={{
              background: 'rgba(200,120,140,0.15)',
              border: 'none',
              borderRadius: '50%',
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <X size={13} color="rgba(122,48,64,0.7)" strokeWidth={2.5} />
          </button>
        </div>

        {/* conteúdo do jogo */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {mode === 'blackjack' ? (
            <BlackjackModal
              myNick={myNick}
              partnerNick={partnerNick}
              myCoins={myCoins}
              partnerUid={partnerUid}
              roomId={roomId}
              onClose={handleClose}
            />
          ) : (
            <UnoModal
              myNick={myNick}
              partnerNick={partnerNick}
              partnerUid={partnerUid}
              roomId={roomId}
              onClose={handleClose}
            />
          )}
        </div>
      </div>
    </div>
  )
}
