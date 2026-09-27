import Coupon from "../models/Coupon.model.js";

export const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({
      userId: req.user._id,
      isActive: true,
    });
    res.json(coupons || null);
  } catch (error) {
    console.error("Error fetching coupons:", error);
    res.status(500).json({ message: error.message });
  }
};

export const validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const coupon = await Coupon.findOne({
      code,
      userId: req.user._id,
      isActive: true,
    });

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found or inactive" });
    }

    if (coupon.expirationDate < new Date()) {
      coupon.isActive = false;
      await coupon.save();
      return res.status(400).json({ message: "Coupon has expired" });
    }

    res.json({
      message: "Coupon is valid",
      code: coupon.code,
      discountPercentage: coupon.discountPercentage,
    });
  } catch (error) {
    console.error("Error validating coupon:", error);
    res.status(500).json({ message: error.message });
  }
};
