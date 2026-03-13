/**
 * HEX 转 RGB 对象
 * @param hex - 如 "#D34937"
 * @returns { r, g, b }
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleaned = hex.replace('#', '')
  const bigint = parseInt(cleaned, 16)
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  }
}

/**
 * RGB 对象转 HEX
 * @param r - 红色通道 0-255
 * @param g - 绿色通道 0-255
 * @param b - 蓝色通道 0-255
 * @returns HEX 字符串如 "#D34937"
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((v) => {
        const hex = Math.max(0, Math.min(255, Math.round(v))).toString(16)
        return hex.length === 1 ? '0' + hex : hex
      })
      .join('')
  )
}

/**
 * 格式化为 RGB 显示文本
 * @param hex - 如 "#D34937"
 * @returns 如 "211,73,55"
 */
export function hexToRgbString(hex: string): string {
  const { r, g, b } = hexToRgb(hex)
  return `${r},${g},${b}`
}

/**
 * 解析 RGB 字符串为 HEX
 * @param rgbStr - 如 "RGB(211, 73, 55)" 或 "211, 73, 55"
 * @returns HEX 字符串或 null
 */
export function parseRgbString(rgbStr: string): string | null {
  const match = rgbStr.match(/(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/)
  if (!match) return null
  const r = parseInt(match[1], 10)
  const g = parseInt(match[2], 10)
  const b = parseInt(match[3], 10)
  if (r > 255 || g > 255 || b > 255) return null
  return rgbToHex(r, g, b)
}

/**
 * 复制文本到剪贴板
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // 降级方案
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-9999px'
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      return true
    } catch {
      return false
    } finally {
      document.body.removeChild(textArea)
    }
  }
}
