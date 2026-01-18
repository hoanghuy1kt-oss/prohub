import React, { useState, useMemo } from 'react';
import { useInternalContent } from '../../../hooks/useInternalContent';
import { Search, Upload, FileCode, CheckCircle2, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function InternalContentList() {
  const { contents, loading, uploadContent } = useInternalContent();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  // Filter contents based on search
  const filteredContents = useMemo(() => {
    if (!searchQuery) return contents;
    const query = searchQuery.toLowerCase();
    return contents.filter(
      (content) =>
        content.display_name.toLowerCase().includes(query) ||
        content.file_name.toLowerCase().includes(query) ||
        (content.description && content.description.toLowerCase().includes(query))
    );
  }, [contents, searchQuery]);

  // Handle file upload
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile || !displayName) {
      alert('Vui lòng chọn file và nhập tên hiển thị');
      return;
    }

    if (!uploadFile.name.endsWith('.jsx')) {
      alert('Chỉ chấp nhận file .jsx');
      return;
    }

    setUploading(true);
    const result = await uploadContent(uploadFile, displayName, description);
    setUploading(false);

    if (result.error) {
      alert(`Lỗi: ${result.error}`);
    } else {
      const fileName = result.fileName || 'file.jsx';
      alert(
        `Metadata đã lưu thành công!\n\n` +
        `BƯỚC TIẾP THEO:\n` +
        `1. File đã được download tự động với tên: ${fileName}\n` +
        `2. Copy file vào folder: src/pages/Internal Content/\n` +
        `3. Đảm bảo tên file đúng là: ${fileName}\n\n` +
        `LƯU Ý: Folder tên có khoảng trắng "Internal Content" (không phải "InternalContent")\n` +
        `File sẽ được load tự động khi user click vào project.`
      );
      setShowUploadModal(false);
      setUploadFile(null);
      setDisplayName('');
      setDescription('');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">
          Internal Content
        </h1>
        <p className="text-gray-600 mb-4">
          Quản lý các component Internal Content (.jsx files)
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Lưu ý:</strong> Sau khi upload, file .jsx sẽ được download tự động. 
            Vui lòng copy file vào folder <code className="bg-blue-100 px-2 py-1 rounded">src/pages/Internal Content/</code> với đúng tên file. 
            File sẽ được load tự động khi user click vào project. Folder tên có khoảng trắng "Internal Content" (không phải "InternalContent").
          </p>
        </div>
      </div>

      {/* Search and Upload Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm Internal Content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="px-6 py-3 bg-black text-white font-bold uppercase tracking-widest text-sm rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <Upload size={18} />
          Upload
        </button>
      </div>

      {/* Content List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContents.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-400">
            {searchQuery ? 'Không tìm thấy Internal Content nào' : 'Chưa có Internal Content nào'}
          </div>
        ) : (
          filteredContents.map((content) => (
            <motion.div
              key={content.id}
              whileHover={{ y: -5 }}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-gray-100 rounded-lg">
                  <FileCode size={24} className="text-black" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">{content.display_name}</h3>
                  <p className="text-sm text-gray-500">{content.file_name}</p>
                </div>
              </div>
              {content.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {content.description}
                </p>
              )}
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{new Date(content.created_at).toLocaleDateString('vi-VN')}</span>
                <CheckCircle2 size={16} className="text-green-500" />
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-8 max-w-md w-full"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Upload Internal Content</h2>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadFile(null);
                  setDisplayName('');
                  setDescription('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">
                  File .jsx <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept=".jsx"
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
                {uploadFile && (
                  <p className="text-xs text-gray-500 mt-1">
                    Đã chọn: {uploadFile.name}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">
                  Tên hiển thị <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Ví dụ: Custom Project Layout"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Mô tả</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  rows={3}
                  placeholder="Mô tả về Internal Content này..."
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadFile(null);
                    setDisplayName('');
                    setDescription('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-bold hover:bg-gray-50 transition-colors"
                  disabled={uploading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-black text-white rounded-lg font-bold hover:bg-gray-800 transition-colors disabled:opacity-50"
                  disabled={uploading}
                >
                  {uploading ? 'Đang upload...' : 'Upload'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
