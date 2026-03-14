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
    // 截图区域显示的配色信息
    snapshotColors: [],
    // 预览区域高度（用于占位，预览区 fixed 后需要）
    previewHeight: 0,
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

    // 初始化截图配色信息
    this._updateSnapshotColors()
  },

  onReady: function () {
    // 计算 fixed 预览区的高度，用于占位
    this._measurePreviewHeight()
  },

  _measurePreviewHeight: function () {
    var self = this
    setTimeout(function () {
      var query = wx.createSelectorQuery()
      query.select('.preview-section').boundingClientRect(function (rect) {
        if (rect) {
          self.setData({ previewHeight: rect.height })
        }
      })
      query.exec()
    }, 100)
  },

  // 更新截图区域的配色信息
  _updateSnapshotColors: function () {
    this.setData({
      snapshotColors: [
        { label: '板面背景', hex: this.data.topPrimary, rgb: util.hexToRgbString(this.data.topPrimary) },
        { label: '板面 logo', hex: this.data.topSecondary, rgb: util.hexToRgbString(this.data.topSecondary) },
        { label: '板底背景', hex: this.data.basePattern, rgb: util.hexToRgbString(this.data.basePattern) },
        { label: '板底 logo', hex: this.data.baseBg, rgb: util.hexToRgbString(this.data.baseBg) },
      ],
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
    this._updateSnapshotColors()
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
    this._updateSnapshotColors()
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
        self._updateSnapshotColors()
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
      this._updateSnapshotColors()
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
    this._updateSnapshotColors()
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
    this._updateSnapshotColors()
  },

  // ========== 导出功能（使用 snapshot 截图） ==========

  onExport: function () {
    if (this.data.exporting) return
    this.setData({ exporting: true })

    var self = this

    // 使用 snapshot 组件截图（type: 'file' 在真机上兼容性更好）
    var query = wx.createSelectorQuery()
    query.select('#export-snapshot').node()
    query.exec(function (res) {
      if (!res || !res[0] || !res[0].node) {
        // 降级：尝试使用 SelectorQuery 上的 fields 方式
        console.error('snapshot node 获取失败', res)
        self.setData({ exporting: false })
        wx.showToast({ title: '导出失败，请重试', icon: 'none' })
        return
      }

      var snapshotNode = res[0].node
      snapshotNode.takeSnapshot({
        type: 'file',
        format: 'png',
        success: function (snapshotRes) {
          var filePath = snapshotRes.tempFilePath
          // 保存到相册
          wx.saveImageToPhotosAlbum({
            filePath: filePath,
            success: function () {
              wx.showToast({ title: '已保存到相册', icon: 'success' })
            },
            fail: function (err) {
              if (err.errMsg.indexOf('auth deny') !== -1 || err.errMsg.indexOf('authorize') !== -1) {
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
        fail: function (err) {
          console.error('takeSnapshot 失败', err)
          self.setData({ exporting: false })
          wx.showToast({ title: '截图失败，请重试', icon: 'none' })
        },
      })
    })
  },

  onUnload: function () {
    if (this._debounceTimer) clearTimeout(this._debounceTimer)
  },
})
