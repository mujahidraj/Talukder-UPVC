import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit2,
  Copy,
  Trash2,
  Eye,
  Heart,
  MessageSquare,
  Calendar,
  User,
  Tag,
  Package,
  Star,
  ExternalLink,
  ChevronRight,
  Droplets,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';

export default function AdminProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/admin/products/${id}`)
      .then(r => setProduct(r.data))
      .catch(() => toast.error('Failed to load product'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this product? It will be soft-deleted.')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      toast.success('Product deleted');
      navigate('/admin/products');
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const handleClone = async () => {
    try {
      const res = await api.post(`/admin/products/${id}/clone`);
      toast.success('Product cloned');
      navigate(`/admin/products/${res.data.id}`);
    } catch {
      toast.error('Failed to clone product');
    }
  };

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

  const statusColors: Record<string, string> = {
    ACTIVE: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    UPCOMING: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    INACTIVE: 'bg-gray-50 text-gray-600 ring-gray-500/20',
    DISCONTINUED: 'bg-red-50 text-red-700 ring-red-600/20',
  };

  const breadcrumbs: string[] = [];
  if (product.category?.parent?.parent) breadcrumbs.push(product.category.parent.parent.name);
  if (product.category?.parent) breadcrumbs.push(product.category.parent.name);
  if (product.category) breadcrumbs.push(product.category.name);

  const specs = [
    { label: 'Size', value: product.size },
    { label: 'Fitting / Connection', value: product.fittingConnectionType },
    { label: 'Thickness (mm)', value: product.thicknessMm },
    { label: 'Length', value: product.length },
    { label: 'Color', value: product.color },
    { label: 'Class Type', value: product.classType },
    { label: 'Material', value: product.material },
    { label: 'Brand / Manufacturer', value: product.brandManufacturer },
  ].filter(s => s.value);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Link>
          <ChevronRight className="h-3 w-3 text-gray-300" />
          <span className="text-sm text-gray-900 font-medium truncate max-w-[200px]">{product.productName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={`/admin/products/${id}/edit`}
            className="admin-btn-primary flex items-center gap-2"
          >
            <Edit2 className="h-4 w-4" />
            Edit Product
          </Link>
          <button onClick={handleClone} className="admin-btn-secondary flex items-center gap-2">
            <Copy className="h-4 w-4" />
            Clone
          </button>
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-700 bg-red-50 rounded-md ring-1 ring-inset ring-red-200 hover:bg-red-100 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column — Images + Quick Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Image Gallery */}
          <div className="glass-panel p-4">
            <div className="aspect-square bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden mb-3">
              {product.images?.length > 0 ? (
                <img
                  src={`http://localhost:3000${product.images[activeImage]?.fullPath || product.images[activeImage]?.filePath}`}
                  alt={product.productName}
                  className="w-full h-full object-contain p-4"
                />
              ) : (
                <Droplets className="h-20 w-20 text-gray-200" />
              )}
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img: any, i: number) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      i === activeImage ? 'border-brand-600 ring-2 ring-brand-200' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={`http://localhost:3000${img.thumbPath || img.filePath}`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Analytics Card */}
          <div className="glass-panel p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-brand-600 rounded-full" />
              Analytics
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-blue-50 rounded-xl">
                <Eye className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                <div className="text-xl font-bold text-blue-900 tabular-nums">{product.viewCount ?? 0}</div>
                <div className="text-xs text-blue-600 font-medium">Views</div>
              </div>
              <div className="text-center p-3 bg-pink-50 rounded-xl">
                <Heart className="h-5 w-5 text-pink-600 mx-auto mb-1" />
                <div className="text-xl font-bold text-pink-900 tabular-nums">{product.wishlistCount ?? 0}</div>
                <div className="text-xs text-pink-600 font-medium">Wishlist</div>
              </div>
              <div className="text-center p-3 bg-emerald-50 rounded-xl">
                <MessageSquare className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
                <div className="text-xl font-bold text-emerald-900 tabular-nums">{product.enquiryCount ?? 0}</div>
                <div className="text-xs text-emerald-600 font-medium">Enquiries</div>
              </div>
            </div>
          </div>

          {/* Audit Info */}
          <div className="glass-panel p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-brand-600 rounded-full" />
              Audit Trail
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <User className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-gray-500">Created by</span>
                  <p className="font-medium text-gray-900">{product.createdBy?.name || 'System'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-gray-500">Created at</span>
                  <p className="font-medium text-gray-900">{new Date(product.createdAt).toLocaleString()}</p>
                </div>
              </div>
              {product.lastModifiedBy && (
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-gray-500">Last modified by</span>
                    <p className="font-medium text-gray-900">{product.lastModifiedBy.name}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-gray-500">Last updated</span>
                  <p className="font-medium text-gray-900">{new Date(product.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column — Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Header */}
          <div className="glass-panel p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                {/* Category breadcrumb */}
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
                  {breadcrumbs.map((bc, i) => (
                    <React.Fragment key={i}>
                      {i > 0 && <ChevronRight className="h-3 w-3" />}
                      <span className="text-brand-600 font-medium">{bc}</span>
                    </React.Fragment>
                  ))}
                </div>
                <h1 className="text-2xl font-heading font-bold text-gray-900">{product.productName}</h1>
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-lg text-sm font-mono font-medium text-gray-700 border border-gray-200">
                    <Tag className="h-3.5 w-3.5" />
                    {product.productCode}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset ${statusColors[product.status] || statusColors.ACTIVE}`}>
                    {product.status}
                  </span>
                  {product.isFeatured && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-semibold ring-1 ring-inset ring-amber-600/20">
                      <Star className="h-3 w-3 fill-amber-500" />
                      Featured
                    </span>
                  )}
                </div>
              </div>
              <Link
                to={`/products/${product.slug}`}
                target="_blank"
                className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-600 bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors ring-1 ring-inset ring-brand-200"
              >
                <ExternalLink className="h-3 w-3" />
                View Public Page
              </Link>
            </div>
            <p className="text-xs text-gray-400 font-mono">Slug: {product.slug}</p>
          </div>

          {/* Description */}
          {product.description && (
            <div className="glass-panel p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="h-1.5 w-1.5 bg-brand-600 rounded-full" />
                Description
              </h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{product.description}</p>
            </div>
          )}

          {/* Specifications */}
          {specs.length > 0 && (
            <div className="glass-panel p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="h-1.5 w-1.5 bg-brand-600 rounded-full" />
                Specifications
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {specs.map(spec => (
                  <div key={spec.label} className="flex items-center py-2.5 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="text-sm text-gray-500 w-40 flex-shrink-0">{spec.label}</span>
                    <span className="text-sm font-medium text-gray-900">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Features & Applications */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {product.features?.length > 0 && (
              <div className="glass-panel p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 bg-brand-600 rounded-full" />
                  Features
                </h3>
                <ul className="space-y-2">
                  {product.features.map((f: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-400 mt-1.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {product.applications?.length > 0 && (
              <div className="glass-panel p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 bg-brand-600 rounded-full" />
                  Applications
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.applications.map((a: string, i: number) => (
                    <span key={i} className="px-3 py-1.5 bg-brand-50 text-brand-700 rounded-full text-xs font-medium ring-1 ring-inset ring-brand-200">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SEO & Metadata */}
          <div className="glass-panel p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-brand-600 rounded-full" />
              SEO & Metadata
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start py-2">
                <span className="text-gray-500 w-40 flex-shrink-0">Meta Title</span>
                <span className="text-gray-900">{product.metaTitle || <span className="text-gray-300 italic">Not set</span>}</span>
              </div>
              <div className="flex items-start py-2 border-t border-gray-100">
                <span className="text-gray-500 w-40 flex-shrink-0">Meta Description</span>
                <span className="text-gray-900">{product.metaDescription || <span className="text-gray-300 italic">Not set</span>}</span>
              </div>
              {product.sourcePageCatalog && (
                <div className="flex items-start py-2 border-t border-gray-100">
                  <span className="text-gray-500 w-40 flex-shrink-0">Source Page/Catalog</span>
                  <span className="text-gray-900">{product.sourcePageCatalog}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
