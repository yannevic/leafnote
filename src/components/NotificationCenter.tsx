import { useState } from 'react'
import { Bell, Mail, Sprout, X, CalendarHeart, Lock, Check, CheckCheck } from 'lucide-react'
import type { AppNotification } from '../hooks/useNotificationCenter'

interface Props {
  notifications: AppNotification[]
  onDismiss: (id: string) => void
}

export default function NotificationCenter({ notifications, onDismiss }: Props) {
  const [open, setOpen] = useState(false)
  const count = notifications.length

  function getIcon(n: AppNotification) {
    if (n.type === 'garden-water') return <Sprout size={14} color="#7FB87F" strokeWidth={2} />
    if (n.type === 'calendar-event')
      return <CalendarHeart size={14} color="#c87090" strokeWidth={2} />
    if (n.dismissible) return <Lock size={14} color="#E8A0B0" strokeWidth={2} />
    return <Mail size={14} color="#E8A0B0" strokeWidth={2} />
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Botão sino */}
      <button
        onClick={() => setOpen((v) => !v)}
        title="notificações"
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 26,
          height: 26,
          borderRadius: 8,
          border: 'none',
          background: open ? 'rgba(232,160,176,0.18)' : 'transparent',
          cursor: 'pointer',
          color: count > 0 ? '#E8A0B0' : 'rgba(232,160,176,0.4)',
          transition: 'all 0.15s',
          padding: 0,
        }}
      >
        <Bell size={14} />
        {count > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -3,
              right: -3,
              background: '#c87090',
              color: '#fff',
              fontSize: 8,
              fontWeight: 800,
              fontFamily: 'Baloo 2, sans-serif',
              borderRadius: '50%',
              width: 13,
              height: 13,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
            }}
          >
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {/* Painel */}
      {open && (
        <div
          style={{
            position: 'fixed',
            top: 44,
            right: 60,
            zIndex: 9999,
            background:
              'linear-gradient(160deg, rgba(253,246,240,0.97) 0%, rgba(252,232,238,0.97) 100%)',
            border: '1.5px solid rgba(232,160,176,0.4)',
            borderRadius: 20,
            boxShadow: '0 8px 40px rgba(200,120,140,0.2), inset 0 1px 0 rgba(255,255,255,0.6)',
            backdropFilter: 'blur(18px) saturate(1.4)',
            WebkitBackdropFilter: 'blur(18px) saturate(1.4)',
            fontFamily: 'Baloo 2, sans-serif',
            minWidth: 270,
            maxWidth: 320,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '11px 14px 10px',
              borderBottom: '2px dashed rgba(232,160,176,0.4)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <Bell size={13} color="rgba(122,48,64,0.6)" strokeWidth={2.5} />
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: 'rgba(122,48,64,0.55)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                }}
              >
                notificações
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'rgba(200,120,140,0.15)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={13} strokeWidth={2.5} color="rgba(122,48,64,0.7)" />
            </button>
          </div>

          {/* Lista */}
          <div
            className="notif-scroll"
            style={{ maxHeight: 320, overflowY: 'auto', padding: '4px 0' }}
          >
            <style>{`
              .notif-scroll::-webkit-scrollbar { width: 4px; }
              .notif-scroll::-webkit-scrollbar-track { background: transparent; }
              .notif-scroll::-webkit-scrollbar-thumb { background: rgba(232,160,176,0.55); border-radius: 99px; }
              .notif-scroll::-webkit-scrollbar-thumb:hover { background: rgba(232,160,176,0.99); }
            `}</style>

            {notifications.length === 0 ? (
              <div
                style={{
                  padding: '24px 14px',
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'rgba(61,26,16,0.4)',
                  textAlign: 'center',
                }}
              >
                nenhuma notificação
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '9px 14px',
                    borderBottom: '1px solid rgba(232,160,176,0.15)',
                    background:
                      n.type === 'calendar-event'
                        ? 'rgba(200,112,144,0.06)'
                        : n.dismissible
                          ? 'rgba(232,160,176,0.07)'
                          : 'transparent',
                  }}
                >
                  <div style={{ flexShrink: 0 }}>{getIcon(n)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#3d1a10' }}>
                      {n.message}
                    </div>
                    {n.boardName && (
                      <div style={{ fontSize: 10, color: 'rgba(61,26,16,0.4)', marginTop: 2 }}>
                        {n.boardName}
                      </div>
                    )}
                  </div>
                  {n.dismissible && (
                    <button
                      onClick={() => onDismiss(n.id)}
                      title="marcar como lida"
                      style={{
                        flexShrink: 0,
                        width: 26,
                        height: 26,
                        borderRadius: 8,
                        background: 'rgba(232,160,176,0.18)',
                        border: '1px solid rgba(232,160,176,0.35)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Check size={13} strokeWidth={2.5} color="rgba(122,48,64,0.6)" />
                    </button>
                  )}
                </div>
              ))
            )}
            {notifications.some((n) => n.dismissible) && (
              <div
                style={{
                  padding: '8px 14px',
                  borderTop: '2px dashed rgba(232,160,176,0.3)',
                  display: 'flex',
                  justifyContent: 'flex-end',
                }}
              >
                <button
                  onClick={() =>
                    notifications.filter((n) => n.dismissible).forEach((n) => onDismiss(n.id))
                  }
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: 10,
                    fontWeight: 800,
                    fontFamily: 'Baloo 2, sans-serif',
                    color: 'rgba(122,48,64,0.6)',
                    background: 'rgba(232,160,176,0.18)',
                    border: '1px solid rgba(232,160,176,0.35)',
                    borderRadius: 8,
                    padding: '4px 12px',
                    cursor: 'pointer',
                    letterSpacing: '0.3px',
                  }}
                >
                  <CheckCheck size={13} strokeWidth={2.5} color="rgba(122,48,64,0.6)" />
                  marcar todas como lidas
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
