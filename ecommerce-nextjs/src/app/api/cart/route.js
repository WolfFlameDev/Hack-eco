import connectDB from "@/lib/db";
import Cart from "@/models/Cart";

export default async function handler(req, res) {
  const { method } = req;
  await connectDB();

  switch (method) {
    case "GET":
      try {
        const cart = await Cart.find({ userId: req.user?.id }).populate("productId");
        return res.status(200).json(cart);
      } catch (error) {
        return res.status(500).json({ error: "Failed to fetch cart items" });
      }

    case "POST":
      try {
        const { productId, quantity } = req.body;
        const cartItem = await Cart.create({
          userId: req.user?.id,
          productId,
          quantity,
        });
        return res.status(201).json(cartItem);
      } catch (error) {
        return res.status(500).json({ error: "Failed to add item to cart" });
      }

    case "PUT":
      try {
        const { id, quantity } = req.body;
        const updatedCartItem = await Cart.findByIdAndUpdate(
          id,
          { quantity },
          { new: true }
        );
        return res.status(200).json(updatedCartItem);
      } catch (error) {
        return res.status(500).json({ error: "Failed to update cart item" });
      }

    case "DELETE":
      try {
        const { id } = req.body;
        await Cart.findByIdAndDelete(id);
        return res.status(204).end();
      } catch (error) {
        return res.status(500).json({ error: "Failed to remove item from cart" });
      }

    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      return res.status(405).end(`Method {method} Not Allowed`);
  }
}
