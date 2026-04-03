import { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { useToast } from '../../contexts/ToastContext';

const AdminCategories = () => {
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', description: '' });
  const [editId, setEditId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get('/v1/categories');
      setCategories(data.data || data.categories || []);
    } catch { showToast('Failed to load categories', 'error'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSubmitting(true);
    try {
      if (editId) {
        await apiClient.put(`/v1/categories/${editId}`, form);
        showToast('Category updated', 'success');
      } else {
        await apiClient.post('/v1/categories', form);
        showToast('Category created', 'success');
      }
      setForm({ name: '', description: '' });
      setEditId(null);
      fetchCategories();
    } catch (err) {
      showToast(err.message || 'Failed to save category', 'error');
    } finally { setSubmitting(false); }
  };

  const handleEdit = (cat) => { setEditId(cat.id); setForm({ name: cat.name, description: cat.description || '' }); };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await apiClient.delete(`/v1/categories/${id}`);
      setCategories(prev => prev.filter(c => c.id !== id));
      showToast('Category deleted', 'success');
    } catch (err) { showToast(err.message || 'Failed to delete', 'error'); }
  };

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '24px' }}>Category Management</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '24px' }}>
        {/* Form */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', height: 'fit-content' }}>
          <h3 style={{ marginBottom: '16px' }}>{editId ? 'Edit Category' : 'Add Category'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontWeight: 500, marginBottom: '4px' }}>Name *</label>
              <input className="form-control" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="e.g. Electronics" />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: 500, marginBottom: '4px' }}>Description</label>
              <textarea className="form-control" rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Optional description" />
            </div>
            <button type="submit" disabled={submitting} style={{ width: '100%', padding: '10px', background: '#f97316', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
              {submitting ? 'Saving...' : editId ? 'Update Category' : 'Add Category'}
            </button>
            {editId && (
              <button type="button" onClick={() => { setEditId(null); setForm({ name: '', description: '' }); }} style={{ width: '100%', padding: '10px', background: 'white', color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', marginTop: '8px' }}>
                Cancel
              </button>
            )}
          </form>
        </div>
        {/* List */}
        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          {loading ? <div style={{ padding: '40px', textAlign: 'center' }}><div className="spinner-border" /></div> : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f9fafb' }}>
                <tr>
                  {['#', 'Name', 'Description', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '0.875rem', color: '#374151' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, i) => (
                  <tr key={cat.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: '0.875rem' }}>{i + 1}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 500 }}>{cat.name}</td>
                    <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: '0.875rem' }}>{cat.description || '—'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <button onClick={() => handleEdit(cat)} style={{ marginRight: '8px', padding: '4px 12px', background: '#f97316', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>Edit</button>
                      <button onClick={() => handleDelete(cat.id)} style={{ padding: '4px 12px', background: 'white', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>Delete</button>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr><td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>No categories yet. Add your first one.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;
