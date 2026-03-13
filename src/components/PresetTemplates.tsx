import { hexToRgbString } from '../utils'
import type { ColorScheme } from '../types'
import { PRESET_SCHEMES } from '../presets'

interface PresetTemplatesProps {
  activeSchemeId: string | null
  onSelect: (scheme: ColorScheme) => void
}

export default function PresetTemplates({
  activeSchemeId,
  onSelect,
}: PresetTemplatesProps) {
  return (
    <div>
      <h3
        style={{
          fontSize: '16px',
          fontWeight: 700,
          color: '#333',
          marginBottom: '12px',
          borderBottom: '2px solid #e8dcc8',
          paddingBottom: '8px',
        }}
      >
        🎯 预设配色
      </h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
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
                borderRadius: '10px',
                background: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
                border: isActive ? '2px solid #7c6f5b' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isActive
                  ? '0 4px 12px rgba(124,111,91,0.2)'
                  : '0 2px 6px rgba(0,0,0,0.06)',
              }}
              onMouseEnter={(e) => {
                if (!isActive)
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
              }}
              onMouseLeave={(e) => {
                if (!isActive)
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.06)'
              }}
            >
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#444',
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
                      border: '2px solid rgba(0,0,0,0.1)',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    }}
                  />
                ))}
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '2px',
                  fontSize: '9px',
                  fontFamily: 'monospace',
                  color: '#999',
                  textAlign: 'center',
                }}
              >
                <span>{hexToRgbString(scheme.topPrimary)}</span>
                <span>{hexToRgbString(scheme.topSecondary)}</span>
                <span>{hexToRgbString(scheme.basePattern)}</span>
                <span>{hexToRgbString(scheme.baseBg)}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
