import { useState, useCallback, useRef, useEffect } from 'react'
import { HexColorPicker } from 'react-colorful'
import { generateM3Palette, type M3ColorResult } from '../m3color'
import { hexToRgbString, copyToClipboard } from '../utils'

/** 颜色槽位定义 */
interface ColorSlot {
  key: keyof M3ColorResult
  label: string
  color: string
}

interface SmartPaletteProps {
  topPrimary: string
  topSecondary: string
  basePattern: string
  baseBg: string
  onColorsChange: (colors: M3ColorResult) => void
}

/** 默认种子颜色 */
const DEFAULT_SEED = '#6750A4'

export default function SmartPalette({
  topPrimary,
  topSecondary,
  basePattern,
  baseBg,
  onColorsChange,
}: SmartPaletteProps) {
  const [seedColor, setSeedColor] = useState(DEFAULT_SEED)
  const [showPicker, setShowPicker] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 拖拽状态
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  // 触控设备：点击选中交换
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  // 复制反馈
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  // 防抖定时器引用
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 构建当前 4 色槽位
  const slots: ColorSlot[] = [
    { key: 'topPrimary', label: '板面背景', color: topPrimary },
    { key: 'topSecondary', label: '板面 logo', color: topSecondary },
    { key: 'basePattern', label: '板底 logo', color: basePattern },
    { key: 'baseBg', label: '板底背景', color: baseBg },
  ]

  /**
   * 种子颜色变化时，防抖生成新配色
   */
  const handleSeedChange = useCallback(
    (hex: string) => {
      setSeedColor(hex)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        const result = generateM3Palette(hex)
        if (result) {
          setError(null)
          onColorsChange(result)
        } else {
          setError('配色生成失败，请尝试其他颜色')
        }
      }, 150)
    },
    [onColorsChange]
  )

  // 清理定时器
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  /**
   * 应用配色按钮（手动触发）
   */
  const handleApply = useCallback(() => {
    const result = generateM3Palette(seedColor)
    if (result) {
      setError(null)
      onColorsChange(result)
    } else {
      setError('配色生成失败，请尝试其他颜色')
    }
  }, [seedColor, onColorsChange])

  /**
   * 交换两个颜色槽位
   */
  const swapColors = useCallback(
    (indexA: number, indexB: number) => {
      if (indexA === indexB) return
      const newColors: M3ColorResult = {
        topPrimary,
        topSecondary,
        basePattern,
        baseBg,
      }
      const keyA = slots[indexA].key
      const keyB = slots[indexB].key
      const temp = newColors[keyA]
      newColors[keyA] = newColors[keyB]
      newColors[keyB] = temp
      onColorsChange(newColors)
    },
    [topPrimary, topSecondary, basePattern, baseBg, onColorsChange, slots]
  )

  // --- Drag & Drop 事件处理 ---
  const handleDragStart = useCallback(
    (e: React.DragEvent, index: number) => {
      setDragIndex(index)
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/plain', String(index))
    },
    []
  )

  const handleDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
      setDragOverIndex(index)
    },
    []
  )

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

  // --- 触控设备点击交换 ---
  const handleSlotClick = useCallback(
    (index: number) => {
      if (selectedIndex === null) {
        setSelectedIndex(index)
      } else if (selectedIndex === index) {
        setSelectedIndex(null)
      } else {
        swapColors(selectedIndex, index)
        setSelectedIndex(null)
      }
    },
    [selectedIndex, swapColors]
  )

  // --- 复制颜色 ---
  const handleCopyColor = useCallback(
    async (e: React.MouseEvent, index: number) => {
      e.stopPropagation()
      const rgbStr = hexToRgbString(slots[index].color)
      const ok = await copyToClipboard(rgbStr)
      if (ok) {
        setCopiedIndex(index)
        setTimeout(() => setCopiedIndex(null), 1500)
      }
    },
    [slots]
  )

  /**
   * 计算文字颜色（基于背景色亮度）
   */
  const getContrastColor = (hex: string): string => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luminance > 0.5 ? '#333333' : '#ffffff'
  }

  return (
    <div>
      <h3
        style={{
          font: 'var(--md-sys-typescale-title-medium)',
          color: 'var(--md-sys-color-on-surface)',
          marginBottom: '16px',
          borderBottom: '1px solid var(--md-sys-color-outline-variant)',
          paddingBottom: '8px',
        }}
      >
        🪄 智能配色
      </h3>

      {/* 种子颜色选择 */}
      <div style={{ marginBottom: '16px' }}>
        <div
          style={{
            font: 'var(--md-sys-typescale-label-medium)',
            color: 'var(--md-sys-color-on-surface-variant)',
            marginBottom: '8px',
          }}
        >
          选择种子颜色
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            onClick={() => setShowPicker(!showPicker)}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: seedColor,
              cursor: 'pointer',
              border: `2px solid var(${showPicker ? '--md-sys-color-primary' : '--md-sys-color-outline'})`,
              boxShadow: showPicker
                ? '0 0 0 3px var(--md-sys-color-primary-container)'
                : 'var(--md-sys-elevation-level1)',
              transition: 'box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              flexShrink: 0,
            }}
          />
          <button
            onClick={handleApply}
            style={{
              padding: '10px 24px',
              borderRadius: '20px',
              border: 'none',
              background: 'var(--md-sys-color-primary)',
              color: 'var(--md-sys-color-on-primary)',
              font: 'var(--md-sys-typescale-label-large)',
              cursor: 'pointer',
              transition: 'all 0.2s var(--md-sys-motion-easing-standard)',
              boxShadow: 'var(--md-sys-elevation-level1)',
              position: 'relative',
              overflow: 'hidden',
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

        {showPicker && (
          <div style={{ marginTop: '12px' }}>
            <HexColorPicker
              color={seedColor}
              onChange={handleSeedChange}
              style={{ width: '100%', height: '160px' }}
            />
          </div>
        )}
      </div>

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

      {/* 4 色块 - 可拖拽交换 */}
      <div
        style={{
          font: 'var(--md-sys-typescale-body-small)',
          color: 'var(--md-sys-color-on-surface-variant)',
          marginBottom: '8px',
        }}
      >
        💡 拖拽色块可交换位置，点击色块也可选中后交换
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
        }}
      >
        {slots.map((slot, index) => {
          const isDragging = dragIndex === index
          const isDragOver = dragOverIndex === index && dragIndex !== index
          const isSelected = selectedIndex === index
          const textColor = getContrastColor(slot.color)

          return (
            <div
              key={slot.key}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              onClick={() => handleSlotClick(index)}
              style={{
                borderRadius: 'var(--md-sys-shape-corner-medium)',
                backgroundColor: slot.color,
                padding: '16px 12px',
                cursor: 'grab',
                border: isDragOver
                  ? '2px dashed var(--md-sys-color-primary)'
                  : isSelected
                    ? '2px solid var(--md-sys-color-primary)'
                    : '2px solid var(--md-sys-color-outline-variant)',
                boxShadow: isDragging
                  ? 'var(--md-sys-elevation-level4)'
                  : isDragOver
                    ? 'var(--md-sys-elevation-level2)'
                    : 'var(--md-sys-elevation-level1)',
                transform: isDragging
                  ? 'scale(1.05) rotate(2deg)'
                  : 'scale(1)',
                opacity: isDragging ? 0.8 : 1,
                transition: 'transform 0.2s ease, box-shadow 0.2s ease, border 0.2s ease, opacity 0.2s ease',
                userSelect: 'none',
                position: 'relative',
                minHeight: '80px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              {/* 位置标签 */}
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: textColor,
                  opacity: 0.9,
                  marginBottom: '8px',
                }}
              >
                {slot.label}
              </div>

              {/* 拖拽图标 */}
              <div
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  fontSize: '14px',
                  opacity: 0.5,
                  color: textColor,
                }}
              >
                ⠿
              </div>

              {/* RGB 值 */}
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
                  display: 'inline-block',
                  alignSelf: 'flex-start',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.15)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.08)'
                }}
              >
                {copiedIndex === index
                  ? '✅ 已复制'
                  : hexToRgbString(slot.color)}
              </div>

              {/* 选中指示器 */}
              {isSelected && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '6px',
                    right: '8px',
                    fontSize: '10px',
                    color: textColor,
                    opacity: 0.7,
                  }}
                >
                  已选中 ✓
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
