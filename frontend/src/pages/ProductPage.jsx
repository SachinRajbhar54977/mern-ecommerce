import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProduct } from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';
import { toggleWishlist } from '../store/slices/wishlistSlice';
import { ProductCard, SkeletonCard, StarRating, Spinner } from '../components/common/index';
import { MdShoppingCart, MdFavoriteBorder, MdFavorite, MdArrowBack, MdVerified } from 'react-icons/md';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ProductPage() {
  const { id }        = useParams();
  const dispatch      = useDispatch();
  const { product, loading } = useSelector((s) => s.products);
  const { user }      = useSelector((s) => s.auth);
  const wishlistItems = useSelector((s) => s.wishlist.items);
  const isWishlisted  = wishlistItems.some((i) => (i._id || i) === id);

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity,      setQuantity]      = useState(1);
  const [related,       setRelated]       = useState([]);
  const [reviewForm,    setReviewForm]    = useState({ rating: 0, title: '', comment: '' });
  const [submitting,    setSubmitting]    = useState(false);
  const [activeTab,     setActiveTab]     = useState('description');

  useEffect(() => {
    dispatch(fetchProduct(id));
    api.get(`/products/${id}/related`).then((r) => setRelated(r.data.products)).catch(() => {});
    window.scrollTo({ top: 0 });
  }, [id, dispatch]);

  if (loading || !product) {
    return (
      <div className="container-app py-12">
        <div className="flex justify-center"><Spinner size="lg" /></div>
      </div>
    );
  }

  const images    = product.images || [];
  const mainImage = images[selectedImage]?.url || 'https://placehold.co/600x600?text=No+Image';

  const handleAddToCart = () => {
    if (!user) { window.location.href = '/login'; return; }
    dispatch(addToCart({ productId: product._id, quantity }));
  };

  const handleWishlist = () => {
    if (!user) { window.location.href = '/login'; return; }
    dispatch(toggleWishlist(product._id));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) { window.location.href = '/login'; return; }
    if (reviewForm.rating === 0) { toast.error('Please select a rating'); return; }
    setSubmitting(true);
    try {
      await api.post(`/reviews/${product._id}`, reviewForm);
      toast.success('Review submitted!');
      setReviewForm({ rating: 0, title: '', comment: '' });
      dispatch(fetchProduct(id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-app py-8 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted mb-6">
        <Link to="/" className="hover:text-accent">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-accent">Shop</Link>
        <span>/</span>
        <span className="text-primary line-clamp-1">{product.name}</span>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
        {/* Images */}
        <div>
          <div className="aspect-square rounded-xl2 overflow-hidden bg-surface-alt mb-3">
            <img src={mainImage} alt={product.name} className="w-full h-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="flex gap-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all
                    ${selectedImage === i ? 'border-accent' : 'border-transparent hover:border-gray-300'}`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-sm text-accent font-medium mb-1">{product.brand}</p>
          <h1 className="font-display text-3xl text-primary font-bold leading-tight mb-3">
            {product.name}
          </h1>

          {/* Rating summary */}
          <div className="flex items-center gap-3 mb-5">
            <StarRating value={product.ratings} readonly />
            <span className="text-sm text-muted">
              {product.ratings} ({product.numReviews} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="font-display text-3xl text-primary font-bold">
              ₹{product.finalPrice?.toFixed(0)}
            </span>
            {product.discountPercent > 0 && (
              <>
                <span className="text-lg text-muted line-through">₹{product.price?.toFixed(0)}</span>
                <span className="badge bg-green-100 text-green-700 text-sm">
                  {product.discountPercent}% OFF
                </span>
              </>
            )}
          </div>

          {/* Stock */}
          <div className="mb-6">
            {product.stock > 0 ? (
              <span className="badge bg-green-100 text-green-700">
                ✓ In Stock ({product.stock} left)
              </span>
            ) : (
              <span className="badge bg-red-100 text-red-600">Out of Stock</span>
            )}
          </div>

          {/* Quantity + Cart */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-4 py-3 text-primary hover:bg-surface-dark transition-colors text-lg"
              >−</button>
              <span className="px-5 py-3 text-sm font-semibold border-x border-gray-200 min-w-[50px] text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                className="px-4 py-3 text-primary hover:bg-surface-dark transition-colors text-lg"
              >+</button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="btn-accent flex-1 py-3.5"
            >
              <MdShoppingCart size={20} /> Add to Cart
            </button>

            <button
              onClick={handleWishlist}
              className="btn-outline p-3.5"
              aria-label="Wishlist"
            >
              {isWishlisted
                ? <MdFavorite size={22} className="text-red-500" />
                : <MdFavoriteBorder size={22} />
              }
            </button>
          </div>

          <Link to="/checkout" className="btn-primary w-full py-3.5 text-center block mb-6">
            Buy Now
          </Link>

          {/* Category */}
          <p className="text-sm text-muted">
            Category: <Link to={`/shop?category=${product.category?.slug}`} className="text-accent hover:underline">
              {product.category?.name}
            </Link>
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-12">
        <div className="flex gap-0 border-b border-gray-200 mb-6">
          {['description', 'specifications', 'reviews'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium capitalize border-b-2 transition-all
                ${activeTab === tab
                  ? 'border-accent text-accent'
                  : 'border-transparent text-muted hover:text-primary'}`}
            >
              {tab} {tab === 'reviews' && `(${product.numReviews})`}
            </button>
          ))}
        </div>

        {activeTab === 'description' && (
          <div className="prose max-w-none text-primary/80 leading-relaxed">
            <p>{product.description}</p>
          </div>
        )}

        {activeTab === 'specifications' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(product.specifications || []).map((spec, i) => (
              <div key={i} className="flex gap-3 p-3 bg-surface-alt rounded-xl">
                <span className="text-sm font-medium text-primary w-32 flex-shrink-0">{spec.key}</span>
                <span className="text-sm text-muted">{spec.value}</span>
              </div>
            ))}
            {(!product.specifications || product.specifications.length === 0) && (
              <p className="text-muted text-sm">No specifications available.</p>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Review list */}
            <div className="lg:col-span-2 space-y-4">
              {(product.reviews || []).length === 0 ? (
                <p className="text-muted text-sm">No reviews yet. Be the first to review!</p>
              ) : (
                product.reviews.map((r) => (
                  <div key={r._id} className="card p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-9 h-9 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                        {r.user?.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-primary">{r.user?.name}</span>
                          {r.isVerifiedPurchase && (
                            <span className="badge bg-blue-50 text-blue-600 gap-1">
                              <MdVerified size={11} /> Verified
                            </span>
                          )}
                        </div>
                        <StarRating value={r.rating} readonly size={14} />
                      </div>
                      <span className="text-xs text-muted">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    {r.title && <p className="text-sm font-semibold text-primary mb-1">{r.title}</p>}
                    <p className="text-sm text-primary/70">{r.comment}</p>
                  </div>
                ))
              )}
            </div>

            {/* Write review */}
            <div>
              <div className="card p-5">
                <h3 className="font-semibold text-primary mb-4">Write a Review</h3>
                {!user ? (
                  <p className="text-sm text-muted">
                    <Link to="/login" className="text-accent">Login</Link> to write a review
                  </p>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div>
                      <label className="text-xs text-muted font-medium block mb-2">Your Rating *</label>
                      <StarRating value={reviewForm.rating} onChange={(v) => setReviewForm((f) => ({ ...f, rating: v }))} />
                    </div>
                    <div>
                      <label className="text-xs text-muted font-medium block mb-1.5">Title</label>
                      <input value={reviewForm.title} onChange={(e) => setReviewForm((f) => ({ ...f, title: e.target.value }))} className="input text-sm" placeholder="Summary of your review" />
                    </div>
                    <div>
                      <label className="text-xs text-muted font-medium block mb-1.5">Comment *</label>
                      <textarea value={reviewForm.comment} onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))} required rows={4} className="input text-sm resize-none" placeholder="Share your experience…" />
                    </div>
                    <button type="submit" disabled={submitting} className="btn-accent w-full py-2.5">
                      {submitting ? <Spinner size="sm" /> : 'Submit Review'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section>
          <h2 className="section-title mb-6">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {related.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
