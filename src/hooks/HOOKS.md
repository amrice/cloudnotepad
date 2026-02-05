# Hooks 使用说明

本项目采用统一的 Hook 模式管理数据操作，分为**查询 Hooks** 和**操作 Hooks** 两类。

## 目录

- [笔记相关](#笔记相关)
- [标签相关](#标签相关)
- [分享相关](#分享相关)
- [工具类](#工具类)

---

## 笔记相关

### 查询 Hooks

#### `useNotes(params?)`
获取笔记列表。

```typescript
const { data, isLoading } = useNotes({
  page: 1,
  limit: 20,
  tag: 'work',
  search: '关键词'
});
// data.notes: NoteListItem[]
```

#### `useNote(id)`
获取单篇笔记详情。

```typescript
const { data: note, isLoading } = useNote('note-id');
// note: Note
```

#### `useSearchNotes(query)`
搜索笔记。

```typescript
const { data } = useSearchNotes('搜索词');
```

### 操作 Hooks

#### `useSaveNote(options?)`
统一的笔记保存 Hook，支持创建和更新。

```typescript
const {
  save,           // 保存笔记（自动判断创建/更新）
  isSaving,       // 保存中状态
  conflictData,   // 冲突数据
  useServerVersion, // 使用服务器版本
  mergeSave,      // 合并保存
  dismissConflict // 忽略冲突
} = useSaveNote({
  onSuccess: (note) => console.log('保存成功', note),
  onError: (err) => console.error('保存失败', err)
});

// 创建新笔记
save({ title: '标题', content: '内容', tags: [] });

// 更新笔记
save({ id: 'note-id', title: '新标题', content: '新内容', version: 1 });
```

#### `useDeleteNote()`
删除笔记。

```typescript
const deleteMutation = useDeleteNote();
deleteMutation.mutate('note-id');
```

#### `useAutoSave(options)`
自动保存 Hook，用于编辑器。

```typescript
const {
  restoreDraft,      // 恢复草稿
  getHistory,        // 获取历史
  restoreFromHistory,// 从历史恢复
  clearDrafts        // 清除草稿
} = useAutoSave({
  noteId: 'note-id',
  title: '标题',
  content: '内容',
  version: 1,
  onSave: (newVersion) => {},
  onError: (error) => {}
});
```

---

## 标签相关

### 查询 Hooks

#### `useTags()`
获取标签列表（扁平结构）。

```typescript
const { data: tags } = useTags();
// tags: Tag[]
```

#### `useTagGroups()`
获取标签分组（树形结构）。

```typescript
const { data: groups } = useTagGroups();
// groups: TagGroup[]
```

### 操作 Hooks

#### `useTagActions(options?)`
统一的标签操作 Hook。

```typescript
const {
  // 操作方法
  createTag,      // 创建标签
  updateTag,      // 更新标签
  deleteTag,      // 删除标签
  moveTag,        // 移动标签
  mergeTags,      // 合并标签
  createGroup,    // 创建分组
  deleteGroup,    // 删除分组

  // 状态
  isCreating,
  isUpdating,
  isDeleting,
  isMoving,
  isMerging,
  isCreatingGroup,
  isDeletingGroup,
  isLoading       // 综合加载状态
} = useTagActions({
  onSuccess: () => {},
  onError: (err) => {}
});

// 使用示例
createTag({ name: '新标签', color: '#ff0000' });
updateTag({ id: 'tag-id', name: '新名称' });
deleteTag('tag-id');
moveTag({ tagId: 'tag-id', groupId: 'group-id' });
mergeTags({ sourceId: 'tag-1', targetId: 'tag-2' });
createGroup('分组名称');
deleteGroup('group-id');
```

---

## 分享相关

### 查询 Hooks

#### `useShares()`
获取分享列表。

```typescript
const { data: shares } = useShares();
// shares: Share[]
```

### 操作 Hooks

#### `useShareActions(options?)`
统一的分享操作 Hook。

```typescript
const {
  // 操作方法
  createShare,      // 创建分享
  createShareAsync, // 创建分享（Promise）
  deleteShare,      // 删除分享

  // 状态
  isCreating,
  isDeleting,
  isLoading,

  // 数据
  createdShare      // 创建的分享数据
} = useShareActions({
  onSuccess: (data) => {},
  onError: (err) => {}
});

// 使用示例
createShare({
  noteId: 'note-id',
  customAlias: 'my-share',  // 可选
  expiresInDays: 7          // 可选
});

deleteShare('share-slug');
```

---

## 工具类

### `useDebounce(value, delay)`
防抖值。

```typescript
const debouncedSearch = useDebounce(searchTerm, 300);
```

### `useDebounceCallback(callback, delay)`
防抖回调。

```typescript
const debouncedSave = useDebounceCallback((data) => {
  saveToServer(data);
}, 1000);
```

### `useTheme()`
主题切换。

```typescript
const { theme, setTheme, toggleTheme } = useTheme();
```

### `useIsMobile()`
移动端检测。

```typescript
const isMobile = useIsMobile();
```

### `useAuth()`
认证状态。

```typescript
const { user, isAuthenticated, login, logout } = useAuth();
```

---

## 设计原则

1. **查询与操作分离**：查询 Hooks 返回数据，操作 Hooks 返回方法
2. **统一回调**：所有操作 Hooks 支持 `onSuccess` 和 `onError` 回调
3. **自动缓存刷新**：操作成功后自动刷新相关查询缓存
4. **加载状态**：每个操作都有独立的加载状态和综合 `isLoading`
