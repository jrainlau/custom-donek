import { useState, useCallback, useEffect } from 'react'
import SvgPreview from './components/SvgPreview'
import ColorPickerPanel from './components/ColorPickerPanel'
import SmartPalette from './components/SmartPalette'
import PresetTemplates from './components/PresetTemplates'
import UserSchemes from './components/UserSchemes'
import ExportCanvas from './components/ExportCanvas'
import { DEFAULT_SCHEME } from './presets'
import type { ColorScheme } from './types'
import type { M3ColorResult } from './m3color'

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

  // 智能配色回调：批量更新 4 色
  const handleSmartColorsChange = useCallback((colors: M3ColorResult) => {
    setTopPrimary(colors.topPrimary)
    setTopSecondary(colors.topSecondary)
    setBasePattern(colors.basePattern)
    setBaseBg(colors.baseBg)
    setActiveSchemeId(null)
  }, [])

  // 移动端检测
  const isMobile = useMediaQuery('(max-width: 768px)')

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--md-sys-color-surface)',
        padding: '0 0 40px',
      }}
    >
      {/* 顶部标题栏 */}
      {/* M3 Top App Bar */}
      <header
        style={{
          background: 'var(--md-sys-color-surface)',
          padding: isMobile ? '12px 16px' : '16px 24px',
          color: 'var(--md-sys-color-on-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: 'var(--md-sys-elevation-level2)',
          position: 'relative',
          zIndex: 10,
        }}
      >
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
            滑雪板配色定制 Snowboard Color Customizer
          </p>
        </div>
      </header>

      {/* 主体区域 */}
      <div
        style={{
          maxWidth: isMobile ? '100%' : '1400px',
          margin: '0 auto',
          padding: isMobile ? '0' : '24px 24px',
          display: isMobile ? 'flex' : 'grid',
          flexDirection: isMobile ? 'column' : undefined,
          gridTemplateColumns: isMobile ? undefined : '2fr 3fr',
          gap: isMobile ? '0' : '24px',
          alignItems: 'start',
        }}
      >
        {/* ========== 预览区 ========== */}
        <div
          style={{
          ...(isMobile
              ? {
                  position: 'sticky' as const,
                  top: 0,
                  zIndex: 50,
                  background: 'var(--md-sys-color-surface)',
                  boxShadow: 'var(--md-sys-elevation-level2)',
                  padding: '8px 16px',
                  width: '100vw',
                  left: 0,
                  boxSizing: 'border-box' as const,
                  overflow: 'hidden' as const,
                }
              : {
                  position: 'sticky' as const,
                  top: '24px',
                  height: 'calc(100vh - 120px)',
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
              boxShadow: isMobile ? 'none' : 'var(--md-sys-elevation-level1)',
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
          }}
        >
          {/* 智能配色模块 */}
          <div
            style={{
              background: 'var(--md-sys-color-surface-container-low)',
              borderRadius: 'var(--md-sys-shape-corner-large)',
              padding: '20px',
              boxShadow: 'var(--md-sys-elevation-level1)',
            }}
          >
            <SmartPalette
              topPrimary={topPrimary}
              topSecondary={topSecondary}
              basePattern={basePattern}
              baseBg={baseBg}
              onColorsChange={handleSmartColorsChange}
            />
          </div>

          {/* 手动颜色配置面板 */}
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

          {/* 导出按钮 */}
          <div
            style={{
              background: 'var(--md-sys-color-surface-container-low)',
              borderRadius: 'var(--md-sys-shape-corner-large)',
              padding: '20px',
              boxShadow: 'var(--md-sys-elevation-level1)',
            }}
          >
            <ExportCanvas
              topPrimary={topPrimary}
              topSecondary={topSecondary}
              basePattern={basePattern}
              baseBg={baseBg}
              topsheetSvg={topsheetSvgRaw}
              baseSvg={baseSvgRaw}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
