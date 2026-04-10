// ─── AdminProductForm.jsx ─────────────────────────────────────
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Spinner } from '../../components/common/index';
import { MdArrowBack } from 'react-icons/md';

export function AdminProductForm() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const isEdit   = Boolean(id);

  const [form, setForm] = useState({
    name: '', description: '', brand: '', price: '', discountPercent: '0',
    stock: '', category: '', isFeatured: false, isBestSeller: false, isNewArrival: false,
  });
  const [categories, setCategories] = useState([]);
  const [images, setImages]         = useState([]);
  const [loading, setLoading]       = useState(false);

  useEffect(() => {
    api.get('/categories').then((r) => setCategories(r.data.categories)).catch(() => {});
    if (isEdit) {
      api.get(`/products/${id}`).then((r) => {
        const p = r.data.product;
        setForm({
          name: p.name, description: p.description, brand: p.brand,
          price: p.price, discountPercent: p.discountPercent || 0,
          stock: p.stock, category: p.category?._id || '',
          isFeatured: p.isFeatured, isBestSeller: p.isBestSeller, isNewArrival: p.isNewArrival,
        });
      }).catch(() => {});
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      images.forEach((img) => fd.append('images', img));
      if (isEdit) {
        await api.put(`/products/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product updated');
      } else {
        await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product created');
      }
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setLoading(false); }
  };

  const field = (key, label, type = 'text', extraProps = {}) => (
    <div>
      <label className="text-xs font-medium text-primary/70 block mb-1.5">{label}</label>
      <input type={type} value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        className="input text-sm" {...extraProps} />
    </div>
  );

  return (
    <div className="animate-fade-in max-w-2xl">
      <button onClick={() => navigate('/admin/products')} className="btn-ghost text-sm mb-4 flex items-center gap-1">
        <MdArrowBack size={16} /> Back to Products
      </button>
      <h1 className="font-display text-2xl font-bold text-primary mb-6">{isEdit ? 'Edit' : 'Add'} Product</h1>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        {field('name', 'Product Name *', 'text', { required: true })}
        <div>
          <label className="text-xs font-medium text-primary/70 block mb-1.5">Description *</label>
          <textarea required value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={4} className="input text-sm resize-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {field('brand', 'Brand *', 'text', { required: true })}
          <div>
            <label className="text-xs font-medium text-primary/70 block mb-1.5">Category *</label>
            <select required value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="input text-sm">
              <option value="">Select category</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {field('price', 'Price (₹) *', 'number', { required: true, min: 0, step: '0.01' })}
          {field('discountPercent', 'Discount %', 'number', { min: 0, max: 100 })}
          {field('stock', 'Stock *', 'number', { required: true, min: 0 })}
        </div>

        <div>
          <label className="text-xs font-medium text-primary/70 block mb-1.5">Product Images</label>
          <input type="file" multiple accept="image/*" onChange={(e) => setImages(Array.from(e.target.files))} className="input text-sm" />
          <p className="text-xs text-muted mt-1">Max 5 images. {isEdit && 'Upload new to replace existing.'}</p>
        </div>

        <div className="flex flex-wrap gap-4">
          {[['isFeatured','Featured'],['isBestSeller','Best Seller'],['isNewArrival','New Arrival']].map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))} className="accent-accent w-4 h-4" />
              <span className="text-sm text-primary">{label}</span>
            </label>
          ))}
        </div>

        <button type="submit" disabled={loading} className="btn-accent py-3 px-8 w-full">
          {loading ? <Spinner size="sm" /> : (isEdit ? 'Update Product' : 'Create Product')}
        </button>
      </form>
    </div>
  );
}
export default AdminProductForm;
