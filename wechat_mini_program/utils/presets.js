/** 10 套预设配色模板 */
var PRESET_SCHEMES = [
  {
    id: 'preset-9',
    name: '樱花粉雪',
    topPrimary: '#FF69B4',
    topSecondary: '#FFFFFF',
    basePattern: '#2E2E2E',
    baseBg: '#FF69B4',
  },
  {
    id: 'preset-1',
    name: '苹果肉桂',
    topPrimary: '#D34937',
    topSecondary: '#EBC267',
    basePattern: '#F2ECDC',
    baseBg: '#902C21',
  },
  {
    id: 'preset-2',
    name: '极地冰蓝',
    topPrimary: '#1A3A5C',
    topSecondary: '#A8D8EA',
    basePattern: '#E0F0FF',
    baseBg: '#0D2137',
  },
  {
    id: 'preset-3',
    name: '日落橘金',
    topPrimary: '#FF6B35',
    topSecondary: '#FFC857',
    basePattern: '#1A1A2E',
    baseBg: '#E84545',
  },
  {
    id: 'preset-4',
    name: '森林薄雾',
    topPrimary: '#2D5016',
    topSecondary: '#A8D08D',
    basePattern: '#F5F0E1',
    baseBg: '#1B3409',
  },
  {
    id: 'preset-5',
    name: '紫罗幻境',
    topPrimary: '#6A0DAD',
    topSecondary: '#D4A5FF',
    basePattern: '#1C1C2E',
    baseBg: '#9B59B6',
  },
  {
    id: 'preset-6',
    name: '珊瑚海滩',
    topPrimary: '#FF7F7F',
    topSecondary: '#FFD1DC',
    basePattern: '#2C3E50',
    baseBg: '#E74C3C',
  },
  {
    id: 'preset-7',
    name: '碳黑银灰',
    topPrimary: '#2C2C2C',
    topSecondary: '#C0C0C0',
    basePattern: '#F0F0F0',
    baseBg: '#1A1A1A',
  },
  {
    id: 'preset-8',
    name: '抹茶拿铁',
    topPrimary: '#7BA05B',
    topSecondary: '#F5E6CA',
    basePattern: '#3C2415',
    baseBg: '#A8C97F',
  },
  {
    id: 'preset-10',
    name: '烈焰赤金',
    topPrimary: '#B22222',
    topSecondary: '#FFD700',
    basePattern: '#0A0A0A',
    baseBg: '#DC143C',
  },
]

/** 默认配色（第一套预设） */
var DEFAULT_SCHEME = PRESET_SCHEMES[0]

module.exports = {
  PRESET_SCHEMES: PRESET_SCHEMES,
  DEFAULT_SCHEME: DEFAULT_SCHEME,
}
