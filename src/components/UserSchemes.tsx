import { useState, useEffect, useCallback } from 'react'
import type { SavedColorScheme, ColorScheme } from '../types'
import { saveScheme, getAllSchemes, deleteScheme, isUsingFallback } from '../db'

interface UserSchemesProps {
  currentColors: {
    topPrimary: string
    topSecondary: string
    basePattern: string
    baseBg: string
  }
  onSelect: (scheme: ColorScheme) => void
}

export default function UserSchemes({
  currentColors,
  onSelect,
}: UserSchemesProps) {
  const [schemes, setSchemes] = useState<SavedColorScheme[]>([])
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [schemeName, setSchemeName] = useState('')
  const [isFallback] = useState(isUsingFallback)

  // 加载已保存的配色
  const loadSchemes = useCallback(async () => {
    const all = await getAllSchemes()
    // 按创建时间倒序
    all.sort((a, b) => b.createdAt - a.createdAt)
    setSchemes(all)
  }, [])

  useEffect(() => {
    loadSchemes()
  }, [loadSchemes])

  // 保存当前配色
  const handleSave = useCallback(async () => {
    if (!schemeName.trim()) return

    const newScheme: SavedColorScheme = {
      id: 'user-' + Date.now().toString(36),
      name: schemeName.trim(),
      topPrimary: currentColors.topPrimary,
      topSecondary: currentColors.topSecondary,
      basePattern: currentColors.basePattern,
      baseBg: currentColors.baseBg,
      createdAt: Date.now(),
    }

    await saveScheme(newScheme)
    await loadSchemes()
    setSchemeName('')
    setShowSaveDialog(false)
  }, [schemeName, currentColors, loadSchemes])

  // 删除配色
  const handleDelete = useCallback(
    async (id: string, e: React.MouseEvent) => {
      e.stopPropagation()
      if (confirm('确定要删除这个配色方案吗？')) {
        await deleteScheme(id)
        await loadSchemes()
      }
    },
    [loadSchemes]
  )

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
          borderBottom: '1px solid var(--md-sys-color-outline-variant)',
          paddingBottom: '8px',
        }}
      >
        <h3
          style={{
            font: 'var(--md-sys-typescale-title-medium)',
            color: 'var(--md-sys-color-on-surface)',
            margin: 0,
          }}
        >
          💾 我的配色
        </h3>
        <button
          onClick={() => setShowSaveDialog(true)}
          style={{
            padding: '8px 20px',
            borderRadius: '20px',
            border: 'none',
            background: 'var(--md-sys-color-secondary-container)',
            color: 'var(--md-sys-color-on-secondary-container)',
            font: 'var(--md-sys-typescale-label-large)',
            cursor: 'pointer',
            transition: 'all 0.2s var(--md-sys-motion-easing-standard)',
            boxShadow: 'var(--md-sys-elevation-level1)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.boxShadow = 'var(--md-sys-elevation-level2)')}
          onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'var(--md-sys-elevation-level1)')}
        >
          保存当前配色
        </button>
      </div>

      {isFallback && (
        <div
          style={{
            font: 'var(--md-sys-typescale-body-small)',
            color: 'var(--md-sys-color-error)',
            background: 'var(--md-sys-color-error-container)',
            padding: '8px 12px',
            borderRadius: 'var(--md-sys-shape-corner-small)',
            marginBottom: '8px',
          }}
        >
          ⚠️ IndexedDB 不可用，已降级为 localStorage 存储，容量有限
        </div>
      )}

      {/* 保存弹窗 */}
      {showSaveDialog && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowSaveDialog(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--md-sys-color-surface-container-high)',
              borderRadius: 'var(--md-sys-shape-corner-extra-large)',
              padding: '24px',
              width: '360px',
              boxShadow: 'var(--md-sys-elevation-level3)',
            }}
          >
            <h4 style={{ margin: '0 0 16px', font: 'var(--md-sys-typescale-title-medium)', color: 'var(--md-sys-color-on-surface)' }}>
              保存配色方案
            </h4>
            {/* 预览色块 */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              {[
                currentColors.topPrimary,
                currentColors.topSecondary,
                currentColors.basePattern,
                currentColors.baseBg,
              ].map((c, i) => (
                <div
                  key={i}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: c,
                    border: '2px solid var(--md-sys-color-outline-variant)',
                  }}
                />
              ))}
            </div>
            <input
              autoFocus
              type="text"
              value={schemeName}
              onChange={(e) => setSchemeName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder="为你的配色方案取个名字..."
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid var(--md-sys-color-outline)',
                borderRadius: 'var(--md-sys-shape-corner-small)',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <div
              style={{
                display: 'flex',
                gap: '8px',
                marginTop: '16px',
                justifyContent: 'flex-end',
              }}
            >
              <button
                onClick={() => setShowSaveDialog(false)}
                style={{
                  padding: '10px 24px',
                  borderRadius: '20px',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--md-sys-color-primary)',
                  font: 'var(--md-sys-typescale-label-large)',
                  cursor: 'pointer',
                }}
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={!schemeName.trim()}
                style={{
                  padding: '10px 24px',
                  borderRadius: '20px',
                  border: 'none',
                  background: schemeName.trim() ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-surface-container-highest)',
                  color: schemeName.trim() ? 'var(--md-sys-color-on-primary)' : 'var(--md-sys-color-on-surface-variant)',
                  font: 'var(--md-sys-typescale-label-large)',
                  cursor: schemeName.trim() ? 'pointer' : 'not-allowed',
                  boxShadow: schemeName.trim() ? 'var(--md-sys-elevation-level1)' : 'none',
                }}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 已保存配色列表 */}
      {schemes.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            color: 'var(--md-sys-color-on-surface-variant)',
            font: 'var(--md-sys-typescale-body-medium)',
            padding: '20px 0',
          }}
        >
          还没有保存的配色方案
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '10px',
          }}
        >
          {schemes.map((scheme) => (
            <div
              key={scheme.id}
              onClick={() => onSelect(scheme)}
              style={{
                padding: '12px',
                borderRadius: 'var(--md-sys-shape-corner-medium)',
                background: 'var(--md-sys-color-surface-container-low)',
                border: '1px solid var(--md-sys-color-outline-variant)',
                cursor: 'pointer',
                transition: 'all 0.2s var(--md-sys-motion-easing-standard)',
                boxShadow: 'var(--md-sys-elevation-level1)',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = 'var(--md-sys-elevation-level2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'var(--md-sys-elevation-level1)'
              }}
            >
              {/* 删除按钮 */}
              <button
                onClick={(e) => handleDelete(scheme.id, e)}
                style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  border: 'none',
                  background: 'var(--md-sys-color-surface-container-highest)',
                  color: 'var(--md-sys-color-on-surface-variant)',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--md-sys-color-error-container)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--md-sys-color-surface-container-highest)')}
                title="删除"
              >
                ✕
              </button>
              <div
                style={{
                  font: 'var(--md-sys-typescale-label-medium)',
                  color: 'var(--md-sys-color-on-surface)',
                  marginBottom: '6px',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {scheme.name}
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '4px',
                  marginBottom: '4px',
                }}
              >
                {[
                  scheme.topPrimary,
                  scheme.topSecondary,
                  scheme.basePattern,
                  scheme.baseBg,
                ].map((c, i) => (
                  <div
                    key={i}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: c,
                      border: '2px solid var(--md-sys-color-outline-variant)',
                    }}
                  />
                ))}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  )
}
