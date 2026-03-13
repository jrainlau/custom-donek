# 实施计划

- [ ] 1. 初始化 Vite + React + TypeScript 项目
   - 在项目根目录执行 Vite 初始化，选择 React + TypeScript 模板
   - 安装核心依赖：`react-colorful`（颜色选择器）、`idb`（IndexedDB 封装）、`html-to-image`（DOM 转 PNG）
   - 将已优化的 SVG 文件（`src/assets/Topsheet.svg`、`src/assets/Base.svg`）纳入项目资源
   - 配置 Vite 支持 SVG 以原始文本方式导入（`?raw` 后缀）
   - 确保 `npm run dev` 和 `npm run build` 正常运行
   - _需求：1.1、1.2、1.3_

- [ ] 2. 定义类型接口与常量数据
   - 定义 `ColorScheme` 类型接口，包含：`id`、`name`、`topPrimary`、`topSecondary`、`baseBg`、`basePattern` 共 6 个字段（颜色字段内部存储为 HEX 格式）
   - 定义 `SavedColorScheme` 类型，继承 `ColorScheme` 并增加 `createdAt` 时间戳
   - 将 10 套预设配色模板定义为常量数组 `PRESET_SCHEMES`，每套包含风格名称和 4 个颜色值
   - 实现 `hexToRgb` 和 `rgbToHex` 转换工具函数，用于内部 HEX 与展示用 RGB 之间的转换
   - _需求：4.1、4.4（预设配色表）_

- [ ] 3. 实现 SVG 内联渲染与颜色替换组件
   - 创建 `SvgPreview` 组件，通过 `?raw` 导入 SVG 文本，使用 `dangerouslySetInnerHTML` 内联到 DOM
   - 组件接收 `primaryColor` 和 `secondaryColor` 两个 props
   - 通过 `useEffect` + `useRef` 获取内联 SVG 的 DOM 引用，查找其中的 `<style>` 标签并动态修改 `.color-primary` / `.color-secondary`（板面）或 `.color-pattern` / `.color-bg`（板底）的 fill 值
   - 确保颜色变化在 100ms 内完成渲染
   - _需求：2.1、2.2、2.3、2.4、2.5、2.6_

- [ ] 4. 实现 RGB 颜色选择器面板
   - 使用 `react-colorful` 的 `HexColorPicker` 组件（该组件原生不含 Alpha 通道，符合需求）
   - 创建 `ColorPickerPanel` 组件，包含 4 组颜色选择器，分别对应：板面颜色 1、板面颜色 2、板底颜色 1、板底颜色 2
   - 每个颜色选择器下方展示当前颜色的 RGB 值文本（如 `RGB(211, 73, 55)`），并支持用户直接输入 RGB 值
   - 点击 RGB 值文本时通过 `navigator.clipboard.writeText` 将其复制到剪贴板，并显示短暂的「已复制」提示
   - 颜色变化时通过回调函数实时通知父组件更新 SVG 预览
   - _需求：3.1、3.2、3.3、3.4、3.5_

- [ ] 5. 实现预设配色模板展示与切换
   - 创建 `PresetTemplates` 组件，以卡片/网格形式展示 10 套预设配色
   - 每套模板展示风格名称 + 4 个圆形色块，色块下方标注 RGB 值
   - 点击模板时调用回调将 4 个颜色值应用到全局状态，触发 SVG 预览更新
   - 当前选中的模板卡片高亮显示（添加边框或阴影效果）
   - _需求：4.1、4.2、4.3、4.4_

- [ ] 6. 实现 IndexedDB 存储服务
   - 使用 `idb` 库封装 IndexedDB 操作，创建 `colorSchemeDB` 服务模块
   - 实现 `saveScheme(scheme)`、`getAllSchemes()`、`deleteScheme(id)` 三个核心方法
   - 数据库名称 `donek-color-db`，对象仓库名称 `user-schemes`
   - 添加 IndexedDB 不可用时自动降级到 localStorage 的检测与回退逻辑
   - _需求：5.2、5.3、5.5、5.6_

- [ ] 7. 实现用户自定义配色保存与管理 UI
   - 创建 `UserSchemes` 组件，展示用户已保存的配色方案列表
   - 实现"保存配色"按钮，点击后弹出命名输入框（Modal 或 Popover），确认后调用存储服务保存
   - 每个已保存方案支持点击应用和删除操作
   - 页面加载时自动从 IndexedDB 读取并渲染用户配色列表
   - _需求：5.1、5.2、5.3、5.4、5.5_

- [ ] 8. 实现一键导出效果图 PNG
   - 创建一个隐藏的"导出画布"区域（`ExportCanvas` 组件），包含板面 SVG、板底 SVG 以及 4 个颜色色块和 RGB 值标注
   - 使用 `html-to-image` 的 `toPng` 方法将该区域渲染为 PNG
   - 通过设置 `pixelRatio` 确保输出分辨率不低于 1920×1080
   - 导出时展示 loading 状态，完成后自动触发浏览器下载
   - _需求：6.1、6.2、6.3、6.4、6.5_

- [ ] 9. 组装主页面布局与整体样式
   - 创建 `App.tsx` 主页面，使用 CSS Modules 或内联样式实现整体布局
   - 布局分为：左侧/中央的 SVG 预览区、右侧的颜色控制区、底部的配色模板区、操作按钮区
   - 设置浅暖色调（奶油色 `#FDF6EC` 或类似）背景
   - 为可交互元素添加 hover 效果、光标变化和平滑过渡动画
   - 实现基本响应式布局，确保桌面端（≥1024px）展示良好
   - 使用 React `useState` 管理全局 4 色状态，串联所有子组件
   - _需求：7.1、7.2、7.3、7.4、7.5_

- [ ] 10. 整体联调与细节打磨
   - 验证全链路流程：加载页面 → 选择模板/自定义颜色 → SVG 实时预览 → 保存配色 → 导出 PNG
   - 检查颜色选择器拖拽时的渲染性能，必要时添加防抖优化
   - 确认导出 PNG 中板面、板底、配色色块和 RGB 值均正确展示
   - 测试 IndexedDB 存储/读取/删除的正确性，以及 localStorage 降级逻辑
   - 确保页面无 TypeScript 编译错误、无控制台报错
   - _需求：1.2、2.6、5.6、6.5_
