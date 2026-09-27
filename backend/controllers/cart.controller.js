import Product from "../models/Product.model.js";

export const addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const existingItem = user.cartItems.find(
      (item) => item.product.toString() === productId,
    );
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      user.cartItems.push({ product: productId, quantity: 1 });
    }

    await user.save();
    res.json(user.cartItems);
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getCartProducts = async (req, res) => {
  try {
    const productIds = req.user.cartItems.map((item) => item.product);
    const products = await Product.find({ _id: { $in: productIds } });

    const cartProducts = products.map((prod) => {
      const item = req.user.cartItems.find(
        (cartItem) => cartItem.product.toString() === prod._id.toString(),
      );
      return {
        ...prod.toObject(),
        quantity: item.quantity,
      };
    });
    res.json(cartProducts);
  } catch (error) {
    console.error("Error fetching cart products:", error);
    res.status(500).json({ message: error.message });
  }
};

export const removeAllFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;
    if (!productId) {
      req.user.cartItems = [];
    } else {
      user.cartItems = user.cartItems.filter(
        (item) => item.product.toString() !== productId,
      );
    }

    await user.save();
    res.json(user.cartItems);
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({ message: error.message });
  }
};

export const updateQuantity = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const quantity = Number(req.body.quantity);
    const user = req.user;

    if (!Number.isInteger(quantity) || quantity < 0) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    const existingItem = user.cartItems.find(
      (item) => item.product.toString() === productId,
    );

    if (existingItem) {
      if (quantity === 0) {
        user.cartItems = user.cartItems.filter(
          (item) => item.product.toString() !== productId,
        );
        await user.save();
        return res.json(user.cartItems);
      }

      existingItem.quantity = quantity;
      await user.save();
      res.json(user.cartItems);
    } else {
      res.status(404).json({ message: "Product not found in cart" });
    }
  } catch (error) {
    console.error("Error updating cart quantity:", error);
    res.status(500).json({ message: error.message });
  }
};
