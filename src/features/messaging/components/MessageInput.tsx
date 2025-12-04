import { useState, FormEvent, KeyboardEvent } from 'react';
import { Send, Smile, Paperclip, Mic } from 'lucide-react';

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

  const hasContent = content.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="px-4 py-3 bg-[#202C33] flex items-end gap-2">
      {/* Emoji button */}
      <button
        type="button"
        className="p-2 hover:bg-[#374248] rounded-full transition-colors flex-shrink-0"
      >
        <Smile className="h-6 w-6 text-[#8696A0]" />
      </button>

      {/* Attachment button */}
      <button
        type="button"
        className="p-2 hover:bg-[#374248] rounded-full transition-colors flex-shrink-0"
      >
        <Paperclip className="h-6 w-6 text-[#8696A0]" />
      </button>

      {/* Input */}
      <div className="flex-1 bg-[#2A3942] rounded-lg">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tapez un message"
          disabled={disabled || sending}
          rows={1}
          className="w-full px-4 py-3 bg-transparent text-sm text-[#E9EDEF] placeholder-[#8696A0] focus:outline-none resize-none max-h-32"
          style={{ minHeight: '44px' }}
        />
      </div>

      {/* Send or Mic button */}
      {hasContent ? (
        <button
          type="submit"
          disabled={!hasContent || disabled || sending}
          className="p-3 bg-[#00A884] hover:bg-[#00957A] rounded-full transition-colors flex-shrink-0 disabled:opacity-50"
        >
          <Send className={`h-5 w-5 text-[#111B21] ${sending ? 'animate-pulse' : ''}`} />
        </button>
      ) : (
        <button
          type="button"
          className="p-3 hover:bg-[#374248] rounded-full transition-colors flex-shrink-0"
        >
          <Mic className="h-5 w-5 text-[#8696A0]" />
        </button>
      )}
    </form>
  );
}
