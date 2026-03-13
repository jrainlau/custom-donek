/** 配色方案接口 */
export interface ColorScheme {
  id: string
  name: string
  /** 板面背景 (HEX) */
  topPrimary: string
  /** 板面 logo (HEX) */
  topSecondary: string
  /** 板底背景 (HEX) */
  baseBg: string
  /** 板底 logo (HEX) */
  basePattern: string
}

/** 用户保存的配色方案，继承 ColorScheme 并增加创建时间 */
export interface SavedColorScheme extends ColorScheme {
  createdAt: number
}
