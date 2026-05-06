import { useState } from 'react'

const SCALE = 1.0
const TW = 256 * SCALE
const TH = 128 * SCALE
const WW = 256 * SCALE
const WH = 384 * SCALE
const stepX = TW / 2
const stepY = TH / 2
const COLS = 4
const ROWS = 4

function tileStyle(
  sheet: string,
  col: number,
  row: number,
  tileW: number,
  tileH: number,
  sheetW: number,
  sheetH: number,
  displayW: number,
  displayH: number,
  mirror?: boolean
): React.CSSProperties {
  const scaleX = displayW / tileW
  const scaleY = displayH / tileH
  return {
    backgroundImage: `url("./house/${sheet.replace(/ /g, '%20')}")`,
    backgroundSize: `${sheetW * scaleX}px ${sheetH * scaleY}px`,
    backgroundPosition: `-${col * tileW * scaleX}px -${row * tileH * scaleY}px`,
    backgroundRepeat: 'no-repeat',
    width: displayW,
    height: displayH,
    imageRendering: 'pixelated' as const,
    transform: mirror ? 'scaleX(-1)' : undefined,
    transformOrigin: mirror ? 'center top' : undefined,
  }
}

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span>
        {label}: <strong style={{ color: '#f0c040' }}>{value}</strong>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: 180 }}
      />
      <input
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: 80,
          background: '#0f3460',
          color: '#fff',
          border: '1px solid #f0c040',
          borderRadius: 4,
          padding: '2px 6px',
        }}
      />
    </label>
  )
}

