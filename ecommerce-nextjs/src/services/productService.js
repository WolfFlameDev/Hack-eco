import { dummyProducts } from '@/data/products';

export async function getProducts() {
  return Promise.resolve(dummyProducts);
}
