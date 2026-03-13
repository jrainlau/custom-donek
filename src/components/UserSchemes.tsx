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

  // 保存当前配色（自动生成随机 ID，无需命名）
  const handleSave = useCallback(async () => {
    const newScheme: SavedColorScheme = {
      id: 'user-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6),
      name: '',
      topPrimary: currentColors.topPrimary,
      topSecondary: currentColors.topSecondary,
      basePattern: currentColors.basePattern,
      baseBg: currentColors.baseBg,
      createdAt: Date.now(),
    }

    await saveScheme(newScheme)
    await loadSchemes()
  }, [currentColors, loadSchemes])

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
          onClick={handleSave}
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
                position: 'relative',
              }}
            >
              {/* 删除按钮 */}
              <button
                onClick={(e) => handleDelete(scheme.id, e)}
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
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
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '4px',
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
