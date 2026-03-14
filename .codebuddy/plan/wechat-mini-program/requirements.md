# 需求文档：DONEK 滑雪板配色定制 — 微信小程序版本

## 引言

本项目旨在将现有的 DONEK 滑雪板配色定制 Web 应用（基于 React + Vite + TypeScript）完整移植为**微信小程序原生版本**，放置于项目根目录的 `wechat_mini_program` 目录下。

### 现有 Web 应用功能概览

当前 Web 应用是一个滑雪板配色定制工具，核心功能包括：

1. **SVG 实时预览**：实时展示板面（Topsheet）和板底（Base）两张 SVG 图片，通过替换 SVG 内部 CSS class 的 fill 颜色实现实时配色预览
2. **颜色配置面板**：4 个颜色槽位（板面背景、板面 logo、板底背景、板底 logo），支持 HexColorPicker 拾色器 + RGB 滑块调节，支持拖拽交换颜色槽位
3. **智能配色（种子颜色）**：基于 `@material/material-color-utilities` 的 M3 色彩算法，输入一个种子颜色自动生成 4 色方案
4. **预设配色模板**：10 套内置预设配色方案，点击即可应用
5. **用户自定义配色保存/加载/删除**：使用 IndexedDB（降级 localStorage）存储用户保存的配色方案
6. **导出 PNG 图片**：使用 `html-to-image` 库将配色方案渲染为 PNG 并下载
7. **响应式布局**：桌面端双栏布局 + 移动端单栏布局，Header 固定 + 预览区 fixed 定位

### 技术约束

- 使用**微信小程序原生语法**（WXML + WXSS + JS），不使用 TypeScript
- 不使用第三方 UI 框架（如 Vant Weapp），保持轻量
- `@material/material-color-utilities` 是纯 JS 库，需要评估是否能在小程序环境中使用（该库依赖部分 Node/浏览器 API，可能需要适配或使用替代方案）
- SVG 在小程序中无法直接通过 `innerHTML` 注入，需要考虑替代方案（如 Canvas 绘制或 `<image>` 标签加载 SVG）
- 导出图片功能使用微信小程序原生的 `Canvas` + `wx.canvasToTempFilePath` + `wx.saveImageToPhotosAlbum` 实现

---

## 需求

### 需求 1：项目初始化与基础架构

**用户故事：** 作为一名开发者，我希望在根目录下创建一个完整可用的微信小程序项目结构，以便可以直接用微信开发者工具打开、预览和发布。

#### 验收标准

1. WHEN 在微信开发者工具中打开 `wechat_mini_program` 目录 THEN 系统 SHALL 正确识别为小程序项目并能够编译运行
2. WHEN 项目初始化完成 THEN 项目 SHALL 包含 `app.js`、`app.json`、`app.wxss`、`project.config.json`（或 `project.private.config.json`）等必要文件
3. WHEN 项目运行时 THEN 全局样式 SHALL 实现与 Web 版一致的 M3 Design Token（颜色、字体、圆角、阴影等 CSS 变量映射为 WXSS 变量）
4. IF 小程序 appid 尚未配置 THEN `project.config.json` SHALL 使用测试 appid 或留空以便开发者自行填入

### 需求 2：SVG 配色预览

**用户故事：** 作为一名用户，我希望在小程序中实时预览滑雪板板面和板底的配色效果，以便直观感受不同配色方案的视觉呈现。

#### 验收标准

1. WHEN 页面加载完成 THEN 系统 SHALL 展示板面（Topsheet）和板底（Base）两张 SVG 的配色预览
2. WHEN 用户修改任意颜色 THEN 预览区 SHALL 在 200ms 内更新对应 SVG 的颜色显示
3. WHEN 在小程序环境中渲染 SVG THEN 系统 SHALL 采用合适的方案渲染 SVG（例如将 SVG 转为 base64 通过 `<image>` 标签展示，或使用 Canvas 绘制，或直接内联 SVG 标签）
4. WHEN 预览区显示时 THEN 系统 SHALL 分别标注"板面 Topsheet"和"板底 Base"标签

### 需求 3：颜色配置面板

**用户故事：** 作为一名用户，我希望能够自由调整 4 个颜色通道（板面背景、板面 logo、板底背景、板底 logo），以便精确定制我的滑雪板配色。

#### 验收标准

1. WHEN 页面加载完成 THEN 系统 SHALL 显示 4 个颜色槽位（2×2 网格），每个槽位显示当前颜色作为背景、标签名和 RGB 值
2. WHEN 用户点击某个颜色槽位的展开按钮 THEN 系统 SHALL 展开该颜色的详细编辑器，包含拾色器和 RGB 三通道滑块
3. WHEN 用户拖动 RGB 滑块 THEN 对应颜色 SHALL 实时更新，预览区同步变化
4. WHEN 用户点击 RGB 值文本 THEN 系统 SHALL 将该 RGB 值复制到剪贴板并显示"已复制"反馈
5. WHEN 用户拖拽某个色块到另一个色块位置 THEN 系统 SHALL 交换两个槽位的颜色值（小程序中可简化为长按触发交换选择，或使用 `movable-area` 实现拖拽）

