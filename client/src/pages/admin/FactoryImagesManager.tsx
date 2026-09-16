import React, { useState, useEffect, useRef } from 'react';
import { Upload, X, Factory, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';
import api from '../../lib/axios';

interface FactoryImage {
  id: string;
  fileName: string;
  fullPath: string;
}

export default function FactoryImagesManager() {
  const [images, setImages] = useState<FactoryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/factory-images');
      setImages(res.data);
    } catch (err) {
      console.error('Failed to load factory images', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const formData = new FormData();
        formData.append('file', file);
        await api.post('/admin/factory-images', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        successCount++;
      } catch (err) {
        console.error('Failed to upload image:', file.name, err);
        failCount++;
      }
    }

    await fetchImages();
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';

    if (failCount > 0) {
      alert(`Uploaded ${successCount} images. Failed to upload ${failCount} images (ensure they are valid formats and under 5MB).`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    try {
      await api.delete(`/admin/factory-images/${id}`);
      setImages((prev) => prev.filter((img) => img.id !== id));
    } catch (err) {
      console.error('Failed to delete image', err);
      alert('Failed to delete image.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Factory className="h-6 w-6 text-brand-600" />
            Factory Images
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage images displayed on the public Factory Visit page.
          </p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors disabled:opacity-50"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? 'Uploading...' : 'Upload Image'}
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleUpload}
          accept="image/*"
          multiple
          className="hidden"
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <Loader2 className="h-8 w-8 animate-spin mb-2" />
            <p>Loading images...</p>
          </div>
        ) : images.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <ImageIcon className="h-12 w-12 mb-3 text-gray-300" />
            <p className="text-lg font-medium text-gray-500">No images uploaded yet</p>
            <p className="text-sm mt-1">Upload images to display them on the factory page.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-6">
            {images.map((img) => (
              <div key={img.id} className="group relative bg-gray-100 rounded-lg overflow-hidden border border-gray-200 aspect-square">
                <img
                  src={`http://localhost:3000${img.fullPath}`}
                  alt={img.fileName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => handleDelete(img.id)}
                    className="bg-white text-red-600 p-2 rounded-full hover:bg-red-50 hover:scale-110 transition-all shadow-lg"
                    title="Delete Image"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1.5 text-xs text-white truncate text-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {img.fileName}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
