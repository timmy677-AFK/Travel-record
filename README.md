# 个人旅行照片记录网站

这是一个纯本地运行的 Vue3 单页应用，无需注册登录、无需后端服务、无需外部接口。相册、照片、游记、设置都会持久化保存到当前浏览器的 IndexedDB 中。

## 项目目录

```text
travel-photo-journal/
├─ index.html
├─ package.json
├─ postcss.config.js
├─ tailwind.config.js
├─ vite.config.js
└─ src/
   ├─ App.vue
   ├─ main.js
   ├─ style.css
   ├─ components/
   │  ├─ AlbumCard.vue
   │  ├─ AlbumDetail.vue
   │  ├─ AlbumDialog.vue
   │  ├─ EmptyState.vue
   │  ├─ JournalEditor.vue
   │  ├─ PhotoEditor.vue
   │  ├─ PhotoViewer.vue
   │  ├─ SettingsView.vue
   │  └─ TimelineView.vue
   └─ utils/
      ├─ backup.js
      ├─ idb.js
      ├─ image.js
      └─ store.js
```

## 启动步骤

```bash
npm install
npm run dev
```

然后在浏览器中打开终端提示的本地地址，通常是 `http://localhost:5173`。

## 功能说明

- 旅行专辑：创建、编辑、删除、置顶、封面、目的地、出行日期、简介、照片数量和出行时长统计。
- 照片管理：批量上传、浏览器端自动压缩、备注、地点、拍摄时间、标签、精选收藏、拖拽排序、批量删除、批量移动、大图预览和缩放。
- 游记记录：轻量富文本编辑器，可关联相册并插入相册照片。
- 时间轴：自动按时间汇总相册和游记。
- 搜索筛选：按年份、目的地、标签、精选状态和关键词过滤。
- 备份恢复：浏览器端导出 zip 备份包，也可以导入恢复。
- 主题：日间/夜间一键切换。

## 本地存储提醒

数据保存在当前浏览器的 IndexedDB 中。清理浏览器站点数据、更换浏览器或隐身模式关闭后，可能导致数据不可见或被删除，请定期在设置页导出备份。
