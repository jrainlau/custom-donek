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
    editingIndex: -1,
    editingItem: null,
    copiedIndex: -1,
    rgbInputValue: '',
    rgbInputError: false,
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

    // 颜色槽位点击展开/折叠 - 已移除，改为弹窗

    // 打开弹窗编辑器
    onOpenEditor: function (e) {
      var index = e.currentTarget.dataset.index
      var colors = [
        this.data.topPrimary,
        this.data.topSecondary,
        this.data.basePattern,
        this.data.baseBg,
      ]
      var color = colors[index]
      var rgb = util.hexToRgb(color)
      this.setData({
        editingIndex: index,
        editingItem: {
          label: LABELS[index],
          color: color,
          r: rgb.r,
          g: rgb.g,
          b: rgb.b,
          key: COLOR_KEYS[index],
        },
        rgbInputValue: rgb.r + ',' + rgb.g + ',' + rgb.b,
        rgbInputError: false,
      })
    },

    // 关闭弹窗编辑器
    onCloseEditor: function () {
      this.setData({
        editingIndex: -1,
        editingItem: null,
        rgbInputValue: '',
        rgbInputError: false,
      })
    },

    // 弹窗内拾色器颜色变化
    onEditorPickerChange: function (e) {
      var color = e.detail.color
      var index = this.data.editingIndex
      if (index < 0) return
      var rgb = util.hexToRgb(color)
      this.setData({
        'editingItem.color': color,
        'editingItem.r': rgb.r,
        'editingItem.g': rgb.g,
        'editingItem.b': rgb.b,
        rgbInputValue: rgb.r + ',' + rgb.g + ',' + rgb.b,
        rgbInputError: false,
      })
      this.triggerEvent('colorchange', {
        key: COLOR_KEYS[index],
        color: color,
      })
    },

    // 弹窗内 RGB 滑块变化
    onEditorSliderChange: function (e) {
      var channel = e.currentTarget.dataset.channel
      var value = e.detail.value
      var index = this.data.editingIndex
      if (index < 0) return
      var item = this.data.editingItem
      var rgb = { r: item.r, g: item.g, b: item.b }
      rgb[channel] = value
      var newHex = util.rgbToHex(rgb.r, rgb.g, rgb.b)
      this.setData({
        'editingItem.color': newHex,
        'editingItem.r': rgb.r,
        'editingItem.g': rgb.g,
        'editingItem.b': rgb.b,
        rgbInputValue: rgb.r + ',' + rgb.g + ',' + rgb.b,
        rgbInputError: false,
      })
      this.triggerEvent('colorchange', {
        key: COLOR_KEYS[index],
        color: newHex,
      })
    },

    // RGB 文本输入
    onRgbInput: function (e) {
      var value = e.detail.value
      this.setData({ rgbInputValue: value })
      var index = this.data.editingIndex
      if (index < 0) return
      var parts = value.split(',')
      if (parts.length !== 3) {
        this.setData({ rgbInputError: value.trim().length > 0 })
        return
      }
      var nums = parts.map(function (p) { return parseInt(p.trim(), 10) })
      var valid = nums.every(function (n) { return !isNaN(n) && n >= 0 && n <= 255 })
      if (!valid) {
        this.setData({ rgbInputError: true })
        return
      }
      var newHex = util.rgbToHex(nums[0], nums[1], nums[2])
      this.setData({
        rgbInputError: false,
        'editingItem.color': newHex,
        'editingItem.r': nums[0],
        'editingItem.g': nums[1],
        'editingItem.b': nums[2],
      })
      this.triggerEvent('colorchange', {
        key: COLOR_KEYS[index],
        color: newHex,
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

    // 拾色器颜色变化 - 已移除，改为弹窗内处理

    // RGB 滑块变化 - 已移除，改为弹窗内处理

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
