import React, { useState, useEffect } from 'react';
import { Image, Upload, Trash2, Star, Loader2, Search } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');

  const filteredImages = images.filter(img => {
    const q = searchQuery.toLowerCase();
    return (
      img.fileName.toLowerCase().includes(q) ||
      (img.product?.productName && img.product.productName.toLowerCase().includes(q)) ||
      (img.product?.productCode && img.product.productCode.toLowerCase().includes(q))
    );
  });

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
        <div className="mt-4 sm:mt-0 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="admin-input pl-10 w-full sm:w-72"
            placeholder="Search by file or product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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
      ) : filteredImages.length === 0 ? (
        <div className="glass-panel p-12 text-center">
          <Search className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No images found</h3>
          <p className="mt-1 text-sm text-gray-500">Try adjusting your search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {filteredImages.map((img) => (
            <div 
              key={img.id} 
              className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 bg-gray-900 aspect-[4/5] cursor-pointer"
            >
              <img
                src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'}${img.thumbPath || img.filePath}`}
                alt={img.fileName}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                loading="lazy"
              />
              
              {/* Gradient Overlay for text */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/10 opacity-60 group-hover:opacity-80 transition-opacity duration-300 pointer-events-none" />
              
              {/* Top Badges */}
              <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
                {img.isPrimary ? (
                  <div className="bg-yellow-400/90 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center shadow-lg">
                    <Star className="h-3.5 w-3.5 text-yellow-900 fill-yellow-900 mr-1" />
                    <span className="text-xs font-bold text-yellow-900">Primary</span>
                  </div>
                ) : <div></div>}
                
                <button
                  onClick={() => handleDelete(img.id)}
                  className="p-2.5 bg-white/10 hover:bg-red-500/90 backdrop-blur-md rounded-full shadow-lg text-white opacity-0 group-hover:opacity-100 transform -translate-y-2 group-hover:translate-y-0 transition-all duration-300"
                  title="Delete Image"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              
              {/* Bottom Info */}
              <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 z-10">
                <h3 className="text-white font-semibold truncate text-sm mb-1.5 drop-shadow-md" title={img.product?.productName || img.fileName}>
                  {img.product?.productName || img.fileName}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="px-2 py-1 bg-white/20 backdrop-blur-md rounded-md text-[10px] font-mono text-white/90 border border-white/10 shadow-sm">
                    {img.product?.productCode || 'No Code'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
