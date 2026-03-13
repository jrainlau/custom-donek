import { useRef, useState, useCallback, useMemo } from 'react'
import { toPng } from 'html-to-image'
import { hexToRgbString } from '../utils'

interface ExportCanvasProps {
  topPrimary: string
  topSecondary: string
  basePattern: string
  baseBg: string
  topsheetSvg: string
  baseSvg: string
}

export default function ExportCanvas({
  topPrimary,
  topSecondary,
  basePattern,
  baseBg,
  topsheetSvg,
  baseSvg,
}: ExportCanvasProps) {
  const exportRef = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState(false)

  // 处理板面 SVG：替换颜色
  const processedTopsheet = useMemo(() => {
    let svg = topsheetSvg
      .replace(/<\?xml[^?]*\?>\s*/g, '')
      .replace(
        /\.color-primary\s*\{[^}]*\}/g,
        `.color-primary { fill: ${topPrimary}; }`
      )
      .replace(
        /\.color-secondary\s*\{[^}]*\}/g,
        `.color-secondary { fill: ${topSecondary}; }`
      )
    return svg
  }, [topsheetSvg, topPrimary, topSecondary])

  // 处理板底 SVG：替换颜色
  const processedBase = useMemo(() => {
    let svg = baseSvg
      .replace(/<\?xml[^?]*\?>\s*/g, '')
      .replace(
        /\.color-bg\s*\{[^}]*\}/g,
        `.color-bg { fill: ${baseBg}; }`
      )
      .replace(
        /\.color-pattern\s*\{[^}]*\}/g,
        `.color-pattern { fill: ${basePattern}; }`
      )
    // 为导出画布中的 clipPath id 添加唯一前缀，避免与预览区冲突
    svg = svg.replace(/id="board-outline"/g, 'id="board-outline-export"')
    svg = svg.replace(/url\(#board-outline\)/g, 'url(#board-outline-export)')
    return svg
  }, [baseSvg, basePattern, baseBg])

  const handleExport = useCallback(async () => {
    if (!exportRef.current || exporting) return
    setExporting(true)
    try {
      const dataUrl = await toPng(exportRef.current, {
        pixelRatio: 3,
        backgroundColor: '#FDF6EC',
      })
      const link = document.createElement('a')
      link.download = `donek-配色方案-${Date.now()}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('导出失败:', err)
      alert('导出失败，请重试')
    } finally {
      setExporting(false)
    }
  }, [exporting])

  const colors = [
    { label: '板面背景', hex: topPrimary },
    { label: '板面 logo', hex: topSecondary },
    { label: '板底 logo', hex: basePattern },
    { label: '板底背景', hex: baseBg },
  ]

  return (
    <div>
      {/* 导出按钮 */}
      <button
        onClick={handleExport}
        disabled={exporting}
        style={{
          width: '100%',
          padding: '12px 24px',
          borderRadius: '20px',
          border: 'none',
          background: exporting
            ? 'var(--md-sys-color-surface-container-highest)'
            : 'var(--md-sys-color-primary)',
          color: exporting ? 'var(--md-sys-color-on-surface-variant)' : 'var(--md-sys-color-on-primary)',
          font: 'var(--md-sys-typescale-label-large)',
          cursor: exporting ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s var(--md-sys-motion-easing-standard)',
          boxShadow: exporting ? 'none' : 'var(--md-sys-elevation-level1)',
          letterSpacing: '0.5px',
          position: 'relative',
          overflow: 'hidden',
        }}
        onMouseEnter={(e) => {
          if (!exporting) e.currentTarget.style.boxShadow = 'var(--md-sys-elevation-level2)'
        }}
        onMouseLeave={(e) => {
          if (!exporting) e.currentTarget.style.boxShadow = 'var(--md-sys-elevation-level1)'
        }}
      >
        {exporting ? '⏳ 正在导出...' : '📸 导出效果图 PNG'}
      </button>

      {/* 隐藏的导出画布区域 */}
      <div
        style={{
          position: 'absolute',
          left: '-9999px',
          top: 0,
        }}
      >
        <div
          ref={exportRef}
          style={{
            width: '1200px',
            padding: '60px',
            background: '#FDF6EC',
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          {/* 标题 */}
          <div
            style={{
              textAlign: 'center',
              marginBottom: '40px',
            }}
          >
            <h1
              style={{
                fontSize: '36px',
                fontWeight: 800,
                color: '#333',
                margin: '0 0 8px',
                letterSpacing: '2px',
              }}
            >
              DONEK 滑雪板配色方案
            </h1>
            <p
              style={{
                fontSize: '14px',
                color: '#999',
                margin: 0,
              }}
            >
              Snowboard Color Customizer
            </p>
          </div>

          {/* SVG 预览区 */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              gap: '80px',
              marginBottom: '50px',
            }}
          >
            {/* 板面 */}
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#555',
                  marginBottom: '16px',
                }}
              >
                板面 Topsheet
              </div>
              <div
                style={{
                  background: '#fff',
                  borderRadius: '16px',
                  padding: '16px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  display: 'inline-block',
                }}
                dangerouslySetInnerHTML={{ __html: processedTopsheet }}
              />
            </div>
            {/* 板底 */}
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#555',
                  marginBottom: '16px',
                }}
              >
                板底 Base
              </div>
              <div
                style={{
                  background: '#fff',
                  borderRadius: '16px',
                  padding: '16px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  display: 'inline-block',
                }}
                dangerouslySetInnerHTML={{ __html: processedBase }}
              />
            </div>
          </div>

          {/* 配色信息 */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '32px',
            }}
          >
            {colors.map((c, i) => (
              <div
                key={i}
                style={{
                  textAlign: 'center',
                  flex: '0 0 auto',
                }}
              >
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    backgroundColor: c.hex,
                    margin: '0 auto 12px',
                    border: '3px solid rgba(0,0,0,0.1)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#555',
                    marginBottom: '4px',
                  }}
                >
                  {c.label}
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    color: '#888',
                  }}
                >
                  {hexToRgbString(c.hex)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
