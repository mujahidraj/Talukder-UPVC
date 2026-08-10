import React, { useState, useEffect } from 'react';
import { FolderTree, Plus, Edit2, Trash2, ChevronRight, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';

interface Category {
  id: string;
  name: string;
  slug: string;
  level: number;
  sortOrder: number;
  _count: { products: number };
  children: Category[];
}

const CategoryNode: React.FC<{ node: Category; depth?: number; onRefresh: () => void }> = ({ node, depth = 0, onRefresh }) => {
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

  return (
    <div className="w-full">
      <div 
        className="flex items-center justify-between py-3 px-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
        style={{ paddingLeft: `${(depth * 2) + 1}rem` }}
      >
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setExpanded(!expanded)} 
            className={`p-1 rounded hover:bg-gray-200 transition-colors ${node.children.length === 0 ? 'invisible' : ''}`}
          >
            {expanded ? <ChevronDown className="h-4 w-4 text-gray-500" /> : <ChevronRight className="h-4 w-4 text-gray-500" />}
          </button>
          <span className="font-medium text-gray-900">{node.name}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 font-medium">
            {node._count.products} products
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-1.5 text-gray-400 hover:text-brand-600 transition-colors" title="Edit">
            <Edit2 className="h-4 w-4" />
          </button>
          <button onClick={handleDelete} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors" title="Delete">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {expanded && node.children.length > 0 && (
        <div className="flex flex-col">
          {node.children.map(child => (
            <CategoryNode key={child.id} node={child} depth={depth + 1} onRefresh={onRefresh} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
          <button type="button" className="admin-btn-primary flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Add Root Category
          </button>
        </div>
      </div>

      <div className="glass-panel overflow-hidden bg-white">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading hierarchy...</div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No categories found.</div>
        ) : (
          <div className="flex flex-col">
            {categories.map(cat => (
              <CategoryNode key={cat.id} node={cat} onRefresh={fetchCategories} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
