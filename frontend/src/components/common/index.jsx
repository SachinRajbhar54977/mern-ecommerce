// ─── ProductCard.jsx ─────────────────────────────────────────
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';
import { toggleWishlist } from '../../store/slices/wishlistSlice';
import { MdFavoriteBorder, MdFavorite, MdShoppingCart, MdStar } from 'react-icons/md';

export function ProductCard({ product }) {
  const dispatch   = useDispatch();
  const { user }   = useSelector((s) => s.auth);
  const wishlistItems = useSelector((s) => s.wishlist.items);
  const isWishlisted = wishlistItems.some((i) => (i._id || i) === product._id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!user) { window.location.href = '/login'; return; }
    dispatch(addToCart({ productId: product._id, quantity: 1 }));
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    if (!user) { window.location.href = '/login'; return; }
    dispatch(toggleWishlist(product._id));
  };

  const discount = product.discountPercent;
  const image    = product.images?.[0]?.url || 'https://placehold.co/400x400?text=No+Image';

  return (
    <Link to={`/product/${product._id}`} className="card-hover group flex flex-col">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-surface-alt">
        <img
          src={image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount > 0 && (
            <span className="badge bg-accent text-white">−{discount}%</span>
          )}
          {product.isNewArrival && (
            <span className="badge bg-primary text-white">New</span>
          )}
          {product.stock === 0 && (
            <span className="badge bg-red-100 text-red-600">Out of Stock</span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={handleToggleWishlist}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white shadow-card flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
        >
          {isWishlisted
            ? <MdFavorite size={16} className="text-red-500" />
            : <MdFavoriteBorder size={16} className="text-primary/50" />
          }
        </button>

        {/* Add to cart overlay */}
        <div className="absolute bottom-0 inset-x-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-full py-3 bg-primary text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary-light transition-colors disabled:opacity-50"
          >
            <MdShoppingCart size={18} />
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-muted mb-1">{product.brand}</p>
        <h3 className="text-sm font-medium text-primary leading-snug mb-2 line-clamp-2 flex-1">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex">
            {[1,2,3,4,5].map((s) => (
              <MdStar key={s} size={13} className={s <= Math.round(product.ratings) ? 'star-filled' : 'star-empty'} />
            ))}
          </div>
          <span className="text-xs text-muted">({product.numReviews})</span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-base font-semibold text-primary">
            ₹{product.finalPrice?.toFixed(0) ?? product.price?.toFixed(0)}
          </span>
          {discount > 0 && (
            <span className="text-sm text-muted line-through">₹{product.price?.toFixed(0)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ─── SkeletonCard.jsx ─────────────────────────────────────────
export function SkeletonCard() {
  return (
    <div className="card overflow-hidden">
      <div className="aspect-square skeleton" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-2/3 rounded" />
        <div className="skeleton h-5 w-1/3 rounded" />
      </div>
    </div>
  );
}

// ─── StarRating.jsx ───────────────────────────────────────────
import { useState } from 'react';
import { MdStar as MdStarIcon } from 'react-icons/md';

export function StarRating({ value = 0, onChange, readonly = false, size = 20 }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map((s) => (
        <button
          key={s}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange?.(s)}
          onMouseEnter={() => !readonly && setHovered(s)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform'}
        >
          <MdStarIcon size={size} className={s <= display ? 'text-amber-400' : 'text-gray-300'} />
        </button>
      ))}
    </div>
  );
}

// ─── Pagination.jsx ───────────────────────────────────────────
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';

export function Pagination({ page, total, limit, onChange }) {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visible = pages.filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1);

  return (
    <div className="flex items-center justify-center gap-1.5 mt-10">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="btn-outline py-2 px-3 disabled:opacity-40"
      >
        <MdChevronLeft size={18} />
      </button>

      {visible.map((p, i) => (
        <span key={p}>
          {i > 0 && visible[i - 1] !== p - 1 && (
            <span className="px-2 text-muted">…</span>
          )}
          <button
            onClick={() => onChange(p)}
            className={`w-9 h-9 rounded-xl text-sm font-medium transition-all
              ${p === page ? 'bg-primary text-white' : 'btn-outline py-0'}`}
          >
            {p}
          </button>
        </span>
      ))}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="btn-outline py-2 px-3 disabled:opacity-40"
      >
        <MdChevronRight size={18} />
      </button>
    </div>
  );
}

// ─── Spinner.jsx ──────────────────────────────────────────────
export function Spinner({ size = 'md' }) {
  const s = { sm: 'w-4 h-4 border-2', md: 'w-8 h-8 border-3', lg: 'w-12 h-12 border-4' }[size];
  return (
    <div className={`${s} border-accent/30 border-t-accent rounded-full animate-spin`} />
  );
}
