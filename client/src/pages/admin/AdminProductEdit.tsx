import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Trash2,
  Loader2,
  ChevronRight,
  Package,
  Droplets,
  Upload,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';

interface Category {
  id: string;
  name: string;
  level: number;
  children?: Category[];
}

export default function AdminProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [product, setProduct] = useState<any>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form state
  const [form, setForm] = useState({
    productName: '',
    productCode: '',
    categoryId: '',
    size: '',
    fittingConnectionType: '',
    thicknessMm: '',
    length: '',
    color: '',
    classType: '',
    material: '',
    brandManufacturer: '',
    description: '',
    features: [] as string[],
    applications: [] as string[],
    status: 'ACTIVE',
    isFeatured: false,
    metaTitle: '',
    metaDescription: '',
    sourcePageCatalog: '',
  });

  const [newFeature, setNewFeature] = useState('');
  const [newApplication, setNewApplication] = useState('');

  // Fetch product and categories
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      api.get(`/admin/products/${id}`),
      api.get('/admin/categories'),
    ])
      .then(([prodRes, catRes]) => {
        const p = prodRes.data;
        setProduct(p);
        setForm({
          productName: p.productName || '',
          productCode: p.productCode || '',
          categoryId: p.categoryId || '',
          size: p.size || '',
          fittingConnectionType: p.fittingConnectionType || '',
          thicknessMm: p.thicknessMm || '',
          length: p.length || '',
          color: p.color || '',
          classType: p.classType || '',
          material: p.material || '',
          brandManufacturer: p.brandManufacturer || '',
          description: p.description || '',
          features: p.features || [],
          applications: p.applications || [],
          status: p.status || 'ACTIVE',
          isFeatured: p.isFeatured || false,
          metaTitle: p.metaTitle || '',
          metaDescription: p.metaDescription || '',
          sourcePageCatalog: p.sourcePageCatalog || '',
        });
        setCategories(catRes.data);
      })
      .catch(() => toast.error('Failed to load product'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const addFeature = () => {
    const val = newFeature.trim();
    if (!val) return;
    setForm(prev => ({ ...prev, features: [...prev.features, val] }));
    setNewFeature('');
  };

  const removeFeature = (index: number) => {
    setForm(prev => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }));
  };

  const addApplication = () => {
    const val = newApplication.trim();
    if (!val) return;
    setForm(prev => ({ ...prev, applications: [...prev.applications, val] }));
    setNewApplication('');
  };

  const removeApplication = (index: number) => {
    setForm(prev => ({ ...prev, applications: prev.applications.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.productName || !form.productCode || !form.size || !form.categoryId) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSaving(true);
    try {
      await api.put(`/admin/products/${id}`, form);
      toast.success('Product updated successfully');
      navigate(`/admin/products/${id}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !id) return;
    
    setUploadingImage(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('productId', id);
        if (product?.images?.length === 0 && i === 0) {
          formData.append('isPrimary', 'true');
        }
        
        await api.post('/admin/media/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      toast.success('Images uploaded successfully');
      
      const res = await api.get(`/admin/products/${id}`);
      setProduct(res.data);
    } catch (err: any) {
      toast.error('Failed to upload images');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;
    try {
      await api.delete(`/admin/media/${imageId}`);
      toast.success('Image deleted');
      const res = await api.get(`/admin/products/${id}`);
      setProduct(res.data);
    } catch {
      toast.error('Failed to delete image');
    }
  };

  // Flatten categories for select
  const flattenCategories = useCallback((cats: Category[], prefix = ''): { id: string; label: string }[] => {
    return cats.reduce((acc: { id: string; label: string }[], cat) => {
      acc.push({ id: cat.id, label: prefix + cat.name });
      if (cat.children?.length) {
        acc.push(...flattenCategories(cat.children, prefix + cat.name + ' → '));
      }
      return acc;
    }, []);
  }, []);

  const flatCats = flattenCategories(categories);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-heading font-semibold text-gray-900">Product Not Found</h2>
        <Link to="/admin/products" className="text-brand-600 hover:underline mt-2 inline-block">
          ← Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            to={`/admin/products/${id}`}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Detail
          </Link>
          <ChevronRight className="h-3 w-3 text-gray-300" />
          <span className="text-sm text-gray-900 font-medium">Edit Product</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Header Card */}
        <div className="glass-panel p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-heading font-bold text-gray-900">Edit Product</h1>
              <p className="text-sm text-gray-500 mt-1">
                Update the product information below. Fields marked with <span className="text-red-500">*</span> are required.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to={`/admin/products/${id}`}
                className="admin-btn-secondary flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="admin-btn-primary flex items-center gap-2"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="glass-panel p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <span className="h-1.5 w-1.5 bg-brand-600 rounded-full" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="productName"
                    value={form.productName}
                    onChange={handleChange}
                    className="admin-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Product Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="productCode"
                    value={form.productCode}
                    onChange={handleChange}
                    className="admin-input font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="categoryId"
                    value={form.categoryId}
                    onChange={handleChange}
                    className="admin-input"
                    required
                  >
                    <option value="">Select a category</option>
                    {flatCats.map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Specifications */}
            <div className="glass-panel p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <span className="h-1.5 w-1.5 bg-brand-600 rounded-full" />
                Specifications
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Size <span className="text-red-500">*</span>
                  </label>
                  <input type="text" name="size" value={form.size} onChange={handleChange} className="admin-input" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Fitting / Connection Type</label>
                  <input type="text" name="fittingConnectionType" value={form.fittingConnectionType} onChange={handleChange} className="admin-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Thickness (mm)</label>
                  <input type="text" name="thicknessMm" value={form.thicknessMm} onChange={handleChange} className="admin-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Length</label>
                  <input type="text" name="length" value={form.length} onChange={handleChange} className="admin-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Color</label>
                  <input type="text" name="color" value={form.color} onChange={handleChange} className="admin-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Class Type</label>
                  <input type="text" name="classType" value={form.classType} onChange={handleChange} className="admin-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Material</label>
                  <input type="text" name="material" value={form.material} onChange={handleChange} className="admin-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Brand / Manufacturer</label>
                  <input type="text" name="brandManufacturer" value={form.brandManufacturer} onChange={handleChange} className="admin-input" />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="glass-panel p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <span className="h-1.5 w-1.5 bg-brand-600 rounded-full" />
                Description
              </h3>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={5}
                className="admin-input resize-y"
                placeholder="Enter product description..."
              />
            </div>

            {/* Features */}
            <div className="glass-panel p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <span className="h-1.5 w-1.5 bg-brand-600 rounded-full" />
                Features
              </h3>
              <div className="space-y-2 mb-3">
                {form.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 group">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-400 flex-shrink-0" />
                    <span className="flex-1 text-sm text-gray-700">{f}</span>
                    <button
                      type="button"
                      onClick={() => removeFeature(i)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addFeature(); } }}
                  className="admin-input flex-1"
                  placeholder="Add a feature..."
                />
                <button type="button" onClick={addFeature} className="admin-btn-secondary px-3">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Applications */}
            <div className="glass-panel p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <span className="h-1.5 w-1.5 bg-brand-600 rounded-full" />
                Applications
              </h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {form.applications.map((a, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-700 rounded-full text-xs font-medium ring-1 ring-inset ring-brand-200 group">
                    {a}
                    <button
                      type="button"
                      onClick={() => removeApplication(i)}
                      className="opacity-60 hover:opacity-100 hover:text-red-600 transition-all"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newApplication}
                  onChange={(e) => setNewApplication(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addApplication(); } }}
                  className="admin-input flex-1"
                  placeholder="Add an application..."
                />
                <button type="button" onClick={addApplication} className="admin-btn-secondary px-3">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            {/* Current Images */}
            <div className="glass-panel p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="h-1.5 w-1.5 bg-brand-600 rounded-full" />
                Product Images
              </h3>
              {product.images?.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {product.images.map((img: any) => (
                    <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50 group">
                      <img
                        src={`http://localhost:3000${img.thumbPath || img.filePath}`}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(img.id)}
                        className="absolute top-1 right-1 p-1.5 bg-white/90 text-red-600 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      {img.isPrimary && (
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-brand-600 text-white text-[10px] font-bold rounded">
                          Primary
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="aspect-square bg-gray-50 rounded-xl flex flex-col items-center justify-center text-gray-300">
                  <Droplets className="h-12 w-12 mb-2" />
                  <span className="text-xs">No images</span>
                </div>
              )}
              
              <div className="mt-4 flex flex-col gap-2">
                <label className="admin-btn-secondary w-full flex items-center justify-center gap-2 cursor-pointer">
                  {uploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {uploadingImage ? 'Uploading...' : 'Upload Images'}
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                  />
                </label>
                <p className="text-[11px] text-gray-400 text-center">
                  You can upload multiple images at once. Primary image is set automatically.
                </p>
              </div>
            </div>

            {/* Status & Visibility */}
            <div className="glass-panel p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <span className="h-1.5 w-1.5 bg-brand-600 rounded-full" />
                Status & Visibility
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                  <select name="status" value={form.status} onChange={handleChange} className="admin-input">
                    <option value="ACTIVE">Active</option>
                    <option value="UPCOMING">Upcoming</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="DISCONTINUED">Discontinued</option>
                  </select>
                </div>
                <div className="flex items-center justify-between py-2">
                  <label className="text-sm font-medium text-gray-700">Featured Product</label>
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, isFeatured: !prev.isFeatured }))}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2 ${
                      form.isFeatured ? 'bg-brand-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        form.isFeatured ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* SEO */}
            <div className="glass-panel p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <span className="h-1.5 w-1.5 bg-brand-600 rounded-full" />
                SEO Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Meta Title</label>
                  <input
                    type="text"
                    name="metaTitle"
                    value={form.metaTitle}
                    onChange={handleChange}
                    className="admin-input"
                    placeholder="SEO title..."
                  />
                  <p className="text-xs text-gray-400 mt-1">{form.metaTitle.length}/60 characters</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Meta Description</label>
                  <textarea
                    name="metaDescription"
                    value={form.metaDescription}
                    onChange={handleChange}
                    rows={3}
                    className="admin-input resize-y"
                    placeholder="SEO description..."
                  />
                  <p className="text-xs text-gray-400 mt-1">{form.metaDescription.length}/160 characters</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Source Page / Catalog</label>
                  <input
                    type="text"
                    name="sourcePageCatalog"
                    value={form.sourcePageCatalog}
                    onChange={handleChange}
                    className="admin-input"
                    placeholder="e.g. Catalog Page 12"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Save Bar */}
        <div className="sticky bottom-0 mt-6 -mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8 py-4 bg-white/90 backdrop-blur-lg border-t border-gray-200 flex items-center justify-end gap-3 z-10">
          <Link
            to={`/admin/products/${id}`}
            className="admin-btn-secondary flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="admin-btn-primary flex items-center gap-2"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
