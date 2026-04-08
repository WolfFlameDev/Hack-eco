'use client';

export default function ProductCard({ product, onAddToCart }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-4xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-green-50">
      <div className="relative overflow-hidden border-b border-slate-200">
        <img src={product.image} alt={product.name} className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-slate-700 shadow-sm">
          {product.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-xl font-bold text-slate-900">{product.name}</h3>
          <p className="text-lg font-black text-green-600">₹{product.price}</p>
        </div>
        <p className="text-sm leading-6 text-slate-600">{product.description}</p>

        <button
          onClick={() => onAddToCart(product)}
          className="mt-6 inline-flex items-center justify-center rounded-full bg-green-600 px-6 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white shadow-lg shadow-green-100 transition hover:bg-green-700"
        >
          Add to Cart
        </button>
      </div>
    </article>
  );
}
