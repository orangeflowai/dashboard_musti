'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import ImageUpload from '@/components/ImageUpload';
import { formatPrice } from '@/utils/currency';

interface Product {
  id: string;
  restaurant_id: string;
  name: string;
  description: string;
  image_url: string;
  price: number;
  category: string;
  is_available: boolean;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_spicy: boolean;
  calories: number;
  order_index: number;
}

interface Category {
  id: string;
  name: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    restaurant_id: '',
    name: '',
    description: '',
    image_url: '',
    price: 0,
    category: '',
    is_available: true,
    is_vegetarian: false,
    is_vegan: false,
    is_spicy: false,
    calories: 0,
    order_index: 0,
  });


  useEffect(() => {
    fetchProducts();
    fetchRestaurants();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRestaurants = async () => {
    try {
      const { data } = await supabase
        .from('restaurants')
        .select('id, name')
        .order('name');
      setRestaurants(data || []);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Ensure category is included in the update - trim whitespace and use empty string if not selected
      const updateData = {
        ...formData,
        category: formData.category ? formData.category.trim() : '',
        price: Number(formData.price) || 0,
        calories: Number(formData.calories) || 0,
        order_index: Number(formData.order_index) || 0,
      };
      
      if (editingProduct) {
        
        // Verify what's currently in the database before update
        const { data: currentData } = await supabase
          .from('menu_items')
          .select('category')
          .eq('id', editingProduct.id)
          .single();
        
        const { error, data } = await supabase
          .from('menu_items')
          .update(updateData)
          .eq('id', editingProduct.id)
          .select();
        if (error) {
          console.error('Update error:', error);
          throw error;
        }
      } else {
        const { error, data } = await supabase
          .from('menu_items')
          .insert([updateData])
          .select();
        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
      }
      await fetchProducts();
      setShowModal(false);
      setEditingProduct(null);
      resetForm();
      alert('Product saved successfully!');
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const resetForm = () => {
    setFormData({
      restaurant_id: '',
      name: '',
      description: '',
      image_url: '',
      price: 0,
      category: '',
      is_available: true,
      is_vegetarian: false,
      is_vegan: false,
      is_spicy: false,
      calories: 0,
      order_index: 0,
    });
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      restaurant_id: product.restaurant_id || '',
      name: product.name || '',
      description: product.description || '',
      image_url: product.image_url || '',
      price: product.price || 0,
      category: product.category || '', // Ensure category is set
      is_available: product.is_available !== undefined ? product.is_available : true,
      is_vegetarian: product.is_vegetarian || false,
      is_vegan: product.is_vegan || false,
      is_spicy: product.is_spicy || false,
      calories: product.calories || 0,
      order_index: product.order_index || 0,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product');
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-medium" style={{ color: '#111111' }}>Products</h2>
        <button
          onClick={() => {
            setEditingProduct(null);
            resetForm();
            setShowModal(true);
          }}
          className="px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          + Add Product
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Restaurant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium" style={{ color: '#111111' }}>{product.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {restaurants.find(r => r.id === product.restaurant_id)?.name || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatPrice(product.price)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    product.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {product.is_available ? 'Available' : 'Unavailable'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(product)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
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
                {editingProduct ? 'Edit Product' : 'Add Product'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setEditingProduct(null);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="product-restaurant" className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>Restaurant</label>
                <select
                  id="product-restaurant"
                  name="restaurant_id"
                  required
                  value={formData.restaurant_id || ''}
                  onChange={(e) => setFormData({ ...formData, restaurant_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                >
                  <option value="">Select Restaurant</option>
                  {restaurants.map((restaurant) => (
                    <option key={restaurant.id} value={restaurant.id}>{restaurant.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="product-name" className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>Name</label>
                <input
                  id="product-name"
                  name="name"
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                />
              </div>
              <div>
                <label htmlFor="product-description" className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>Description</label>
                <textarea
                  id="product-description"
                  name="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="product-price" className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>Price</label>
                  <input
                    id="product-price"
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
                  <label htmlFor="product-category" className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>Category</label>
                  <select
                    id="product-category"
                    name="category"
                    value={formData.category || ''}
                    onChange={(e) => {
                      const selectedCategory = categories.find(c => c.name === e.target.value);
                      setFormData({ ...formData, category: selectedCategory ? selectedCategory.name : e.target.value });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {formData.category && !categories.find(c => c.name === formData.category) && (
                    <p className="text-sm text-yellow-600 mt-1">
                      ⚠️ Warning: "{formData.category}" doesn't match any category. Please select from the list above.
                    </p>
                  )}
                  {formData.category && !categories.find(c => c.name === formData.category) && (
                    <p className="text-sm text-yellow-600 mt-1">
                      Warning: "{formData.category}" doesn't match any existing category. Please select from the list above.
                    </p>
                  )}
                </div>
              </div>
              <ImageUpload
                value={formData.image_url || ''}
                onChange={(url) => setFormData({ ...formData, image_url: url })}
                label="Product Image"
                bucket="products"
              />
              <div>
                <label htmlFor="product-image-url" className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>
                  Or enter image URL manually
                </label>
                <input
                  id="product-image-url"
                  name="image_url"
                  type="url"
                  value={formData.image_url || ''}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="Image URL"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="product-calories" className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>Calories</label>
                  <input
                    id="product-calories"
                    name="calories"
                    type="number"
                    value={formData.calories || 0}
                    onChange={(e) => setFormData({ ...formData, calories: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                  />
                </div>
                <div>
                  <label htmlFor="product-order-index" className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>Order Index</label>
                  <input
                    id="product-order-index"
                    name="order_index"
                    type="number"
                    value={formData.order_index || 0}
                    onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_available}
                    onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm" style={{ color: '#111111' }}>Available</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_vegetarian}
                    onChange={(e) => setFormData({ ...formData, is_vegetarian: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm" style={{ color: '#111111' }}>Vegetarian</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_vegan}
                    onChange={(e) => setFormData({ ...formData, is_vegan: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm" style={{ color: '#111111' }}>Vegan</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_spicy}
                    onChange={(e) => setFormData({ ...formData, is_spicy: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm" style={{ color: '#111111' }}>Spicy</span>
                </label>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-900 bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {editingProduct ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

