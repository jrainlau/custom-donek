var storage = require('../../utils/storage')

Component({
  properties: {
    // 当前颜色（用于保存）
    topPrimary: { type: String, value: '' },
    topSecondary: { type: String, value: '' },
    basePattern: { type: String, value: '' },
    baseBg: { type: String, value: '' },
    activeSchemeId: { type: String, value: '' },
    // 外部触发保存（递增时触发）
    saveTrigger: { type: Number, value: 0 },
  },

  observers: {
    'saveTrigger': function (val) {
      if (val > 0) {
        this.onSave()
      }
    },
  },

  data: {
    schemes: [],
  },

  lifetimes: {
    attached: function () {
      this.loadSchemes()
    },
  },

  methods: {
    loadSchemes: function () {
      var all = storage.getAllSchemes()
      // 按创建时间倒序
      all.sort(function (a, b) {
        return b.createdAt - a.createdAt
      })
      this.setData({ schemes: all })
      // 通知父组件配色数量变化
      this.triggerEvent('schemescountchange', { count: all.length })
    },

    // 保存当前配色
    onSave: function () {
      var scheme = {
        id: 'user-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6),
        name: '',
        topPrimary: this.data.topPrimary,
        topSecondary: this.data.topSecondary,
        basePattern: this.data.basePattern,
        baseBg: this.data.baseBg,
        createdAt: Date.now(),
      }
      storage.saveScheme(scheme)
      this.loadSchemes()
      wx.showToast({
        title: '已保存',
        icon: 'success',
        duration: 1500,
      })
    },

    // 选择已保存方案
    onSelectScheme: function (e) {
      var index = e.currentTarget.dataset.index
      var scheme = this.data.schemes[index]
      this.triggerEvent('select', { scheme: scheme })
    },

    // 删除方案
    onDeleteScheme: function (e) {
      var index = e.currentTarget.dataset.index
      var scheme = this.data.schemes[index]
      var self = this
      wx.showModal({
        title: '确认删除',
        content: '确定要删除这个配色方案吗？',
        success: function (res) {
          if (res.confirm) {
            storage.deleteScheme(scheme.id)
            self.loadSchemes()
          }
        },
      })
    },
  },
})
