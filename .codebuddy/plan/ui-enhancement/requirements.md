# 需求文档

## 引言

本次需求涉及 DONEK 滑雪板配色定制应用的 UI 改进和 Bug 修复。所有变更需**同时作用于根目录下的 Web 项目（React + Vite）和 `wechat_mini_program` 目录下的微信小程序项目**，确保两端业务逻辑完全一致。

涉及三大改动：
1. 导出按钮位置调整（从 header 右侧移到标题右边）
2. 颜色配置面板交互重构（下拉编辑器改为弹窗模式 + RGB 输入框）
3. 智能配色算法 Bug 修复（板面 logo 始终为白色）

---

## 需求

### 需求 1：导出按钮位置调整

**用户故事：** 作为一名用户，我希望导出按钮位于 header 标题的右侧（而非 header 的最右端），以便操作更符合视觉动线，也让 header 布局更紧凑。

#### 验收标准

1. WHEN 页面加载完成 THEN 导出按钮 SHALL 显示在 header 内、标题文字（"DONEK" / "滑雪板配色定制"）的右侧
2. WHEN 导出按钮显示 THEN 按钮 SHALL 不再位于 header 的最右端（原位置），而是紧跟在标题区域之后
3. WHEN 在 Web 端移动端视图下 THEN 导出按钮 SHALL 保持圆形图标样式（📸），与标题文字垂直居中对齐
4. WHEN 在 Web 端桌面端视图下 THEN 导出按钮 SHALL 保持文字按钮样式（"📸 导出 PNG"），与标题文字垂直居中对齐
5. WHEN 在微信小程序端 THEN 导出按钮 SHALL 同样位于标题右侧，保持圆形图标样式，与标题文字垂直居中对齐
6. WHEN 导出按钮位置调整后 THEN 导出功能（点击下载 PNG / 保存到相册） SHALL 不受影响，保持原有行为

---

### 需求 2：颜色配置面板交互重构（弹窗式颜色选择器 + RGB 输入）

**用户故事：** 作为一名用户，我希望点击色块的"修改"按钮后弹出一个居中弹窗来选择颜色，并且可以直接输入 RGB 值，以便颜色选择操作更直观、输入更精确。

#### 验收标准

##### 2.1 移除下拉展开式编辑器

1. WHEN 颜色配置面板渲染 THEN 每个色块 SHALL 不再显示展开/折叠箭头（▼/▲），移除原有的内嵌下拉式颜色编辑器
2. WHEN 色块渲染 THEN 每个色块 SHALL 显示一个"修改"按钮（文字或图标），供用户点击以打开颜色编辑弹窗

##### 2.2 弹窗设计与行为

3. WHEN 用户点击某色块的"修改"按钮 THEN 系统 SHALL 在页面正中央显示一个模态弹窗
4. WHEN 弹窗打开 THEN 弹窗 SHALL 包含以下内容：
   - 弹窗标题，显示当前正在编辑的色块名称（如"板面背景"）
   - 颜色选择器（Web 端使用 `react-colorful` 的 `HexColorPicker`；小程序端使用已有的 `color-picker` Canvas 组件）
   - RGB 滑块（R/G/B 三个通道滑块，与原展开编辑器一致）
   - RGB 文本输入框（见 2.3）
   - 关闭按钮（右上角 ×）
5. WHEN 弹窗显示 THEN 弹窗背景 SHALL 显示半透明遮罩层（点击遮罩可关闭弹窗）
6. WHEN 弹窗样式渲染 THEN 弹窗 SHALL 保持 Material Design 3 风格一致（圆角、阴影、配色与现有 UI 统一）
7. WHEN 用户在弹窗内通过选择器/滑块修改颜色 THEN 预览区域 SHALL 实时联动更新
8. WHEN 用户关闭弹窗（点击 ×、点击遮罩、或按 ESC） THEN 弹窗 SHALL 关闭，已修改的颜色保留生效

##### 2.3 RGB 文本输入

