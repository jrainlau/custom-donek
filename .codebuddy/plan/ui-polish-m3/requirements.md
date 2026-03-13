# 需求文档

## 引言

本次迭代对 Donek 滑雪板配色定制应用进行 **UI 全面优化升级**，包括 5 个方面：

1. **统一颜色中文标签**：将所有颜色名称统一为"板面背景"、"板面 logo"、"板底背景"、"板底 logo"
2. **简化预设/我的配色区域**：移除预设配色与我的配色区域中的 RGB 值展示，保持卡片简洁
3. **预览区域优化**：缩窄预览区宽度，两个 SVG 排列更紧凑
4. **Material Design 3 UI 风格全面升级**：整体 UI 切换到 M3 设计风格，必要时引入官方 UI 组件库（如 `@material/web`）
5. **移动端响应式适配**：小屏设备下改为上下布局，预览区 SVG 横向展示并固定在页面顶端，功能区在下方可滚动

### 技术背景

| 项目 | 当前状态 | 说明 |
|------|---------|------|
| 颜色标签 | 板面：主体色/细节色；板底：图案色/背景色 | 需统一为：板面背景/板面 logo、板底背景/板底 logo |
| 预设配色卡片 | 色块 + RGB 值 | 需移除 RGB 值 |
| 我的配色卡片 | 色块 + RGB 值 | 需移除 RGB 值 |
| 预览区布局 | `gridTemplateColumns: '1fr 1fr'`，两个 SVG 间距 20px | 需缩窄宽度、减小间距 |
| UI 风格 | 自定义样式（非 M3） | 需全面切换到 M3 风格 |
| 移动端 | 无专门适配 | 需实现上下布局 + SVG 横向 + 顶部固定 |
| 已有依赖 | `@material/material-color-utilities`（仅配色算法） | 需额外引入 M3 UI 组件库 |

### 映射关系说明

| 新标签 | 对应状态变量 | SVG class | 说明 |
|--------|------------|-----------|------|
| 板面背景 | `topPrimary` | `.color-primary` | Topsheet.svg 的大面积背景色 |
| 板面 logo | `topSecondary` | `.color-secondary` | Topsheet.svg 的 logo/细节色 |
| 板底背景 | `baseBg` | `.color-bg` | Base.svg 的底色 |
| 板底 logo | `basePattern` | `.color-pattern` | Base.svg 的图案/logo 色 |

---

## 需求

### 需求 1：统一颜色中文标签

**用户故事：** 作为一名用户，我希望所有颜色标签使用一致且易懂的中文名称（板面背景、板面 logo、板底背景、板底 logo），以便准确理解每个颜色对应的实际位置

#### 验收标准

1. WHEN 颜色配置面板（`ColorPickerPanel`）渲染时 THEN 系统 SHALL 将 4 个颜色标签分别显示为"板面背景"、"板面 logo"、"板底背景"、"板底 logo"
2. WHEN 智能配色组件（`SmartPalette`）中的 4 个色块渲染时 THEN 系统 SHALL 将位置标签分别显示为"板面背景"、"板面 logo"、"板底背景"、"板底 logo"
3. WHEN SVG 预览区域的标签渲染时 THEN 系统 SHALL 将两个 SVG 的标签分别显示为"板面"和"板底"（保持与现有一致或适配新命名）
4. WHEN 导出 PNG 包含颜色标注时 THEN 系统 SHALL 使用新的统一标签名称
5. WHEN 任何组件展示颜色名称时 THEN 系统 SHALL 确保同一颜色在所有位置的名称保持一致，不出现"主体色""细节色""图案色"等旧名称

---

### 需求 2：预设配色与我的配色区域移除 RGB 显示

**用户故事：** 作为一名用户，我希望预设配色和我的配色区域更加简洁清爽，不需要展示 RGB 值，以便快速浏览和选择配色方案

#### 验收标准

1. WHEN 预设配色（`PresetTemplates`）卡片渲染时 THEN 系统 SHALL 仅显示方案名称和 4 个色块圆点，不再显示每个颜色的 RGB 值文本
2. WHEN 我的配色（`UserSchemes`）卡片渲染时 THEN 系统 SHALL 仅显示方案名称和 4 个色块圆点，不再显示每个颜色的 RGB 值文本
3. WHEN 上述区域移除 RGB 后 THEN 系统 SHALL 保持卡片布局紧凑美观，色块居中显示
4. IF 代码中 `hexToRgbString` 的引用在移除后变为未使用 THEN 系统 SHALL 清理对应的无用 import（仅在该文件内确实不再使用的情况下）

---

### 需求 3：预览区域缩窄与紧凑化

**用户故事：** 作为一名用户，我希望左侧预览区域更加紧凑，两个 SVG 之间间距更小，整体宽度适当缩窄，以便为右侧功能区留出更多空间

#### 验收标准

1. WHEN 桌面端左右分栏布局渲染时 THEN 系统 SHALL 将预览区的列宽比例从 `1fr 1fr` 调整为约 `2fr 3fr`（或类似比例），使预览区约占页面 40% 宽度
2. WHEN 两个 SVG 并排显示时 THEN 系统 SHALL 将它们之间的间距从 20px 缩减到 12px 或更小
3. WHEN 预览容器的内边距渲染时 THEN 系统 SHALL 将 padding 从 24px 缩减到 16px 或更小
4. WHEN SVG 预览区宽度缩窄后 THEN 系统 SHALL 确保 SVG 仍然完整可见，自适应新的容器尺寸
5. WHEN 预览区宽度调整后 THEN 系统 SHALL 确保右侧功能区获得更充裕的空间，各功能模块布局不变

