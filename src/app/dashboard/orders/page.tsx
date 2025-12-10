'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/utils/currency';

interface Order {
  id: string;
  user_id: string;
  restaurant_id: string;
  order_number: string;
  status: string;
  subtotal: number;
  delivery_fee: number;
  tax: number;
  total: number;
  delivery_address: string;
  payment_method?: string;
  payment_status: string;
  rider_id: string;
  created_at: string;
  restaurants?: { name: string };
  riders?: { name: string };
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [riders, setRiders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchRiders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          restaurants(name),
          riders(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRiders = async () => {
    try {
      const { data } = await supabase
        .from('riders')
        .select('id, name')
        .eq('is_active', true)
        .eq('is_available', true);
      setRiders(data || []);
    } catch (error) {
      console.error('Error fetching riders:', error);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
      
      if (error) throw error;
      
      // Create tracking entry
      await supabase
        .from('order_tracking')
        .insert([{
          order_id: orderId,
          status: newStatus,
        }]);
      
      await fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error updating order status');
    }
  };

  const handleAssignRider = async (orderId: string, riderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ rider_id: riderId })
        .eq('id', orderId);
      
      if (error) throw error;
      
      await fetchOrders();
    } catch (error) {
      console.error('Error assigning rider:', error);
      alert('Error assigning rider');
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      // First delete order items
      const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', orderId);
      
      if (itemsError) throw itemsError;

      // Delete order tracking
      const { error: trackingError } = await supabase
        .from('order_tracking')
        .delete()
        .eq('order_id', orderId);
      
      if (trackingError) throw trackingError;

      // Finally delete the order
      const { error: orderError } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);
      
      if (orderError) throw orderError;
      
