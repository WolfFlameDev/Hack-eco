import { useCart } from '@/hooks/useCart';
import { useState } from 'react';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000); // Reset after 2 seconds
  };

  return (
    <div className="border rounded-md shadow-md p-4">
      <img src={product.image} alt={product.name} className="w-full h-48 object-cover rounded-md" />
      <h3 className="text-lg font-semibold mt-2">{product.name}</h3>
      <p className="text-gray-600">${product.price}</p>
      <button
        onClick={handleAddToCart}
        className={`mt-4 w-full py-2 px-4 rounded-md text-white ${isAdded ? 'bg-green-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}
      >
        {isAdded ? 'Added to Cart' : 'Add to Cart'}
      </button>
    </div>
  );
}