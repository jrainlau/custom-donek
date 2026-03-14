import { useState, useCallback, useEffect, useRef } from 'react'
import SvgPreview from './components/SvgPreview'
import ColorPickerPanel from './components/ColorPickerPanel'
import PresetTemplates from './components/PresetTemplates'
import UserSchemes from './components/UserSchemes'
import ExportCanvas from './components/ExportCanvas'
import { DEFAULT_SCHEME } from './presets'
import type { ColorScheme } from './types'
import type { M3ColorResult } from './m3color'
import { generateM3Palette } from './m3color'

// 导入 SVG 原始文本
import topsheetSvgRaw from './assets/Topsheet.svg?raw'
import baseSvgRaw from './assets/Base.svg?raw'

/** 自定义 hook：监听媒体查询 */
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mql = window.matchMedia(query)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [query])
  return matches
}

function App() {
  // header 和预览区高度动态获取
  const headerRef = useRef<HTMLElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const placeholderRef = useRef<HTMLDivElement>(null)
  const [headerHeight, setHeaderHeight] = useState(0)
  const [previewHeight, setPreviewHeight] = useState(0)
  // 桌面端：占位 div 的位置信息，用于 fixed 预览区对齐
  const [placeholderRect, setPlaceholderRect] = useState<{ left: number; width: number } | null>(null)

  useEffect(() => {
    const headerEl = headerRef.current
    const previewEl = previewRef.current
    const placeholderEl = placeholderRef.current
    const update = () => {
      if (headerEl) setHeaderHeight(headerEl.offsetHeight)
      if (previewEl) setPreviewHeight(previewEl.offsetHeight)
      if (placeholderEl) {
        const rect = placeholderEl.getBoundingClientRect()
        setPlaceholderRect({ left: rect.left, width: rect.width })
      }
    }
    update()
    const ro = new ResizeObserver(() => update())
    if (headerEl) ro.observe(headerEl)
    if (previewEl) ro.observe(previewEl)
    if (placeholderEl) ro.observe(placeholderEl)
    // 窗口滚动不会影响 fixed 元素位置，但 resize 会改变占位 div 的位置
    window.addEventListener('resize', update)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [])

  // 4 色状态
  const [topPrimary, setTopPrimary] = useState(DEFAULT_SCHEME.topPrimary)
  const [topSecondary, setTopSecondary] = useState(DEFAULT_SCHEME.topSecondary)
  const [basePattern, setBasePattern] = useState(DEFAULT_SCHEME.basePattern)
  const [baseBg, setBaseBg] = useState(DEFAULT_SCHEME.baseBg)

  // 当前选中的预设方案 ID
  const [activeSchemeId, setActiveSchemeId] = useState<string | null>(
    DEFAULT_SCHEME.id
  )

  // 应用配色方案
  const applyScheme = useCallback((scheme: ColorScheme) => {
    setTopPrimary(scheme.topPrimary)
    setTopSecondary(scheme.topSecondary)
    setBasePattern(scheme.basePattern)
    setBaseBg(scheme.baseBg)
    setActiveSchemeId(scheme.id)
  }, [])

  // 当用户手动改色时，清除预设选中态
  const handleTopPrimaryChange = useCallback((hex: string) => {
    setTopPrimary(hex)
    setActiveSchemeId(null)
  }, [])
  const handleTopSecondaryChange = useCallback((hex: string) => {
    setTopSecondary(hex)
    setActiveSchemeId(null)
  }, [])
  const handleBasePatternChange = useCallback((hex: string) => {
    setBasePattern(hex)
    setActiveSchemeId(null)
  }, [])
  const handleBaseBgChange = useCallback((hex: string) => {
    setBaseBg(hex)
    setActiveSchemeId(null)
  }, [])

  // === 种子颜色状态（原 SmartPalette 逻辑迁移） ===
  const [seedColor, setSeedColor] = useState('#6750A4')
  const [showSeedPicker, setShowSeedPicker] = useState(false)
  const [seedError, setSeedError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 种子颜色变化时防抖智能配色
  const handleSeedColorChange = useCallback(
    (hex: string) => {
      setSeedColor(hex)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        const result = generateM3Palette(hex)
        if (result) {
          setSeedError(null)
          setTopPrimary(result.topPrimary)
          setTopSecondary(result.topSecondary)
          setBasePattern(result.basePattern)
          setBaseBg(result.baseBg)
          setActiveSchemeId(null)
        } else {
          setSeedError('配色生成失败，请尝试其他颜色')
        }
      }, 150)
    },
    []
  )

  // 手动触发智能配色
  const handleGenerate = useCallback(() => {
    const result = generateM3Palette(seedColor)
    if (result) {
      setSeedError(null)
      setTopPrimary(result.topPrimary)
      setTopSecondary(result.topSecondary)
      setBasePattern(result.basePattern)
      setBaseBg(result.baseBg)
      setActiveSchemeId(null)
    } else {
      setSeedError('配色生成失败，请尝试其他颜色')
    }
  }, [seedColor])

  const handleToggleSeedPicker = useCallback(() => {
    setShowSeedPicker((prev) => !prev)
  }, [])

  // 清理防抖定时器
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  // 移动端检测
  const isMobile = useMediaQuery('(max-width: 768px)')

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--md-sys-color-surface)',
      }}
    >
      {/* 顶部标题栏 */}
      {/* M3 Top App Bar */}
      <header
        ref={headerRef}
        style={{
          background: 'var(--md-sys-color-surface)',
          paddingTop: `calc(${isMobile ? '12px' : '16px'} + env(safe-area-inset-top, 0px))`,
          paddingRight: isMobile ? '16px' : '24px',
          paddingBottom: isMobile ? '12px' : '16px',
          paddingLeft: isMobile ? '16px' : '24px',
          color: 'var(--md-sys-color-on-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          boxShadow: 'var(--md-sys-elevation-level2)',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div>
            <h1
              style={{
                margin: 0,
                font: 'var(--md-sys-typescale-title-large)',
                letterSpacing: '1px',
                color: 'var(--md-sys-color-primary)',
              }}
            >
              DONEK
            </h1>
            <p
              style={{
                margin: '2px 0 0',
                font: 'var(--md-sys-typescale-body-small)',
                color: 'var(--md-sys-color-on-surface-variant)',
              }}
            >
              滑雪板配色定制
            </p>
          </div>
          {/* 导出按钮（紧跟标题右侧） */}
          <ExportCanvas
            topPrimary={topPrimary}
            topSecondary={topSecondary}
            basePattern={basePattern}
            baseBg={baseBg}
            topsheetSvg={topsheetSvgRaw}
            baseSvg={baseSvgRaw}
            isMobile={isMobile}
          />
        </div>
      </header>

      {/* 主体区域 */}
      <div
        style={{
          maxWidth: isMobile ? '100%' : '1400px',
          margin: '0 auto',
          padding: isMobile ? '0' : '24px 24px',
          display: isMobile ? 'block' : 'grid',
          gridTemplateColumns: isMobile ? undefined : '2fr 3fr',
          gap: isMobile ? '0' : '24px',
          alignItems: 'start',
          width: '100%',
          boxSizing: 'border-box' as const,
          paddingTop: isMobile ? '0' : `${headerHeight + 24}px`,
        }}
      >
        {/* ========== 预览区 ========== */}
        {/* 桌面端：占位 div，为 grid 左列保留空间，同时提供位置信息给 fixed 预览区 */}
        {!isMobile && (
          <div
            ref={placeholderRef}
            style={{
              height: `calc(100dvh - ${headerHeight + 48}px)`,
              position: 'sticky',
              top: headerHeight + 24,
            }}
          />
        )}
        {/* fixed 预览内容 */}
        <div
          ref={previewRef}
          style={{
            position: 'fixed' as const,
            zIndex: 50,
            boxSizing: 'border-box' as const,
            boxShadow: 'var(--md-sys-elevation-level1)',
            borderRadius: isMobile ? '0' : 'var(--md-sys-shape-corner-large)',
            ...(isMobile
              ? {
                  top: headerHeight,
                  left: 0,
                  right: 0,
                  background: 'var(--md-sys-color-surface)',
                  padding: '8px 16px',
                  overflow: 'hidden' as const,
                }
              : {
                  top: headerHeight + 24,
                  left: placeholderRect ? placeholderRect.left : 0,
                  width: placeholderRect ? placeholderRect.width : 'auto',
                  height: `calc(100dvh - ${headerHeight + 48}px)`,
                }),
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: '12px',
              justifyContent: 'center',
              alignItems: 'center',
              padding: isMobile ? '4px 0' : '16px',
              background: isMobile ? 'transparent' : 'var(--md-sys-color-surface-container-low)',
              borderRadius: isMobile ? '0' : 'var(--md-sys-shape-corner-large)',
              boxShadow: 'none',
              height: isMobile ? 'auto' : '100%',
              boxSizing: 'border-box',
              overflow: isMobile ? 'hidden' : undefined,
            }}
          >
            <SvgPreview
              svgRaw={topsheetSvgRaw}
              primaryColor={topPrimary}
              secondaryColor={topSecondary}
              primaryClass="color-primary"
              secondaryClass="color-secondary"
              label={isMobile ? undefined : "板面 Topsheet"}
              compact={isMobile}
              rotation={isMobile ? -90 : 0}
            />
            <SvgPreview
              svgRaw={baseSvgRaw}
              primaryColor={basePattern}
              secondaryColor={baseBg}
              primaryClass="color-pattern"
              secondaryClass="color-bg"
              label={isMobile ? undefined : "板底 Base"}
              compact={isMobile}
              rotation={isMobile ? 90 : 0}
            />
          </div>
        </div>

        {/* ========== 功能区 ========== */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: isMobile ? '12px' : '24px',
            padding: isMobile ? '16px' : '0',
            ...(isMobile
              ? { marginTop: headerHeight + previewHeight }
              : { gridColumnStart: 2 }),
          }}
        >
          {/* 颜色配置面板（含种子颜色 + 拖拽排列） */}
          <div
            style={{
              background: 'var(--md-sys-color-surface-container-low)',
              borderRadius: 'var(--md-sys-shape-corner-large)',
              padding: '20px',
              boxShadow: 'var(--md-sys-elevation-level1)',
            }}
          >
            <ColorPickerPanel
              topPrimary={topPrimary}
              topSecondary={topSecondary}
              basePattern={basePattern}
              baseBg={baseBg}
              onTopPrimaryChange={handleTopPrimaryChange}
              onTopSecondaryChange={handleTopSecondaryChange}
              onBasePatternChange={handleBasePatternChange}
              onBaseBgChange={handleBaseBgChange}
              seedColor={seedColor}
              onSeedColorChange={handleSeedColorChange}
              onGenerate={handleGenerate}
              showSeedPicker={showSeedPicker}
              onToggleSeedPicker={handleToggleSeedPicker}
              error={seedError}
            />
          </div>

          {/* 预设配色模板 */}
          <div
            style={{
              background: 'var(--md-sys-color-surface-container-low)',
              borderRadius: 'var(--md-sys-shape-corner-large)',
              padding: '20px',
              boxShadow: 'var(--md-sys-elevation-level1)',
            }}
          >
            <PresetTemplates
              activeSchemeId={activeSchemeId}
              onSelect={applyScheme}
              isMobile={isMobile}
            />
          </div>

          {/* 用户自定义配色 */}
          <div
            style={{
              background: 'var(--md-sys-color-surface-container-low)',
              borderRadius: 'var(--md-sys-shape-corner-large)',
              padding: '20px',
              boxShadow: 'var(--md-sys-elevation-level1)',
            }}
          >
            <UserSchemes
              currentColors={{ topPrimary, topSecondary, basePattern, baseBg }}
              onSelect={applyScheme}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
