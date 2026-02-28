'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import type { Comment } from '@/app/api/comments/route';

interface ProjectClientProps {
  projectId: string;
}

export function ProjectClient({ projectId }: ProjectClientProps) {
  const { data: session, status } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchComments();
  }, [projectId]);

  async function fetchComments() {
    try {
      const response = await fetch(`/api/comments?projectId=${projectId}`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      const data = await response.json();
      setComments(data.comments || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Kunde inte ladda kommentarer');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, content: newComment }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to post comment');
      }

      const data = await response.json();
      setComments([data.comment, ...comments]);
      setNewComment('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunde inte posta kommentar');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(commentId: string) {
    if (!confirm('Är du säker på att du vill ta bort denna kommentar?')) return;

    try {
      const response = await fetch(`/api/comments?id=${commentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete comment');
      }

      setComments(comments.filter((c) => c.id !== commentId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunde inte ta bort kommentar');
    }
  }

  return (
    <div className="rounded-2xl bg-white/5 p-6 backdrop-blur">
      <h2 className="text-xl font-semibold text-white mb-4">
        Kommentarer ({comments.length})
      </h2>

      {/* Comment form */}
      {status === 'loading' ? (
        <div className="text-slate-400 text-sm mb-6">Laddar...</div>
      ) : session ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex items-start gap-3">
            {session.user?.image && (
              <img
                src={session.user.image}
                alt=""
                className="h-10 w-10 rounded-full"
              />
            )}
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Skriv en kommentar..."
                rows={3}
                maxLength={2000}
                className="w-full rounded-lg border-0 bg-white/10 px-4 py-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {newComment.length}/2000 tecken
                </span>
                <button
                  type="submit"
                  disabled={!newComment.trim() || isSubmitting}
                  className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Postar...' : 'Posta kommentar'}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-6 rounded-lg bg-white/5 p-4 text-center">
          <p className="text-slate-300 mb-3">
            Logga in med GitHub för att kommentera
          </p>
          <button
            onClick={() => signIn('github')}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 font-medium text-white hover:bg-slate-700 transition-colors"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            Logga in med GitHub
          </button>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Comments list */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-slate-500 border-t-white"></div>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <p>Inga kommentarer än. Var först med att kommentera!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={session?.user?.id || session?.user?.email}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CommentItem({
  comment,
  currentUserId,
  onDelete,
}: {
  comment: Comment;
  currentUserId?: string | null;
  onDelete: (id: string) => void;
}) {
  const isOwner = currentUserId && comment.userId === currentUserId;

  return (
    <div className="flex gap-3">
      {comment.userImage ? (
        <img
          src={comment.userImage}
          alt=""
          className="h-10 w-10 rounded-full flex-shrink-0"
        />
      ) : (
        <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-medium text-slate-300">
            {comment.userName.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-white">{comment.userName}</span>
          <span className="text-xs text-slate-500">
            {formatRelativeTime(comment.createdAt)}
          </span>
          {isOwner && (
            <button
              onClick={() => onDelete(comment.id)}
              className="text-xs text-red-400 hover:text-red-300 ml-auto"
            >
              Ta bort
            </button>
          )}
        </div>
        <p className="mt-1 text-slate-300 whitespace-pre-wrap break-words">
          {comment.content}
        </p>
      </div>
    </div>
  );
}

function formatRelativeTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'just nu';
    if (diffMin < 60) return `${diffMin} min sedan`;
    if (diffHour < 24) return `${diffHour} tim sedan`;
    if (diffDay < 7) return `${diffDay} dagar sedan`;

    return date.toLocaleDateString('sv-SE');
  } catch {
    return '';
  }
}
