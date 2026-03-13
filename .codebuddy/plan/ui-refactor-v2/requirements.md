# 需求文档 — UI 重构 V2

## 引言

本需求文档涵盖滑雪板配色定制工具的第二轮 UI 重构，共包含 5 个核心需求：移除智能配色独立面板并将种子颜色功能集成到颜色配置标题栏、修正板底颜色定义映射关系、修复板面 SVG 外沿毛刺、移动端预设配色布局优化、以及将导出按钮集成到页面 header。

---

## 需求

### 需求 1：移除智能配色独立面板，将功能集成到颜色配置区域

**用户故事：** 作为一名用户，我希望智能配色的种子颜色选择器和生成按钮直接嵌入到"颜色配置"区域的标题栏右侧，同时颜色配置中的四个颜色项支持拖拽排列，以便减少页面占用空间、让操作更紧凑，同时保留灵活调整配色顺序的能力。

#### 验收标准

1. WHEN 页面加载完成 THEN 系统 SHALL 不再渲染独立的"智能配色"面板卡片（即 `SmartPalette` 组件当前所在的独立 `<div>` 容器）。
2. WHEN 页面加载完成 THEN "颜色配置"区域的标题栏右侧 SHALL 展示种子颜色色块和"生成配色"按钮，布局紧凑，与标题在同一行。
3. WHEN 用户点击种子颜色色块 THEN 系统 SHALL 展开/收起颜色选择器（HexColorPicker），选择器显示在标题栏下方。
4. WHEN 用户点击"生成配色"按钮 THEN 系统 SHALL 基于当前种子颜色生成 M3 配色并应用到 4 个颜色通道。
5. WHEN 种子颜色变化时 THEN 系统 SHALL 保持现有的防抖逻辑（150ms 延迟生成配色）。
6. WHEN 颜色配置区域渲染四个颜色项时 THEN 系统 SHALL 支持拖拽排列功能——用户可以拖动任意颜色项与其他颜色项交换位置，交换后对应的颜色值同步更新到 SVG 预览。
7. WHEN 用户拖动颜色项进行交换时 THEN 系统 SHALL 交换两个颜色项的颜色值（而非标签），标签（板面背景、板面 logo、板底背景、板底 logo）保持固定不动。
8. IF 拖拽交换完成后 THEN 系统 SHALL 立即更新 SVG 预览以反映新的颜色分配。

---

### 需求 2：板底 logo 与板底背景的颜色定义互换

**用户故事：** 作为一名用户，我希望板底 logo 和板底背景的颜色对应关系被修正，以便 SVG 中的 `color-pattern` class 对应"板底背景"、`color-bg` class 对应"板底 logo"。

#### 验收标准

1. WHEN 颜色配置面板中"板底 Base"区域渲染时 THEN 系统 SHALL 将第一个颜色项显示为"板底背景"（对应 `basePattern` / `color-pattern`），第二个颜色项显示为"板底 logo"（对应 `baseBg` / `color-bg`）。
2. WHEN 颜色标签交换后 THEN 系统 SHALL 确保颜色配置面板 (`ColorPickerPanel`) 中的标签与颜色值映射一致：
   - "板底背景" → `basePattern` → `onBasePatternChange`
   - "板底 logo" → `baseBg` → `onBaseBgChange`
3. WHEN 智能配色的 4 色槽位定义存在时（如 `SmartPalette` 中的 `slots` 数组）THEN 系统 SHALL 同步交换"板底 logo"和"板底背景"的定义顺序。
4. WHEN 导出画布渲染配色信息时 THEN `ExportCanvas` 中的 `colors` 数组 SHALL 同步反映交换后的标签顺序。

---

### 需求 3：修复板面 SVG 外沿毛刺

**用户故事：** 作为一名用户，我希望板面 Topsheet 的 SVG 在预览时边缘光滑、没有锯齿毛刺，以便获得更好的视觉体验。

#### 验收标准

