import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, Save, CheckCircle } from 'lucide-react';

export default function HistoryEditor() {
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('history')
        .select('*')
        .order('order_index');
      
      if (error) {
        console.error('Error loading history:', error);
        return;
      }
      
      if (data) {
        setHistoryItems(data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleAdd = () => {
    setHistoryItems([...historyItems, {
      id: `temp-${Date.now()}`,
      year: '',
      title: '',
      description: '',
      order_index: historyItems.length
    }]);
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa mục này?')) return;
    
    if (id.startsWith('temp-')) {
      setHistoryItems(historyItems.filter(item => item.id !== id));
      return;
    }
    
    try {
      const { error } = await supabase
        .from('history')
        .delete()
        .eq('id', id);
      
      if (error) {
        alert('Lỗi: ' + error.message);
      } else {
        loadHistory();
      }
    } catch (error) {
      alert('Lỗi: ' + error.message);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);
    
    try {
      // Xóa tất cả items cũ (nếu cần)
      // Hoặc update/insert từng item
      
      for (const item of historyItems) {
        if (item.id.startsWith('temp-')) {
          // Insert new item
          const { error } = await supabase
            .from('history')
            .insert({
              year: item.year,
              title: item.title,
              description: item.description,
              order_index: item.order_index
            });
          
          if (error) throw error;
        } else {
          // Update existing item
          const { error } = await supabase
            .from('history')
            .update({
              year: item.year,
              title: item.title,
              description: item.description,
              order_index: item.order_index,
              updated_at: new Date().toISOString()
            })
            .eq('id', item.id);
          
          if (error) throw error;
        }
      }
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      loadHistory();
    } catch (error) {
      alert('Lỗi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateItem = (index, field, value) => {
    const updated = [...historyItems];
    updated[index][field] = value;
    setHistoryItems(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Chỉnh sửa Our History</h2>
        <div className="flex items-center gap-4">
          {saved && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle size={20} />
              <span className="text-sm">Đã lưu thành công!</span>
            </div>
          )}
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Plus size={18} />
            Thêm mới
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        {historyItems.map((item, index) => (
          <div key={item.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm text-gray-500 font-medium">#{index + 1}</span>
              <button
                onClick={() => handleDelete(item.id)}
                className="text-red-500 hover:text-red-700 transition-colors"
                title="Xóa"
              >
                <Trash2 size={18} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Year</label>
                <input
                  type="text"
                  value={item.year}
                  onChange={(e) => updateItem(index, 'year', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="2017"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => updateItem(index, 'title', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="Establishment"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={item.description}
                  onChange={(e) => updateItem(index, 'description', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  rows="3"
                  placeholder="Founded Pro-Hub..."
                />
              </div>
            </div>
          </div>
        ))}
        
        {historyItems.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Chưa có mục nào. Click "Thêm mới" để bắt đầu.
          </div>
        )}
      </div>
      
      <button
        onClick={handleSave}
        disabled={loading || historyItems.length === 0}
        className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Save size={18} />
        {loading ? 'Đang lưu...' : 'Lưu tất cả'}
      </button>
    </div>
  );
}
