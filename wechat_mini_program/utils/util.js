/**
 * HEX 转 RGB 对象
 * @param {string} hex - 如 "#D34937"
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
 * RGB 对象转 HEX
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
 * 格式化为 RGB 显示文本
 * @param {string} hex - 如 "#D34937"
 * @returns {string} 如 "211,73,55"
 */
function hexToRgbString(hex) {
  var rgb = hexToRgb(hex)
  return rgb.r + ',' + rgb.g + ',' + rgb.b
}

/**
 * 解析 RGB 字符串为 HEX
 * @param {string} rgbStr - 如 "RGB(211, 73, 55)" 或 "211, 73, 55"
 * @returns {string|null}
 */
function parseRgbString(rgbStr) {
  var match = rgbStr.match(/(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/)
  if (!match) return null
  var r = parseInt(match[1], 10)
  var g = parseInt(match[2], 10)
  var b = parseInt(match[3], 10)
  if (r > 255 || g > 255 || b > 255) return null
  return rgbToHex(r, g, b)
}

/**
 * 基于背景色亮度计算对比文字色
 * @param {string} hex
 * @returns {string}
 */
function getContrastColor(hex) {
  var r = parseInt(hex.slice(1, 3), 16)
  var g = parseInt(hex.slice(3, 5), 16)
  var b = parseInt(hex.slice(5, 7), 16)
  var luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? '#333333' : '#ffffff'
}

/**
 * 复制文本到剪贴板（微信小程序版）
 * @param {string} text
 */
function copyToClipboard(text) {
  wx.setClipboardData({
    data: text,
    success: function () {
      // 小程序自动会弹出"内容已复制"提示
    },
  })
}

/**
 * Base64 编码（微信小程序环境兼容实现）
 * @param {string} str
 * @returns {string}
 */
function base64Encode(str) {
  // 手动将字符串编码为 UTF-8 字节数组
  var bytes = []
  for (var i = 0; i < str.length; i++) {
    var code = str.charCodeAt(i)
    if (code < 0x80) {
      bytes.push(code)
    } else if (code < 0x800) {
      bytes.push(0xC0 | (code >> 6))
      bytes.push(0x80 | (code & 0x3F))
    } else if (code < 0xD800 || code >= 0xE000) {
      bytes.push(0xE0 | (code >> 12))
      bytes.push(0x80 | ((code >> 6) & 0x3F))
      bytes.push(0x80 | (code & 0x3F))
    } else {
      // 代理对（surrogate pair）
      i++
      var cp = 0x10000 + (((code & 0x3FF) << 10) | (str.charCodeAt(i) & 0x3FF))
      bytes.push(0xF0 | (cp >> 18))
      bytes.push(0x80 | ((cp >> 12) & 0x3F))
      bytes.push(0x80 | ((cp >> 6) & 0x3F))
      bytes.push(0x80 | (cp & 0x3F))
    }
  }

  // 优先使用 wx.arrayBufferToBase64，回退使用纯 JS 实现
  if (typeof wx !== 'undefined' && wx.arrayBufferToBase64) {
    var buffer = new Uint8Array(bytes).buffer
    return wx.arrayBufferToBase64(buffer)
  }

  // 纯 JS base64 编码回退
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  var result = ''
  var len = bytes.length
  for (var idx = 0; idx < len; idx += 3) {
    var b0 = bytes[idx]
    var b1 = idx + 1 < len ? bytes[idx + 1] : 0
    var b2 = idx + 2 < len ? bytes[idx + 2] : 0
    result += chars[b0 >> 2]
    result += chars[((b0 & 3) << 4) | (b1 >> 4)]
    result += idx + 1 < len ? chars[((b1 & 15) << 2) | (b2 >> 6)] : '='
    result += idx + 2 < len ? chars[b2 & 63] : '='
  }
  return result
}

module.exports = {
  hexToRgb: hexToRgb,
  rgbToHex: rgbToHex,
  hexToRgbString: hexToRgbString,
  parseRgbString: parseRgbString,
  getContrastColor: getContrastColor,
  copyToClipboard: copyToClipboard,
  base64Encode: base64Encode,
}
