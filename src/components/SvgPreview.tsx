import { useRef, useEffect, useMemo } from 'react'

interface SvgPreviewProps {
  /** SVG 原始文本 */
  svgRaw: string
  /** 主色 (HEX) */
  primaryColor: string
  /** 副色 (HEX) */
  secondaryColor: string
  /** SVG 中主色的 CSS class 名 */
  primaryClass: string
  /** SVG 中副色的 CSS class 名 */
  secondaryClass: string
  /** 标签文本 */
  label?: string
}

export default function SvgPreview({
  svgRaw,
  primaryColor,
  secondaryColor,
  primaryClass,
  secondaryClass,
  label,
}: SvgPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // 为每个实例生成唯一 ID，避免多个 SVG 之间 style 冲突
  const instanceId = useMemo(
    () => 'svg-' + Math.random().toString(36).slice(2, 9),
    []
  )

  // 处理 SVG 文本：为 class 添加实例前缀以隔离样式
  const processedSvg = useMemo(() => {
    let svg = svgRaw
    // 移除 XML 声明
    svg = svg.replace(/<\?xml[^?]*\?>\s*/g, '')
    // 为 SVG 标签添加唯一 ID，并确保 SVG 自适应容器
    svg = svg.replace(
      '<svg',
      `<svg id="${instanceId}" style="width:100%;height:auto;display:block;"`
    )
    // 将内部固定 id 替换为唯一 id，避免多实例 clipPath 冲突
    svg = svg.replace(/id="board-outline"/g, `id="board-outline-${instanceId}"`)
    svg = svg.replace(/url\(#board-outline\)/g, `url(#board-outline-${instanceId})`)
    return svg
  }, [svgRaw, instanceId])

  // 当颜色变化时，直接操作 DOM 修改 style 标签中的颜色
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const svgEl = container.querySelector('svg')
    if (!svgEl) return

    const styleEl = svgEl.querySelector('style')
    if (!styleEl) return

    // 构建新的 style 内容
    let styleText = styleEl.textContent || ''

    // 替换 primaryClass 的 fill
    const primaryRegex = new RegExp(
      `\\.${primaryClass}\\s*\\{[^}]*\\}`,
      'g'
    )
    styleText = styleText.replace(
      primaryRegex,
      `.${primaryClass} { fill: ${primaryColor}; }`
    )

    // 替换 secondaryClass 的 fill
    const secondaryRegex = new RegExp(
      `\\.${secondaryClass}\\s*\\{[^}]*\\}`,
      'g'
    )
    styleText = styleText.replace(
      secondaryRegex,
      `.${secondaryClass} { fill: ${secondaryColor}; }`
    )

    styleEl.textContent = styleText
  }, [primaryColor, secondaryColor, primaryClass, secondaryClass])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        flex: 1,
        minWidth: 0,
      }}
    >
      {label && (
        <span
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#555',
            letterSpacing: '0.5px',
          }}
        >
          {label}
        </span>
      )}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          borderRadius: '12px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          background: '#fff',
          padding: '8px',
          transition: 'box-shadow 0.2s ease',
          overflow: 'visible',
        }}
        dangerouslySetInnerHTML={{ __html: processedSvg }}
      />
    </div>
  )
}
