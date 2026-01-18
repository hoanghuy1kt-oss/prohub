import React, { useState, useEffect, Suspense, lazy, Component, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Menu, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

// Sử dụng import.meta.glob để load tất cả Internal Content files (giống WOWFIT)
const internalContentModules = import.meta.glob('../pages/Internal Content/*.jsx', { eager: false });

// Error Boundary để catch lỗi khi render Internal Content
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error rendering Internal Content:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Lỗi khi render Internal Content</h2>
            <p className="text-gray-600 mb-4">{this.state.error?.message || 'Unknown error'}</p>
            <pre className="bg-gray-100 p-4 rounded text-left text-sm overflow-auto max-h-64">
              {this.state.error?.stack}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Helper function để kiểm tra xem id có phải UUID không
const isUUID = (str) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInternalContentLoaded, setIsInternalContentLoaded] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Dùng useRef để lưu component function, tránh bị React Strict Mode làm mất
  const internalContentRef = useRef(null);

  useEffect(() => {
    loadProject();
  }, [id]);

  const loadProject = async () => {
    try {
      setLoading(true);
      
      // Kiểm tra xem id có phải UUID không
      if (isUUID(id)) {
        // Nếu là UUID, tìm project theo UUID (cách cũ)
        const { data, error: projectError } = await supabase
          .from('projects')
          .select('*, project_categories(*), internal_content(*)')
          .eq('id', id)
          .single();

        if (projectError) throw projectError;

        setProject(data);

        // Kiểm tra xem có Internal Content trong database không
        if (data.internal_content && data.internal_content.file_name) {
          // Load Internal Content từ database
          await loadInternalContent(data.internal_content.file_name);
        } else {
          // Nếu không có trong database, tự động tìm file theo project ID
          console.log('No Internal Content in database, searching by project ID:', id);
          const foundFileName = await findInternalContentByProjectId(id);
          if (foundFileName) {
            await loadInternalContent(foundFileName);
          } else {
            setError('Project này chưa có Internal Content được gán. Vui lòng gán Internal Content trong Admin Dashboard hoặc đảm bảo file Internal Content có tên chứa project ID.');
          }
        }
      } else {
        // Nếu không phải UUID, coi như file_name (URL mới: /projects/{file_name})
        const fileName = `${id}.jsx`;
        console.log('Loading Internal Content directly by file_name:', fileName);
        
        // Tìm Internal Content trong database để lấy metadata
        const { data: internalContentData, error: icError } = await supabase
          .from('internal_content')
          .select('*')
          .eq('file_name', fileName)
          .maybeSingle();

        // Tìm project có internal_content_id matching (nếu có)
        if (internalContentData) {
          const { data: projectData, error: projectError } = await supabase
            .from('projects')
            .select('*, project_categories(*), internal_content(*)')
            .eq('internal_content_id', internalContentData.id)
            .maybeSingle();

          if (projectData) {
            setProject(projectData);
          } else {
            // Nếu không tìm thấy project, vẫn có thể load Internal Content
            // Set một object project tạm để tránh lỗi
            setProject({ internal_content: internalContentData });
          }
        } else {
          // Nếu không tìm thấy trong database, vẫn thử load file trực tiếp
          console.log('Internal Content not found in database, loading file directly');
          setProject({ internal_content: { file_name: fileName } });
        }

        // Load Internal Content trực tiếp theo file_name
        await loadInternalContent(fileName);
      }
    } catch (err) {
      console.error('Error loading project:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Tìm Internal Content file theo project ID
  const findInternalContentByProjectId = async (projectId) => {
    try {
      // Lấy tất cả các file Internal Content
      const allModulePaths = Object.keys(internalContentModules);
      console.log('🔍 Searching for Internal Content with project ID:', projectId);
      console.log('📁 Available files:', allModulePaths);

      if (allModulePaths.length === 0) {
        console.log('❌ No Internal Content files found');
        return null;
      }

      // Thử tìm file có tên chứa project ID (hoặc một phần của project ID)
      // Ví dụ: nếu project ID là "82104f17-bc78-41b3-8728-3c47cae6ff9c"
      // Tìm file có tên chứa "82104f17" hoặc toàn bộ ID
      const projectIdParts = projectId.split('-');
      const projectIdFirstPart = projectIdParts[0]; // Lấy phần đầu của UUID

      for (const [path, loader] of Object.entries(internalContentModules)) {
        // Lấy tên file từ path
        const fileName = path.split('/').pop() || path.split('\\').pop();
        const fileNameWithoutExt = fileName.replace('.jsx', '');

        // Kiểm tra nếu tên file chứa project ID hoặc phần đầu của project ID
        if (fileNameWithoutExt.includes(projectId) || 
            fileNameWithoutExt.includes(projectIdFirstPart) ||
            projectId.includes(fileNameWithoutExt.split('-')[0])) {
          console.log('✅ Found Internal Content file by project ID:', fileName);
          return fileName;
        }
      }

      // Nếu không tìm thấy theo project ID, thử load file đầu tiên (fallback)
      if (allModulePaths.length > 0) {
        const firstPath = allModulePaths[0];
        const firstFileName = firstPath.split('/').pop() || firstPath.split('\\').pop();
        console.log('⚠️ No file matching project ID, using first available file:', firstFileName);
        return firstFileName;
      }

      console.log('❌ No Internal Content file found');
      return null;
    } catch (err) {
      console.error('❌ Error finding Internal Content by project ID:', err);
      return null;
    }
  };

  const loadInternalContent = async (fileName) => {
    try {
      console.log('Loading Internal Content:', fileName);
      console.log('Available modules:', Object.keys(internalContentModules));
      
      // Tìm module tương ứng với fileName
      // fileName sẽ là: 1768643880714-LAND_ROVER_3S_PILOT_SHOWROOMLAND.jsx
      // import.meta.glob có thể trả về path với format khác nhau
      // Từ console log, path có thể là './Internal Content/...' hoặc '../pages/Internal Content/...'
      const possiblePaths = [
        `./Internal Content/${fileName}`,
        `../pages/Internal Content/${fileName}`,
        `./pages/Internal Content/${fileName}`,
        `../pages/Internal%20Content/${fileName}`,
        `/Internal Content/${fileName}`,
      ];
      
      // Tìm trong internalContentModules
      let moduleLoader = null;
      let foundPath = null;
      
      for (const path of possiblePaths) {
        if (internalContentModules[path]) {
          moduleLoader = internalContentModules[path];
          foundPath = path;
          console.log('Found module at path:', path);
          break;
        }
      }
      
      // Nếu không tìm thấy, thử tìm bằng cách so sánh tên file
      if (!moduleLoader) {
        const fileNameWithoutExt = fileName.replace('.jsx', '');
        for (const [path, loader] of Object.entries(internalContentModules)) {
          if (path.includes(fileNameWithoutExt) || path.includes(fileName)) {
            moduleLoader = loader;
            foundPath = path;
            console.log('Found module by filename match:', path);
            break;
          }
        }
      }
      
      if (!moduleLoader) {
        console.error(`Internal Content module not found for: ${fileName}`);
        console.log('Available modules:', Object.keys(internalContentModules));
        setError(`Không tìm thấy file Internal Content: ${fileName}. Vui lòng kiểm tra file có tồn tại trong src/pages/Internal Content/ không.`);
        return;
      }

      // Dynamic import component
      const module = await moduleLoader();
      console.log('Loaded module:', module);
      
      const Component = module.default;
      console.log('Component type:', typeof Component);
      console.log('Component:', Component);
      
      if (!Component) {
        setError(`Component không có export default. Vui lòng kiểm tra file ${fileName}.`);
        return;
      }

      // Kiểm tra xem Component có phải là function component không
      if (typeof Component !== 'function') {
        console.error('Component is not a function:', Component);
        setError(`Component không hợp lệ. File ${fileName} phải export default một React function component.`);
        return;
      }

      // Set component để render - đảm bảo là function component
      console.log('Setting component, type before setState:', typeof Component);
      console.log('Component function:', Component.toString().substring(0, 100));
      
      // Lưu vào ref để tránh bị React Strict Mode làm mất
      internalContentRef.current = Component;
      
      // Set flag để trigger render
      setIsInternalContentLoaded(true);
      
      // Verify sau khi set
      setTimeout(() => {
        console.log('After setState - Component loaded');
        console.log('Ref component type:', typeof internalContentRef.current);
        console.log('Ref component:', internalContentRef.current);
      }, 0);
      
    } catch (err) {
      console.error('Error loading Internal Content:', err);
      setError(`Lỗi khi load Internal Content: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <nav className="fixed top-0 left-0 w-full z-50 px-6 py-6 flex justify-between items-center bg-white/80 backdrop-blur-md transition-all duration-300">
          <Link
            to="/projects"
            onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
            className="flex items-center gap-2 cursor-pointer z-50"
          >
            <ArrowLeft size={20} />
            <img src="/logo.svg" alt="PROHUB" className="h-12 w-auto" />
          </Link>
        </nav>
        <div className="text-center max-w-md mx-auto px-6">
          <p className="text-red-600 mb-4 text-lg font-bold">{error || 'Project không tồn tại'}</p>
          <p className="text-gray-600 mb-6 text-sm">
            {error && error.includes('Internal Content') 
              ? 'Vui lòng gán Internal Content cho project này trong Admin Dashboard → Projects → Chỉnh sửa Project → Chọn Internal Content.'
              : 'Project này không tồn tại hoặc đã bị xóa.'}
          </p>
          <Link 
            to="/projects" 
            className="inline-block px-6 py-3 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-colors"
          >
            Quay lại Projects
          </Link>
        </div>
      </div>
    );
  }

  // Nếu có Internal Content, render nó (KHÔNG render Header của ProjectDetail vì Internal Content có Header riêng)
  if (isInternalContentLoaded && internalContentRef.current) {
    return (
      <ErrorBoundary>
        {(() => {
          // Dùng ref trực tiếp, vì ref không bị React Strict Mode làm mất
          const ComponentToRender = internalContentRef.current;
          const componentType = typeof ComponentToRender;
          
          // Kiểm tra nếu là function component
          if (componentType === 'function') {
            try {
              return React.createElement(ComponentToRender);
            } catch (renderError) {
              console.error('Error creating element:', renderError);
              return (
                <div className="min-h-screen flex items-center justify-center bg-white">
                  <div className="max-w-2xl mx-auto text-center p-8">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Lỗi khi render Internal Content</h2>
                    <p className="text-gray-600 mb-4">{renderError.message || 'Unknown error'}</p>
                    <pre className="bg-gray-100 p-4 rounded text-left text-sm overflow-auto max-h-64">
                      {renderError.stack}
                    </pre>
                  </div>
                </div>
              );
            }
          }
          
          return (
            <div className="min-h-screen flex items-center justify-center bg-white">
              <div className="p-8 text-red-600">
                <p>Error: Component is not a valid React component</p>
                <p className="text-sm mt-2">Ref type: {componentType}</p>
                <p className="text-sm mt-2">Ref value: {ComponentToRender ? String(ComponentToRender).substring(0, 200) : 'null'}</p>
              </div>
            </div>
          );
        })()}
      </ErrorBoundary>
    );
  }

  // Fallback: Hiển thị project info nếu không có Internal Content
  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed top-0 left-0 w-full z-50 px-6 py-6 flex justify-between items-center bg-white/80 backdrop-blur-md transition-all duration-300">
          <Link
            to="/projects"
            onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
            className="flex items-center gap-2 cursor-pointer z-50"
          >
            <ArrowLeft size={20} />
            <img src="/logo.svg" alt="PROHUB" className="h-12 w-auto" />
          </Link>
      </nav>

      <div className="pt-32 px-6 md:px-20 pb-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-black mb-6">
            {project.external_content?.projectName || project.title || 'Untitled'}
          </h1>
          {project.location && (
            <p className="text-gray-600 mb-8">{project.location}</p>
          )}
          {project.images && project.images.length > 0 && (
            <div className="mb-8">
              <img 
                src={project.images[0]} 
                alt={project.title} 
                className="w-full rounded-lg"
              />
            </div>
          )}
          <p className="text-gray-600">
            {project.external_content?.shortDescription || 'No description available.'}
          </p>
          {!project.internal_content && (
            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                Project này chưa có Internal Content được gán. Vui lòng gán Internal Content trong Admin Dashboard.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
