import React, { useState, useEffect } from 'react';
import { FolderTree, Plus, Edit2, Trash2, ChevronRight, ChevronDown, X, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';

interface Category {
  id: string;
  name: string;
  slug: string;
  level: number;
  sortOrder: number;
  parentId: string | null;
  description?: string;
  image?: string;
  icon?: string;
  isVisible?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  _count: { products: number };
  children: Category[];
}

// ─── Edit Modal ─────────────────────────────────────────
interface EditModalProps {
  category: Category | null;
  allCategories: Category[];
  onClose: () => void;
  onSaved: () => void;
}

function flattenForSelect(cats: Category[], prefix = '', excludeId?: string): { id: string; label: string }[] {
  return cats.reduce((acc: { id: string; label: string }[], cat) => {
    if (cat.id !== excludeId) {
      acc.push({ id: cat.id, label: prefix + cat.name });
      if (cat.children?.length) {
        acc.push(...flattenForSelect(cat.children, prefix + '  └─ ', excludeId));
      }
    }
    return acc;
  }, []);
}

const CategoryModal: React.FC<EditModalProps> = ({ category, allCategories, onClose, onSaved }) => {
  const isEditing = !!category;
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    parentId: '' as string | null,
    sortOrder: 0,
    isVisible: true,
    metaTitle: '',
    metaDescription: '',
  });

  useEffect(() => {
    if (category) {
      setForm({
        name: category.name || '',
        slug: category.slug || '',
        description: (category as any).description || '',
        parentId: category.parentId || '',
        sortOrder: category.sortOrder || 0,
        isVisible: (category as any).isVisible ?? true,
        metaTitle: (category as any).metaTitle || '',
        metaDescription: (category as any).metaDescription || '',
      });
    } else {
      setForm({
        name: '',
        slug: '',
        description: '',
        parentId: '',
        sortOrder: 0,
        isVisible: true,
        metaTitle: '',
        metaDescription: '',
      });
    }
  }, [category]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked
        : name === 'sortOrder' ? parseInt(value, 10) || 0
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Category name is required');
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        name: form.name.trim(),
        sortOrder: form.sortOrder,
        isVisible: form.isVisible,
        description: form.description || undefined,
        metaTitle: form.metaTitle || undefined,
        metaDescription: form.metaDescription || undefined,
      };

      // Only send slug if it was changed
      if (form.slug && (!isEditing || form.slug !== category?.slug)) {
        payload.slug = form.slug;
      }

      // Handle parent change
      if (!isEditing || form.parentId !== (category?.parentId || '')) {
        payload.parentId = form.parentId || null;
      }

      if (isEditing) {
        await api.put(`/admin/categories/${category?.id}`, payload);
        toast.success('Category updated successfully');
      } else {
        await api.post(`/admin/categories`, payload);
        toast.success('Category created successfully');
      }
      onSaved();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update category');
    } finally {
      setSaving(false);
    }
  };

  const parentOptions = flattenForSelect(allCategories, '', category?.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        style={{ animation: 'modalIn 0.2s ease-out' }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-heading font-bold text-gray-900">{isEditing ? 'Edit Category' : 'Create Category'}</h2>
            {isEditing && <p className="text-xs text-gray-400 mt-0.5">ID: {category?.id}</p>}
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="admin-input"
              required
              autoFocus
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Slug
            </label>
            <input
              type="text"
              name="slug"
              value={form.slug}
              onChange={handleChange}
              className="admin-input font-mono text-sm"
              placeholder="auto-generated-from-name"
            />
            <p className="text-xs text-gray-400 mt-1">Leave unchanged unless you want a custom URL slug</p>
          </div>

          {/* Parent Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Parent Category
            </label>
            <select
              name="parentId"
              value={form.parentId || ''}
              onChange={handleChange}
              className="admin-input"
            >
              <option value="">— Root Category (no parent) —</option>
              {parentOptions.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">Move this category under a different parent</p>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Sort Order
            </label>
            <input
              type="number"
              name="sortOrder"
              value={form.sortOrder}
              onChange={handleChange}
              className="admin-input w-32"
              min={0}
            />
            <p className="text-xs text-gray-400 mt-1">Lower numbers appear first</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="admin-input resize-y"
              placeholder="Optional category description..."
            />
          </div>

          {/* Visibility Toggle */}
          <div className="flex items-center justify-between py-2 px-4 bg-gray-50 rounded-xl">
            <div>
              <label className="text-sm font-medium text-gray-700">Visible on Website</label>
              <p className="text-xs text-gray-400">Show this category on the public site</p>
            </div>
            <button
              type="button"
              onClick={() => setForm(prev => ({ ...prev, isVisible: !prev.isVisible }))}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2 ${
                form.isVisible ? 'bg-brand-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  form.isVisible ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* SEO Section */}
          <div className="border-t border-gray-100 pt-5">
            <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-brand-600 rounded-full" />
              SEO Settings
            </h4>
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
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Meta Description</label>
                <textarea
                  name="metaDescription"
                  value={form.metaDescription}
                  onChange={handleChange}
                  rows={2}
                  className="admin-input resize-y"
                  placeholder="SEO description..."
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="admin-btn-secondary flex items-center gap-2">
              <X className="h-4 w-4" />
              Cancel
            </button>
            <button type="submit" disabled={saving} className="admin-btn-primary flex items-center gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

// ─── Category Node (Tree Item) ──────────────────────────
const CategoryNode: React.FC<{
  node: Category;
  depth?: number;
  onRefresh: () => void;
  onEdit: (cat: Category) => void;
}> = ({ node, depth = 0, onRefresh, onEdit }) => {
  const [expanded, setExpanded] = useState(true);

  const handleDelete = async () => {
    if (node._count.products > 0) {
      toast.error(`Cannot delete category with ${node._count.products} products`);
      return;
    }
    if (!window.confirm(`Delete category "${node.name}"?`)) return;

    try {
      await api.delete(`/admin/categories/${node.id}`);
      toast.success('Category deleted');
      onRefresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete category');
    }
  };

  const depthColors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-red-500',
    'bg-blue-500'
  ];
  const depthBg = [
    'bg-red-50 text-red-700 border-red-100',
    'bg-blue-50 text-blue-700 border-blue-100',
    'bg-green-50 text-green-700 border-green-100',
    'bg-red-50 text-red-700 border-red-100',
    'bg-blue-50 text-blue-700 border-blue-100'
  ];
  const colorIdx = Math.min(depth, depthColors.length - 1);

  return (
    <div className="w-full">
      <div
        className={`flex items-center justify-between p-3.5 mb-3 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden`}
        style={{ marginLeft: `${depth * 3}rem`, width: `calc(100% - ${depth * 3}rem)` }}
      >
        {/* Colorful left border indicator */}
        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${depthColors[colorIdx]}`} />
        
        <div className="flex items-center gap-4 min-w-0 pl-3">
          {node.children.length > 0 ? (
            <button
              onClick={() => setExpanded(!expanded)}
              className={`p-1.5 rounded-xl transition-all duration-300 ${expanded ? 'bg-gray-100 text-gray-800' : 'bg-gray-50 text-gray-400 -rotate-90 hover:bg-gray-200'}`}
            >
              <ChevronDown className="h-5 w-5" />
            </button>
          ) : (
            <div className="w-8 h-8 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
            </div>
          )}
          
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <span className="font-bold text-gray-900 truncate text-base">{node.name}</span>
              <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border ${depthBg[colorIdx]}`}>
                {node._count.products} products
              </span>
              {!node.isVisible && (
                <span className="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider bg-gray-100 text-gray-500 border border-gray-200">
                  Hidden
                </span>
              )}
            </div>
            <span className="text-xs text-gray-400 font-mono flex items-center gap-2 mt-0.5">
              <span>Slug: {node.slug}</span>
              <span className="text-gray-300">•</span>
              <span>Order: #{node.sortOrder}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 pr-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
          <button
            onClick={() => onEdit(node)}
            className="p-2 text-brand-600 bg-brand-50 hover:bg-brand-100 hover:text-brand-700 rounded-xl transition-all shadow-sm flex items-center gap-2"
            title="Edit"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 rounded-xl transition-all shadow-sm flex items-center gap-2"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {expanded && node.children.length > 0 && (
        <div className="flex flex-col relative mt-1">
          {node.children.map(child => (
            <CategoryNode
              key={child.id}
              node={child}
              depth={depth + 1}
              onRefresh={onRefresh}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main Page ──────────────────────────────────────────
export default function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/categories/tree');
      setCategories(res.data);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleEdit = (cat: Category) => {
    setEditingCategory(cat);
  };

  const handleEditClose = () => {
    setEditingCategory(null);
  };

  const handleEditSaved = () => {
    setEditingCategory(null);
    setIsCreating(false);
    fetchCategories();
  };

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-gray-900 flex items-center">
            <FolderTree className="h-6 w-6 mr-3 text-brand-600" />
            Category Hierarchy
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your product categories, sub-categories, and structural hierarchy.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          <button type="button" onClick={() => setIsCreating(true)} className="admin-btn-primary flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Add Root Category
          </button>
        </div>
      </div>

      <div className="mt-8">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-center gap-3">
              <div className="w-6 h-6 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
              <span className="font-medium text-lg">Loading hierarchy...</span>
            </div>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-3xl border border-dashed border-gray-300 flex flex-col items-center justify-center">
            <div className="p-4 bg-gray-50 rounded-2xl mb-4">
              <FolderTree className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No categories yet</h3>
            <p className="text-sm text-gray-500">Get started by creating your first root category.</p>
          </div>
        ) : (
          <div className="flex flex-col pb-12">
            {categories.map(cat => (
              <CategoryNode
                key={cat.id}
                node={cat}
                onRefresh={fetchCategories}
                onEdit={handleEdit}
              />
            ))}
          </div>
        )}
      </div>

      {/* Edit/Create Modal */}
      {(editingCategory || isCreating) && (
        <CategoryModal
          category={editingCategory}
          allCategories={categories}
          onClose={() => {
            setEditingCategory(null);
            setIsCreating(false);
          }}
          onSaved={handleEditSaved}
        />
      )}
    </div>
  );
}
