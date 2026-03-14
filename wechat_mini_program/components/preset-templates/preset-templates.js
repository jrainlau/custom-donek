var presets = require('../../utils/presets')

Component({
  properties: {
    activeSchemeId: {
      type: String,
      value: '',
    },
  },

  data: {
    schemes: presets.PRESET_SCHEMES,
  },

  methods: {
    onSelectScheme: function (e) {
      var index = e.currentTarget.dataset.index
      var scheme = this.data.schemes[index]
      this.triggerEvent('select', { scheme: scheme })
    },
  },
})
