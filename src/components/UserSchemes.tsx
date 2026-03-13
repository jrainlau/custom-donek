import { useState, useEffect, useCallback } from 'react'
import type { SavedColorScheme, ColorScheme } from '../types'
import { saveScheme, getAllSchemes, deleteScheme, isUsingFallback } from '../db'
import { hexToRgbString } from '../utils'

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
          borderBottom: '2px solid #e8dcc8',
          paddingBottom: '8px',
        }}
      >
        <h3
          style={{
            fontSize: '16px',
            fontWeight: 700,
            color: '#333',
            margin: 0,
          }}
        >
          💾 我的配色
        </h3>
        <button
          onClick={() => setShowSaveDialog(true)}
          style={{
            padding: '6px 16px',
            borderRadius: '8px',
            border: 'none',
            background: '#7c6f5b',
            color: '#fff',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#5e5345')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#7c6f5b')}
        >
          保存当前配色
        </button>
      </div>

      {isFallback && (
        <div
          style={{
            fontSize: '11px',
            color: '#e67e22',
            background: '#fef9e7',
            padding: '6px 10px',
            borderRadius: '6px',
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
              background: '#fff',
              borderRadius: '16px',
              padding: '24px',
              width: '360px',
              boxShadow: '0 16px 40px rgba(0,0,0,0.2)',
            }}
          >
            <h4 style={{ margin: '0 0 16px', fontSize: '16px', color: '#333' }}>
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
                    border: '2px solid rgba(0,0,0,0.1)',
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
                border: '2px solid #e0d6c2',
                borderRadius: '8px',
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
                  padding: '8px 20px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  background: '#fff',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={!schemeName.trim()}
                style={{
                  padding: '8px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: schemeName.trim() ? '#7c6f5b' : '#ccc',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: schemeName.trim() ? 'pointer' : 'not-allowed',
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
            color: '#aaa',
            fontSize: '13px',
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
                padding: '10px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.7)',
                border: '2px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.06)'
              }}
            >
              {/* 删除按钮 */}
              <button
                onClick={(e) => handleDelete(scheme.id, e)}
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: 'none',
                  background: 'rgba(0,0,0,0.1)',
                  color: '#666',
                  fontSize: '11px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1,
                }}
                title="删除"
              >
                ✕
              </button>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#555',
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
                      border: '2px solid rgba(0,0,0,0.1)',
                    }}
                  />
                ))}
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '2px',
                  fontSize: '8px',
                  fontFamily: 'monospace',
                  color: '#aaa',
                  textAlign: 'center',
                }}
              >
                <span>{hexToRgbString(scheme.topPrimary)}</span>
                <span>{hexToRgbString(scheme.topSecondary)}</span>
                <span>{hexToRgbString(scheme.basePattern)}</span>
                <span>{hexToRgbString(scheme.baseBg)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
