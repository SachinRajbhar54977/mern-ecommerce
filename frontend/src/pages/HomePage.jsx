import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFeatured } from '../store/slices/productSlice';
import { ProductCard, SkeletonCard } from '../components/common/index';
import { MdArrowForward, MdLocalShipping, MdSecurity, MdLoop, MdHeadsetMic } from 'react-icons/md';

const HERO_CATEGORIES = [
  { label: 'Electronics', slug: 'electronics', emoji: '📱' },
  { label: 'Fashion',     slug: 'fashion',     emoji: '👗' },
  { label: 'Home',        slug: 'home',        emoji: '🏠' },
  { label: 'Beauty',      slug: 'beauty',      emoji: '💄' },
  { label: 'Sports',      slug: 'sports',      emoji: '⚽' },
  { label: 'Books',       slug: 'books',       emoji: '📚' },
];

const TRUST_FEATURES = [
  { Icon: MdLocalShipping, title: 'Free Shipping',    desc: 'On orders above ₹500' },
  { Icon: MdSecurity,      title: 'Secure Payment',   desc: '100% safe & encrypted' },
  { Icon: MdLoop,          title: 'Easy Returns',     desc: '30-day return policy' },
  { Icon: MdHeadsetMic,    title: '24/7 Support',     desc: 'Always here to help' },
];

export default function HomePage() {
  const dispatch  = useDispatch();
  const { featured, loading } = useSelector((s) => s.products);

  useEffect(() => {
    dispatch(fetchFeatured());
  }, [dispatch]);

  return (
    <div className="animate-fade-in">
      {/* ── Hero ── */}
      <section className="relative bg-primary overflow-hidden min-h-[520px] flex items-center">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}
        />
        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-accent/20 to-transparent" />

        <div className="container-app relative z-10 py-20">
          <div className="max-w-xl">
            <span className="badge bg-accent/20 text-accent text-sm mb-4 inline-flex">
              🎉 New Arrivals are here!
            </span>
            <h1 className="font-display text-5xl md:text-6xl text-white font-bold leading-tight mb-5">
              Discover <em className="text-accent not-italic">Premium</em> Shopping
            </h1>
            <p className="text-white/60 text-lg mb-8 leading-relaxed">
              Explore thousands of curated products from top brands. Quality you can trust, prices you'll love.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/shop" className="btn-accent py-3.5 px-7 text-base">
                Shop Now <MdArrowForward size={18} />
              </Link>
              <Link to="/shop?isFeatured=true" className="btn-outline py-3.5 px-7 text-base border-white/30 text-white hover:bg-white/10">
                Featured
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust Bar ── */}
      <section className="bg-surface-dark border-b border-gray-200">
        <div className="container-app py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {TRUST_FEATURES.map(({ Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Icon size={20} className="text-accent" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-primary">{title}</p>
                  <p className="text-xs text-muted">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="container-app py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-accent text-sm font-medium mb-1">Browse By</p>
            <h2 className="section-title">Shop Categories</h2>
          </div>
          <Link to="/shop" className="text-sm font-medium text-primary/60 hover:text-accent transition-colors flex items-center gap-1">
            View All <MdArrowForward size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {HERO_CATEGORIES.map(({ label, slug, emoji }) => (
            <Link
              key={slug}
              to={`/shop?category=${slug}`}
              className="card-hover flex flex-col items-center gap-2 py-5 px-3 text-center group"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform duration-200">{emoji}</span>
              <span className="text-xs font-medium text-primary">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="container-app pb-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-accent text-sm font-medium mb-1">Hand-Picked</p>
            <h2 className="section-title">Featured Products</h2>
          </div>
          <Link to="/shop?isFeatured=true" className="text-sm font-medium text-primary/60 hover:text-accent transition-colors flex items-center gap-1">
            View All <MdArrowForward size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : (featured.featured || []).map((p) => <ProductCard key={p._id} product={p} />)
          }
        </div>
      </section>

      {/* ── Banner ── */}
      <section className="bg-accent/5 border-y border-accent/10">
        <div className="container-app py-16 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-3xl text-primary font-bold mb-2">
              Get 20% Off Your First Order
            </h2>
            <p className="text-muted">Use code <strong className="text-accent font-mono">WELCOME20</strong> at checkout</p>
          </div>
          <Link to="/shop" className="btn-accent py-3.5 px-8 text-base flex-shrink-0">
            Shop Now <MdArrowForward size={18} />
          </Link>
        </div>
      </section>

      {/* ── Best Sellers ── */}
      <section className="container-app py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-accent text-sm font-medium mb-1">Top Picks</p>
            <h2 className="section-title">Best Sellers</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : (featured.bestSellers || []).map((p) => <ProductCard key={p._id} product={p} />)
          }
        </div>
      </section>

      {/* ── New Arrivals ── */}
      <section className="bg-surface-dark">
        <div className="container-app py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-accent text-sm font-medium mb-1">Just In</p>
              <h2 className="section-title">New Arrivals</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
              : (featured.newArrivals || []).map((p) => <ProductCard key={p._id} product={p} />)
            }
          </div>
        </div>
      </section>
    </div>
  );
}
