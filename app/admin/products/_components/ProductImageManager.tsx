"use client";

import { useState } from "react";
import {
  addProductImage,
  deleteProductImage,
  setDefaultProductImage,
} from "@/app/actions/product";

export default function ProductImageManager({
  productId,
  images,
}: {
  productId: string;
  images: string[];
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [productImages, setProductImages] = useState(images || []);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const currentImage = productImages[currentIndex];

  /* =========================
     PREVIOUS IMAGE
  ========================= */

  function previousImage() {
    if (productImages.length <= 1) return;

    setCurrentIndex((prev) =>
      prev === 0 ? productImages.length - 1 : prev - 1,
    );
  }

  /* =========================
     NEXT IMAGE
  ========================= */

  function nextImage() {
    if (productImages.length <= 1) return;

    setCurrentIndex((prev) =>
      prev === productImages.length - 1 ? 0 : prev + 1,
    );
  }

  /* =========================
     INSERT IMAGE
  ========================= */

  async function handleUpload(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();

      formData.append("file", file);

      formData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!,
      );

      const cloudName =
        process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      const result = await response.json();

      if (!response.ok) {
        console.error("Cloudinary error:", result);

        alert("Failed to upload image to Cloudinary.");
        return;
      }

      const imageUrl = result.secure_url;

      const saveResult = await addProductImage(
        productId,
        imageUrl,
      );

      if (!saveResult.success) {
        alert(saveResult.message);
        return;
      }

      setProductImages((prev) => [
        ...prev,
        imageUrl,
      ]);

      setCurrentIndex(productImages.length);

    } catch (error) {
      console.error("Upload error:", error);
      alert("Something went wrong while uploading.");
    } finally {
      setUploading(false);

      event.target.value = "";
    }
  }

  /* =========================
     DELETE IMAGE
  ========================= */

  async function handleDelete() {
    if (!currentImage) return;

    const confirmed = confirm(
      "Are you sure you want to delete this image?",
    );

    if (!confirmed) return;

    setLoading(true);

    try {
      const result = await deleteProductImage(
        productId,
        currentImage,
      );

      if (!result.success) {
        alert(result.message);
        return;
      }

      const updatedImages = productImages.filter(
        (_, index) => index !== currentIndex,
      );

      setProductImages(updatedImages);

      if (updatedImages.length === 0) {
        setCurrentIndex(0);
      } else if (
        currentIndex >= updatedImages.length
      ) {
        setCurrentIndex(updatedImages.length - 1);
      }
    } catch (error) {
      console.error("Delete image error:", error);
      alert("Failed to delete image.");
    } finally {
      setLoading(false);
    }
  }

  /* =========================
     SET DEFAULT
  ========================= */

  async function handleSetDefault() {
    if (!currentImage) return;

    if (currentIndex === 0) {
      alert("This image is already the default image.");
      return;
    }

    setLoading(true);

    try {
      const result = await setDefaultProductImage(
        productId,
        currentImage,
      );

      if (!result.success) {
        alert(result.message);
        return;
      }

      const updatedImages = [
        currentImage,
        ...productImages.filter(
          (image) => image !== currentImage,
        ),
      ];

      setProductImages(updatedImages);
      setCurrentIndex(0);

      alert("Default image updated.");
    } catch (error) {
      console.error("Set default error:", error);
      alert("Failed to set default image.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg">
      <h2 className="mb-5 text-2xl font-bold text-slate-900">
        Product Images
      </h2>

      {productImages.length === 0 ? (
        <div className="flex min-h-[420px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50">
          <p className="mb-4 text-gray-500">
            No product images yet.
          </p>

          <label className="cursor-pointer rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700">
            + Insert Image

            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
            />
          </label>
        </div>
      ) : (
        <>
          {/* IMAGE VIEWER */}

          <div className="relative flex min-h-[420px] items-center justify-center overflow-hidden rounded-xl bg-gray-100">
            <img
              src={currentImage}
              alt="Product"
              className="max-h-[420px] max-w-full object-contain"
            />

            {/* LEFT */}

            {productImages.length > 1 && (
              <button
                type="button"
                onClick={previousImage}
                className="absolute left-4 rounded-full bg-white px-4 py-3 text-xl shadow-lg hover:bg-gray-100"
              >
                ←
              </button>
            )}

            {/* RIGHT */}

            {productImages.length > 1 && (
              <button
                type="button"
                onClick={nextImage}
                className="absolute right-4 rounded-full bg-white px-4 py-3 text-xl shadow-lg hover:bg-gray-100"
              >
                →
              </button>
            )}

            {/* DEFAULT LABEL */}

            {currentIndex === 0 && (
              <span className="absolute left-4 top-4 rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white">
                Default Image
              </span>
            )}
          </div>

          {/* COUNTER */}

          <div className="mt-3 text-center text-sm text-gray-500">
            {currentIndex + 1} / {productImages.length}
          </div>

          {/* ACTIONS */}

          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="rounded-lg bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              Delete Image
            </button>

            <button
              type="button"
              onClick={handleSetDefault}
              disabled={
                loading || currentIndex === 0
              }
              className="rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              Set as Default
            </button>

            <label className="cursor-pointer rounded-lg bg-slate-800 px-5 py-3 font-semibold text-white hover:bg-slate-900">
              {uploading
                ? "Uploading..."
                : "+ Insert Image"}

              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
        </>
      )}
    </div>
  );
}