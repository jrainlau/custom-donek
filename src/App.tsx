import { useState, useCallback } from 'react'
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

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#FDF6EC',
        padding: '0 0 40px',
      }}
    >
      {/* 顶部标题栏 */}
      <header
        style={{
          background: 'linear-gradient(135deg, #7c6f5b, #a0926e)',
          padding: '20px 40px',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: '24px',
              fontWeight: 800,
              letterSpacing: '2px',
            }}
          >
            DONEK
          </h1>
          <p
            style={{
              margin: '4px 0 0',
              fontSize: '13px',
              opacity: 0.8,
              letterSpacing: '0.5px',
            }}
          >
            滑雪板配色定制 Snowboard Color Customizer
          </p>
        </div>
      </header>

      {/* 主体区域 — 左右分栏 */}
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '24px 32px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '32px',
          alignItems: 'start',
        }}
      >
        {/* ========== 左侧：SVG 预览区（sticky 固定，适配屏幕高度） ========== */}
        <div
          style={{
            position: 'sticky',
            top: '24px',
            height: 'calc(100vh - 120px)',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '20px',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '24px',
              background: 'rgba(255,255,255,0.5)',
              borderRadius: '16px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              height: '100%',
              boxSizing: 'border-box',
            }}
          >
            <SvgPreview
              svgRaw={topsheetSvgRaw}
              primaryColor={topPrimary}
              secondaryColor={topSecondary}
              primaryClass="color-primary"
              secondaryClass="color-secondary"
              label="板面 Topsheet"
            />
            <SvgPreview
              svgRaw={baseSvgRaw}
              primaryColor={basePattern}
              secondaryColor={baseBg}
              primaryClass="color-pattern"
              secondaryClass="color-bg"
              label="板底 Base"
            />
          </div>
        </div>

        {/* ========== 右侧：功能区（自然滚动） ========== */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          {/* 智能配色模块 */}
          <div
            style={{
              background: 'rgba(255,255,255,0.6)',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
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
              background: 'rgba(255,255,255,0.6)',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
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
              background: 'rgba(255,255,255,0.6)',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
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
              background: 'rgba(255,255,255,0.6)',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
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
              background: 'rgba(255,255,255,0.6)',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
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
