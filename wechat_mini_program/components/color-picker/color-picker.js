/**
 * Canvas 拾色器组件
 * 使用 Canvas 2D API 实现色相条 + 饱和度/亮度面板
 */
Component({
  properties: {
    // 当前颜色 HEX 值
    color: {
      type: String,
      value: '#FF0000',
    },
  },

  data: {
    // 当前 HSV 值
    hue: 0,        // 0-360
    saturation: 1, // 0-1
    value: 1,      // 0-1
    // 面板和色相条尺寸
    panelWidth: 0,
    panelHeight: 0,
    hueBarWidth: 0,
    hueBarHeight: 0,
    // 指示器位置
    panelX: 0,
    panelY: 0,
    hueX: 0,
    // 是否已初始化
    initialized: false,
  },

  lifetimes: {
    attached: function () {
      var self = this
      // 延迟初始化，等组件渲染完成
      setTimeout(function () {
        self._initCanvas()
      }, 100)
    },
  },

  observers: {
    'color': function (color) {
      if (!this.data.initialized) return
      // 外部颜色变化时更新 HSV
      var hsv = this._hexToHsv(color)
      if (hsv) {
        this.setData({
          hue: hsv.h,
          saturation: hsv.s,
          value: hsv.v,
          panelX: hsv.s * this.data.panelWidth,
          panelY: (1 - hsv.v) * this.data.panelHeight,
          hueX: (hsv.h / 360) * this.data.hueBarWidth,
        })
        this._drawPanel()
        this._drawHueBar()
      }
    },
  },

  methods: {
    _initCanvas: function () {
      var self = this
      var query = this.createSelectorQuery()

      query.select('#saturation-panel').boundingClientRect()
      query.select('#hue-bar').boundingClientRect()
      query.exec(function (res) {
        if (!res[0] || !res[1]) return

        var panelRect = res[0]
        var hueRect = res[1]

        // 初始化 HSV 从当前颜色
        var hsv = self._hexToHsv(self.data.color) || { h: 0, s: 1, v: 1 }

        self.setData({
          panelWidth: panelRect.width,
          panelHeight: panelRect.height,
          hueBarWidth: hueRect.width,
          hueBarHeight: hueRect.height,
          hue: hsv.h,
          saturation: hsv.s,
          value: hsv.v,
          panelX: hsv.s * panelRect.width,
          panelY: (1 - hsv.v) * panelRect.height,
          hueX: (hsv.h / 360) * hueRect.width,
          initialized: true,
        })

        // 获取 Canvas 上下文并绘制
        self._setupCanvases()
      })
    },

    _setupCanvases: function () {
      var self = this

      // 饱和度/亮度面板 Canvas
      var panelQuery = this.createSelectorQuery()
      panelQuery.select('#saturation-canvas').fields({ node: true, size: true })
      panelQuery.exec(function (res) {
        if (!res[0]) return
        var canvas = res[0].node
        var ctx = canvas.getContext('2d')
        var dpr = wx.getWindowInfo().pixelRatio || 2
        canvas.width = self.data.panelWidth * dpr
        canvas.height = self.data.panelHeight * dpr
        ctx.scale(dpr, dpr)
        self._panelCtx = ctx
        self._panelCanvas = canvas
        self._drawPanel()
      })

      // 色相条 Canvas
      var hueQuery = this.createSelectorQuery()
      hueQuery.select('#hue-canvas').fields({ node: true, size: true })
      hueQuery.exec(function (res) {
        if (!res[0]) return
        var canvas = res[0].node
        var ctx = canvas.getContext('2d')
        var dpr = wx.getWindowInfo().pixelRatio || 2
        canvas.width = self.data.hueBarWidth * dpr
        canvas.height = self.data.hueBarHeight * dpr
        ctx.scale(dpr, dpr)
        self._hueCtx = ctx
        self._hueCanvas = canvas
        self._drawHueBar()
      })
    },

    // 绘制饱和度/亮度面板
    _drawPanel: function () {
      var ctx = this._panelCtx
      if (!ctx) return

      var w = this.data.panelWidth
      var h = this.data.panelHeight
      var hue = this.data.hue

      // 底层：当前色相的纯色
      var hueRgb = this._hsvToRgb(hue, 1, 1)
      ctx.fillStyle = 'rgb(' + hueRgb.r + ',' + hueRgb.g + ',' + hueRgb.b + ')'
      ctx.fillRect(0, 0, w, h)

      // 水平渐变：白色 → 透明（饱和度）
      var gradH = ctx.createLinearGradient(0, 0, w, 0)
      gradH.addColorStop(0, 'rgba(255,255,255,1)')
      gradH.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = gradH
      ctx.fillRect(0, 0, w, h)

      // 垂直渐变：透明 → 黑色（亮度）
      var gradV = ctx.createLinearGradient(0, 0, 0, h)
      gradV.addColorStop(0, 'rgba(0,0,0,0)')
      gradV.addColorStop(1, 'rgba(0,0,0,1)')
      ctx.fillStyle = gradV
      ctx.fillRect(0, 0, w, h)
    },

    // 绘制色相条
    _drawHueBar: function () {
      var ctx = this._hueCtx
      if (!ctx) return

      var w = this.data.hueBarWidth
      var h = this.data.hueBarHeight

      var grad = ctx.createLinearGradient(0, 0, w, 0)
      grad.addColorStop(0, '#ff0000')
      grad.addColorStop(0.17, '#ffff00')
      grad.addColorStop(0.33, '#00ff00')
      grad.addColorStop(0.5, '#00ffff')
      grad.addColorStop(0.67, '#0000ff')
      grad.addColorStop(0.83, '#ff00ff')
      grad.addColorStop(1, '#ff0000')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)
    },

    // 面板触摸事件
    onPanelTouchStart: function (e) {
      this._handlePanelTouch(e)
    },
    onPanelTouchMove: function (e) {
      this._handlePanelTouch(e)
    },
    onPanelTouchEnd: function () {
      // 触摸结束时无需特殊处理
    },

    _handlePanelTouch: function (e) {
      var touch = e.touches[0]
      var self = this

      // 获取面板位置
      this.createSelectorQuery()
        .select('#saturation-panel')
        .boundingClientRect(function (rect) {
          if (!rect) return
          var x = touch.clientX - rect.left
          var y = touch.clientY - rect.top

          // 限制在面板范围内
          x = Math.max(0, Math.min(x, self.data.panelWidth))
          y = Math.max(0, Math.min(y, self.data.panelHeight))

          var s = x / self.data.panelWidth
          var v = 1 - y / self.data.panelHeight

          self.setData({
            saturation: s,
            value: v,
            panelX: x,
            panelY: y,
          })

          self._emitColor()
        })
        .exec()
    },

    // 色相条触摸事件
    onHueTouchStart: function (e) {
      this._handleHueTouch(e)
    },
    onHueTouchMove: function (e) {
      this._handleHueTouch(e)
    },
    onHueTouchEnd: function () {
      // 触摸结束时无需特殊处理
    },

    _handleHueTouch: function (e) {
      var touch = e.touches[0]
      var self = this

      this.createSelectorQuery()
        .select('#hue-bar')
        .boundingClientRect(function (rect) {
          if (!rect) return
          var x = touch.clientX - rect.left
          x = Math.max(0, Math.min(x, self.data.hueBarWidth))

          var hue = (x / self.data.hueBarWidth) * 360

          self.setData({
            hue: hue,
            hueX: x,
          })

          // 重绘面板（色相变了）
          self._drawPanel()
          self._emitColor()
        })
        .exec()
    },

    // 发出颜色变化事件
    _emitColor: function () {
      var rgb = this._hsvToRgb(this.data.hue, this.data.saturation, this.data.value)
      var hex = this._rgbToHex(rgb.r, rgb.g, rgb.b)
      this.triggerEvent('colorchange', { color: hex })
    },

    // ========== 颜色转换工具 ==========

    _hexToHsv: function (hex) {
      if (!hex || hex.length < 7) return null
      var r = parseInt(hex.slice(1, 3), 16) / 255
      var g = parseInt(hex.slice(3, 5), 16) / 255
      var b = parseInt(hex.slice(5, 7), 16) / 255

      var max = Math.max(r, g, b)
      var min = Math.min(r, g, b)
      var d = max - min
      var h = 0
      var s = max === 0 ? 0 : d / max
      var v = max

      if (d !== 0) {
        if (max === r) {
          h = ((g - b) / d + (g < b ? 6 : 0)) * 60
        } else if (max === g) {
          h = ((b - r) / d + 2) * 60
        } else {
          h = ((r - g) / d + 4) * 60
        }
      }

      return { h: h, s: s, v: v }
    },

    _hsvToRgb: function (h, s, v) {
      h = ((h % 360) + 360) % 360
      var c = v * s
      var x = c * (1 - Math.abs(((h / 60) % 2) - 1))
      var m = v - c
      var r = 0, g = 0, b = 0

      if (h < 60) { r = c; g = x; b = 0; }
      else if (h < 120) { r = x; g = c; b = 0; }
      else if (h < 180) { r = 0; g = c; b = x; }
      else if (h < 240) { r = 0; g = x; b = c; }
      else if (h < 300) { r = x; g = 0; b = c; }
      else { r = c; g = 0; b = x; }

      return {
        r: Math.round((r + m) * 255),
        g: Math.round((g + m) * 255),
        b: Math.round((b + m) * 255),
      }
    },

    _rgbToHex: function (r, g, b) {
      return '#' + [r, g, b].map(function (v) {
        var hex = Math.max(0, Math.min(255, Math.round(v))).toString(16)
        return hex.length === 1 ? '0' + hex : hex
      }).join('')
    },
  },
})
