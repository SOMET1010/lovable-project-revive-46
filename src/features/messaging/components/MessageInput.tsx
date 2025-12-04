import { useState, useRef, FormEvent, KeyboardEvent } from 'react';
import { Send, Smile, Paperclip, Mic, Image as ImageIcon, FileText } from 'lucide-react';
import { Attachment } from '../services/messaging.service';
import { AttachmentPreview } from './AttachmentPreview';

interface MessageInputProps {
  onSend: (content: string, attachment?: Attachment | null) => Promise<void>;
  disabled?: boolean;
  sending?: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ACCEPTED_DOC_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

export function MessageInput({ onSend, disabled, sending }: MessageInputProps) {
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileType, setFileType] = useState<'image' | 'document'>('image');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      alert('Le fichier est trop volumineux. Taille maximum: 10 MB');
      return;
    }

    const isImage = file.type.startsWith('image/');
    setFileType(isImage ? 'image' : 'document');
    setSelectedFile(file);

    if (isImage) {
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }

    setShowAttachMenu(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const openFilePicker = (type: 'image' | 'document') => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = type === 'image' 
        ? ACCEPTED_IMAGE_TYPES.join(',')
        : ACCEPTED_DOC_TYPES.join(',');
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if ((!content.trim() && !selectedFile) || disabled || sending) return;

    let attachment: Attachment | null = null;
    if (selectedFile) {
      attachment = {
        url: previewUrl || '', // Will be replaced by actual URL after upload
        type: fileType,
        name: selectedFile.name,
        size: selectedFile.size,
        file: selectedFile, // Pass the file for upload
      } as Attachment & { file: File };
    }

    await onSend(content, attachment);
    setContent('');
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const hasContent = content.trim().length > 0 || selectedFile !== null;

  return (
    <div className="bg-[#202C33]">
      {/* File Preview */}
      {selectedFile && (
        <div className="px-4 py-3 border-b border-[#374248]">
          <AttachmentPreview
            url={previewUrl || ''}
            type={fileType}
            name={selectedFile.name}
            size={selectedFile.size}
            onRemove={handleRemoveFile}
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="px-4 py-3 flex items-end gap-2">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* Emoji button */}
        <button
          type="button"
          className="p-2 hover:bg-[#374248] rounded-full transition-colors flex-shrink-0"
        >
          <Smile className="h-6 w-6 text-[#8696A0]" />
        </button>

        {/* Attachment button with menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            className="p-2 hover:bg-[#374248] rounded-full transition-colors flex-shrink-0"
          >
            <Paperclip className="h-6 w-6 text-[#8696A0]" />
          </button>

          {/* Attachment menu */}
          {showAttachMenu && (
            <div className="absolute bottom-full left-0 mb-2 bg-[#233138] rounded-lg shadow-lg overflow-hidden">
              <button
                type="button"
                onClick={() => openFilePicker('image')}
                className="flex items-center gap-3 px-4 py-3 hover:bg-[#374248] w-full text-left"
              >
                <div className="w-10 h-10 bg-[#BF59CF] rounded-full flex items-center justify-center">
                  <ImageIcon className="h-5 w-5 text-white" />
                </div>
                <span className="text-[#E9EDEF] text-sm">Photos</span>
              </button>
              <button
                type="button"
                onClick={() => openFilePicker('document')}
                className="flex items-center gap-3 px-4 py-3 hover:bg-[#374248] w-full text-left"
              >
                <div className="w-10 h-10 bg-[#5157AE] rounded-full flex items-center justify-center">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <span className="text-[#E9EDEF] text-sm">Documents</span>
              </button>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex-1 bg-[#2A3942] rounded-lg">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={selectedFile ? "Ajouter un commentaire..." : "Tapez un message"}
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
    </div>
  );
}
