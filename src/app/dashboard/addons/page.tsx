'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/utils/currency';

interface Addon {
  id: string;
  menu_item_id: string;
  name: string;
  description: string;
  price: number;
  is_required: boolean;
  max_selections: number | null;
  order_index: number;
  is_active: boolean;
}

interface AddonOption {
  id: string;
  addon_id: string;
  name: string;
  price: number;
  order_index: number;
  is_active: boolean;
}

interface Category {
  id: string;
  name: string;
}

export default function AddonsPage() {
  const [addons, setAddons] = useState<Addon[]>([]);
  const [addonOptions, setAddonOptions] = useState<AddonOption[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [editingAddon, setEditingAddon] = useState<Addon | null>(null);
  const [selectedAddon, setSelectedAddon] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Addon>>({
    menu_item_id: '',
    name: '',
    description: '',
    price: 0,
    is_required: false,
    max_selections: undefined,
    order_index: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchAddons();
    fetchMenuItems();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategoryFilter) {
      const category = categories.find(c => c.id === selectedCategoryFilter);
      fetchMenuItems(category?.name);
    } else {
      fetchMenuItems();
    }
  }, [selectedCategoryFilter, categories]);

  const fetchAddons = async () => {
    try {
      const { data, error } = await supabase
        .from('addons')
        .select(`
          *,
          menu_items(id, name, category, restaurant_id, restaurants(name))
        `)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setAddons(data || []);
    } catch (error) {
      console.error('Error fetching addons:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async (categoryName?: string) => {
    try {
      let query = supabase
        .from('menu_items')
        .select('id, name, category, restaurant_id, restaurants(name)')
        .order('name');
      
      if (categoryName) {
        query = query.eq('category', categoryName);
      }
      
      const { data } = await query;
      setMenuItems(data || []);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchAddonOptions = async (addonId: string) => {
    try {
      const { data } = await supabase
        .from('addon_options')
        .select('*')
        .eq('addon_id', addonId)
        .order('order_index');
      setAddonOptions(data || []);
    } catch (error) {
      console.error('Error fetching addon options:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAddon) {
        const { error } = await supabase
          .from('addons')
          .update(formData)
          .eq('id', editingAddon.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('addons')
          .insert([formData]);
        if (error) throw error;
      }
      await fetchAddons();
      setShowModal(false);
      setEditingAddon(null);
      resetForm();
    } catch (error) {
      console.error('Error saving addon:', error);
      alert('Error saving addon');
    }
  };

  const resetForm = () => {
    setFormData({
      menu_item_id: '',
      name: '',
      description: '',
      price: 0,
      is_required: false,
      max_selections: undefined,
      order_index: 0,
      is_active: true,
    });
  };

  const handleEdit = (addon: Addon) => {
    setEditingAddon(addon);
    setFormData(addon);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this addon?')) return;
    try {
      const { error } = await supabase
        .from('addons')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await fetchAddons();
    } catch (error) {
      console.error('Error deleting addon:', error);
      alert('Error deleting addon');
    }
  };

  const handleManageOptions = (addonId: string) => {
    setSelectedAddon(addonId);
    fetchAddonOptions(addonId);
    setShowOptionsModal(true);
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-medium" style={{ color: '#111111' }}>Addons</h2>
        <button
          onClick={() => {
            setEditingAddon(null);
            resetForm();
            setShowModal(true);
          }}
          className="px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          + Add Addon
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Menu Item</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Required</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {addons.map((addon) => {
              const menuItem = (addon as any).menu_items || menuItems.find(m => m.id === addon.menu_item_id);
              return (
                <tr key={addon.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium" style={{ color: '#111111' }}>{addon.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {menuItem?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {menuItem?.category || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatPrice(addon.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {addon.is_required ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Required</span>
                    ) : (
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Optional</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      addon.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {addon.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(addon)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleManageOptions(addon.id)}
                      className="text-green-600 hover:text-green-900 mr-4"
                    >
                      Options
                    </button>
                    <button
                      onClick={() => handleDelete(addon.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-medium" style={{ color: '#111111' }}>
                {editingAddon ? 'Edit Addon' : 'Add Addon'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setEditingAddon(null);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="category-filter" className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>Filter by Category (Optional)</label>
                <select
                  id="category-filter"
                  name="category-filter"
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="menu-item" className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>Menu Item</label>
                <select
                  id="menu-item"
                  name="menu-item"
                  required
                  value={formData.menu_item_id}
                  onChange={(e) => setFormData({ ...formData, menu_item_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                >
                  <option value="">Select Menu Item</option>
                  {menuItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.category || 'No Category'}) - {item.restaurants?.name || ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="addon-name" className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>Name</label>
                <input
                  id="addon-name"
                  name="name"
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                />
              </div>
              <div>
                <label htmlFor="addon-description" className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>Description</label>
                <textarea
                  id="addon-description"
                  name="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="addon-price" className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>Price</label>
                  <input
                    id="addon-price"
                    name="price"
                    type="number"
                    step="0.01"
                    required
                    value={formData.price || 0}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                  />
                </div>
                <div>
                  <label htmlFor="addon-max-selections" className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>Max Selections</label>
                  <input
                    id="addon-max-selections"
                    name="max_selections"
                    type="number"
                    value={formData.max_selections || ''}
                    onChange={(e) => setFormData({ ...formData, max_selections: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                    placeholder="Unlimited"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_required}
                    onChange={(e) => setFormData({ ...formData, is_required: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm" style={{ color: '#111111' }}>Required</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm" style={{ color: '#111111' }}>Active</span>
                </label>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingAddon(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-900 bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {editingAddon ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showOptionsModal && selectedAddon && (
        <AddonOptionsModal
          addonId={selectedAddon}
          options={addonOptions}
          onClose={() => {
            setShowOptionsModal(false);
            setSelectedAddon(null);
          }}
          onRefresh={fetchAddonOptions}
        />
      )}
    </div>
  );
}

function AddonOptionsModal({ addonId, options, onClose, onRefresh }: any) {
  const [formData, setFormData] = useState({ name: '', price: 0, order_index: 0 });
  const [editingOption, setEditingOption] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingOption) {
        await supabase
          .from('addon_options')
          .update(formData)
          .eq('id', editingOption.id);
      } else {
        await supabase
          .from('addon_options')
          .insert([{ ...formData, addon_id: addonId }]);
      }
      onRefresh(addonId);
      setFormData({ name: '', price: 0, order_index: 0 });
      setEditingOption(null);
    } catch (error) {
      console.error('Error saving option:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this option?')) return;
    await supabase.from('addon_options').delete().eq('id', id);
    onRefresh(addonId);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-medium" style={{ color: '#111111' }}>Addon Options</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div className="grid grid-cols-3 gap-4">
            <input
              type="text"
              required
              placeholder="Option name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
            />
            <input
              type="number"
              step="0.01"
              required
              placeholder="Price"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
            />
            <div className="flex space-x-2">
              <button type="submit" className="px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50">
                {editingOption ? 'Update' : 'Add'}
              </button>
              {editingOption && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingOption(null);
                    setFormData({ name: '', price: 0, order_index: 0 });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </form>
        <div className="space-y-2">
          {options.map((option: any) => (
            <div key={option.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <span className="font-medium">{option.name}</span>
                <span className="ml-2 text-gray-500">{formatPrice(option.price)}</span>
              </div>
              <div>
                <button
                  onClick={() => {
                    setEditingOption(option);
                    setFormData(option);
                  }}
                  className="text-blue-600 mr-4"
                >
                  Edit
                </button>
                <button onClick={() => handleDelete(option.id)} className="text-red-600">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

