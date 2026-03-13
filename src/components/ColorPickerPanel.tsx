import { useState, useCallback } from 'react'
import { HexColorPicker } from 'react-colorful'
import { hexToRgb, rgbToHex, hexToRgbString, copyToClipboard } from '../utils'

interface ColorItemProps {
  label: string
  color: string
  onChange: (hex: string) => void
}

function ColorItem({ label, color, onChange }: ColorItemProps) {
  const [showPicker, setShowPicker] = useState(false)
  const [copied, setCopied] = useState(false)
  const [editingRgb, setEditingRgb] = useState(false)
  const [rgbInput, setRgbInput] = useState('')

  const rgb = hexToRgb(color)
  const rgbString = hexToRgbString(color)

  const handleCopy = useCallback(async () => {
    const success = await copyToClipboard(rgbString)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }, [rgbString])

  const handleRgbInputBlur = useCallback(() => {
    setEditingRgb(false)
    const match = rgbInput.match(/(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/)
    if (match) {
      const r = Math.min(255, parseInt(match[1], 10))
      const g = Math.min(255, parseInt(match[2], 10))
      const b = Math.min(255, parseInt(match[3], 10))
      onChange(rgbToHex(r, g, b))
    }
  }, [rgbInput, onChange])

  const handleRgbInputKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleRgbInputBlur()
      }
    },
    [handleRgbInputBlur]
  )

  return (
    <div style={{ marginBottom: '16px' }}>
      <div
        style={{
          font: 'var(--md-sys-typescale-label-medium)',
          color: 'var(--md-sys-color-on-surface-variant)',
          marginBottom: '8px',
        }}
      >
        {label}
      </div>
      {/* 色块 + 点击展开选择器 */}
      <div
        onClick={() => setShowPicker(!showPicker)}
        style={{
          width: '100%',
          height: '40px',
          borderRadius: '8px',
          backgroundColor: color,
          cursor: 'pointer',
          border: `2px solid var(${showPicker ? '--md-sys-color-primary' : '--md-sys-color-outline'})`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: showPicker
            ? '0 0 0 3px var(--md-sys-color-primary-container)'
            : 'var(--md-sys-elevation-level1)',
        }}
      />
      {/* RGB 值展示 + 可复制 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '6px',
        }}
      >
        {editingRgb ? (
          <input
            autoFocus
            type="text"
            value={rgbInput}
            onChange={(e) => setRgbInput(e.target.value)}
            onBlur={handleRgbInputBlur}
            onKeyDown={handleRgbInputKeyDown}
            placeholder="R, G, B"
            style={{
              flex: 1,
              fontSize: '12px',
              padding: '2px 6px',
              border: '1px solid var(--md-sys-color-outline)',
              borderRadius: 'var(--md-sys-shape-corner-extra-small)',
              outline: 'none',
              fontFamily: 'monospace',
            }}
          />
        ) : (
          <span
            onClick={handleCopy}
            onDoubleClick={() => {
              setEditingRgb(true)
              setRgbInput(`${rgb.r}, ${rgb.g}, ${rgb.b}`)
            }}
            title="单击复制，双击编辑"
            style={{
              fontSize: '12px',
              fontFamily: 'monospace',
              color: 'var(--md-sys-color-on-surface-variant)',
              cursor: 'pointer',
              userSelect: 'none',
              transition: 'color 0.15s',
            }}
          >
            {copied ? '✅ 已复制' : rgbString}
          </span>
        )}
      </div>
      {/* 颜色选择器 */}
      {/* 颜色选择器 - M3 动画过渡 */}
      {showPicker && (
        <div style={{
          marginTop: '8px',
          animation: 'fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          <HexColorPicker
            color={color}
            onChange={onChange}
            style={{ width: '100%', height: '160px' }}
          />
          {/* RGB 滑块 */}
          <div style={{ marginTop: '8px' }}>
            {(['r', 'g', 'b'] as const).map((ch) => (
              <div
                key={ch}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '4px',
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
                    onChange(rgbToHex(newRgb.r, newRgb.g, newRgb.b))
                  }}
                  style={{ flex: 1, accentColor: ch === 'r' ? '#e74c3c' : ch === 'g' ? '#27ae60' : '#2980b9' }}
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
}

interface ColorPickerPanelProps {
  topPrimary: string
  topSecondary: string
  basePattern: string
  baseBg: string
  onTopPrimaryChange: (hex: string) => void
  onTopSecondaryChange: (hex: string) => void
  onBasePatternChange: (hex: string) => void
  onBaseBgChange: (hex: string) => void
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
}: ColorPickerPanelProps) {
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
        🎨 颜色配置
      </h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
        }}
      >
        <div>
          <div
            style={{
              font: 'var(--md-sys-typescale-label-large)',
              color: 'var(--md-sys-color-on-surface)',
              marginBottom: '12px',
              padding: '6px 10px',
              background: 'var(--md-sys-color-surface-container)',
              borderRadius: '6px',
            }}
          >
            板面 Topsheet
          </div>
          <ColorItem
            label="板面背景"
            color={topPrimary}
            onChange={onTopPrimaryChange}
          />
          <ColorItem
            label="板面 logo"
            color={topSecondary}
            onChange={onTopSecondaryChange}
          />
        </div>
        <div>
          <div
            style={{
              font: 'var(--md-sys-typescale-label-large)',
              color: 'var(--md-sys-color-on-surface)',
              marginBottom: '12px',
              padding: '6px 10px',
              background: 'var(--md-sys-color-surface-container)',
              borderRadius: '6px',
            }}
          >
            板底 Base
          </div>
          <ColorItem
            label="板底 logo"
            color={basePattern}
            onChange={onBasePatternChange}
          />
          <ColorItem
            label="板底背景"
            color={baseBg}
            onChange={onBaseBgChange}
          />
        </div>
      </div>
    </div>
  )
}
