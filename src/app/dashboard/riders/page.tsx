'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Rider {
  id: string;
  user_id: string | null;
  name: string;
  phone: string;
  vehicle_type: string;
  vehicle_number: string;
  license_number: string;
  current_latitude: number;
  current_longitude: number;
  is_available: boolean;
  is_active: boolean;
}

interface User {
  id: string;
  email: string;
}

export default function RidersPage() {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRider, setEditingRider] = useState<Rider | null>(null);
  const [formData, setFormData] = useState<Partial<Rider> & { user_id: string | null }>({
    user_id: null,
    name: '',
    phone: '',
    vehicle_type: '',
    vehicle_number: '',
    license_number: '',
    is_available: true,
    is_active: true,
  });


  useEffect(() => {
    fetchRiders();
    fetchUsers();
  }, []);

  const fetchRiders = async () => {
    try {
      const { data, error } = await supabase
        .from('riders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRiders(data || []);
    } catch (error) {
      console.error('Error fetching riders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      // Get users from riders table who already have user_id
      const { data: existingRiders } = await supabase
        .from('riders')
        .select('user_id, name')
        .not('user_id', 'is', null);
      
      // For new riders, we'll allow creating without user_id initially
      // The user_id can be set later when the rider account is created
      setUsers(existingRiders?.map(r => ({ id: r.user_id, email: r.name })) || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Ensure user_id is null if empty string
      const submitData = {
        ...formData,
        user_id: formData.user_id && formData.user_id.trim() !== '' ? formData.user_id : null,
      };
      
      if (editingRider) {
        const { error } = await supabase
          .from('riders')
          .update(submitData)
          .eq('id', editingRider.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('riders')
          .insert([submitData]);
        if (error) throw error;
      }
      await fetchRiders();
      setShowModal(false);
      setEditingRider(null);
      resetForm();
    } catch (error: unknown) {
      console.error('Error saving rider:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error as { message?: string; details?: string })?.message 
        || (error as { message?: string; details?: string })?.details 
        || 'Failed to save rider. Please check all required fields.';
      alert(`Error saving rider: ${errorMessage}`);
    }
  };

  const resetForm = () => {
    setFormData({
      user_id: null,
      name: '',
      phone: '',
      vehicle_type: '',
      vehicle_number: '',
      license_number: '',
      is_available: true,
      is_active: true,
    });
  };

  const handleEdit = (rider: Rider) => {
    setEditingRider(rider);
    setFormData(rider);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this rider?')) return;
    try {
      const { error } = await supabase
        .from('riders')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await fetchRiders();
    } catch (error) {
      console.error('Error deleting rider:', error);
      alert('Error deleting rider');
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-medium" style={{ color: '#111111' }}>Riders</h2>
        <button
          onClick={() => {
            setEditingRider(null);
            resetForm();
            setShowModal(true);
          }}
          className="px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          + Add Rider
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Available</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {riders.map((rider) => (
              <tr key={rider.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium" style={{ color: '#111111' }}>{rider.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rider.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {rider.vehicle_type} {rider.vehicle_number && `(${rider.vehicle_number})`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    rider.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {rider.is_available ? 'Available' : 'Unavailable'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    rider.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {rider.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(rider)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(rider.id)}
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
                {editingRider ? 'Edit Rider' : 'Add Rider'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setEditingRider(null);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="rider-user-id" className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>User (optional - create user first)</label>
                <select
                  id="rider-user-id"
                  name="user_id"
                  value={formData.user_id || ''}
                  onChange={(e) => setFormData({ ...formData, user_id: e.target.value ? e.target.value : null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                >
                  <option value="">Select User</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>{user.email}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="rider-name" className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>Name</label>
                <input
                  id="rider-name"
                  name="name"
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                />
              </div>
              <div>
                <label htmlFor="rider-phone" className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>Phone</label>
                <input
                  id="rider-phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="rider-vehicle-type" className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>Vehicle Type</label>
                  <select
                    id="rider-vehicle-type"
                    name="vehicle_type"
                    value={formData.vehicle_type || ''}
                    onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                  >
                    <option value="">Select Type</option>
                    <option value="bike">Bike</option>
                    <option value="motorcycle">Motorcycle</option>
                    <option value="car">Car</option>
                    <option value="scooter">Scooter</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="rider-vehicle-number" className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>Vehicle Number</label>
                  <input
                    id="rider-vehicle-number"
                    name="vehicle_number"
                    type="text"
                    value={formData.vehicle_number || ''}
                    onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="rider-license-number" className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>License Number</label>
                <input
                  id="rider-license-number"
                  name="license_number"
                  type="text"
                  value={formData.license_number || ''}
                  onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                />
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
                    setEditingRider(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-900 bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {editingRider ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

