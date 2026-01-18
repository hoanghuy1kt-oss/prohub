import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Menu, X, ArrowUpRight, Download } from 'lucide-react';
import { useDownloadProfiles } from './hooks/useDownloadProfiles';
import { useProjects } from './hooks/useProjects';
import { useContactInfo } from './hooks/useContactInfo';

// --- COMPONENTS ---

const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  return <motion.div className="fixed top-0 left-0 right-0 h-1 bg-black z-[100] origin-left" style={{ scaleX }} />;
};

const SectionTitle = ({ title, subtitle }) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    className="mb-12"
  >
    <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 block mb-2">{subtitle}</span>
    <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">{title}</h2>
    <div className="h-1 w-20 bg-black mt-6"></div>
  </motion.div>
);

// Image Carousel Component - Tự động chuyển giữa các hình
const ImageCarousel = ({ images, alt = '' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images && images.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, 3000); // Chuyển mỗi 3 giây
      return () => clearInterval(interval);
    }
  }, [images]);

  if (!images || images.length === 0) return null;
  if (images.length === 1) {
    return <img src={images[0]} alt={alt} className="w-full h-full object-cover" />;
  }

  return (
    <div className="relative w-full h-full">
      {images.map((img, idx) => (
        <img
          key={idx}
          src={img}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-700 ${
            idx === currentIndex ? 'opacity-100' : 'opacity-0 absolute inset-0'
          }`}
        />
      ))}
      {/* Dots indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === currentIndex ? 'bg-white w-6' : 'bg-white/50'
            }`}
            aria-label={`Go to image ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

const ProjectCard = ({ project, layout = "portrait", index = 0 }) => {
  const navigate = useNavigate();
  const projectName = project.external_content?.projectName || project.title || '';
  const clientName = project.external_content?.clientName || '';
  const year = project.year || '';
  const location = project.location || '';
  const highlights = project.external_content?.highlights || '';
  const shortDescription = project.external_content?.shortDescription || '';
  const images = project.images || [];
  const hasInternalContent = project.internal_content_id && project.internal_content;
  
  const formatTitle = () => {
    if (projectName && year) {
      return `${projectName} - ${year}`;
    } else if (projectName) {
      return projectName;
    } else if (year) {
      return year;
    }
    return 'Untitled';
  };

  const handleClick = () => {
    // Chỉ navigate nếu có Internal Content
    if (hasInternalContent && project.internal_content?.file_name) {
      // Navigate đến URL với file_name (không có extension .jsx)
      const fileNameWithoutExt = project.internal_content.file_name.replace('.jsx', '');
      navigate(`/projects/${fileNameWithoutExt}`);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -10 }}
      className={`group ${hasInternalContent ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
      onClick={handleClick}
    >
      <div className={`relative overflow-hidden bg-gray-100 mb-6 ${layout === "landscape" ? "aspect-[16/9]" : "aspect-[4/5]"} rounded-lg`}>
        <ImageCarousel images={images} alt={projectName} />
        
        {/* Hover effect với lớp phủ - luôn hiển thị nhưng chỉ có arrow nếu có Internal Content */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {/* Dấu mũi tên ở giữa - chỉ hiển thị nếu có Internal Content */}
          {hasInternalContent && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/90 backdrop-blur-sm p-4 rounded-full">
                <ArrowRight className="w-6 h-6 text-black" />
              </div>
            </div>
          )}
          
          {/* Short Description ở góc trái dưới khi hover (nếu có) - hiển thị cho tất cả project */}
          {shortDescription && (
            <div className="absolute bottom-4 left-4 max-w-[80%] bg-black/80 backdrop-blur-sm rounded-lg p-3">
              <p className="text-white text-sm leading-relaxed line-clamp-2">
                {shortDescription}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {(projectName || year) && (
        <h3 className={`text-xl font-bold mb-1 ${hasInternalContent ? 'group-hover:text-orange-600 transition-colors' : ''}`}>
          {formatTitle()}
        </h3>
      )}
      
      {clientName && (
        <p className="text-sm text-gray-600 mb-1">
          {clientName}
        </p>
      )}
      
      {location && (
        <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">
          {location}
        </p>
      )}
      
      {highlights && (
        <p className="text-sm font-medium text-orange-500">
          {highlights}
        </p>
      )}
    </motion.div>
  );
};

export default function Projects() {
  const navigate = useNavigate();
  const { profiles } = useDownloadProfiles();
  const { contactInfo } = useContactInfo();
  const { getProjectsByCategory, categories, loading } = useProjects();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  return (
    <div className="bg-white text-black font-sans selection:bg-black selection:text-white overflow-x-hidden min-h-screen">
      <ScrollProgress />
      
      {/* --- NAVIGATION --- */}
      <nav className="fixed top-0 left-0 w-full z-50 px-6 py-6 flex justify-between items-center bg-white/95 backdrop-blur-md transition-all duration-300 border-b border-gray-100 shadow-sm">
        <Link 
          to="/" 
          onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
          className="flex items-center cursor-pointer z-50"
        >
          <img src="/logo.svg" alt="PROHUB" className="h-12 w-auto" />
        </Link>
        <div 
          className="md:hidden cursor-pointer z-50"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X /> : <Menu />}
        </div>
        
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 left-0 w-full bg-white shadow-xl p-8 flex flex-col gap-6 md:hidden pt-24"
          >
            {['About', 'Projects', 'Contact'].map((item) => (
              item === 'About' ? (
                <Link 
                  key={item} 
                  to="/about"
                  onClick={() => {
                    setIsMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: 'instant' });
                  }} 
                  className="text-xl font-bold uppercase tracking-widest hover:text-orange-500"
                >
                  {item}
                </Link>
              ) : item === 'Projects' ? (
                <Link 
                  key={item} 
                  to="/projects"
                  onClick={() => {
                    setIsMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: 'instant' });
                  }} 
                  className="text-xl font-bold uppercase tracking-widest hover:text-orange-500"
                >
                  {item}
                </Link>
              ) : item === 'Contact' ? (
                <Link 
                  key={item} 
                  to="/contact"
                  onClick={() => {
                    setIsMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: 'instant' });
                  }} 
                  className="text-xl font-bold uppercase tracking-widest hover:text-orange-500"
                >
                  {item}
                </Link>
              ) : null
            ))}
          </motion.div>
        )}

        <div className="hidden md:flex gap-8 text-sm font-bold uppercase tracking-widest">
          {['About', 'Projects', 'Contact'].map((item) => (
            item === 'About' ? (
              <Link 
                key={item} 
                to="/about"
                onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
                className="hover:text-gray-500 transition-colors relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-black transition-all group-hover:w-full"></span>
              </Link>
            ) : item === 'Projects' ? (
              <Link 
                key={item} 
                to="/projects"
                onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
                className="hover:text-gray-500 transition-colors relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-black transition-all group-hover:w-full"></span>
              </Link>
            ) : item === 'Contact' ? (
              <Link 
                key={item} 
                to="/contact"
                onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
                className="hover:text-gray-500 transition-colors relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-black transition-all group-hover:w-full"></span>
              </Link>
            ) : null
          ))}
        </div>
      </nav>

      {/* --- HERO --- */}
      <header className="pt-40 pb-20 px-6 md:px-20 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-[12vw] md:text-[10vw] font-black tracking-tighter leading-none mb-6"
          >
            WORK.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-xl text-gray-500 max-w-3xl mx-auto font-light leading-relaxed"
          >
            Delivering impactful brand experiences through innovative design and flawless execution.
          </motion.p>
        </div>
      </header>

      {/* --- Render Categories Dynamically --- */}
      {categories
        .filter(cat => {
          // Nếu category có display_type, dùng nó
          // Nếu không có, fallback dựa trên slug (backward compatibility)
          if (cat.display_type) return true;
          // Giữ lại các category cũ chưa có display_type (sẽ dùng grid-2 mặc định)
          return true;
        })
        .sort((a, b) => (a.order_index ?? 9999) - (b.order_index ?? 9999))
        .map((category, categoryIndex) => {
          const categoryProjects = getProjectsByCategory(category.slug);
          if (categoryProjects.length === 0) return null;

          // Fallback: Nếu không có display_type, dùng grid-2 mặc định
          const displayType = category.display_type || 'grid-2';
          const bgColor = categoryIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50';

          // Grid 2 columns (INTERIOR/DESIGN HUB style)
          if (displayType === 'grid-2') {
            return (
              <section key={category.id} className={`py-20 px-6 md:px-20 ${bgColor}`}>
                <div className="max-w-7xl mx-auto">
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-16"
                  >
                    <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">{category.name.toUpperCase()}</h2>
                    <div className="h-1 w-20 bg-black mt-6"></div>
                  </motion.div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {categoryProjects.map((item, index) => {
                      const projectName = item.external_content?.projectName || item.title || '';
                      const clientName = item.external_content?.clientName || '';
                      const location = item.location || '';
                      const images = item.images || [];
                      const hasInternalContent = item.internal_content_id && item.internal_content;
                      const layout = item.layout || "landscape";
                      const aspectClass = layout === "landscape" 
                        ? "aspect-[16/9]" 
                        : layout === "portrait"
                        ? "aspect-[4/5]"
                        : "aspect-video";
                      
                      return (
                        <motion.div 
                          key={item.id}
                          initial={{ opacity: 0, y: 50 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, margin: "-50px" }}
                          transition={{ duration: 0.6, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
                          whileHover={{ scale: 0.98 }}
                          className={`group ${hasInternalContent ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
                          onClick={() => {
                            if (hasInternalContent && item.internal_content?.file_name) {
                              const fileNameWithoutExt = item.internal_content.file_name.replace('.jsx', '');
                              navigate(`/projects/${fileNameWithoutExt}`);
                            }
                          }}
                        >
                          <div className={`relative overflow-hidden mb-6 ${aspectClass} rounded-lg`}>
                            <ImageCarousel images={images} alt={projectName} />
                          </div>
                          <div className="flex justify-between items-end border-b border-gray-200 pb-4 group-hover:border-black transition-colors">
                            <div>
                              <h3 className="text-2xl font-bold mb-1">{projectName}</h3>
                              {clientName && (
                                <p className="text-sm text-gray-600 mb-1">{clientName}</p>
                              )}
                              {location && (
                                <p className="text-sm text-gray-400 uppercase tracking-wide">{location}</p>
                              )}
                            </div>
                            {hasInternalContent && (
                              <ArrowUpRight className="w-6 h-6 text-gray-500 group-hover:text-black transition-colors" />
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </section>
            );
          }

          // Grid 3 columns (EXHIBITION/EVENTS style)
          if (displayType === 'grid-3') {
            return (
              <section key={category.id} className={`py-20 px-6 md:px-20 ${bgColor}`}>
                <div className="max-w-7xl mx-auto">
                  <SectionTitle title={category.name} subtitle="" />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {categoryProjects.map((item, index) => (
                      <ProjectCard 
                        key={item.id} 
                        project={item} 
                        layout={item.layout || "portrait"}
                        index={index} 
                      />
                    ))}
                  </div>
                </div>
              </section>
            );
          }

          // Grid 1 column (PROJECT INSIGHTS style)
          if (displayType === 'grid-1') {
            return (
              <section key={category.id} className={`py-20 px-6 md:px-20 ${bgColor}`}>
                <div className="max-w-7xl mx-auto">
                  <SectionTitle title={category.name} subtitle="" />
                  
                  <div className="grid grid-cols-1 gap-16">
                    {categoryProjects.map((item, index) => {
                      const projectName = item.external_content?.projectName || item.title || '';
                      const clientName = item.external_content?.clientName || '';
                      const shortDescription = item.external_content?.shortDescription || '';
                      const tag = item.external_content?.tag || '';
                      const date = item.year || '';
                      const images = item.images || [];
                      const hasInternalContent = item.internal_content_id && item.internal_content;
                      const layout = item.layout || "landscape";
                      const aspectClass = layout === "landscape" 
                        ? "aspect-[16/9]" 
                        : layout === "portrait"
                        ? "aspect-[4/5]"
                        : "aspect-[3/2]";
                      
                      return (
                        <motion.div 
                          key={item.id}
                          initial={{ opacity: 0, y: 50 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, margin: "-50px" }}
                          transition={{ duration: 0.6, delay: index * 0.2, ease: [0.22, 1, 0.36, 1] }}
                          whileHover={{ y: -5 }}
                          className={`flex flex-col md:flex-row gap-10 items-center group ${hasInternalContent ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
                          onClick={() => {
                            if (hasInternalContent && item.internal_content?.file_name) {
                              const fileNameWithoutExt = item.internal_content.file_name.replace('.jsx', '');
                              navigate(`/projects/${fileNameWithoutExt}`);
                            }
                          }}
                        >
                          <div className={`w-full md:w-5/12 overflow-hidden rounded-xl ${aspectClass} shadow-md`}>
                            <ImageCarousel images={images} alt={projectName} />
                          </div>
                          <div className="w-full md:w-7/12">
                            {(tag || date) && (
                              <div className="flex items-center gap-4 mb-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                                {tag && <span className="text-orange-500">{tag}</span>}
                                {tag && date && <span>•</span>}
                                {date && <span>{date}</span>}
                              </div>
                            )}
                            <h3 className={`text-3xl font-bold mb-2 transition-colors leading-tight ${hasInternalContent ? 'group-hover:text-orange-600' : ''}`}>
                              {projectName}
                            </h3>
                            {clientName && (
                              <p className="text-lg text-gray-600 mb-4">
                                {clientName}
                              </p>
                            )}
                            {shortDescription && (
                              <p className="text-gray-600 text-lg leading-relaxed mb-8 border-l-4 border-gray-200 pl-4 group-hover:border-orange-500 transition-colors">
                                {shortDescription}
                              </p>
                            )}
                            {hasInternalContent && (
                              <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-black group-hover:gap-4 transition-all">
                                Read Full Story <ArrowRight size={16} />
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </section>
            );
          }

          return null;
        })}


      {/* --- FOOTER --- */}
      <footer className="py-20 px-6 md:px-20 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-6 text-center md:text-right items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Contact</p>
              {contactInfo.email ? (
                <a href={`mailto:${contactInfo.email}`} className="block text-sm font-bold hover:text-blue-600 transition-colors">{contactInfo.email}</a>
              ) : (
                <p className="text-gray-400 text-sm">Đang tải...</p>
              )}
              {contactInfo.hotline ? (
                <a href={`tel:${contactInfo.hotline.replace(/\s/g, '')}`} className="block text-sm font-bold hover:text-blue-600 transition-colors mt-1">{contactInfo.hotline}</a>
              ) : null}
            </div>
            <div className="flex gap-4">
              {profiles.en ? (
                <a 
                  href={profiles.en.file_url} 
                  download={profiles.en.file_name || 'profile-en.pdf'}
                  className="px-4 py-2 border border-gray-200 rounded-full text-xs font-bold uppercase hover:bg-black hover:text-white transition-colors flex items-center gap-2"
                >
                  <Download size={14} /> Profile EN
                </a>
              ) : null}
              {profiles.vn ? (
                <a 
                  href={profiles.vn.file_url} 
                  download={profiles.vn.file_name || 'profile-vn.pdf'}
                  className="px-4 py-2 border border-gray-200 rounded-full text-xs font-bold uppercase hover:bg-black hover:text-white transition-colors flex items-center gap-2"
                >
                  <Download size={14} /> Profile VN
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
