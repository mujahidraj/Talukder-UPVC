import React, { useState, useEffect } from 'react';
import { Image, Upload, Trash2, Star, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';

interface ProductImage {
  id: string;
  fileName: string;
  filePath: string;
  thumbPath: string;
  isPrimary: boolean;
  createdAt: string;
  product?: { productName: string; productCode: string };
}

export default function MediaLibrary() {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [productId, setProductId] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const fetchImages = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/media');
      setImages(res.data);
    } catch {
      toast.error('Failed to load media library');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchImages(); }, []);

  const handleUpload = async () => {
    if (!file || !productId) {
      toast.error('Select a product and an image file');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('productId', productId);
      formData.append('isPrimary', 'false');

      await api.post('/admin/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Image uploaded & resized');
      setFile(null);
      setProductId('');
      fetchImages();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this image permanently?')) return;
    try {
      await api.delete(`/admin/media/${id}`);
      toast.success('Image deleted');
      fetchImages();
    } catch {
      toast.error('Failed to delete image');
    }
  };

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-gray-900 flex items-center">
            <Image className="h-6 w-6 mr-3 text-brand-600" />
            Media Library
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Upload, manage, and organize product images. Images are auto-resized to thumbnail, medium, and full sizes.
          </p>
        </div>
      </div>

      {/* Upload Form */}
      <div className="glass-panel p-6 mb-8 bg-white">
        <h2 className="text-lg font-heading font-semibold mb-4">Upload New Image</h2>
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Product ID</label>
            <input
              type="text"
              className="admin-input"
              placeholder="Paste the product CUID here..."
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Image File</label>
            <input
              type="file"
              accept="image/*"
              className="admin-input file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>
          <button
            onClick={handleUpload}
            disabled={uploading || !file || !productId}
            className="admin-btn-primary flex items-center whitespace-nowrap"
          >
            {uploading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
            Upload
          </button>
        </div>
      </div>

      {/* Image Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading media library...</div>
      ) : images.length === 0 ? (
        <div className="glass-panel p-12 text-center">
          <Image className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No images yet</h3>
          <p className="mt-1 text-sm text-gray-500">Upload product images using the form above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {images.map((img) => (
            <div key={img.id} className="group relative bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="aspect-square bg-gray-100">
                <img
                  src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'}${img.thumbPath || img.filePath}`}
                  alt={img.fileName}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              {img.isPrimary && (
                <div className="absolute top-2 left-2">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => handleDelete(img.id)}
                  className="p-2 bg-white rounded-lg shadow-sm hover:bg-red-50 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </button>
              </div>
              <div className="p-2">
                <p className="text-xs text-gray-600 truncate">{img.product?.productName || img.fileName}</p>
                <p className="text-xs text-gray-400 truncate font-mono">{img.product?.productCode}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
