import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, CheckCircle } from 'lucide-react';

export default function ContactEditor() {
  const [contactInfo, setContactInfo] = useState({
    email: '',
    hotline: '',
    business_registration_address: '',
    office_address: '',
    google_map_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadContactInfo();
  }, []);

  const loadContactInfo = async (preserveCurrentState = false) => {
    try {
      // Không dùng .single() để tránh lỗi nếu có nhiều rows hoặc không có rows
      const { data: allData, error } = await supabase
        .from('contact_info')
        .select('*')
        .limit(1);
      
      if (error) {
        console.error('Error loading contact info:', error);
        return;
      }
      
      // Lấy row đầu tiên nếu có
      const data = allData && allData.length > 0 ? allData[0] : null;
      
      if (data) {
        if (preserveCurrentState) {
          // Merge với state hiện tại để giữ lại các field đã nhập nếu chưa có trong database
          setContactInfo(prev => ({
            email: data.email || prev.email || '',
            hotline: data.hotline || prev.hotline || '',
            business_registration_address: data.business_registration_address || prev.business_registration_address || '',
            office_address: data.office_address || prev.office_address || '',
            google_map_url: data.google_map_url || prev.google_map_url || ''
          }));
        } else {
          // Load trực tiếp từ database, không merge (dùng khi reload sau save)
          setContactInfo({
            email: data.email || '',
            hotline: data.hotline || '',
            business_registration_address: data.business_registration_address || '',
            office_address: data.office_address || '',
            google_map_url: data.google_map_url || ''
          });
        }
      }
      // Nếu không có data, giữ nguyên state hiện tại (không reset về empty)
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);
    
    try {
      // Load data hiện tại từ database để merge
      const { data: currentData, error: loadError } = await supabase
        .from('contact_info')
        .select('*')
        .order('updated_at', { ascending: false }) // Lấy row mới nhất
        .limit(1);
      
      if (loadError && loadError.code !== 'PGRST116') {
        console.error('Error loading current data:', loadError);
      }
      
      const existingRow = currentData && currentData.length > 0 ? currentData[0] : null;
      const existingId = existingRow?.id;
      
      // Merge: giữ nguyên data cũ từ database, chỉ thay thế field có giá trị trong form
      const dataToSave = existingRow ? {
        // Giữ lại tất cả data cũ từ database
        email: existingRow.email || '',
        hotline: existingRow.hotline || '',
        business_registration_address: existingRow.business_registration_address || '',
        office_address: existingRow.office_address || '',
        google_map_url: existingRow.google_map_url || '',
        // Chỉ thay thế những field có giá trị trong form (không phải empty string)
        ...(contactInfo.email && contactInfo.email.trim() !== '' && { email: contactInfo.email.trim() }),
        ...(contactInfo.hotline && contactInfo.hotline.trim() !== '' && { hotline: contactInfo.hotline.trim() }),
        ...(contactInfo.business_registration_address && contactInfo.business_registration_address.trim() !== '' && { business_registration_address: contactInfo.business_registration_address.trim() }),
        ...(contactInfo.office_address && contactInfo.office_address.trim() !== '' && { office_address: contactInfo.office_address.trim() }),
        ...(contactInfo.google_map_url && contactInfo.google_map_url.trim() !== '' && { google_map_url: contactInfo.google_map_url.trim() }),
        updated_at: new Date().toISOString()
      } : {
        // Nếu chưa có row, insert với tất cả data từ form (chỉ field có giá trị)
        email: contactInfo.email?.trim() || '',
        hotline: contactInfo.hotline?.trim() || '',
        business_registration_address: contactInfo.business_registration_address?.trim() || '',
        office_address: contactInfo.office_address?.trim() || '',
        google_map_url: contactInfo.google_map_url?.trim() || '',
        updated_at: new Date().toISOString()
      };
      
      let error;
      if (existingId) {
        // UPDATE existing row - thay thế, không insert
        const { error: updateError } = await supabase
          .from('contact_info')
          .update(dataToSave)
          .eq('id', existingId);
        error = updateError;
      } else {
        // INSERT new row CHỈ KHI chưa có row nào
        const { error: insertError } = await supabase
          .from('contact_info')
          .insert(dataToSave);
        error = insertError;
      }
      
      if (error) {
        alert('Lỗi: ' + error.message);
      } else {
        // Cập nhật state với giá trị vừa save (không reload từ database để tránh race condition)
        setContactInfo({
          email: dataToSave.email,
          hotline: dataToSave.hotline,
          business_registration_address: dataToSave.business_registration_address,
          office_address: dataToSave.office_address,
          google_map_url: dataToSave.google_map_url
        });
        
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        // KHÔNG reload để tránh race condition - form giữ nguyên giá trị vừa nhập
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
        <h2 className="text-2xl font-bold">Chỉnh sửa Thông tin Liên hệ</h2>
        {saved && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle size={20} />
            <span className="text-sm">Đã lưu thành công!</span>
          </div>
        )}
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            value={contactInfo.email}
            onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="vannhi@pro-hub.com.vn"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Hotline</label>
          <input
            type="text"
            value={contactInfo.hotline}
            onChange={(e) => setContactInfo({...contactInfo, hotline: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="(+84) 908 583 042"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Business Registration Address</label>
          <textarea
            value={contactInfo.business_registration_address}
            onChange={(e) => setContactInfo({...contactInfo, business_registration_address: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            rows="3"
            placeholder="No 5, B12, TT51, Cam Hoi, Dong Nhan, Hai Ba Trung, Hanoi"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Office Address</label>
          <textarea
            value={contactInfo.office_address}
            onChange={(e) => setContactInfo({...contactInfo, office_address: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            rows="3"
            placeholder="Floor 4, MindX, 505 Minh Khai, Vinh Tuy, Hai Ba Trung, Hanoi"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Google Map Link</label>
          <input
            type="url"
            value={contactInfo.google_map_url}
            onChange={(e) => setContactInfo({...contactInfo, google_map_url: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="https://maps.app.goo.gl/itzqYqQWK1zt9HLN9"
          />
          <p className="text-xs text-gray-500 mt-1">Link Google Maps để hiển thị trên website</p>
        </div>
      </div>
      
      <button
        onClick={handleSave}
        disabled={loading}
        className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Save size={18} />
        {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
      </button>
    </div>
  );
}
