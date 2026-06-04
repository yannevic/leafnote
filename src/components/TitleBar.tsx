import { useState, useEffect } from 'react'
import { RefreshCw, Download, ArrowDownToLine, Loader } from 'lucide-react'
import BoardSwitcher from './BoardSwitcher'
import type { BoardMeta } from '../lib/boards'
import NotificationCenter from './NotificationCenter'
import type { AppNotification } from '../hooks/useNotificationCenter'
import { PiMoneyWavyLight } from 'react-icons/pi'
const icon = new URL('../../resources/icon.png', import.meta.url).href

import { AlertTriangle } from 'lucide-react'
import type { UpdateStatus } from './UpdateNotifier'

interface TitleBarProps {
  extraBoards: BoardMeta[]
  activeBoardId: string
  onSwitchBoard: (id: string) => void
  onAddBoard: (name: string) => void
  onRemoveBoard: (id: string) => void
  updateStatus?: UpdateStatus
  updateProgress?: number
  onInstallUpdate?: () => void
  onCheckUpdate?: () => void
  notifications?: AppNotification[]
  onDismissNotification?: (id: string) => void
  coins?: number
  panicMode?: boolean
  onTogglePanic?: () => void
}

export default function TitleBar({
  extraBoards,
  activeBoardId,
  onSwitchBoard,
  onAddBoard,
  onRemoveBoard,
  updateStatus = 'idle',
  updateProgress = 0,
  onInstallUpdate,
  onCheckUpdate,
  notifications = [],
  onDismissNotification,
  coins = 0,
  panicMode = false,
  onTogglePanic,
}: TitleBarProps) {
  const [isMaximized, setIsMaximized] = useState(false)
  const [version, setVersion] = useState('')
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    window.api.getVersion().then(setVersion)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const weekDay = now.toLocaleDateString('pt-BR', { weekday: 'short' })
  const dateStr = now.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  })
  const timeStr = now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  return (
    <div
      style={
        {
          height: 38,
          background: 'linear-gradient(90deg, #2d1a0e 0%, #5a3010 45%, #3d2408 100%)',
          borderBottom: '1.5px solid #8b5a2a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingLeft: '0.75rem',
          paddingRight: '0.5rem',
          WebkitAppRegion: 'drag',
          userSelect: 'none',
          flexShrink: 0,
          zIndex: 9999,
          position: 'relative',
        } as React.CSSProperties
      }
    >
      {/* Esquerda — logo + switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 110 }}>
        <img
          src={icon}
          alt="leafnote"
          style={{ width: 20, height: 20, objectFit: 'contain', borderRadius: 4 }}
        />
        <span
          style={{
            fontFamily: 'Baloo 2, sans-serif',
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: '0.04em',
          }}
        >
          <span style={{ color: '#7FB87F' }}>leaf</span>
          <span style={{ color: '#c4956a' }}>note</span>
        </span>
        {version && (
          <span
            style={{
              fontSize: 8.5,
              color: '#c4956a',
              fontFamily: 'Baloo 2, sans-serif',
              opacity: 0.6,
            }}
          >
            v{version}
          </span>
        )}

        {/* Separador */}
        <span style={{ color: 'rgba(196,149,106,0.3)', fontSize: 12, marginLeft: 2 }}>|</span>

        {/* Board switcher */}
        <BoardSwitcher
          extraBoards={extraBoards}
          activeBoardId={activeBoardId}
          onSwitch={onSwitchBoard}
          onAdd={onAddBoard}
          onRemove={onRemoveBoard}
        />
      </div>

      {/* Centro — data e hora */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          fontFamily: 'Baloo 2, sans-serif',
          pointerEvents: 'none',
        }}
      >
        <span
          style={{
            fontSize: 9.5,
            color: '#c4956a',
            opacity: 0.8,
            textTransform: 'capitalize',
          }}
        >
          {weekDay}
        </span>
        <span style={{ fontSize: 9, color: '#c4956a', opacity: 0.4 }}>·</span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: '#f5ecd7',
            letterSpacing: '0.04em',
          }}
        >
          {timeStr}
        </span>
        <span style={{ fontSize: 9, color: '#c4956a', opacity: 0.4 }}>·</span>
        <span style={{ fontSize: 9.5, color: '#c4956a', opacity: 0.8 }}>{dateStr}</span>
      </div>

      {/* Direita — updater + botões macOS */}
      <div
        style={
          {
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            WebkitAppRegion: 'no-drag',
          } as React.CSSProperties
        }
      >
        {onTogglePanic && (
          <button
            onClick={onTogglePanic}
            title={panicMode ? 'modo pânico ativo — clique para desativar' : 'modo pânico'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              height: 22,
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'Baloo 2, sans-serif',
              fontSize: 10,
              fontWeight: 700,
              padding: '0 8px',
              background: panicMode ? 'rgba(232,96,122,0.22)' : 'rgba(196,149,106,0.12)',
              color: panicMode ? '#e8607a' : 'rgba(196,149,106,0.55)',
              transition: 'all 0.15s',
              marginRight: 2,
            }}
          >
            <AlertTriangle size={11} strokeWidth={2} />
            {panicMode ? 'pânico on' : 'pânico'}
          </button>
        )}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            marginRight: 4,
            fontFamily: 'Baloo 2, sans-serif',
            fontSize: 11,
            fontWeight: 700,
            color: '#c4956a',
          }}
        >
          <PiMoneyWavyLight size={22} />
          <span style={{ fontSize: 15, fontWeight: 800, marginTop: 4 }}>{coins}</span>
        </div>
        <NotificationCenter
          notifications={notifications}
          onDismiss={onDismissNotification ?? (() => {})}
        />

        <UpdateBtn
          status={updateStatus}
          progress={updateProgress}
          onInstall={onInstallUpdate}
          onCheck={onCheckUpdate}
        />
        <WinBtn
          color="#e8a030"
          hoverColor="#f5b840"
          onClick={() => window.api.winMinimize()}
          title="minimizar"
        />
        <WinBtn
          color="#7FB87F"
          hoverColor="#9fd49f"
          onClick={() => {
            window.api.winMaximize()
            setIsMaximized((v) => !v)
          }}
          title={isMaximized ? 'restaurar' : 'maximizar'}
        />
        <WinBtn
          color="#e8607a"
          hoverColor="#f07090"
          onClick={() => window.api.winClose()}
          title="fechar"
        />
      </div>
    </div>
  )
}

