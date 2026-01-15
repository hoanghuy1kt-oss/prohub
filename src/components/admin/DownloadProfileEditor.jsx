import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Upload, Download, CheckCircle, FileText } from 'lucide-react';

export default function DownloadProfileEditor() {
  const [profiles, setProfiles] = useState({
    en: {
      id: null,
      title: 'Download Profile EN',
      description: 'English Company Profile',
      file_name: '',
      file_url: '',
      file_size: 0,
      file_type: '',
      is_active: true
    },
    vn: {
      id: null,
      title: 'Download Profile VN',
      description: 'Vietnamese Company Profile',
      file_name: '',
      file_url: '',
      file_size: 0,
      file_type: '',
      is_active: true
    }
  });
  const [loading, setLoading] = useState({ en: false, vn: false });
  const [uploading, setUploading] = useState({ en: false, vn: false });
  const [saved, setSaved] = useState({ en: false, vn: false });

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('download_profile')
        .select('*')
        .order('order_index');
      
      if (error) {
        console.error('Error loading profiles:', error);
        return;
      }
      
      if (data) {
        // Tìm profile EN và VN
        const enProfile = data.find(p => p.title?.includes('EN') || p.title?.includes('English'));
        const vnProfile = data.find(p => p.title?.includes('VN') || p.title?.includes('Vietnamese'));
        
        if (enProfile) {
          setProfiles(prev => ({
            ...prev,
            en: {
              id: enProfile.id,
              title: 'Download Profile EN',
              description: enProfile.description || 'English Company Profile',
              file_name: enProfile.file_name || '',
              file_url: enProfile.file_url || '',
              file_size: enProfile.file_size || 0,
              file_type: enProfile.file_type || '',
              is_active: enProfile.is_active !== false
            }
          }));
        }
        
        if (vnProfile) {
          setProfiles(prev => ({
            ...prev,
            vn: {
              id: vnProfile.id,
              title: 'Download Profile VN',
              description: vnProfile.description || 'Vietnamese Company Profile',
              file_name: vnProfile.file_name || '',
              file_url: vnProfile.file_url || '',
              file_size: vnProfile.file_size || 0,
              file_type: vnProfile.file_type || '',
              is_active: vnProfile.is_active !== false
            }
          }));
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleFileUpload = async (file, type) => {
    setUploading(prev => ({ ...prev, [type]: true }));
    
    try {
      const fileName = `profile-${type}-${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('project-images')
        .upload(fileName, file);
      
      if (uploadError) {
        alert('Lỗi upload: ' + uploadError.message);
        setUploading(prev => ({ ...prev, [type]: false }));
        return null;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('project-images')
        .getPublicUrl(fileName);
      
      setUploading(prev => ({ ...prev, [type]: false }));
      return {
        url: publicUrl,
        fileName: fileName,
        size: file.size,
        type: file.type
      };
    } catch (error) {
      alert('Lỗi: ' + error.message);
      setUploading(prev => ({ ...prev, [type]: false }));
      return null;
    }
  };

  const handleSave = async (type) => {
    const profile = profiles[type];
    
    if (!profile.file_url) {
      alert('Vui lòng upload file trước khi lưu');
      return;
    }

    setLoading(prev => ({ ...prev, [type]: true }));
    setSaved(prev => ({ ...prev, [type]: false }));
    
    try {
      if (profile.id) {
        // Update existing
        const { error } = await supabase
          .from('download_profile')
          .update({
            title: profile.title,
            description: profile.description,
            file_name: profile.file_name,
            file_url: profile.file_url,
            file_size: profile.file_size,
            file_type: profile.file_type,
            is_active: profile.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', profile.id);
        
        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('download_profile')
          .insert({
            title: profile.title,
            description: profile.description,
            file_name: profile.file_name,
            file_url: profile.file_url,
            file_size: profile.file_size,
            file_type: profile.file_type,
            is_active: profile.is_active,
            order_index: type === 'en' ? 0 : 1
          });
        
        if (error) throw error;
      }
      
      setSaved(prev => ({ ...prev, [type]: true }));
      setTimeout(() => setSaved(prev => ({ ...prev, [type]: false })), 3000);
      loadProfiles();
    } catch (error) {
      alert('Lỗi: ' + error.message);
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const updateProfile = (type, field, value) => {
    setProfiles(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }));
  };

  const ProfileCard = ({ type, label }) => {
    const profile = profiles[type];
    const isUploading = uploading[type];
    const isLoading = loading[type];
    const isSaved = saved[type];

    return (
      <div className="border-2 border-gray-200 rounded-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold mb-1">{label}</h3>
            <p className="text-sm text-gray-500">{profile.description}</p>
          </div>
          {isSaved && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle size={20} />
              <span className="text-sm">Đã lưu!</span>
            </div>
          )}
        </div>

        {/* File Upload/Display */}
        <div className="mb-4">
          {profile.file_url ? (
            <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <FileText size={24} className="text-gray-600" />
                  <div>
                    <p className="font-medium">{profile.file_name || 'File'}</p>
                    {profile.file_size > 0 && (
                      <p className="text-sm text-gray-500">{formatFileSize(profile.file_size)}</p>
                    )}
                  </div>
                </div>
                <a
                  href={profile.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                >
                  <Download size={16} />
                  Download
                </a>
              </div>
              <button
                onClick={async () => {
                  const fileInput = document.createElement('input');
                  fileInput.type = 'file';
                  fileInput.onchange = async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    
                    const fileInfo = await handleFileUpload(file, type);
                    if (fileInfo) {
                      updateProfile(type, 'file_url', fileInfo.url);
                      updateProfile(type, 'file_name', fileInfo.fileName);
                      updateProfile(type, 'file_size', fileInfo.size);
                      updateProfile(type, 'file_type', fileInfo.type);
                    }
                  };
                  fileInput.click();
                }}
                disabled={isUploading}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                {isUploading ? 'Đang upload...' : 'Thay đổi file'}
              </button>
            </div>
          ) : (
            <label className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors border-2 border-dashed border-gray-300 w-full justify-center">
              <Upload size={20} />
              <span>{isUploading ? 'Đang upload...' : 'Upload file PDF'}</span>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                disabled={isUploading}
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  
                  const fileInfo = await handleFileUpload(file, type);
                  if (fileInfo) {
                    updateProfile(type, 'file_url', fileInfo.url);
                    updateProfile(type, 'file_name', fileInfo.fileName);
                    updateProfile(type, 'file_size', fileInfo.size);
                    updateProfile(type, 'file_type', fileInfo.type);
                  }
                }}
              />
            </label>
          )}
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Description</label>
          <input
            type="text"
            value={profile.description}
            onChange={(e) => updateProfile(type, 'description', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="English Company Profile"
          />
        </div>

        {/* Active Toggle */}
        <div className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            id={`active-${type}`}
            checked={profile.is_active}
            onChange={(e) => updateProfile(type, 'is_active', e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor={`active-${type}`} className="text-sm font-medium">
            Active (hiển thị trên website)
          </label>
        </div>

        {/* Save Button */}
        <button
          onClick={() => handleSave(type)}
          disabled={isLoading || !profile.file_url}
          className="w-full flex items-center justify-center gap-2 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={18} />
          {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quản lý Download Profile</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProfileCard type="en" label="Download Profile EN" />
        <ProfileCard type="vn" label="Download Profile VN" />
      </div>
    </div>
  );
}
