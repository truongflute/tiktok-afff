import React, { useCallback, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

export interface UploadedImage {
  base64: string;
  mimeType: string;
  previewUrl: string;
}

interface ImageUploaderProps {
  onImagesSelected: (images: UploadedImage[]) => void;
  selectedImages: UploadedImage[];
  onClear: (index: number) => void;
  maxImages?: number;
}

export function ImageUploader({ onImagesSelected, selectedImages, onClear, maxImages = 3 }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFiles = (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length === 0) {
      alert('Vui lòng chọn tệp hình ảnh.');
      return;
    }

    const availableSlots = maxImages - selectedImages.length;
    const filesToProcess = validFiles.slice(0, availableSlots);

    if (validFiles.length > availableSlots) {
      alert(`Bạn chỉ có thể tải lên tối đa ${maxImages} ảnh. Đã bỏ qua các ảnh thừa.`);
    }

    const newImages: UploadedImage[] = [];
    let processedCount = 0;

    filesToProcess.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const base64Data = result.split(',')[1];
        newImages.push({
          base64: base64Data,
          mimeType: file.type,
          previewUrl: result
        });
        
        processedCount++;
        if (processedCount === filesToProcess.length) {
          onImagesSelected([...selectedImages, ...newImages]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [selectedImages, maxImages, onImagesSelected]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
    // Reset input so the same file can be selected again if needed
    e.target.value = '';
  };

  return (
    <div className="space-y-4">
      {selectedImages.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {selectedImages.map((img, idx) => (
            <div key={idx} className="relative w-full aspect-square rounded-xl overflow-hidden border-2 border-white/10 bg-zinc-900/50 group">
              <img src={img.previewUrl} alt={`Selected product ${idx + 1}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => onClear(idx)}
                  className="p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full backdrop-blur-sm transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedImages.length < maxImages && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative w-full ${selectedImages.length === 0 ? 'aspect-square' : 'h-32'} rounded-2xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center p-6 text-center cursor-pointer overflow-hidden
            ${isDragging ? 'border-indigo-500 bg-indigo-500/10' : 'border-zinc-700 bg-zinc-900/50 hover:border-zinc-500 hover:bg-zinc-800/50'}`}
        >
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center gap-3 pointer-events-none">
            <div className={`p-3 bg-zinc-800 rounded-full text-zinc-400 ${selectedImages.length > 0 ? 'scale-75' : ''}`}>
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-200 mb-1">Kéo thả ảnh vào đây</p>
              <p className="text-xs text-zinc-500">{selectedImages.length > 0 ? `Có thể tải thêm ${maxImages - selectedImages.length} ảnh` : 'hoặc click để chọn file'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
