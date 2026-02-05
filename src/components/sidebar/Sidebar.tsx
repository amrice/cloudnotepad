import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTagGroups } from '@/hooks/useTags';
import { Search } from 'lucide-react';
import { cn } from '@/utils/helpers';
import { ChevronRight, ChevronDown, Folder, Plus, Tag } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const navigate = useNavigate();
  const { data: groups } = useTagGroups();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  return (
    <>
      {/* 遮罩层（移动端） */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* 侧边栏 */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50',
          'w-64 bg-light-bg dark:bg-dark-bg',
          'border-r border-light-border dark:border-dark-border',
          'transform transition-transform duration-300 ease-in-out',
          'flex flex-col',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-16'
        )}
      >
        {/* 收起/展开按钮 */}
        <button
          onClick={onToggle}
          className={cn(
            'absolute -right-3 top-1/2 -translate-y-1/2',
            'w-6 h-6 bg-primary text-white rounded-full',
            'flex items-center justify-center',
            'hidden lg:flex'
          )}
        >
          {isOpen ? (
            <ChevronLeftIcon className="w-4 h-4" />
          ) : (
            <ChevronRightIcon className="w-4 h-4" />
          )}
        </button>

        {isOpen ? (
          /* 展开状态 */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* 搜索框 */}
            <div className="p-4 pb-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="搜索..."
                  className={cn(
                    'w-full pl-9 pr-4 py-2',
                    'bg-white dark:bg-gray-800',
                    'border border-gray-200 dark:border-gray-700',
                    'rounded-lg text-sm',
                    'placeholder:text-gray-400',
                    'focus:outline-none focus:ring-2 focus:ring-primary'
                  )}
                />
              </div>
            </div>

            {/* 笔记列表快捷入口 */}
            <div className="px-4 pb-2">
              <button
                onClick={() => navigate('/')}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2',
                  'rounded-lg',
                  'hover:bg-gray-100 dark:hover:bg-gray-800',
                  'text-sm text-gray-700 dark:text-gray-300'
                )}
              >
                <ChevronRightIcon className="w-4 h-4" />
                <span>全部笔记</span>
              </button>
            </div>

            {/* 标签分组 */}
            <div className="flex-1 overflow-auto px-4 py-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500 uppercase">
                  标签
                </span>
                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-0.5">
                {groups?.map((group) => (
                  <div key={group.id}>
                    <button
                      onClick={() => toggleGroup(group.id)}
                      className={cn(
                        'w-full flex items-center gap-2 px-2 py-1.5 rounded-lg',
                        'hover:bg-gray-100 dark:hover:bg-gray-800',
                        'text-sm'
                      )}
                    >
                      {expandedGroups.has(group.id) ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                      <Folder className="w-4 h-4 text-gray-400" />
                      <span className="flex-1 text-left text-gray-700 dark:text-gray-300">
                        {group.name}
                      </span>
                      <span className="text-xs text-gray-400">
                        {group.noteCount}
                      </span>
                    </button>

                    {expandedGroups.has(group.id) && (
                      <div className="ml-6 mt-0.5 space-y-0.5">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {(group as any).children?.map((child: any) => (
                          <button
                            key={child.id}
                            className={cn(
                              'w-full flex items-center gap-2 px-2 py-1 rounded-lg',
                              'hover:bg-gray-100 dark:hover:bg-gray-800',
                              'text-sm'
                            )}
                          >
                            <Tag className="w-3 h-3" style={{ color: child.color }} />
                            <span className="text-gray-600 dark:text-gray-400">
                              {child.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* 收起状态 */
          <div className="flex flex-col items-center py-4 gap-4">
            <button
              onClick={onToggle}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <MenuIcon className="w-5 h-5" />
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

// 图标组件
function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 19l-7-7 7-7"
      />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5l7 7-7 7"
      />
    </svg>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  );
}
