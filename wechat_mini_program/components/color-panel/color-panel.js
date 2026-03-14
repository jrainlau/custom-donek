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
    clipboardRgb: '',  // 剪贴板中检测到的合法 RGB 值
    clipboardRgbHex: '',  // 剪贴板 RGB 对应的 HEX 色值
    clipboardRgbTextColor: '',  // 剪贴板 RGB 按钮文字颜色（亮/暗自适应）

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
      var self = this
      this.setData({
        editingIndex: index,
        clipboardRgb: '',
        clipboardRgbHex: '',
        clipboardRgbTextColor: '',
        editingItem: {
          label: LABELS[index],
          color: color,
          r: rgb.r,
          g: rgb.g,
          b: rgb.b,
          key: COLOR_KEYS[index],
        },
      })
      // 读取剪贴板，检测是否包含合法 RGB 值
      wx.getClipboardData({
        success: function (res) {
          var text = (res.data || '').trim()
          var valid = self._parseClipboardRgb(text)
          if (valid) {
            var parts = valid.split(',')
            var cr = parseInt(parts[0], 10)
            var cg = parseInt(parts[1], 10)
            var cb = parseInt(parts[2], 10)
            var hex = util.rgbToHex(cr, cg, cb)
            var textColor = util.getContrastColor(hex)
            self.setData({
              clipboardRgb: valid,
              clipboardRgbHex: hex,
              clipboardRgbTextColor: textColor,
            })
          }
        },
      })
    },

    // 解析剪贴板文本，返回合法的 RGB 字符串或空字符串
    _parseClipboardRgb: function (text) {
      if (!text) return ''
      // 仅匹配纯英文逗号分隔的三个数字
      var parts = text.split(',')
      if (parts.length !== 3) return ''
      var nums = parts.map(function (p) { return parseInt(p.trim(), 10) })
      var valid = nums.every(function (n) { return !isNaN(n) && n >= 0 && n <= 255 })
      if (!valid) return ''
      return nums[0] + ',' + nums[1] + ',' + nums[2]
    },

    // 应用剪贴板 RGB 颜色
    onApplyClipboardRgb: function () {
      var rgbStr = this.data.clipboardRgb
      if (!rgbStr) return
      var index = this.data.editingIndex
      if (index < 0) return
      var parts = rgbStr.split(',')
      var r = parseInt(parts[0], 10)
      var g = parseInt(parts[1], 10)
      var b = parseInt(parts[2], 10)
      var newHex = util.rgbToHex(r, g, b)
      this.setData({
        'editingItem.color': newHex,
        'editingItem.r': r,
        'editingItem.g': g,
        'editingItem.b': b,
        clipboardRgb: '',  // 使用后隐藏按钮
        clipboardRgbHex: '',
        clipboardRgbTextColor: '',
      })
      this.triggerEvent('colorchange', {
        key: COLOR_KEYS[index],
        color: newHex,
      })
    },

    // 弹窗遮罩层点击
    onOverlayTap: function () {
      this.setData({
        editingIndex: -1,
        editingItem: null,
        clipboardRgb: '',
        clipboardRgbHex: '',
        clipboardRgbTextColor: '',
      })
    },

    // 弹窗卡片点击（阻止冒泡到遮罩层）
    onModalCardTap: function () {
      // 仅阻止冒泡，不做其他处理
    },

    // 关闭弹窗编辑器（显式关闭按钮）
    onCloseEditor: function () {
      this.setData({
        editingIndex: -1,
        editingItem: null,
        clipboardRgb: '',
        clipboardRgbHex: '',
        clipboardRgbTextColor: '',
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
      })
      this.triggerEvent('colorchange', {
        key: COLOR_KEYS[index],
        color: color,
      })
    },

    // 弹窗内 RGB 滑块拖动中实时更新（bindchanging）
    onEditorSliderChanging: function (e) {
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
      })
      // 实时通知父组件颜色变化
      this.triggerEvent('colorchange', {
        key: COLOR_KEYS[index],
        color: newHex,
      })
    },

    // 弹窗内 RGB 滑块变化（bindchange，松手时触发）
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
