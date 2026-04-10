import { Link } from 'react-router-dom';
import { MdEmail, MdPhone, MdLocationOn } from 'react-icons/md';
import { FaInstagram, FaTwitter, FaFacebook } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-primary text-white/70 font-sans">
      <div className="container-app pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <h2 className="font-display text-white text-2xl font-bold mb-3">
              Shop<span className="text-accent">Lux</span>
            </h2>
            <p className="text-sm leading-relaxed mb-5">
              Premium quality products delivered to your door. Shop the latest trends with confidence.
            </p>
            <div className="flex gap-3">
              {[FaInstagram, FaTwitter, FaFacebook].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-accent transition-colors">
                  <Icon size={16} className="text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-widest mb-4">Quick Links</h3>
            <ul className="space-y-2.5 text-sm">
              {[['/', 'Home'], ['/shop', 'Shop'], ['/orders', 'My Orders'], ['/profile', 'Account']].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="hover:text-white hover:translate-x-1 inline-block transition-all">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-widest mb-4">Support</h3>
            <ul className="space-y-2.5 text-sm">
              {['FAQs', 'Shipping Policy', 'Return Policy', 'Privacy Policy', 'Terms of Service'].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-white transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-widest mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MdLocationOn size={16} className="text-accent mt-0.5 flex-shrink-0" />
                <span>123 Commerce St, Mumbai, India 400001</span>
              </li>
              <li className="flex items-center gap-3">
                <MdPhone size={16} className="text-accent flex-shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3">
                <MdEmail size={16} className="text-accent flex-shrink-0" />
                <span>hello@shoplux.in</span>
              </li>
            </ul>

            {/* Newsletter */}
            <div className="mt-5">
              <p className="text-sm text-white/60 mb-2">Subscribe for offers</p>
              <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-accent"
                />
                <button className="px-3 py-2 bg-accent rounded-lg text-white text-sm font-medium hover:bg-accent-dark transition-colors">
                  Go
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <p>© {new Date().getFullYear()} ShopLux. All rights reserved.</p>
          <p>Built with ❤️ using MERN Stack</p>
        </div>
      </div>
    </footer>
  );
}
