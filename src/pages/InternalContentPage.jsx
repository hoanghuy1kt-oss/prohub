import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function InternalContentPage() {
  const { filename } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAndRenderContent();
  }, [filename]);

  const loadAndRenderContent = async () => {
    try {
      setLoading(true);
      
      // Fetch file từ public folder
      const response = await fetch(`/internal-content/${filename}`);
      if (!response.ok) {
        setError(`File not found: ${filename}`);
        setLoading(false);
        return;
      }

      const code = await response.text();
      
      // Tạo HTML page với tất cả dependencies
      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Internal Content</title>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://unpkg.com/react-router-dom@6/dist/umd/react-router-dom.production.min.js"></script>
  <script src="https://unpkg.com/framer-motion@10/dist/framer-motion.umd.js"></script>
  <script src="https://unpkg.com/lucide-react@0.294/dist/umd/lucide-react.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', system-ui, -apple-system, sans-serif; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script>
    // Wait for all dependencies to load
    window.addEventListener('load', function() {
      // Map dependencies to window
      window.React = React;
      window.ReactDOM = ReactDOM;
      
      // Framer Motion - check multiple possible names
      if (typeof FramerMotion !== 'undefined') {
        window.FramerMotion = FramerMotion;
      } else if (typeof Motion !== 'undefined') {
        window.FramerMotion = Motion;
      } else if (typeof window.framerMotion !== 'undefined') {
        window.FramerMotion = window.framerMotion;
      } else {
        // Try to find it in global scope
        const fm = window.framerMotion || window.FramerMotion || window.Motion;
        if (fm) {
          window.FramerMotion = fm;
        } else {
          console.warn('FramerMotion not found, trying alternative...');
          // Load alternative
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/framer-motion@10/dist/framer-motion.umd.js';
          script.onload = function() {
            window.FramerMotion = window.FramerMotion || window.Motion || window.framerMotion;
            initApp();
          };
          document.head.appendChild(script);
          return;
        }
      }
      
      // React Router DOM
      if (typeof ReactRouterDOM !== 'undefined') {
        window.ReactRouterDOM = ReactRouterDOM;
      } else if (typeof ReactRouter !== 'undefined') {
        window.ReactRouterDOM = ReactRouter;
      } else {
        console.warn('ReactRouterDOM not found');
      }
      
      // Lucide React
      if (typeof LucideReact !== 'undefined') {
        window.LucideReact = LucideReact;
      } else if (typeof lucideReact !== 'undefined') {
        window.LucideReact = lucideReact;
      } else if (typeof window.lucide !== 'undefined') {
        window.LucideReact = window.lucide;
      }
      
      // Transform code - remove imports and exports
      let code = ${JSON.stringify(code)};
      
      // Remove all import statements
      code = code.replace(/import\\s+React[^;]+;?\\s*/g, '');
      code = code.replace(/import\\s+\\{[^}]+\\}\\s+from\\s+['"][^'"]+['"];?\\s*/g, '');
      
      // Remove export default
      code = code.replace(/export\\s+default\\s+App;?\\s*/g, '');
      
      // Add dependencies at the beginning
      const transformedCode = \`
        const React = window.React;
        const { useState, useEffect, useRef } = React;
        const { motion, useScroll, useTransform, useInView, AnimatePresence } = window.FramerMotion;
        const { BrowserRouter, Link } = window.ReactRouterDOM;
        const { 
          ArrowRight, ArrowDown, MapPin, Menu, X, 
          CheckCircle2, Globe, Box, Mail, Phone,
          Quote, Ruler, AlertTriangle, Lightbulb, Check, ChevronRight,
          ShieldCheck, Users, ScanLine, FileText, Layers, Target, RefreshCw, Star, Award, Calendar
        } = window.LucideReact;
        
        \${code}
      \`;
      
      // Execute with Babel
      const script = document.createElement('script');
      script.type = 'text/babel';
      script.setAttribute('data-presets', 'react');
      script.textContent = transformedCode;
      
      script.onerror = function(err) {
        console.error('Babel compilation error:', err);
        document.getElementById('root').innerHTML = '<div style="padding: 20px; text-align: center; color: red;"><h2>Compilation Error</h2><p>Please check console for details.</p></div>';
      };
      
      document.body.appendChild(script);
      
      // Function to render app
      function initApp() {
        try {
          const AppComponent = typeof App !== 'undefined' ? App : null;
          
          if (!window.React || !window.ReactDOM) {
            console.error('React or ReactDOM not loaded');
            return;
          }
          
          if (AppComponent) {
            // Use ReactRouterDOM if available, otherwise render without router
            if (window.ReactRouterDOM && window.ReactRouterDOM.BrowserRouter) {
              const { BrowserRouter } = window.ReactRouterDOM;
              const root = window.ReactDOM.createRoot(document.getElementById('root'));
              root.render(
                window.React.createElement(BrowserRouter, null,
                  window.React.createElement(AppComponent)
                )
              );
            } else {
              // Render without router if ReactRouterDOM not available
              const root = window.ReactDOM.createRoot(document.getElementById('root'));
              root.render(
                window.React.createElement(AppComponent)
              );
            }
          } else {
            document.getElementById('root').innerHTML = '<div style="padding: 20px; text-align: center; color: red;">Error: Component "App" not found.</div>';
            console.error('App component not found. Available globals:', Object.keys(window).filter(k => k.includes('React') || k.includes('Motion') || k.includes('Lucide')));
          }
        } catch (err) {
          console.error('Render error:', err);
          document.getElementById('root').innerHTML = '<div style="padding: 20px; text-align: center; color: red;"><h2>Render Error</h2><p>' + err.message + '</p><pre style="text-align: left; margin-top: 20px; background: #f5f5f5; padding: 10px; border-radius: 4px; overflow: auto; max-height: 300px;">' + err.stack + '</pre></div>';
        }
      }
      
      // Wait for Babel to compile, then render
      setTimeout(initApp, 1500);
    });
  </script>
</body>
</html>`;
      
      // Tạo blob và load trong iframe
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      // Load trong iframe
      const iframe = document.createElement('iframe');
      iframe.src = url;
      iframe.className = 'w-full h-screen border-0';
      iframe.style.cssText = 'width: 100%; height: 100vh; display: block;';
      iframe.title = 'Internal Content';
      
      const container = document.getElementById('internal-content-container');
      if (container) {
        container.innerHTML = '';
        container.appendChild(iframe);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error loading Internal Content:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải Internal Content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/projects')}
            className="px-6 py-3 bg-black text-white rounded-lg"
          >
            Quay lại Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="internal-content-container" className="w-full h-screen">
      {/* Iframe will be inserted here */}
    </div>
  );
}
