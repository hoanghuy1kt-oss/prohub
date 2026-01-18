import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, ArrowDown, MapPin, Menu, X, ArrowLeft,
  CheckCircle2, Globe, Box, Mail, Phone,
  Quote, Ruler, AlertTriangle, Lightbulb, Check, ChevronRight,
  ShieldCheck, Users, ScanLine, FileText, Layers, Target, RefreshCw, Star, Award, Calendar
} from 'lucide-react';

// --- CASE STUDY DATA ---
const CASE_STUDY = {
  client: "Phu Thai Mobility - Land Rover",
  project: "Land Rover 3S Pilot Showroom",
  location: "Long Bien, Hanoi",
  stats: [
    { label: "Showroom Area", value: "1,850", unit: "m²" },
    { label: "Workshop Area", value: "2,650", unit: "m²" },
    { label: "Design Time", value: "6", unit: "Months" },
    { label: "Construction", value: "12", unit: "Months" }
  ],
  // Images - URLs from Supabase Storage
  images: {
    hero: "https://ztefphunnslbrnxqdnsb.supabase.co/storage/v1/object/public/project-images/internal-content-1768721194250-zd3qdw.jpg",
    handoverCeremony: "https://ztefphunnslbrnxqdnsb.supabase.co/storage/v1/object/public/project-images/internal-content-1768721324356-dr95zj.jpg",
    teamPhoto: "https://ztefphunnslbrnxqdnsb.supabase.co/storage/v1/object/public/project-images/internal-content-1768721333522-lw16n8.jpg",
    overviewMain: "https://ztefphunnslbrnxqdnsb.supabase.co/storage/v1/object/public/project-images/internal-content-1768721333542-mvsh5.jpg",
    recognition1: "https://ztefphunnslbrnxqdnsb.supabase.co/storage/v1/object/public/project-images/internal-content-1768721333505-4nwdb7.jpg",
    recognition2: "https://ztefphunnslbrnxqdnsb.supabase.co/storage/v1/object/public/project-images/internal-content-1768721333516-bghipq.jpg",
    recognition3: "https://ztefphunnslbrnxqdnsb.supabase.co/storage/v1/object/public/project-images/internal-content-1768722814553-07tbt.jpg"
  },
  // Updated Testimonials as "Key Recognitions"
  recognitions: [
    {
      title: "Official Commendation",
      desc: "Formal Letter of Appreciation from the General Director sent to the Project Manager and PROHUB team, acknowledging the exceptional quality delivered.",
      icon: <FileText className="w-8 h-8 text-blue-600" />,
      imageLabel: "[Image: Full Thank You Letter from GD]",
      image: "" // URL của ảnh - sẽ được lấy từ CASE_STUDY.images.recognition1
    },
    {
      title: "Leadership Acknowledgment",
      desc: "Mr. Ruud (General Director, PTM) personally thanked the Project Manager and PROHUB for their dedicated contributions throughout the 18-month journey of the Pilot Showroom.",
      icon: <Users className="w-8 h-8 text-blue-600" />,
      imageLabel: "[Image: Mr. Ruud Shaking Hands at Ceremony]",
      image: "" // URL của ảnh - sẽ được lấy từ CASE_STUDY.images.recognition2
    },
    {
      title: "Global Benchmark Status",
      desc: "Maintained in pristine condition. Selected by JLR UK for documentation filming (May). Chosen host for APAC Conference 2024 and Global Dealer Conference 2025.",
      icon: <Globe className="w-8 h-8 text-blue-600" />,
      imageLabel: "[Image: Large Showroom Event / Conference]",
      image: "" // URL của ảnh - sẽ được lấy từ CASE_STUDY.images.recognition3
    }
  ]
};

// --- COMPONENTS ---

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* --- NAVIGATION --- */}
      <nav className="fixed top-0 left-0 w-full z-50 px-6 py-6 flex justify-between items-center bg-white/80 backdrop-blur-md transition-all duration-300">
        <Link
          to="/projects" 
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
    </>
  );
};