9. WHEN 弹窗打开 THEN 弹窗内 SHALL 包含一个文本输入框，placeholder 为 "R,G,B（如 178,34,34）"
10. WHEN 用户在输入框内输入格式为 `R,G,B` 的字符串（如 `178,34,34`） THEN 系统 SHALL 实时校验输入合法性
11. IF 输入的值为合法的 RGB（三个数值均为 0-255 的整数，以英文逗号分隔） THEN 系统 SHALL 立即将对应颜色设置为该 RGB 值，预览区域和弹窗内的选择器/滑块 SHALL 同步联动更新
12. IF 输入的值不合法（格式错误、数值超范围等） THEN 系统 SHALL 不改变当前颜色，输入框 SHALL 显示错误提示样式（如红色边框）
13. WHEN 颜色通过选择器或滑块改变时 THEN RGB 输入框的值 SHALL 同步更新为当前颜色的 RGB 字符串

##### 2.4 双端一致性

14. WHEN 在 Web 端和微信小程序端分别操作颜色编辑弹窗 THEN 两端的交互逻辑和视觉效果 SHALL 保持一致（弹窗居中、遮罩层、实时联动、RGB 输入等）

---

### 需求 3：智能配色算法 Bug 修复 — 板面 logo 颜色

**用户故事：** 作为一名用户，我希望智能配色生成的板面 logo 颜色能够根据种子颜色动态变化（而非始终为白色），以便生成更丰富、更有辨识度的配色方案。

#### 验收标准

##### 3.1 Bug 根因

- **Web 端 (m3color.ts)**：使用 `@material/material-color-utilities` 库，`lightScheme.onPrimary` 角色在 M3 规范下对于大多数种子颜色都返回白色或近白色，这是 M3 的 onPrimary 角色设计如此。但对于滑雪板配色场景，始终白色缺乏变化。
- **小程序端 (m3color.js)**：手写 HSL 近似算法中，`topSecondary`（板面 logo）直接硬编码为 `'#FFFFFF'`，完全不会变化。

##### 3.2 修复要求

1. WHEN 用户使用智能配色功能生成配色方案 THEN 板面 logo（topSecondary）的颜色 SHALL 根据种子颜色动态生成，不再固定为白色
2. WHEN 板面背景（topPrimary）为深色（亮度 ≤ 0.5） THEN 板面 logo（topSecondary） SHALL 使用明亮的对比色（如种子色相的高亮度变体），确保在深色背景上可辨识
3. WHEN 板面背景（topPrimary）为浅色（亮度 > 0.5） THEN 板面 logo（topSecondary） SHALL 使用较深的对比色（如种子色相的低亮度变体），确保在浅色背景上可辨识
4. WHEN 配色方案生成后 THEN 板面 logo 与板面背景之间 SHALL 保持足够的对比度（WCAG AA 标准，对比度 ≥ 4.5:1 为佳，至少 ≥ 3:1）
5. WHEN Web 端和小程序端分别执行智能配色 THEN 两端对于相同种子颜色生成的板面 logo 颜色 SHALL 保持一致（或视觉效果高度接近）

##### 3.3 修复范围

6. Web 端 SHALL 修改 `src/m3color.ts` 中 `generateM3Palette` 函数的 `topSecondary` 取值逻辑，不再直接使用 `lightScheme.onPrimary`，改为基于 primary 色相计算动态对比色
7. 小程序端 SHALL 修改 `wechat_mini_program/utils/m3color.js` 中 `generateM3Palette` 函数，移除硬编码的 `'#FFFFFF'`，改为与 Web 端一致的动态计算逻辑
8. WHEN 修改完成后 THEN `generateM3PaletteDark` 函数（仅 Web 端存在） SHALL 也应用同样的修复逻辑

---

## 技术约束与注意事项

1. **双端同步**：所有需求的修改必须同时应用于 Web 端（`src/` 目录）和微信小程序端（`wechat_mini_program/` 目录），业务逻辑保持一致
2. **UI 风格**：弹窗和所有新增 UI 元素必须遵循 Material Design 3 风格（使用项目已有的 CSS 变量：`--md-sys-color-*`、`--md-sys-shape-*`、`--md-sys-elevation-*` 等）
3. **Web 端依赖**：颜色选择器继续使用 `react-colorful` 库，不引入新依赖
4. **小程序端**：使用已有的 `color-picker` Canvas 拾色器组件，不引入第三方库
5. **色块拖拽功能**：需求 2 的改造不应影响已有的色块拖拽交换颜色功能（长按/拖拽）
6. **实时性**：弹窗内的颜色修改（选择器、滑块、RGB 输入）必须实时反映到预览区，无需"确认"按钮
