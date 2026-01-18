import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    
    // Tự động refresh mỗi 3 giây để cập nhật khi Admin thay đổi
    const interval = setInterval(() => {
      loadData();
    }, 3000); // 3 giây - nhanh hơn
    
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      // Load categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('project_categories')
        .select('*')
        .order('order_index');

      if (categoriesError) {
        console.error('Error loading categories:', categoriesError);
      } else if (categoriesData) {
        setCategories(categoriesData);
      }

      // Load projects with internal_content relation
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*, project_categories(*), internal_content(*)')
        .order('order_index');

      if (projectsError) {
        console.error('Error loading projects:', projectsError);
      } else if (projectsData) {
        setProjects(projectsData);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group projects by category slug
  const getProjectsByCategory = (categorySlug) => {
    const category = categories.find(cat => cat.slug === categorySlug);
    if (!category) return [];
    return projects
      .filter(p => p.category_id === category.id)
      .sort((a, b) => {
        const orderA = a.order_index ?? 9999;
        const orderB = b.order_index ?? 9999;
        return orderA - orderB;
      });
  };

  return {
    projects,
    categories,
    loading,
    getProjectsByCategory,
    refresh: loadData
  };
}
