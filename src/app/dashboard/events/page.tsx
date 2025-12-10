'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import ImageUpload from '@/components/ImageUpload';
import { formatPrice } from '@/utils/currency';

interface Event {
  id: string;
  restaurant_id: string;
  title: string;
  description: string;
  event_date: string;
  start_time: string;
  end_time: string;
  image_url: string;
  cover_image_url: string;
  has_dj: boolean;
  dj_name: string;
  dj_contact: string;
  max_attendees: number;
  ticket_price: number;
  is_active: boolean;
  restaurants?: { name: string };
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState<Partial<Event>>({
    restaurant_id: '',
    title: '',
    description: '',
    event_date: '',
    start_time: '',
    end_time: '',
    image_url: '',
    cover_image_url: '',
    has_dj: false,
    dj_name: '',
    dj_contact: '',
    max_attendees: 0,
    ticket_price: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchEvents();
    fetchRestaurants();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          restaurants(name)
        `)
        .order('event_date', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
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
      if (!formData.title || !formData.restaurant_id || !formData.event_date || !formData.start_time || !formData.end_time) {
        alert('Please fill in all required fields (Title, Restaurant, Date, Start Time, End Time)');
        return;
      }

      // Prepare event_date - combine date and time for timestamp
      const eventDateStr = formData.event_date;
      const startTimeStr = formData.start_time;
      const endTimeStr = formData.end_time;
      
      // Create full timestamp for event_date (date + start_time)
      const eventDateTime = eventDateStr && startTimeStr 
        ? new Date(`${eventDateStr}T${startTimeStr}`).toISOString()
        : null;

      // Prepare data - convert empty strings to null for optional fields
      const submitData: any = {
        restaurant_id: formData.restaurant_id,
        title: formData.title.trim(),
        description: formData.description?.trim() || null,
        event_date: eventDateTime,
        start_time: startTimeStr || null,
        end_time: endTimeStr || null,
        image_url: formData.image_url?.trim() || null,
        cover_image_url: formData.cover_image_url?.trim() || null,
        has_dj: formData.has_dj || false,
        dj_name: formData.dj_name?.trim() || null,
        dj_contact: formData.dj_contact?.trim() || null,
        max_attendees: formData.max_attendees ? Number(formData.max_attendees) : null,
        ticket_price: formData.ticket_price ? Number(formData.ticket_price) : 0,
        is_active: formData.is_active !== false,
      };

      if (editingEvent) {
        // For update, only send fields that have values (avoid overwriting with null)
        const updateData: any = {};
        Object.keys(submitData).forEach((key) => {
          const value = submitData[key];
          // Always include required fields and booleans
          if (key === 'restaurant_id' || key === 'title' || key === 'event_date' || 
              key === 'start_time' || key === 'end_time' || key === 'has_dj' || key === 'is_active' || 
              key === 'ticket_price') {
            updateData[key] = value;
          } else if (value !== null && value !== '' && value !== undefined) {
            // Include non-empty optional fields
            updateData[key] = value;
          }
        });

        const { error } = await supabase
          .from('events')
          .update(updateData)
          .eq('id', editingEvent.id);
        if (error) {
          console.error('Update error details:', error);
          throw error;
        }
      } else {
        // For insert, send all data
        const { error } = await supabase
          .from('events')
          .insert([submitData]);
        if (error) {
          console.error('Insert error details:', error);
          throw error;
        }
      }

      // Notifications will be created automatically via database trigger

      await fetchEvents();
      setShowModal(false);
      setEditingEvent(null);
      resetForm();
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Error saving event: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };


  const resetForm = () => {
    setFormData({
      restaurant_id: '',
      title: '',
      description: '',
      event_date: '',
      start_time: '',
      end_time: '',
      image_url: '',
      cover_image_url: '',
      has_dj: false,
      dj_name: '',
      dj_contact: '',
      max_attendees: 0,
      ticket_price: 0,
      is_active: true,
    });
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    // Format date for date input (YYYY-MM-DD)
    const eventDate = event.event_date ? new Date(event.event_date).toISOString().slice(0, 10) : '';
    // Format time for time input (HH:MM) - handle both string and Date types
    let startTime = '';
    let endTime = '';
    if (event.start_time) {
      if (typeof event.start_time === 'string') {
        startTime = event.start_time.length > 5 ? event.start_time.slice(0, 5) : event.start_time;
      }
    }
    if (event.end_time) {
      if (typeof event.end_time === 'string') {
        endTime = event.end_time.length > 5 ? event.end_time.slice(0, 5) : event.end_time;
      }
    }
    
    setFormData({
      restaurant_id: event.restaurant_id || '',
      title: event.title || '',
      description: event.description || '',
      event_date: eventDate,
      start_time: startTime,
      end_time: endTime,
      image_url: event.image_url || '',
      cover_image_url: event.cover_image_url || '',
      has_dj: event.has_dj || false,
      dj_name: event.dj_name || '',
      dj_contact: event.dj_contact || '',
      max_attendees: event.max_attendees || 0,
      ticket_price: event.ticket_price || 0,
      is_active: event.is_active !== false,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Error deleting event');
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-medium" style={{ color: '#111111' }}>Events</h2>
        <button
          onClick={() => {
            setEditingEvent(null);
            resetForm();
            setShowModal(true);
          }}
          className="px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          + Add Event
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Restaurant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">DJ</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {events.map((event) => (
              <tr key={event.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium" style={{ color: '#111111' }}>{event.title}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {event.restaurants?.name || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(event.event_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {event.start_time} - {event.end_time}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {event.has_dj ? (event.dj_name || 'Yes') : 'No'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {event.is_active ? (
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>
                  ) : (
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Inactive</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(event)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
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
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-medium" style={{ color: '#111111' }}>
                {editingEvent ? 'Edit Event' : 'Add Event'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setEditingEvent(null);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="event-restaurant" className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>Restaurant</label>
                <select
                  id="event-restaurant"
                  name="restaurant_id"
                  required
                  value={formData.restaurant_id}
                  onChange={(e) => setFormData({ ...formData, restaurant_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                >
                  <option value="">Select Restaurant</option>
                  {restaurants.map((restaurant) => (
                    <option key={restaurant.id} value={restaurant.id}>
                      {restaurant.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="event-title" className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>Title</label>
                <input
                  id="event-title"
                  name="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                />
              </div>

              <div>
                <label htmlFor="event-description" className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>Description</label>
                <textarea
                  id="event-description"
                  name="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="event-date" className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>Event Date</label>
                  <input
                    id="event-date"
                    name="event_date"
                    type="date"
                    required
                    value={formData.event_date}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="event-start-time" className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>Start Time</label>
                    <input
                      id="event-start-time"
                      name="start_time"
                      type="time"
                      required
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="event-end-time" className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>End Time</label>
                    <input
                      id="event-end-time"
                      name="end_time"
                      type="time"
                      required
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>Event Image</label>
                <ImageUpload
                  value={formData.image_url || ''}
                  onChange={(url) => setFormData({ ...formData, image_url: url })}
                  label="Event Image"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>Cover Image</label>
                <ImageUpload
                  value={formData.cover_image_url || ''}
                  onChange={(url) => setFormData({ ...formData, cover_image_url: url })}
                  label="Cover Image"
                />
              </div>

              <div className="flex items-center">
                <input
                  id="event-has-dj"
                  name="has_dj"
                  type="checkbox"
                  checked={formData.has_dj || false}
                  onChange={(e) => setFormData({ ...formData, has_dj: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="event-has-dj" className="text-sm font-medium" style={{ color: '#111111' }}>Has DJ</label>
              </div>

              {formData.has_dj && (
                <>
                  <div>
                    <label htmlFor="event-dj-name" className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>DJ Name</label>
                    <input
                      id="event-dj-name"
                      name="dj_name"
                      type="text"
                      value={formData.dj_name || ''}
                      onChange={(e) => setFormData({ ...formData, dj_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="event-dj-contact" className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>DJ Contact</label>
                    <input
                      id="event-dj-contact"
                      name="dj_contact"
                      type="text"
                      value={formData.dj_contact || ''}
                      onChange={(e) => setFormData({ ...formData, dj_contact: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                    />
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="event-max-attendees" className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>Max Attendees</label>
                  <input
                    id="event-max-attendees"
                    name="max_attendees"
                    type="number"
                    min="0"
                    value={formData.max_attendees || 0}
                    onChange={(e) => setFormData({ ...formData, max_attendees: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                  />
                </div>
                <div>
                  <label htmlFor="event-ticket-price" className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>Ticket Price (€)</label>
                  <input
                    id="event-ticket-price"
                    name="ticket_price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.ticket_price || 0}
                    onChange={(e) => setFormData({ ...formData, ticket_price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="event-active"
                  name="is_active"
                  type="checkbox"
                  checked={formData.is_active !== false}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="event-active" className="text-sm font-medium" style={{ color: '#111111' }}>Active</label>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingEvent(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {editingEvent ? 'Update' : 'Create'} Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

