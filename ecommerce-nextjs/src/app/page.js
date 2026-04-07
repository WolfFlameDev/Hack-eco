'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { Leaf, ShieldCheck, ShoppingBag, ArrowRight, Store, Users } from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  // Handle Navbar scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle redirection logic if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      const paths = {
        admin: '/admin/dashboard',
        seller: '/seller/dashboard',
        user: '/user/dashboard',
      };
      router.push(paths[user.role] || '/user/dashboard');
    }
  }, [isAuthenticated, user, router]);

  // Loading state while checking auth
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-green-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-green-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-500 font-medium animate-pulse">Resuming your session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-900 selection:bg-green-100 selection:text-green-900">
      {/* Premium Sticky Navbar */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/80 backdrop-blur-md border-b border-slate-200 py-3' : 'bg-transparent py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="bg-green-600 p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
              EcoCommerce
            </span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <Link href="#features" className="hover:text-green-600 transition-colors">How it Works</Link>
            <Link href="/shop" className="hover:text-green-600 transition-colors">Marketplace</Link>
            <div className="h-4 w-[1px] bg-slate-200"></div>
            <Link href="/auth/login" className="hover:text-slate-900 transition-colors">Sign In</Link>
            <Link 
              href="/auth/register" 
              className="bg-slate-900 text-white px-5 py-2.5 rounded-full hover:bg-green-600 transition-all shadow-sm hover:shadow-green-200"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-50 rounded-full blur-[120px] opacity-60"></div>
            <div className="absolute bottom-0 right-[-5%] w-[30%] h-[30%] bg-blue-50 rounded-full blur-[100px] opacity-60"></div>
          </div>

          <div className="max-w-7xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-8 border border-green-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              The Future of Retail
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 leading-[1.1]">
              Shop with a <span className="text-green-600">Purpose.</span><br />
              Grow with the <span className="italic font-serif">Planet.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              The world&apos;s first carbon-neutral marketplace connecting conscious consumers with verified sustainable brands. 
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/auth/register"
                className="group bg-green-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-green-700 transition-all flex items-center gap-2 shadow-xl shadow-green-100"
              >
                Start Shopping
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/auth/register?seller=true"
                className="bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-slate-50 transition-all flex items-center gap-2"
              >
                <Store className="w-5 h-5 text-green-600" />
                Become a Seller
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<ShoppingBag className="w-6 h-6 text-green-600" />}
              title="Curated Selection"
              desc="Every product is vetted for its lifecycle impact and ethical manufacturing."
              color="bg-green-50"
            />
            <FeatureCard 
              icon={<Users className="w-6 h-6 text-blue-600" />}
              title="Community Driven"
              desc="Join 50k+ activists and enthusiasts making a difference every day."
              color="bg-blue-50"
            />
            <FeatureCard 
              icon={<ShieldCheck className="w-6 h-6 text-purple-600" />}
              title="Transparent Supply"
              desc="Blockchain-verified tracing for every item from origin to doorstep."
              color="bg-purple-50"
            />
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-80">
            <Leaf className="w-5 h-5 text-green-600" />
            <span className="font-bold">EcoCommerce</span>
          </div>
          <p className="text-slate-500 text-sm">
            © 2026 EcoCommerce. Built for the modern sustainable economy.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc, color }) {
  return (
    <div className="group p-8 rounded-3xl bg-white border border-slate-100 hover:border-green-200 hover:shadow-2xl hover:shadow-green-50/50 transition-all duration-300">
      <div className={`${color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{desc}</p>
    </div>
  );
}