import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Box, PenTool, Layout, Monitor, Ruler, Users, Lightbulb, Megaphone, Download, Menu, X, ArrowUpRight, Sparkles, ChevronDown, Check } from 'lucide-react';
import { useDownloadProfiles } from './hooks/useDownloadProfiles';
import { useContactInfo } from './hooks/useContactInfo';
import { useProjects } from './hooks/useProjects';
import { useTrustedPartners } from './hooks/useTrustedPartners';

// --- DATA SOURCE ---

const aboutImages = [
  "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=2000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2000&auto=format&fit=crop",
];

const hubs = [
  {
    id: "01",
    title: "Production Hub",
    icon: Box,
    desc: "Ha Noi: 1000m2, Ho Chi Minh: 2000m2 factory facility delivering precision fit-outs for showrooms, stages, and booths.",
    color: "text-orange-500",
    categorySlug: "interior"
  },
  {
    id: "02",
    title: "Event & Activation",
    icon: Lightbulb,
    desc: "End-to-end event management: Concept to execution for product launches and corporate galas.",
    color: "text-blue-600",
    categorySlug: "events"
  },
  {
    id: "03",
    title: "Exhibition",
    icon: Users,
    desc: "Creative and award-winning booth designs for domestic and international trade shows.",
    color: "text-purple-600",
    categorySlug: "exhibition"
  },
  {
    id: "04",
    title: "Interior Design",
    icon: Layout,
    desc: "Transforming offices, retail stores, and commercial spaces into immersive brand experiences.",
    color: "text-green-600",
    categorySlug: "interior"
  },
  {
    id: "05",
    title: "Design Studio",
    icon: PenTool,
    desc: "Creative 2D/3D visualization and detailed technical drawings meeting international standards.",
    color: "text-pink-600",
    categorySlug: "design-hub"
  },
  {
    id: "06",
    title: "Project Management",
    icon: Ruler,
    desc: "Professional management ensuring strict control over timeline, quality, and budget.",
    color: "text-indigo-500",
    categorySlug: "project-insights"
  }
];

// Projects đã được load từ Supabase qua useProjects hook

// clientLogos đã được load từ Supabase qua useTrustedPartners hook

// --- ANIMATION COMPONENTS ---

const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  return <motion.div className="fixed top-0 left-0 right-0 h-1 bg-black z-[100] origin-left" style={{ scaleX }} />;
};

const RevealText = ({ children, delay = 0 }) => {
  return (
    <div className="overflow-hidden">
      <motion.div
        initial={{ y: "100%" }}
        whileInView={{ y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay }}
      >
        {children}
      </motion.div>
    </div>
  );
};

// Cinematic Image Slideshow
const ImageSlideshow = () => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % aboutImages.length);
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="absolute inset-0 z-0 overflow-hidden rounded-3xl">
             <div className="absolute inset-0 bg-black/40 z-10"></div>
             <AnimatePresence mode="wait">
                <motion.img 
                    key={index}
                    src={aboutImages[index]}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className="w-full h-full object-cover"
                    alt="Cinematic Background"
                />
             </AnimatePresence>
        </div>
    );
};

