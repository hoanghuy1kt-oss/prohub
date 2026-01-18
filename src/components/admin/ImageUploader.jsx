import { useState, useRef, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Upload, X, Copy, Check, Image as ImageIcon, Loader2, Trash2 } from 'lucide-react';

const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const STORAGE_KEY = 'internal_content_uploaded_images';

export default function ImageUploader() {
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const fileInputRef = useRef(null);

  // Load images from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setUploadedImages(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.warn('Failed to load saved images:', error);
    }
  }, []);

  // Save images to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(uploadedImages));
    } catch (error) {
      console.warn('Failed to save images:', error);
    }
  }, [uploadedImages]);

  // Resize ảnh để đảm bảo dưới 5MB
  const resizeImage = (file, maxWidth = 1920, quality = 0.85) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Resize nếu ảnh lớn hơn maxWidth
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to blob với quality
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to compress image'));
              }
            },
            'image/jpeg',
            quality
          );
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Xử lý upload với resize tự động
  const processAndUpload = async (file) => {
    let processedFile = file;

    // Kiểm tra kích thước file
    if (file.size > MAX_SIZE_BYTES) {
      // Nếu file lớn hơn 5MB, resize/compress
      if (file.type.startsWith('image/')) {
        try {
          // Thử resize với các mức độ khác nhau
          let resizedBlob = await resizeImage(file, 1920, 0.85);
          
          if (resizedBlob.size > MAX_SIZE_BYTES) {
            resizedBlob = await resizeImage(file, 1600, 0.75);
            if (resizedBlob.size > MAX_SIZE_BYTES) {
              resizedBlob = await resizeImage(file, 1280, 0.7);
              if (resizedBlob.size > MAX_SIZE_BYTES) {
                resizedBlob = await resizeImage(file, 1024, 0.65);
              }
            }
          }
          
          processedFile = new File([resizedBlob], file.name, { type: 'image/jpeg' });
          
          if (processedFile.size > MAX_SIZE_BYTES) {
            throw new Error(`Không thể resize ảnh "${file.name}" xuống dưới ${MAX_SIZE_MB}MB. Vui lòng chọn ảnh nhỏ hơn.`);
          }
        } catch (resizeError) {
          throw resizeError;
        }
      } else {
        throw new Error(`File "${file.name}" vượt quá ${MAX_SIZE_MB}MB và không phải là ảnh. Vui lòng chọn file khác.`);
      }
    } else if (file.type.startsWith('image/')) {
      // Nếu file nhỏ hơn 5MB nhưng vẫn là ảnh, vẫn resize để tối ưu
      try {
        const resizedBlob = await resizeImage(file, 1920, 0.85);
        processedFile = new File([resizedBlob], file.name, { type: 'image/jpeg' });
      } catch (resizeError) {
        // Nếu resize fail, dùng file gốc
        console.warn('Resize failed, using original file:', resizeError);
      }
    }

    // Upload lên Supabase Storage
    const fileName = `internal-content-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('project-images')
      .upload(fileName, processedFile);
    
    if (uploadError) {
      throw new Error('Lỗi upload: ' + uploadError.message);
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('project-images')
      .getPublicUrl(fileName);
    
    return {
      url: publicUrl,
      fileName: fileName,
      originalName: file.name,
      size: processedFile.size,
      sizeMB: (processedFile.size / (1024 * 1024)).toFixed(2)
    };
  };

  // Upload file
  const handleUpload = async (files) => {
    const fileArray = Array.from(files);
    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      alert('Vui lòng chọn ít nhất một file ảnh');
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = imageFiles.map(file => processAndUpload(file));
      const results = await Promise.all(uploadPromises);
      
      setUploadedImages(prev => [...results, ...prev]);
      alert(`Đã upload thành công ${results.length} ảnh!`);
    } catch (error) {
      alert('Lỗi: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  // Copy URL
  const copyToClipboard = async (url, index) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      alert('Không thể copy URL');
    }
  };

  // Xóa ảnh khỏi danh sách (không xóa khỏi storage)
  const removeImage = (index) => {
    setUploadedImages(prev => {
      const newList = prev.filter((_, i) => i !== index);
      return newList;
    });
  };

  // Clear all images from list
  const clearAllImages = () => {
    if (!confirm('Bạn có chắc muốn xóa tất cả ảnh khỏi danh sách? (Ảnh vẫn còn trong storage)')) {
      return;
    }
    setUploadedImages([]);
  };

  // Xóa ảnh khỏi storage và danh sách
  const deleteImage = async (fileName, index) => {
    if (!confirm('Bạn có chắc muốn xóa ảnh này khỏi storage?')) {
      return;
    }

    try {
      const { error } = await supabase.storage
        .from('project-images')
        .remove([fileName]);
      
      if (error) {
        throw error;
      }
      
      removeImage(index);
      alert('Đã xóa ảnh thành công!');
    } catch (error) {
      alert('Lỗi xóa ảnh: ' + error.message);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Upload Ảnh cho Internal Content</h2>
        <p className="text-gray-600 text-sm">
          Upload ảnh và lấy URL để sử dụng trong file Internal Content. Ảnh sẽ tự động được resize xuống dưới {MAX_SIZE_MB}MB.
        </p>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : uploading
            ? 'border-gray-300 bg-gray-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleUpload(e.target.files);
              e.target.value = '';
            }
          }}
          disabled={uploading}
        />
        
        {uploading ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            <p className="text-gray-600">Đang upload và resize ảnh...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <p className="text-lg font-medium mb-1">
                Kéo thả ảnh vào đây hoặc click để chọn
              </p>
              <p className="text-sm text-gray-500">
                Hỗ trợ nhiều ảnh cùng lúc. Ảnh sẽ tự động resize xuống dưới {MAX_SIZE_MB}MB
              </p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Chọn ảnh
            </button>
          </div>
        )}
      </div>

      {/* Uploaded Images List */}
      {uploadedImages.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold">
              Ảnh đã upload ({uploadedImages.length})
            </h3>
            <button
              onClick={clearAllImages}
              className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
            >
              Xóa tất cả khỏi danh sách
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {uploadedImages.map((image, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Preview */}
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-3 relative group">
                  <img
                    src={image.url}
                    alt={image.originalName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => deleteImage(image.fileName, index)}
                      className="px-3 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700 flex items-center gap-1"
                    >
                      <Trash2 size={14} />
                      Xóa
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 truncate" title={image.originalName}>
                    {image.originalName}
                  </p>
                  <p className="text-xs text-gray-400">
                    Kích thước: {image.sizeMB} MB
                  </p>

                  {/* URL Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={image.url}
                      readOnly
                      className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      onClick={(e) => e.target.select()}
                    />
                    <button
                      onClick={() => copyToClipboard(image.url, index)}
                      className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
                      title="Copy URL"
                    >
                      {copiedIndex === index ? (
                        <Check size={16} className="text-green-300" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {uploadedImages.length === 0 && !uploading && (
        <div className="text-center py-12 text-gray-400">
          <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Chưa có ảnh nào được upload</p>
        </div>
      )}
    </div>
  );
}
