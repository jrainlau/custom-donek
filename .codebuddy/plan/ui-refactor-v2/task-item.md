# 实施计划

- [ ] 1. 板底 logo 与板底背景的颜色定义互换
  - 修改 `ColorPickerPanel.tsx`：将"板底 Base"区域下的第一个 `ColorItem` 标签从"板底 logo"改为"板底背景"（对应 `basePattern` / `onBasePatternChange`），第二个从"板底背景"改为"板底 logo"（对应 `baseBg` / `onBaseBgChange`），即交换两个 `ColorItem` 的 `label` 属性
  - 修改 `SmartPalette.tsx` 中 `slots` 数组：将索引 2 的 label 从"板底 logo"改为"板底背景"，索引 3 从"板底背景"改为"板底 logo"
  - 修改 `ExportCanvas.tsx` 中 `colors` 数组：将索引 2 的 label 从"板底 logo"改为"板底背景"，索引 3 从"板底背景"改为"板底 logo"
  - _需求：2.1、2.2、2.3、2.4_

- [ ] 2. 移除智能配色独立面板，将种子颜色 + 生成按钮集成到颜色配置标题栏
  - [ ] 2.1 在 `ColorPickerPanel.tsx` 中新增 props：`seedColor`、`onSeedColorChange`、`onGenerate`、`showSeedPicker`、`onToggleSeedPicker`，以及可选的 `error` 字段
    - 将标题栏 `<h3>` 改为 flex 行布局，左侧保留"🎨 颜色配置"标题，右侧放置种子颜色色块（40×40px，圆角，可点击展开/收起）和"生成配色"按钮（M3 Filled Tonal 样式）
    - 当 `showSeedPicker` 为 true 时，在标题栏下方渲染 `HexColorPicker`（从 `react-colorful` 导入），宽度 100%、高度 160px
    - 如有 `error` 则显示错误提示条
    - _需求：1.2、1.3、1.4_

  - [ ] 2.2 在 `App.tsx` 中管理种子颜色状态并传递给 `ColorPickerPanel`
    - 从 `SmartPalette.tsx` 中提取 `seedColor` state、`showPicker` state、`handleSeedChange`（防抖 150ms）、`handleApply` 逻辑到 `App.tsx`
    - 将 `seedColor`、`showSeedPicker`、`onSeedColorChange`、`onGenerate`、`onToggleSeedPicker`、`error` 作为 props 传入 `ColorPickerPanel`
    - _需求：1.2、1.4、1.5_

  - [ ] 2.3 从 `App.tsx` 中移除智能配色独立面板的渲染
    - 删除包裹 `<SmartPalette>` 的外层 `<div>` 容器及其引用
    - 保留 `SmartPalette` 组件文件（暂不删除），但不再在 App 中渲染
    - 移除 `App.tsx` 中对 `SmartPalette` 的 import
    - _需求：1.1_

- [ ] 3. 在颜色配置面板中实现拖拽排列功能
  - [ ] 3.1 在 `ColorPickerPanel.tsx` 中实现 4 色拖拽交换逻辑
    - 定义固定标签数组：`['板面背景', '板面 logo', '板底背景', '板底 logo']`
    - 定义颜色值数组（通过 props 传入的 4 个颜色值按对应顺序排列）
    - 实现 HTML5 Drag & Drop 拖拽事件处理（参考 `SmartPalette` 中的 `handleDragStart`、`handleDragOver`、`handleDrop`、`handleDragEnd` 逻辑）
    - 实现触控设备点击选中交换（参考 `SmartPalette` 中的 `selectedIndex` + `handleSlotClick` 逻辑）
    - 拖拽交换时调用对应的 `onChange` 回调更新颜色值，标签保持固定
    - _需求：1.6、1.7、1.8_

  - [ ] 3.2 重构 `ColorPickerPanel` 的颜色项布局为可拖拽色块网格
    - 将现有的两列分组布局（板面 Topsheet / 板底 Base）改为统一的 2×2 网格，每个格子为一个可拖拽色块
    - 每个色块显示：固定标签、色块背景色、拖拽图标（⠿）、点击展开颜色选择器
    - 色块的 border 样式响应拖拽状态（isDragging、isDragOver、isSelected）
    - _需求：1.6、1.7_

- [ ] 4. 修复板面 SVG 外沿毛刺
  - 在 `SvgPreview.tsx` 的 `processedSvg` 处理逻辑中，为 `<svg>` 标签注入 `shape-rendering="geometricPrecision"` 属性
  - 该属性在 `svg.replace('<svg', ...)` 的位置统一添加，对 compact 和非 compact 模式均生效
  - _需求：3.1、3.2、3.3_

- [ ] 5. 移动端预设配色改为一行两个
  - 修改 `PresetTemplates.tsx`：新增 `isMobile` 可选 prop
  - 当 `isMobile` 为 true 时，grid 容器使用 `gridTemplateColumns: 'repeat(2, 1fr)'`；否则保持 `'repeat(auto-fill, minmax(160px, 1fr))'`
  - 在 `App.tsx` 中将 `isMobile` 状态传入 `PresetTemplates` 组件
  - _需求：4.1、4.2、4.3_

- [ ] 6. 导出按钮集成到 Header，移动端改为圆形图标按钮
  - [ ] 6.1 将 `ExportCanvas` 组件从功能区底部移至 header 内部
    - 在 `App.tsx` 中，将 `<ExportCanvas>` 从功能区底部的 `<div>` 容器中移除
    - 在 header 的 `<div>` 右侧渲染 `<ExportCanvas>`（或提取导出逻辑到 header 区域）
    - _需求：5.1_

  - [ ] 6.2 修改 `ExportCanvas.tsx` 支持桌面端/移动端双模式按钮
    - 新增 `isMobile` prop
    - 桌面端：渲染 M3 Filled Tonal 按钮，文字为"导出 PNG"，保持当前样式但不占满宽度（`width: auto`）
    - 移动端：渲染 40×40px 圆形 FAB 按钮，背景色 `var(--md-sys-color-primary)`，图标色 `var(--md-sys-color-on-primary)`，仅显示下载图标（内联 SVG），无文字
    - 两种模式复用相同的 `handleExport` 逻辑和加载状态
    - _需求：5.2、5.3、5.4、5.5_

- [ ] 7. 构建验证与最终检查
  - 执行 `npx tsc -b` 确认 TypeScript 零错误
  - 执行 `npx vite build` 确认构建成功
  - 逐项对照需求文档的验收标准，确认所有条目通过
  - _需求：全部_
