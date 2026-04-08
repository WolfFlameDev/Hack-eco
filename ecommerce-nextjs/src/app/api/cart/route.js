import connectDB from '@/lib/db';

export default async function handler(req, res) {
  const db = await connectDB();
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const cart = await db.cart.findMany({ where: { userId: req.user.id } });
        res.status(200).json(cart);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch cart items' });
      }
      break;

    case 'POST':
      try {
        const { productId, quantity } = req.body;
        const cartItem = await db.cart.create({
          data: {
            userId: req.user.id,
            productId,
            quantity,
          },
        });
        res.status(201).json(cartItem);
      } catch (error) {
        res.status(500).json({ error: 'Failed to add item to cart' });
      }
      break;

    case 'PUT':
      try {
        const { id, quantity } = req.body;
        const updatedCartItem = await db.cart.update({
          where: { id },
          data: { quantity },
        });
        res.status(200).json(updatedCartItem);
      } catch (error) {
        res.status(500).json({ error: 'Failed to update cart item' });
      }
      break;

    case 'DELETE':
      try {
        const { id } = req.body;
        await db.cart.delete({ where: { id } });
        res.status(204).end();
      } catch (error) {
        res.status(500).json({ error: 'Failed to remove item from cart' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}