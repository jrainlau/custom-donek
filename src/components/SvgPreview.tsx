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
  /** 紧凑模式（移动端），SVG 以宽度为约束 */
  compact?: boolean
  /** compact 模式下的 CSS 旋转角度（单位：度） */
  rotation?: number
}

export default function SvgPreview({
  svgRaw,
  primaryColor,
  secondaryColor,
  primaryClass,
  secondaryClass,
  label,
  compact = false,
  rotation = 0,
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
    // 移除注释
    svg = svg.replace(/<!--[\s\S]*?-->\s*/g, '')

    // 提取原始 width/height 用于构建 viewBox（如缺失）
    const wMatch = svg.match(/\bwidth="(\d+)"/)
    const hMatch = svg.match(/\bheight="(\d+)"/)
    const hasViewBox = /viewBox/.test(svg)

    // 移除 SVG 标签上的固定 width/height，让 CSS 控制尺寸
    svg = svg.replace(/(<svg[^>]*?)\s+width="[^"]*"/g, '$1')
    svg = svg.replace(/(<svg[^>]*?)\s+height="[^"]*"/g, '$1')

    // 如果没有 viewBox，根据原始 width/height 补充
    if (!hasViewBox && wMatch && hMatch) {
      svg = svg.replace(
        '<svg',
        `<svg viewBox="0 0 ${wMatch[1]} ${hMatch[1]}"`
      )
    }

    // 添加唯一 ID 和自适应样式
    if (compact) {
      // compact 模式（移动端）：SVG 保持原始方向，旋转由父元素 CSS 完成
      svg = svg.replace(
        '<svg',
        `<svg id="${instanceId}" shape-rendering="geometricPrecision" style="width:100%;height:100%;display:block;"`
      )
    } else {
      // 普通模式：SVG 以高度为主约束
      svg = svg.replace(
        '<svg',
        `<svg id="${instanceId}" shape-rendering="geometricPrecision" style="width:auto;height:100%;max-width:100%;display:block;"`
      )
    }
    // 将内部固定 id 替换为唯一 id，避免多实例 clipPath 冲突
    svg = svg.replace(/id="board-outline"/g, `id="board-outline-${instanceId}"`)
    svg = svg.replace(/url\(#board-outline\)/g, `url(#board-outline-${instanceId})`)
    return svg
  }, [svgRaw, instanceId, compact])

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

  // 解析 SVG 原始 viewBox 以计算宽高比（用于 compact 旋转布局）
  const svgAspect = useMemo(() => {
    const vbMatch = svgRaw.match(/viewBox=["']([^"']+)["']/)
    if (vbMatch) {
      const parts = vbMatch[1].split(/[\s,]+/).map(Number)
      if (parts.length === 4) {
        return { w: parts[2], h: parts[3] }
      }
    }
    const wMatch = svgRaw.match(/\bwidth="(\d+)"/)
    const hMatch = svgRaw.match(/\bheight="(\d+)"/)
    if (wMatch && hMatch) {
      return { w: Number(wMatch[1]), h: Number(hMatch[1]) }
    }
    return { w: 190, h: 1000 }
  }, [svgRaw])

  // compact 模式下旋转后：原始宽高互换，计算旋转后的宽高比
  // 原始 190×1000 旋转 90 度后视觉上变为 1000×190
  const isRotated = compact && rotation !== 0
  // 旋转后的容器：宽度撑满父级，高度 = 宽度 * (原始宽 / 原始高)
  // 例如原始 190×1000，旋转后视觉宽高比 = 1000:190 ≈ 5.26:1
  // 容器 aspect-ratio 设为旋转后的比例
  const rotatedAspect = isRotated ? `${svgAspect.h} / ${svgAspect.w}` : undefined

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: compact ? '4px' : '8px',
        flex: compact ? '0 0 auto' : '1 1 0',
        minWidth: 0,
        width: compact ? '100%' : undefined,
        height: compact ? 'auto' : '100%',
        minHeight: 0,
      }}
    >
      {label && (
        <span
          style={{
            font: 'var(--md-sys-typescale-label-large)',
            color: 'var(--md-sys-color-on-surface-variant)',
            letterSpacing: '0.5px',
            flexShrink: 0,
          }}
        >
          {label}
        </span>
      )}
      {isRotated ? (
        /* compact + rotation: 外层按旋转后视觉比例占位，内层宽高互换后旋转 */
        <div
          style={{
            width: '100%',
            aspectRatio: rotatedAspect,
            position: 'relative' as const,
            overflow: 'hidden',
          }}
        >
          <div
            ref={containerRef}
            style={{
              position: 'absolute' as const,
              left: '50%',
              top: '50%',
              /*
               * 内层旋转前的尺寸 = 外层的宽高互换：
               *   外层: width=W_outer, height=W_outer * (svgW/svgH)  (因为 aspect-ratio = svgH/svgW)
               *   内层旋转前: width 应等于外层 height, height 应等于外层 width
               *   内层 width  as % of 外层 width  = 外层 height / 外层 width  = svgW/svgH
               *   内层 height as % of 外层 height = 外层 width  / 外层 height = svgH/svgW
               */
              width: `${(svgAspect.w / svgAspect.h) * 100}%`,
              height: `${(svgAspect.h / svgAspect.w) * 100}%`,
              transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
              transformOrigin: 'center center',
            }}
            dangerouslySetInnerHTML={{ __html: processedSvg }}
          />
        </div>
      ) : (
        <div
          ref={containerRef}
          style={{
            flex: compact ? '0 0 auto' : '1 1 0',
            minHeight: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 'var(--md-sys-shape-corner-medium)',
            boxShadow: 'none',
            background: compact ? 'transparent' : 'var(--md-sys-color-surface-container-lowest)',
            padding: compact ? '0' : '8px',
            transition: 'box-shadow 0.2s ease',
            overflow: 'hidden',
            width: compact ? '100%' : 'fit-content',
            maxWidth: '100%',
            alignSelf: 'center',
          }}
          dangerouslySetInnerHTML={{ __html: processedSvg }}
        />
      )}
    </div>
  )
}
