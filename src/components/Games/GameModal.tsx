import { X } from 'lucide-react'
import { resetLobby, type GameMode } from '../../lib/games'
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
  uid: _uid,
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
        background:
          'linear-gradient(160deg, rgba(253,246,240,0.99) 0%, rgba(252,232,238,0.99) 100%)',
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

      {/* conteúdo */}
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
  )
}
