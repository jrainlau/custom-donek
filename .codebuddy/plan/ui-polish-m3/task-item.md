# 实施计划

- [ ] 1. 定义 M3 Design Tokens 并重写全局样式
   - 在 `src/index.css` 中定义一套 M3 CSS 自定义属性（`--md-sys-color-primary`、`--md-sys-color-surface`、`--md-sys-color-on-surface`、`--md-sys-color-surface-container`、`--md-sys-color-surface-container-low`、`--md-sys-color-outline`、`--md-sys-color-secondary` 等），以浅色主题为基准
   - 添加 M3 Typography Scale 变量（`--md-sys-typescale-title-large`、`--md-sys-typescale-title-medium`、`--md-sys-typescale-body-large`、`--md-sys-typescale-label-medium` 等）
   - 添加 M3 圆角/elevation 变量（`--md-sys-shape-corner-medium: 12px`、`--md-sys-shape-corner-large: 16px`、`--md-sys-shape-corner-extra-large: 28px`）
   - 设置 `body` 的 `background-color` 为 `var(--md-sys-color-surface)`，`color` 为 `var(--md-sys-color-on-surface)`，`font-family` 引入 Roboto 或保持系统字体
   - 添加 768px 移动端断点的媒体查询基础变量
   - _需求：4.1、4.9_

- [ ] 2. 重构 `App.tsx` 顶部标题栏与主体布局为 M3 风格
   - 将 header 背景改为 `var(--md-sys-color-surface)`，文字色改为 `var(--md-sys-color-on-surface)`，移除渐变背景，采用 M3 Top App Bar 规范（elevation level 0~2）
   - 将主体区域的 `gridTemplateColumns` 从 `'1fr 1fr'` 改为 `'2fr 3fr'`，使预览区约占 40% 宽度
   - 将右侧各功能模块的卡片容器背景改为 `var(--md-sys-color-surface-container-low)`，圆角改为 `var(--md-sys-shape-corner-large)`
   - 预览区内部容器：gap 从 `20px` 缩减到 `12px`，padding 从 `24px` 缩减到 `16px`
   - _需求：3.1、3.2、3.3、4.1、4.3、4.5_

- [ ] 3. 统一所有组件中的颜色中文标签
   - 在 `ColorPickerPanel.tsx` 中：将"主体色"改为"板面背景"、"细节色"改为"板面 logo"、"图案色"改为"板底 logo"、"背景色"改为"板底背景"
   - 在 `SmartPalette.tsx` 的 `slots` 数组中：将 label 从"板面主体色/板面细节色/板底图案色/板底背景色"改为"板面背景/板面 logo/板底 logo/板底背景"
   - 在 `ExportCanvas.tsx` 的 `colors` 数组中：将"板面主体色/板面细节色/板底图案色/板底背景色"改为"板面背景/板面 logo/板底 logo/板底背景"
   - 确认 `App.tsx` 中 SVG 预览的 `label` 保持"板面 Topsheet"和"板底 Base"不变
   - _需求：1.1、1.2、1.4、1.5_

- [ ] 4. 在 `PresetTemplates.tsx` 和 `UserSchemes.tsx` 中移除 RGB 值展示
   - 在 `PresetTemplates.tsx` 中：删除卡片底部的 `hexToRgbString` 显示区域（`gridTemplateColumns: '1fr 1fr'` 的 4 行 RGB 文本），删除或清理无用的 `hexToRgbString` import
   - 在 `UserSchemes.tsx` 中：删除方案卡片底部的 `hexToRgbString` 显示区域，若文件中不再使用 `hexToRgbString` 则清理对应 import
   - 保持色块圆点居中显示，卡片布局紧凑
   - _需求：2.1、2.2、2.3、2.4_

