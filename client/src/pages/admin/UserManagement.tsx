import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, RotateCcw, Shield, ShieldCheck, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import useAuthStore from '../../store/useAuthStore';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'CATALOG_MANAGER' | 'SALES_STAFF';
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

const roleIcons: Record<string, React.ReactNode> = {
  SUPER_ADMIN: <ShieldCheck className="h-4 w-4 text-red-500" />,
  CATALOG_MANAGER: <ShieldAlert className="h-4 w-4 text-blue-500" />,
  SALES_STAFF: <Shield className="h-4 w-4 text-green-500" />,
};

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  CATALOG_MANAGER: 'Catalog Manager',
  SALES_STAFF: 'Sales Staff',
};

const roleBadgeColors: Record<string, string> = {
  SUPER_ADMIN: 'bg-red-100 text-red-800 border-red-200',
  CATALOG_MANAGER: 'bg-blue-100 text-blue-800 border-blue-200',
  SALES_STAFF: 'bg-green-100 text-green-800 border-green-200',
};

export default function UserManagement() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = useAuthStore((s) => s.user);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'SALES_STAFF', password: '', isActive: true });
  const [isSaving, setIsSaving] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User deleted');
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleResetPassword = async (id: string, name: string) => {
    if (!window.confirm(`Reset password for "${name}" to the default? They will need to change it on next login.`)) return;
    try {
      await api.post(`/admin/users/${id}/reset-password`);
      toast.success('Password reset successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    }
  };

  const openModal = (user?: AdminUser) => {
    if (user) {
      setEditingUser(user);
      setFormData({ name: user.name, email: user.email, role: user.role, password: '', isActive: user.isActive });
    } else {
      setEditingUser(null);
      setFormData({ name: '', email: '', role: 'SALES_STAFF', password: '', isActive: true });
    }
    setIsModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingUser) {
        // Edit
        const payload: any = { name: formData.name, email: formData.email, role: formData.role, isActive: formData.isActive };
        if (formData.password) payload.password = formData.password;
        await api.put(`/admin/users/${editingUser.id}`, payload);
        toast.success('User updated successfully');
      } else {
        // Create
        if (!formData.password) {
          toast.error('Password is required for new users');
          setIsSaving(false);
          return;
        }
        await api.post('/admin/users', formData);
        toast.success('User created successfully');
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save user');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-gray-900 flex items-center">
            <Users className="h-6 w-6 mr-3 text-brand-600" />
            User Management
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage admin accounts, roles, and access control.
          </p>
        </div>
        <button onClick={() => openModal()} className="mt-4 sm:mt-0 admin-btn-primary flex items-center">
          <Plus className="h-4 w-4 mr-2" /> Add User
        </button>
      </div>

      <div className="glass-panel overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/80">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">Loading users...</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center">
                          <span className="text-brand-700 font-semibold text-sm">{user.name.charAt(0)}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${roleBadgeColors[user.role]}`}>
                        {roleIcons[user.role]}
                        {roleLabels[user.role]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.isActive ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">Active</span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">Inactive</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openModal(user)} className="p-1.5 text-gray-400 hover:text-brand-600 transition-colors" title="Edit">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleResetPassword(user.id, user.name)}
                          className="p-1.5 text-gray-400 hover:text-orange-600 transition-colors"
                          title="Reset Password"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </button>
                        {user.id !== currentUser?.id && (
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden" style={{ animation: 'slideUp 0.2s ease-out' }}>
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold text-lg">{editingUser ? 'Edit User' : 'Add New User'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <ShieldAlert className="h-5 w-5 opacity-0" /> {/* Spacer */}
              </button>
            </div>
            <form onSubmit={handleSaveUser} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input required type="text" className="admin-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Abdul Karim" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input required type="email" className="admin-input" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="abdul.karim@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select className="admin-input" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                  <option value="SALES_STAFF">Sales Staff</option>
                  <option value="CATALOG_MANAGER">Catalog Manager</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {editingUser ? 'New Password (leave blank to keep current)' : 'Password'}
                </label>
                <input type="password" required={!editingUser} className="admin-input" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} placeholder={editingUser ? '••••••••' : 'Password'} minLength={6} />
              </div>
              {editingUser && editingUser.id !== currentUser?.id && (
                <div className="flex items-center">
                  <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} className="h-4 w-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500" />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">Active Account</label>
                </div>
              )}
              
              <div className="pt-4 flex justify-end gap-3 border-t mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="admin-btn-secondary">Cancel</button>
                <button type="submit" disabled={isSaving} className="admin-btn-primary">{isSaving ? 'Saving...' : 'Save User'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
