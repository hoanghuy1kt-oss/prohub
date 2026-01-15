import React, { useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Download, Menu, X } from 'lucide-react';
import AboutContent from './components/AboutContent';
import { useDownloadProfiles } from './hooks/useDownloadProfiles';
import { useContactInfo } from './hooks/useContactInfo';

// --- COMPONENTS ---

const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  return <motion.div className="fixed top-0 left-0 right-0 h-1 bg-black z-[100] origin-left" style={{ scaleX }} />;
};

export default function About() {
  const { profiles } = useDownloadProfiles();
  const { contactInfo } = useContactInfo();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="bg-white text-black font-sans selection:bg-black selection:text-white overflow-x-hidden">
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
        
        {/* Mobile Menu */}
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
                  href={`/#${item.toLowerCase()}`} 
                  onClick={(e) => {
                    setIsMenuOpen(false);
                    e.preventDefault();
                    window.location.href = `/#${item.toLowerCase()}`;
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
                href={`/#${item.toLowerCase()}`}
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = `/#${item.toLowerCase()}`;
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

      {/* --- ABOUT CONTENT (Full Page) --- */}
      <AboutContent showWhoWeAre={true} scrollToId="history" />

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