const HeroCaseStudy = () => {
  return (
    <section className="relative min-h-screen w-full bg-slate-900 flex flex-col overflow-hidden">
      {/* BACKGROUND IMAGE - FULL SCREEN LANDSCAPE */}
      <div className="absolute inset-0 bg-neutral-800 z-0">
         {CASE_STUDY.images.hero ? (
           <img 
             src={CASE_STUDY.images.hero} 
             alt="Land Rover 3S Pilot Showroom" 
             className="w-full h-full object-cover" 
           />
         ) : (
           <div className="w-full h-full flex items-center justify-center text-white/20 text-7xl font-black uppercase tracking-widest text-center px-4">
              [Big Landscape Hero Image]
           </div>
         )}
      </div>
      
      {/* Cinematic Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent z-10"></div>

      {/* Content Overlay - At bottom */}
      <div className="flex-1 flex items-end justify-center relative z-20 pb-20">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 bg-blue-600 text-white font-bold uppercase tracking-widest text-xs mb-6 rounded-full">
              Selected Case Study
            </span>
            <h1 className="text-6xl md:text-9xl font-black text-white leading-none mb-6 tracking-tight">
              LAND ROVER<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-500">3S PILOT.</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-light">
              A masterclass in precision and luxury in Long Bien, Hanoi.<br/>
              Setting the standard for automotive retail in Southeast Asia.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Stats Section - At bottom of Hero */}
      <div className="relative z-20 w-full bg-black border-t border-white/10">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {CASE_STUDY.stats.map((stat, i) => (
              <div key={i} className="border-l border-white/20 pl-6 group hover:border-blue-500 transition-colors duration-300">
                <p className="text-4xl md:text-5xl font-black text-white group-hover:text-blue-500 transition-colors mb-1">{stat.value}</p>
                <p className="text-sm text-slate-400 uppercase tracking-wider font-bold">{stat.unit}</p>
                <p className="text-xs text-slate-500 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Scroll to Explore Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 flex flex-col items-center gap-2 z-30"
        >
          <span className="text-[10px] uppercase tracking-widest">Scroll to Explore</span>
          <ArrowDown size={20} />
        </motion.div>
      </div>
    </section>
  );
};


const Overview = () => {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.8 }}
        >
           <h2 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-4">Project Overview</h2>
           <h3 className="text-4xl font-black text-slate-900 mb-8">From Blueprint to Icon.</h3>
           <p className="text-slate-600 leading-relaxed text-lg mb-6">
             The Land Rover 3S Pilot Showroom in Long Bien is not just a car dealership; it's a statement of luxury and capability. 
             Covering over 4,500m² of combined space, it requires adherence to the strictest global standards of Jaguar Land Rover.
           </p>
           <p className="text-slate-600 leading-relaxed text-lg mb-8">
             <strong className="text-slate-900">Proud Moment:</strong> PROHUB was honored to represent all contractors in handing over the key to the Showroom Director, marking the completion of an 18-month journey of dedication.
           </p>
           
           <motion.div 
             className="grid grid-cols-2 gap-4"
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true, margin: "-10%" }}
             transition={{ duration: 0.8, delay: 0.2 }}
           >
              {/* HANDOVER CEREMONY IMAGES */}
              {CASE_STUDY.images.handoverCeremony ? (
                <img 
                  src={CASE_STUDY.images.handoverCeremony} 
                  alt="Key Handover Ceremony" 
                  className="aspect-video bg-slate-100 rounded-lg object-cover border border-slate-200"
                />
              ) : (
                <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-xs uppercase font-bold text-center p-2 border border-slate-200">
                   [Image: Key Handover Ceremony]
                </div>
              )}
              {CASE_STUDY.images.teamPhoto ? (
                <img 
                  src={CASE_STUDY.images.teamPhoto} 
                  alt="PROHUB & PTM Team" 
                  className="aspect-video bg-slate-100 rounded-lg object-cover border border-slate-200"
                />
              ) : (
                <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-xs uppercase font-bold text-center p-2 border border-slate-200">
                   [Image: PROHUB & PTM Team]
                </div>
              )}
           </motion.div>
        </motion.div>
        <motion.div 
          className="h-full min-h-[500px] bg-slate-100 rounded-2xl relative overflow-hidden"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.8 }}
        >
           {CASE_STUDY.images.overviewMain ? (
             <img 
               src={CASE_STUDY.images.overviewMain} 
               alt="Showroom Exterior / Interior Overview" 
               className="w-full h-full object-cover"
             />
           ) : (
             <div className="absolute inset-0 flex items-center justify-center text-slate-300 font-bold text-2xl uppercase text-center p-4">
                [Image: Showroom Exterior / Interior Overview]
             </div>
           )}
        </motion.div>
      </div>
    </section>
  );
};

