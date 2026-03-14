# 实施计划：DONEK 滑雪板配色定制 — 微信小程序版本

- [ ] 1. 创建小程序项目骨架与全局配置
  - 在项目根目录创建 `wechat_mini_program` 目录
  - 创建 `project.config.json`（appid 留空，配置 ES6→ES5、增强编译等）
  - 创建 `app.json`，配置单页面 `pages/index/index`，自定义导航栏 `"navigationStyle": "custom"`，窗口背景色等
  - 创建 `app.js`（全局 App 实例，可为空壳）
  - 创建 `app.wxss`，将 Web 版 `index.css` 中的 M3 Design Token（颜色、字体、圆角、阴影、动效）移植为小程序 CSS 变量（注意：小程序支持 CSS 变量但不支持 `env()` 安全区域，需用 `constant()` 兼容写法或直接在具体组件中处理）
  - 创建 `sitemap.json`
  - _需求：1.1、1.2、1.3、1.4_

- [ ] 2. 移植数据层与工具函数
  - 创建 `utils/util.js`，移植 `hexToRgb`、`rgbToHex`、`hexToRgbString`、`parseRgbString`、`getContrastColor` 等工具函数（去除 TypeScript 类型，转为纯 JS）
  - 创建 `utils/presets.js`，移植 `PRESET_SCHEMES` 和 `DEFAULT_SCHEME` 数据（10 套预设配色方案，保持完全一致的颜色值）
  - 创建 `utils/storage.js`，实现本地存储模块：使用 `wx.getStorageSync` / `wx.setStorageSync` 替代 IndexedDB/localStorage，提供 `saveScheme`、`getAllSchemes`、`deleteScheme` 三个接口
  - 创建 `utils/m3color.js`，移植 M3 智能配色算法：先尝试将 `@material/material-color-utilities` 的核心函数（`argbFromHex`、`hexFromArgb`、`themeFromSourceColor`）提取为小程序可用的纯 JS 版本；如果该库依赖了小程序不支持的 API，则实现一个基于 HSL 色彩空间的替代算法，从种子颜色生成 primary、onPrimary、primaryContainer、onPrimaryContainer 四个和谐色
  - _需求：4.2、4.3、6.1、6.4_

- [ ] 3. 创建主页面布局与状态管理
  - 创建 `pages/index/index.js`，实现主页面逻辑：
    - data 中定义 4 色状态（`topPrimary`、`topSecondary`、`basePattern`、`baseBg`）、`activeSchemeId`、`seedColor`、`showSeedPicker`、`seedError`、`expandedIndex`、`userSchemes` 等
    - 实现 `applyScheme`、`handleColorChange`（清除预设选中态）、`handleSeedColorChange`（防抖智能配色）、`handleGenerate` 等方法
    - `onLoad` 时加载用户已保存配色方案
  - 创建 `pages/index/index.wxml`，搭建整体页面结构：自定义导航栏 → SVG 预览区 → 颜色配置区 → 预设配色区 → 用户配色区（单栏纵向布局）
  - 创建 `pages/index/index.wxss`，编写页面级样式，使用 M3 CSS 变量保持与 Web 版一致的视觉风格（圆角卡片、阴影、排版）
  - 创建 `pages/index/index.json`，配置页面所引用的自定义组件
  - _需求：8.1、8.2、8.3、8.4_

- [ ] 4. 实现 SVG 配色预览组件
  - 创建 `components/svg-preview/` 组件目录，包含 `svg-preview.js`、`svg-preview.wxml`、`svg-preview.wxss`、`svg-preview.json`
  - 将 Topsheet.svg 和 Base.svg 文件复制到 `assets/` 目录
  - 实现 SVG 渲染方案：读取 SVG 文件原始文本 → 通过正则替换 `.color-primary`、`.color-secondary`（或 `.color-pattern`、`.color-bg`）的 fill 颜色值 → 将修改后的 SVG 转为 `data:image/svg+xml;base64,...` 格式 → 通过 `<image>` 标签渲染
  - 组件 properties 接收：`svgRaw`（SVG 原始文本）、`primaryColor`、`secondaryColor`、`primaryClass`、`secondaryClass`、`label`
  - 使用 observers 监听颜色属性变化，实时重新生成 base64 URL 更新预览
  - 处理 SVG 中的 clipPath id 冲突问题（为板面和板底的 SVG 添加不同的 id 前缀）
  - _需求：2.1、2.2、2.3、2.4_

