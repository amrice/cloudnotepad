import { useState } from 'react';
import { Dialog } from './Dialog';
import { Button } from './Button';
import { useCreateShare } from '@/hooks/useShares';
import { toast } from '@/stores/toastStore';
import { Copy, Check, Globe, Lock } from 'lucide-react';
import { cn } from '@/utils/helpers';

interface ShareDialogProps {
  noteId: string;
  noteTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareDialog({ noteId, noteTitle, open, onOpenChange }: ShareDialogProps) {
  const [isPublic, setIsPublic] = useState(true);
  const [password, setPassword] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const createShare = useCreateShare();

  const handleCreate = async () => {
    try {
      const result = await createShare.mutateAsync({
        noteId,
        isPublic,
        password: isPublic ? undefined : password || undefined,
      });
      const url = `${window.location.origin}/s/${result.slug}`;
      setShareUrl(url);
      toast.success('分享链接已生成');
    } catch (err) {
      toast.error('创建分享失败', err instanceof Error ? err.message : '请稍后重试');
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('链接已复制');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setShareUrl('');
    setPassword('');
    setIsPublic(true);
    setCopied(false);
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={handleClose}
      title="分享笔记"
      description={noteTitle || '无标题笔记'}
      size="sm"
    >
      {!shareUrl ? (
        <div className="space-y-4">
          {/* 公开/私密切换 */}
          <div className="flex gap-2">
            <button
              onClick={() => setIsPublic(true)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border-2 transition-colors',
                isPublic
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              )}
            >
              <Globe className="w-4 h-4" />
              <span>公开</span>
            </button>
            <button
              onClick={() => setIsPublic(false)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border-2 transition-colors',
                !isPublic
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              )}
            >
              <Lock className="w-4 h-4" />
              <span>私密</span>
            </button>
          </div>

          {/* 密码输入 */}
          {!isPublic && (
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="设置访问密码（可选）"
              className={cn(
                'w-full px-4 py-2 rounded-lg',
                'border border-gray-200 dark:border-gray-700',
                'bg-white dark:bg-gray-800',
                'focus:outline-none focus:ring-2 focus:ring-blue-500'
              )}
            />
          )}

          <Button
            onClick={handleCreate}
            disabled={createShare.isPending}
            className="w-full"
          >
            {createShare.isPending ? '生成中...' : '生成分享链接'}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* 分享链接 */}
          <div className="flex gap-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className={cn(
                'flex-1 px-4 py-2 rounded-lg',
                'border border-gray-200 dark:border-gray-700',
                'bg-gray-50 dark:bg-gray-800',
                'text-sm'
              )}
            />
            <Button onClick={handleCopy} variant="ghost">
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isPublic ? '任何人都可以通过此链接访问' : '需要密码才能访问'}
          </p>

          <Button onClick={handleClose} variant="ghost" className="w-full">
            完成
          </Button>
        </div>
      )}
    </Dialog>
  );
}
