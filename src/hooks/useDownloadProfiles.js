import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useDownloadProfiles() {
  const [profiles, setProfiles] = useState({
    en: null,
    vn: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('download_profile')
        .select('*')
        .eq('is_active', true)
        .order('order_index');
      
      if (error) {
        // Nếu table chưa tồn tại, không crash, chỉ log error
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          console.warn('Download profile table not found. Please run SQL script first.');
        } else {
          console.error('Error loading download profiles:', error);
        }
        setLoading(false);
        return;
      }
      
      if (data && data.length > 0) {
        const enProfile = data.find(p => 
          p.title?.includes('EN') || 
          p.title?.includes('English') ||
          p.title?.toLowerCase().includes('en')
        );
        const vnProfile = data.find(p => 
          p.title?.includes('VN') || 
          p.title?.includes('Vietnamese') ||
          p.title?.toLowerCase().includes('vn')
        );
        
        setProfiles({
          en: enProfile && enProfile.file_url ? enProfile : null,
          vn: vnProfile && vnProfile.file_url ? vnProfile : null
        });
      }
    } catch (error) {
      console.error('Error loading download profiles:', error);
      // Không crash app, chỉ log error
    } finally {
      setLoading(false);
    }
  };

  return { profiles, loading };
}
