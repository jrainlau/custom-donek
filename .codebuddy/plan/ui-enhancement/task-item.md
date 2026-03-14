# 实施计划

- [ ] 1. 调整导出按钮位置 — Web 端
   - 修改 `src/App.tsx` 中 header 的布局结构：将 `<ExportCanvas>` 组件从 header 的右侧独立区域移入标题 `<div>` 内部，紧跟在"滑雪板配色定制"文字之后
   - 标题区域改为 `display: flex; align-items: center; gap: 12px`，让标题文字和导出按钮水平排列、垂直居中
   - 移除 header 的 `justifyContent: 'space-between'`，改为 `justifyContent: 'flex-start'`
   - 确认桌面端（文字按钮"📸 导出 PNG"）和移动端（圆形图标按钮）两种样式均正常显示在标题右侧
   - _需求：1.1、1.2、1.3、1.4_

- [ ] 2. 调整导出按钮位置 — 小程序端
   - 修改 `wechat_mini_program/pages/index/index.wxml`：将导出按钮 `.export-btn` 从 `.navbar-content` 的独立子元素改为嵌入 `.navbar-title-area` 内部
   - 修改 `wechat_mini_program/pages/index/index.wxss`：调整 `.navbar-title-area` 为 `flex-direction: row; align-items: center; gap: 16rpx`，标题文字独立为一列（内部 column），导出按钮紧跟其右
   - 移除 `.navbar-content` 的 `justify-content: space-between`
   - _需求：1.5、1.6_

- [ ] 3. 颜色面板弹窗化改造 — Web 端 ColorPickerPanel 组件
   - 修改 `src/components/ColorPickerPanel.tsx`：
     - 移除色块内的 `expandedIndex` 展开/折叠逻辑和 ▼/▲ 按钮
     - 为每个色块添加"修改"按钮（取代原 ▼ 按钮位置），点击后设置 `editingIndex` 状态
     - 新增模态弹窗 UI：当 `editingIndex !== null` 时渲染弹窗
     - 弹窗结构：半透明遮罩层（点击关闭）+ 居中白色弹窗卡片（M3 风格圆角+阴影）
     - 弹窗内容：标题（色块名称如"板面背景"）、`HexColorPicker` 颜色选择器、R/G/B 三通道滑块、RGB 文本输入框、右上角关闭按钮（×）
     - 支持 ESC 键关闭弹窗（`useEffect` 监听 keydown）
   - _需求：2.1、2.2、2.3、2.4、2.5、2.6、2.7、2.8_

- [ ] 4. 实现 RGB 文本输入功能 — Web 端
   - 在 `src/components/ColorPickerPanel.tsx` 弹窗中添加 RGB 文本输入框
   - 输入框 placeholder 为 `"R,G,B（如 178,34,34）"`
   - 实现校验逻辑：解析逗号分隔的三个数字，判断是否为 0-255 的整数
   - 合法时立即调用对应的 `setters[index]` 更新颜色，选择器和滑块同步联动
   - 不合法时输入框显示红色边框，不改变当前颜色
   - 当颜色通过选择器/滑块改变时，输入框的值同步更新为当前 RGB 字符串
   - _需求：2.9、2.10、2.11、2.12、2.13_

- [ ] 5. 颜色面板弹窗化改造 — 小程序端 color-panel 组件
   - 修改 `wechat_mini_program/components/color-panel/color-panel.wxml`：
     - 移除色块内的 `expandedIndex` 展开/折叠逻辑和 ▼/▲ 按钮及 `.slot-editor` 区域
     - 为每个色块添加"修改"按钮，`catchtap="onOpenEditor"` 并传递 `data-index`
     - 在模板底部新增弹窗结构：遮罩层 + 居中弹窗卡片，使用 `wx:if="{{editingIndex >= 0}}"` 控制显示
     - 弹窗内嵌入 `<color-picker>` 组件、RGB 滑块、RGB 文本输入框（`<input>`）、关闭按钮
   - 修改 `wechat_mini_program/components/color-panel/color-panel.wxss`：
     - 新增弹窗遮罩层样式（fixed 全屏、半透明黑色背景）
     - 新增弹窗卡片样式（居中定位、M3 风格圆角/阴影/背景色）
     - 新增 RGB 输入框样式及错误状态红色边框
   - 修改 `wechat_mini_program/components/color-panel/color-panel.js`：
     - 新增 `editingIndex` data 字段（初始 -1）
     - 实现 `onOpenEditor`、`onCloseEditor` 方法
     - 实现 `onRgbInput` 方法：解析输入、校验合法性、设置颜色
     - 新增 `rgbInputValue` 和 `rgbInputError` data 字段
     - 弹窗内拾色器/滑块变化时同步更新 `rgbInputValue`
   - _需求：2.1、2.2、2.3、2.4、2.5、2.6、2.7、2.8、2.9、2.10、2.11、2.12、2.13、2.14_

- [ ] 6. 智能配色 Bug 修复 — 编写 topSecondary 动态对比色算法
   - 设计通用算法函数 `generateContrastColor(primaryHex)`：
     - 将 primaryHex 转为 HSL
     - 若 primary 亮度 ≤ 0.5（深色），则生成同色相、高亮度（0.85-0.90）、中饱和度的浅色
     - 若 primary 亮度 > 0.5（浅色），则生成同色相、低亮度（0.15-0.20）、高饱和度的深色
     - 计算对比度，若不足 3:1 则进一步调整亮度直到满足
   - 该算法需在 Web 端和小程序端各实现一份，逻辑完全一致
   - _需求：3.2.1、3.2.2、3.2.3、3.2.4、3.2.5_

- [ ] 7. 智能配色 Bug 修复 — Web 端 m3color.ts
   - 修改 `src/m3color.ts`：
     - 新增辅助函数：`hexToHsl`、`hslToHex`、`getRelativeLuminance`、`getContrastRatio`、`generateContrastColor`
     - 修改 `generateM3Palette` 函数：`topSecondary` 不再使用 `lightScheme.onPrimary`，改为 `generateContrastColor(topPrimary)`
     - 修改 `generateM3PaletteDark` 函数：同样应用相同修复
   - _需求：3.3.6、3.3.8_

- [ ] 8. 智能配色 Bug 修复 — 小程序端 m3color.js
   - 修改 `wechat_mini_program/utils/m3color.js`：
     - 移除 `topSecondary = '#FFFFFF'` 硬编码
     - 新增 `generateContrastColor` 函数（与 Web 端逻辑一致）
     - 在 `generateM3Palette` 中调用 `generateContrastColor(topPrimary)` 生成 `topSecondary`
   - 验证：对相同种子颜色，两端生成的 `topSecondary` 应完全一致或视觉高度接近
   - _需求：3.3.7、3.2.5_

- [ ] 9. 双端整体验证与样式微调
   - 验证导出按钮位置在 Web 桌面端、Web 移动端、小程序端三种场景下均正确显示在标题右侧
   - 验证颜色编辑弹窗在两端的打开/关闭、颜色选择器联动、RGB 滑块联动、RGB 输入框联动均正常
   - 验证弹窗关闭后颜色保留、预览区已更新
   - 验证智能配色功能：对多个种子颜色（红、绿、蓝、黄、紫等）测试 topSecondary 不再为纯白色，且与 topPrimary 有足够对比度
   - 验证色块拖拽/长按交换颜色功能未受影响
   - 验证导出 PNG 功能（Web 端下载 + 小程序端保存相册）未受影响
   - 如有样式微调（间距、字号、颜色等）统一修复
   - _需求：1.6、2.14、3.2.5_