### 需求 4：智能配色（种子颜色）

**用户故事：** 作为一名用户，我希望输入一个种子颜色就能自动生成和谐的 4 色配色方案，以便快速获得美观的配色而无需手动逐一调整。

#### 验收标准

1. WHEN 用户点击种子颜色色块 THEN 系统 SHALL 展开/折叠种子颜色选择器
2. WHEN 用户选择种子颜色后点击"智能配色"按钮 THEN 系统 SHALL 基于 M3 色彩算法生成 4 个配套颜色并自动应用
3. IF M3 色彩算法库无法在小程序中运行 THEN 系统 SHALL 采用替代的色彩生成算法（如 HSL 互补色/类似色方案），确保生成结果和谐美观
4. WHEN 智能配色生成失败 THEN 系统 SHALL 显示错误提示"配色生成失败，请尝试其他颜色"

### 需求 5：预设配色模板

**用户故事：** 作为一名用户，我希望从预设的配色方案中快速选择，以便在不了解色彩搭配的情况下也能获得优质的配色。

#### 验收标准

1. WHEN 页面加载完成 THEN 系统 SHALL 展示 10 套预设配色方案，每套以 4 个圆形色块的方式展示
2. WHEN 用户点击某套预设 THEN 系统 SHALL 将该配色应用到 4 个颜色通道，预览区同步更新
3. WHEN 某套预设正在使用中 THEN 系统 SHALL 高亮显示该预设卡片（边框变为主色调）
4. WHEN 用户手动修改了颜色 THEN 系统 SHALL 清除当前预设的高亮状态

### 需求 6：用户自定义配色方案的保存/加载/删除

**用户故事：** 作为一名用户，我希望保存自己调好的配色方案，以便日后重新使用或在不同方案间切换。

#### 验收标准

1. WHEN 用户点击"保存当前配色"按钮 THEN 系统 SHALL 将当前 4 色方案存入微信小程序本地存储（`wx.setStorageSync`）
2. WHEN 已有保存的配色方案 THEN 系统 SHALL 以网格形式展示所有已保存方案，按创建时间倒序排列
3. WHEN 用户点击已保存的配色方案 THEN 系统 SHALL 将该配色应用到当前编辑器
4. WHEN 用户点击删除按钮并确认 THEN 系统 SHALL 从本地存储中移除该配色方案并更新列表
5. IF 本地存储中没有已保存的方案 THEN 系统 SHALL 显示"还没有保存的配色方案"的提示文案

### 需求 7：导出配色方案图片

**用户故事：** 作为一名用户，我希望将当前配色方案导出为图片并保存到手机相册，以便分享给朋友或发送给厂商。

#### 验收标准

1. WHEN 用户点击导出按钮 THEN 系统 SHALL 使用微信小程序 Canvas 渲染配色方案的完整视图（包含标题、两张 SVG 预览、4 个颜色圆点和颜色信息）
2. WHEN Canvas 渲染完成 THEN 系统 SHALL 调用 `wx.canvasToTempFilePath` 生成临时图片文件
3. WHEN 临时图片生成成功 THEN 系统 SHALL 调用 `wx.saveImageToPhotosAlbum` 保存至用户相册
4. IF 用户未授权相册权限 THEN 系统 SHALL 引导用户前往设置页面开启权限
5. WHEN 导出过程中 THEN 按钮 SHALL 显示加载状态（如"导出中..."），防止重复点击
6. IF 导出失败 THEN 系统 SHALL 显示 Toast 提示"导出失败，请重试"

### 需求 8：UI 布局与视觉一致性

**用户故事：** 作为一名用户，我希望小程序的界面风格与 Web 版本保持一致，以便获得统一的品牌体验。

#### 验收标准

1. WHEN 小程序加载完成 THEN 页面 SHALL 采用 Material Design 3 风格的配色和排版
2. WHEN 在不同尺寸手机上运行 THEN 布局 SHALL 自适应屏幕宽度，采用移动端单栏布局（顶部 Header → 预览区 → 颜色配置 → 预设模板 → 用户配色）
3. WHEN 页面滚动时 THEN 顶部导航栏 SHALL 保持固定（利用小程序自定义导航栏或 sticky 定位）
4. WHEN 展示各功能面板 THEN 各面板 SHALL 使用圆角卡片样式、阴影效果，与 Web 版视觉风格一致

### 需求 9：拾色器组件实现

**用户故事：** 作为一名用户，我希望在小程序中也能使用拾色器自由选取颜色，以便获得与 Web 版相同的颜色编辑体验。

#### 验收标准

1. WHEN 用户展开颜色编辑器 THEN 系统 SHALL 显示一个可交互的拾色器（色相/饱和度/亮度选择区域）
2. WHEN 用户在拾色器上滑动 THEN 颜色 SHALL 实时更新，预览区同步变化
3. IF 小程序中无法使用 `react-colorful` THEN 系统 SHALL 实现一个基于 Canvas 的原生拾色器组件，提供色相条 + 饱和度/亮度面板的交互方式
