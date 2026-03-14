var util = require('../../utils/util')

/** 固定标签 */
var LABELS = ['板面背景', '板面 logo', '板底背景', '板底 logo']
/** 颜色 key 对应关系 */
var COLOR_KEYS = ['topPrimary', 'topSecondary', 'basePattern', 'baseBg']

Component({
  properties: {
    topPrimary: { type: String, value: '#000000' },
    topSecondary: { type: String, value: '#F5F5F5' },
    basePattern: { type: String, value: '#000000' },
    baseBg: { type: String, value: '#FFFFFF' },
    seedColor: { type: String, value: '#6750A4' },
    showSeedPicker: { type: Boolean, value: false },
    error: { type: String, value: '' },
  },

  data: {
    labels: LABELS,
    expandedIndex: -1,
    copiedIndex: -1,
    // 颜色列表（方便模板遍历）
    colorItems: [],
  },

  observers: {
    'topPrimary, topSecondary, basePattern, baseBg': function (tp, ts, bp, bb) {
      this._updateColorItems()
    },
  },

  lifetimes: {
    attached: function () {
      this._updateColorItems()
    },
  },

  methods: {
    _updateColorItems: function () {
      var self = this
      var colors = [
        self.data.topPrimary,
        self.data.topSecondary,
        self.data.basePattern,
        self.data.baseBg,
      ]
      var items = LABELS.map(function (label, index) {
        var color = colors[index]
        var rgb = util.hexToRgb(color)
        return {
          label: label,
          color: color,
          rgbString: util.hexToRgbString(color),
          textColor: util.getContrastColor(color),
          r: rgb.r,
          g: rgb.g,
          b: rgb.b,
          index: index,
          key: COLOR_KEYS[index],
        }
      })
      self.setData({ colorItems: items })
    },

    // 种子颜色色块点击 - 切换展开/折叠
    onToggleSeedPicker: function () {
      this.triggerEvent('toggleseedpicker')
    },

    // 种子颜色变化
    onSeedColorChange: function (e) {
      this.triggerEvent('seedcolorchange', { color: e.detail.color })
    },

    // 智能配色按钮点击
    onGenerate: function () {
      this.triggerEvent('generate')
    },

    // 颜色槽位点击展开/折叠
    onToggleExpand: function (e) {
      var index = e.currentTarget.dataset.index
      this.setData({
        expandedIndex: this.data.expandedIndex === index ? -1 : index,
      })
    },

    // 复制 RGB 值
    onCopyColor: function (e) {
      var index = e.currentTarget.dataset.index
      var colors = [
        this.data.topPrimary,
        this.data.topSecondary,
        this.data.basePattern,
        this.data.baseBg,
      ]
      var rgbStr = util.hexToRgbString(colors[index])
      util.copyToClipboard(rgbStr)
      var self = this
      this.setData({ copiedIndex: index })
      setTimeout(function () {
        self.setData({ copiedIndex: -1 })
      }, 1500)
    },

    // 拾色器颜色变化
    onPickerColorChange: function (e) {
      var index = e.currentTarget.dataset.index
      var color = e.detail.color
      this.triggerEvent('colorchange', {
        key: COLOR_KEYS[index],
        color: color,
      })
    },

    // RGB 滑块变化
    onSliderChange: function (e) {
      var index = parseInt(e.currentTarget.dataset.index)
      var channel = e.currentTarget.dataset.channel
      var value = e.detail.value

      var colors = [
        this.data.topPrimary,
        this.data.topSecondary,
        this.data.basePattern,
        this.data.baseBg,
      ]
      var rgb = util.hexToRgb(colors[index])
      rgb[channel] = value
      var newHex = util.rgbToHex(rgb.r, rgb.g, rgb.b)

      this.triggerEvent('colorchange', {
        key: COLOR_KEYS[index],
        color: newHex,
      })
    },

    // 长按色块 - 交换颜色
    onLongPress: function (e) {
      var sourceIndex = e.currentTarget.dataset.index
      var self = this
      var targets = []
      LABELS.forEach(function (label, i) {
        if (i !== sourceIndex) {
          targets.push(label)
        }
      })
      wx.showActionSheet({
        itemList: targets,
        success: function (res) {
          // 计算实际目标索引
          var targetIndex = res.tapIndex
          if (targetIndex >= sourceIndex) targetIndex += 1
          self.triggerEvent('swapcolors', {
            sourceIndex: sourceIndex,
            targetIndex: targetIndex,
          })
        },
      })
    },
  },
})
