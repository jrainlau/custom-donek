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
                border: 'none',
                outline: isActive ? '2px solid var(--md-sys-color-primary)' : '1px solid var(--md-sys-color-outline-variant)',
                outlineOffset: isActive ? '2px' : '0px',
                boxShadow: isActive ? '0 0 12px 2px rgba(103, 80, 164, 0.45)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s var(--md-sys-motion-easing-standard)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '6px',
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
