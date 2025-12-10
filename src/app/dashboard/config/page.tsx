'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface ConfigItem {
  id: string;
  key: string;
  value: any;
  description: string;
}

export default function ConfigPage() {
  const [configs, setConfigs] = useState<ConfigItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<ConfigItem>>({});

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('app_config')
        .select('*')
        .order('key', { ascending: true });

      if (error) throw error;
      setConfigs(data || []);
    } catch (error: any) {
      console.error('Error fetching configs:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: ConfigItem) => {
    setEditing(item.id);
    setFormData(item);
  };

  const handleSave = async () => {
    if (!editing) return;

    try {
      const { error } = await supabase
        .from('app_config')
        .update({
          value: typeof formData.value === 'string' 
            ? JSON.parse(formData.value) 
            : formData.value,
          description: formData.description,
        })
        .eq('id', editing);

      if (error) throw error;
      
      setEditing(null);
      setFormData({});
      fetchConfigs();
    } catch (error: any) {
      console.error('Error saving config:', error.message);
      alert('Error saving config: ' + error.message);
    }
  };

  const handleCreate = async () => {
    try {
      const { error } = await supabase
        .from('app_config')
        .insert([{
          key: formData.key || '',
          value: typeof formData.value === 'string' 
            ? JSON.parse(formData.value) 
            : formData.value || {},
          description: formData.description || '',
        }]);

      if (error) throw error;
      
      setFormData({});
      fetchConfigs();
    } catch (error: any) {
      console.error('Error creating config:', error.message);
      alert('Error creating config: ' + error.message);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-medium" style={{ color: '#111111' }}>App Configuration</h2>
        <button
          onClick={() => {
            setEditing('new');
            setFormData({});
          }}
          className="px-4 py-2 text-white rounded-lg font-medium"
          style={{ backgroundColor: '#B91C1C' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#991919'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#B91C1C'}
        >
          + Add Config
        </button>
      </div>

      {(editing === 'new' || editing) && (
        <div className="mb-6 p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4" style={{ color: '#111111' }}>
            {editing === 'new' ? 'Create New Config' : 'Edit Config'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>
                Key
              </label>
              <input
                type="text"
                value={formData.key || ''}
                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                disabled={editing !== 'new'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>
                Value (JSON)
              </label>
              <textarea
                value={typeof formData.value === 'string' 
                  ? formData.value 
                  : JSON.stringify(formData.value, null, 2)}
                onChange={(e) => {
                  try {
                    setFormData({ ...formData, value: JSON.parse(e.target.value) });
                  } catch {
                    setFormData({ ...formData, value: e.target.value });
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono"
                style={{ color: '#111111' }}
                rows={6}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>
                Description
              </label>
              <input
                type="text"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
        {configs.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-medium" style={{ color: '#111111' }}>{item.key}</h3>
                <p className="mt-1" style={{ color: '#666666' }}>{item.description}</p>
                <pre className="mt-2 p-3 bg-gray-50 rounded text-sm overflow-x-auto">
                  {JSON.stringify(item.value, null, 2)}
                </pre>
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

      {configs.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No configuration found. Create your first config item.
        </div>
      )}
    </div>
  );
}

