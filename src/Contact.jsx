import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Menu, X, ArrowUpRight, Check } from 'lucide-react';

const Reveal = ({ children, delay = 0 }) => (
  <div className="overflow-hidden">
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  </div>
);

export default function Contact() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [copied, setCopied] = useState({ email: false, phone: false });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied({ ...copied, [type]: true });
      setToastMessage(type === 'email' ? 'Email copied!' : 'Phone number copied!');
      setShowToast(true);
      setTimeout(() => {
        setCopied({ ...copied, [type]: false });
        setShowToast(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="bg-white text-black font-sans selection:bg-black selection:text-white min-h-screen flex flex-col justify-between overflow-hidden">
      
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
      <nav className="fixed top-0 left-0 w-full z-50 px-6 py-6 flex justify-between items-center bg-white/90 backdrop-blur-md border-b border-gray-100">
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
                  item === 'Contact' ? (
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
                  ) : item === 'About' ? (
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
                  ) : null
               ))}
            </motion.div>
        )}

        <div className="hidden md:flex gap-8 text-sm font-bold uppercase tracking-widest">
            {['About', 'Projects', 'Contact'].map((item) => (
                item === 'Contact' ? (
                  <Link 
                    key={item} 
                    to="/contact"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
                    className="hover:text-gray-500 transition-colors relative group"
                  >
                    {item}
                    <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-black transition-all group-hover:w-full"></span>
                  </Link>
                ) : item === 'About' ? (
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
                ) : null
            ))}
        </div>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-grow pt-32 px-6 md:px-12 pb-12 flex flex-col justify-center">
         <div className="max-w-[1600px] mx-auto w-full">
            
            {/* Header Title */}
            <div className="mb-12 md:mb-16">
               <h1 className="text-[6vw] md:text-[5vw] leading-[0.9] font-black tracking-tighter mb-2">
                  <Reveal>LET'S START</Reveal>
               </h1>
               <h1 className="text-[6vw] md:text-[5vw] leading-[0.9] font-black tracking-tighter text-gray-300">
                  <Reveal delay={0.1}>SOMETHING NEW</Reveal>
               </h1>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 border-t border-black">
               
               {/* Column 1: General Info */}
               <div className="md:col-span-4 border-r border-black/10 pt-8 pr-8 pb-12">
                  <Reveal delay={0.2}>
                     <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 block mb-6">Connect</span>
                     <p className="text-lg font-medium leading-relaxed max-w-sm">
                        We are always looking for new challenges and interesting partners. Also, we love good coffee.
                     </p>
                  </Reveal>
               </div>

               {/* Column 2: Emails & Phones */}
               <div className="md:col-span-4 border-r border-black/10 pt-8 px-0 md:px-8 pb-12">
                  <Reveal delay={0.3}>
                     <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 block mb-6">Contact</span>
                     
                     <div className="mb-8 group">
                        <label className="text-sm font-bold block mb-1">Email</label>
                        <button
                           onClick={() => copyToClipboard('vannhi@pro-hub.com.vn', 'email')}
                           className="text-xl md:text-2xl font-bold flex items-center gap-2 hover:text-orange-600 transition-colors cursor-pointer"
                        >
                           vannhi@pro-hub.com.vn 
                           {copied.email ? (
                              <Check className="text-green-600" size={20} />
                           ) : (
                              <ArrowUpRight className="opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
                           )}
                        </button>
                     </div>

                     <div className="group">
                        <label className="text-sm font-bold block mb-1">Hotline</label>
                        <button
                           onClick={() => copyToClipboard('+84908583042', 'phone')}
                           className="text-xl md:text-2xl font-bold flex items-center gap-2 hover:text-orange-600 transition-colors cursor-pointer"
                        >
                           (+84) 908 583 042 
                           {copied.phone ? (
                              <Check className="text-green-600" size={20} />
                           ) : (
                              <ArrowUpRight className="opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
                           )}
                        </button>
                     </div>
                  </Reveal>
               </div>

               {/* Column 3: Addresses */}
               <div className="md:col-span-4 pt-8 pl-0 md:pl-8 pb-12">
                  <Reveal delay={0.4}>
                     <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 block mb-6">Visit Us</span>
                     
                     <div className="mb-8">
                        <h4 className="text-lg font-bold mb-2 flex items-center gap-2"><MapPin size={16}/> Business registration</h4>
                        <p className="text-gray-600 leading-relaxed">
                           No 5, B12, TT51, Cam Hoi, Dong Nhan,<br/> Hai Ba Trung, Hanoi
                        </p>
                     </div>

                     <div>
                        <h4 className="text-lg font-bold mb-2 flex items-center gap-2"><MapPin size={16}/> Office</h4>
                        <p className="text-gray-600 leading-relaxed">
                           Floor 4, MindX, 505 Minh Khai, Vinh Tuy,<br/> Hai Ba Trung, Hanoi
                        </p>
                     </div>
                  </Reveal>
               </div>

            </div>
         </div>
      </main>

      {/* --- BIG FOOTER TEXT --- */}
      <div className="w-full overflow-hidden border-t border-gray-100 py-4 bg-gray-50">
         <motion.div 
            className="whitespace-nowrap flex gap-10 text-[10vw] md:text-[5vw] font-black text-gray-100 uppercase leading-none select-none"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
         >
            <span>Prohub Vietnam</span>
            <span>—</span>
            <span>Interior</span>
            <span>—</span>
            <span>Events</span>
            <span>—</span>
            <span>Exhibition</span>
            <span>—</span>
            <span>Prohub Vietnam</span>
            <span>—</span>
            <span>Interior</span>
            <span>—</span>
            <span>Events</span>
            <span>—</span>
            <span>Exhibition</span>
         </motion.div>
      </div>
    </div>
  );
}