// --- RECOGNITIONS SECTION (ZIG-ZAG LAYOUT - BIG IMAGES) ---
const Recognitions = () => {
  return (
    <section className="py-24 bg-slate-50 border-y border-slate-200">
      <div className="container mx-auto px-6">
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">Recognition of Excellence</h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">
            Our quality is proven by the trust and recognition from leadership and global partners.
          </p>
        </motion.div>

        <div className="space-y-32">
           {CASE_STUDY.recognitions.map((item, i) => (
             <motion.div 
               key={i} 
               initial={{ opacity: 0, y: 50 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: "-10%" }}
               transition={{ duration: 0.8 }}
               className={`flex flex-col md:flex-row gap-12 md:gap-20 items-center ${i % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}
             >
                {/* Image Area - BIGGER AND BOLDER */}
                <div className="w-full md:w-3/5 relative group">
                   <div className="aspect-[16/10] bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-200 relative">
                      {/* Recognition Image */}
                      {(() => {
                        const imageUrl = i === 0 ? CASE_STUDY.images.recognition1 : 
                                        i === 1 ? CASE_STUDY.images.recognition2 : 
                                        CASE_STUDY.images.recognition3;
                        
                        return imageUrl ? (
                          <img 
                            src={imageUrl} 
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-slate-200 text-slate-400 font-black uppercase tracking-widest p-8 text-center text-xl">
                             {item.imageLabel}
                          </div>
                        );
                      })()}
                      {/* Gradient Overlay for text readability if needed */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                   </div>
                   
                   {/* Floating Icon Badge */}
                   <div className={`absolute -bottom-8 -right-8 w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-2xl z-10 border border-slate-100 ${i % 2 !== 0 ? 'md:right-auto md:-left-8' : ''}`}>
                      {item.icon}
                   </div>
                </div>

                {/* Content Area */}
                <div className="w-full md:w-2/5">
                   <div className="text-blue-600 font-bold uppercase tracking-widest text-sm mb-2">Milestone 0{i+1}</div>
                   <h3 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 leading-tight">{item.title}</h3>
                   <div className="w-20 h-1.5 bg-blue-600 mb-8"></div>
                   <p className="text-slate-600 text-lg leading-relaxed font-medium">
                     {item.desc}
                   </p>
                </div>
             </motion.div>
           ))}
        </div>
      </div>
    </section>
  );
};

const DetailedChallenges = () => {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <motion.div 
          className="max-w-3xl mx-auto text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.8 }}
        >
           <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">Problem Solving</h2>
           <p className="text-slate-500 text-lg">
             True expertise is proven when things go wrong. Here is how PROHUB navigated complex technical hurdles during the Land Rover project.
           </p>
        </motion.div>

        <div className="space-y-24">
           
           {/* --- CHALLENGE 1: WALL-MOUNT --- */}
           <motion.div 
             className="border-t border-slate-200 pt-16"
             initial={{ opacity: 0, y: 50 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true, margin: "-10%" }}
             transition={{ duration: 0.8 }}
           >
             <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xl">1</div>
                <h3 className="text-3xl md:text-4xl font-bold text-slate-900">The Wall-Mount Discrepancy</h3>
             </div>
             
             {/* Text-Focused Layout (No Images) */}
             <div className="grid md:grid-cols-2 gap-12 items-start">
                <div className="bg-orange-50 p-8 rounded-2xl border border-orange-100 h-full">
                   <h4 className="flex items-center gap-2 font-bold text-orange-700 mb-4 text-lg">
                     <AlertTriangle size={20} /> The Situation
                   </h4>
                   <p className="text-slate-700 text-lg leading-relaxed">
                     We faced a critical mismatch between the <strong>imported wall-mount frames</strong> (supplied by a nominated vendor) and our local fit-out production. Despite initial measurements, the pre-made imported parts did not fit the local site conditions perfectly.
                   </p>
                </div>
                
                <div className="space-y-6 pt-4">
                   <h4 className="font-bold text-slate-900 text-xl mb-6">PROHUB's Agile Solution:</h4>
                   
                   <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                         <Users size={20} />
                      </div>
                      <div>
                         <strong className="block text-slate-900 text-base mb-1">Urgent Coordination</strong>
                         <p className="text-slate-600 text-sm">Organized emergency technical meetings with all stakeholders to identify root causes immediately.</p>
                      </div>
                   </div>

                   <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                         <Ruler size={20} />
                      </div>
                      <div>
                         <strong className="block text-slate-900 text-base mb-1">On-Site Calibration</strong>
                         <p className="text-slate-600 text-sm">Conducted precise re-measurements and agreed on direct adjustments at the construction site.</p>
                      </div>
                   </div>

                   <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                         <ShieldCheck size={20} />
                      </div>
                      <div>
                         <strong className="block text-slate-900 text-base mb-1">Flexible Engineering</strong>
                         <p className="text-slate-600 text-sm">Adjusted our local fit-out components to accommodate the immutable imported frames, ensuring no delay to the launch.</p>
                      </div>
                   </div>
                </div>
             </div>
           </motion.div>

           {/* --- CHALLENGE 2: CURVED STRUCTURE --- */}
           <motion.div 
             className="border-t border-slate-200 pt-16"
             initial={{ opacity: 0, y: 50 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true, margin: "-10%" }}
             transition={{ duration: 0.8 }}
           >
             <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xl">2</div>
                <h3 className="text-3xl md:text-4xl font-bold text-slate-900">The Curved Structure Challenge</h3>
             </div>
             
             {/* Text-Focused Layout (No Images) */}
             <div className="grid md:grid-cols-2 gap-12 items-start">
                <div className="bg-purple-50 p-8 rounded-2xl border border-purple-100 h-full">
                   <h4 className="flex items-center gap-2 font-bold text-purple-700 mb-4 text-lg">
                     <AlertTriangle size={20} /> The Situation
                   </h4>
                   <p className="text-slate-700 text-lg leading-relaxed">
                     The on-site masonry team failed to execute the complex curves exactly as per design. This deviation threatened the mass production of curved cladding panels, which would not fit the imperfect walls.
                   </p>
                   <p className="text-purple-800 font-bold mt-4 border-t border-purple-200 pt-4 text-sm">
                      Lessons Learned: This situation reaffirms the importance of strict construction quality control from the very first stages.
                   </p>
                </div>
                
                <div className="space-y-6 pt-4">
                   <h4 className="font-bold text-slate-900 text-xl mb-6">The Tech Solution:</h4>
                   
                   <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                         <ScanLine size={20} />
                      </div>
                      <div>
                         <strong className="block text-slate-900 text-base mb-1">3D Scanning Technology</strong>
                         <p className="text-slate-600 text-sm">Deployed specialized 3D scanners to capture the exact "As-Built" reality of the imperfect curves.</p>
                      </div>
                   </div>

                   <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                         <Box size={20} />
                      </div>
                      <div>
                         <strong className="block text-slate-900 text-base mb-1">"Custom-Made" Production</strong>
                         <p className="text-slate-600 text-sm">Switched from mass production to "Tailor-made" manufacturing based on the 3D scan data.</p>
                      </div>
                   </div>

                   <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                         <CheckCircle2 size={20} />
                      </div>
                      <div>
                         <strong className="block text-slate-900 text-base mb-1">Perfect Fit</strong>
                         <p className="text-slate-600 text-sm">Result: Zero gaps, perfect alignment, preserving the premium aesthetic of Land Rover.</p>
                      </div>
                   </div>
                </div>
             </div>
           </motion.div>

           {/* --- LESSONS LEARNED --- */}
           <motion.div 
             className="bg-slate-900 text-white p-10 md:p-16 rounded-3xl mt-16"
             initial={{ opacity: 0, y: 50 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true, margin: "-10%" }}
             transition={{ duration: 0.8 }}
           >
              <div className="text-center mb-12">
                 <h3 className="text-3xl font-bold mb-4">Key Takeaways & Future Strategy</h3>
                 <p className="text-slate-400 max-w-2xl mx-auto">
                   From this experience, Pro-Hub has drawn profound lessons on the importance of clear responsibility and advanced quality control.
                 </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                 {/* Item 1 */}
                 <div className="bg-white/5 p-6 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                    <Target className="text-blue-500 mb-4 w-8 h-8" />
                    <h4 className="font-bold text-lg mb-2">Centralized Responsibility</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">
                       We propose coordinating with the Client to appoint <strong>a single entity</strong> (Main Contractor or Independent Consultant) to own the master technical drawings and precise dimensional control for all items from the start.
                    </p>
                 </div>
                 
                 {/* Item 2 */}
                 <div className="bg-white/5 p-6 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                    <Layers className="text-blue-500 mb-4 w-8 h-8" />
                    <h4 className="font-bold text-lg mb-2">Strict Control Protocol</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">
                       Establishing a rigorous control process for technical information exchange and drawing approvals between all stakeholders to avoid miscommunication.
                    </p>
                 </div>

                 {/* Item 3 */}
                 <div className="bg-white/5 p-6 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                    <ScanLine className="text-blue-500 mb-4 w-8 h-8" />
                    <h4 className="font-bold text-lg mb-2">Advanced Measurement</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">
                       Prioritizing modern measurement tools (like 3D Scanners) and methods to ensure the highest degree of accuracy in execution.
                    </p>
                 </div>

                 {/* Item 4 */}
                 <div className="bg-white/5 p-6 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                    <RefreshCw className="text-blue-500 mb-4 w-8 h-8" />
                    <h4 className="font-bold text-lg mb-2">Proactive Coordination</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">
                       Strengthening exchange and coordination with partners right from the detailed design phase to anticipate potential dimensional and technical issues.
                    </p>
                 </div>
              </div>
           </motion.div>

        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-white text-slate-900 pt-32 pb-12 px-6">
       <div className="container mx-auto">
          <motion.div 
            className="grid md:grid-cols-2 gap-16 mb-24 border-b border-slate-200 pb-24"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.8 }}
          >
             <div>
               <h2 className="text-5xl font-black tracking-tighter mb-8">
                 READY FOR THE<br/>NEXT CHALLENGE?
               </h2>
             </div>
             <div className="flex flex-col justify-center space-y-6">
                <p className="flex items-center gap-4 text-lg">
                   <Mail className="text-blue-600" /> vannhi@pro-hub.com.vn
                </p>
                <p className="flex items-center gap-4 text-lg">
                   <Phone className="text-blue-600" /> 090 858 3042
                </p>
                <button className="mt-8 px-8 py-4 bg-slate-900 text-white font-bold rounded hover:bg-blue-600 transition-colors w-fit">
                   Contact Us
                </button>
             </div>
          </motion.div>
          <div className="text-center text-sm text-slate-400">
             © 2025 PROHUB Vietnam. All rights reserved.
          </div>
       </div>
    </footer>
  );
};

const App = () => {
  return (
    <div className="font-sans text-slate-900 bg-white selection:bg-blue-600 selection:text-white">
      <Header />
      <main>
        <HeroCaseStudy />
        <Overview />
        <Recognitions />
        <DetailedChallenges />
        {/* Commitment section removed */}
        <Footer />
      </main>
    </div>
  );
};

export default App;