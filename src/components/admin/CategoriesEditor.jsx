import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, Save, GripVertical, X } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Category Item Component
function SortableCategoryItem({ category, selectedCategory, setSelectedCategory, handleDeleteCategory }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border-2 rounded-lg p-4 cursor-pointer transition-colors relative ${
        selectedCategory?.id === category.id
          ? 'border-orange-500 bg-orange-50'
          : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={() => setSelectedCategory(category)}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical size={16} />
      </div>

      <div className="flex justify-between items-start mb-2 pl-6">
        <div className="flex-1">
          <h3 className="font-bold text-lg">{category.name}</h3>
          <p className="text-sm text-gray-500 mt-1">Slug: {category.slug}</p>
          {category.display_type && (
            <p className="text-xs text-gray-400 mt-1">
              Layout: {category.display_type === 'grid-2' ? 'Grid 2 cột' : category.display_type === 'grid-3' ? 'Grid 3 cột' : 'Grid 1 cột'}
            </p>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteCategory(category.id);
          }}
          className="text-red-500 hover:text-red-700 ml-2"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

export default function CategoriesEditor() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    slug: '',
    order_index: 0,
    display_type: 'grid-2' // grid-2, grid-3, grid-1
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('project_categories')
        .select('*')
        .order('order_index');
      
      if (error) {
        console.error('Error loading categories:', error);
        return;
      }
      
      if (data) {
        setCategories(data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleAddCategory = () => {
    setNewCategory({
      name: '',
      slug: '',
      order_index: categories.length,
      display_type: 'grid-2'
    });
    setSelectedCategory(null);
    setShowAddForm(true);
  };

  const handleSaveCategory = async () => {
    if (!newCategory.name || !newCategory.slug) {
      alert('Vui lòng điền tên và slug cho category');
      return;
    }

    // Validate slug format (lowercase, no spaces, only alphanumeric and hyphens)
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(newCategory.slug)) {
      alert('Slug chỉ được chứa chữ thường, số và dấu gạch ngang (ví dụ: interior, design-hub)');
      return;
    }

    // Check if slug already exists
    const existingCategory = categories.find(cat => cat.slug === newCategory.slug);
    if (existingCategory && (!selectedCategory || existingCategory.id !== selectedCategory.id)) {
      alert('Slug này đã tồn tại! Vui lòng chọn slug khác.');
      return;
    }

    try {
      setLoading(true);

      if (selectedCategory) {
        // Update existing
        const updateData = {
          name: newCategory.name,
          slug: newCategory.slug,
          order_index: newCategory.order_index,
          display_type: newCategory.display_type
        };
        
        const { error } = await supabase
          .from('project_categories')
          .update(updateData)
          .eq('id', selectedCategory.id);
        
        if (error) {
          // Nếu lỗi do display_type hoặc updated_at, thử lại không có các field đó
          if (error.message.includes('display_type') || error.message.includes('updated_at')) {
            const retryData = {
              name: newCategory.name,
              slug: newCategory.slug,
              order_index: newCategory.order_index
            };
            // Chỉ thêm display_type nếu không có lỗi về nó
            if (!error.message.includes('display_type')) {
              retryData.display_type = newCategory.display_type;
            }
            const { error: retryError } = await supabase
              .from('project_categories')
              .update(retryData)
              .eq('id', selectedCategory.id);
            if (retryError) throw retryError;
          } else {
            throw error;
          }
        }
      } else {
        // Insert new
        const insertData = {
          name: newCategory.name,
          slug: newCategory.slug,
          order_index: newCategory.order_index
        };
        
        // Chỉ thêm display_type nếu cột tồn tại
        try {
          insertData.display_type = newCategory.display_type;
        } catch (e) {
          // Ignore if column doesn't exist
        }
        
        const { error } = await supabase
          .from('project_categories')
          .insert(insertData);
        
        if (error) {
          // Nếu lỗi do display_type, thử lại không có display_type
          if (error.message.includes('display_type')) {
            delete insertData.display_type;
            const { error: retryError } = await supabase
              .from('project_categories')
              .insert(insertData);
            if (retryError) throw retryError;
          } else {
            throw error;
          }
        }
      }
      
      loadCategories();
      setSelectedCategory(null);
      setShowAddForm(false);
      setNewCategory({ name: '', slug: '', order_index: 0, display_type: 'grid-2' });
      alert('Đã lưu thành công!');
    } catch (error) {
      alert('Lỗi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!confirm('Bạn có chắc muốn xóa category này? Tất cả projects trong category này sẽ mất category.')) return;
    
    try {
      // First, set category_id to null for all projects in this category
      const { error: updateError } = await supabase
        .from('projects')
        .update({ category_id: null })
        .eq('category_id', categoryId);
      
      if (updateError) throw updateError;

      // Then delete the category
      const { error } = await supabase
        .from('project_categories')
        .delete()
        .eq('id', categoryId);
      
      if (error) throw error;
      
      loadCategories();
      setSelectedCategory(null);
    } catch (error) {
      alert('Lỗi: ' + error.message);
    }
  };

  // Sắp xếp categories theo order_index
  const sortedCategories = [...categories].sort((a, b) => {
    const orderA = a.order_index ?? 9999;
    const orderB = b.order_index ?? 9999;
    return orderA - orderB;
  });

  // Drag and Drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end
  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = sortedCategories.findIndex((c) => c.id === active.id);
    const newIndex = sortedCategories.findIndex((c) => c.id === over.id);

    const newOrderedCategories = arrayMove(sortedCategories, oldIndex, newIndex);

    // Update order_index cho tất cả categories
    try {
      const updatePromises = newOrderedCategories.map((category, index) => {
        return supabase
          .from('project_categories')
          .update({ order_index: index })
          .eq('id', category.id);
      });

      await Promise.all(updatePromises);
      
      // Reload categories để cập nhật UI
      await loadCategories();
    } catch (error) {
      console.error('Error updating category order:', error);
      alert('Lỗi khi cập nhật thứ tự: ' + error.message);
    }
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setNewCategory({
      name: category.name,
      slug: category.slug,
      order_index: category.order_index ?? 0,
      display_type: category.display_type || 'grid-2' // Fallback to grid-2 if not set
    });
    setShowAddForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quản lý Categories</h2>
        <button
          onClick={handleAddCategory}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
        >
          <Plus size={18} />
          Thêm Category
        </button>
      </div>

      {/* Categories List with Drag and Drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortedCategories.map(c => c.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedCategories.map(category => (
              <SortableCategoryItem
                key={category.id}
                category={category}
                selectedCategory={selectedCategory}
                setSelectedCategory={(cat) => handleEditCategory(cat)}
                handleDeleteCategory={handleDeleteCategory}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Category Editor Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">
                  {selectedCategory ? 'Chỉnh sửa Category' : 'Thêm Category Mới'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setSelectedCategory(null);
                    setNewCategory({ name: '', slug: '', order_index: 0, display_type: 'grid-2' });
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">Tên Category *</label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                    placeholder="Ví dụ: Interior"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium mb-2">Slug *</label>
                  <input
                    type="text"
                    value={newCategory.slug}
                    onChange={(e) => setNewCategory({...newCategory, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                    placeholder="Ví dụ: interior"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Chữ thường, không dấu, dùng dấu gạch ngang (ví dụ: interior, design-hub)</p>
                </div>

                {/* Display Type */}
                <div>
                  <label className="block text-sm font-medium mb-2">Kiểu trình bày *</label>
                  <select
                    value={newCategory.display_type}
                    onChange={(e) => setNewCategory({...newCategory, display_type: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="grid-2">Grid 2 cột (như INTERIOR, DESIGN HUB)</option>
                    <option value="grid-3">Grid 3 cột (như EXHIBITION, EVENTS)</option>
                    <option value="grid-1">Grid 1 cột (như PROJECT INSIGHTS)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Chọn kiểu trình bày cho category này</p>
                </div>

                {/* Order Index */}
                <div>
                  <label className="block text-sm font-medium mb-2">Thứ tự hiển thị</label>
                  <input
                    type="number"
                    value={newCategory.order_index}
                    onChange={(e) => setNewCategory({...newCategory, order_index: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Số nhỏ hơn sẽ hiển thị trước (có thể kéo thả để sắp xếp)</p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSaveCategory}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
                  >
                    <Save size={18} />
                    {loading ? 'Đang lưu...' : 'Lưu'}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setSelectedCategory(null);
                      setNewCategory({ name: '', slug: '', order_index: 0, display_type: 'grid-2' });
                    }}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
