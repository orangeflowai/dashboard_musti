'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  bucket?: string;
}

export default function ImageUpload({ value, onChange, label = 'Image', bucket = 'images' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${bucket}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      const publicUrl = data.publicUrl;
      setPreview(publicUrl);
      onChange(publicUrl);
    } catch (error: any) {
      console.error('Error uploading image:', error);
      alert(error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const inputId = `image-upload-${label.toLowerCase().replace(/\s+/g, '-')}`;
  
  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-medium mb-1" style={{ color: '#111111' }}>
        {label}
      </label>
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <input
            id={inputId}
            name={inputId}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white"
          />
        </div>
        {preview && (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-gray-300"
            />
            <button
              type="button"
              onClick={() => {
                setPreview(null);
                onChange('');
              }}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
            >
              ×
            </button>
          </div>
        )}
      </div>
      {uploading && (
        <p className="text-sm text-gray-500 mt-2">Uploading...</p>
      )}
      {value && !preview && (
        <div className="mt-2">
          <p className="text-xs text-gray-500">Current: {value}</p>
        </div>
      )}
    </div>
  );
}

