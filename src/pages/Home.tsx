import { Link } from 'react-router-dom';
import { ShoppingBag, Truck, Shield, Clock, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 mt-20">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden sm:overflow-auto">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"
            alt="Luxury Fashion"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        
        <div className="relative z-10 container mx-auto px-4">
          <div className="max-w-4xl backdrop-blur-xl bg-black/30 rounded-3xl p-12 border border-white/10 shadow-2xl">
            <div className="text-center space-y-8">
              <h1 className="text-3xl md:text-7xl font-bold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent leading-tight sm:text-4xl">
                Redefining Luxury <br/> Fashion
              </h1>
              <p className="text-xl text-indigo-100/80 max-w-2xl mx-auto font-light">
                Experience fashion excellence with our curated collection of contemporary luxury apparel and accessories
              </p>
              <div className="flex justify-center gap-4">
                <Link
                  to="/products"
                  className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-500 text-white px-8 py-4 rounded-xl font-medium hover:scale-[1.02] transition-transform duration-300 shadow-xl hover:shadow-2xl"
                >
                  Explore Collection
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-900/50 to-transparent" />
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                title: "Couture Craftsmanship", 
                text: "Hand-finished details from master artisans",
                icon: ShoppingBag
              },
              { 
                title: "Sustainable Luxury", 
                text: "Ethically sourced materials & production",
                icon: Shield
              },
              { 
                title: "Exclusive Access", 
                text: "Members-only collections & events",
                icon: Clock
              }
            ].map((item, index) => (
              <div 
                key={index}
                className="group backdrop-blur-lg bg-white/5 rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-500 hover:bg-white/10 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <item.icon className="w-12 h-12 text-indigo-400 mb-6" />
                <h3 className="text-2xl font-semibold text-white mb-4">{item.title}</h3>
                <p className="text-indigo-200/80 font-light leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Curated Collections */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-white bg-clip-text text-transparent mb-4">
              The Artisanal Edit
            </h2>
            <p className="text-indigo-200/80 max-w-xl mx-auto font-light">
              Carefully curated seasonal collections blending traditional techniques with modern design
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: "Haute Couture",
                category: "Evening Wear",
                image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80",
                link: "/collection/couture"
              },
              {
                title: "Prêt-à-Porter",
                category: "Ready-to-Wear",
                image: "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80",
                link: "/collection/pret-a-porter"
              }
            ].map((collection, index) => (
              <div 
                key={index}
                className="relative aspect-[4/3] rounded-2xl overflow-hidden group"
              >
                <img
                  src={collection.image}
                  alt={collection.title}
                  className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-8">
                  <div className="space-y-2">
                    <span className="text-indigo-300/90 font-light">{collection.category}</span>
                    <h3 className="text-3xl font-semibold text-white">{collection.title}</h3>
                    <Link
                      to={collection.link}
                      className="inline-flex items-center gap-2 text-white hover:text-indigo-200 transition-colors duration-300"
                    >
                      Discover Collection
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Exclusive Experience */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80')] opacity-10" />
        <div className="container mx-auto px-4">
          <div className="backdrop-blur-xl bg-black/40 rounded-3xl p-12 border border-white/10 shadow-2xl">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <h2 className="text-4xl font-bold text-white">
                The Atelier Experience
              </h2>
              <p className="text-indigo-200/80 text-lg font-light leading-relaxed">
                Immerse yourself in our world of bespoke tailoring, private consultations, and exclusive member benefits
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  to="/membership"
                  className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-500 text-white rounded-xl font-medium hover:scale-[1.02] transition-transform duration-300"
                >
                  Explore Membership
                </Link>
                <Link
                  to="/appointment"
                  className="px-8 py-4 border border-white/20 text-white rounded-xl hover:bg-white/10 transition-colors duration-300"
                >
                  Book Private Consultation
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}