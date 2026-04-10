import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../store/slices/productSlice';
import { ProductCard, SkeletonCard, Pagination } from '../components/common/index';
import { MdFilterList, MdClose, MdTune } from 'react-icons/md';
import api from '../services/api';

const SORT_OPTIONS = [
  { value: '-createdAt',  label: 'Newest First' },
  { value: 'finalPrice',  label: 'Price: Low to High' },
  { value: '-finalPrice', label: 'Price: High to Low' },
  { value: '-ratings',    label: 'Top Rated' },
  { value: '-numReviews', label: 'Most Popular' },
];

const PRICE_RANGES = [
  { label: 'Under ₹500',    min: 0,    max: 500 },
  { label: '₹500 – ₹1,000', min: 500,  max: 1000 },
  { label: '₹1,000 – ₹5k',  min: 1000, max: 5000 },
  { label: 'Over ₹5,000',   min: 5000, max: 999999 },
];

export default function ShopPage() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { list: products, total, loading } = useSelector((s) => s.products);

  const [categories,    setCategories]    = useState([]);
  const [filterOpen,    setFilterOpen]    = useState(false);
  const [selectedCats,  setSelectedCats]  = useState([]);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [minRating,     setMinRating]     = useState(0);
  const [sort,          setSort]          = useState('-createdAt');
  const [page,          setPage]          = useState(1);

  const keyword = searchParams.get('keyword') || '';
  const LIMIT = 12;

  // Fetch categories
  useEffect(() => {
    api.get('/categories').then((r) => setCategories(r.data.categories)).catch(() => {});
  }, []);

  // Build query and fetch products
  const buildQuery = useCallback(() => {
    const params = { page, limit: LIMIT, sort };
    if (keyword)       params.keyword     = keyword;
    if (selectedCats.length) params.category = selectedCats.join(',');
    if (selectedPrice) { params['finalPrice[gte]'] = selectedPrice.min; params['finalPrice[lte]'] = selectedPrice.max; }
    if (minRating > 0) params['ratings[gte]'] = minRating;
    return params;
  }, [page, sort, keyword, selectedCats, selectedPrice, minRating]);

  useEffect(() => {
    dispatch(fetchProducts(buildQuery()));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [dispatch, buildQuery]);

  const resetFilters = () => {
    setSelectedCats([]);
    setSelectedPrice(null);
    setMinRating(0);
    setSort('-createdAt');
    setPage(1);
    setSearchParams({});
  };

  const toggleCategory = (id) => {
    setSelectedCats((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
    setPage(1);
  };

  const FilterPanel = () => (
    <div className="space-y-7">
      {/* Active filters */}
      {(selectedCats.length > 0 || selectedPrice || minRating > 0) && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-primary uppercase tracking-widest">Active Filters</h4>
            <button onClick={resetFilters} className="text-xs text-accent hover:underline">Clear all</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedCats.map((id) => {
              const cat = categories.find((c) => c._id === id);
              return cat ? (
                <span key={id} className="badge bg-accent/10 text-accent gap-1">
                  {cat.name}
                  <button onClick={() => toggleCategory(id)}><MdClose size={12} /></button>
                </span>
              ) : null;
            })}
            {selectedPrice && (
              <span className="badge bg-accent/10 text-accent gap-1">
                {selectedPrice.label}
                <button onClick={() => setSelectedPrice(null)}><MdClose size={12} /></button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Categories */}
      <div>
        <h4 className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Categories</h4>
        <ul className="space-y-2">
          {categories.map((cat) => (
            <li key={cat._id}>
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedCats.includes(cat._id)}
                  onChange={() => toggleCategory(cat._id)}
                  className="accent-accent w-4 h-4 rounded"
                />
                <span className="text-sm text-primary/70 group-hover:text-primary">{cat.name}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Price Range</h4>
        <ul className="space-y-2">
          {PRICE_RANGES.map((r) => (
            <li key={r.label}>
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="radio"
                  name="price"
                  checked={selectedPrice?.label === r.label}
                  onChange={() => { setSelectedPrice(r); setPage(1); }}
                  className="accent-accent w-4 h-4"
                />
                <span className="text-sm text-primary/70 group-hover:text-primary">{r.label}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Min Rating */}
      <div>
        <h4 className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Minimum Rating</h4>
        <div className="flex flex-wrap gap-2">
          {[0, 3, 4, 4.5].map((r) => (
            <button
              key={r}
              onClick={() => { setMinRating(r); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
                ${minRating === r ? 'bg-primary text-white border-primary' : 'border-gray-200 text-primary/70 hover:border-primary'}`}
            >
              {r === 0 ? 'All' : `${r}★+`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="container-app py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title">
            {keyword ? `Results for "${keyword}"` : 'All Products'}
          </h1>
          <p className="text-sm text-muted mt-1">{total} products found</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="input py-2 text-sm w-auto"
          >
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          {/* Mobile filter toggle */}
          <button
            onClick={() => setFilterOpen(true)}
            className="lg:hidden btn-outline py-2 px-3 flex items-center gap-2 text-sm"
          >
            <MdTune size={18} /> Filters
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-60 flex-shrink-0">
          <div className="sticky top-24 card p-5">
            <div className="flex items-center gap-2 mb-5">
              <MdFilterList size={20} className="text-accent" />
              <h3 className="font-semibold text-primary">Filters</h3>
            </div>
            <FilterPanel />
          </div>
        </aside>

        {/* Mobile Filter Drawer */}
        {filterOpen && (
          <>
            <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setFilterOpen(false)} />
            <div className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl p-6 overflow-y-auto animate-slide-up">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-primary">Filters</h3>
                <button onClick={() => setFilterOpen(false)}><MdClose size={22} /></button>
              </div>
              <FilterPanel />
            </div>
          </>
        )}

        {/* Products Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-4xl mb-4">🔍</p>
              <h3 className="font-display text-xl font-semibold text-primary mb-2">No products found</h3>
              <p className="text-muted mb-6">Try adjusting your filters or search query</p>
              <button onClick={resetFilters} className="btn-accent">Clear Filters</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {products.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
              <Pagination page={page} total={total} limit={LIMIT} onChange={setPage} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