function UpdateBtn({
  status,
  progress,
  onInstall,
  onCheck,
}: {
  status: UpdateStatus
  progress: number
  onInstall?: () => void
  onCheck?: () => void
}) {
  const [hovered, setHovered] = useState(false)

  const base: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    height: 22,
    borderRadius: 6,
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'Baloo 2, sans-serif',
    fontSize: 10,
    fontWeight: 700,
    transition: 'all 0.15s',
    padding: '0 8px',
    marginRight: 2,
  }

  if (status === 'downloading') {
    return (
      <div
        title={`Baixando atualização... ${progress}%`}
        style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 6 }}
      >
        <Download size={11} color="#7FB87F" />
        <div
          style={{
            width: 52,
            height: 3,
            borderRadius: 2,
            background: 'rgba(255,255,255,0.12)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              borderRadius: 2,
              background: '#7FB87F',
              transition: 'width 0.4s',
            }}
          />
        </div>
        <span style={{ fontSize: 9.5, color: '#7FB87F', minWidth: 24 }}>{progress}%</span>
      </div>
    )
  }

  if (status === 'available') {
    return (
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 5, marginRight: 6 }}
        title="Atualização disponível — baixando em breve"
      >
        <Download size={11} color="#c4956a" />
        <span
          style={{
            fontSize: 9.5,
            color: '#c4956a',
            fontFamily: 'Baloo 2, sans-serif',
            fontWeight: 700,
          }}
        >
          atualização disponível
        </span>
      </div>
    )
  }

  if (status === 'downloaded') {
    return (
      <button
        onClick={onInstall}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        title="Clique para instalar a atualização"
        style={{
          ...base,
          color: '#1A2A1A',
          background: hovered ? '#9fd49f' : '#7FB87F',
          boxShadow: hovered ? '0 0 8px #7FB87F88' : '0 1px 4px #7FB87F44',
        }}
      >
        <ArrowDownToLine size={11} />
        atualização pronta — instalar
      </button>
    )
  }

  if (status === 'checking') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginRight: 6, opacity: 0.6 }}>
        <Loader size={11} color="#c4956a" style={{ animation: 'spin 1s linear infinite' }} />
        <span style={{ fontSize: 9.5, color: '#c4956a', fontFamily: 'Baloo 2, sans-serif' }}>
          verificando...
        </span>
      </div>
    )
  }

  return (
    <button
      onClick={onCheck}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title="Verificar atualizações"
      style={{
        ...base,
        color: hovered ? '#c4956a' : 'rgba(196,149,106,0.45)',
        background: hovered ? 'rgba(196,149,106,0.12)' : 'transparent',
      }}
    >
      <RefreshCw size={11} />
      buscar atualizações
    </button>
  )
}

function WinBtn({
  color,
  hoverColor,
  onClick,
  title,
}: {
  color: string
  hoverColor: string
  onClick: () => void
  title: string
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 13,
        height: 13,
        borderRadius: '50%',
        border: 'none',
        background: hovered ? hoverColor : color,
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'background 0.15s, transform 0.1s',
        transform: hovered ? 'scale(1.2)' : 'scale(1)',
        boxShadow: `0 1px 4px ${color}88`,
        padding: 0,
      }}
    />
  )
}
