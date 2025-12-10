'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface PartyRequest {
  id: string;
  user_id: string;
  restaurant_id: string;
  event_name: string;
  event_date: string;
  start_time: string;
  end_time: string;
  expected_attendees: number;
  requires_dj: boolean;
  special_requirements: string;
  contact_phone: string;
  contact_email: string;
  status: string;
  admin_notes: string;
  created_at: string;
  restaurants?: { name: string };
  user_profiles?: { email: string } | null;
}

export default function PartyRequestsPage() {
  const [requests, setRequests] = useState<PartyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<PartyRequest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [status, setStatus] = useState('pending');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('party_requests')
        .select(`
          *,
          restaurants(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch user emails separately if user_profiles table exists
      const requestsWithEmails = await Promise.all(
        (data || []).map(async (request) => {
          try {
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('email')
              .eq('id', request.user_id)
              .single();
            
            return {
              ...request,
              user_profiles: profile ? { email: profile.email } : null,
            };
          } catch {
            // If user_profiles doesn't exist or query fails, just return request without email
            return {
              ...request,
              user_profiles: null,
            };
          }
        })
      );
      
      setRequests(requestsWithEmails);
    } catch (error) {
      console.error('Error fetching party requests:', error);
      // Set empty array on error to prevent UI crash
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId: string, newStatus: string, notes: string) => {
    try {
      const { error } = await supabase
        .from('party_requests')
        .update({
          status: newStatus,
          admin_notes: notes,
        })
        .eq('id', requestId);

      if (error) throw error;

      // Create notification for user
      const request = requests.find(r => r.id === requestId);
      if (request) {
        await supabase
          .from('notifications')
          .insert([{
            user_id: request.user_id,
            type: 'party_request',
            title: `Party Request ${newStatus === 'approved' ? 'Approved' : 'Rejected'}`,
            message: `Your party request "${request.event_name}" has been ${newStatus === 'approved' ? 'approved' : 'rejected'}.${notes ? ' Notes: ' + notes : ''}`,
            related_id: requestId,
          }]);
      }

      await fetchRequests();
      setShowModal(false);
      setSelectedRequest(null);
      setAdminNotes('');
    } catch (error) {
      console.error('Error updating party request:', error);
      alert('Error updating party request');
    }
  };

  const openModal = (request: PartyRequest) => {
    setSelectedRequest(request);
    setStatus(request.status);
    setAdminNotes(request.admin_notes || '');
    setShowModal(true);
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-medium" style={{ color: '#111111' }}>Party Requests</h2>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Restaurant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attendees</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {requests.map((request) => (
              <tr key={request.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium" style={{ color: '#111111' }}>{request.event_name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {request.restaurants?.name || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(request.event_date).toLocaleDateString()}
                  <div className="text-xs text-gray-400">
                    {request.start_time} - {request.end_time}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>{request.contact_email}</div>
                  <div className="text-xs">{request.contact_phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {request.expected_attendees}
                  {request.requires_dj && <div className="text-xs text-blue-600">DJ Required</div>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${statusColors[request.status] || 'bg-gray-100 text-gray-800'}`}>
                    {request.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => openModal(request)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-medium" style={{ color: '#111111' }}>Party Request Details</h3>
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setSelectedRequest(null);
                  setAdminNotes('');
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>Event Name</label>
                <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{selectedRequest.event_name}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>Restaurant</label>
                  <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{selectedRequest.restaurants?.name || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>Date</label>
                  <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                    {new Date(selectedRequest.event_date).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>Start Time</label>
                  <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{selectedRequest.start_time}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>End Time</label>
                  <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{selectedRequest.end_time}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>Expected Attendees</label>
                  <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{selectedRequest.expected_attendees}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>DJ Required</label>
                  <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{selectedRequest.requires_dj ? 'Yes' : 'No'}</div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>Contact Email</label>
                <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{selectedRequest.contact_email}</div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>Contact Phone</label>
                <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{selectedRequest.contact_phone}</div>
              </div>

              {selectedRequest.special_requirements && (
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>Special Requirements</label>
                  <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{selectedRequest.special_requirements}</div>
                </div>
              )}

              <div>
                <label htmlFor="admin-notes" className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>Admin Notes</label>
                <textarea
                  id="admin-notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                  placeholder="Add notes for the user..."
                />
              </div>

              <div>
                <label htmlFor="status-select" className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>Status</label>
                <select
                  id="status-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedRequest(null);
                    setAdminNotes('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusUpdate(selectedRequest.id, status, adminNotes)}
                  className="px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