      await fetchOrders();
      alert('Order deleted successfully');
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Error deleting order: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const fetchOrderDetails = async (orderId: string) => {
    try {
      const { data } = await supabase
        .from('order_items')
        .select(`
          *,
          menu_items(name, image_url)
        `)
        .eq('order_id', orderId);
      return data;
    } catch (error) {
      console.error('Error fetching order details:', error);
      return [];
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    preparing: 'bg-orange-100 text-orange-800',
    out_for_delivery: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-medium" style={{ color: '#111111' }}>Orders</h2>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Restaurant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rider</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium" style={{ color: '#111111' }}>{order.order_number}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.restaurants?.name || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: '#111111' }}>
                  {formatPrice(order.total)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                    {order.status.replace('_', ' ').toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.riders?.name || (
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleAssignRider(order.id, e.target.value);
                        }
                      }}
                      className="text-xs border border-gray-300 rounded px-2 py-1 text-gray-900 bg-white"
                      defaultValue=""
                    >
                      <option value="">Assign Rider</option>
                      {riders.map((rider) => (
                        <option key={rider.id} value={rider.id}>{rider.name}</option>
                      ))}
                    </select>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex flex-col space-y-1">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                      className="text-xs border border-gray-300 rounded px-2 py-1 text-gray-900 bg-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="preparing">Preparing</option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <button
                      onClick={async () => {
                        setSelectedOrder(order);
                        setShowDetails(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 text-xs"
                    >
                      View Details
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
                          await handleDeleteOrder(order.id);
                        }
                      }}
                      className="text-red-600 hover:text-red-900 text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showDetails && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => {
            setShowDetails(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
}

function OrderDetailsModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      // First try with the join to get menu item details
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          *,
          menu_items(name, image_url)
        `)
        .eq('order_id', order.id);
      
      if (error) {
        console.error('Error fetching items with join:', error);
        // If join fails (e.g., RLS issue), try without the join
        // The order_items table already has menu_item_name stored
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', order.id);
        
        if (fallbackError) {
          console.error('Error fetching items (fallback):', fallbackError);
          setItems([]);
        } else {
          // Map the data to include menu_items structure for consistency
          setItems((fallbackData || []).map(item => ({
            ...item,
            menu_items: {
              name: item.menu_item_name,
              image_url: null
            }
          })));
        }
      } else {
        // Map the data to ensure menu_items structure exists
        setItems((data || []).map(item => ({
          ...item,
          menu_items: item.menu_items || {
            name: item.menu_item_name,
            image_url: null
          }
        })));
      }
    } catch (error) {
      console.error('Error fetching items:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
      style={{ zIndex: 9999 }}
    >
      <div 
        className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{ 
          zIndex: 10000,
          color: '#111111',
          backgroundColor: '#ffffff'
        }}
      >
        <div className="flex justify-between items-center mb-4 border-b pb-4">
          <h3 className="text-xl font-medium" style={{ color: '#111111' }}>Order Details</h3>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            style={{ color: '#111111', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-4" style={{ color: '#111111' }}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong style={{ color: '#111111', display: 'block', marginBottom: '4px' }}>Order Number:</strong>
              <span style={{ color: '#111111' }}>{order.order_number}</span>
            </div>
            <div>
              <strong style={{ color: '#111111', display: 'block', marginBottom: '4px' }}>Status:</strong>
              <span style={{ color: '#111111' }} className="capitalize">{order.status.replace('_', ' ')}</span>
            </div>
          </div>
          
          <div>
            <strong style={{ color: '#111111', display: 'block', marginBottom: '4px' }}>Restaurant:</strong>
            <span style={{ color: '#111111' }}>{order.restaurants?.name || 'N/A'}</span>
          </div>
          
          <div>
            <strong style={{ color: '#111111', display: 'block', marginBottom: '4px' }}>Delivery Address:</strong>
            <span style={{ color: '#111111' }}>{order.delivery_address || 'N/A'}</span>
          </div>
          
          <div>
            <strong style={{ color: '#111111', display: 'block', marginBottom: '4px' }}>Payment Status:</strong>
            <span style={{ color: '#111111' }} className="capitalize">{order.payment_status || 'N/A'}</span>
          </div>
          
          <div>
            <strong style={{ color: '#111111', display: 'block', marginBottom: '4px' }}>Payment Method:</strong>
            <span style={{ color: '#111111' }} className="capitalize">{order.payment_method || 'N/A'}</span>
          </div>
          
          <div>
            <strong style={{ color: '#111111', display: 'block', marginBottom: '4px' }}>Payment Status:</strong>
            <span style={{ color: '#111111' }} className="capitalize">{order.payment_status || 'N/A'}</span>
          </div>
          
          <div>
            <strong style={{ color: '#111111', display: 'block', marginBottom: '4px' }}>Rider:</strong>
            <span style={{ color: '#111111' }}>{order.riders?.name || 'Not assigned'}</span>
          </div>
          
          <div>
            <strong style={{ color: '#111111', display: 'block', marginBottom: '4px' }}>Date:</strong>
            <span style={{ color: '#111111' }}>{new Date(order.created_at).toLocaleString()}</span>
          </div>
          
          <div className="border-t pt-4 mt-4">
            <strong style={{ color: '#111111', display: 'block', marginBottom: '12px', fontSize: '18px' }}>Order Items:</strong>
            {loading ? (
              <div style={{ color: '#111111' }}>Loading items...</div>
            ) : items.length === 0 ? (
              <div style={{ color: '#666666' }}>No items found</div>
            ) : (
              <div className="mt-2 space-y-3">
                {items.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex justify-between items-center p-3 bg-gray-50 rounded"
                    style={{ color: '#111111' }}
                  >
                    <div className="flex items-center gap-3">
                      {item.menu_items?.image_url && (
                        <img 
                          src={item.menu_items.image_url} 
                          alt={item.menu_item_name}
                          className="w-12 h-12 rounded object-cover"
                        />
                      )}
                      <div>
                        <div style={{ color: '#111111', fontWeight: '500' }}>
                          {item.menu_item_name || item.menu_items?.name || 'Unknown Item'}
                        </div>
                        <div style={{ color: '#666666', fontSize: '14px' }}>
                          Quantity: {item.quantity}
                        </div>
                      </div>
                    </div>
                    <div style={{ color: '#111111', fontWeight: '600' }}>
                      ${item.subtotal?.toFixed(2) || '0.00'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="border-t pt-4 mt-4 space-y-2">
            <div className="flex justify-between" style={{ color: '#111111' }}>
              <span>Subtotal:</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between" style={{ color: '#111111' }}>
              <span>Delivery Fee:</span>
              <span>{formatPrice(order.delivery_fee)}</span>
            </div>
            <div className="flex justify-between" style={{ color: '#111111' }}>
              <span>Tax:</span>
              <span>{formatPrice(order.tax)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2" style={{ color: '#111111' }}>
              <span>Total:</span>
              <span style={{ color: '#B91C1C' }}>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

