import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Plus, Trash2, CheckCircle, Upload, GripVertical } from 'lucide-react';

export default function TrustedPartnersEditor() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      const { data, error } = await supabase
        .from('trusted_partners')
        .select('*')
        .order('order_index');
      
      if (error) {
        console.error('Error loading partners:', error);
      } else {
        setPartners(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleImageUpload = async (file, partnerId) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${partnerId || 'new'}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `trusted-partners/${fileName}`;

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

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);
    
    try {
      // Update tất cả partners với order_index dựa trên vị trí trong array
      for (let i = 0; i < partners.length; i++) {
        const partner = partners[i];
        if (partner.id) {
          const { error } = await supabase
            .from('trusted_partners')
            .update({
              name: partner.name,
              logo_url: partner.logo_url,
              website_url: partner.website_url,
              order_index: i, // Tự động set order_index dựa trên vị trí
              is_active: partner.is_active,
              updated_at: new Date().toISOString()
            })
            .eq('id', partner.id);
          
          if (error) {
            console.error('Error updating partner:', error);
          }
        }
      }

      // Insert new partners nếu có
      const newPartners = partners.filter(p => !p.id);
      if (newPartners.length > 0) {
        const partnersToInsert = newPartners.map((p, index) => {
          const originalIndex = partners.indexOf(p);
          return {
            name: p.name,
            logo_url: p.logo_url || '',
            website_url: p.website_url || '',
            order_index: originalIndex, // Set order_index dựa trên vị trí
            is_active: p.is_active !== false
          };
        });

        const { error: insertError } = await supabase
          .from('trusted_partners')
          .insert(partnersToInsert);
        
        if (insertError) {
          console.error('Error inserting partners:', insertError);
        }
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      await loadPartners();
    } catch (error) {
      alert('Lỗi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setPartners([...partners, { 
      id: null, 
      name: '', 
      logo_url: '', 
      website_url: '', 
      order_index: partners.length,
      is_active: true 
    }]);
  };

  // Drag & Drop handlers
  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newPartners = [...partners];
    const draggedPartner = newPartners[draggedIndex];
    
    // Remove dragged item
    newPartners.splice(draggedIndex, 1);
    
    // Insert at new position
    newPartners.splice(dropIndex, 0, draggedPartner);
    
    setPartners(newPartners);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa partner này?')) return;
    
    if (id) {
      const { error } = await supabase
        .from('trusted_partners')
        .delete()
        .eq('id', id);
      
      if (error) {
        alert('Lỗi: ' + error.message);
      }
    }
    
    setPartners(partners.filter(p => p.id !== id));
  };

  const handleImageChange = async (e, partnerIndex) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file hình ảnh');
      return;
    }

    const partner = partners[partnerIndex];
    const logoUrl = await handleImageUpload(file, partner.id || `new-${partnerIndex}`);
    
    if (logoUrl) {
      const updatedPartners = [...partners];
      updatedPartners[partnerIndex].logo_url = logoUrl;
      setPartners(updatedPartners);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quản lý Trusted Partners</h2>
        {saved && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle size={20} />
            <span className="text-sm">Đã lưu thành công!</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {partners.map((partner, index) => (
          <div 
            key={partner.id || `new-${index}`} 
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={`border border-gray-200 rounded-lg p-4 space-y-4 cursor-move transition-all ${
              draggedIndex === index ? 'opacity-50 border-orange-500' : 'hover:border-gray-300'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <GripVertical className="text-gray-400 cursor-grab active:cursor-grabbing" size={20} />
                <h3 className="font-bold">Partner #{index + 1}</h3>
              </div>
              <button
                onClick={() => handleDelete(partner.id)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tên công ty</label>
                <input
                  type="text"
                  value={partner.name}
                  onChange={(e) => {
                    const updated = [...partners];
                    updated[index].name = e.target.value;
                    setPartners(updated);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="Microsoft"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Website URL (tùy chọn)</label>
                <input
                  type="url"
                  value={partner.website_url || ''}
                  onChange={(e) => {
                    const updated = [...partners];
                    updated[index].website_url = e.target.value;
                    setPartners(updated);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="https://www.microsoft.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Logo URL</label>
                <input
                  type="url"
                  value={partner.logo_url || ''}
                  onChange={(e) => {
                    const updated = [...partners];
                    updated[index].logo_url = e.target.value;
                    setPartners(updated);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="https://example.com/logo.svg"
                />
                <p className="text-xs text-gray-500 mt-1">Hoặc upload file</p>
                <label className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200">
                  <Upload size={16} />
                  <span className="text-sm">Upload Logo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, index)}
                    className="hidden"
                  />
                </label>
                {partner.logo_url && (
                  <div className="mt-2">
                    <img src={partner.logo_url} alt={partner.name} className="h-12 object-contain" />
                  </div>
                )}
              </div>

            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={partner.is_active !== false}
                onChange={(e) => {
                  const updated = [...partners];
                  updated[index].is_active = e.target.checked;
                  setPartners(updated);
                }}
                className="w-4 h-4"
              />
              <label className="text-sm">Hiển thị trên website</label>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-black rounded-lg hover:bg-gray-300"
        >
          <Plus size={18} />
          Thêm Partner
        </button>

        <button
          onClick={handleSave}
          disabled={loading || partners.length === 0}
          className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
        >
          <Save size={18} />
          {loading ? 'Đang lưu...' : 'Lưu tất cả'}
        </button>
      </div>
    </div>
  );
}