---

### 需求 4：全套 Material Design 3 UI 风格

**用户故事：** 作为一名用户，我希望整个应用采用 Material Design 3 的视觉风格，以获得现代、一致、美观的使用体验

#### 验收标准

1. WHEN 应用加载时 THEN 系统 SHALL 采用 M3 的色彩系统（surface、on-surface、primary、secondary 等 token）作为全局配色基础
2. WHEN 按钮渲染时 THEN 系统 SHALL 采用 M3 风格的按钮样式（圆角 20px、state layer、elevation 等），包括 Filled Button、Outlined Button、Text Button 等变体
3. WHEN 卡片/面板区域渲染时 THEN 系统 SHALL 采用 M3 的 Surface 容器样式（surface-container、surface-container-low 等色调、圆角 12~16px、适当 elevation）
4. WHEN 标题/文字渲染时 THEN 系统 SHALL 采用 M3 的 Typography Scale（如 Title Medium、Body Large、Label Medium 等字号层级）
5. WHEN 顶部标题栏渲染时 THEN 系统 SHALL 采用 M3 风格的 Top App Bar 样式（surface 背景、on-surface 文字色、适当 elevation）
6. WHEN 颜色选择器展开/收起时 THEN 系统 SHALL 添加 M3 风格的过渡动画（ease 曲线、适当时长）
7. WHEN 弹窗/对话框（如保存配色对话框）渲染时 THEN 系统 SHALL 采用 M3 Dialog 风格（scrim 背景、surface 容器、圆角 28px）
8. IF 引入 M3 UI 组件库（如 `@material/web`） THEN 系统 SHALL 在项目中正确安装和配置，确保与现有 React 组件兼容
9. IF 使用自定义 CSS 实现 M3 风格（不引入组件库） THEN 系统 SHALL 定义一套 M3 design tokens 变量（CSS 自定义属性），确保风格一致性
10. WHEN M3 风格应用后 THEN 系统 SHALL 确保所有交互状态（hover、pressed、focused、disabled）都符合 M3 的 state layer 规范

---

### 需求 5：移动端响应式适配

**用户故事：** 作为一名手机用户，我希望在移动端获得针对小屏优化的布局体验——预览区固定在顶部、功能区在下方可滚动，以便在手机上也能方便地定制配色

#### 验收标准

1. WHEN 屏幕宽度 < 768px（移动端断点） THEN 系统 SHALL 将布局从左右分栏切换为上下布局
2. WHEN 移动端上下布局时 THEN 系统 SHALL 将预览区固定在页面最顶端（`position: fixed` 或 `sticky`），不随页面滚动
3. WHEN 移动端预览区渲染时 THEN 系统 SHALL 将两个 SVG 改为横向排列（水平并排），适配横向空间
4. WHEN 移动端预览区固定在顶部时 THEN 系统 SHALL 为预览区设置合适的固定高度（如屏幕高度的 30%~40%），确保不遮挡过多内容区域
5. WHEN 移动端功能区渲染时 THEN 系统 SHALL 将功能模块从上到下垂直排列，可自由滚动
6. WHEN 移动端功能区滚动时 THEN 系统 SHALL 确保顶部预览区始终保持可见，不被功能区覆盖
7. WHEN 移动端布局时 THEN 系统 SHALL 移除桌面端不适用的元素或交互（如拖拽提示可简化为仅点击交换），保持界面简洁
8. WHEN 移动端预览区 SVG 横向排列时 THEN 系统 SHALL 确保 SVG 完整可见、宽高比正确、居中显示
9. WHEN 屏幕宽度在 768px 上下切换时 THEN 系统 SHALL 平滑过渡布局变化，不出现闪烁或布局跳动
10. WHEN 移动端下方功能区渲染时 THEN 系统 SHALL 设置合适的 `padding-top`（等于预览区固定高度），避免功能区内容被预览区遮挡

---

## 边界情况与注意事项

1. **标签统一的影响范围**：需要检查所有使用旧标签名的位置——包括 `ColorPickerPanel`、`SmartPalette`、`ExportCanvas`、`PresetTemplates` 卡片 tooltip 等，确保无遗漏
2. **M3 UI 组件库选择**：`@material/web` 是 Google 官方的 Web Components M3 库，可在 React 中使用但需注意 Web Components 与 React 事件系统的兼容性；另一方案是纯 CSS 实现 M3 风格（使用 M3 design tokens），无兼容性问题
3. **移动端 SVG 横向显示**：滑雪板 SVG 是 190×1000 的竖长图形。横向排列时可能需要将 SVG 旋转 90° 或保持竖直但缩小至横向容器内，需要选择合适的展示策略
4. **移动端固定预览区与滚动冲突**：固定预览区后需确保下方功能区可滚动，且不存在 iOS Safari 等环境下的 `position: fixed` 弹跳/卡顿问题
5. **已有功能不受影响**：本次 UI 升级不应破坏已有的智能配色、手动选色、预设模板、用户配色保存/加载、导出 PNG 等功能
6. **CSS 变量管理**：M3 design tokens 建议定义在全局 CSS 变量中，方便后续主题切换或 dark mode 扩展
7. **性能考虑**：M3 组件库引入后需关注 bundle size，仅按需引入使用到的组件
