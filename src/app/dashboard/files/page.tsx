'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface FileItem {
  id: string;
  name: string;
  type: string;
  url: string;
  path?: string;
  size: number;
  mime_type: string;
  is_public: boolean;
  created_at: string;
}

export default function FilesPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error: any) {
      console.error('Error fetching files:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('files')
        .getPublicUrl(filePath);

      // Save file metadata to database
      const { error: dbError } = await supabase
        .from('files')
        .insert([{
          name: file.name,
          type: file.type.startsWith('image/') ? 'image' : 'document',
          url: publicUrl,
          path: filePath,
          size: file.size,
          mime_type: file.type,
        }]);

      if (dbError) throw dbError;

      fetchFiles();
    } catch (error: any) {
      console.error('Error uploading file:', error.message);
      alert('Error uploading file: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, path: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('files')
        .remove([path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('files')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      fetchFiles();
    } catch (error: any) {
      console.error('Error deleting file:', error.message);
      alert('Error deleting file: ' + error.message);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-medium" style={{ color: '#111111' }}>File Manager</h2>
        <label className="px-4 py-2 text-white rounded-lg font-medium cursor-pointer" style={{ backgroundColor: '#B91C1C' }}>
          {uploading ? 'Uploading...' : '+ Upload File'}
          <input
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            disabled={uploading}
          />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.map((file) => (
          <div key={file.id} className="bg-white rounded-lg shadow p-4">
            {file.type === 'image' && (
              <img
                src={file.url}
                alt={file.name}
                className="w-full h-48 object-cover rounded mb-4"
              />
            )}
            <h3 className="font-medium truncate" style={{ color: '#111111' }}>{file.name}</h3>
            <p className="text-sm mt-1" style={{ color: '#666666' }}>
              {formatFileSize(file.size)} • {file.type}
            </p>
            <div className="mt-4 flex space-x-2">
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                View
              </a>
              <button
                onClick={() => handleDelete(file.id, file.path || '')}
                className="flex-1 px-3 py-2 text-white rounded font-medium"
                style={{ backgroundColor: '#B91C1C' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#991919'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#B91C1C'}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {files.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No files uploaded yet. Upload your first file.
        </div>
      )}
    </div>
  );
}

