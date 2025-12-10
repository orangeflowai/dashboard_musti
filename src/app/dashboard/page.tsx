'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    restaurants: 0,
    products: 0,
    orders: 0,
    customers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [restaurants, products, orders, customers] = await Promise.all([
        supabase.from('restaurants').select('id', { count: 'exact', head: true }),
        supabase.from('menu_items').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('user_id', { count: 'exact' }).limit(1),
      ]);

      setStats({
        restaurants: restaurants.count || 0,
        products: products.count || 0,
        orders: orders.count || 0,
        customers: customers.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-medium mb-6" style={{ color: '#111111' }}>Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-500 mb-2">Total Restaurants</div>
          <div className="text-3xl font-bold" style={{ color: '#111111' }}>
            {loading ? '...' : stats.restaurants}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-500 mb-2">Total Products</div>
          <div className="text-3xl font-bold" style={{ color: '#111111' }}>
            {loading ? '...' : stats.products}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-500 mb-2">Total Orders</div>
          <div className="text-3xl font-bold" style={{ color: '#111111' }}>
            {loading ? '...' : stats.orders}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-500 mb-2">Total Customers</div>
          <div className="text-3xl font-bold" style={{ color: '#111111' }}>
            {loading ? '...' : stats.customers}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/dashboard/restaurants"
          className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-medium mb-2" style={{ color: '#111111' }}>🍽️ Restaurants</h3>
          <p style={{ color: '#666666' }}>Manage restaurants, menus, and settings</p>
        </Link>

        <Link
          href="/dashboard/products"
          className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-medium mb-2" style={{ color: '#111111' }}>🍕 Products</h3>
          <p style={{ color: '#666666' }}>Manage menu items and products</p>
        </Link>

        <Link
          href="/dashboard/categories"
          className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-medium mb-2" style={{ color: '#111111' }}>📁 Categories</h3>
          <p style={{ color: '#666666' }}>Manage food categories</p>
        </Link>

        <Link
          href="/dashboard/addons"
          className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-medium mb-2" style={{ color: '#111111' }}>➕ Addons</h3>
          <p style={{ color: '#666666' }}>Manage product addons and options</p>
        </Link>

        <Link
          href="/dashboard/offers"
          className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-medium mb-2" style={{ color: '#111111' }}>🎁 Special Offers</h3>
          <p style={{ color: '#666666' }}>Manage promotions and discounts</p>
        </Link>

        <Link
          href="/dashboard/riders"
          className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-medium mb-2" style={{ color: '#111111' }}>🏍️ Riders</h3>
          <p style={{ color: '#666666' }}>Manage delivery riders</p>
        </Link>

        <Link
          href="/dashboard/customers"
          className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-medium mb-2" style={{ color: '#111111' }}>👥 Customers</h3>
          <p style={{ color: '#666666' }}>View customer information</p>
        </Link>

        <Link
          href="/dashboard/orders"
          className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-medium mb-2" style={{ color: '#111111' }}>📦 Orders</h3>
          <p style={{ color: '#666666' }}>Manage and track orders</p>
        </Link>
      </div>
    </div>
  );
}

