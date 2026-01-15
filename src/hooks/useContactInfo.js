import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useContactInfo() {
  const [contactInfo, setContactInfo] = useState({
    email: '',
    hotline: '',
    business_registration_address: '',
    office_address: '',
    google_map_url: ''
  });
  const [loading, setLoading] = useState(true);

  const loadContactInfo = async (isInitial = false) => {
    try {
      // Không dùng .single() để tránh lỗi nếu có nhiều rows hoặc không có rows
      const { data: allData, error } = await supabase
        .from('contact_info')
        .select('*')
        .limit(1); // Chỉ lấy 1 row đầu tiên
      
      if (error) {
        console.error('Error loading contact info:', error);
        // Nếu có lỗi, vẫn set loading = false để không bị stuck ở "Đang tải..."
        if (isInitial) {
          setLoading(false);
        }
        return;
      }
      
      // Lấy row đầu tiên nếu có
      const data = allData && allData.length > 0 ? allData[0] : null;
      
      if (data) {
        const newContactInfo = {
          email: data.email || '',
          hotline: data.hotline || '',
          business_registration_address: data.business_registration_address || '',
          office_address: data.office_address || '',
          google_map_url: data.google_map_url || ''
        };
        
        // Luôn update state để đảm bảo data được cập nhật
        setContactInfo(newContactInfo);
      } else {
        // Nếu không có data, vẫn set loading = false
        console.warn('No contact info found in database');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      if (isInitial) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadContactInfo(true); // Initial load
    
    // Tự động refresh mỗi 3 giây để cập nhật khi Admin thay đổi
    const interval = setInterval(() => {
      loadContactInfo(false); // Polling - không set loading
    }, 3000); // 3 giây - nhanh hơn
    
    return () => clearInterval(interval);
  }, []);

  return {
    contactInfo,
    loading,
    refresh: loadContactInfo
  };
}
