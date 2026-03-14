import {
  argbFromHex,
  hexFromArgb,
  themeFromSourceColor,
} from '@material/material-color-utilities'

/**
 * M3 智能配色生成结果
 */
export interface M3ColorResult {
  /** 板面背景 (HEX) */
  topPrimary: string
  /** 板面 logo (HEX) */
  topSecondary: string
  /** 板底 logo (HEX) */
  basePattern: string
  /** 板底背景 (HEX) */
  baseBg: string
}

// ========== 对比色算法辅助函数 ==========

/** HEX 转 HSL */
function hexToHsl(hex: string): { h: number; s: number; l: number } {
  let r = parseInt(hex.slice(1, 3), 16) / 255
  let g = parseInt(hex.slice(3, 5), 16) / 255
  let b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
    else if (max === g) h = ((b - r) / d + 2) / 6
    else h = ((r - g) / d + 4) / 6
  }
  return { h: h * 360, s, l }
}

/** HSL 转 HEX */
function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360 / 360
  let r: number, g: number, b: number
  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1/3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1/3)
  }
  const toHex = (v: number) => {
    const hex = Math.max(0, Math.min(255, Math.round(v * 255))).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }
  return '#' + toHex(r) + toHex(g) + toHex(b)
}

/** 计算相对亮度 (sRGB) */
function getRelativeLuminance(hex: string): number {
  const toLinear = (c: number) => {
    c /= 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  }
  const r = toLinear(parseInt(hex.slice(1, 3), 16))
  const g = toLinear(parseInt(hex.slice(3, 5), 16))
  const b = toLinear(parseInt(hex.slice(5, 7), 16))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** 计算对比度 */
function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getRelativeLuminance(hex1)
  const l2 = getRelativeLuminance(hex2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * 生成与主色对比明显的动态对比色
 * - 深色背景 → 浅色 logo（同色相、高亮度）
 * - 浅色背景 → 深色 logo（同色相、低亮度）
 * - 保证对比度 ≥ 3:1
 */
function generateContrastColor(primaryHex: string): string {
  const hsl = hexToHsl(primaryHex)
  let targetL: number
  let targetS: number

  if (hsl.l <= 0.5) {
    // 深色背景 → 浅色 logo
    targetL = 0.85
    targetS = Math.min(1, hsl.s * 0.7 + 0.1)
  } else {
    // 浅色背景 → 深色 logo
    targetL = 0.18
    targetS = Math.min(1, hsl.s * 0.9 + 0.15)
  }

  let result = hslToHex(hsl.h, targetS, targetL)
  let ratio = getContrastRatio(primaryHex, result)

  // 迭代调整亮度直到对比度 ≥ 3:1
  let attempts = 0
  while (ratio < 3 && attempts < 20) {
    if (hsl.l <= 0.5) {
      targetL = Math.min(1, targetL + 0.03)
    } else {
      targetL = Math.max(0, targetL - 0.03)
    }
    result = hslToHex(hsl.h, targetS, targetL)
    ratio = getContrastRatio(primaryHex, result)
    attempts++
  }

  return result
}

/**
 * 从种子颜色生成 M3 配色方案
 *
 * 使用 Google Material Design 3 的色彩算法，从单个种子颜色自动生成
 * 4 个和谐的配套色，分别用于板面和板底的背景与 logo。
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

    // primary: 主色调，用于板面背景
    const topPrimary = hexFromArgb(lightScheme.primary)
    // 动态对比色，用于板面 logo（替代原来的 onPrimary 白色）
    const topSecondary = generateContrastColor(topPrimary)
    // primaryContainer: 主色调容器色，用于板底背景
    const baseBg = hexFromArgb(lightScheme.primaryContainer)
    // onPrimaryContainer: 容器上的前景色，用于板底 logo
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
    // 动态对比色，用于板面 logo（替代原来的 onPrimary）
    const topSecondary = generateContrastColor(topPrimary)
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
