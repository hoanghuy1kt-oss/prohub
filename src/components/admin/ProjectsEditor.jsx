import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, Save, Upload, X, Image as ImageIcon } from 'lucide-react';

export default function ProjectsEditor() {
  const [categories, setCategories] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategories();
    loadProjects();
  }, []);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('project_categories')
        .select('*')
        .order('order_index');
      
      if (error) {
        console.error('Error loading categories:', error);
        return;
      }
      
      if (data) {
        setCategories(data);
        // Mặc định chọn "Tất cả" (null)
        if (selectedCategory === undefined) {
          setSelectedCategory(null);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*, project_categories(*)')
        .order('order_index');
      
      if (error) {
        console.error('Error loading projects:', error);
        return;
      }
      
      if (data) {
        setProjects(data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Function để resize và compress ảnh
  const resizeImage = (file, maxWidth = 1920, quality = 0.85) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Resize nếu ảnh lớn hơn maxWidth
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to blob với quality
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to compress image'));
              }
            },
            'image/jpeg',
            quality
          );
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (file, projectId) => {
    try {
      // Validate file size (3MB)
      const maxSize = 3 * 1024 * 1024;
      if (file.size > maxSize) {
        // Nếu file lớn hơn 3MB, thử resize/compress
        if (file.type.startsWith('image/')) {
          try {
            const resizedBlob = await resizeImage(file, 1920, 0.85);
            
            // Kiểm tra lại sau khi resize
            if (resizedBlob.size > maxSize) {
              // Nếu vẫn lớn, giảm quality và resize nhỏ hơn
              const smallerBlob = await resizeImage(file, 1600, 0.75);
              if (smallerBlob.size > maxSize) {
                // Lần cuối, resize nhỏ hơn nữa
                const finalBlob = await resizeImage(file, 1280, 0.7);
                file = new File([finalBlob], file.name, { type: 'image/jpeg' });
              } else {
                file = new File([smallerBlob], file.name, { type: 'image/jpeg' });
              }
            } else {
              file = new File([resizedBlob], file.name, { type: 'image/jpeg' });
            }
          } catch (resizeError) {
            alert(`Không thể resize ảnh "${file.name}". Vui lòng chọn ảnh nhỏ hơn 3MB.`);
            return null;
          }
        } else {
          alert(`File "${file.name}" vượt quá 3MB. Vui lòng chọn file nhỏ hơn.`);
          return null;
        }
      } else if (file.type.startsWith('image/')) {
        // Nếu file nhỏ hơn 3MB nhưng vẫn là ảnh, vẫn resize để tối ưu
        try {
          const resizedBlob = await resizeImage(file, 1920, 0.85);
          file = new File([resizedBlob], file.name, { type: 'image/jpeg' });
        } catch (resizeError) {
          // Nếu resize fail, dùng file gốc
          console.warn('Resize failed, using original file:', resizeError);
        }
      }
      
      const fileName = `project-${Date.now()}-${file.name.replace(/\.[^/.]+$/, '.jpg')}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('project-images')
        .upload(fileName, file);
      
      if (uploadError) {
        alert('Lỗi upload: ' + uploadError.message);
        return null;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('project-images')
        .getPublicUrl(fileName);
      
      // Update project images (tối đa 3)
      const project = projects.find(p => p.id === projectId);
      const currentImages = project?.images || [];
      
      if (currentImages.length >= 3) {
        alert('Đã đạt tối đa 3 hình ảnh');
        return null;
      }
      
      const updatedImages = [...currentImages, publicUrl].slice(0, 3);
      
      // Update trong state trước
      if (selectedProject && selectedProject.id === projectId) {
        setSelectedProject({...selectedProject, images: updatedImages});
      }
      
      await supabase
        .from('projects')
        .update({ images: updatedImages })
        .eq('id', projectId);
      
      loadProjects();
      return publicUrl;
    } catch (error) {
      alert('Lỗi: ' + error.message);
      return null;
    }
  };

  const handleDeleteImage = async (projectId, imageUrl) => {
    if (!confirm('Bạn có chắc muốn xóa hình ảnh này?')) return;
    
    try {
      const project = projects.find(p => p.id === projectId);
      const updatedImages = project.images.filter(img => img !== imageUrl);
      
      await supabase
        .from('projects')
        .update({ images: updatedImages })
        .eq('id', projectId);
      
      loadProjects();
    } catch (error) {
      alert('Lỗi: ' + error.message);
    }
  };

  const handleAddProject = () => {
    const newProject = {
      id: `temp-${Date.now()}`,
      category_id: null, // Mặc định là "Tất cả" (null)
      title: '',
      location: '',
      area: '',
      type: '',
      year: '',
      external_content: {},
      internal_content: {},
      images: [],
      layout: 'portrait',
      order_index: projects.length,
      is_featured: false,
      home_order: null
    };
    
    setSelectedProject(newProject);
    setProjects([...projects, newProject]);
  };

  const handleSaveProject = async (project) => {
    setLoading(true);
    
    try {
      if (project.id.startsWith('temp-')) {
        // Insert new
        const { error } = await supabase
          .from('projects')
          .insert({
            category_id: project.category_id,
            title: project.title,
            location: project.location,
            area: project.area,
            type: project.type,
            year: project.year,
            external_content: project.external_content,
            internal_content: project.internal_content,
            images: project.images,
            layout: project.layout,
            order_index: project.order_index,
            is_featured: project.is_featured || false,
            home_order: project.is_featured ? project.home_order : null
          });
        
        if (error) throw error;
      } else {
        // Update existing
        const { error } = await supabase
          .from('projects')
          .update({
            category_id: project.category_id,
            title: project.title,
            location: project.location,
            area: project.area,
            type: project.type,
            year: project.year,
            external_content: project.external_content,
            internal_content: project.internal_content,
            images: project.images,
            layout: project.layout,
            order_index: project.order_index,
            updated_at: new Date().toISOString()
          })
          .eq('id', project.id);
        
        if (error) throw error;
      }
      
      loadProjects();
      setSelectedProject(null);
      alert('Đã lưu thành công!');
    } catch (error) {
      alert('Lỗi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!confirm('Bạn có chắc muốn xóa project này?')) return;
    
    if (projectId.startsWith('temp-')) {
      setProjects(projects.filter(p => p.id !== projectId));
      setSelectedProject(null);
      return;
    }
    
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);
      
      if (error) throw error;
      
      loadProjects();
      setSelectedProject(null);
    } catch (error) {
      alert('Lỗi: ' + error.message);
    }
  };

  const handleToggleFeatured = async (project, e) => {
    e.stopPropagation(); // Ngăn mở form edit
    
    const isCurrentlyFeatured = project.is_featured || false;
    const featuredCount = projects.filter(p => p.is_featured && p.id !== project.id).length;
    
    if (!isCurrentlyFeatured && featuredCount >= 4) {
      alert('Đã đạt tối đa 4 projects cho SELECTED WORKS. Vui lòng bỏ chọn một project khác trước.');
      return;
    }
    
    try {
      const newIsFeatured = !isCurrentlyFeatured;
      const newHomeOrder = newIsFeatured ? (featuredCount + 1) : null;
      
      const { error } = await supabase
        .from('projects')
        .update({
          is_featured: newIsFeatured,
          home_order: newHomeOrder,
          updated_at: new Date().toISOString()
        })
        .eq('id', project.id);
      
      if (error) throw error;
      
      // Update local state
      const updatedProjects = projects.map(p => 
        p.id === project.id 
          ? { ...p, is_featured: newIsFeatured, home_order: newHomeOrder }
          : p
      );
      setProjects(updatedProjects);
      
      // Update selectedProject nếu đang edit project này
      if (selectedProject?.id === project.id) {
        setSelectedProject({
          ...selectedProject,
          is_featured: newIsFeatured,
          home_order: newHomeOrder
        });
      }
    } catch (error) {
      alert('Lỗi: ' + error.message);
    }
  };

  const filteredProjects = selectedCategory 
    ? projects.filter(p => p.category_id === selectedCategory)
    : projects; // Hiển thị tất cả nếu selectedCategory là null

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quản lý Projects</h2>
        <button
          onClick={handleAddProject}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
        >
          <Plus size={18} />
          Thêm Project
        </button>
      </div>

      {/* Category Selector */}
      <div>
        <label className="block text-sm font-medium mb-2">Chọn Category</label>
        <select
          value={selectedCategory || 'all'}
          onChange={(e) => {
            const value = e.target.value === 'all' ? null : e.target.value;
            setSelectedCategory(value);
            setSelectedProject(null);
          }}
          className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
        >
          <option value="all">Tất cả</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Featured Projects Counter */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-blue-900">
            SELECTED WORKS (Home Page): {projects.filter(p => p.is_featured).length}/4 đã chọn
          </span>
          {projects.filter(p => p.is_featured).length > 0 && (
            <span className="text-xs text-blue-600">
              {projects.filter(p => p.is_featured).map(p => p.title || 'Untitled').join(', ')}
            </span>
          )}
        </div>
      </div>

      {/* Projects List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map(project => (
          <div
            key={project.id}
            className={`border-2 rounded-lg p-4 cursor-pointer transition-colors relative ${
              selectedProject?.id === project.id
                ? 'border-orange-500 bg-orange-50'
                : project.is_featured
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedProject(project)}
          >
            {/* Featured Badge */}
            {project.is_featured && (
              <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">
                #{project.home_order}
              </div>
            )}
            
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-start gap-2 flex-1">
                {/* Checkbox for Featured */}
                <input
                  type="checkbox"
                  checked={project.is_featured || false}
                  onChange={(e) => handleToggleFeatured(project, e)}
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex-1">
                  <h3 className="font-bold">{project.title || 'Untitled'}</h3>
                  <p className="text-sm text-gray-500 mt-1">{project.location}</p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteProject(project.id);
                }}
                className="text-red-500 hover:text-red-700 ml-2"
              >
                <Trash2 size={16} />
              </button>
            </div>
            
            {project.images && project.images.length > 0 && (
              <div className="mt-2 flex gap-1">
                {project.images.slice(0, 3).map((img, idx) => (
                  <img key={idx} src={img} alt="" className="w-12 h-12 object-cover rounded" />
                ))}
                {project.images.length > 3 && (
                  <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs">
                    +{project.images.length - 3}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Project Editor Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Chỉnh sửa Project</h3>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                {/* 1. Category - HIỂN THỊ ĐẦU TIÊN */}
                <div>
                  <label className="block text-sm font-medium mb-2">Category *</label>
                  <select
                    value={selectedProject.category_id || ''}
                    onChange={(e) => {
                      setSelectedProject({...selectedProject, category_id: e.target.value});
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">-- Chọn Category --</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Quyết định project hiển thị ở section nào</p>
                </div>

                {/* 2. Project Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">Project Name *</label>
                  <input
                    type="text"
                    value={selectedProject.external_content?.projectName || selectedProject.title || ''}
                    onChange={(e) => {
                      const externalContent = selectedProject.external_content || {};
                      setSelectedProject({
                        ...selectedProject,
                        title: e.target.value,
                        external_content: {
                          ...externalContent,
                          projectName: e.target.value
                        }
                      });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="VTDF @ITE 2022"
                  />
                  <p className="text-xs text-gray-500 mt-1">Hiển thị in đậm dưới hình ảnh</p>
                </div>

                {/* 3. Location */}
                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <input
                    type="text"
                    value={selectedProject.location || ''}
                    onChange={(e) => setSelectedProject({...selectedProject, location: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Ho Chi Minh City"
                  />
                </div>

                {/* 4. Short Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Short Description
                    <span className={`text-xs ml-2 font-normal ${
                      (selectedProject.external_content?.shortDescription?.length || 0) >= 150
                        ? 'text-red-500'
                        : 'text-gray-500'
                    }`}>
                      ({(selectedProject.external_content?.shortDescription?.length || 0)}/150 ký tự)
                    </span>
                  </label>
                  <textarea
                    value={selectedProject.external_content?.shortDescription || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Không cho nhập quá 150 ký tự
                      if (value.length > 150) {
                        return; // Không cập nhật nếu vượt quá
                      }
                      const externalContent = selectedProject.external_content || {};
                      setSelectedProject({
                        ...selectedProject,
                        external_content: {
                          ...externalContent,
                          shortDescription: value
                        }
                      });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    rows="3"
                    placeholder="Brief description of the project... (tối đa 150 ký tự)"
                    maxLength={150}
                  />
                  <p className="text-xs text-gray-500 mt-1">Hiển thị trên hình khi hover (tối đa 150 ký tự)</p>
                </div>

                {/* 5. Year */}
                <div>
                  <label className="block text-sm font-medium mb-2">Year</label>
                  <input
                    type="text"
                    value={selectedProject.year || ''}
                    onChange={(e) => setSelectedProject({...selectedProject, year: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="2022"
                  />
                </div>

                {/* 6. Highlights */}
                <div>
                  <label className="block text-sm font-medium mb-2">Highlights</label>
                  <input
                    type="text"
                    value={selectedProject.external_content?.highlights || ''}
                    onChange={(e) => {
                      const externalContent = selectedProject.external_content || {};
                      setSelectedProject({
                        ...selectedProject,
                        external_content: {
                          ...externalContent,
                          highlights: e.target.value
                        }
                      });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Award Winning Design"
                  />
                  <p className="text-xs text-gray-500 mt-1">Hiển thị dưới Short Description với màu highlight</p>
                </div>

                {/* Tag - chỉ hiển thị cho Project Insights */}
                {selectedProject.category_id && (() => {
                  const selectedCat = categories.find(c => c.id === selectedProject.category_id);
                  if (selectedCat?.slug === 'project-insights') {
                    return (
                      <div>
                        <label className="block text-sm font-medium mb-2">Tag</label>
                        <input
                          type="text"
                          value={selectedProject.external_content?.tag || ''}
                          onChange={(e) => {
                            const externalContent = selectedProject.external_content || {};
                            setSelectedProject({
                              ...selectedProject,
                              external_content: {
                                ...externalContent,
                                tag: e.target.value
                              }
                            });
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          placeholder="Construction Technique, Design Trend, etc."
                        />
                        <p className="text-xs text-gray-500 mt-1">Hiển thị ở vị trí category trong Project Insights</p>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* 7. Layout */}
                <div>
                  <label className="block text-sm font-medium mb-2">Layout</label>
                  <select
                    value={selectedProject.layout || 'portrait'}
                    onChange={(e) => setSelectedProject({...selectedProject, layout: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                  </select>
                </div>

                {/* Images */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Hình ảnh
                    <span className="text-xs text-gray-500 ml-2 font-normal">
                      (Tối đa 3 tấm, mỗi tấm tối đa 3MB - tự động resize/compress)
                    </span>
                  </label>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {selectedProject.images?.slice(0, 3).map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img src={img} alt="" className="w-full h-24 object-cover rounded" />
                        <button
                          onClick={() => {
                            const updated = selectedProject.images.filter((_, i) => i !== idx);
                            setSelectedProject({...selectedProject, images: updated});
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    {/* Placeholder slots nếu chưa đủ 3 */}
                    {(!selectedProject.images || selectedProject.images.length < 3) && (
                      Array.from({ length: 3 - (selectedProject.images?.length || 0) }).map((_, idx) => (
                        <div key={`placeholder-${idx}`} className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                          <span className="text-xs text-gray-400">Slot {selectedProject.images?.length + idx + 1}</span>
                        </div>
                      ))
                    )}
                  </div>
                  <label className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors ${
                    selectedProject.images && selectedProject.images.length >= 3
                      ? 'bg-gray-300 cursor-not-allowed opacity-50'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}>
                    <Upload size={18} />
                    <span>
                      {selectedProject.images && selectedProject.images.length >= 3
                        ? 'Đã đạt tối đa 3 hình'
                        : `Upload hình ảnh (${selectedProject.images?.length || 0}/3)`
                      }
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      disabled={selectedProject.images && selectedProject.images.length >= 3}
                      onChange={(e) => {
                        const files = Array.from(e.target.files);
                        const currentCount = selectedProject.images?.length || 0;
                        const remainingSlots = 3 - currentCount;
                        
                        if (remainingSlots <= 0) {
                          alert('Đã đạt tối đa 3 hình ảnh');
                          return;
                        }
                        
                        const filesToUpload = files.slice(0, remainingSlots);
                        
                        // Upload files (sẽ tự động resize/compress trong handleImageUpload nếu > 3MB)
                        filesToUpload.forEach(file => {
                          handleImageUpload(file, selectedProject.id);
                        });
                      }}
                    />
                  </label>
                </div>

                {/* 9. Internal Content (JSON) */}
                <div>
                  <label className="block text-sm font-medium mb-2">Internal Content (JSON)</label>
                  <textarea
                    value={JSON.stringify(selectedProject.internal_content || {}, null, 2)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        setSelectedProject({...selectedProject, internal_content: parsed});
                      } catch (err) {
                        // Invalid JSON, keep as is
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                    rows="6"
                    placeholder='{"fullDescription": "...", "client": "...", "services": [...]}'
                  />
                  <p className="text-xs text-gray-500 mt-1">JSON format cho nội dung chi tiết</p>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => handleSaveProject(selectedProject)}
                  disabled={loading || !selectedProject.title}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                >
                  <Save size={18} />
                  {loading ? 'Đang lưu...' : 'Lưu'}
                </button>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
