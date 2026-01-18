import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useInternalContent() {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all internal contents
  const fetchContents = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('internal_content')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setContents(data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching internal content:', err);
    } finally {
      setLoading(false);
    }
  };

  // Upload new internal content
  // Note: File sẽ được download tự động, admin cần copy vào src/pages/Internal Content/ thủ công
  const uploadContent = async (file, displayName, description = '') => {
    try {
      if (!file || !displayName) {
        throw new Error('File và tên hiển thị là bắt buộc');
      }

      if (!file.name.endsWith('.jsx')) {
        throw new Error('Chỉ chấp nhận file .jsx');
      }

      // Generate unique file name
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${timestamp}-${sanitizedName}`;
      const filePath = `/internal-content/${fileName}`;

      // Lưu metadata vào database
      const { data, error: insertError } = await supabase
        .from('internal_content')
        .insert({
          file_name: fileName,
          display_name: displayName,
          file_path: filePath,
          description: description,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Tự động download file để admin copy vào folder
      const fileUrl = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName; // Download với tên file đã được generate
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(fileUrl);

      await fetchContents();
      return { 
        data: { ...data, file_path: filePath }, 
        error: null,
        fileName: fileName // Trả về fileName để hiển thị hướng dẫn
      };
    } catch (err) {
      console.error('Error uploading internal content:', err);
      return { data: null, error: err.message };
    }
  };

  useEffect(() => {
    fetchContents();
  }, []);

  return {
    contents,
    loading,
    error,
    fetchContents,
    uploadContent,
  };
}
