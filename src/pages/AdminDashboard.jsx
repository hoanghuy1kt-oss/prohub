import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, History, FolderKanban, Download, LogOut, Users, Image, FileCode, Tags, Upload } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ContactEditor from '../components/admin/ContactEditor';
import HistoryEditor from '../components/admin/HistoryEditor';
import ProjectsEditor from '../components/admin/ProjectsEditor';
import CategoriesEditor from '../components/admin/CategoriesEditor';
import DownloadProfileEditor from '../components/admin/DownloadProfileEditor';
import TrustedPartnersEditor from '../components/admin/TrustedPartnersEditor';
import AboutImagesEditor from '../components/admin/AboutImagesEditor';
import InternalContentList from './admin/InternalContent/InternalContentList';
import ImageUploader from '../components/admin/ImageUploader';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('contact');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const auth = sessionStorage.getItem('admin_authenticated');
    if (auth !== 'true') {
      navigate('/admin');
    } else {
      setIsAuthenticated(true);
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('admin_authenticated');
    navigate('/admin');
  };

  if (!isAuthenticated) return null;

  const tabs = [
    { id: 'contact', label: 'Contact Info', icon: Mail },
    { id: 'history', label: 'Our History', icon: History },
    { id: 'categories', label: 'Categories', icon: Tags },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'internal-content', label: 'Internal Content', icon: FileCode },
    { id: 'image-uploader', label: 'Upload Ảnh', icon: Upload },
    { id: 'partners', label: 'Trusted Partners', icon: Users },
    { id: 'about-images', label: 'About Images', icon: Image },
    { id: 'download', label: 'Download Profile', icon: Download },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            Đăng xuất
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-4 mb-8 border-b overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-black text-black font-bold'
                  : 'border-transparent text-gray-500 hover:text-black'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          {activeTab === 'contact' && <ContactEditor />}
          {activeTab === 'history' && <HistoryEditor />}
          {activeTab === 'categories' && <CategoriesEditor />}
          {activeTab === 'projects' && <ProjectsEditor />}
          {activeTab === 'internal-content' && <InternalContentList />}
          {activeTab === 'image-uploader' && <ImageUploader />}
          {activeTab === 'partners' && <TrustedPartnersEditor />}
          {activeTab === 'about-images' && <AboutImagesEditor />}
          {activeTab === 'download' && <DownloadProfileEditor />}
        </motion.div>
      </div>
    </div>
  );
}
