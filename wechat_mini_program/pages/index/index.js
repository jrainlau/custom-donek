var presets = require('../../utils/presets')
var m3color = require('../../utils/m3color')
var util = require('../../utils/util')
var svgData = require('../../utils/svg-data')
var storage = require('../../utils/storage')

var app = getApp()

Page({
  data: {
    // 导航栏相关
    statusBarHeight: 0,
    navBarHeight: 0,

    // SVG 原始文本
    topsheetSvg: '',
    baseSvg: '',

    // 4 色状态
    topPrimary: presets.DEFAULT_SCHEME.topPrimary,
    topSecondary: presets.DEFAULT_SCHEME.topSecondary,
    basePattern: presets.DEFAULT_SCHEME.basePattern,
    baseBg: presets.DEFAULT_SCHEME.baseBg,

    // 当前选中的预设方案 ID
    activeSchemeId: presets.DEFAULT_SCHEME.id,

    // 种子颜色
    seedColor: '#6750A4',
    showSeedPicker: false,
    seedError: '',

    // 导出状态
    exporting: false,

    // 颜色信息（用于导出画布显示）
    colorLabels: ['板面背景', '板面 logo', '板底背景', '板底 logo'],
  },

  _debounceTimer: null,

  onLoad: function () {
    // 设置导航栏高度
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight,
      navBarHeight: app.globalData.navBarHeight,
    })

    // 加载 SVG 数据（内联在 JS 模块中）
    this.setData({
      topsheetSvg: svgData.TOPSHEET_SVG,
      baseSvg: svgData.BASE_SVG,
    })
  },

  // ========== 颜色配置面板事件 ==========

  onColorChange: function (e) {
    var key = e.detail.key
    var color = e.detail.color
    var obj = {}
    obj[key] = color
    obj.activeSchemeId = '' // 清除预设选中态
    this.setData(obj)
    // 通知 user-schemes 刷新（通过 properties 传递）
  },

  onSwapColors: function (e) {
    var sourceIndex = e.detail.sourceIndex
    var targetIndex = e.detail.targetIndex
    var keys = ['topPrimary', 'topSecondary', 'basePattern', 'baseBg']
    var sourceKey = keys[sourceIndex]
    var targetKey = keys[targetIndex]
    var sourceColor = this.data[sourceKey]
    var targetColor = this.data[targetKey]
    var obj = {}
    obj[sourceKey] = targetColor
    obj[targetKey] = sourceColor
    this.setData(obj)
  },

  onToggleSeedPicker: function () {
    this.setData({
      showSeedPicker: !this.data.showSeedPicker,
    })
  },

  onSeedColorChange: function (e) {
    var hex = e.detail.color
    this.setData({ seedColor: hex })

    // 防抖智能配色
    var self = this
    if (this._debounceTimer) clearTimeout(this._debounceTimer)
    this._debounceTimer = setTimeout(function () {
      var result = m3color.generateM3Palette(hex)
      if (result) {
        self.setData({
          seedError: '',
          topPrimary: result.topPrimary,
          topSecondary: result.topSecondary,
          basePattern: result.basePattern,
          baseBg: result.baseBg,
          activeSchemeId: '',
        })
      } else {
        self.setData({ seedError: '配色生成失败，请尝试其他颜色' })
      }
    }, 150)
  },

  onGenerate: function () {
    var result = m3color.generateM3Palette(this.data.seedColor)
    if (result) {
      this.setData({
        seedError: '',
        topPrimary: result.topPrimary,
        topSecondary: result.topSecondary,
        basePattern: result.basePattern,
        baseBg: result.baseBg,
        activeSchemeId: '',
      })
    } else {
      this.setData({ seedError: '配色生成失败，请尝试其他颜色' })
    }
  },

  // ========== 预设配色事件 ==========

  onPresetSelect: function (e) {
    var scheme = e.detail.scheme
    this.setData({
      topPrimary: scheme.topPrimary,
      topSecondary: scheme.topSecondary,
      basePattern: scheme.basePattern,
      baseBg: scheme.baseBg,
      activeSchemeId: scheme.id,
    })
  },

  // ========== 用户配色事件 ==========

  onUserSchemeSelect: function (e) {
    var scheme = e.detail.scheme
    this.setData({
      topPrimary: scheme.topPrimary,
      topSecondary: scheme.topSecondary,
      basePattern: scheme.basePattern,
      baseBg: scheme.baseBg,
      activeSchemeId: scheme.id,
    })
  },

  // ========== 导出功能 ==========

  onExport: function () {
    if (this.data.exporting) return
    this.setData({ exporting: true })

    var self = this

    // 使用 Canvas 绘制导出图片
    var query = wx.createSelectorQuery()
    query.select('#export-canvas').fields({ node: true, size: true })
    query.exec(function (res) {
      if (!res[0]) {
        self.setData({ exporting: false })
        wx.showToast({ title: '导出失败', icon: 'error' })
        return
      }

      var canvas = res[0].node
      var ctx = canvas.getContext('2d')
      var dpr = wx.getWindowInfo().pixelRatio || 2

      // 设置 Canvas 尺寸
      var canvasWidth = 750
      var canvasHeight = 1000
      canvas.width = canvasWidth * dpr
      canvas.height = canvasHeight * dpr
      ctx.scale(dpr, dpr)

      // 绘制背景
      ctx.fillStyle = '#FDF6EC'
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)

      // 绘制标题
      ctx.fillStyle = '#333333'
      ctx.font = 'bold 36px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('DONEK 滑雪板配色方案', canvasWidth / 2, 60)

      ctx.fillStyle = '#999999'
      ctx.font = '16px sans-serif'
      ctx.fillText('Snowboard Color Customizer', canvasWidth / 2, 90)

      // 将 SVG 转为图片并绘制
      var colors = [
        { label: '板面背景', hex: self.data.topPrimary },
        { label: '板面 logo', hex: self.data.topSecondary },
        { label: '板底背景', hex: self.data.basePattern },
        { label: '板底 logo', hex: self.data.baseBg },
      ]

      // 处理 SVG 并转为临时图片
      var topSvg = self._processSvgForExport(self.data.topsheetSvg, 'color-primary', self.data.topPrimary, 'color-secondary', self.data.topSecondary, 'top')
      var baseSvg = self._processSvgForExport(self.data.baseSvg, 'color-pattern', self.data.basePattern, 'color-bg', self.data.baseBg, 'base')

      var fs = wx.getFileSystemManager()
      var topTempPath = wx.env.USER_DATA_PATH + '/export_top.svg'
      var baseTempPath = wx.env.USER_DATA_PATH + '/export_base.svg'

      try {
        fs.writeFileSync(topTempPath, topSvg, 'utf-8')
        fs.writeFileSync(baseTempPath, baseSvg, 'utf-8')
      } catch (e) {
        console.error('[Export] 写入临时 SVG 失败:', e)
      }

      // 绘制 SVG 图片
      var topImg = canvas.createImage()
      var baseImg = canvas.createImage()
      var loadedCount = 0

      function onBothLoaded() {
        // 绘制板面标签
        ctx.fillStyle = '#555555'
        ctx.font = 'bold 20px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('板面 Topsheet', canvasWidth / 4, 130)

        // 绘制板面 SVG
        var svgDrawWidth = 120
        var svgDrawHeight = 630
        try {
          ctx.drawImage(topImg, canvasWidth / 4 - svgDrawWidth / 2, 150, svgDrawWidth, svgDrawHeight)
        } catch (e) {
          // 如果 SVG 图片加载失败，绘制替代矩形
          ctx.fillStyle = self.data.topPrimary
          ctx.fillRect(canvasWidth / 4 - svgDrawWidth / 2, 150, svgDrawWidth, svgDrawHeight)
        }

        // 绘制板底标签
        ctx.fillText('板底 Base', canvasWidth * 3 / 4, 130)

        // 绘制板底 SVG
        try {
          ctx.drawImage(baseImg, canvasWidth * 3 / 4 - svgDrawWidth / 2, 150, svgDrawWidth, svgDrawHeight)
        } catch (e) {
          ctx.fillStyle = self.data.baseBg
          ctx.fillRect(canvasWidth * 3 / 4 - svgDrawWidth / 2, 150, svgDrawWidth, svgDrawHeight)
        }

        // 绘制配色信息
        var colorY = 830
        var colorGap = canvasWidth / 5
        ctx.textAlign = 'center'

        colors.forEach(function (c, i) {
          var cx = colorGap * (i + 0.75)

          // 绘制色块圆点
          ctx.beginPath()
          ctx.arc(cx, colorY, 30, 0, Math.PI * 2)
          ctx.fillStyle = c.hex
          ctx.fill()
          ctx.strokeStyle = 'rgba(0,0,0,0.1)'
          ctx.lineWidth = 2
          ctx.stroke()

          // 绘制标签
          ctx.fillStyle = '#555555'
          ctx.font = 'bold 14px sans-serif'
          ctx.fillText(c.label, cx, colorY + 55)

          // 绘制 RGB 值
          ctx.fillStyle = '#888888'
          ctx.font = '12px monospace'
          ctx.fillText(util.hexToRgbString(c.hex), cx, colorY + 75)
        })

        // 导出为图片
        wx.canvasToTempFilePath({
          canvas: canvas,
          fileType: 'png',
          quality: 1,
          success: function (res) {
            // 保存到相册
            wx.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success: function () {
                wx.showToast({ title: '已保存到相册', icon: 'success' })
              },
              fail: function (err) {
                if (err.errMsg.indexOf('auth deny') !== -1 || err.errMsg.indexOf('authorize') !== -1) {
                  // 未授权，引导开启
                  wx.showModal({
                    title: '需要权限',
                    content: '请允许访问相册以保存图片',
                    success: function (modalRes) {
                      if (modalRes.confirm) {
                        wx.openSetting()
                      }
                    },
                  })
                } else {
                  wx.showToast({ title: '保存失败', icon: 'error' })
                }
              },
              complete: function () {
                self.setData({ exporting: false })
              },
            })
          },
          fail: function () {
            self.setData({ exporting: false })
            wx.showToast({ title: '导出失败，请重试', icon: 'error' })
          },
        })
      }

      topImg.onload = function () {
        loadedCount++
        if (loadedCount >= 2) onBothLoaded()
      }
      topImg.onerror = function () {
        loadedCount++
        if (loadedCount >= 2) onBothLoaded()
      }
      baseImg.onload = function () {
        loadedCount++
        if (loadedCount >= 2) onBothLoaded()
      }
      baseImg.onerror = function () {
        loadedCount++
        if (loadedCount >= 2) onBothLoaded()
      }

      topImg.src = topTempPath
      baseImg.src = baseTempPath
    })
  },

  _processSvgForExport: function (svgRaw, primaryClass, primaryColor, secondaryClass, secondaryColor, prefix) {
    var svg = svgRaw
    svg = svg.replace(/<\?xml[^?]*\?>\s*/g, '')
    svg = svg.replace(/<!--[\s\S]*?-->/g, '')

    var primaryRegex = new RegExp('\\.' + primaryClass + '\\s*\\{[^}]*\\}', 'g')
    svg = svg.replace(primaryRegex, '.' + primaryClass + ' { fill: ' + primaryColor + '; }')

    var secondaryRegex = new RegExp('\\.' + secondaryClass + '\\s*\\{[^}]*\\}', 'g')
    svg = svg.replace(secondaryRegex, '.' + secondaryClass + ' { fill: ' + secondaryColor + '; }')

    svg = svg.replace(/id="board-outline"/g, 'id="board-outline-export-' + prefix + '"')
    svg = svg.replace(/url\(#board-outline\)/g, 'url(#board-outline-export-' + prefix + ')')

    return svg
  },

  onUnload: function () {
    if (this._debounceTimer) clearTimeout(this._debounceTimer)
  },
})
