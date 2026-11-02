"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import {
  addProductImage,
  deleteProductImage,
  setDefaultProductImage,
} from "@/app/actions/product";

export default function ManageProduct({ product }: { product: any }) {
  const images = product.images || [];
  const [currentImage, setCurrentImage] = useState(0);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSetDefault = async () => {
    if (images.length === 0) return;

    const imageToSetDefault = images[currentImage];

    setMessage("");
    setError("");

    const result = await setDefaultProductImage(product._id, imageToSetDefault);

    if (!result.success) {
      setError(result.message);
      return;
    }

    setMessage(result.message);

    window.location.reload();
  };

  const handleDeleteImage = async () => {
    if (images.length === 0) return;

    const imageToDelete = images[currentImage];

    setMessage("");
    setError("");
    setShowDeleteConfirm(false);

    const result = await deleteProductImage(product._id, imageToDelete);

    if (!result.success) {
      setError(result.message);
      return;
    }

    setMessage(result.message);

    window.location.reload();
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setUploading(true);
    setMessage("");
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadResponse.json();

      if (!uploadData.success) {
        setError(uploadData.message || "Image upload failed.");
        return;
      }

      const saveResponse = await addProductImage(product._id, uploadData.url);

      if (!saveResponse.success) {
        setError(saveResponse.message || "Failed to save image.");
        return;
      }

      setMessage("Image uploaded successfully.");

      // Refresh the page so the new image appears
      window.location.reload();
    } catch (error) {
      console.error(error);
      setError("Something went wrong while uploading the image.");
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const previousImage = () => {
    if (images.length === 0) return;

    setCurrentImage((current) =>
      current === 0 ? images.length - 1 : current - 1,
    );
  };

  const nextImage = () => {
    if (images.length === 0) return;

    setCurrentImage((current) =>
      current === images.length - 1 ? 0 : current + 1,
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 pb-6 pt-6">
      <div className="mx-auto max-w-6xl">
        {/* ================= HEADER ================= */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Manage Product
            </h1>

            <p className="mt-1 text-slate-500">
              View and manage product details.
            </p>
          </div>

          <Link
            href="/admin/products"
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            ← Back to Products
          </Link>
        </div>

        {/* ================= PRODUCT CARD ================= */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
          {/* =================================================
              UPPER HALF - IMAGE
          ================================================= */}
          <div className="flex h-[330px] flex-col items-center justify-center bg-slate-100 px-6 py-4">
            {/* Main Image */}
            <div className="relative flex h-[245px] w-full max-w-sm items-center justify-center overflow-hidden rounded-xl bg-white">
              {images.length > 0 ? (
                <>
                  <img
                    src={images[currentImage]}
                    alt={`${product.name} ${currentImage + 1}`}
                    className="h-full w-full object-contain p-5"
                  />

                  {/* LEFT ARROW */}
                  {images.length > 1 && (
                    <button
                      type="button"
                      onClick={previousImage}
                      aria-label="Previous image"
                      className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-2xl font-medium text-slate-700 shadow-md transition hover:bg-slate-100"
                    >
                      ‹
                    </button>
                  )}

                  {/* RIGHT ARROW */}
                  {images.length > 1 && (
                    <button
                      type="button"
                      onClick={nextImage}
                      aria-label="Next image"
                      className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-2xl font-medium text-slate-700 shadow-md transition hover:bg-slate-100"
                    >
                      ›
                    </button>
                  )}

                  {/* IMAGE COUNTER */}
                  {images.length > 1 && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
                      {currentImage + 1} / {images.length}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center text-slate-400">
                  <div className="mb-2 text-4xl">🖼️</div>
                  <p className="text-sm">No images available</p>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="mt-2 flex gap-2">
                {images.map((image: string, index: number) => (
                  <button
                    key={image + index}
                    type="button"
                    onClick={() => setCurrentImage(index)}
                    className={`h-10 w-10 overflow-hidden rounded-md border-2 bg-white ${
                      currentImage === index
                        ? "border-slate-900"
                        : "border-slate-200"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="h-full w-full object-contain p-1"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* =================================================
              LOWER HALF - PRODUCT DETAILS
          ================================================= */}
          <div className="border-t border-slate-200 px-8 py-5">
            {/* Product Name */}
            <h2 className="text-3xl font-bold text-slate-900">
              {product.name}
            </h2>

            {/* Description */}
            <p className="mt-1 max-w-4xl text-sm leading-6 text-slate-600">
              {product.description}
            </p>

            {/* Product Information */}
            <div className="mt-3 flex flex-wrap items-center gap-x-7 gap-y-2 text-sm">
              <div>
                <span className="font-semibold text-slate-800">Category:</span>{" "}
                <span className="text-slate-600">
                  {product.category?.name || "N/A"}
                </span>
              </div>

              <div>
                <span className="font-semibold text-slate-800">
                  Subcategory:
                </span>{" "}
                <span className="text-slate-600">
                  {product.subcategory?.name || "N/A"}
                </span>
              </div>

              <div>
                <span className="font-semibold text-slate-800">Brand:</span>{" "}
                <span className="text-slate-600">{product.brand || "N/A"}</span>
              </div>

              <div>
                <span className="font-semibold text-slate-800">Price:</span>{" "}
                <span className="text-slate-600">₹{product.price}</span>
              </div>

              <div>
                <span className="font-semibold text-slate-800">Stock:</span>{" "}
                <span className="text-slate-600">{product.stock}</span>
              </div>
            </div>

            {/* Delete Confirmation Popup */}
            {showDeleteConfirm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                  {/* Icon */}
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <span className="text-2xl">🗑️</span>
                  </div>

                  {/* Content */}
                  <div className="mt-4 text-center">
                    <h2 className="text-xl font-bold text-slate-900">
                      Delete Image?
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Are you sure you want to delete this image? <br></br>
                      This action cannot be undone.
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="mt-6 flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={handleDeleteImage}
                      className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
                    >
                      Delete Image
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Actions */}
            <div className="mt-4 flex flex-wrap gap-3">
              {images.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setMessage("");
                      setError("");
                      setShowDeleteConfirm(true);
                    }}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                  >
                    Delete Image
                  </button>

                  <button
                    type="button"
                    onClick={handleSetDefault}
                    className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                  >
                    Set as Default
                  </button>
                </>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />

              {message && (
                <div className="mb-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  {message}
                </div>
              )}

              {error && (
                <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "+ Insert Image"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