export default function ProhubWebsiteV11() {
  const { profiles } = useDownloadProfiles();
  const { contactInfo } = useContactInfo();
  const { projects: allProjects, loading: projectsLoading } = useProjects();
  const { partners: clientLogos, loading: partnersLoading } = useTrustedPartners();
  const { scrollY } = useScroll();
  const yHero = useTransform(scrollY, [0, 500], [0, 150]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Lấy featured projects (tối đa 4, sắp xếp theo home_order)
  const featuredProjects = allProjects
    .filter(p => p.is_featured === true)
    .sort((a, b) => (a.home_order || 999) - (b.home_order || 999))
    .slice(0, 4)
    .map(project => {
      const projectName = project.external_content?.projectName || project.title || '';
      const category = project.project_categories?.name || 'Project';
      
      // Xác định layout dựa trên layout từ database
      let layoutClass = "col-span-1 row-span-1 aspect-square";
      if (project.layout === 'landscape') {
        layoutClass = "col-span-1 md:col-span-2 row-span-1 aspect-[21/9]";
      } else if (project.layout === 'portrait') {
        layoutClass = "col-span-1 row-span-1 aspect-square";
      }
      
      return {
        id: project.id,
        title: projectName,
        category: category,
        year: project.year || '',
        image: project.images?.[0] || '',
        layout: layoutClass
      };
    });

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setToastMessage(type === 'email' ? 'Email copied!' : 'Phone number copied!');
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="bg-white text-black font-sans selection:bg-black selection:text-white overflow-x-hidden">
      <ScrollProgress />

      {/* Toast Notification */}
      {showToast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-20 right-6 z-[200] bg-black text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2"
        >
          <Check size={16} className="text-green-400" />
          {toastMessage}
        </motion.div>
      )}

      {/* --- NAVIGATION --- */}
      <nav className="fixed top-0 left-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-white/80 backdrop-blur-md transition-all duration-300">
        <Link 
          to="/" 
          onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
          className="flex items-center cursor-pointer z-50"
        >
          <img src="/logo.svg" alt="PRO-HUB" className="h-14 w-auto" />
        </Link>
        <div 
            className="md:hidden cursor-pointer z-50"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
            {isMenuOpen ? <X /> : <Menu />}
        </div>
        
        <AnimatePresence>
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
                  ) : (
                    <a 
                      key={item} 
                      href={`#${item.toLowerCase()}`}
                      onClick={(e) => {
                        setIsMenuOpen(false);
                        e.preventDefault();
                        document.getElementById(item.toLowerCase())?.scrollIntoView({ behavior: 'smooth' });
                      }} 
                      className="text-xl font-bold uppercase tracking-widest hover:text-orange-500"
                    >
                      {item}
                    </a>
                  )
               ))}
            </motion.div>
          )}
        </AnimatePresence>

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
                ) : (
                  <a 
                    key={item} 
                    href={`#${item.toLowerCase()}`}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(item.toLowerCase())?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="hover:text-gray-500 transition-colors relative group"
                  >
                    {item}
                    <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-black transition-all group-hover:w-full"></span>
                  </a>
                )
            ))}
        </div>
      </nav>

      {/* --- HERO SECTION: "HI." INTRO (Minimalist Start) --- */}
      <header className="relative h-screen flex flex-col justify-center items-center px-6 md:px-20 overflow-hidden text-center bg-white">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="z-10"
        >
           <h1 className="text-[15vw] font-black tracking-tighter leading-none mb-6">
             Hi.
           </h1>
           <motion.p 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.8, duration: 0.8 }}
             className="text-xl md:text-3xl font-light text-gray-500 max-w-2xl mx-auto"
           >
             Welcome to <span className="font-bold text-black">PRO-HUB VIETNAM</span>
           </motion.p>
           
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 1.5, duration: 1 }}
             className="mt-20 animate-bounce text-gray-400"
           >
             <ChevronDown size={32} />
           </motion.div>
        </motion.div>
      </header>

      {/* --- STATEMENT: CINEMATIC & CREATIVE TYPOGRAPHY --- */}
      <section id="about" className="py-32 px-6 md:px-20 bg-gray-50 relative overflow-hidden">
         <div className="max-w-7xl mx-auto">
            
            {/* Cinematic Background Area */}
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none hidden md:block">
               <ImageSlideshow />
            </div>

            <div className="relative z-20 pt-10">
                <span className="bg-black text-white px-4 py-1 text-xs font-bold uppercase tracking-widest mb-12 inline-block">Our Story</span>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-start">
                   {/* Year Badge */}
                   <div className="md:col-span-3">
                      <div className="border-l-4 border-black pl-6">
                         <span className="text-6xl font-black block">2017</span>
                         <span className="text-sm uppercase tracking-widest text-gray-500">Established</span>
                      </div>
                   </div>

                   {/* Creative Text */}
                   <div className="md:col-span-9">
                      <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                        className="text-4xl md:text-5xl lg:text-6xl leading-tight font-light text-gray-800"
                      >
                         <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                            Our team holds <span className="font-serif italic font-bold">extensive expertise</span>
                         </motion.div>
                         
                         <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="mt-4">
                            in delivering <span className="bg-black text-white px-3 py-1 font-bold transform -rotate-1 inline-block text-3xl md:text-4xl">High-Quality</span> work,
                         </motion.div>

                         <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="mt-12 pl-0 md:pl-16 border-l-0 md:border-l-2 border-orange-500 relative">
                            <p className="text-xl font-bold uppercase tracking-widest text-gray-400 mb-4">Seamlessly bridging the gap</p>
                            <div className="flex flex-col md:flex-row items-baseline gap-6 text-5xl md:text-7xl font-black relative z-20">
                               <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F39700] to-purple-600 inline-block pb-4">Design</span>
                               <span className="text-2xl font-serif italic font-normal text-gray-400 px-4">to</span>
                               <span className="text-black inline-block pb-4">Production</span>
                            </div>
                         </motion.div>

                         {/* Adjusted Spacing for Services */}
                         <motion.div 
                           variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} 
                           className="mt-24 flex flex-wrap gap-4 text-lg font-bold tracking-wide text-gray-600 relative z-10"
                         >
                            <span className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md transition-all cursor-default">
                               <Box size={18} className="text-orange-500"/> Interior
                            </span>
                            <span className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md transition-all cursor-default">
                               <Lightbulb size={18} className="text-blue-500"/> Events
                            </span>
                            <span className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md transition-all cursor-default">
                               <Users size={18} className="text-purple-500"/> Exhibition
                            </span>
                         </motion.div>

                         {/* About us Button */}
                         <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="mt-12">
                             <Link 
                               to="/about"
                               onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
                               className="group flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-black transition-all inline-block"
                             >
                               <span className="border-b-2 border-black pb-1 hover:text-orange-600 hover:border-orange-600 transition-all">About us</span>
                               <ArrowRight className="group-hover:translate-x-1 transition-transform" size={16} />
                             </Link>
                         </motion.div>
                      </motion.div>
                   </div>
                </div>
            </div>
         </div>
      </section>

      {/* --- SERVICES: CLEAN GRID --- */}
      <section id="services" className="pt-40 pb-20 px-6 md:px-20 bg-gray-50">
         <div className="max-w-7xl mx-auto">
            <div className="mb-20 text-center md:text-left">
               <span className="text-sm font-bold uppercase tracking-widest text-gray-400 block mb-2">Our Capabilities</span>
               <h2 className="text-5xl md:text-7xl font-bold tracking-tighter">THE ECOSYSTEM</h2>
               <p className="mt-4 text-gray-600 max-w-2xl text-lg">
                 A comprehensive range of services tailored to meet international standards and client expectations.
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {hubs.map((hub, index) => (
                  <Link
                     key={index}
                     to={`/projects#${hub.categorySlug}`}
                     onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
                     className="h-full"
                  >
                     <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -10 }}
                        className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-orange-100 transition-all duration-300 group cursor-pointer h-full flex flex-col"
                     >
                        <div className={`mb-6 p-3 rounded-xl bg-gray-50 w-fit group-hover:bg-black group-hover:text-white transition-colors duration-300`}>
                           <hub.icon size={28} className={`${hub.color} group-hover:text-white transition-colors`} />
                        </div>
                        <h3 className="text-xl font-bold mb-3 group-hover:text-orange-600 transition-colors">{hub.title}</h3>
                        <p className="text-sm text-gray-500 leading-relaxed flex-grow">
                           {hub.desc}
                        </p>
                     </motion.div>
                  </Link>
               ))}
            </div>
         </div>
      </section>

      {/* --- PROJECTS: ASYMMETRIC GALLERY --- */}
      <section id="projects" className="py-32 px-6 md:px-10 bg-black text-white">
         <div className="max-w-[1800px] mx-auto">
             <div className="flex justify-between items-end mb-16 px-4">
                <h2 className="text-5xl md:text-6xl font-black tracking-tight">
                   SELECTED <br/> WORKS
                </h2>
                <Link 
                  to="/projects"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
                  className="hidden md:flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-gray-400 transition-colors"
                >
                   View All Projects <ArrowRight size={16} />
                </Link>
             </div>

             {projectsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                  <p className="text-gray-400">Đang tải...</p>
                </div>
              ) : featuredProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-4">
                  {featuredProjects.map((project, index) => (
                   <motion.div 
                      key={index}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8 }}
                      whileHover={{ scale: 0.98 }}
                      className={`relative group overflow-hidden bg-gray-900 ${project.layout}`}
                   >
                      <img 
                         src={project.image} 
                         alt={project.title} 
                         className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                      />
                      
                      {/* Hover Info */}
                      <div className="absolute inset-0 p-8 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
                         <div className="flex justify-end">
                            <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center">
                               <ArrowUpRight size={20} />
                            </div>
                         </div>
                         <div>
                            <span className="text-xs font-bold uppercase tracking-widest mb-2 block text-gray-300">{project.category}</span>
                            <h3 className="text-3xl font-bold">{project.title}</h3>
                         </div>
                      </div>
                   </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-lg mb-2">Chưa có projects được chọn cho SELECTED WORKS</p>
                  <p className="text-sm">Vui lòng chọn projects trong Admin → Projects → Check "Hiển thị ở SELECTED WORKS"</p>
                </div>
              )}
             
             <div className="mt-12 text-center md:hidden">
                <Link 
                  to="/projects"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
                  className="px-8 py-3 border border-white rounded-full font-bold uppercase text-sm tracking-widest inline-block"
                >
                   View All Projects
                </Link>
             </div>
         </div>
      </section>

      {/* --- CLIENTS --- */}
      <section className="py-20 bg-white overflow-hidden">
         <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-12">OUR CLIENTS</p>
            <div className="relative w-full overflow-hidden">
               {/* Marquee Container */}
               <motion.div
                  className="flex items-center gap-12 md:gap-20"
                  animate={{
                     x: ['0%', '-50%']
                  }}
                  transition={{
                     x: {
                        repeat: Infinity,
                        repeatType: "loop",
                        duration: 40,
                        ease: "linear"
                     }
                  }}
               >
                  {partnersLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto"></div>
                    </div>
                  ) : clientLogos.length > 0 ? (
                    <>
                      {/* First Set */}
                      <div className="flex items-center gap-12 md:gap-20 flex-shrink-0">
                         {clientLogos.map((client, index) => (
                            <div key={`first-${client.id || index}`} className="h-12 flex items-center flex-shrink-0">
                               {client.logo_url ? (
                                  <img src={client.logo_url} alt={client.name} className="h-full w-auto object-contain" />
                               ) : (
                                  <span className="font-bold text-xl">{client.name}</span>
                               )}
                            </div>
                         ))}
                      </div>
                      {/* Duplicate Set for Seamless Loop */}
                      <div className="flex items-center gap-12 md:gap-20 flex-shrink-0">
                         {clientLogos.map((client, index) => (
                            <div key={`second-${client.id || index}`} className="h-12 flex items-center flex-shrink-0">
                               {client.logo_url ? (
                                  <img src={client.logo_url} alt={client.name} className="h-full w-auto object-contain" />
                               ) : (
                                  <span className="font-bold text-xl">{client.name}</span>
                               )}
                            </div>
                         ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <p>Chưa có OUR CLIENTS</p>
                      <p className="text-sm mt-2">Vui lòng thêm trong Admin → OUR CLIENTS</p>
                    </div>
                  )}
               </motion.div>
            </div>
         </div>
      </section>

      {/* --- FOOTER --- */}
      <footer id="contact" className="py-20 px-6 md:px-20 bg-white border-t border-gray-100">
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
            {/* Phần 1: PRO-HUB + Download */}
            <div>
               <img src="/logo.svg" alt="PRO-HUB" className="h-14 w-auto mb-8" />
               <div className="flex flex-col gap-4">
                  {profiles.en ? (
                    <a 
                      href={profiles.en.file_url} 
                      download={profiles.en.file_name || 'profile-en.pdf'}
                      className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest hover:text-blue-600 transition-colors group"
                    >
                       <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <Download size={14} />
                       </div>
                       Download Profile (EN)
                    </a>
                  ) : null}
                  {profiles.vn ? (
                    <a 
                      href={profiles.vn.file_url} 
                      download={profiles.vn.file_name || 'profile-vn.pdf'}
                      className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest hover:text-blue-600 transition-colors group"
                    >
                       <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <Download size={14} />
                       </div>
                       Download Profile (VN)
                    </a>
                  ) : null}
               </div>
            </div>

            {/* Phần 2: Say Hello + Office */}
            <div className="space-y-8">
               <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Say Hello</h4>
                  {contactInfo.email ? (
                    <button
                      onClick={() => copyToClipboard(contactInfo.email, 'email')}
                      className="block text-xl font-bold hover:text-blue-600 transition-colors cursor-pointer bg-transparent border-0 p-0"
                    >
                      {contactInfo.email}
                    </button>
                  ) : (
                    <p className="text-gray-400">Đang tải...</p>
                  )}
                  {contactInfo.hotline ? (
                    <button
                      onClick={() => copyToClipboard(contactInfo.hotline.replace(/\s/g, ''), 'phone')}
                      className="block text-xl font-bold hover:text-blue-600 transition-colors cursor-pointer mt-1 bg-transparent border-0 p-0"
                    >
                      {contactInfo.hotline}
                    </button>
                  ) : null}
               </div>

               <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Office</h4>
                  {contactInfo.office_address ? (
                    <p className="font-medium text-lg mb-1 whitespace-pre-line">{contactInfo.office_address}</p>
                  ) : (
                    <p className="text-gray-400">Đang tải...</p>
                  )}
               </div>
            </div>

            {/* Phần 3: Google Map */}
            <div>
               <div className="w-full h-48 md:h-64 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                  <iframe
                     src={
                        // Nếu có google_map_url và là embed URL, dùng trực tiếp
                        contactInfo.google_map_url && contactInfo.google_map_url.includes('/embed')
                           ? contactInfo.google_map_url
                           // Nếu có địa chỉ office, dùng để tạo embed URL
                           : contactInfo.office_address
                           ? `https://www.google.com/maps?q=${encodeURIComponent(contactInfo.office_address)}&output=embed`
                           // Fallback: dùng địa chỉ mặc định
                           : `https://www.google.com/maps?q=No+5,+B12,+TT51,+Cam+Hoi,+Hanoi,+Vietnam&output=embed`
                     }
                     width="100%"
                     height="100%"
                     style={{ border: 0 }}
                     allowFullScreen
                     loading="lazy"
                     referrerPolicy="no-referrer-when-downgrade"
                     className="w-full h-full"
                  ></iframe>
               </div>
               {contactInfo.google_map_url ? (
                 <a 
                    href={contactInfo.google_map_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block mt-3 text-sm text-gray-500 hover:text-blue-600 transition-colors"
                 >
                    View on Google Maps →
                 </a>
               ) : contactInfo.office_address ? (
                 <a 
                    href={`https://www.google.com/maps?q=${encodeURIComponent(contactInfo.office_address)}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block mt-3 text-sm text-gray-500 hover:text-blue-600 transition-colors"
                 >
                    View on Google Maps →
                 </a>
               ) : (
                 <a 
                    href="https://maps.app.goo.gl/itzqYqQWK1zt9HLN9" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block mt-3 text-sm text-gray-500 hover:text-blue-600 transition-colors"
                 >
                    View on Google Maps →
                 </a>
               )}
            </div>
         </div>
         <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-gray-100 text-xs font-bold uppercase tracking-widest text-gray-400">
            <span>© 2026 PRO-HUB Vietnam</span>
         </div>
      </footer>
    </div>
  );
}
