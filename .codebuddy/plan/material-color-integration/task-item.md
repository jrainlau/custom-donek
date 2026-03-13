# 实施计划

- [ ] 1. 安装 `@material/material-color-utilities` 依赖并创建 M3 配色工具模块
   - 在 `package.json` 中添加 `@material/material-color-utilities` 依赖并执行 `npm install`
   - 新建 `src/m3color.ts` 工具模块，封装核心函数：接收一个 HEX 种子颜色，调用 M3 库的 `themeFromSourceColor` 或 `SchemeContent` 等 API 生成色彩方案，从中提取 4 个具有代表性的颜色（primary、onPrimary、primaryContainer、onPrimaryContainer），返回 `{ topPrimary, topSecondary, basePattern, baseBg }` 格式的对象
   - 编写 `argbToHex` 和 `hexToArgb` 辅助转换函数（M3 库内部使用 ARGB 整数格式）
   - _需求：1.1、1.2、1.4_

- [ ] 2. 创建智能配色组件 `SmartPalette`
   - 新建 `src/components/SmartPalette.tsx`，UI 包含：一个种子颜色选择器（复用 `react-colorful` 的 `HexColorPicker`）、4 个生成的颜色结果色块
   - 用户选择种子颜色时，调用 `src/m3color.ts` 中的函数实时生成 4 色方案
   - 每个色块下方显示 RGB 值标签和对应的应用位置名称（板面主体色、板面细节色、板底图案色、板底背景色）
   - 提供"应用配色"按钮或在颜色变化时自动应用到主状态
   - _需求：1.1、1.2、1.3、1.5_

- [ ] 3. 实现 4 色可拖拽交换功能
   - 在 `SmartPalette` 组件内，为 4 个颜色色块添加 HTML5 Drag & Drop 支持（`draggable`、`onDragStart`、`onDragOver`、`onDrop` 事件）
   - 拖拽逻辑：将一个色块拖到另一个色块上时，交换两者的颜色值和位置标签
   - 拖拽视觉反馈：被拖拽色块添加提升阴影效果，目标位置添加高亮边框提示，交换完成后 CSS transition 过渡动画
   - 触控设备备选交互：点击选中一个色块后再点击另一个色块完成交换
   - 交换后实时更新 SVG 预览
   - _需求：2.1、2.2、2.3、2.4、2.5_

- [ ] 4. 重构 `App.tsx` 布局为左右分栏
   - 修改 `App.tsx` 中的主体区域 grid 布局：左侧为预览区（仅包含板面和板底的 `SvgPreview` 组件），右侧为功能区（包含 `ColorPickerPanel`、`SmartPalette`、`PresetTemplates`、`UserSchemes`、`ExportCanvas`）
   - 左侧预览区使用 `position: sticky; top: 24px` 固定，右侧功能区自然滚动
   - 宽度比例约为 1:1 或适当调整（如 `gridTemplateColumns: '1fr 1fr'`）
   - 将原本在左侧下方的 `PresetTemplates` 和 `UserSchemes` 移动到右侧功能区
   - _需求：3.1、3.2、3.3、3.4_

- [ ] 5. 修复 SVG 预览自适应显示
   - 修改 `SvgPreview` 组件：移除固定的 `maxWidth`/`maxHeight` 约束，改用 `width: 100%` + `object-fit: contain` 策略
   - 在 SVG 容器上设置 `overflow: visible`（当前为 `hidden` 导致截断），或确保容器尺寸足够
   - 确保 SVG 的 `viewBox` 属性正确，使 SVG 能自适应任意容器尺寸
   - 板面和板底两个 SVG 合理分配预览区空间，垂直排列且均完整可见
   - 窗口大小变化时 SVG 自动调整（CSS 自适应，无需 JS resize 监听）
   - _需求：4.1、4.2、4.3、4.4、4.5_

- [ ] 6. 将 `SmartPalette` 集成到 `App.tsx` 状态管理中
   - 在 `App.tsx` 中引入 `SmartPalette` 组件，传入当前 4 色状态和对应的 `onChange` 回调
   - 智能配色生成的颜色通过回调函数更新 `App.tsx` 的 `topPrimary`、`topSecondary`、`basePattern`、`baseBg` 状态
   - 确保智能配色、手动选色、预设模板三者之间状态联动正确：任一方式修改颜色后其他面板应同步显示最新颜色
   - _需求：1.3、1.4_

- [ ] 7. 错误处理与优雅降级
   - 在 `src/m3color.ts` 中添加 try-catch，若 M3 库调用失败则返回 null 或默认配色
   - 在 `SmartPalette` 组件中处理 M3 生成失败的情况：显示友好的错误提示信息，不影响页面其他功能
   - 确保 M3 库加载失败时，手动选色面板（`ColorPickerPanel`）、预设模板、用户配色保存等已有功能完全不受影响
   - _需求：1.5_

- [ ] 8. 联调验证与 TypeScript 编译检查
   - 运行 `tsc -b --noEmit` 确保零 TypeScript 错误
   - 运行 `npm run build` 确保 Vite 构建成功
   - 验证功能联动：智能配色生成 → 拖拽交换 → SVG 实时预览更新 → 手动微调 → 导出 PNG 流程完整
   - 验证已有功能未受影响：预设模板切换、用户配色保存/加载、颜色复制、RGB 值显示等
   - 验证 SVG 预览在不同窗口尺寸下均完整显示、不截断
   - _需求：1.1~1.5、2.1~2.5、3.1~3.4、4.1~4.5_