- [ ] 5. 实现 Canvas 拾色器组件
  - 创建 `components/color-picker/` 组件目录
  - 使用小程序 Canvas 2D API 实现拾色器：
    - **饱和度/亮度面板**：绘制从白到当前色相的水平渐变叠加从透明到黑的垂直渐变，用户触摸选取饱和度和亮度
    - **色相条**：绘制 0°~360° 的彩虹渐变色条，用户触摸选取色相
  - 实现 HSV ↔ HEX 的双向转换函数
  - 组件 properties 接收 `color`（当前 HEX），events 触发 `colorchange`（新 HEX 值）
  - 处理触摸事件 `bindtouchstart`、`bindtouchmove`、`bindtouchend`，实现流畅的拖拽选色
  - _需求：9.1、9.2、9.3_

- [ ] 6. 实现颜色配置面板组件
  - 创建 `components/color-panel/` 组件目录
  - 实现标题栏 + 种子颜色色块 + "智能配色"按钮的布局
  - 种子颜色色块点击展开/折叠拾色器（复用 color-picker 组件）
  - 实现 2×2 颜色槽位网格：每个槽位显示颜色背景、标签（板面背景/板面 logo/板底背景/板底 logo）、RGB 值
  - 点击 RGB 值调用 `wx.setClipboardData` 复制到剪贴板
  - 点击展开按钮展开该槽位的详细编辑器：复用 color-picker 组件 + RGB 三通道 slider（使用小程序原生 `<slider>` 组件）
  - 颜色交换功能：使用长按弹出 `wx.showActionSheet` 选择要交换的目标槽位（简化拖拽交互为长按选择）
  - 实现错误提示展示（种子颜色配色失败时）
  - _需求：3.1、3.2、3.3、3.4、3.5、4.1、4.2、4.4_

- [ ] 7. 实现预设配色模板组件
  - 创建 `components/preset-templates/` 组件目录
  - 渲染 10 套预设配色方案，每套显示 4 个圆形色块
  - 使用 2 列网格布局（`display: flex; flex-wrap: wrap`，每项占 50% 宽度）
  - 当前选中预设高亮显示（边框变为 primary 颜色）
  - 点击预设触发 `select` 事件，传递配色数据给父页面
  - _需求：5.1、5.2、5.3、5.4_

- [ ] 8. 实现用户配色方案管理组件
  - 创建 `components/user-schemes/` 组件目录
  - 标题栏 + "保存当前配色" 按钮
  - 展示已保存配色方案列表（网格布局，每项显示 4 个色块圆点 + 删除按钮）
  - 保存：调用 `storage.js` 的 `saveScheme`，自动生成 ID，保存后刷新列表
  - 点击已保存方案：触发 `select` 事件应用配色
  - 删除：调用 `wx.showModal` 确认后调用 `storage.js` 的 `deleteScheme`，刷新列表
  - 空状态显示"还没有保存的配色方案"提示
  - _需求：6.1、6.2、6.3、6.4、6.5_

- [ ] 9. 实现导出图片功能
  - 在主页面或创建独立的导出组件
  - 使用离屏 Canvas（`type="2d"`）绘制导出画面：
    - 绘制背景色 `#FDF6EC`
    - 绘制标题文字"DONEK 滑雪板配色方案"
    - 将板面和板底 SVG 转为临时图片（通过 base64 方式或 `wx.getFileSystemManager().writeFileSync` 写入临时文件后用 `canvas.drawImage` 绘制）
    - 绘制 4 个配色圆点 + 标签文字 + RGB 值
  - 调用 `wx.canvasToTempFilePath` 生成临时图片路径
  - 调用 `wx.saveImageToPhotosAlbum` 保存到相册
  - 处理相册权限：使用 `wx.authorize` 预申请，被拒绝时通过 `wx.openSetting` 引导用户重新授权
  - 导出过程中按钮显示"导出中..."loading 状态，防止重复点击
  - 失败时 `wx.showToast` 提示"导出失败，请重试"
  - _需求：7.1、7.2、7.3、7.4、7.5、7.6_

- [ ] 10. 整体联调与自定义导航栏完善
  - 在主页面 `index.js` 中整合所有组件的事件通信（子组件 triggerEvent → 父页面方法 → 更新 data → 子组件 properties 刷新）
  - 实现自定义导航栏：获取胶囊按钮位置（`wx.getMenuButtonBoundingClientRect`）和状态栏高度（`wx.getSystemInfoSync`），计算导航栏高度，确保标题和导出按钮不与胶囊重叠
  - 适配不同机型：使用 rpx 单位 + flex 布局保证在不同屏幕尺寸下的一致性
  - 验证全部功能流程：颜色修改 → 预览更新 → 种子配色 → 预设选择 → 保存/加载/删除 → 导出图片
  - _需求：1.1、8.1、8.2、8.3_
