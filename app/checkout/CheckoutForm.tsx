"use client";

import {
  createRazorpayOrder,
  placeCodOrder,
  verifyRazorpayPayment,
} from "@/app/actions/checkout";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import StorefrontImage from "@/app/_components/StorefrontImage";

type UserData = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
};

type Item = {
  _id: string;
  productId: string;
  name: string;
  brand: string;
  image: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
};

type Summary = {
  subtotal: number;
  deliveryCharge: number;
  totalAmount: number;
  freeShippingThreshold: number;
};

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutForm({
  user,
  items,
  summary,
  storeName,
}: {
  user: UserData;
  items: Item[];
  summary: Summary;
  storeName: string;
}) {
  const [form, setForm] = useState<UserData>(user);

  const router = useRouter();

  const [paymentMethod, setPaymentMethod] = useState<
    "razorpay" | "cod"
  >("razorpay");

  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const updateField = (field: keyof UserData, value: string) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  useEffect(() => {
    if (window.Razorpay) {
      setRazorpayLoaded(true);
      return;
    }

    const script = document.createElement("script");

    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => {
      setRazorpayLoaded(true);
    };

    script.onerror = () => {
      setRazorpayLoaded(false);
      setMessage(
        "Unable to load Razorpay. Please check your internet connection and try again.",
      );
    };

    document.body.appendChild(script);

    return () => {
      // Keep the Razorpay script available for reuse.
    };
  }, []);

  const handleSubmit = async () => {
    setMessage("");

    const missingFields =
      !form.name.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.address.trim() ||
      !form.city.trim() ||
      !form.state.trim() ||
      !form.pincode.trim();

    if (missingFields) {
      setMessage(
        "Please complete all delivery details before placing your order.",
      );
      return;
    }

    // =========================
    // RAZORPAY
    // =========================
    if (paymentMethod === "razorpay") {
      if (!razorpayLoaded || !window.Razorpay) {
        setMessage(
          "Razorpay is still loading. Please wait a moment and try again.",
        );
        return;
      }

      setLoading(true);

      const result = await createRazorpayOrder(form);

      if (result.requiresLogin) {
        router.push("/login?redirect=/checkout");
        return;
      }

      if (!result.success) {
        setMessage(
          result.message ||
            "Something went wrong. Please try again.",
        );
        setLoading(false);
        return;
      }

      if (
        !result.keyId ||
        !result.amount ||
        !result.currency ||
        !result.razorpayOrderId ||
        !result.orderId
      ) {
        setMessage(
          "Invalid Razorpay order details. Please try again.",
        );
        setLoading(false);
        return;
      }

      const options = {
        key: result.keyId,

        // Razorpay expects amount in paise.
        amount: Math.round(result.amount * 100),

        currency: result.currency,

        name: storeName,

        description: `${storeName} Order`,

        order_id: result.razorpayOrderId,

        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone,
        },

        theme: {
          color: "#000000",
        },

        handler: async function (response: any) {
          setMessage("");

          const verification =
            await verifyRazorpayPayment({
              orderId: result.orderId,
              razorpayOrderId:
                response.razorpay_order_id,
              razorpayPaymentId:
                response.razorpay_payment_id,
              razorpaySignature:
                response.razorpay_signature,
            });

          if (verification.requiresLogin) {
            router.push("/login?redirect=/checkout");
            return;
          }

          if (!verification.success) {
            setMessage(
              verification.message ||
                "Payment verification failed.",
            );
            setLoading(false);
            return;
          }

          router.push(
            `/order-success/${verification.orderId}`,
          );
        },

        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on(
        "payment.failed",
        function (response: any) {
          setMessage(
            response.error?.description ||
              "Payment failed. Please try again.",
          );

          setLoading(false);
        },
      );

      razorpay.open();

      return;
    }

    // =========================
    // CASH ON DELIVERY
    // =========================

    setLoading(true);

    const result = await placeCodOrder(form);

    if (result.requiresLogin) {
      router.push("/login?redirect=/checkout");
      return;
    }

    if (!result.success) {
      setMessage(
        result.message ||
          "Something went wrong. Please try again.",
      );
      setLoading(false);
      return;
    }

    router.push(`/order-success/${result.orderId}`);
  };

  return (
    <div className="grid gap-14 lg:grid-cols-[1fr_420px]">
      {/* =========================
          LEFT — CHECKOUT DETAILS
      ========================= */}
      <div>
        {/* DELIVERY DETAILS */}
        <section className="border-t border-black pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium tracking-[0.15em]">
              DELIVERY DETAILS
            </h2>

            <span className="text-[10px] tracking-[0.15em] text-neutral-400">
              REQUIRED
            </span>
          </div>

          <div className="mt-8 grid gap-x-8 gap-y-7 md:grid-cols-2">
            {/* NAME */}
            <div>
              <label className="text-[10px] tracking-[0.15em] text-neutral-500">
                FULL NAME
              </label>

              <input
                value={form.name}
                onChange={(e) =>
                  updateField("name", e.target.value)
                }
                className="mt-2 w-full border-b border-black/20 bg-transparent py-3 text-sm outline-none transition focus:border-black"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="text-[10px] tracking-[0.15em] text-neutral-500">
                EMAIL
              </label>

              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  updateField("email", e.target.value)
                }
                className="mt-2 w-full border-b border-black/20 bg-transparent py-3 text-sm outline-none transition focus:border-black"
              />
            </div>

            {/* PHONE */}
            <div>
              <label className="text-[10px] tracking-[0.15em] text-neutral-500">
                PHONE
              </label>

              <input
                type="tel"
                value={form.phone}
                onChange={(e) =>
                  updateField("phone", e.target.value)
                }
                className="mt-2 w-full border-b border-black/20 bg-transparent py-3 text-sm outline-none transition focus:border-black"
              />
            </div>

            {/* PINCODE */}
            <div>
              <label className="text-[10px] tracking-[0.15em] text-neutral-500">
                PINCODE
              </label>

              <input
                value={form.pincode}
                onChange={(e) =>
                  updateField("pincode", e.target.value)
                }
                className="mt-2 w-full border-b border-black/20 bg-transparent py-3 text-sm outline-none transition focus:border-black"
              />
            </div>

            {/* ADDRESS */}
            <div className="md:col-span-2">
              <label className="text-[10px] tracking-[0.15em] text-neutral-500">
                ADDRESS
              </label>

              <textarea
                value={form.address}
                onChange={(e) =>
                  updateField("address", e.target.value)
                }
                rows={3}
                className="mt-2 w-full resize-none border-b border-black/20 bg-transparent py-3 text-sm outline-none transition focus:border-black"
              />
            </div>

            {/* CITY */}
            <div>
              <label className="text-[10px] tracking-[0.15em] text-neutral-500">
                CITY
              </label>

              <input
                value={form.city}
                onChange={(e) =>
                  updateField("city", e.target.value)
                }
                className="mt-2 w-full border-b border-black/20 bg-transparent py-3 text-sm outline-none transition focus:border-black"
              />
            </div>

            {/* STATE */}
            <div>
              <label className="text-[10px] tracking-[0.15em] text-neutral-500">
                STATE
              </label>

              <input
                value={form.state}
                onChange={(e) =>
                  updateField("state", e.target.value)
                }
                className="mt-2 w-full border-b border-black/20 bg-transparent py-3 text-sm outline-none transition focus:border-black"
              />
            </div>
          </div>
        </section>

        {/* PAYMENT */}
        <section className="mt-16 border-t border-black pt-6">
          <h2 className="text-sm font-medium tracking-[0.15em]">
            PAYMENT METHOD
          </h2>

          <div className="mt-8 space-y-3">
            {/* RAZORPAY */}
            <button
              type="button"
              onClick={() =>
                setPaymentMethod("razorpay")
              }
              className={`flex w-full items-center gap-4 border p-5 text-left transition ${
                paymentMethod === "razorpay"
                  ? "border-black"
                  : "border-black/15 hover:border-black/40"
              }`}
            >
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                  paymentMethod === "razorpay"
                    ? "border-black"
                    : "border-black/30"
                }`}
              >
                {paymentMethod === "razorpay" && (
                  <span className="h-2 w-2 rounded-full bg-black" />
                )}
              </span>

              <div>
                <p className="text-sm tracking-wide">
                  RAZORPAY
                </p>

                <p className="mt-1 text-xs text-neutral-500">
                  UPI, cards, net banking and more
                </p>
              </div>
            </button>

            {/* COD */}
            <button
              type="button"
              onClick={() => setPaymentMethod("cod")}
              className={`flex w-full items-center gap-4 border p-5 text-left transition ${
                paymentMethod === "cod"
                  ? "border-black"
                  : "border-black/15 hover:border-black/40"
              }`}
            >
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                  paymentMethod === "cod"
                    ? "border-black"
                    : "border-black/30"
                }`}
              >
                {paymentMethod === "cod" && (
                  <span className="h-2 w-2 rounded-full bg-black" />
                )}
              </span>

              <div>
                <p className="text-sm tracking-wide">
                  CASH ON DELIVERY
                </p>

                <p className="mt-1 text-xs text-neutral-500">
                  Pay when your order arrives
                </p>
              </div>
            </button>
          </div>
        </section>

        {/* MESSAGE / DISCLAIMER */}
        {message && (
          <div className="mt-8 border border-red-200 bg-red-50 px-5 py-4">
            <p className="text-xs leading-5 text-red-700">
              {message}
            </p>
          </div>
        )}
      </div>

      {/* =========================
          RIGHT — ORDER SUMMARY
      ========================= */}
      <aside className="h-fit lg:sticky lg:top-8">
        <div className="border-t border-black pt-6">
          <h2 className="text-sm font-medium tracking-[0.15em]">
            ORDER SUMMARY
          </h2>

          {/* ITEMS */}
          <div className="mt-8 space-y-6">
            {items.map((item) => (
              <div
                key={item._id}
                className="flex gap-4"
              >
                <div className="h-28 w-20 shrink-0 overflow-hidden bg-neutral-100">
                  <StorefrontImage
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-neutral-500">
                    {item.brand}
                  </p>

                  <p className="mt-1 text-sm">
                    {item.name}
                  </p>

                  <div className="mt-2 space-y-0.5 text-xs text-neutral-500">
                    <p>Qty: {item.quantity}</p>

                    {item.size && (
                      <p>Size: {item.size}</p>
                    )}

                    {item.color && (
                      <p>Color: {item.color}</p>
                    )}
                  </div>

                  <p className="mt-3 text-sm">
                    ₹
                    {(
                      item.price * item.quantity
                    ).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* TOTAL */}
          <div className="mt-8 space-y-4 border-t border-black/10 pt-6 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">
                Subtotal
              </span>

              <span>
                ₹
                {summary.subtotal.toLocaleString(
                  "en-IN",
                )}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-neutral-500">
                Delivery
              </span>

              <span>
                {summary.deliveryCharge === 0
                  ? "FREE"
                  : `₹${summary.deliveryCharge.toLocaleString(
                      "en-IN",
                    )}`}
              </span>
            </div>

            {summary.deliveryCharge > 0 && (
              <p className="border-t border-black/10 pt-4 text-xs leading-5 text-neutral-500">
                Free delivery on orders above ₹{summary.freeShippingThreshold.toLocaleString("en-IN")}.
              </p>
            )}

            <div className="flex justify-between border-t border-black/10 pt-5 text-base font-medium">
              <span>TOTAL</span>

              <span>
                ₹
                {summary.totalAmount.toLocaleString(
                  "en-IN",
                )}
              </span>
            </div>
          </div>

          {/* PLACE ORDER */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              loading ||
              (paymentMethod === "razorpay" &&
                !razorpayLoaded)
            }
            className="mt-8 flex w-full items-center justify-center gap-3 bg-black py-5 text-xs tracking-[0.2em] text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              "PROCESSING..."
            ) : paymentMethod === "razorpay" &&
              !razorpayLoaded ? (
              "LOADING PAYMENT..."
            ) : (
              <>
                PLACE ORDER
                <ArrowRight
                  size={14}
                  strokeWidth={1.5}
                />
              </>
            )}
          </button>

          <div className="mt-5 flex items-start gap-3 border-t border-black/10 pt-5">
            <CheckCircle2
              size={15}
              strokeWidth={1.5}
              className="mt-0.5 shrink-0"
            />

            <p className="text-[11px] leading-5 text-neutral-500">
              By placing your order, you confirm that
              your delivery details are correct.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
