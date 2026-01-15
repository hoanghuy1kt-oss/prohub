import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Upload, CheckCircle } from 'lucide-react';

export default function AboutImagesEditor() {
  const [aboutImages, setAboutImages] = useState({
    title: 'CÁC KHÁCH HÀNG CỦA CHÚNG TÔI',
    image_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [aboutImagesId, setAboutImagesId] = useState(null);

  useEffect(() => {
    loadAboutImages();
  }, []);

  const loadAboutImages = async () => {
    try {
      const { data, error } = await supabase
        .from('about_images')
        .select('*')
        .eq('is_active', true)
        .order('order_index')
        .limit(1);
      
      if (error) {
        console.error('Error loading about images:', error);
      } else if (data && data.length > 0) {
        const imagesData = data[0];
        setAboutImages({
          title: imagesData.title || 'CÁC KHÁCH HÀNG CỦA CHÚNG TÔI',
          image_url: imagesData.image_url || imagesData.image_1_url || imagesData.image_2_url || ''
        });
        setAboutImagesId(imagesData.id);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleImageUpload = async (file) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `about-image-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `about-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('project-images')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        alert('Lỗi upload: ' + uploadError.message);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('project-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Lỗi upload hình ảnh');
      return null;
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file hình ảnh');
      return;
    }

    const imageUrl = await handleImageUpload(file);
    
    if (imageUrl) {
      setAboutImages(prev => ({
        ...prev,
        image_url: imageUrl
      }));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);
    
    try {
      // Luôn check xem có row nào không (không dựa vào aboutImagesId)
      const { data: existingData, error: checkError } = await supabase
        .from('about_images')
        .select('id')
        .eq('is_active', true)
        .limit(1);
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing data:', checkError);
      }
      
      const existingId = existingData && existingData.length > 0 ? existingData[0].id : null;
      
      if (existingId) {
        // UPDATE existing row - thay thế
        const { error } = await supabase
          .from('about_images')
          .update({
            title: aboutImages.title,
            image_url: aboutImages.image_url,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingId);
        
        if (error) {
          alert('Lỗi: ' + error.message);
        } else {
          setSaved(true);
          setTimeout(() => setSaved(false), 3000);
          await loadAboutImages(); // Reload để sync
        }
      } else {
        // INSERT new row chỉ khi chưa có row nào
        const { error } = await supabase
          .from('about_images')
          .insert({
            title: aboutImages.title,
            image_url: aboutImages.image_url
          });
        
        if (error) {
          alert('Lỗi: ' + error.message);
        } else {
          setSaved(true);
          setTimeout(() => setSaved(false), 3000);
          await loadAboutImages(); // Reload để sync
        }
      }
    } catch (error) {
      alert('Lỗi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quản lý Hình ảnh About Page</h2>
        {saved && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle size={20} />
            <span className="text-sm">Đã lưu thành công!</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Tiêu đề</label>
          <input
            type="text"
            value={aboutImages.title}
            onChange={(e) => setAboutImages({...aboutImages, title: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            placeholder="CÁC KHÁCH HÀNG CỦA CHÚNG TÔI"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Hình ảnh</label>
          <div className="space-y-2">
            <input
              type="url"
              value={aboutImages.image_url}
              onChange={(e) => setAboutImages({...aboutImages, image_url: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              placeholder="URL hình ảnh hoặc upload"
            />
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200">
              <Upload size={16} />
              <span className="text-sm">Upload Hình ảnh</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
            {aboutImages.image_url && (
              <div className="mt-2 border border-gray-200 rounded-lg p-2 bg-gray-50">
                <img 
                  src={aboutImages.image_url} 
                  alt="About Image" 
                  className="w-full h-auto max-h-96 object-contain rounded-lg mx-auto" 
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">Hình ảnh này sẽ hiển thị ở dưới section "OUR CLIENTS"</p>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
      >
        <Save size={18} />
        {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
      </button>
    </div>
  );
}
