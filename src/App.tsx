import React, { useState } from 'react';
import { Sparkles, Wand2, Layers, Image as ImageIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { ImageUploader, UploadedImage } from './components/ImageUploader';
import { ResultPanel } from './components/ResultPanel';
import { generateProductImage, generateTikTokScript } from './services/geminiService';

const PRODUCT_TYPES = [
  { id: 'nhẫn', label: 'Nhẫn (Ring)' },
  { id: 'bông tai', label: 'Bông tai (Earring)' },
  { id: 'dây chuyền', label: 'Dây chuyền (Necklace)' },
  { id: 'vòng tay', label: 'Vòng tay (Bracelet)' },
];

const BACKGROUND_STYLES = [
  { id: 'luxurious marble', label: 'Đá cẩm thạch sang trọng (Luxurious Marble)' },
  { id: 'minimalist white', label: 'Trắng tối giản (Minimalist White)' },
  { id: 'soft silk', label: 'Lụa mềm mại (Soft Silk)' },
  { id: 'nature floral', label: 'Hoa lá tự nhiên (Nature Floral)' },
  { id: 'neon cyberpunk', label: 'Neon Cyberpunk' },
  { id: 'dark cinematic', label: 'Tối điện ảnh (Dark Cinematic)' },
];

const CAMERA_ANGLES = [
  { id: 'flattering natural angle', label: 'Tự nhiên (Natural)' },
  { id: 'straight front view', label: 'Trực diện (Front View)' },
  { id: '45-degree side angle', label: 'Góc nghiêng 45 độ (45° Angle)' },
  { id: 'top-down flatlay view', label: 'Từ trên xuống (Top-down)' },
  { id: 'extreme macro close-up', label: 'Cận cảnh (Macro)' },
];

export default function App() {
  const [selectedImages, setSelectedImages] = useState<UploadedImage[]>([]);
  const [productType, setProductType] = useState(PRODUCT_TYPES[0].id);
  const [backgroundStyle, setBackgroundStyle] = useState(BACKGROUND_STYLES[0].id);
  
  const [generationMode, setGenerationMode] = useState<'single' | 'multi'>('single');
  const [cameraAngle, setCameraAngle] = useState(CAMERA_ANGLES[0].id);
  const [selectedAngles, setSelectedAngles] = useState<string[]>(['straight front view', '45-degree side angle', 'extreme macro close-up']);
  
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<{url: string; angle: string}[]>([]);
  const [generatedScript, setGeneratedScript] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (selectedImages.length === 0) {
      alert('Vui lòng tải lên ít nhất một hình ảnh sản phẩm.');
      return;
    }

    setIsLoading(true);
    setGeneratedImages([]);
    setGeneratedScript(null);

    try {
      if (generationMode === 'single') {
        const imagePromises = selectedImages.map(img => 
          generateProductImage(img.base64, img.mimeType, backgroundStyle, productType, cameraAngle)
        );
        
        const angleLabel = CAMERA_ANGLES.find(a => a.id === cameraAngle)?.label || cameraAngle;
        
        const [scriptResult, ...imageResults] = await Promise.all([
          generateTikTokScript(selectedImages[0].base64, selectedImages[0].mimeType, productType, backgroundStyle, [angleLabel]),
          ...imagePromises
        ]);

        const validImages = imageResults
          .filter(Boolean)
          .map((url, idx) => ({ url: url as string, angle: `${angleLabel} (Ảnh ${idx + 1})` }));
          
        setGeneratedImages(validImages);
        setGeneratedScript(scriptResult);
      } else {
        if (selectedAngles.length === 0) {
          alert('Vui lòng chọn ít nhất 1 góc chụp.');
          setIsLoading(false);
          return;
        }
        
        const allImagePromises: Promise<string | null>[] = [];
        const angleMapping: { angleId: string, imgIdx: number }[] = [];
        
        selectedImages.forEach((img, imgIdx) => {
          selectedAngles.forEach(angleId => {
            allImagePromises.push(
              generateProductImage(img.base64, img.mimeType, backgroundStyle, productType, angleId)
            );
            angleMapping.push({ angleId, imgIdx });
          });
        });
        
        const selectedAngleLabels = selectedAngles.map(id => CAMERA_ANGLES.find(a => a.id === id)?.label || id);
        
        const [scriptResult, ...imageResults] = await Promise.all([
          generateTikTokScript(selectedImages[0].base64, selectedImages[0].mimeType, productType, backgroundStyle, selectedAngleLabels),
          ...allImagePromises
        ]);
        
        const validImages = imageResults
          .map((url, index) => {
            const { angleId, imgIdx } = angleMapping[index];
            const angleLabel = CAMERA_ANGLES.find(a => a.id === angleId)?.label || angleId;
            return { url: url as string, angle: `${angleLabel} (Ảnh ${imgIdx + 1})` };
          })
          .filter(img => img.url);
          
        setGeneratedImages(validImages);
        setGeneratedScript(scriptResult);
      }
    } catch (error) {
      console.error('Generation failed:', error);
      alert('Có lỗi xảy ra trong quá trình tạo. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-2xl mb-6"
          >
            <Sparkles className="w-8 h-8 text-indigo-400" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 text-transparent bg-clip-text"
          >
            TikTok Affiliate Studio
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-zinc-400 max-w-2xl mx-auto"
          >
            Biến ảnh chụp màn hình sản phẩm thành hình ảnh chuyên nghiệp và kịch bản video triệu view chỉ trong vài giây.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Panel - Controls */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-4 space-y-8"
          >
            <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 backdrop-blur-xl">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 text-sm">1</span>
                Tải ảnh sản phẩm
              </h2>
              <ImageUploader
                selectedImages={selectedImages}
                onImagesSelected={setSelectedImages}
                onClear={(index) => {
                  const newImages = [...selectedImages];
                  newImages.splice(index, 1);
                  setSelectedImages(newImages);
                }}
                maxImages={3}
              />
            </div>

            <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 backdrop-blur-xl space-y-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 text-sm">2</span>
                Tùy chỉnh
              </h2>
              
              <div className="space-y-3">
                <label className="block text-sm font-medium text-zinc-400">Loại sản phẩm</label>
                <div className="grid grid-cols-2 gap-2">
                  {PRODUCT_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setProductType(type.id)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        productType === type.id
                          ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                          : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                      }`}
                    >
                      {type.label.split(' ')[0]} {type.label.split(' ')[1]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-zinc-400">Phong cách bối cảnh</label>
                <select
                  value={backgroundStyle}
                  onChange={(e) => setBackgroundStyle(e.target.value)}
                  className="w-full bg-zinc-800/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none"
                >
                  {BACKGROUND_STYLES.map((style) => (
                    <option key={style.id} value={style.id}>
                      {style.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3 pt-2 border-t border-white/5">
                <label className="block text-sm font-medium text-zinc-400">Chế độ tạo ảnh</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setGenerationMode('single')}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                      generationMode === 'single'
                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                        : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    <ImageIcon className="w-4 h-4" />
                    1 Góc Quay
                  </button>
                  <button
                    onClick={() => setGenerationMode('multi')}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                      generationMode === 'multi'
                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                        : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    Nhiều Góc Quay
                  </button>
                </div>
              </div>

              {generationMode === 'single' && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-zinc-400">Góc chụp (Camera Angle)</label>
                  <select
                    value={cameraAngle}
                    onChange={(e) => setCameraAngle(e.target.value)}
                    className="w-full bg-zinc-800/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none"
                  >
                    {CAMERA_ANGLES.map((angle) => (
                      <option key={angle.id} value={angle.id}>
                        {angle.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {generationMode === 'multi' && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-zinc-400">Chọn các góc chụp muốn tạo</label>
                  <div className="flex flex-col gap-2">
                    {CAMERA_ANGLES.map((angle) => (
                      <label key={angle.id} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/50 border border-white/5 cursor-pointer hover:bg-zinc-800 transition-colors">
                        <input 
                          type="checkbox" 
                          checked={selectedAngles.includes(angle.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAngles([...selectedAngles, angle.id]);
                            } else {
                              setSelectedAngles(selectedAngles.filter(a => a !== angle.id));
                            }
                          }}
                          className="w-4 h-4 rounded border-zinc-600 text-indigo-500 focus:ring-indigo-500/50 bg-zinc-900"
                        />
                        <span className="text-sm text-zinc-300">{angle.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={selectedImages.length === 0 || isLoading}
                className={`w-full py-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all mt-4 ${
                  selectedImages.length === 0 || isLoading
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white shadow-xl shadow-indigo-500/20'
                }`}
              >
                <Wand2 className="w-5 h-5" />
                {isLoading ? 'Đang tạo...' : 'Tạo nội dung ngay'}
              </button>
            </div>
          </motion.div>

          {/* Right Panel - Results */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-8 bg-zinc-900/40 border border-white/5 rounded-3xl p-6 backdrop-blur-xl min-h-[600px]"
          >
            <ResultPanel
              isLoading={isLoading}
              generatedImages={generatedImages}
              generatedScript={generatedScript}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
