import React from 'react';
import Markdown from 'react-markdown';
import { Loader2, Image as ImageIcon, FileText, Download, Copy, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface ResultPanelProps {
  isLoading: boolean;
  generatedImages: { url: string; angle: string }[];
  generatedScript: string | null;
}

export function ResultPanel({ isLoading, generatedImages, generatedScript }: ResultPanelProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (generatedScript) {
      navigator.clipboard.writeText(generatedScript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = (imageUrl: string, index: number) => {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `product-image-${index + 1}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] space-y-6 text-zinc-400">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
        <div className="text-center space-y-2">
          <h3 className="text-lg font-medium text-zinc-200">Đang tạo nội dung...</h3>
          <p className="text-sm">AI đang tách nền, tạo bối cảnh mới và viết kịch bản TikTok.</p>
        </div>
      </div>
    );
  }

  if (generatedImages.length === 0 && !generatedScript) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-zinc-500 border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
        <div className="p-6 bg-zinc-900 rounded-full mb-4">
          <ImageIcon className="w-10 h-10 opacity-50" />
        </div>
        <p className="text-sm font-medium">Kết quả sẽ hiển thị ở đây</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Generated Image Section */}
      {generatedImages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden"
        >
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-zinc-900">
            <div className="flex items-center gap-2 text-zinc-200 font-medium">
              <ImageIcon className="w-5 h-5 text-indigo-400" />
              <span>Ảnh Sản Phẩm Mới ({generatedImages.length})</span>
            </div>
          </div>
          <div className={`p-6 bg-black/20 grid gap-4 ${generatedImages.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'flex justify-center'}`}>
            {generatedImages.map((img, idx) => (
              <div key={idx} className="relative group flex justify-center rounded-xl overflow-hidden">
                <div className="absolute top-3 left-3 z-10 bg-black/70 backdrop-blur-md text-white text-xs font-medium px-2.5 py-1.5 rounded-lg border border-white/10">
                  {img.angle}
                </div>
                <img
                  src={img.url}
                  alt={`Generated Product ${idx + 1}`}
                  className="max-w-full h-auto max-h-[500px] rounded-xl shadow-2xl ring-1 ring-white/10 object-contain"
                />
                <button
                  onClick={() => handleDownload(img.url, idx)}
                  className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1.5 text-sm bg-black/60 hover:bg-black/80 text-white rounded-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Download className="w-4 h-4" />
                  Tải xuống
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Generated Script Section */}
      {generatedScript && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden"
        >
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-zinc-900">
            <div className="flex items-center gap-2 text-zinc-200 font-medium">
              <FileText className="w-5 h-5 text-emerald-400" />
              <span>Kịch Bản TikTok Review</span>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
            >
              {copied ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Đã chép' : 'Sao chép'}
            </button>
          </div>
          <div className="p-6 prose prose-invert prose-zinc max-w-none">
            <div className="markdown-body text-sm leading-relaxed text-zinc-300">
              <Markdown>{generatedScript}</Markdown>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
