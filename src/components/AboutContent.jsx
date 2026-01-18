import React from 'react';
import { motion } from 'framer-motion';
import { Box, Users, Lightbulb, Monitor, Megaphone, Target, Heart, Globe, Award, Flag, Ruler, PenTool, ArrowRight } from 'lucide-react';
import { useHistory } from '../hooks/useHistory';
import { useAboutImages } from '../hooks/useAboutImages';
import { useTrustedPartners } from '../hooks/useTrustedPartners';

// --- ABOUT CONTENT COMPONENT ---
export default function AboutContent({ showWhoWeAre = true, scrollToId = 'history' }) {
  const { history, loading } = useHistory();
  const { aboutImages, loading: imagesLoading } = useAboutImages();
  const { partners: trustedPartners, loading: partnersLoading } = useTrustedPartners();
  return (
    <>
      {/* --- WHO WE ARE SECTION --- */}
      {showWhoWeAre && (
        <section id="about" className="pt-40 pb-20 md:pt-48 md:pb-32 px-6 md:px-20 bg-white flex flex-col justify-center">
          <div className="max-w-7xl mx-auto w-full">
            <div className="max-w-5xl">
              <span className="bg-black text-white px-4 py-1 text-xs font-bold uppercase tracking-widest mb-8 inline-block">Who We Are</span>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                className="text-4xl md:text-6xl lg:text-7xl leading-tight font-light text-gray-800"
              >
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                  Our team holds <span className="font-serif italic font-bold">extensive expertise</span>
                </motion.div>
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="mt-4">
                  in delivering <span className="bg-black text-white px-3 py-1 font-bold transform -rotate-1 inline-block text-3xl md:text-4xl">High-Quality</span> work,
                </motion.div>
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="mt-12 pl-0 md:pl-12 border-l-0 md:border-l-4 border-orange-500 relative">
                  <p className="text-xl font-bold uppercase tracking-widest text-gray-400 mb-4">Seamlessly bridging the gap</p>
                  
                  <div className="relative z-20 flex flex-col md:flex-row items-baseline gap-6 text-5xl md:text-7xl font-black">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F39700] to-purple-600 inline-block pb-4">Design</span>
                    <span className="text-2xl font-serif italic font-normal text-gray-400 px-4">to</span>
                    <span className="text-black inline-block pb-4">Production</span>
                  </div>
                  
                  <div className="relative z-10 mt-16 flex flex-wrap gap-6 text-lg font-bold tracking-wide text-gray-600">
                    <span className="flex items-center gap-2"><Box size={20} className="text-orange-500"/> Interior</span>
                    <span className="flex items-center gap-2"><Lightbulb size={20} className="text-blue-500"/> Events</span>
                    <span className="flex items-center gap-2"><Users size={20} className="text-purple-500"/> Exhibition</span>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* --- CREATIVE JOURNEY: ZIGZAG PATHWAY --- */}
      <section id="history" className="py-20 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-20 mb-16">
          <div className="mb-20 text-center">
            <span className="text-sm font-bold uppercase tracking-widest text-gray-400 block mb-4">Our History</span>
            <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
              In Our Creative <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-purple-600">Design Journey</span>
            </h3>
          </div>

          <div className="relative">
            {/* Central Line for Desktop */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-[2px] bg-gray-200"></div>

            <div className="space-y-12 md:space-y-0">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
                  <p className="text-gray-500">Đang tải...</p>
                </div>
              ) : (
                history.map((item, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`md:flex justify-between items-center w-full ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
                >
                  {/* Content Side */}
                  <div className="md:w-5/12 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300 relative group">
                    {/* Arrow for Desktop */}
                    <div className={`hidden md:block absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rotate-45 border-b border-r border-gray-100 ${index % 2 === 0 ? '-left-2 border-l-0 border-t-0 border-b border-r' : '-right-2 border-r-0 border-b-0 border-l border-t'} z-10`}></div>
                    
                    <span className="text-5xl font-black text-gray-100 absolute top-4 right-6 select-none group-hover:text-orange-50 transition-colors">{item.year}</span>
                    <div className="relative z-10">
                      <span className="text-orange-500 font-bold text-sm uppercase tracking-widest mb-2 block">{item.year}</span>
                      <h4 className="text-2xl font-bold mb-3">{item.title}</h4>
                      <p className="text-gray-600 leading-relaxed text-sm">{item.desc}</p>
                    </div>
                  </div>

                  {/* Center Dot */}
                  <div className="hidden md:flex md:w-2/12 justify-center items-center relative">
                    <div className="w-6 h-6 bg-white border-4 border-black rounded-full z-10"></div>
                  </div>

                  {/* Empty Side for Balance */}
                  <div className="md:w-5/12"></div>
                </motion.div>
                ))
              )}
              
              {/* Future Node with Animated Effect */}
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="md:flex justify-between items-center w-full md:pt-12"
              >
                <div className="md:w-5/12 text-center md:text-right hidden md:block">
                  <span className="text-gray-400 text-sm uppercase tracking-widest">The journey continues...</span>
                </div>
                <div className="md:w-2/12 flex justify-center">
                  {/* Animated Flag Container */}
                  <motion.div 
                    animate={{ 
                      boxShadow: ["0 0 0px rgba(0,0,0,0)", "0 0 20px rgba(249, 115, 22, 0.6)", "0 0 0px rgba(0,0,0,0)"],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center z-10"
                  >
                    <Flag size={24} className="text-orange-500" />
                  </motion.div>
                </div>
                <div className="md:w-5/12 pl-8 md:pl-0 pt-4 md:pt-0">
                  <h4 className="text-xl font-bold">Future Vision</h4>
                  <p className="text-sm text-gray-500">Writing the next chapter.</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* --- VALUES & MISSION --- */}
      <section id="mission" className="py-20 bg-white text-black px-6 md:px-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
          
          {/* Values */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-8">
              <Heart className="text-orange-500 w-8 h-8" />
              <h3 className="text-2xl font-bold uppercase tracking-widest">Our Values</h3>
            </div>
            <div className="space-y-8 pl-4 border-l border-gray-300">
              <p className="text-2xl font-light text-gray-600">We desire to bring sustainable value:</p>
              
              <div className="group">
                <span className="text-sm font-bold text-orange-500 uppercase tracking-widest mb-1 block">Directly</span>
                <p className="text-xl font-bold text-black group-hover:pl-2 transition-all">For our own clients</p>
              </div>
              
              <div className="group">
                <span className="text-sm font-bold text-blue-500 uppercase tracking-widest mb-1 block">Indirectly</span>
                <p className="text-xl font-bold text-black group-hover:pl-2 transition-all">And even for our clients' customers</p>
              </div>
            </div>
          </motion.div>

          {/* Mission */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <Target className="text-blue-500 w-8 h-8" />
              <h3 className="text-2xl font-bold uppercase tracking-widest">Our Mission</h3>
            </div>
            <p className="text-gray-600 leading-relaxed text-lg mb-8">
              Providing comprehensive marketing solutions, covering every step of the journey:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: Monitor, label: 'Market Research', color: 'text-blue-500', bgColor: 'bg-blue-50' },
                { icon: Megaphone, label: 'Brand Strategy', color: 'text-purple-500', bgColor: 'bg-purple-50' },
                { icon: PenTool, label: 'Design', color: 'text-pink-500', bgColor: 'bg-pink-50' },
                { icon: Box, label: 'Production', color: 'text-orange-500', bgColor: 'bg-orange-50' },
                { icon: Lightbulb, label: 'Event Planning', color: 'text-yellow-500', bgColor: 'bg-yellow-50' },
                { icon: Users, label: 'Exhibition', color: 'text-indigo-500', bgColor: 'bg-indigo-50' },
                { icon: Ruler, label: 'Project Management', color: 'text-green-500', bgColor: 'bg-green-50' }
              ].map((item, i) => (
                <div key={i} className={`flex items-center gap-3 text-black p-3 ${item.bgColor} rounded-lg hover:shadow-md transition-all border border-transparent hover:border-gray-200`}>
                  <item.icon size={18} className={item.color} />
                  <span className="font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- STRATEGIC GOALS --- */}
      <section className="py-20 px-6 md:px-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold uppercase tracking-widest mb-4">Strategic Goals</h3>
            <div className="w-20 h-1 bg-black mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Goal 1 */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="p-8 border border-black/10 rounded-2xl hover:border-black transition-colors"
            >
              <div className="text-6xl font-black text-gray-200 mb-6">01</div>
              <h4 className="text-xl font-bold mb-4 flex items-center gap-2"><Award className="w-5 h-5"/> One-Stop Shop</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Providing full-package services from A to Z: from market research to understand target customers, to design, showroom construction, events, and exhibitions.
              </p>
            </motion.div>

            {/* Goal 2 */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="p-8 border border-black/10 rounded-2xl hover:border-black transition-colors"
            >
              <div className="text-6xl font-black text-gray-200 mb-6">02</div>
              <h4 className="text-xl font-bold mb-4 flex items-center gap-2"><Heart className="w-5 h-5"/> Customer Value</h4>
              <ul className="space-y-2 text-gray-600 text-sm list-disc pl-4">
                <li>Listen & Understand customers</li>
                <li>Deliver clear value proposition</li>
                <li>Optimize costs to save resources</li>
                <li>Build trusted, long-term relationships</li>
              </ul>
            </motion.div>

            {/* Goal 3 */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="p-8 border border-black/10 rounded-2xl hover:border-black transition-colors"
            >
              <div className="text-6xl font-black text-gray-200 mb-6">03</div>
              <h4 className="text-xl font-bold mb-4 flex items-center gap-2"><Globe className="w-5 h-5"/> Regional Expansion</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Providing high-quality services not only within the domestic market but also expanding to neighboring regions, aiming for international standards.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- OUR CLIENTS --- */}
      <section className="py-20 px-6 md:px-20 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-gray-500 mb-2">TRUSTED BY INDUSTRY LEADERS</p>
            <h3 className="text-5xl md:text-6xl font-bold uppercase tracking-tight mb-4">OUR CLIENTS</h3>
            <div className="w-20 h-1 bg-black mx-auto"></div>
          </div>

          {partnersLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
              <p className="text-gray-500">Đang tải...</p>
            </div>
          ) : trustedPartners.length > 0 ? (
            <div className="grid grid-cols-3 md:grid-cols-6 gap-8 md:gap-12 mb-16">
              {trustedPartners.map((partner, index) => (
                <motion.div
                  key={partner.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="flex items-center justify-center h-16 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
                >
                  {partner.logo_url ? (
                    <img 
                      src={partner.logo_url} 
                      alt={partner.name} 
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-gray-400 font-medium text-sm">{partner.name}</span>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <p>Chưa có Trusted Partners</p>
              <p className="text-sm mt-2">Vui lòng thêm trong Admin → Trusted Partners</p>
            </div>
          )}

          {/* Hình ảnh từ Admin */}
          {aboutImages.image_url && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mt-16 w-full"
            >
              <img 
                src={aboutImages.image_url} 
                alt={aboutImages.title || 'Our Clients'} 
                className="w-full h-auto object-contain rounded-lg"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </motion.div>
          )}
        </div>
      </section>
    </>
  );
}