export default function HouseCalibrate() {
  const [showValues, setShowValues] = useState(false)

  // Parede esquerda (valores já calibrados)
  const [wallX, setWallX] = useState(-4)
  const [wallY, setWallY] = useState(250)
  const [wallC, setWallC] = useState(2)
  const [rotate, setRotate] = useState(0)

  // Parede direita
  const [wallRX, setWallRX] = useState(4)
  const [wallRY, setWallRY] = useState(250)
  const [wallRC, setWallRC] = useState(2)

  // Piso (valores já calibrados)
  const [floorX, setFloorX] = useState(380)
  const [floorY, setFloorY] = useState(-134)

  // Ambos juntos
  const [allY, setAllY] = useState(0)

  // Grid base
  const floorTiles = []
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      floorTiles.push({
        x: c * stepX - r * stepX,
        y: c * stepY + r * stepY,
        z: r * COLS + c,
      })
    }
  }
  const minX = Math.min(...floorTiles.map((t) => t.x))
  const ox = -minX
  const floorNorm = floorTiles.map((t) => ({
    ...t,
    x: Math.round(t.x + ox),
    y: Math.round(t.y),
  }))

  // Parede esquerda — col=0→3, row=0 fixo
  const wallLeftTiles = []
  for (let c = 0; c < COLS; c++) {
    const floor = floorNorm.find((t) => t.z === c)!
    wallLeftTiles.push({
      x: Math.round(floor.x + wallX),
      y: Math.round(floor.y - WH + TH + stepY - c * stepY * wallC + wallY),
      z: c,
    })
  }

  // Parede direita — col=COLS-1 fixo, row=0→3
  const wallRightTiles = []
  for (let r = 0; r < ROWS; r++) {
    const floor = floorNorm.find((t) => t.z === r * COLS + (COLS - 1))!
    wallRightTiles.push({
      x: Math.round(floor.x + TW + wallRX),
      y: Math.round(floor.y - WH + TH + stepY - r * stepY * wallRC + wallRY),
      z: r,
    })
  }

  const maxFloorY = Math.max(...floorNorm.map((t) => t.y)) + TH
  const minWallY = Math.min(...wallLeftTiles.map((t) => t.y), ...wallRightTiles.map((t) => t.y))
  const wallOffsetY = minWallY < 0 ? -minWallY : 0
  const sceneH = maxFloorY + wallOffsetY + WH + 200

  return (
    <div
      style={{
        background: '#1a1a2e',
        minHeight: '100vh',
        padding: 20,
        fontFamily: 'monospace',
        color: '#fff',
        overflowX: 'auto',
      }}
    >
      <h2 style={{ color: '#f0c040', marginBottom: 16 }}>🔧 Calibração — Parede + Piso</h2>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 20 }}>
        {/* Parede esquerda */}
        <div style={{ background: '#16213e', padding: 16, borderRadius: 12 }}>
          <div style={{ color: '#e06c75', fontWeight: 700, marginBottom: 12 }}>
            🧱 Parede esquerda
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
            <Slider label="X" value={wallX} min={-600} max={600} onChange={setWallX} />
            <Slider label="Y" value={wallY} min={-600} max={600} onChange={setWallY} />
            <Slider
              label="Inclinação"
              value={wallC}
              min={0}
              max={4}
              step={0.01}
              onChange={setWallC}
            />
            <Slider
              label="Rotação (deg)"
              value={rotate}
              min={-20}
              max={20}
              step={0.5}
              onChange={setRotate}
            />
          </div>
        </div>

        {/* Parede direita */}
        <div style={{ background: '#16213e', padding: 16, borderRadius: 12 }}>
          <div style={{ color: '#c678dd', fontWeight: 700, marginBottom: 12 }}>
            🧱 Parede direita
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
            <Slider label="X" value={wallRX} min={-600} max={600} onChange={setWallRX} />
            <Slider label="Y" value={wallRY} min={-600} max={600} onChange={setWallRY} />
            <Slider
              label="Inclinação"
              value={wallRC}
              min={0}
              max={4}
              step={0.01}
              onChange={setWallRC}
            />
          </div>
        </div>

        {/* Piso */}
        <div style={{ background: '#16213e', padding: 16, borderRadius: 12 }}>
          <div style={{ color: '#98c379', fontWeight: 700, marginBottom: 12 }}>🪵 Piso</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
            <Slider label="X" value={floorX} min={-600} max={900} onChange={setFloorX} />
            <Slider label="Y" value={floorY} min={-400} max={400} onChange={setFloorY} />
          </div>
        </div>

        {/* Ambos */}
        <div style={{ background: '#16213e', padding: 16, borderRadius: 12 }}>
          <div style={{ color: '#61afef', fontWeight: 700, marginBottom: 12 }}>↕ Tudo junto</div>
          <Slider label="Y geral" value={allY} min={-400} max={400} onChange={setAllY} />
        </div>
      </div>

      {/* Valores pra copiar — toggle */}
      <button
        onClick={() => setShowValues((v) => !v)}
        style={{
          marginBottom: 8,
          padding: '6px 16px',
          background: '#0f3460',
          color: '#7ec8e3',
          border: '1px solid #7ec8e3',
          borderRadius: 8,
          cursor: 'pointer',
          fontFamily: 'monospace',
          fontSize: 13,
        }}
      >
        {showValues ? '▲ Esconder valores' : '▼ Mostrar valores'}
      </button>

      {showValues && (
        <div
          style={{
            background: '#0f3460',
            borderRadius: 8,
            padding: 12,
            marginBottom: 20,
            fontSize: 13,
            color: '#7ec8e3',
            lineHeight: 2,
          }}
        >
          <div style={{ color: '#e06c75', fontWeight: 700 }}>// PAREDE ESQUERDA</div>
          <div>
            x: Math.round(floor.x + <strong style={{ color: '#f0c040' }}>{wallX}</strong>),
          </div>
          <div>
            y: Math.round(floor.y - WH + TH + stepY - c * stepY *{' '}
            <strong style={{ color: '#f0c040' }}>{wallC}</strong> +{' '}
            <strong style={{ color: '#f0c040' }}>{wallY}</strong>),
          </div>
          <div>
            transform: rotate(<strong style={{ color: '#f0c040' }}>{rotate}</strong>deg)
          </div>

          <div style={{ color: '#c678dd', fontWeight: 700, marginTop: 8 }}>// PAREDE DIREITA</div>
          <div>
            x: Math.round(floor.x + TW + <strong style={{ color: '#f0c040' }}>{wallRX}</strong>),
          </div>
          <div>
            y: Math.round(floor.y - WH + TH + stepY - r * stepY *{' '}
            <strong style={{ color: '#f0c040' }}>{wallRC}</strong> +{' '}
            <strong style={{ color: '#f0c040' }}>{wallRY}</strong>),
          </div>
          <div>transform: scaleX(-1) — left: pos.x - WW</div>

          <div style={{ color: '#98c379', fontWeight: 700, marginTop: 8 }}>// PISO</div>
          <div>
            left: pos.x + <strong style={{ color: '#f0c040' }}>{floorX}</strong>
          </div>
          <div>
            top: pos.y + wallOffsetY + (WH - TH) +{' '}
            <strong style={{ color: '#f0c040' }}>{floorY}</strong> +{' '}
            <strong style={{ color: '#61afef' }}>{allY}</strong>
          </div>
        </div>
      )}

      {/* Cena */}
      <div style={{ background: '#2d1b4e', borderRadius: 16, padding: 20, overflow: 'auto' }}>
        <div style={{ position: 'relative', width: 1200, height: sceneH }}>
          {/* Parede esquerda */}
          {wallLeftTiles.map((pos, i) => (
            <div
              key={`wl${i}`}
              style={{
                position: 'absolute',
                left: pos.x,
                top: pos.y + wallOffsetY + allY,
                zIndex: pos.z + 1,
                transform: `rotate(${rotate}deg)`,
                transformOrigin: 'bottom left',
                outline: '1px solid rgba(230,108,117,0.6)',
                ...tileStyle('base walls/BASE_WHITE_WALL.png', 0, 0, 256, 384, 256, 384, WW, WH),
              }}
            />
          ))}

          {/* Parede direita — espelhada com scaleX(-1) */}
          {wallRightTiles.map((pos, i) => (
            <div
              key={`wr${i}`}
              style={{
                position: 'absolute',
                left: pos.x - WW,
                top: pos.y + wallOffsetY + allY,
                zIndex: pos.z + 1,
                outline: '1px solid rgba(198,120,221,0.6)',
                ...tileStyle(
                  'base walls/BASE_WHITE_WALL.png',
                  0,
                  0,
                  256,
                  384,
                  256,
                  384,
                  WW,
                  WH,
                  true
                ),
              }}
            />
          ))}

          {/* Piso */}
          {floorNorm.map((pos, i) => (
            <div
              key={`f${i}`}
              style={{
                position: 'absolute',
                left: pos.x + floorX,
                top: pos.y + wallOffsetY + (WH - TH) + floorY + allY,
                zIndex: 100 + pos.z,
                outline: '1px solid rgba(255,100,100,0.4)',
                ...tileStyle(
                  'base floor/carpet spritesheet.png',
                  0,
                  0,
                  256,
                  128,
                  1024,
                  512,
                  TW,
                  TH
                ),
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
