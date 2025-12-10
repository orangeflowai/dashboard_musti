'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface ContentItem {
  id: string;
  page: string;
  section: string;
  title: string;
  description: string;
  content: any;
  image_url: string;
  order_index: number;
  is_active: boolean;
}

export default function ContentPage() {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<ContentItem>>({});

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    try {
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .order('page', { ascending: true })
        .order('order_index', { ascending: true });

      if (error) throw error;
      setContents(data || []);
    } catch (error: any) {
      console.error('Error fetching contents:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: ContentItem) => {
    setEditing(item.id);
    setFormData(item);
  };

  const handleSave = async () => {
    if (!editing) return;

    try {
      const { error } = await supabase
        .from('content')
        .update(formData)
        .eq('id', editing);

      if (error) throw error;
      
      setEditing(null);
      setFormData({});
      fetchContents();
    } catch (error: any) {
      console.error('Error saving content:', error.message);
      alert('Error saving content: ' + error.message);
    }
  };

  const handleCreate = async () => {
    try {
      const { error } = await supabase
        .from('content')
        .insert([{
          page: formData.page || 'home',
          section: formData.section || 'default',
          title: formData.title || '',
          description: formData.description || '',
          content: formData.content || {},
        }]);

      if (error) throw error;
      
      setFormData({});
      fetchContents();
    } catch (error: any) {
      console.error('Error creating content:', error.message);
      alert('Error creating content: ' + error.message);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-medium" style={{ color: '#111111' }}>Content Management</h2>
        <button
          onClick={() => {
            setEditing('new');
            setFormData({ page: 'home', section: 'default' });
          }}
          className="px-4 py-2 text-white rounded-lg font-medium"
          style={{ backgroundColor: '#B91C1C' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#991919'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#B91C1C'}
        >
          + Add Content
        </button>
      </div>

      {(editing === 'new' || editing) && (
        <div className="mb-6 p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4" style={{ color: '#111111' }}>
            {editing === 'new' ? 'Create New Content' : 'Edit Content'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>
                Page
              </label>
              <input
                type="text"
                value={formData.page || ''}
                onChange={(e) => setFormData({ ...formData, page: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>
                Section
              </label>
              <input
                type="text"
                value={formData.section || ''}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                style={{ color: '#111111' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>
                Title
              </label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                style={{ color: '#111111' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>
                Description
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                style={{ color: '#111111' }}
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>
                Image URL
              </label>
              <input
                type="text"
                value={formData.image_url || ''}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="flex space-x-4">
              <button
                onClick={editing === 'new' ? handleCreate : handleSave}
                className="px-4 py-2 text-white rounded-lg font-medium"
                style={{ backgroundColor: '#B91C1C' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#991919'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#B91C1C'}
              >
                {editing === 'new' ? 'Create' : 'Save'}
              </button>
              <button
                onClick={() => {
                  setEditing(null);
                  setFormData({});
                }}
                className="px-4 py-2 rounded-lg font-medium"
                style={{ backgroundColor: '#E5E5E5', color: '#111111' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#D4D4D4'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#E5E5E5'}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {contents.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="px-2 py-1 text-xs rounded font-medium" style={{ backgroundColor: '#FEE2E2', color: '#B91C1C' }}>
                    {item.page}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                    {item.section}
                  </span>
                  {!item.is_active && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                      Inactive
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-medium" style={{ color: '#111111' }}>{item.title}</h3>
                <p className="mt-1" style={{ color: '#666666' }}>{item.description}</p>
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="mt-2 max-w-xs rounded"
                  />
                )}
              </div>
              <button
                onClick={() => handleEdit(item)}
                className="ml-4 px-4 py-2 text-white rounded-lg font-medium"
                style={{ backgroundColor: '#B91C1C' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#991919'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#B91C1C'}
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {contents.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No content found. Create your first content item.
        </div>
      )}
    </div>
  );
}

