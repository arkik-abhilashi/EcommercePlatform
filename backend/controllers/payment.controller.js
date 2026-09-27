import Coupon from "../models/Coupon.model.js";
import Order from "../models/Order.model.js";
import stripe from "../lib/stripe.js";
import User from "../models/User.model.js";

export const createCheckoutSession = async (req, res) => {
  try {
    const products = req.body.products || req.body.productId;
    const { couponCode } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        message: "Invalid products. It should be a non-empty array.",
      });
    }

    let totalAmount = 0;

    const lineItems = products.map((product) => {
      const quantity = Number(product.quantity) || 1;
      const amount = Math.round(Number(product.price) * 100);
      const imageUrl = product.image?.startsWith("http") ? product.image : null;

      if (!product.name || !Number.isInteger(amount) || amount <= 0) {
        throw new Error("Cart contains an invalid product.");
      }

      totalAmount += amount * quantity;

      const productData = {
        name: product.name,
      };

      if (imageUrl) {
        productData.images = [imageUrl];
      }

      return {
        price_data: {
          currency: "usd",
          product_data: productData,
          unit_amount: amount,
        },
        quantity,
      };
    });

    let coupon = null;
    if (couponCode) {
      coupon = await Coupon.findOne({
        code: couponCode,
        userId: req.user._id,
        isActive: true,
      });
      if (coupon) {
        totalAmount -= Math.round(
          totalAmount * (coupon.discountPercentage / 100),
        );
      }
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
      discounts: coupon
        ? [
            {
              coupon: await createStripeCoupon(coupon.discountPercentage),
            },
          ]
        : [],
      metadata: {
        userId: req.user._id.toString(),
        couponCode: couponCode || "",
        products: JSON.stringify(
          products.map((p) => ({
            id: p._id,
            quantity: Number(p.quantity) || 1,
            price: p.price,
          })),
        ),
      },
    });

    res.status(200).json({
      id: session.id,
      url: session.url,
      totalAmount: totalAmount / 100,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({
      message:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : error.message,
    });
  }
};

export const checkoutSuccess = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      if (session.metadata.couponCode) {
        await Coupon.findOneAndUpdate(
          {
            code: session.metadata.couponCode,
            userId: session.metadata.userId,
          },
          { isActive: false },
        );
      }
      //create a new order
      const products = JSON.parse(session.metadata.products);
      const newOrder = new Order({
        user: session.metadata.userId,
        products: products.map((product) => ({
          product: product.id,
          quantity: product.quantity,
          price: product.price,
        })),
        totalAmount: session.amount_total / 100,
        stripeSessionId: session.id,
      });
      await newOrder.save();

      // Clear user's cart in the database
      await User.findByIdAndUpdate(session.metadata.userId, { cartItems: [] });

      if (session.amount_total >= 20000) {
        await createNewCoupon(session.metadata.userId);
      }

      res.status(200).json({
        success: true,
        message: "Order created successfully",
        orderId: newOrder._id,
      });
    }
  } catch (error) {
    console.error("Error handling checkout success:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

async function createStripeCoupon(discountPercentage) {
  const coupon = await stripe.coupons.create({
    percent_off: discountPercentage,
    duration: "once",
  });
  return coupon.id;
}

async function createNewCoupon(userId) {
  const coupon = await Coupon.findOneAndUpdate(
    { userId },
    {
      code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      discountPercentage: 10,
      expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  return coupon;
}
