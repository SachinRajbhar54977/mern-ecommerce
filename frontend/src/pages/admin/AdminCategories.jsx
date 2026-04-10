import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Spinner } from '../../components/common/index';
import { MdAdd, MdEdit, MdDelete, MdClose } from 'react-icons/md';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [modalOpen,  setModalOpen]  = useState(false);
  const [editing,    setEditing]    = useState(null);
  const [form,       setForm]       = useState({ name: '', description: '', parent: '' });
  const [saving,     setSaving]     = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const r = await api.get('/categories');
      setCategories(r.data.categories);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', description: '', parent: '' });
    setModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setForm({ name: cat.name, description: cat.description || '', parent: cat.parent?._id || '' });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/categories/${editing._id}`, form);
        toast.success('Category updated');
      } else {
        await api.post('/categories', form);
        toast.success('Category created');
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"? This may affect products.`)) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Category deleted');
      setCategories((prev) => prev.filter((c) => c._id !== id));
    } catch { toast.error('Delete failed'); }
  };

  const rootCategories = categories.filter((c) => !c.parent);
  const subCategories  = categories.filter((c) => c.parent);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-primary">
          Categories <span className="text-muted text-lg font-sans font-normal">({categories.length})</span>
        </h1>
        <button onClick={openAdd} className="btn-accent py-2.5 px-5 text-sm gap-1.5">
          <MdAdd size={18} /> Add Category
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Root Categories */}
          <div className="card p-5">
            <h2 className="font-semibold text-primary mb-4 text-sm uppercase tracking-wider">
              Main Categories ({rootCategories.length})
            </h2>
            <div className="space-y-2">
              {rootCategories.map((cat) => (
                <div key={cat._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-alt transition-colors">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-primary">{cat.name}</p>
                    {cat.description && <p className="text-xs text-muted">{cat.description}</p>}
                    {/* Count subcategories */}
                    <p className="text-xs text-muted mt-0.5">
                      {subCategories.filter((s) => s.parent?._id === cat._id).length} subcategories
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(cat)} className="btn-ghost p-1.5 text-blue-500 hover:bg-blue-50">
                      <MdEdit size={15} />
                    </button>
                    <button onClick={() => handleDelete(cat._id, cat.name)} className="btn-ghost p-1.5 text-red-500 hover:bg-red-50">
                      <MdDelete size={15} />
                    </button>
                  </div>
                </div>
              ))}
              {rootCategories.length === 0 && (
                <p className="text-muted text-sm text-center py-6">No main categories yet</p>
              )}
            </div>
          </div>

          {/* Subcategories */}
          <div className="card p-5">
            <h2 className="font-semibold text-primary mb-4 text-sm uppercase tracking-wider">
              Subcategories ({subCategories.length})
            </h2>
            <div className="space-y-2">
              {subCategories.map((cat) => (
                <div key={cat._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-alt transition-colors">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-primary">{cat.name}</p>
                    <p className="text-xs text-muted">
                      Under: <span className="text-accent">{cat.parent?.name}</span>
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(cat)} className="btn-ghost p-1.5 text-blue-500 hover:bg-blue-50">
                      <MdEdit size={15} />
                    </button>
                    <button onClick={() => handleDelete(cat._id, cat.name)} className="btn-ghost p-1.5 text-red-500 hover:bg-red-50">
                      <MdDelete size={15} />
                    </button>
                  </div>
                </div>
              ))}
              {subCategories.length === 0 && (
                <p className="text-muted text-sm text-center py-6">No subcategories yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 animate-slide-up">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-primary text-lg">
                  {editing ? 'Edit Category' : 'New Category'}
                </h2>
                <button onClick={() => setModalOpen(false)} className="btn-ghost p-1.5">
                  <MdClose size={20} />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-primary/70 block mb-1.5">Name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="input text-sm"
                    placeholder="e.g. Electronics"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-primary/70 block mb-1.5">Description</label>
                  <input
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    className="input text-sm"
                    placeholder="Optional description"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-primary/70 block mb-1.5">Parent Category</label>
                  <select
                    value={form.parent}
                    onChange={(e) => setForm((f) => ({ ...f, parent: e.target.value }))}
                    className="input text-sm"
                  >
                    <option value="">None (root category)</option>
                    {rootCategories
                      .filter((c) => !editing || c._id !== editing._id)
                      .map((c) => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))
                    }
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setModalOpen(false)} className="btn-outline flex-1 py-2.5">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="btn-accent flex-1 py-2.5">
                    {saving ? <Spinner size="sm" /> : (editing ? 'Update' : 'Create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
