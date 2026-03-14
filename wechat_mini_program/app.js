App({
  globalData: {
    systemInfo: null,
    menuButtonInfo: null,
    statusBarHeight: 0,
    navBarHeight: 0,
  },

  onLaunch() {
    // 获取系统信息
    const systemInfo = wx.getSystemInfoSync()
    this.globalData.systemInfo = systemInfo
    this.globalData.statusBarHeight = systemInfo.statusBarHeight || 0

    // 获取胶囊按钮位置信息
    const menuButtonInfo = wx.getMenuButtonBoundingClientRect()
    this.globalData.menuButtonInfo = menuButtonInfo

    // 计算自定义导航栏高度
    // 导航栏高度 = 胶囊按钮距顶部距离 + 胶囊按钮高度 + 与胶囊按钮相同的底部间距
    const navBarHeight = (menuButtonInfo.top - systemInfo.statusBarHeight) * 2 + menuButtonInfo.height + systemInfo.statusBarHeight
    this.globalData.navBarHeight = navBarHeight
  },
})
