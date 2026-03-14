var util = require('../../utils/util')

Component({
  properties: {
    // SVG 原始文本
    svgRaw: {
      type: String,
      value: '',
    },
    // 主色 (HEX)
    primaryColor: {
      type: String,
      value: '#000000',
    },
    // 副色 (HEX)
    secondaryColor: {
      type: String,
      value: '#F5F5F5',
    },
    // SVG 中主色的 CSS class 名
    primaryClass: {
      type: String,
      value: 'color-primary',
    },
    // SVG 中副色的 CSS class 名
    secondaryClass: {
      type: String,
      value: 'color-secondary',
    },
    // 标签文本
    label: {
      type: String,
      value: '',
    },
    // 旋转角度（用于横置显示）
    rotation: {
      type: Number,
      value: 0,
    },
  },

  data: {
    svgBase64Url: '',
    instanceId: '',
  },

  lifetimes: {
    attached: function () {
      // 生成唯一实例 ID
      this.setData({
        instanceId: 'svg-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      })
    },
  },

  observers: {
    'svgRaw, primaryColor, secondaryColor, primaryClass, secondaryClass': function () {
      this._updateSvg()
    },
  },

  methods: {
    _updateSvg: function () {
      var svgRaw = this.data.svgRaw
      var primaryColor = this.data.primaryColor
      var secondaryColor = this.data.secondaryColor
      var primaryClass = this.data.primaryClass
      var secondaryClass = this.data.secondaryClass
      var instanceId = this.data.instanceId

      if (!svgRaw || !instanceId) return

      var svg = svgRaw

      // 移除 XML 声明
      svg = svg.replace(/<\?xml[^?]*\?>\s*/g, '')
      // 移除注释
      svg = svg.replace(/<!--[\s\S]*?-->/g, '')

      // 替换 primaryClass 的 fill 颜色
      var primaryRegex = new RegExp(
        '\\.' + primaryClass + '\\s*\\{[^}]*\\}',
        'g'
      )
      svg = svg.replace(
        primaryRegex,
        '.' + primaryClass + ' { fill: ' + primaryColor + '; }'
      )

      // 替换 secondaryClass 的 fill 颜色
      var secondaryRegex = new RegExp(
        '\\.' + secondaryClass + '\\s*\\{[^}]*\\}',
        'g'
      )
      svg = svg.replace(
        secondaryRegex,
        '.' + secondaryClass + ' { fill: ' + secondaryColor + '; }'
      )

      // 为 clipPath id 添加实例前缀，避免多 SVG 冲突
      svg = svg.replace(/id="board-outline"/g, 'id="board-outline-' + instanceId + '"')
      svg = svg.replace(/url\(#board-outline\)/g, 'url(#board-outline-' + instanceId + ')')

      // 提取原始 width/height 用于 viewBox
      var wMatch = svg.match(/\bwidth="(\d+)"/)
      var hMatch = svg.match(/\bheight="(\d+)"/)
      var hasViewBox = /viewBox/.test(svg)

      // 移除固定 width/height，改为 100%
      svg = svg.replace(/(<svg[^>]*?)\s+width="[^"]*"/g, '$1')
      svg = svg.replace(/(<svg[^>]*?)\s+height="[^"]*"/g, '$1')

      // 确保有 viewBox
      if (!hasViewBox && wMatch && hMatch) {
        svg = svg.replace('<svg', '<svg viewBox="0 0 ' + wMatch[1] + ' ' + hMatch[1] + '"')
      } else if (!hasViewBox) {
        svg = svg.replace('<svg', '<svg viewBox="0 0 190 1000"')
      }

      // 添加宽高样式使 SVG 自适应
      svg = svg.replace('<svg', '<svg width="100%" height="100%"')

      // 转为 base64 data URI
      var base64 = util.base64Encode(svg)
      var url = 'data:image/svg+xml;base64,' + base64

      this.setData({
        svgBase64Url: url,
      })
    },
  },
})
