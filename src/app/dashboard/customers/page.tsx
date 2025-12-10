'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Customer {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0 });


  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      // Get unique customers from orders table
      const { data: orders, error } = await supabase
        .from('orders')
        .select('user_id, created_at')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Get unique user IDs
      const uniqueUserIds = new Set(orders?.map(o => o.user_id) || []);
      
      // Fetch user emails from auth (this will only work for users you have access to)
      // For now, we'll just show user IDs and order counts
      const customerData = Array.from(uniqueUserIds).map((userId, index) => ({
        id: userId,
        email: `user-${userId.substring(0, 8)}...`, // Show partial ID since we can't get email
        created_at: orders?.find(o => o.user_id === userId)?.created_at || new Date().toISOString(),
        last_sign_in_at: '',
      }));
      
      setCustomers(customerData);
      setStats({
        total: uniqueUserIds.size,
        active: uniqueUserIds.size,
      });
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-medium" style={{ color: '#111111' }}>Customers</h2>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500">Total Customers</div>
            <div className="text-2xl font-bold" style={{ color: '#111111' }}>{stats.total}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500">Active Customers</div>
            <div className="text-2xl font-bold" style={{ color: '#111111' }}>{stats.active}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Active</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customers.length > 0 ? (
              customers.map((customer) => (
                <tr key={customer.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium" style={{ color: '#111111' }}>{customer.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(customer.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.last_sign_in_at ? new Date(customer.last_sign_in_at).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    View Orders
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

