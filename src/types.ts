/** 配色方案接口 */
export interface ColorScheme {
  id: string
  name: string
  /** 板面主体色 (HEX) */
  topPrimary: string
  /** 板面细节色 (HEX) */
  topSecondary: string
  /** 板底图案色 (HEX) */
  baseBg: string
  /** 板底背景色 (HEX) */
  basePattern: string
}

/** 用户保存的配色方案，继承 ColorScheme 并增加创建时间 */
export interface SavedColorScheme extends ColorScheme {
  createdAt: number
}
