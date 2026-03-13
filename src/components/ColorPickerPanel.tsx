import { useState, useCallback, useRef } from 'react'
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
  // 展开详细颜色编辑器的索引
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
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

  // --- 复制颜色 ---
  const handleCopyColor = useCallback(
    async (e: React.MouseEvent, index: number) => {
      e.stopPropagation()
      const rgbStr = hexToRgbString(colors[index])
      const ok = await copyToClipboard(rgbStr)
      if (ok) {
        setCopiedIndex(index)
        setTimeout(() => setCopiedIndex(null), 1500)
      }
    },
    [colors]
  )

  // --- 展开/折叠详细编辑器 ---
  const toggleExpand = useCallback(
    (e: React.MouseEvent, index: number) => {
      e.stopPropagation()
      setExpandedIndex(expandedIndex === index ? null : index)
    },
    [expandedIndex]
  )

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
              border: `2px solid var(${showSeedPicker ? '--md-sys-color-primary' : '--md-sys-color-outline'})`,
              boxShadow: showSeedPicker
                ? '0 0 0 2px var(--md-sys-color-primary-container)'
                : 'var(--md-sys-elevation-level1)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              flexShrink: 0,
            }}
          />
          {/* 生成配色按钮 */}
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
            生成配色
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
          const isExpanded = expandedIndex === index
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
                  ? '2px dashed var(--md-sys-color-primary)'
                  : '2px solid var(--md-sys-color-outline-variant)',
                boxShadow: isDragging
                  ? 'var(--md-sys-elevation-level4)'
                  : isDragOver
                    ? 'var(--md-sys-elevation-level2)'
                    : 'var(--md-sys-elevation-level1)',
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

              {/* 底部：RGB 值 + 展开按钮 */}
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
                {/* 展开编辑按钮 */}
                <div
                  onClick={(e) => toggleExpand(e, index)}
                  title="展开颜色编辑器"
                  style={{
                    fontSize: '14px',
                    cursor: 'pointer',
                    color: textColor,
                    opacity: 0.7,
                    padding: '0 4px',
                    lineHeight: 1,
                  }}
                >
                  {isExpanded ? '▲' : '▼'}
                </div>
              </div>

              {/* 展开的颜色编辑器 */}
              {isExpanded && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    marginTop: '8px',
                    background: 'var(--md-sys-color-surface)',
                    borderRadius: '8px',
                    padding: '10px',
                    boxShadow: 'var(--md-sys-elevation-level2)',
                    cursor: 'default',
                  }}
                >
                  <HexColorPicker
                    color={color}
                    onChange={setters[index]}
                    style={{ width: '100%', height: '140px' }}
                  />
                  {/* RGB 滑块 */}
                  <div style={{ marginTop: '8px' }}>
                    {(['r', 'g', 'b'] as const).map((ch) => (
                      <div
                        key={ch}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          marginBottom: '3px',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '11px',
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
                          value={rgb[ch]}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10)
                            const newRgb = { ...rgb, [ch]: val }
                            setters[index](rgbToHex(newRgb.r, newRgb.g, newRgb.b))
                          }}
                          style={{
                            flex: 1,
                            accentColor: ch === 'r' ? '#e74c3c' : ch === 'g' ? '#27ae60' : '#2980b9',
                          }}
                        />
                        <span style={{ fontSize: '11px', fontFamily: 'monospace', width: '28px', textAlign: 'right' }}>
                          {rgb[ch]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
