import mongoose, { Schema, Types, Document, Model } from "mongoose";

/* =========================================================
   ORDER ITEM
========================================================= */

export interface IOrderItem {
  _id?: Types.ObjectId;
  product: Types.ObjectId;

  name: string;
  brand: string;
  image: string;

  price: number;
  quantity: number;

  size: string;
  color: string;
}

/* =========================================================
   SHIPPING ADDRESS
========================================================= */

export interface IShippingAddress {
  name: string;
  email: string;
  phone: string;

  address: string;
  city: string;
  state: string;
  pincode: string;
}

/* =========================================================
   RETURN ITEM
========================================================= */

export interface IReturnItem {
  _id?: Types.ObjectId;

  product: Types.ObjectId;

  quantity: number;

  reason: string;

  size: string;
  color: string;

  status: "requested" | "approved" | "rejected" | "received";

  refundStatus: "not_required" | "pending" | "processed" | "failed";

  refundAmount: number;

  razorpayRefundId: string;

  adminResponse: string;

  requestedAt: Date;

  approvedAt: Date | null;

  refundedAt: Date | null;
}

/* =========================================================
   ORDER
========================================================= */

export interface IOrder extends Document {
  user: Types.ObjectId;

  items: IOrderItem[];

  shippingAddress: IShippingAddress;

  subtotal: number;
  deliveryCharge: number;
  totalAmount: number;

  paymentMethod: "razorpay" | "cod";

  paymentStatus: "pending" | "paid" | "failed" | "refunded";

  orderStatus:
    | "placed"
    | "confirmed"
    | "shipped"
    | "out_for_delivery"
    | "delivered"
    | "cancelled";

  /* =======================================================
     RAZORPAY
  ======================================================= */

  razorpayOrderId: string;

  razorpayPaymentId: string;

  razorpaySignature: string;

  /* =======================================================
     RETURNS
  ======================================================= */

  returns: IReturnItem[];

  /* =======================================================
     PERMANENT REFUND RECORD
     
     These fields belong to the ORDER itself.
     
     They remain even if the returns array is later
     modified or deleted.
  ======================================================= */

  refundProcessed: boolean;

  refundProcessedAt: Date | null;

  refundAmount: number;

  razorpayRefundId: string;

  /* =======================================================
     CANCELLATION
  ======================================================= */

  cancellationReason: string;

  cancelledAt: Date | null;

  cancellationRefundStatus: "not_required" | "pending" | "processed" | "failed";

  cancellationRefundAmount: number;

  cancellationRazorpayRefundId: string;

  createdAt: Date;
  updatedAt: Date;
}

/* =========================================================
   ORDER ITEM SCHEMA
========================================================= */

const OrderItemSchema = new Schema<IOrderItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    brand: {
      type: String,
      default: "",
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    size: {
      type: String,
      default: "",
      trim: true,
    },

    color: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    _id: true,
  },
);

/* =========================================================
   SHIPPING ADDRESS SCHEMA
========================================================= */

const ShippingAddressSchema = new Schema<IShippingAddress>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    pincode: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false,
  },
);

/* =========================================================
   RETURN ITEM SCHEMA
========================================================= */

const ReturnItemSchema = new Schema<IReturnItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
    },

    size: {
      type: String,
      default: "",
      trim: true,
    },

    color: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["requested", "approved", "rejected", "received"],
      default: "requested",
    },

    refundStatus: {
      type: String,
      enum: ["not_required", "pending", "processed", "failed"],
      default: "not_required",
    },

    refundAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    razorpayRefundId: {
      type: String,
      default: "",
    },

    adminResponse: {
      type: String,
      default: "",
      trim: true,
    },

    requestedAt: {
      type: Date,
      default: Date.now,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    refundedAt: {
      type: Date,
      default: null,
    },
  },
  {
    _id: true,
  },
);

/* =========================================================
   ORDER SCHEMA
========================================================= */

const OrderSchema = new Schema<IOrder>(
  {
    /* =====================================================
         USER
      ===================================================== */

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    /* =====================================================
         ORDER ITEMS
         
         IMPORTANT:
         This is an embedded array of OrderItem objects,
         NOT ObjectId[].
      ===================================================== */

    items: {
      type: [OrderItemSchema],
      required: true,
      default: [],
    },

    /* =====================================================
         SHIPPING
      ===================================================== */

    shippingAddress: {
      type: ShippingAddressSchema,
      required: true,
    },

    /* =====================================================
         AMOUNTS
      ===================================================== */

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    deliveryCharge: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    /* =====================================================
         PAYMENT
      ===================================================== */

    paymentMethod: {
      type: String,
      enum: ["razorpay", "cod"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    /* =====================================================
         ORDER STATUS
         
         placed is the FIRST state.
      ===================================================== */

    orderStatus: {
      type: String,
      enum: [
        "placed",
        "confirmed",
        "shipped",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      default: "placed",
    },

    /* =====================================================
         RAZORPAY
      ===================================================== */

    razorpayOrderId: {
      type: String,
      default: "",
    },

    razorpayPaymentId: {
      type: String,
      default: "",
    },

    razorpaySignature: {
      type: String,
      default: "",
    },

    /* =====================================================
         RETURNS
      ===================================================== */

    returns: {
      type: [ReturnItemSchema],
      default: [],
    },

    /* =====================================================
         PERMANENT REFUND INFORMATION
         
         DO NOT PUT THESE INSIDE `returns`.
         
         These survive deletion/modification of return records.
      ===================================================== */

    refundProcessed: {
      type: Boolean,
      default: false,
    },

    refundProcessedAt: {
      type: Date,
      default: null,
    },

    refundAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    razorpayRefundId: {
      type: String,
      default: "",
    },

    /* =====================================================
         CANCELLATION
      ===================================================== */

    cancellationReason: {
      type: String,
      default: "",
      trim: true,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    cancellationRefundStatus: {
      type: String,
      enum: ["not_required", "pending", "processed", "failed"],
      default: "not_required",
    },

    cancellationRefundAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    cancellationRazorpayRefundId: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

/* =========================================================
   MODEL
========================================================= */

const Order =
  (mongoose.models.Order as Model<IOrder>) ||
  mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
