import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
    
    // Tự động refresh mỗi 3 giây để cập nhật khi Admin thay đổi
    const interval = setInterval(() => {
      loadHistory();
    }, 3000); // 3 giây - nhanh hơn
    
    return () => clearInterval(interval);
  }, []);

  const loadHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('history')
        .select('*')
        .order('order_index');
      
      if (error) {
        console.error('Error loading history:', error);
      } else if (data) {
        // Map description field (database) to desc (component expects)
        const mappedData = data.map(item => ({
          year: item.year,
          title: item.title,
          desc: item.description // Map description -> desc
        }));
        setHistory(mappedData);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    history,
    loading,
    refresh: loadHistory
  };
}
