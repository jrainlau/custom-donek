import {
  argbFromHex,
  hexFromArgb,
  themeFromSourceColor,
} from '@material/material-color-utilities'

/**
 * M3 智能配色生成结果
 */
export interface M3ColorResult {
  /** 板面主体色 (HEX) */
  topPrimary: string
  /** 板面细节色 (HEX) */
  topSecondary: string
  /** 板底图案色 (HEX) */
  basePattern: string
  /** 板底背景色 (HEX) */
  baseBg: string
}

/**
 * 从种子颜色生成 M3 配色方案
 *
 * 使用 Google Material Design 3 的色彩算法，从单个种子颜色自动生成
 * 4 个和谐的配套色，分别用于板面和板底的主体色与背景色。
 *
 * @param seedHex - 种子颜色的 HEX 值，如 "#6750A4"
 * @returns M3ColorResult 包含 4 个 HEX 颜色值，失败时返回 null
 */
export function generateM3Palette(seedHex: string): M3ColorResult | null {
  try {
    // 将 HEX 转为 ARGB 整数（M3 库内部格式）
    const sourceArgb = argbFromHex(seedHex)

    // 生成完整的 M3 色彩主题
    const theme = themeFromSourceColor(sourceArgb)

    // 从亮色方案中提取 4 个代表性颜色
    const lightScheme = theme.schemes.light

    // primary: 主色调，用于板面主体色
    const topPrimary = hexFromArgb(lightScheme.primary)
    // onPrimary: 主色调上的前景色，用于板面细节色
    const topSecondary = hexFromArgb(lightScheme.onPrimary)
    // primaryContainer: 主色调容器色，用于板底背景色
    const baseBg = hexFromArgb(lightScheme.primaryContainer)
    // onPrimaryContainer: 容器上的前景色，用于板底图案色
    const basePattern = hexFromArgb(lightScheme.onPrimaryContainer)

    return {
      topPrimary,
      topSecondary,
      basePattern,
      baseBg,
    }
  } catch (error) {
    console.error('[M3 配色] 生成失败:', error)
    return null
  }
}

/**
 * 从种子颜色生成暗色 M3 配色方案
 *
 * @param seedHex - 种子颜色的 HEX 值
 * @returns M3ColorResult 包含 4 个 HEX 颜色值，失败时返回 null
 */
export function generateM3PaletteDark(seedHex: string): M3ColorResult | null {
  try {
    const sourceArgb = argbFromHex(seedHex)
    const theme = themeFromSourceColor(sourceArgb)
    const darkScheme = theme.schemes.dark

    const topPrimary = hexFromArgb(darkScheme.primary)
    const topSecondary = hexFromArgb(darkScheme.onPrimary)
    const baseBg = hexFromArgb(darkScheme.primaryContainer)
    const basePattern = hexFromArgb(darkScheme.onPrimaryContainer)

    return {
      topPrimary,
      topSecondary,
      basePattern,
      baseBg,
    }
  } catch (error) {
    console.error('[M3 配色] 暗色方案生成失败:', error)
    return null
  }
}
