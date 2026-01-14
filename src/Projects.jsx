import React, { useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Menu, X, ArrowUpRight, Download } from 'lucide-react';

// --- DATA SOURCE ---

const exhibitions = [
  {
    id: 1,
    title: "VTDF @ITE 2022",
    location: "Ho Chi Minh City",
    area: "250 sqm",
    image: "https://images.unsplash.com/photo-1531058020387-3be344556be6?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: 2,
    title: "Viglacera Booth",
    location: "Vietbuild Hanoi",
    area: "180 sqm",
    image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=2074&auto=format&fit=crop"
  },
  {
    id: 3,
    title: "Korea Tourism Org",
    location: "VITM Danang",
    area: "90 sqm",
    image: "https://images.unsplash.com/photo-1540575467063-17ea6f5cc656?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: 4,
    title: "Panasonic Tech",
    location: "CES Local",
    area: "120 sqm",
    image: "https://images.unsplash.com/photo-1550305080-4e029753abcf?q=80&w=2071&auto=format&fit=crop"
  }
];

const events = [
  {
    id: 1,
    title: "Diageo Kick-off Meeting",
    location: "Quy Nhon",
    type: "Corporate Event",
    year: "2022",
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=2069&auto=format&fit=crop"
  },
  {
    id: 2,
    title: "Microsoft Future Now",
    location: "Lotte Hotel Hanoi",
    type: "Conference",
    year: "2019",
    image: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: 3,
    title: "Land Rover Launch",
    location: "JW Marriott",
    type: "Product Launch",
    year: "2021",
    image: "https://images.unsplash.com/photo-1505373877841-8d43f716ca77?q=80&w=2069&auto=format&fit=crop"
  }
];

const designs = [
  {
    id: 1,
    title: "Jaguar Land Rover Studio",
    location: "Trang Tien Plaza",
    desc: "Luxury retail space concept",
    image: "https://images.unsplash.com/photo-1562141989-c5c79ac8f576?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: 2,
    title: "Beta Cineplex Concept",
    location: "Nationwide",
    desc: "Youthful & vibrant cinema design",
    image: "https://images.unsplash.com/photo-1517604931442-71053e3e2c28?q=80&w=2069&auto=format&fit=crop"
  }
];

const insights = [
  {
    id: 1,
    title: "Solving the Curved Wall Challenge",
    category: "Construction Technique",
    date: "Oct 2024",
    summary: "How we used 3D Scanning to solve a complex production issue for a luxury showroom, ensuring perfect precision.",
    image: "https://images.unsplash.com/photo-1581094794329-cdac82aadbcc?q=80&w=2000&auto=format&fit=crop"
  },
  {
    id: "2",
    title: "Sustainable Materials in Booth Design",
    category: "Design Trend",
    date: "Sep 2024",
    summary: "Exploring eco-friendly materials for trade shows that reduce waste without compromising aesthetics.",
    image: "https://images.unsplash.com/photo-1518544806352-a2221eb43d45?q=80&w=2000&auto=format&fit=crop"
  }
];

// --- COMPONENTS ---

const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  return <motion.div className="fixed top-0 left-0 right-0 h-1 bg-black z-[100] origin-left" style={{ scaleX }} />;
};

const SectionTitle = ({ title, subtitle }) => (
  <div className="mb-12">
    <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 block mb-2">{subtitle}</span>
    <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">{title}</h2>
    <div className="h-1 w-20 bg-black mt-6"></div>
  </div>
);

const ProjectCard = ({ project, layout = "portrait" }) => (
  <motion.div 
    whileHover={{ y: -10 }}
    className="group cursor-pointer"
  >
    <div className={`relative overflow-hidden bg-gray-100 mb-6 ${layout === "landscape" ? "aspect-[16/9]" : "aspect-[4/5]"} rounded-lg`}>
      <img 
        src={project.image} 
        alt={project.title} 
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
         <div className="bg-white/90 backdrop-blur-sm p-4 rounded-full">
            <ArrowRight className="w-6 h-6 text-black" />
         </div>
      </div>
    </div>
    <h3 className="text-xl font-bold mb-1 group-hover:text-orange-600 transition-colors">{project.title}</h3>
    <p className="text-sm text-gray-500 uppercase tracking-wide">{project.location} {project.area ? `— ${project.area}` : ''}</p>
  </motion.div>
);

