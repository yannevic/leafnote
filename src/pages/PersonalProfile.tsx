// src/pages/PersonalProfile.tsx
import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, Sparkles, Users, Send, Trash2, GripVertical, Sticker } from 'lucide-react'
import { useCharacter } from '../hooks/useCharacter'
import { useProfileComments } from '../hooks/useProfileComments'
import { addProfileComment, deleteProfileComment, MAX_COMMENT_LENGTH } from '../lib/profileComments'
import CharacterDoll from '../components/CharacterDoll'

import {
  subscribeDollLayout,
  saveDollLayout,
  subscribePanelLayout,
  savePanelLayout,
  type DollLayout,
} from '../lib/profileLayout'

import BoardSticker from '../components/BoardSticker'
import StickerPickerModal from '../components/StickerPickerModal'
import { ShopModal } from '../components/ShopModal'
import {
  subscribeProfileStickers,
  addProfileSticker,
  updateProfileSticker,
  deleteProfileSticker,
  type ProfileStickerItem,
} from '../lib/profileDecoration'

const T = {
  bg: 'linear-gradient(160deg, rgba(253,246,240,0.97) 0%, rgba(252,232,238,0.97) 100%)',
  card: 'rgba(253,242,246,0.7)',
  border: 'rgba(232,160,176,0.4)',
  borderDashed: '2px dashed rgba(232,160,176,0.4)',
  text: '#3d1a10',
  textSub: 'rgba(61,26,16,0.5)',
  textLabel: 'rgba(122,48,64,0.55)',
  btnIcon: 'rgba(200,120,140,0.15)',
  btnPrimary: 'rgba(232,160,176,0.55)',
  btnDestructive: 'rgba(232,96,122,0.12)',
  btnDestructiveText: '#e8607a',
}

interface PersonalProfileProps {
  uid: string
  displayName: string
  partnerUid: string
  partnerName: string
  onClose: () => void
}

