import { useState } from 'react'
import { Bell, Mail, Sprout, X } from 'lucide-react'
import type { AppNotification } from '../hooks/useNotificationCenter'

interface Props {
  notifications: AppNotification[]
}

export default function NotificationCenter({ notifications }: Props) {
  const [open, setOpen] = useState(false)
  const count = notifications.length

  return (
    <div style={{ position: 'relative' }}>
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

      {open && (
        <div
          style={{
            position: 'fixed',
            top: 44,
            right: 60,
            zIndex: 9999,
            background: 'linear-gradient(160deg, #fdf6f0 0%, #f5ecd7 100%)',
            border: '1.5px solid #d4aa80',
            borderRadius: 14,
            boxShadow: '0 8px 32px rgba(44,20,8,0.25)',
            fontFamily: 'Baloo 2, sans-serif',
            minWidth: 260,
            maxWidth: 320,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderBottom: '1px solid #d4aa8044',
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 800, color: '#3d2408' }}>notificações</span>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#8b6914',
                padding: 2,
              }}
            >
              <X size={13} />
            </button>
          </div>

          <div style={{ maxHeight: 320, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div
                style={{
                  padding: '20px 14px',
                  fontSize: 12,
                  color: '#8b6914',
                  opacity: 0.6,
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
                    alignItems: 'flex-start',
                    gap: 10,
                    padding: '10px 14px',
                    borderBottom: '1px solid #d4aa8022',
                  }}
                >
                  <div style={{ marginTop: 1, flexShrink: 0 }}>
                    {n.type === 'garden-water' ? (
                      <Sprout size={14} color="#7FB87F" />
                    ) : (
                      <Mail size={14} color="#E8A0B0" />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#3d2408' }}>
                      {n.message}
                    </div>
                    {n.boardName && (
                      <div style={{ fontSize: 10, color: '#8b6914', opacity: 0.8, marginTop: 2 }}>
                        {n.boardName}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
