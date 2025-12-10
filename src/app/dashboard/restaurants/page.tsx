'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import ImageUpload from '@/components/ImageUpload';
import { formatPrice } from '@/utils/currency';

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  cover_image_url: string;
  rating: number;
  review_count: number;
  delivery_time_min: number;
  delivery_fee: number;
  minimum_order: number;
  category_id: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  is_featured: boolean;
  is_active: boolean;
}

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [formData, setFormData] = useState<Partial<Restaurant>>({
    name: '',
    slug: '',
    description: '',
    image_url: '',
    cover_image_url: '',
    rating: 0,
    review_count: 0,
    delivery_time_min: 30,
    delivery_fee: 0,
    minimum_order: 0,
    category_id: '',
    address: '',
    latitude: undefined,
    longitude: undefined,
    phone: '',
    is_featured: false,
    is_active: true,
  });


  useEffect(() => {
    fetchRestaurants();
    fetchCategories();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRestaurants(data || []);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Prepare data: convert empty strings to null for optional fields, set defaults
      const submitData: any = {
        name: formData.name?.trim() || '',
        slug: formData.slug?.trim() || formData.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || '',
        description: formData.description?.trim() || null,
        image_url: formData.image_url?.trim() || null,
        cover_image_url: formData.cover_image_url?.trim() || null,
        rating: formData.rating || 0,
        review_count: formData.review_count || 0,
        delivery_time_min: Number(formData.delivery_time_min) || 30,
        delivery_fee: Number(formData.delivery_fee) || 0,
        minimum_order: Number(formData.minimum_order) || 0,
        category_id: formData.category_id?.trim() || null,
        address: formData.address?.trim() || null,
        latitude: formData.latitude ? Number(formData.latitude) : null,
        longitude: formData.longitude ? Number(formData.longitude) : null,
        phone: formData.phone?.trim() || null,
        is_featured: formData.is_featured || false,
        is_active: formData.is_active !== undefined ? formData.is_active : true,
      };

      // Remove null/undefined values for update to avoid overwriting with null
      if (editingRestaurant) {
        const updateData: any = {};
        Object.keys(submitData).forEach(key => {
          if (submitData[key] !== null && submitData[key] !== undefined && submitData[key] !== '') {
            updateData[key] = submitData[key];
          }
        });
        const { error } = await supabase
          .from('restaurants')
          .update(updateData)
          .eq('id', editingRestaurant.id);
        if (error) throw error;
      } else {
        // For insert, ensure required fields are present
        if (!submitData.name || !submitData.slug) {
          throw new Error('Name and slug are required');
        }
        const { error } = await supabase
          .from('restaurants')
          .insert([submitData]);
        if (error) throw error;
      }
      await fetchRestaurants();
      setShowModal(false);
      setEditingRestaurant(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        image_url: '',
        cover_image_url: '',
        rating: 0,
        review_count: 0,
        delivery_time_min: 30,
        delivery_fee: 0,
        minimum_order: 0,
        category_id: '',
        address: '',
        latitude: undefined,
        longitude: undefined,
        phone: '',
        is_featured: false,
        is_active: true,
      });
      alert(editingRestaurant ? 'Restaurant updated successfully!' : 'Restaurant created successfully!');
    } catch (error: any) {
      console.error('Error saving restaurant:', error);
      const errorMessage = error?.message || error?.details || 'Error saving restaurant';
      alert(`Error saving restaurant: ${errorMessage}`);
    }
  };

  const handleEdit = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant);
    setFormData({
      name: restaurant.name || '',
      slug: restaurant.slug || '',
      description: restaurant.description || '',
      image_url: restaurant.image_url || '',
      cover_image_url: restaurant.cover_image_url || '',
      rating: restaurant.rating || 0,
      review_count: restaurant.review_count || 0,
      delivery_time_min: restaurant.delivery_time_min || 30,
      delivery_fee: restaurant.delivery_fee || 0,
      minimum_order: restaurant.minimum_order || 0,
      category_id: restaurant.category_id || '',
      address: restaurant.address || '',
      latitude: restaurant.latitude || undefined,
      longitude: restaurant.longitude || undefined,
      phone: restaurant.phone || '',
      is_featured: restaurant.is_featured || false,
      is_active: restaurant.is_active !== undefined ? restaurant.is_active : true,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this restaurant?')) return;
    try {
      const { error } = await supabase
        .from('restaurants')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await fetchRestaurants();
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      alert('Error deleting restaurant');
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-medium" style={{ color: '#111111' }}>Restaurants</h2>
        <button
          onClick={() => {
            setEditingRestaurant(null);
            setFormData({
              name: '',
              slug: '',
              description: '',
              image_url: '',
              cover_image_url: '',
              delivery_time_min: 30,
              delivery_fee: 0,
              minimum_order: 0,
              category_id: '',
              address: '',
              phone: '',
              is_featured: false,
              is_active: true,
            });
            setShowModal(true);
          }}
          className="px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          + Add Restaurant
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delivery Fee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {restaurants.map((restaurant) => (
              <tr key={restaurant.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium" style={{ color: '#111111' }}>{restaurant.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {categories.find(c => c.id === restaurant.category_id)?.name || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatPrice(restaurant.delivery_fee)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    restaurant.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {restaurant.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(restaurant)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(restaurant.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-medium" style={{ color: '#111111' }}>
                {editingRestaurant ? 'Edit Restaurant' : 'Add Restaurant'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setEditingRestaurant(null);
                  setFormData({
                    name: '',
                    slug: '',
                    description: '',
                    image_url: '',
                    cover_image_url: '',
                    rating: 0,
                    review_count: 0,
                    delivery_time_min: 30,
                    delivery_fee: 0,
                    minimum_order: 0,
                    category_id: '',
                    address: '',
                    latitude: undefined,
                    longitude: undefined,
                    phone: '',
                    is_featured: false,
                    is_active: true,
                  });
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="restaurant-name" className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>Name</label>
                <input
                  id="restaurant-name"
                  name="name"
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => {
                    const name = e.target.value;
                    setFormData({ ...formData, name });
                    // Auto-generate slug if slug is empty
                    if (!formData.slug && name) {
                      const autoSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                      setFormData(prev => ({ ...prev, name, slug: autoSlug }));
                    } else {
                      setFormData({ ...formData, name });
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                />
              </div>
              <div>
                <label htmlFor="restaurant-slug" className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>Slug</label>
                <input
                  id="restaurant-slug"
                  name="slug"
                  type="text"
                  required
                  value={formData.slug || ''}
                  onChange={(e) => {
                    const slug = e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                    setFormData({ ...formData, slug });
                  }}
                  placeholder="Auto-generated from name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                />
              </div>
              <div>
                <label htmlFor="restaurant-description" className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>Description</label>
                <textarea
                  id="restaurant-description"
                  name="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 gap-4">
                <ImageUpload
                  value={formData.image_url || ''}
                  onChange={(url) => setFormData({ ...formData, image_url: url })}
                  label="Restaurant Image"
                  bucket="restaurants"
                />
                <ImageUpload
                  value={formData.cover_image_url || ''}
                  onChange={(url) => setFormData({ ...formData, cover_image_url: url })}
                  label="Cover Image"
                  bucket="restaurants"
                />
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>
                    Or enter image URL manually
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      id="restaurant-image-url"
                      name="image_url"
                      type="url"
                      value={formData.image_url || ''}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="Image URL"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                    />
                    <input
                      id="restaurant-cover-image-url"
                      name="cover_image_url"
                      type="url"
                      value={formData.cover_image_url || ''}
                      onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
                      placeholder="Cover Image URL"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="restaurant-delivery-time" className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>Delivery Time (min)</label>
                  <input
                    id="restaurant-delivery-time"
                    name="delivery_time_min"
                    type="number"
                    required
                    value={formData.delivery_time_min || 30}
                    onChange={(e) => setFormData({ ...formData, delivery_time_min: parseInt(e.target.value) || 30 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                  />
                </div>
                <div>
                  <label htmlFor="restaurant-delivery-fee" className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>Delivery Fee</label>
                  <input
                    id="restaurant-delivery-fee"
                    name="delivery_fee"
                    type="number"
                    step="0.01"
                    required
                    value={formData.delivery_fee || 0}
                    onChange={(e) => setFormData({ ...formData, delivery_fee: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                  />
                </div>
                <div>
                  <label htmlFor="restaurant-minimum-order" className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>Minimum Order</label>
                  <input
                    id="restaurant-minimum-order"
                    name="minimum_order"
                    type="number"
                    step="0.01"
                    required
                    value={formData.minimum_order || 0}
                    onChange={(e) => setFormData({ ...formData, minimum_order: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="restaurant-category" className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>Category</label>
                <select
                  id="restaurant-category"
                  name="category_id"
                  value={formData.category_id || ''}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="restaurant-address" className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>Address</label>
                <input
                  id="restaurant-address"
                  name="address"
                  type="text"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                />
              </div>
              <div>
                <label htmlFor="restaurant-phone" className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>Phone</label>
                <input
                  id="restaurant-phone"
                  name="phone"
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                />
              </div>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm" style={{ color: '#111111' }}>Featured</span>
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
                    setEditingRestaurant(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-900 bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {editingRestaurant ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

