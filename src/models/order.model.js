import mongoose from "mongoose";
import Product from "./product.model.js";

const orderSchema = mongoose.Schema(
  {
    cartItems: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
        },
        itemPrice: {
          type: Number,
          required: true,
        },
      },
    ],
    paymentMethod: {
      type: String,
      required: true,
      enum: ["credit_card", "cash_on_delivery"],
      validate: {
        validator: function (v) {
          return ["credit_card", "cash_on_delivery"].includes(v);
        },
        message: (props) => `${props.value} is not a valid payment method!`,
      },
    },
    paymentDetails: {
      type: Object,
      required: true,
    },
    shippingPrice: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    // isDelivered: {
    //   type: Boolean,
    //   default: false,
    // },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shipping: [
      {
        address: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Address",
          required: true,
        },
        status: {
          type: String,
          enum: [
            "pending",
            "approved",
            "shipped",
            "cancelled",
            "delivered",
            "refunded",
          ],
          default: "pending",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

orderSchema.pre("save", async function (next) {
  if (this.isNew) {
    for (let item of this.cartItems) {
      const product = await Product.findById(item.productId);
      if (product && product.availableStock >= item.quantity) {
        product.availableStock -= item.quantity;
        await product.save();
      } else {
        throw new Error("Not enough stock for this product");
      }
    }
  }
  next();
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
