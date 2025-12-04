import { useState, FormEvent, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/shared/ui/Button';

interface MessageInputProps {
  onSend: (content: string) => Promise<void>;
  disabled?: boolean;
  sending?: boolean;
}

export function MessageInput({ onSend, disabled, sending }: MessageInputProps) {
  const [content, setContent] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim() || disabled || sending) return;

    await onSend(content);
    setContent('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-neutral-200 bg-white">
      <div className="flex items-end gap-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Écrivez votre message..."
          disabled={disabled || sending}
          rows={1}
          className="flex-1 resize-none px-4 py-3 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-neutral-50 disabled:cursor-not-allowed max-h-32"
          style={{ minHeight: '48px' }}
        />
        <Button
          type="submit"
          variant="primary"
          disabled={!content.trim() || disabled || sending}
          className="h-12 w-12 p-0 flex items-center justify-center rounded-xl"
        >
          <Send className={`h-5 w-5 ${sending ? 'animate-pulse' : ''}`} />
        </Button>
      </div>
    </form>
  );
}
