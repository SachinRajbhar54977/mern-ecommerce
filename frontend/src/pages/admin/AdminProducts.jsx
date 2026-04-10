// ─── AdminProducts.jsx ───────────────────────────────────────
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../store/slices/productSlice';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Spinner } from '../../components/common/index';

export function AdminProducts() {
  const dispatch = useDispatch();
  const { list, loading } = useSelector((s) => s.products);

  useEffect(() => { dispatch(fetchProducts({ limit: 50 })); }, [dispatch]);

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      dispatch(fetchProducts({ limit: 50 }));
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-primary">Products</h1>
        <Link to="/admin/products/new" className="btn-accent py-2.5 px-5 text-sm gap-1.5"><MdAdd size={18} /> Add Product</Link>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-alt">
              <tr>
                {['Product','Price','Stock','Category','Status','Actions'].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-muted uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="px-5 py-10 text-center"><Spinner /></td></tr>
              ) : list.map((p) => (
                <tr key={p._id} className="hover:bg-surface-alt/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <img src={p.images?.[0]?.url} className="w-10 h-10 rounded-lg object-cover bg-surface-alt" />
                      <div>
                        <p className="font-medium text-primary line-clamp-1 max-w-[200px]">{p.name}</p>
                        <p className="text-xs text-muted">{p.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-primary">₹{p.finalPrice?.toFixed(0)}</p>
                    {p.discountPercent > 0 && <p className="text-xs text-muted line-through">₹{p.price?.toFixed(0)}</p>}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`badge text-xs ${p.stock === 0 ? 'bg-red-100 text-red-600' : p.stock <= 5 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                      {p.stock === 0 ? 'Out of stock' : `${p.stock} units`}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-muted">{p.category?.name || '—'}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-col gap-1">
                      {p.isFeatured  && <span className="badge bg-purple-50 text-purple-600 text-[10px]">Featured</span>}
                      {p.isBestSeller && <span className="badge bg-blue-50 text-blue-600 text-[10px]">Best Seller</span>}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-2">
                      <Link to={`/admin/products/edit/${p._id}`} className="btn-ghost p-1.5 text-blue-500 hover:bg-blue-50">
                        <MdEdit size={16} />
                      </Link>
                      <button onClick={() => handleDelete(p._id, p.name)} className="btn-ghost p-1.5 text-red-500 hover:bg-red-50">
                        <MdDelete size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
export default AdminProducts;
