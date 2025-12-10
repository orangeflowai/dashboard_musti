'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import ImageUpload from '@/components/ImageUpload';
import { formatPrice } from '@/utils/currency';

interface SpecialOffer {
  id: string;
  restaurant_id: string | null;
  title: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  minimum_order: number;
  max_discount: number | null;
  code: string | null;
  image_url: string | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
  usage_limit: number | null;
  usage_count: number;
}

interface Restaurant {
  id: string;
  name: string;
}

export default function OffersPage() {
  const [offers, setOffers] = useState<SpecialOffer[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState<SpecialOffer | null>(null);
  const [formData, setFormData] = useState<{
    restaurant_id?: string;
    title?: string;
    description?: string;
    discount_type?: string;
    discount_value?: number;
    minimum_order?: number;
    max_discount?: number;
    code?: string;
    image_url?: string;
    start_date?: string;
    end_date?: string;
    is_active?: boolean;
    usage_limit?: number;
  }>({
    restaurant_id: '',
    title: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 0,
    minimum_order: 0,
    max_discount: undefined,
    code: '',
    image_url: '',
    start_date: '',
    end_date: '',
    is_active: true,
    usage_limit: undefined,
  });


  useEffect(() => {
    fetchOffers();
    fetchRestaurants();
  }, []);

  const fetchOffers = async () => {
    try {
      const { data, error } = await supabase
        .from('special_offers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOffers(data || []);
    } catch (error) {
      console.error('Error fetching offers:', error);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validate required fields
      if (!formData.title || !formData.start_date || !formData.end_date) {
        alert('Please fill in all required fields (Title, Start Date, End Date)');
        return;
      }

      // Validate dates
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      
      if (isNaN(startDate.getTime())) {
        alert('Invalid start date');
        return;
      }
      
      if (isNaN(endDate.getTime())) {
        alert('Invalid end date');
        return;
      }

      if (endDate <= startDate) {
        alert('End date must be after start date');
        return;
      }

      // Prepare data for submission
      const submitData: {
        restaurant_id: string | null;
        title: string;
        description: string | null;
        discount_type: string;
        discount_value: number;
        minimum_order: number;
        max_discount: number | null;
        code: string | null;
        image_url: string | null;
        start_date: string;
        end_date: string;
        is_active: boolean;
        usage_limit: number | null;
      } = {
        restaurant_id: formData.restaurant_id && formData.restaurant_id.trim() !== '' ? formData.restaurant_id : null,
        title: formData.title || '',
        description: formData.description || null,
        discount_type: formData.discount_type || 'percentage',
        discount_value: formData.discount_value || 0,
        minimum_order: formData.minimum_order || 0,
        max_discount: formData.max_discount ?? null,
        code: formData.code && formData.code.trim() !== '' ? formData.code : null,
        image_url: formData.image_url || null,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        is_active: formData.is_active ?? true,
        usage_limit: formData.usage_limit ?? null,
      };

      if (editingOffer) {
        const { error } = await supabase
          .from('special_offers')
          .update(submitData)
          .eq('id', editingOffer.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('special_offers')
          .insert([submitData]);
        if (error) throw error;
      }
      await fetchOffers();
      setShowModal(false);
      setEditingOffer(null);
      resetForm();
    } catch (error: unknown) {
      console.error('Error saving offer:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error as { message?: string; details?: string })?.message 
        || (error as { message?: string; details?: string })?.details 
        || 'Failed to save offer. Please check all required fields.';
      alert(`Error saving offer: ${errorMessage}`);
    }
  };

  const resetForm = () => {
    setFormData({
      restaurant_id: '',
      title: '',
      description: '',
      discount_type: 'percentage',
      discount_value: 0,
      minimum_order: 0,
      max_discount: undefined,
      code: '',
      image_url: '',
      start_date: '',
      end_date: '',
      is_active: true,
      usage_limit: undefined,
    });
  };

  const handleEdit = (offer: SpecialOffer) => {
    setEditingOffer(offer);
    setFormData({
      restaurant_id: offer.restaurant_id ?? undefined,
      title: offer.title,
      description: offer.description ?? undefined,
      discount_type: offer.discount_type,
      discount_value: offer.discount_value ?? 0,
      minimum_order: offer.minimum_order ?? 0,
      max_discount: offer.max_discount ?? undefined,
      code: offer.code ?? undefined,
      image_url: offer.image_url ?? undefined,
      start_date: offer.start_date ? new Date(offer.start_date).toISOString().slice(0, 16) : '',
      end_date: offer.end_date ? new Date(offer.end_date).toISOString().slice(0, 16) : '',
      is_active: offer.is_active,
      usage_limit: offer.usage_limit ?? undefined,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this offer?')) return;
    try {
      const { error } = await supabase
        .from('special_offers')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await fetchOffers();
    } catch (error) {
      console.error('Error deleting offer:', error);
      alert('Error deleting offer');
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-medium" style={{ color: '#111111' }}>Special Offers</h2>
        <button
          onClick={() => {
            setEditingOffer(null);
            resetForm();
            setShowModal(true);
          }}
          className="px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          + Add Offer
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Restaurant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {offers.map((offer) => (
              <tr key={offer.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium" style={{ color: '#111111' }}>{offer.title}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {restaurants.find(r => r.id === offer.restaurant_id)?.name || 'All Restaurants'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {offer.discount_type === 'percentage' 
                    ? `${offer.discount_value}%` 
                    : `${formatPrice(offer.discount_value)}`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {offer.code || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    offer.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {offer.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(offer)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(offer.id)}
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
                {editingOffer ? 'Edit Offer' : 'Add Offer'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setEditingOffer(null);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>Restaurant (optional)</label>
                <select
                  value={formData.restaurant_id || ''}
                  onChange={(e) => setFormData({ ...formData, restaurant_id: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                >
                  <option value="">All Restaurants</option>
                  {restaurants.map((restaurant) => (
                    <option key={restaurant.id} value={restaurant.id}>{restaurant.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                  />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>Discount Type</label>
                  <select
                    required
                    value={formData.discount_type}
                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed_amount">Fixed Amount</option>
                    <option value="free_delivery">Free Delivery</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>Discount Value</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.discount_value || 0}
                    onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>Minimum Order</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.minimum_order || 0}
                    onChange={(e) => setFormData({ ...formData, minimum_order: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>Max Discount (for %)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.max_discount ?? ''}
                    onChange={(e) => setFormData({ ...formData, max_discount: e.target.value ? parseFloat(e.target.value) : undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>Promo Code (optional)</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                />
              </div>
              <div>
                <ImageUpload
                  value={formData.image_url || ''}
                  onChange={(url) => setFormData({ ...formData, image_url: url })}
                  label="Image"
                  bucket="images"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>Start Date</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.start_date || ''}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>End Date</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>Usage Limit (optional)</label>
                <input
                  type="number"
                  value={formData.usage_limit ?? ''}
                  onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                  placeholder="Unlimited"
                />
              </div>
              <div className="flex items-center">
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
                    setEditingOffer(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-900 bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {editingOffer ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