export default function Projects() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="bg-white text-black font-sans selection:bg-black selection:text-white overflow-x-hidden min-h-screen">
      <ScrollProgress />
      
      {/* --- NAVIGATION --- */}
      <nav className="fixed top-0 left-0 w-full z-50 px-6 py-6 flex justify-between items-center bg-white/95 backdrop-blur-md transition-all duration-300 border-b border-gray-100 shadow-sm">
        <Link 
          to="/" 
          onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
          className="text-2xl font-black tracking-tighter cursor-pointer z-50"
        >
          PROHUB.
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

      {/* --- HERO --- */}
      <header className="pt-40 pb-20 px-6 md:px-20 bg-white">
         <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-[12vw] md:text-[10vw] font-black tracking-tighter leading-none mb-6">
               WORK.
            </h1>
            <p className="text-xl text-gray-500 max-w-3xl mx-auto font-light leading-relaxed">
               Delivering impactful brand experiences through innovative design and flawless execution.
            </p>
         </div>
      </header>

      {/* --- 1. EXHIBITION --- */}
      <section className="py-20 px-6 md:px-20 bg-white">
         <div className="max-w-7xl mx-auto">
            <SectionTitle title="Exhibition" subtitle="Trade Shows & Booths" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {exhibitions.map((item) => (
                  <ProjectCard key={item.id} project={item} />
               ))}
            </div>
         </div>
      </section>

      {/* --- 2. EVENTS --- */}
      <section className="py-20 px-6 md:px-20 bg-gray-50">
         <div className="max-w-7xl mx-auto">
            <SectionTitle title="Events" subtitle="Corporate & Activation" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {events.map((item) => (
                  <ProjectCard key={item.id} project={item} layout="landscape" />
               ))}
            </div>
         </div>
      </section>

      {/* --- 3. DESIGN HUB --- */}
      <section className="py-20 px-6 md:px-20 bg-white">
         <div className="max-w-7xl mx-auto">
            <div className="mb-16">
               <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 block mb-2">Concept & Visualization</span>
               <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">Design Hub</h2>
               <div className="h-1 w-20 bg-black mt-6"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               {designs.map((item) => (
                  <motion.div 
                    key={item.id}
                    whileHover={{ scale: 0.98 }}
                    className="group cursor-pointer"
                  >
                    <div className="relative overflow-hidden mb-6 aspect-video rounded-lg">
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                      />
                    </div>
                    <div className="flex justify-between items-end border-b border-gray-200 pb-4 group-hover:border-black transition-colors">
                       <div>
                          <h3 className="text-2xl font-bold mb-1">{item.title}</h3>
                          <p className="text-sm text-gray-400 uppercase tracking-wide">{item.location}</p>
                       </div>
                       <ArrowUpRight className="w-6 h-6 text-gray-500 group-hover:text-black transition-colors" />
                    </div>
                  </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* --- 4. PROJECT INSIGHTS --- */}
      <section className="py-20 px-6 md:px-20 bg-white">
         <div className="max-w-7xl mx-auto">
            <SectionTitle title="Project Insights" subtitle="Stories Behind The Scenes" />
            
            <div className="grid grid-cols-1 gap-16">
               {insights.map((item) => (
                  <motion.div 
                     key={item.id}
                     whileHover={{ y: -5 }}
                     className="flex flex-col md:flex-row gap-10 items-center group cursor-pointer"
                  >
                     <div className="w-full md:w-5/12 overflow-hidden rounded-xl aspect-[3/2] shadow-md">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                     </div>
                     <div className="w-full md:w-7/12">
                        <div className="flex items-center gap-4 mb-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                           <span className="text-orange-500">{item.category}</span>
                           <span>•</span>
                           <span>{item.date}</span>
                        </div>
                        <h3 className="text-3xl font-bold mb-4 group-hover:text-orange-600 transition-colors leading-tight">{item.title}</h3>
                        <p className="text-gray-600 text-lg leading-relaxed mb-8 border-l-4 border-gray-200 pl-4 group-hover:border-orange-500 transition-colors">
                           {item.summary}
                        </p>
                        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-black group-hover:gap-4 transition-all">
                           Read Full Story <ArrowRight size={16} />
                        </div>
                     </div>
                  </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* --- FOOTER --- */}
      <footer id="contact" className="py-12 px-6 md:px-20 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-black tracking-tighter mb-2">PROHUB.</h2>
            <p className="text-xs text-gray-400 uppercase tracking-widest">© 2026 PROHUB Vietnam. All rights reserved.</p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6 text-center md:text-right items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Contact</p>
              <a href="mailto:vannhi@pro-hub.com.vn" className="block text-sm font-bold hover:text-blue-600 transition-colors">vannhi@pro-hub.com.vn</a>
              <a href="tel:+84908583042" className="block text-sm font-bold hover:text-blue-600 transition-colors mt-1">(+84) 908 583 042</a>
            </div>
            <div className="flex gap-4">
              <a href="#" className="px-4 py-2 border border-gray-200 rounded-full text-xs font-bold uppercase hover:bg-black hover:text-white transition-colors flex items-center gap-2">
                <Download size={14} /> Profile EN
              </a>
              <a href="#" className="px-4 py-2 border border-gray-200 rounded-full text-xs font-bold uppercase hover:bg-black hover:text-white transition-colors flex items-center gap-2">
                <Download size={14} /> Profile VN
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
