import { Facebook, Instagram, Twitter, Mail, MapPin, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import acj from '../logo.png';

export default function Footer() {
  return (
    <footer className="backdrop-blur-xl bg-gradient-to-br from-slate-900 via-indigo-900/50 to-slate-900 border-t border-white/10 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-white bg-clip-text text-transparent">
                ShopWCandy Maison
              </h3>
              <p className="text-white/60 font-light text-sm leading-relaxed max-w-sm">
                Crafting tomorrow's heirlooms through innovative design and artisanal excellence.
              </p>
            </div>
            
            {/* Social Links */}
            <div className="flex items-center gap-6">
              <a href="#" className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors duration-300">
                <Instagram className="h-5 w-5 text-white/80" />
              </a>
              <a href="#" className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors duration-300">
                <Facebook className="h-5 w-5 text-white/80" />
              </a>
              <a href="#" className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors duration-300">
                <Twitter className="h-5 w-5 text-white/80" />
              </a>
            </div>

            {/* Contact Info */}
            <div className="space-y-3 mt-8">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-indigo-400/80" />
                <span className="text-white/60 text-sm font-light">
                  24 Avenue Montaigne, 75008 Paris
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-indigo-400/80" />
                <a href="mailto:contact@shopwcandy.com" className="text-white/60 hover:text-white transition-colors duration-300 text-sm font-light">
                  contact@shopwcandy.com
                </a>
              </div>
            </div>
          </div>

          {/* Navigation Columns */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Collections */}
            <div className="space-y-4">
              <h4 className="text-white/80 font-semibold mb-3 text-lg">Collections</h4>
              <ul className="space-y-3">
                {['Haute Couture', 'Prêt-à-Porter', 'Accessories', 'Seasonal Edit'].map((item) => (
                  <li key={item}>
                    <Link
                      to={`/collection/${item.toLowerCase().replace(' ', '-')}`}
                      className="text-white/60 hover:text-white transition-colors duration-300 text-sm flex items-center gap-2 group"
                    >
                      <span className="w-2 h-px bg-indigo-100/60 group-hover:bg-white transition-colors duration-300" />
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div className="space-y-4">
              <h4 className="text-white/80 font-semibold mb-3 text-lg">Services</h4>
              <ul className="space-y-3">
                {['Bespoke Tailoring', 'VIP Appointments', 'Global Delivery', 'Care & Repair'].map((item) => (
                  <li key={item}>
                    <Link
                      to={`/${item.toLowerCase().replace(' ', '-')}`}
                      className="text-white/60 hover:text-white transition-colors duration-300 text-sm flex items-center gap-2 group"
                    >
                      <span className="w-2 h-px bg-indigo-100/60 group-hover:bg-white transition-colors duration-300" />
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Maison */}
            <div className="space-y-4">
              <h4 className="text-white/80 font-semibold mb-3 text-lg">Maison</h4>
              <ul className="space-y-3">
                {['Heritage', 'Sustainability', 'Ateliers', 'Careers'].map((item) => (
                  <li key={item}>
                    <Link
                      to={`/${item.toLowerCase()}`}
                      className="text-white/60 hover:text-white transition-colors duration-300 text-sm flex items-center gap-2 group"
                    >
                      <span className="w-2 h-px bg-indigo-100/60 group-hover:bg-white transition-colors duration-300" />
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10 mt-16 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/60 text-sm font-light text-center">
              © {new Date().getFullYear()} ShopWCandy Maison. All rights reserved.  <span className="flex items-center">
            Built with <Heart className="h-4 w-4 mx-1 text-red-500 fill-current" /> by{' '} &nbsp;
            <a 
              href="https://theacj.com.ng" 
              target="_blank" 
              rel="noopener noreferrer"
              className="ml-1 text-white/60 hover:text-blue-800 transition-colors inline-block"
            ><img src={acj} className="h-4 w-4 text-blue-600 inline" /> &nbsp;
              The ACJ
            </a>
          </span>
            </p>
            <div className="flex items-center gap-6">
              <Link to="/privacy" className="text-white/60 hover:text-white transition-colors duration-300 text-sm font-light">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-white/60 hover:text-white transition-colors duration-300 text-sm font-light">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}