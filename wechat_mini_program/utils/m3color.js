/**
 * M3 智能配色生成（微信小程序版）
 *
 * 由于 @material/material-color-utilities 依赖浏览器/Node 环境，
 * 这里实现一个纯 JS 的 HCT 色彩空间近似算法，
 * 从种子颜色生成 primary、onPrimary、primaryContainer、onPrimaryContainer 四个和谐色。
 */

/**
 * HEX 转 RGB
 * @param {string} hex
 * @returns {{ r: number, g: number, b: number }}
 */
function hexToRgb(hex) {
  var cleaned = hex.replace('#', '')
  var bigint = parseInt(cleaned, 16)
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  }
}

/**
 * RGB 转 HEX
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @returns {string}
 */
function rgbToHex(r, g, b) {
  return (
    '#' +
    [r, g, b]
      .map(function (v) {
        var hex = Math.max(0, Math.min(255, Math.round(v))).toString(16)
        return hex.length === 1 ? '0' + hex : hex
      })
      .join('')
  )
}

/**
 * RGB 转 HSL
 * @param {number} r 0-255
 * @param {number} g 0-255
 * @param {number} b 0-255
 * @returns {{ h: number, s: number, l: number }} h:0-360, s:0-1, l:0-1
 */
function rgbToHsl(r, g, b) {
  r /= 255
  g /= 255
  b /= 255
  var max = Math.max(r, g, b)
  var min = Math.min(r, g, b)
  var h = 0
  var s = 0
  var l = (max + min) / 2

  if (max !== min) {
    var d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    if (max === r) {
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6
    } else if (max === g) {
      h = ((b - r) / d + 2) / 6
    } else {
      h = ((r - g) / d + 4) / 6
    }
  }

  return { h: h * 360, s: s, l: l }
}

function hue2rgb(p, q, t) {
  if (t < 0) t += 1
  if (t > 1) t -= 1
  if (t < 1 / 6) return p + (q - p) * 6 * t
  if (t < 1 / 2) return q
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
  return p
}

/**
 * HSL 转 RGB
 * @param {number} h 0-360
 * @param {number} s 0-1
 * @param {number} l 0-1
 * @returns {{ r: number, g: number, b: number }} 0-255
 */
function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360
  h /= 360

  var r, g, b

  if (s === 0) {
    r = g = b = l
  } else {
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s
    var p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  }
}

/**
 * 计算相对亮度 (sRGB)
 * @param {string} hex
 * @returns {number}
 */
function getRelativeLuminance(hex) {
  function toLinear(c) {
    c /= 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  }
  var rgb = hexToRgb(hex)
  var r = toLinear(rgb.r)
  var g = toLinear(rgb.g)
  var b = toLinear(rgb.b)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * 计算对比度
 * @param {string} hex1
 * @param {string} hex2
 * @returns {number}
 */
function getContrastRatio(hex1, hex2) {
  var l1 = getRelativeLuminance(hex1)
  var l2 = getRelativeLuminance(hex2)
  var lighter = Math.max(l1, l2)
  var darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * 生成与主色对比明显的动态对比色
 * @param {string} primaryHex
 * @returns {string}
 */
function generateContrastColor(primaryHex) {
  var rgb = hexToRgb(primaryHex)
  var hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  var targetL, targetS

  if (hsl.l <= 0.5) {
    targetL = 0.85
    targetS = Math.min(1, hsl.s * 0.7 + 0.1)
  } else {
    targetL = 0.18
    targetS = Math.min(1, hsl.s * 0.9 + 0.15)
  }

  var resultRgb = hslToRgb(hsl.h, targetS, targetL)
  var result = rgbToHex(resultRgb.r, resultRgb.g, resultRgb.b)
  var ratio = getContrastRatio(primaryHex, result)

  var attempts = 0
  while (ratio < 3 && attempts < 20) {
    if (hsl.l <= 0.5) {
      targetL = Math.min(1, targetL + 0.03)
    } else {
      targetL = Math.max(0, targetL - 0.03)
    }
    resultRgb = hslToRgb(hsl.h, targetS, targetL)
    result = rgbToHex(resultRgb.r, resultRgb.g, resultRgb.b)
    ratio = getContrastRatio(primaryHex, result)
    attempts++
  }

  return result
}

/**
 * 从种子颜色生成 M3 风格的配色方案
 *
 * 算法原理：
 * 1. 将种子颜色转为 HSL
 * 2. primary: 保持色相，饱和度适当提升，亮度 40%（深色主调）
 * 3. onPrimary: 白色或接近白色（用于主色上的文字/图标）
 * 4. primaryContainer: 保持色相，低饱和度，高亮度 85%（浅色容器）
 * 5. onPrimaryContainer: 保持色相，高饱和度，低亮度 15%（容器上的深色文字）
 *
 * @param {string} seedHex - 种子颜色的 HEX 值
 * @returns {object|null} 包含 topPrimary, topSecondary, basePattern, baseBg
 */
function generateM3Palette(seedHex) {
  try {
    var rgb = hexToRgb(seedHex)
    var hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
    var h = hsl.h
    var s = hsl.s

    // primary: 中等亮度，较高饱和度
    var primaryS = Math.min(1, s * 1.1 + 0.1)
    var primaryRgb = hslToRgb(h, primaryS, 0.40)
    var topPrimary = rgbToHex(primaryRgb.r, primaryRgb.g, primaryRgb.b)

    // 动态对比色，用于板面 logo（替代原来的白色硬编码）
    var topSecondary = generateContrastColor(topPrimary)

    // primaryContainer: 高亮度，低饱和度的浅色容器
    var containerS = Math.min(1, s * 0.6 + 0.05)
    var containerRgb = hslToRgb(h, containerS, 0.85)
    var baseBg = rgbToHex(containerRgb.r, containerRgb.g, containerRgb.b)

    // onPrimaryContainer: 低亮度，高饱和度的深色
    var onContainerS = Math.min(1, s * 0.8 + 0.15)
    var onContainerRgb = hslToRgb(h, onContainerS, 0.18)
    var basePattern = rgbToHex(onContainerRgb.r, onContainerRgb.g, onContainerRgb.b)

    return {
      topPrimary: topPrimary,
      topSecondary: topSecondary,
      basePattern: basePattern,
      baseBg: baseBg,
    }
  } catch (error) {
    console.error('[M3 配色] 生成失败:', error)
    return null
  }
}

module.exports = {
  generateM3Palette: generateM3Palette,
}