export default function PersonalProfile({
  uid,
  displayName,
  partnerUid,
  partnerName,
  onClose,
}: PersonalProfileProps) {
  const [viewedUid, setViewedUid] = useState(uid)
  const isOwnProfile = viewedUid === uid
  const viewedName = isOwnProfile ? displayName : partnerName

  const { config: characterConfig } = useCharacter(viewedUid)
  const comments = useProfileComments(viewedUid)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)

  const [dollLayout, setDollLayout] = useState<DollLayout | null>(null)

  useEffect(() => {
    setDollLayout(null)
    return subscribeDollLayout(viewedUid, setDollLayout)
  }, [viewedUid])

  useEffect(() => {
    return subscribePanelLayout(viewedUid, setMuralPos)
  }, [viewedUid])

  const [stickers, setStickers] = useState<ProfileStickerItem[]>([])
  const [showStickerPicker, setShowStickerPicker] = useState(false)
  const [showShop, setShowShop] = useState(false)
  const [shopInitialPackId, setShopInitialPackId] = useState<string | undefined>(undefined)

  useEffect(() => {
    setStickers([])
    return subscribeProfileStickers(viewedUid, setStickers)
  }, [viewedUid])

  const corpoRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const dragOffset = useRef({ offsetX: 0, offsetY: 0 })
  const [muralPos, setMuralPos] = useState<{ x: number; y: number } | null>(null)
  const [dragging, setDragging] = useState(false)

  const handleDragStart = (e: React.MouseEvent) => {
    if (!isOwnProfile) return
    if (!corpoRef.current || !panelRef.current) return
    e.preventDefault()
    const corpoRect = corpoRef.current.getBoundingClientRect()
    const panelRect = panelRef.current.getBoundingClientRect()
    dragOffset.current = {
      offsetX: e.clientX - panelRect.left,
      offsetY: e.clientY - panelRect.top,
    }
    setMuralPos({ x: panelRect.left - corpoRect.left, y: panelRect.top - corpoRect.top })
    setDragging(true)
  }

  useEffect(() => {
    if (!dragging) return
    const handleMove = (e: MouseEvent) => {
      if (!corpoRef.current) return
      const corpoRect = corpoRef.current.getBoundingClientRect()
      const panelW = 320
      const panelH = panelRef.current?.offsetHeight ?? 400
      const maxX = Math.max(0, corpoRect.width - panelW)
      const maxY = Math.max(0, corpoRect.height - panelH)
      setMuralPos({
        x: Math.min(Math.max(0, e.clientX - corpoRect.left - dragOffset.current.offsetX), maxX),
        y: Math.min(Math.max(0, e.clientY - corpoRect.top - dragOffset.current.offsetY), maxY),
      })
    }
    const handleUp = () => {
      setDragging(false)
      setMuralPos((p) => {
        if (p) savePanelLayout(uid, p)
        return p
      })
    }
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }
  }, [dragging])

  const handleSend = async () => {
    if (!draft.trim() || sending) return
    setSending(true)
    await addProfileComment(viewedUid, uid, draft)
    setDraft('')
    setSending(false)
  }

  const scrollbarCss = `
    .profile-comments-scroll::-webkit-scrollbar {
      width: 6px;
    }
    .profile-comments-scroll::-webkit-scrollbar-track {
      background: transparent;
    }
    .profile-comments-scroll::-webkit-scrollbar-thumb {
      background: rgba(232,160,176,0.5);
      border-radius: 10px;
    }
    .profile-comments-scroll::-webkit-scrollbar-thumb:hover {
      background: rgba(232,160,176,0.75);
    }
  `

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          top: 32,
          zIndex: 200,
          background: T.bg,
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Baloo 2, sans-serif',
        }}
      >
        <style>{scrollbarCss}</style>
        {/* header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '90px 1fr auto',
            alignItems: 'center',
            height: 56,
            minHeight: 56,
            padding: '0 20px',
            borderBottom: T.borderDashed,
            background: 'rgba(253,246,240,0.8)',
            flexShrink: 0,
          }}
        >
          <button
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              padding: '5px 12px 5px 8px',
              borderRadius: 10,
              border: `1.5px solid ${T.border}`,
              background: T.btnIcon,
              color: T.text,
              fontSize: 12,
              fontWeight: 800,
              fontFamily: 'Baloo 2, sans-serif',
              cursor: 'pointer',
              justifySelf: 'start',
            }}
          >
            <ChevronLeft size={15} strokeWidth={2.5} />
            voltar
          </button>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              transform: 'translateY(2px)',
            }}
          >
            <Sparkles
              size={15}
              color="rgba(200,120,140,0.7)"
              strokeWidth={2}
              style={{ display: 'block', flexShrink: 0 }}
            />
            <span style={{ fontSize: 15, fontWeight: 800, color: T.text, lineHeight: 1 }}>
              perfil de {viewedName || '...'}
            </span>
          </div>

          <button
            onClick={() => setViewedUid(isOwnProfile ? partnerUid : uid)}
            disabled={!partnerUid}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              padding: '5px 12px',
              borderRadius: 10,
              border: `1.5px solid ${T.border}`,
              background: T.card,
              color: partnerUid ? T.text : T.textSub,
              fontSize: 11,
              fontWeight: 700,
              fontFamily: 'Baloo 2, sans-serif',
              cursor: partnerUid ? 'pointer' : 'not-allowed',
              justifySelf: 'end',
              whiteSpace: 'nowrap',
            }}
          >
            <Users size={13} strokeWidth={2} />
            {isOwnProfile ? `visitar perfil de ${partnerName || '...'}` : 'voltar ao meu perfil'}
          </button>
        </div>

        {/* corpo */}
        <div ref={corpoRef} style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {/* boneco — ocupa a área toda */}
          <div style={{ position: 'absolute', inset: 0 }}>
            {dollLayout && (
              <CharacterDoll
                key={viewedUid}
                config={characterConfig}
                colorVariants={characterConfig?.colorVariants ?? {}}
                width={200}
                initialPosition={{ x: dollLayout.x, y: dollLayout.y }}
                pinned={!isOwnProfile || dollLayout.pinned}
                onPinnedChange={
                  isOwnProfile ? (v) => saveDollLayout(uid, { pinned: v }) : undefined
                }
                onPositionChange={isOwnProfile ? (pos) => saveDollLayout(uid, pos) : undefined}
                initialFlipped={dollLayout.flipped}
                onFlippedChange={
                  isOwnProfile ? (v) => saveDollLayout(uid, { flipped: v }) : undefined
                }
              />
            )}
            {isOwnProfile && (
              <button
                onClick={() => setShowStickerPicker(true)}
                style={{
                  position: 'absolute',
                  bottom: 24,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 16px',
                  borderRadius: 20,
                  border: `1.5px solid ${T.border}`,
                  background: T.btnPrimary,
                  color: T.text,
                  fontSize: 12,
                  fontWeight: 800,
                  fontFamily: 'Baloo 2, sans-serif',
                  cursor: 'pointer',
                  zIndex: 60,
                }}
              >
                <Sticker size={14} strokeWidth={2.2} />
                decorar
              </button>
            )}
          </div>

          {/* decoração — stickers soltos, sem moldura (reaproveita BoardSticker.tsx) */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            {stickers.map((item) => (
              <div key={item.id} style={{ pointerEvents: 'auto' }}>
                <BoardSticker
                  item={item}
                  editMode={isOwnProfile}
                  zIndex={Math.min((item.zOrder ?? 0) + 10, 40)}
                  onUpdate={(id, data) => {
                    setStickers((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)))
                    updateProfileSticker(uid, id, data)
                  }}
                  onDelete={(id) => {
                    setStickers((prev) => prev.filter((s) => s.id !== id))
                    deleteProfileSticker(uid, id)
                  }}
                  onBringForward={(id) => {
                    const maxZ = Math.max(0, ...stickers.map((s) => s.zOrder ?? 0))
                    setStickers((prev) =>
                      prev.map((s) => (s.id === id ? { ...s, zOrder: maxZ + 1 } : s))
                    )
                    updateProfileSticker(uid, id, { zOrder: maxZ + 1 })
                  }}
                  onSendBackward={(id) => {
                    const minZ = Math.min(0, ...stickers.map((s) => s.zOrder ?? 0))
                    setStickers((prev) =>
                      prev.map((s) => (s.id === id ? { ...s, zOrder: minZ - 1 } : s))
                    )
                    updateProfileSticker(uid, id, { zOrder: minZ - 1 })
                  }}
                  onFocus={() => {}}
                />
              </div>
            ))}
          </div>

          {/* muralzinho de recados — painel solto, arrastável */}
          <div
            ref={panelRef}
            style={{
              position: 'absolute',
              top: muralPos?.y ?? 20,
              ...(muralPos ? { left: muralPos.x } : { right: 20 }),
              width: 400,
              height: 520,
              borderRadius: 16,
              border: `1.5px solid ${T.border}`,
              boxShadow: '0 8px 24px rgba(122,48,64,0.18)',
              display: 'flex',
              flexDirection: 'column',
              background: 'rgba(253,242,246,0.92)',
              backdropFilter: 'blur(4px)',
              zIndex: 50,
              userSelect: dragging ? 'none' : 'auto',
            }}
          >
            <div
              onMouseDown={handleDragStart}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 12px 8px',
                borderBottom: `1px solid rgba(232,160,176,0.25)`,
                flexShrink: 0,
                cursor: dragging ? 'grabbing' : 'grab',
                borderRadius: '16px 16px 0 0',
              }}
            >
              <GripVertical size={13} color={T.textLabel} strokeWidth={2.2} />
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 800,
                  color: T.textLabel,
                  fontFamily: 'Baloo 2, sans-serif',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                }}
              >
                muralzinho de recados
              </span>
            </div>

            {/* lista de recados */}
            <div
              className="profile-comments-scroll"
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '10px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                minHeight: 0,
              }}
            >
              {comments.length === 0 && (
                <div
                  style={{
                    textAlign: 'center',
                    color: T.textSub,
                    fontSize: 12,
                    fontFamily: 'Baloo 2, sans-serif',
                    padding: '24px 8px',
                  }}
                >
                  nenhum recado ainda
                </div>
              )}
              {comments.map((c) => (
                <div
                  key={c.id}
                  style={{
                    background: T.card,
                    border: `1.5px solid ${T.border}`,
                    borderRadius: 12,
                    padding: '8px 10px',
                    position: 'relative',
                  }}
                >
                  <p
                    style={{
                      fontSize: 12,
                      color: T.text,
                      fontFamily: 'Baloo 2, sans-serif',
                      fontWeight: 600,
                      margin: 0,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      paddingRight: c.authorUid === uid ? 20 : 0,
                    }}
                  >
                    {c.text}
                  </p>
                  <span
                    style={{
                      fontSize: 9,
                      color: T.textSub,
                      fontFamily: 'Baloo 2, sans-serif',
                    }}
                  >
                    {new Date(c.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                  {c.authorUid === uid && (
                    <button
                      onClick={() => deleteProfileComment(viewedUid, c.id)}
                      title="apagar recado"
                      style={{
                        position: 'absolute',
                        top: 6,
                        right: 6,
                        width: 18,
                        height: 18,
                        borderRadius: 6,
                        border: 'none',
                        background: T.btnDestructive,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0,
                      }}
                    >
                      <Trash2 size={10} strokeWidth={2.2} color={T.btnDestructiveText} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* campo de escrever — só aparece visitando o perfil do outro */}
            {!isOwnProfile && (
              <div
                style={{
                  padding: '10px 12px 14px',
                  borderTop: `1px solid rgba(232,160,176,0.25)`,
                  flexShrink: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value.slice(0, MAX_COMMENT_LENGTH))}
                  placeholder={`deixar um recado pra ${viewedName || '...'}...`}
                  rows={3}
                  style={{
                    resize: 'none',
                    padding: '8px 10px',
                    borderRadius: 10,
                    border: `1.5px solid ${T.border}`,
                    background: T.card,
                    fontSize: 12,
                    fontFamily: 'Baloo 2, sans-serif',
                    color: T.text,
                    outline: 'none',
                  }}
                />
                <div
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <span
                    style={{ fontSize: 9, color: T.textSub, fontFamily: 'Baloo 2, sans-serif' }}
                  >
                    {draft.length}/{MAX_COMMENT_LENGTH}
                  </span>
                  <button
                    onClick={handleSend}
                    disabled={!draft.trim() || sending}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      padding: '5px 14px',
                      borderRadius: 10,
                      border: 'none',
                      background: draft.trim() ? T.btnPrimary : 'rgba(232,160,176,0.25)',
                      color: T.text,
                      fontSize: 11,
                      fontWeight: 800,
                      fontFamily: 'Baloo 2, sans-serif',
                      cursor: draft.trim() ? 'pointer' : 'not-allowed',
                    }}
                  >
                    <Send size={11} strokeWidth={2.5} />
                    enviar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {showStickerPicker && (
        <StickerPickerModal
          uid={uid}
          onSelect={async (stickerKey) => {
            await addProfileSticker(uid, stickerKey, stickers)
            setShowStickerPicker(false)
          }}
          onClose={() => setShowStickerPicker(false)}
          onOpenShop={(packId) => {
            setShopInitialPackId(packId)
            setShowStickerPicker(false)
            setShowShop(true)
          }}
        />
      )}
      {showShop && (
        // wrapper só pra criar um contexto de empilhamento próprio: ShopModal.tsx usa
        // zIndex:100 internamente (menor que o 200 do PersonalProfile) — sem isso ele
        // nasceria escondido atrás da tela de perfil
        <div style={{ position: 'fixed', inset: 0, zIndex: 250 }}>
          <ShopModal
            uid={uid}
            partnerUid={partnerUid}
            myName={displayName}
            initialItemId={shopInitialPackId}
            onClose={() => {
              setShowShop(false)
              setShopInitialPackId(undefined)
              setShowStickerPicker(true)
            }}
          />
        </div>
      )}
    </>
  )
}
