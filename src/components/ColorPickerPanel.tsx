import { useState, useCallback, useRef, useEffect } from 'react'
import { HexColorPicker } from 'react-colorful'
import { hexToRgb, rgbToHex, hexToRgbString, copyToClipboard } from '../utils'

interface ColorPickerPanelProps {
  topPrimary: string
  topSecondary: string
  basePattern: string
  baseBg: string
  onTopPrimaryChange: (hex: string) => void
  onTopSecondaryChange: (hex: string) => void
  onBasePatternChange: (hex: string) => void
  onBaseBgChange: (hex: string) => void
  // 种子颜色相关
  seedColor: string
  onSeedColorChange: (hex: string) => void
  onGenerate: () => void
  showSeedPicker: boolean
  onToggleSeedPicker: () => void
  error?: string | null
}

/** 固定标签 */
const LABELS = ['板面背景', '板面 logo', '板底背景', '板底 logo']

/** 基于背景色亮度计算对比文字色 */
function getContrastColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? '#333333' : '#ffffff'
}

export default function ColorPickerPanel({
  topPrimary,
  topSecondary,
  basePattern,
  baseBg,
  onTopPrimaryChange,
  onTopSecondaryChange,
  onBasePatternChange,
  onBaseBgChange,
  seedColor,
  onSeedColorChange,
  onGenerate,
  showSeedPicker,
  onToggleSeedPicker,
  error,
}: ColorPickerPanelProps) {
  // 颜色值数组（与 LABELS 对应）
  const colors = [topPrimary, topSecondary, basePattern, baseBg]
  const setters = [onTopPrimaryChange, onTopSecondaryChange, onBasePatternChange, onBaseBgChange]

  // 拖拽状态
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  // 弹窗编辑器的索引
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  // 内部维护的「最近复制的 RGB」状态（代替剪贴板读取）
  const [lastCopiedRgb, setLastCopiedRgb] = useState('')
  const [lastCopiedHex, setLastCopiedHex] = useState('')
  const [lastCopiedTextColor, setLastCopiedTextColor] = useState('')
  // 复制反馈
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  // 触摸拖拽相关 ref
  const touchStartPos = useRef<{ x: number; y: number } | null>(null)
  const touchDragIndex = useRef<number | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const isTouchDragging = useRef(false)

  /** 交换两个槽位的颜色值 */
  const swapColors = useCallback(
    (indexA: number, indexB: number) => {
      if (indexA === indexB) return
      const colorA = colors[indexA]
      const colorB = colors[indexB]
      setters[indexA](colorB)
      setters[indexB](colorA)
    },
    [colors, setters]
  )

  // --- Drag & Drop ---
  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDragIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(index))
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent, targetIndex: number) => {
      e.preventDefault()
      const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'), 10)
      if (!isNaN(sourceIndex)) {
        swapColors(sourceIndex, targetIndex)
      }
      setDragIndex(null)
      setDragOverIndex(null)
    },
    [swapColors]
  )

  const handleDragEnd = useCallback(() => {
    setDragIndex(null)
    setDragOverIndex(null)
  }, [])

  // --- Touch 拖拽（移动端） ---
  /** 根据触摸坐标判断落在哪个色块上 */
  const getDropTargetIndex = useCallback((touchX: number, touchY: number): number | null => {
    if (!gridRef.current) return null
    const children = gridRef.current.children
    for (let i = 0; i < children.length; i++) {
      const rect = children[i].getBoundingClientRect()
      if (
        touchX >= rect.left &&
        touchX <= rect.right &&
        touchY >= rect.top &&
        touchY <= rect.bottom
      ) {
        return i
      }
    }
    return null
  }, [])

  const handleTouchStart = useCallback((e: React.TouchEvent, index: number) => {
    const touch = e.touches[0]
    touchStartPos.current = { x: touch.clientX, y: touch.clientY }
    touchDragIndex.current = index
    isTouchDragging.current = false
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchDragIndex.current === null || !touchStartPos.current) return
    const touch = e.touches[0]
    const dx = touch.clientX - touchStartPos.current.x
    const dy = touch.clientY - touchStartPos.current.y
    // 超过 10px 才视为拖拽，避免误触
    if (!isTouchDragging.current && Math.sqrt(dx * dx + dy * dy) > 10) {
      isTouchDragging.current = true
      setDragIndex(touchDragIndex.current)
    }
    if (isTouchDragging.current) {
      e.preventDefault() // 阻止页面滚动
      const targetIdx = getDropTargetIndex(touch.clientX, touch.clientY)
      setDragOverIndex(targetIdx !== touchDragIndex.current ? targetIdx : null)
    }
  }, [getDropTargetIndex])

  const handleTouchEnd = useCallback(() => {
    if (isTouchDragging.current && touchDragIndex.current !== null && dragOverIndex !== null) {
      swapColors(touchDragIndex.current, dragOverIndex)
    }
    touchStartPos.current = null
    touchDragIndex.current = null
    isTouchDragging.current = false
    setDragIndex(null)
    setDragOverIndex(null)
  }, [dragOverIndex, swapColors])

  // --- 复制颜色（同时更新内部状态） ---
  const handleCopyColor = useCallback(
    async (e: React.MouseEvent, index: number) => {
      e.stopPropagation()
      const hex = colors[index]
      const rgbStr = hexToRgbString(hex)
      const ok = await copyToClipboard(rgbStr)
      if (ok) {
        setCopiedIndex(index)
        setTimeout(() => setCopiedIndex(null), 1500)
        // 更新内部状态，供弹窗中快捷应用
        const rgb = hexToRgb(hex)
        const rgbValue = `${rgb.r},${rgb.g},${rgb.b}`
        setLastCopiedRgb(rgbValue)
        setLastCopiedHex(hex)
        setLastCopiedTextColor(getContrastColor(hex))
      }
    },
    [colors]
  )

  // --- 弹窗编辑器 ---
  const openEditor = useCallback(
    (e: React.MouseEvent, index: number) => {
      e.stopPropagation()
      setEditingIndex(index)
      // 不再读取剪贴板，直接使用内部维护的 lastCopiedRgb 状态
    },
    []
  )

  /** 应用最近复制的 RGB 颜色 */
  const handleApplyLastCopied = useCallback(() => {
    if (!lastCopiedRgb || editingIndex === null) return
    setters[editingIndex](lastCopiedHex)
  }, [lastCopiedRgb, lastCopiedHex, editingIndex, setters])

  const closeEditor = useCallback(() => {
    setEditingIndex(null)
  }, [])

  // ESC 关闭弹窗
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && editingIndex !== null) {
        closeEditor()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [editingIndex, closeEditor])

  // 弹窗内颜色变化时同步
  const handleEditorColorChange = useCallback(
    (hex: string) => {
      if (editingIndex === null) return
      setters[editingIndex](hex)
    },
    [editingIndex, setters]
  )

  // RGB 滑块变化
  const handleEditorSliderChange = useCallback(
    (ch: 'r' | 'g' | 'b', val: number) => {
      if (editingIndex === null) return
      const rgb = hexToRgb(colors[editingIndex])
      const newRgb = { ...rgb, [ch]: val }
      const hex = rgbToHex(newRgb.r, newRgb.g, newRgb.b)
      setters[editingIndex](hex)
    },
    [editingIndex, colors, setters]
  )

  // RGB 文本输入处理 - 已移除，改为剪贴板检测

  return (
    <div>
      {/* ===== 标题栏 + 种子颜色 + 生成按钮 ===== */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
          borderBottom: '1px solid var(--md-sys-color-outline-variant)',
          paddingBottom: '8px',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <h3
          style={{
            font: 'var(--md-sys-typescale-title-medium)',
            color: 'var(--md-sys-color-on-surface)',
            margin: 0,
          }}
        >
          🎨 颜色配置
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* 种子颜色色块 */}
          <div
            onClick={onToggleSeedPicker}
            title="选择种子颜色"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: seedColor,
              cursor: 'pointer',
              border: `1px solid var(${showSeedPicker ? '--md-sys-color-primary' : '--md-sys-color-outline'})`,
              boxShadow: showSeedPicker
                ? '0 0 0 2px var(--md-sys-color-primary-container)'
                : 'none',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              flexShrink: 0,
            }}
          />
          {/* 智能配色按钮 */}
          <button
            onClick={onGenerate}
            style={{
              padding: '6px 16px',
              borderRadius: '16px',
              border: 'none',
              background: 'var(--md-sys-color-secondary-container)',
              color: 'var(--md-sys-color-on-secondary-container)',
              font: 'var(--md-sys-typescale-label-medium)',
              cursor: 'pointer',
              transition: 'all 0.2s var(--md-sys-motion-easing-standard)',
              boxShadow: 'var(--md-sys-elevation-level1)',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = 'var(--md-sys-elevation-level2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'var(--md-sys-elevation-level1)'
            }}
          >
            智能配色
          </button>
        </div>
      </div>

      {/* 种子颜色选择器（展开时显示） */}
      {showSeedPicker && (
        <div style={{
          marginBottom: '12px',
          animation: 'fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          <HexColorPicker
            color={seedColor}
            onChange={onSeedColorChange}
            style={{ width: '100%', height: '160px' }}
          />
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div
          style={{
            padding: '8px 12px',
            borderRadius: 'var(--md-sys-shape-corner-small)',
            backgroundColor: 'var(--md-sys-color-error-container)',
            color: 'var(--md-sys-color-on-error-container)',
            font: 'var(--md-sys-typescale-body-small)',
            marginBottom: '12px',
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* 拖拽提示 */}
      <div
        style={{
          font: 'var(--md-sys-typescale-body-small)',
          color: 'var(--md-sys-color-on-surface-variant)',
          marginBottom: '8px',
        }}
      >
        💡 拖拽色块可交换颜色
      </div>

      {/* ===== 2×2 可拖拽色块网格 ===== */}
      <div
        ref={gridRef}
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
        }}
      >
        {LABELS.map((label, index) => {
          const color = colors[index]
          const isDragging = dragIndex === index
          const isDragOver = dragOverIndex === index && dragIndex !== index
          const textColor = getContrastColor(color)
          const rgb = hexToRgb(color)

          return (
            <div
              key={label}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              onTouchStart={(e) => handleTouchStart(e, index)}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{
                borderRadius: 'var(--md-sys-shape-corner-medium)',
                backgroundColor: color,
                padding: '12px 10px',
                cursor: 'grab',
                border: isDragOver
                  ? '1px dashed var(--md-sys-color-primary)'
                  : '1px solid var(--md-sys-color-outline-variant)',
                boxShadow: isDragging
                  ? 'var(--md-sys-elevation-level4)'
                  : 'none',
                transform: isDragging ? 'scale(1.05) rotate(2deg)' : 'scale(1)',
                opacity: isDragging ? 0.8 : 1,
                transition: 'transform 0.2s ease, box-shadow 0.2s ease, border 0.2s ease, opacity 0.2s ease',
                userSelect: 'none',
                position: 'relative',
                minHeight: '72px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              {/* 标签 */}
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: textColor,
                  opacity: 0.9,
                  marginBottom: '4px',
                }}
              >
                {label}
              </div>

              {/* 拖拽图标 */}
              <div
                style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  fontSize: '14px',
                  opacity: 0.5,
                  color: textColor,
                }}
              >
                ⠿
              </div>

              {/* 底部：RGB 值 + 修改按钮 */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div
                  onClick={(e) => handleCopyColor(e, index)}
                  title="点击复制 RGB 值"
                  style={{
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    color: textColor,
                    opacity: 0.8,
                    cursor: 'pointer',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(0,0,0,0.08)',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.15)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.08)'
                  }}
                >
                  {copiedIndex === index ? '✅ 已复制' : hexToRgbString(color)}
                </div>
                {/* 修改按钮 */}
                <div
                  onClick={(e) => openEditor(e, index)}
                  title="修改颜色"
                  style={{
                    fontSize: '14px',
                    cursor: 'pointer',
                    color: textColor,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(0,0,0,0.12)',
                    transition: 'background-color 0.15s ease',
                    lineHeight: 1,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.2)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.12)'
                  }}
                >
                  ✏️
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ===== 颜色编辑弹窗 ===== */}
      {editingIndex !== null && (() => {
        const editColor = colors[editingIndex]
        const editRgb = hexToRgb(editColor)
        return (
          <>
            {/* 遮罩层 */}
            <div
              onClick={closeEditor}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                zIndex: 1000,
                animation: 'fadeIn 0.2s ease',
              }}
            />
            {/* 弹窗卡片 */}
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 1001,
                background: 'var(--md-sys-color-surface)',
                borderRadius: 'var(--md-sys-shape-corner-extra-large, 28px)',
                padding: '24px',
                boxShadow: 'var(--md-sys-elevation-level3)',
                width: '340px',
                maxWidth: '90vw',
                maxHeight: '90vh',
                overflowY: 'auto',
                animation: 'fadeIn 0.2s ease',
              }}
            >
              {/* 弹窗头部 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{
                  margin: 0,
                  font: 'var(--md-sys-typescale-title-medium)',
                  color: 'var(--md-sys-color-on-surface)',
                }}>
                  🎨 {LABELS[editingIndex]}
                </h3>
                <div
                  onClick={closeEditor}
                  style={{
                    cursor: 'pointer',
                    fontSize: '20px',
                    color: 'var(--md-sys-color-on-surface-variant)',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--md-sys-color-surface-container-highest)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  ×
                </div>
              </div>

              {/* 当前颜色预览条 */}
              <div style={{
                height: '40px',
                borderRadius: 'var(--md-sys-shape-corner-medium)',
                backgroundColor: editColor,
                marginBottom: '16px',
                border: '1px solid var(--md-sys-color-outline-variant)',
              }} />

              {/* 颜色选择器 */}
              <HexColorPicker
                color={editColor}
                onChange={handleEditorColorChange}
                style={{ width: '100%', height: '180px', marginBottom: '16px' }}
              />

              {/* RGB 滑块 */}
              <div style={{ marginBottom: '16px' }}>
                {(['r', 'g', 'b'] as const).map((ch) => (
                  <div
                    key={ch}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '6px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        color: ch === 'r' ? '#e74c3c' : ch === 'g' ? '#27ae60' : '#2980b9',
                        width: '14px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {ch}
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={255}
                      value={editRgb[ch]}
                      onChange={(e) => handleEditorSliderChange(ch, parseInt(e.target.value, 10))}
                      style={{
                        flex: 1,
                        accentColor: ch === 'r' ? '#e74c3c' : ch === 'g' ? '#27ae60' : '#2980b9',
                      }}
                    />
                    <span style={{ fontSize: '12px', fontFamily: 'monospace', width: '28px', textAlign: 'right' }}>
                      {editRgb[ch]}
                    </span>
                  </div>
                ))}
              </div>

              {/* 最近复制的颜色快捷应用按钮 */}
              {lastCopiedRgb && (
                <div
                  onClick={handleApplyLastCopied}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '24px',
                    backgroundColor: lastCopiedHex,
                    color: lastCopiedTextColor,
                    border: '1px solid var(--md-sys-color-outline-variant)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontFamily: 'monospace',
                    fontSize: '13px',
                    fontWeight: 500,
                    transition: 'opacity 0.2s ease, transform 0.15s ease',
                    boxShadow: 'var(--md-sys-elevation-level1)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.85'
                    e.currentTarget.style.transform = 'scale(0.98)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1'
                    e.currentTarget.style.transform = 'scale(1)'
                  }}
                >
                  📋 使用 {lastCopiedRgb} 颜色
                </div>
              )}
            </div>
          </>
        )
      })()}
    </div>
  )
}
