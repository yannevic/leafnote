// src/components/BadgeHolderInventoryModal.tsx
import { Check, X } from 'lucide-react'
import { BADGE_HOLDER_MODELS } from '../lib/profileBadgeHolders'
import type { BadgeHolderInventory } from '../lib/profileBadgeHolders'

interface Props {
  owned: BadgeHolderInventory
  hasPlacement: boolean
  onPlace: (modelId: string) => void
  onClose: () => void
}

const SCROLLBAR_CSS = `
  .badge-inventory-scroll::-webkit-scrollbar { width: 5px; }
  .badge-inventory-scroll::-webkit-scrollbar-track { background: transparent; }
  .badge-inventory-scroll::-webkit-scrollbar-thumb { background: rgba(232,160,176,0.55); border-radius: 99px; }
  .badge-inventory-scroll::-webkit-scrollbar-thumb:hover { background: rgba(232,160,176,0.85); }
`

export default function BadgeHolderInventoryModal({
  owned,
  hasPlacement,
  onPlace,
  onClose,
}: Props) {
  const ownedModels = BADGE_HOLDER_MODELS.filter((m) => (owned[m.id] ?? 0) > 0)

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
      <style>{SCROLLBAR_CSS}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 300,
          height: 420,
          display: 'flex',
          flexDirection: 'column',
          background:
            'linear-gradient(160deg, rgba(253,246,240,0.98) 0%, rgba(252,232,238,0.98) 100%)',
          border: '1.5px solid rgba(232,160,176,0.4)',
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
            marginBottom: 10,
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 800, color: '#3d1a10' }}>meu inventário</span>
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

        <div
          className="badge-inventory-scroll"
          style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}
        >
          {ownedModels.length === 0 ? (
            <p
              style={{
                fontSize: 11,
                color: 'rgba(61,26,16,0.45)',
                textAlign: 'center',
                padding: '20px 8px',
              }}
            >
              você ainda não tem nenhuma moldura de badge — compre uma na lojinha em "decorar".
            </p>
          ) : (
            <>
              {hasPlacement && (
                <p style={{ fontSize: 11, color: 'rgba(61,26,16,0.5)', marginBottom: 10 }}>
                  por enquanto só dá pra ter uma moldura no perfil ao mesmo tempo — várias juntas
                  vem depois.
                </p>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                {ownedModels.map((model) => {
                  const qty = owned[model.id] ?? 0
                  return (
                    <div
                      key={model.id}
                      style={{
                        border: '1.5px solid rgba(232,160,176,0.35)',
                        borderRadius: 12,
                        padding: 10,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 6,
                        position: 'relative',
                      }}
                    >
                      {qty > 1 && (
                        <span
                          style={{
                            position: 'absolute',
                            top: 6,
                            right: 6,
                            fontSize: 9,
                            fontWeight: 800,
                            color: '#3d1a10',
                            background: 'rgba(232,160,176,0.3)',
                            borderRadius: 20,
                            padding: '1px 6px',
                          }}
                        >
                          ×{qty}
                        </span>
                      )}
                      <div
                        style={{
                          width: 56,
                          height: 32,
                          borderRadius: 999,
                          background: model.background,
                          border: '2px solid rgba(255,255,255,0.6)',
                        }}
                      />
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#3d1a10' }}>
                        {model.label}
                      </span>
                      <button
                        onClick={() => onPlace(model.id)}
                        disabled={hasPlacement}
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          padding: '3px 10px',
                          borderRadius: 20,
                          border: 'none',
                          background: hasPlacement
                            ? 'rgba(232,160,176,0.15)'
                            : 'rgba(232,160,176,0.5)',
                          color: hasPlacement ? 'rgba(61,26,16,0.4)' : '#3d1a10',
                          cursor: hasPlacement ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 3,
                        }}
                      >
                        <Check size={10} /> colocar
                      </button>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
