// src/components/DecorCategoryModal.tsx
import { X, Sticker, Medal, Palette } from 'lucide-react'

interface Props {
  onSelectStickers: () => void
  onSelectBadgeHolders: () => void
  onSelectBackground: () => void
  onClose: () => void
}

const T = {
  text: '#3d1a10',
  textSub: 'rgba(61,26,16,0.5)',
  border: 'rgba(232,160,176,0.4)',
  card: 'rgba(253,242,246,0.7)',
}

export default function DecorCategoryModal({
  onSelectStickers,
  onSelectBadgeHolders,
  onSelectBackground,
  onClose,
}: Props) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: 'rgba(61,26,16,0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 260,
          background:
            'linear-gradient(160deg, rgba(253,246,240,0.98) 0%, rgba(252,232,238,0.98) 100%)',
          border: `1.5px solid ${T.border}`,
          borderRadius: 18,
          padding: 16,
          fontFamily: 'Baloo 2, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 800, color: T.text }}>o que decorar?</span>
          <button
            onClick={onClose}
            style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(200,120,140,0.18)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={11} color="rgba(122,48,64,0.7)" />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onClick={onSelectStickers}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              borderRadius: 12,
              border: `1.5px solid ${T.border}`,
              background: T.card,
              cursor: 'pointer',
              fontFamily: 'Baloo 2, sans-serif',
              fontWeight: 700,
              fontSize: 13,
              color: T.text,
            }}
          >
            <Sticker size={16} strokeWidth={2.2} />
            stickers
          </button>
          <button
            onClick={onSelectBadgeHolders}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              borderRadius: 12,
              border: `1.5px solid ${T.border}`,
              background: T.card,
              cursor: 'pointer',
              fontFamily: 'Baloo 2, sans-serif',
              fontWeight: 700,
              fontSize: 13,
              color: T.text,
            }}
          >
            <Medal size={16} strokeWidth={2.2} />
            molduras de badge
          </button>
          <button
            onClick={onSelectBackground}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              borderRadius: 12,
              border: `1.5px solid ${T.border}`,
              background: T.card,
              cursor: 'pointer',
              fontFamily: 'Baloo 2, sans-serif',
              fontWeight: 700,
              fontSize: 13,
              color: T.text,
            }}
          >
            <Palette size={16} strokeWidth={2.2} />
            fundo do perfil
          </button>
        </div>

        <p
          style={{
            fontSize: 10,
            color: T.textSub,
            marginTop: 10,
            marginBottom: 0,
            lineHeight: 1.4,
          }}
        >
          mais categorias entram aqui conforme você for criando
        </p>
      </div>
    </div>
  )
}
