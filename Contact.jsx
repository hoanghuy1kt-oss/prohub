import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Menu, X, ArrowUpRight, Facebook, Linkedin, Instagram } from 'lucide-react';

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

export default function ProhubContactPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="bg-white text-black font-sans selection:bg-black selection:text-white min-h-screen flex flex-col justify-between overflow-hidden">
      
      {/* --- NAVIGATION --- */}
      <nav className="fixed top-0 left-0 w-full z-50 px-6 py-6 flex justify-between items-center bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="text-2xl font-black tracking-tighter cursor-pointer z-50">PROHUB.</div>
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
               {['About', 'Services', 'Projects', 'Contact'].map((item) => (
                  <a key={item} href="#" className="text-xl font-bold uppercase tracking-widest">
                      {item}
                  </a>
               ))}
            </motion.div>
        )}

        <div className="hidden md:flex gap-8 text-sm font-bold uppercase tracking-widest">
            {['About', 'Services', 'Projects', 'Contact'].map((item) => (
                <a key={item} href="#" className="hover:text-gray-500 transition-colors relative group">
                    {item}
                    <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-black transition-all group-hover:w-full"></span>
                </a>
            ))}
        </div>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-grow pt-32 px-6 md:px-12 pb-12 flex flex-col justify-center">
         <div className="max-w-[1600px] mx-auto w-full">
            
            {/* Header Title */}
            <div className="mb-20 md:mb-32">
               <h1 className="text-[12vw] leading-[0.85] font-black tracking-tighter mb-4">
                  <Reveal>LET'S START</Reveal>
               </h1>
               <h1 className="text-[12vw] leading-[0.85] font-black tracking-tighter text-gray-300">
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
                     
                     <div className="flex gap-6 mt-12">
                        <a href="#" className="hover:scale-110 transition-transform"><Facebook size={24}/></a>
                        <a href="#" className="hover:scale-110 transition-transform"><Linkedin size={24}/></a>
                        <a href="#" className="hover:scale-110 transition-transform"><Instagram size={24}/></a>
                     </div>
                  </Reveal>
               </div>

               {/* Column 2: Emails & Phones */}
               <div className="md:col-span-4 border-r border-black/10 pt-8 px-0 md:px-8 pb-12">
                  <Reveal delay={0.3}>
                     <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 block mb-6">Contact</span>
                     
                     <div className="mb-8 group">
                        <label className="text-sm font-bold block mb-1">Email</label>
                        <a href="mailto:vannhi@pro-hub.com.vn" className="text-2xl md:text-3xl font-bold flex items-center gap-2 hover:text-orange-600 transition-colors">
                           vannhi@pro-hub.com.vn <ArrowUpRight className="opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
                        </a>
                     </div>

                     <div className="group">
                        <label className="text-sm font-bold block mb-1">Hotline</label>
                        <a href="tel:+84908583042" className="text-2xl md:text-3xl font-bold flex items-center gap-2 hover:text-orange-600 transition-colors">
                           (+84) 908 583 042 <ArrowUpRight className="opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
                        </a>
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