- [ ] 5. 将 `ColorPickerPanel.tsx` 改造为 M3 风格
   - 标题改用 M3 Title Medium 字体规范，底部边框改为 M3 色调（`var(--md-sys-color-outline-variant)`）
   - 分组标签（"板面 Topsheet"/"板底 Base"）背景改为 `var(--md-sys-color-surface-container)`，圆角保持 `6px`
   - 颜色选择器的色块：border 改为 `var(--md-sys-color-outline)`，选中态 boxShadow 改用 primary 色
   - RGB 滑块和文本保留，但颜色风格统一为 M3 token
   - 展开/收起颜色选择器时添加 M3 风格过渡动画（`transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease`）
   - _需求：4.2、4.3、4.6、4.10_

- [ ] 6. 将 `SmartPalette.tsx` 改造为 M3 风格
   - 标题改用 M3 Title Medium 字体规范
   - "智能配色"按钮改为 M3 Filled Button 样式（`var(--md-sys-color-primary)` 背景、`var(--md-sys-color-on-primary)` 文字、圆角 20px、hover 时添加 state layer）
   - 4 个色块卡片的 border/boxShadow 改用 M3 token（`outline-variant`、`elevation-level1` 等）
   - 拖拽选中态高亮色改为 `var(--md-sys-color-primary)` 
   - _需求：4.2、4.3、4.10_

- [ ] 7. 将 `UserSchemes.tsx` 保存弹窗和按钮改造为 M3 风格
   - "保存当前配色"按钮改为 M3 Filled Tonal Button（`var(--md-sys-color-secondary-container)` 背景、圆角 20px）
   - 保存弹窗改为 M3 Dialog 风格：scrim 背景保持、容器圆角改为 `28px`、背景色改为 `var(--md-sys-color-surface-container-high)`、按钮组使用 M3 Text Button + Filled Button
   - 删除按钮（✕）改用 M3 icon button 风格
   - fallback 提示采用 M3 色调
   - _需求：4.2、4.7、4.10_

- [ ] 8. 将 `PresetTemplates.tsx` 卡片和 `ExportCanvas.tsx` 导出按钮改造为 M3 风格
   - `PresetTemplates.tsx`：卡片选中态 border 改为 `var(--md-sys-color-primary)`，背景改为 `var(--md-sys-color-surface-container-low)`，hover 添加 state layer
   - `ExportCanvas.tsx`：导出按钮改为 M3 Filled Button（primary 色、圆角 20px、state layer），移除渐变背景
   - _需求：4.2、4.3、4.10_

- [ ] 9. 实现移动端响应式适配
   - 在 `App.tsx` 中添加 `useMediaQuery` 自定义 hook 或使用 `window.matchMedia` 检测 `(max-width: 768px)`
   - 移动端布局：将 `gridTemplateColumns` 改为单列（`1fr`），预览区使用 `position: sticky; top: 0; z-index: 100`，高度约为 `35vh`
   - 移动端预览区 SVG：两个 SVG 保持水平并排（横向），缩小至容器高度内，居中显示
   - 功能区设置 `padding-top` 等于预览区高度，各模块垂直堆叠、可自由滚动
   - `SmartPalette` 中的拖拽提示在移动端简化为"点击色块可选中后交换"，隐藏拖拽图标
   - 在 `SvgPreview.tsx` 中支持移动端模式下的样式调整（可通过 prop 或 CSS 类控制）
   - _需求：5.1、5.2、5.3、5.4、5.5、5.6、5.7、5.8、5.10_

- [ ] 10. 全局联调验证与细节修复
   - 执行 `tsc -b` 确保 TypeScript 零错误
   - 执行 `vite build` 确保构建成功
   - 检查所有组件中不再出现"主体色""细节色""图案色"等旧标签
   - 检查 `PresetTemplates` 和 `UserSchemes` 卡片中不再显示 RGB 值
   - 验证桌面端预览区宽度约 40%、SVG 间距 ≤ 12px
   - 验证移动端布局切换（<768px）正常，预览区固定顶部不滚动
   - 验证 M3 风格一致性：按钮圆角 20px、卡片圆角 12~16px、弹窗圆角 28px、交互状态有 state layer
   - 验证导出 PNG 功能正常，标注使用新标签名称
   - _需求：1.5、2.3、3.4、3.5、4.10、5.9_