1. WHEN 板面 Topsheet SVG 被渲染时 THEN 系统 SHALL 确保 SVG 元素具有 `shape-rendering: geometricPrecision` 属性（或等效的抗锯齿设置），使外沿不出现毛刺。
2. IF SVG 中的路径使用了整数坐标导致渲染锯齿 THEN 系统 SHALL 通过在 `<svg>` 标签上添加抗锯齿相关属性来改善（如 `shape-rendering`），而非修改路径数据本身。
3. WHEN 修复应用后 THEN 系统 SHALL 确保板底 Base SVG 的渲染不受影响（或同样受益于抗锯齿改善）。

---

### 需求 4：移动端预设配色改为一行两个

**用户故事：** 作为一名移动端用户，我希望预设配色区域在移动端下每行显示两个预设方案，以便更好地利用屏幕空间、减少滚动。

#### 验收标准

1. WHEN 屏幕宽度 ≤ 768px（移动端）THEN 预设配色 (`PresetTemplates`) 组件 SHALL 使用 `grid-template-columns: repeat(2, 1fr)` 布局，确保每行恰好两个卡片。
2. WHEN 屏幕宽度 > 768px（桌面端）THEN 预设配色组件 SHALL 保持当前的 `repeat(auto-fill, minmax(160px, 1fr))` 自适应布局。
3. WHEN 移动端布局应用后 THEN 每个预设卡片 SHALL 保持完整的名称和色块展示，不出现截断或溢出。

---

### 需求 5：导出按钮集成到 Header，移动端改为圆形图标按钮

**用户故事：** 作为一名用户，我希望"导出效果图 PNG"按钮位于页面顶部 header 的最右侧，移动端下变为符合 Material Design 规范的圆形图标按钮（无文字），以便节省空间并保持 UI 一致性。

#### 验收标准

1. WHEN 页面加载完成 THEN 系统 SHALL 在 header 的最右侧渲染导出按钮，且功能区底部不再有独立的导出按钮卡片。
2. WHEN 屏幕宽度 > 768px（桌面端）THEN 导出按钮 SHALL 显示为包含文字的 M3 风格按钮（如 Filled Tonal Button），文字为"导出 PNG"或类似简短文案。
3. WHEN 屏幕宽度 ≤ 768px（移动端）THEN 导出按钮 SHALL 变为 MD3 规范的 FAB-style 圆形按钮：
   - 尺寸约 40×40px
   - 仅显示导出/下载图标（如 SVG 下载图标），不显示文字
   - 使用 `var(--md-sys-color-primary)` 作为背景色
   - 使用 `var(--md-sys-color-on-primary)` 作为图标色
4. WHEN 用户点击 header 中的导出按钮 THEN 系统 SHALL 触发与原来相同的 PNG 导出逻辑（html-to-image）。
5. WHEN 导出正在进行中 THEN 按钮 SHALL 显示加载状态（禁用点击 + 视觉反馈）。
6. IF 导出需要的 SVG 原始数据和颜色状态 THEN 导出逻辑 SHALL 通过 props 或回调从父组件（App）传入，确保 header 区域可以正确执行导出。

---

## 技术约束与注意事项

- 所有改动需通过 `tsc -b` 类型检查和 `vite build` 构建验证。
- 颜色标签的变更需在所有涉及的组件中保持一致（SmartPalette slots、ColorPickerPanel、ExportCanvas colors）。
- 导出按钮从功能区移至 header 需要将 `ExportCanvas` 组件的导出逻辑与隐藏画布进行拆分，或将整个组件移至 header 内部渲染。
- SVG 抗锯齿处理应在 `SvgPreview` 的 `processedSvg` 处理逻辑中注入，确保所有实例统一生效。
- 移动端布局变更需要 `PresetTemplates` 组件感知 `isMobile` 状态，可通过 prop 传递。
- 拖拽排列功能可复用 `SmartPalette` 中现有的 `@dnd-kit` 实现逻辑，迁移至 `ColorPickerPanel` 组件中。拖拽交换的是颜色值，标签位置保持固定。
