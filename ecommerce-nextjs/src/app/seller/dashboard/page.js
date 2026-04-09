'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Package, 
  BarChart3, 
  LogOut, 
  Search, 
  Edit, 
  Trash2, 
  ArrowUpRight,
  TrendingUp,
  DollarSign,
  ShoppingCart
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';

// Mock Data for Charts
const revenueData = [
  { name: 'Jan', revenue: 4000, sales: 240 },
  { name: 'Feb', revenue: 3000, sales: 198 },
  { name: 'Mar', revenue: 2000, sales: 150 },
  { name: 'Apr', revenue: 2780, sales: 210 },
  { name: 'May', revenue: 1890, sales: 120 },
  { name: 'Jun', revenue: 2390, sales: 170 },
];

export default function SellerDashboard() {
  const { user, isAuthenticated, logout, isSeller } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-bold text-emerald-600 flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white text-xs">EC</div>
            EcoSeller
          </h2>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <SidebarItem icon={<LayoutDashboard size={20}/>} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <SidebarItem icon={<PlusCircle size={20}/>} label="Add Product" active={activeTab === 'add'} onClick={() => setActiveTab('add')} />
          <SidebarItem icon={<Package size={20}/>} label="My Inventory" active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} />
          <SidebarItem icon={<BarChart3 size={20}/>} label="Analytics" active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button onClick={logout} className="flex items-center gap-3 w-full px-4 py-3 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Navbar */}
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-slate-200 px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-slate-800 capitalize">{activeTab}</h1>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
            <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold">
              {user?.name?.charAt(0)}
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {activeTab === 'overview' && <OverviewView revenueData={revenueData} />}
          {activeTab === 'add' && <AddProductForm onSuccess={() => setActiveTab('inventory')} />}
          {activeTab === 'inventory' && <InventoryTable />}
        </div>
      </main>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function SidebarItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
        active 
          ? 'bg-emerald-50 text-emerald-700 shadow-sm' 
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function OverviewView({ revenueData }) {
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value="$12,840" icon={<DollarSign className="text-emerald-600" />} trend="+12.5%" color="bg-emerald-50" />
        <StatCard title="Total Sales" value="482" icon={<ShoppingCart className="text-blue-600" />} trend="+8.2%" color="bg-blue-50" />
        <StatCard title="Active Products" value="24" icon={<Package className="text-purple-600" />} trend="0%" color="bg-purple-50" />
        <StatCard title="Store Rating" value="4.9/5" icon={<TrendingUp className="text-orange-600" />} trend="+0.1" color="bg-orange-50" />
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-800">Revenue Performance</h3>
          <select className="bg-slate-50 border-none text-sm rounded-lg focus:ring-emerald-500">
            <option>Last 6 Months</option>
            <option>Last Year</option>
          </select>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, color }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
        <span className="text-xs font-bold text-emerald-600 flex items-center bg-emerald-50 px-2 py-1 rounded-full">
          {trend} <ArrowUpRight size={14} />
        </span>
      </div>
      <div className="mt-4">
        <p className="text-sm text-slate-500 font-medium">{title}</p>
        <h4 className="text-2xl font-bold text-slate-900 mt-1">{value}</h4>
      </div>
    </div>
  );
}

function AddProductForm({ onSuccess }) {
  return (
    <div className="max-w-2xl bg-white p-8 rounded-2xl border border-slate-200 shadow-sm mx-auto">
      <h3 className="text-xl font-bold text-slate-800 mb-6">List New Eco-Product</h3>
      <form className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
          <input type="text" placeholder="e.g. Bamboo Toothbrush" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none">
              <option>Personal Care</option>
              <option>Kitchenware</option>
              <option>Fashion</option>
              <option>Home Decor</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Price ($)</label>
            <input type="number" placeholder="29.99" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Product Image</label>
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:bg-slate-50 cursor-pointer transition-all">
            <PlusCircle className="mx-auto text-slate-400 mb-2" />
            <p className="text-sm text-slate-500">Click to upload or drag and drop</p>
          </div>
        </div>
        <button type="button" onClick={onSuccess} className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200">
          Publish Product
        </button>
      </form>
    </div>
  );
}

function InventoryTable() {
  const products = [
    { id: 1, name: 'Organic Cotton Bag', category: 'Fashion', price: '$15.00', sales: 120, stock: 45 },
    { id: 2, name: 'Glass Water Bottle', category: 'Kitchenware', price: '$24.00', sales: 85, stock: 12 },
    { id: 3, name: 'Recycled Notebook', category: 'Office', price: '$10.00', sales: 200, stock: 0 },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-800">Your Products</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="Search inventory..." className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-emerald-500" />
        </div>
      </div>
      <table className="w-full text-left">
        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
          <tr>
            <th className="px-6 py-4">Product</th>
            <th className="px-6 py-4">Category</th>
            <th className="px-6 py-4">Price</th>
            <th className="px-6 py-4">Stock</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {products.map((p) => (
            <tr key={p.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 font-medium text-slate-900">{p.name}</td>
              <td className="px-6 py-4 text-slate-600">{p.category}</td>
              <td className="px-6 py-4 text-slate-900">{p.price}</td>
              <td className="px-6 py-4 text-slate-600">{p.stock}</td>
              <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {p.stock > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
              </td>
              <td className="px-6 py-4 flex gap-3">
                <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit size={18}/></button>
                <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={18}/></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}