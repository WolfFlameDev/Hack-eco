'use client';

export default function CartItem({ item, onIncrement, onDecrement, onRemove }) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <img src={item.image} alt={item.title} className="h-24 w-24 rounded-3xl object-cover" />
        <div>
          <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
          <p className="text-sm text-slate-500">₹{item.price}</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:items-end">
        <div className="flex items-center rounded-full border border-slate-200 bg-slate-50 overflow-hidden">
          <button
            type="button"
            onClick={() => onDecrement(item.id)}
            className="px-4 py-2 text-slate-700 hover:bg-slate-100 transition"
          >
            -
          </button>
          <span className="px-5 py-2 text-sm font-bold text-slate-900">{item.quantity}</span>
          <button
            type="button"
            onClick={() => onIncrement(item.id)}
            className="px-4 py-2 text-slate-700 hover:bg-slate-100 transition"
          >
            +
          </button>
        </div>

        <div className="flex items-center gap-3 text-sm text-slate-500">
          <span className="font-semibold text-slate-900">Subtotal:</span>
          <span>₹{item.price * item.quantity}</span>
        </div>

        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="inline-flex items-center justify-center rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 transition"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
