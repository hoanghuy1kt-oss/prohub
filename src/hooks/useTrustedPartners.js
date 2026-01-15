import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

export function useTrustedPartners() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const prevPartnersRef = useRef();

  const loadPartners = async () => {
    try {
      const { data, error } = await supabase
        .from('trusted_partners')
        .select('*')
        .eq('is_active', true)
        .order('order_index');
      
      if (error) {
        console.error('Error loading trusted partners:', error);
      } else if (data && JSON.stringify(data) !== JSON.stringify(prevPartnersRef.current)) {
        setPartners(data);
        prevPartnersRef.current = data;
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPartners();
    
    // Auto refresh mỗi 3 giây để cập nhật khi Admin thay đổi
    const interval = setInterval(() => {
      loadPartners();
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    partners,
    loading,
    refresh: loadPartners
  };
}
