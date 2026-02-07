import { useState, useEffect } from 'react';
import { Dialog, Input, Button } from '@/components/ui';
import { toast } from '@/stores/toastStore';
import { Image, ChevronDown } from 'lucide-react';
import { cn } from '@/utils/helpers';

interface AdminPanelProps {
  open: boolean;
  onClose: () => void;
}

// 图床提供商类型
type ImageBedProvider = 'github' | 'r2' | 'cos';

interface ImageBedSettings {
  provider: ImageBedProvider;
  github?: {
    token: string;
    repo: string;
    branch: string;
    path: string;
  };
}

const providerOptions: { value: ImageBedProvider; label: string; available: boolean }[] = [
  { value: 'github', label: 'GitHub', available: true },
  { value: 'r2', label: 'Cloudflare R2', available: false },
  { value: 'cos', label: '腾讯云 COS', available: false },
];

export function AdminPanel({ open, onClose }: AdminPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [provider, setProvider] = useState<ImageBedProvider>('github');
  const [showProviderMenu, setShowProviderMenu] = useState(false);

  // GitHub 配置
  const [githubToken, setGithubToken] = useState('');
  const [githubRepo, setGithubRepo] = useState('');
  const [githubBranch, setGithubBranch] = useState('main');
  const [githubPath, setGithubPath] = useState('img/uploads');

  // 加载配置
  useEffect(() => {
    if (open) {
      loadSettings();
    }
  }, [open]);

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/settings/imagebed', {
        credentials: 'include',
      });
      if (res.ok) {
        const response = await res.json();
        const data: ImageBedSettings = response.data;
        if (data) {
          setProvider(data.provider || 'github');
          if (data.github) {
            setGithubToken(data.github.token || '');
            setGithubRepo(data.github.repo || '');
            setGithubBranch(data.github.branch || 'main');
            setGithubPath(data.github.path || 'img/uploads');
          }
        }
      }
    } catch (err) {
      console.error('加载配置失败:', err);
    }
  };

  const handleSave = async () => {
    if (provider === 'github') {
      if (!githubToken || !githubRepo) {
        toast.warning('请填写 Token 和仓库地址');
        return;
      }
    }

    setIsLoading(true);
    try {
      const settings: ImageBedSettings = {
        provider,
        github: provider === 'github' ? {
          token: githubToken,
          repo: githubRepo,
          branch: githubBranch,
          path: githubPath,
        } : undefined,
      };

      const res = await fetch('/api/settings/imagebed', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(settings),
      });

      if (!res.ok) throw new Error('保存失败');
      toast.success('配置已保存');
    } catch (err) {
      toast.error('保存失败', err instanceof Error ? err.message : '请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = async () => {
    if (!githubToken || !githubRepo) {
      toast.warning('请先填写配置');
      return;
    }

    setIsTesting(true);
    try {
      const res = await fetch('/api/settings/imagebed/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          provider,
          github: { token: githubToken, repo: githubRepo, branch: githubBranch },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '连接失败');
      }
      toast.success('连接成功');
    } catch (err) {
      toast.error('连接失败', err instanceof Error ? err.message : '请检查配置');
    } finally {
      setIsTesting(false);
    }
  };

  const handleClose = () => {
    setShowProviderMenu(false);
    onClose();
  };

  const currentProvider = providerOptions.find(p => p.value === provider);

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => !isOpen && handleClose()}
      title="管理面板"
      size="lg"
    >
      <div className="space-y-6">
        {/* 图床配置 */}
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
            <Image className="w-4 h-4" />
            图床配置
          </div>

          {/* 提供商选择 */}
          <div className="mb-4">
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
              图床提供商
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowProviderMenu(!showProviderMenu)}
                className={cn(
                  'w-full px-3 py-2 text-left rounded-lg border',
                  'bg-white dark:bg-gray-700',
                  'border-gray-300 dark:border-gray-600',
                  'text-gray-900 dark:text-white',
                  'flex items-center justify-between'
                )}
              >
                <span>{currentProvider?.label}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {showProviderMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowProviderMenu(false)}
                  />
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-20">
                    {providerOptions.map((opt) => (
                      <button
                        key={opt.value}
                        disabled={!opt.available}
                        onClick={() => {
                          if (opt.available) {
                            setProvider(opt.value);
                            setShowProviderMenu(false);
                          }
                        }}
                        className={cn(
                          'w-full px-3 py-2 text-left text-sm',
                          'hover:bg-gray-100 dark:hover:bg-gray-600',
                          opt.value === provider && 'bg-primary-50 dark:bg-primary-900/30',
                          !opt.available && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        {opt.label}
                        {!opt.available && (
                          <span className="ml-2 text-xs text-gray-400">(即将支持)</span>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* GitHub 配置表单 */}
          {provider === 'github' && (
            <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  GitHub Token
                </label>
                <Input
                  type="password"
                  placeholder="ghp_xxxxxxxxxxxx"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                />
                <p className="mt-1 text-xs text-gray-400">
                  需要 repo 权限的 Personal Access Token
                </p>
              </div>

              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  仓库地址
                </label>
                <Input
                  placeholder="username/repo"
                  value={githubRepo}
                  onChange={(e) => setGithubRepo(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    分支
                  </label>
                  <Input
                    placeholder="main"
                    value={githubBranch}
                    onChange={(e) => setGithubBranch(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    上传路径
                  </label>
                  <Input
                    placeholder="img/uploads"
                    value={githubPath}
                    onChange={(e) => setGithubPath(e.target.value)}
                  />
                </div>
              </div>

              <p className="text-xs text-amber-600 dark:text-amber-400">
                单张图片最大 1MB（受边缘函数请求体限制）
              </p>
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="ghost"
            onClick={handleTest}
            disabled={isTesting}
          >
            {isTesting ? '测试中...' : '测试连接'}
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? '保存中...' : '保存配置'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
