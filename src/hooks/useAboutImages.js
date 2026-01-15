import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

export function useAboutImages() {
  const [aboutImages, setAboutImages] = useState({
    title: 'CÁC KHÁCH HÀNG CỦA CHÚNG TÔI',
    image_url: ''
  });
  const [loading, setLoading] = useState(true);
  const prevAboutImagesRef = useRef();

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
        const newAboutImages = {
          title: imagesData.title || 'CÁC KHÁCH HÀNG CỦA CHÚNG TÔI',
          image_url: imagesData.image_url || imagesData.image_1_url || imagesData.image_2_url || ''
        };
        
        if (JSON.stringify(newAboutImages) !== JSON.stringify(prevAboutImagesRef.current)) {
          setAboutImages(newAboutImages);
          prevAboutImagesRef.current = newAboutImages;
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAboutImages();
    
    // Auto refresh mỗi 3 giây để cập nhật khi Admin thay đổi
    const interval = setInterval(() => {
      loadAboutImages();
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    aboutImages,
    loading,
    refresh: loadAboutImages
  };
}
