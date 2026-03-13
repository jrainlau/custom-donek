import type { ColorScheme } from '../types'
import { PRESET_SCHEMES } from '../presets'

interface PresetTemplatesProps {
  activeSchemeId: string | null
  onSelect: (scheme: ColorScheme) => void
  isMobile?: boolean
}

export default function PresetTemplates({
  activeSchemeId,
  onSelect,
  isMobile = false,
}: PresetTemplatesProps) {
  return (
    <div>
      <h3
        style={{
          font: 'var(--md-sys-typescale-title-medium)',
          color: 'var(--md-sys-color-on-surface)',
          marginBottom: '12px',
          borderBottom: '1px solid var(--md-sys-color-outline-variant)',
          paddingBottom: '8px',
        }}
      >
        🎯 预设配色
      </h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '12px',
        }}
      >
        {PRESET_SCHEMES.map((scheme) => {
          const isActive = activeSchemeId === scheme.id
          return (
            <div
              key={scheme.id}
              onClick={() => onSelect(scheme)}
              style={{
                padding: '12px',
                borderRadius: 'var(--md-sys-shape-corner-medium)',
                background: isActive ? 'var(--md-sys-color-surface-container)' : 'var(--md-sys-color-surface-container-low)',
                border: isActive ? '2px solid var(--md-sys-color-primary)' : '1px solid var(--md-sys-color-outline-variant)',
                cursor: 'pointer',
                transition: 'all 0.2s var(--md-sys-motion-easing-standard)',
                boxShadow: isActive
                  ? 'var(--md-sys-elevation-level2)'
                  : 'var(--md-sys-elevation-level1)',
              }}
              onMouseEnter={(e) => {
                if (!isActive)
                  e.currentTarget.style.boxShadow = 'var(--md-sys-elevation-level2)'
              }}
              onMouseLeave={(e) => {
                if (!isActive)
                  e.currentTarget.style.boxShadow = 'var(--md-sys-elevation-level1)'
              }}
            >
              <div
                style={{
                  font: 'var(--md-sys-typescale-label-medium)',
                  color: 'var(--md-sys-color-on-surface)',
                  marginBottom: '8px',
                  textAlign: 'center',
                }}
              >
                {scheme.name}
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '6px',
                  marginBottom: '6px',
                }}
              >
                {[
                  scheme.topPrimary,
                  scheme.topSecondary,
                  scheme.basePattern,
                  scheme.baseBg,
                ].map((color, i) => (
                  <div
                    key={i}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: color,
                      border: '2px solid var(--md-sys-color-outline-variant)',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    }}
                  />
                ))}
              </div>

            </div>
          )
        })}
      </div>
    </div>
  )
}
