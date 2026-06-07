import { useState } from 'react'
import { X } from 'lucide-react'
import { STICKER_PACKS } from '../assets/stickers/index'
import type { CustomLetterData } from '../types/board'

interface Props {
  letter: CustomLetterData
  onClose: () => void
}

export default function CustomLetterViewer({ letter, onClose }: Props) {
  const [phase, setPhase] = useState<'envelope' | 'opening' | 'letter'>('envelope')
  const [showBlocked, setShowBlocked] = useState(false)

  const canOpen = (() => {
    if (!letter.availableFrom) return true
    const today = new Date().toISOString().split('T')[0]
    return today >= letter.availableFrom
  })()

  const handleEnvelopeClick = () => {
    if (!canOpen) {
      setShowBlocked(true)
      setTimeout(() => setShowBlocked(false), 3000)
      return
    }
    setPhase('opening')
    setTimeout(() => setPhase('letter'), 700)
  }

  const today = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  const lineHeight = Math.round((letter.fontSize ?? 14) * 1.9)
  const ENV_W = 200
  const ENV_H = 130

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: 'rgba(26,20,8,0.7)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Baloo 2, sans-serif',
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) e.currentTarget.dataset.closeOnUp = 'true'
      }}
      onMouseUp={(e) => {
        if (e.currentTarget.dataset.closeOnUp === 'true' && e.target === e.currentTarget) onClose()
        delete e.currentTarget.dataset.closeOnUp
      }}
    >
      <style>{`
        @keyframes envelopePop {
          from { transform: scale(0.7) translateY(40px); opacity: 0; }
          to   { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes flapOpen {
          from { transform: rotateX(0deg); }
          to   { transform: rotateX(-160deg); }
        }
        @keyframes letterRise {
          from { transform: translateY(60px) scale(0.9); opacity: 0; }
          to   { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes starPulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.3); }
        }
        .custom-letter-viewer-scroll::-webkit-scrollbar { width: 4px; }
        .custom-letter-viewer-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-letter-viewer-scroll::-webkit-scrollbar-thumb { background: rgba(232,160,176,0.45); border-radius: 99px; }
      `}</style>

      {/* ── fase envelope ── */}
      {(phase === 'envelope' || phase === 'opening') && (
        <div
          onClick={handleEnvelopeClick}
          style={{
            cursor: canOpen ? 'pointer' : 'default',
            animation: 'envelopePop 0.45s cubic-bezier(.34,1.56,.64,1)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <svg
            viewBox={`0 0 ${ENV_W} ${ENV_H + 40}`}
            xmlns="http://www.w3.org/2000/svg"
            style={{
              display: 'block',
              width: ENV_W,
              height: ENV_H + 40,
              overflow: 'visible',
              filter:
                phase === 'opening'
                  ? 'drop-shadow(0 0 18px #f5d06099)'
                  : 'drop-shadow(0 4px 16px #b8860b55)',
              transition: 'filter 0.3s',
            }}
          >
            <defs>
              <linearGradient id="cvGoldBody" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fffbe8" />
                <stop offset="50%" stopColor="#fdf3c0" />
                <stop offset="100%" stopColor="#f5e8a0" />
              </linearGradient>
              <linearGradient id="cvGoldFlap" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffe680" />
                <stop offset="100%" stopColor="#c8960c" />
              </linearGradient>
              <linearGradient id="cvGoldStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f5d060" />
                <stop offset="50%" stopColor="#b8860b" />
                <stop offset="100%" stopColor="#f5d060" />
              </linearGradient>
              <linearGradient id="cvSealGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffe680" />
                <stop offset="40%" stopColor="#f5c800" />
                <stop offset="100%" stopColor="#b8860b" />
              </linearGradient>
            </defs>

            {/* sombra */}
            <rect
              x="6"
              y="10"
              width={ENV_W - 4}
              height={ENV_H - 2}
              rx="10"
              fill="rgba(44,20,8,0.18)"
            />

            {/* corpo */}
            <rect
              x="2"
              y="4"
              width={ENV_W - 4}
              height={ENV_H - 4}
              rx="10"
              fill="url(#cvGoldBody)"
              stroke="url(#cvGoldStroke)"
              strokeWidth="2"
            />

            {/* borda interna */}
            <rect
              x="8"
              y="10"
              width={ENV_W - 16}
              height={ENV_H - 18}
              rx="7"
              fill="none"
              stroke="#f5d060"
              strokeWidth="0.7"
              opacity="0.5"
            />

            {/* vincos */}
            <line
              x1="2"
              y1="4"
              x2={ENV_W / 2}
              y2={ENV_H * 0.5}
              stroke="#f5d060"
              strokeWidth="1.2"
              opacity="0.6"
            />
            <line
              x1={ENV_W - 2}
              y1="4"
              x2={ENV_W / 2}
              y2={ENV_H * 0.5}
              stroke="#f5d060"
              strokeWidth="1.2"
              opacity="0.6"
            />
            <line
              x1="2"
              y1={ENV_H - 4}
              x2={ENV_W / 2}
              y2={ENV_H * 0.5}
              stroke="#f5d060"
              strokeWidth="1.2"
              opacity="0.6"
            />
            <line
              x1={ENV_W - 2}
              y1={ENV_H - 4}
              x2={ENV_W / 2}
              y2={ENV_H * 0.5}
              stroke="#f5d060"
              strokeWidth="1.2"
              opacity="0.6"
            />

            {/* aba */}
            <path
              d={`M2 4 L${ENV_W / 2} ${phase === 'opening' ? ENV_H * 0.1 : ENV_H * 0.44} L${ENV_W - 2} 4`}
              fill="url(#cvGoldFlap)"
              stroke="url(#cvGoldStroke)"
              strokeWidth="1.8"
              strokeLinejoin="round"
              style={{ transition: 'd 0.55s ease' }}
            />

            {/* lacre */}
            {phase === 'envelope' && (
              <g transform={`translate(${ENV_W / 2}, ${ENV_H * 0.54})`}>
                <circle r="13" fill="url(#cvSealGold)" stroke="#c8a020" strokeWidth="1.5" />
                <circle r="10" fill="none" stroke="#ffe680" strokeWidth="1" opacity="0.6" />
                <path
                  d="M0,-8 L1.9,-2.8 L7.6,-2.4 L3.5,1.3 L4.7,7.2 L0,4 L-4.7,7.2 L-3.5,1.3 L-7.6,-2.4 L-1.9,-2.8Z"
                  fill="#fffbe8"
                />
              </g>
            )}

            {/* estrelinhas */}
            <text
              x="14"
              y="24"
              fontSize="10"
              fill="#f5d060"
              opacity="0.9"
              style={{ animation: 'starPulse 2s ease-in-out infinite' }}
            >
              ✦
            </text>
            <text
              x={ENV_W - 22}
              y="24"
              fontSize="10"
              fill="#f5d060"
              opacity="0.9"
              style={{ animation: 'starPulse 2s ease-in-out infinite 0.5s' }}
            >
              ✦
            </text>
            <text
              x="14"
              y={ENV_H - 10}
              fontSize="9"
              fill="#f5d060"
              opacity="0.8"
              style={{ animation: 'starPulse 2s ease-in-out infinite 1s' }}
            >
              ✦
            </text>
            <text
              x={ENV_W - 22}
              y={ENV_H - 10}
              fontSize="9"
              fill="#f5d060"
              opacity="0.8"
              style={{ animation: 'starPulse 2s ease-in-out infinite 1.5s' }}
            >
              ✦
            </text>

            {/* de / para */}
            {letter.specialDateLabel && (
              <text
                x="14"
                y={ENV_H * 0.66}
                fontSize="9"
                fill="#b8860b"
                fontFamily="Baloo 2, sans-serif"
                fontWeight="700"
                fontStyle="italic"
                opacity="0.9"
              >
                {letter.specialDateLabel}
              </text>
            )}
            <text
              x="14"
              y={ENV_H * 0.66 + 14}
              fontSize="11"
              fill="#7a5a00"
              fontFamily="Baloo 2, sans-serif"
              fontWeight="700"
              opacity="0.9"
            >
              {`De: ${letter.fromName}`}
            </text>
            <text
              x="14"
              y={ENV_H * 0.66 + 27}
              fontSize="11"
              fill="#7a5a00"
              fontFamily="Baloo 2, sans-serif"
              fontWeight="700"
              opacity="0.9"
            >
              {`Para: ${letter.toName}`}
            </text>
          </svg>

          {/* hint */}
          {canOpen && phase === 'envelope' && (
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#f5d060',
                opacity: 0.85,
                textShadow: '0 1px 4px rgba(0,0,0,0.5)',
              }}
            >
              clique para abrir
            </div>
          )}

          {/* bloqueado */}
          {showBlocked && (
            <div
              style={{
                position: 'absolute',
                top: -44,
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#3a1a08',
                color: '#f5d060',
                fontFamily: 'Baloo 2, sans-serif',
                fontSize: 12,
                fontWeight: 700,
                padding: '7px 14px',
                borderRadius: 10,
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
              }}
            >
              {`abre em ${letter.availableFrom!.split('-').reverse().join('/')}`}
            </div>
          )}
        </div>
      )}

      {/* ── fase carta ── */}
      {phase === 'letter' && (
        <div
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            animation: 'letterRise 0.45s cubic-bezier(.34,1.4,.64,1)',
            position: 'relative',
            width: 480,
            maxWidth: '92vw',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            isolation: 'isolate',
          }}
        >
          {/* botão fechar */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: -14,
              right: -14,
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ffe680, #c8960c)',
              border: '2px solid #b8860b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
              zIndex: 10,
            }}
          >
            <X size={13} color="#5a3a00" strokeWidth={2.5} />
          </button>

          {/* carta */}
          <div
            className="custom-letter-viewer-scroll"
            style={{
              position: 'relative',
              background: letter.paperColor ?? '#fdf6f0',
              borderRadius: 14,
              border: '1.5px solid rgba(0,0,0,0.08)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.4), 0 0 0 2px #f5d06055',
              padding: '28px 32px 36px',
              overflowY: 'auto',
              overflowX: 'hidden',
              maxHeight: '85vh',
            }}
          >
            {/* linhas */}
            {letter.lined && (
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                {Array.from({ length: Math.ceil(800 / lineHeight) }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      left: 24,
                      right: 24,
                      top: 28 + i * lineHeight + (letter.fontSize ?? 14) * 1.2,
                      height: 1,
                      background: 'rgba(0,0,0,0.06)',
                    }}
                  />
                ))}
              </div>
            )}

            {/* data */}
            {letter.showDate && (
              <div
                style={{
                  fontSize: 11,
                  color: 'rgba(0,0,0,0.3)',
                  fontFamily: "'Baloo 2', sans-serif",
                  textAlign: 'right',
                  marginBottom: 12,
                }}
              >
                {today}
              </div>
            )}

            {/* data especial */}
            {letter.specialDateLabel && (
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'rgba(200,112,144,0.7)',
                  fontFamily: "'Baloo 2', sans-serif",
                  marginBottom: 16,
                  fontStyle: 'italic',
                }}
              >
                {letter.specialDateLabel}
              </div>
            )}

            {/* conteúdo */}
            <div
              style={{
                fontFamily: letter.fontFamily ?? "'Baloo 2', sans-serif",
                fontSize: letter.fontSize ?? 14,
                color: letter.textColor ?? '#2a1010',
                textAlign: letter.textAlign ?? 'left',
                lineHeight: `${lineHeight}px`,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                position: 'relative',
                zIndex: 1,
                minHeight: 120,
              }}
            >
              {letter.content}
            </div>

            {/* assinatura */}
            {letter.signature && (
              <div
                style={{
                  marginTop: 20,
                  textAlign: 'right',
                  fontFamily: letter.fontFamily ?? "'Baloo 2', sans-serif",
                  fontSize: (letter.fontSize ?? 14) - 1,
                  color: letter.textColor ?? '#2a1010',
                  fontStyle: 'italic',
                  opacity: 0.65,
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                — {letter.signature}
              </div>
            )}
          </div>

          {/* fotos — fora do scroll, position absolute relativo ao wrapper */}
          {letter.photos &&
            Object.values(letter.photos).map((photo) => (
              <div
                key={photo.id}
                style={{
                  position: 'absolute',
                  left: photo.x,
                  top: photo.y,
                  width: photo.width,
                  height: photo.height,
                  zIndex: 2,
                  transform: `rotate(${photo.rotation ?? 0}deg)`,
                  transformOrigin: 'center center',
                  pointerEvents: 'none',
                }}
              >
                <img
                  src={photo.url}
                  alt=""
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: 8,
                    border: '2px solid rgba(255,255,255,0.8)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    display: 'block',
                  }}
                  draggable={false}
                  onError={(e) => {
                    ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                  }}
                />
              </div>
            ))}

          {/* stickers — fora do fluxo de scroll, position absolute relativo ao wrapper da carta */}
          {letter.stickers &&
            Object.values(letter.stickers).map((sticker) => {
              const pack = STICKER_PACKS.find((p) =>
                p.stickers.some((s) => s.key === sticker.stickerKey)
              )
              const stickerItem = pack?.stickers.find((s) => s.key === sticker.stickerKey)
              if (!stickerItem) return null
              return (
                <div
                  key={sticker.id}
                  style={{
                    position: 'absolute',
                    left: sticker.x,
                    top: sticker.y,
                    width: sticker.width,
                    height: sticker.height,
                    zIndex: 3,
                    transform: `rotate(${sticker.rotation ?? 0}deg)`,
                    pointerEvents: 'none',
                  }}
                >
                  <img
                    src={`./stickers/${stickerItem.file}`}
                    alt={sticker.stickerKey}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    draggable={false}
                  />
                </div>
              )
            })}
        </div>
      )}
    </div>
  )
}
