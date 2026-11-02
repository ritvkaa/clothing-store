"use client";

import { useState } from "react";
import { updateHero } from "@/app/actions/homepage";

interface HomepageFormProps {
  homepage: {
    heroImage: string;
    heroTitle: string;
    heroSubtitle: string;
    heroButtonText: string;
  };
}

export default function HomepageForm({
  homepage,
}: HomepageFormProps) {
  const [heroImage, setHeroImage] = useState(homepage.heroImage);
  const [heroTitle, setHeroTitle] = useState(homepage.heroTitle);
  const [heroSubtitle, setHeroSubtitle] = useState(
    homepage.heroSubtitle,
  );
  const [heroButtonText, setHeroButtonText] = useState(
    homepage.heroButtonText,
  );

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleImageUpload(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setUploading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.url) {
        setMessage(data.message || "Image upload failed.");
        return;
      }

      setHeroImage(data.url);
      setMessage("Image uploaded successfully.");
    } catch (error) {
      console.error(error);
      setMessage("Failed to upload image.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    if (!heroImage) {
      setMessage("Please upload a hero image.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const result = await updateHero(
        heroImage,
        heroTitle,
        heroSubtitle,
        heroButtonText,
      );

      if (!result.success) {
        setMessage(result.message || "Failed to save.");
        return;
      }

      setMessage("Homepage hero updated successfully.");
    } catch (error) {
      console.error(error);
      setMessage("Failed to save homepage settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

      {/* IMAGE */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Hero Image
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Use a wide fashion image for the main homepage banner.
        </p>

        <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
          {heroImage ? (
            <img
              src={heroImage}
              alt="Homepage hero"
              className="h-[420px] w-full object-cover"
            />
          ) : (
            <div className="flex h-[420px] items-center justify-center text-sm text-slate-400">
              No hero image selected
            </div>
          )}
        </div>

        <label className="mt-4 inline-flex cursor-pointer rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
          {uploading ? "Uploading..." : "Upload Hero Image"}

          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {/* TEXT */}
      <div className="mt-10 grid gap-6">

        <div>
          <label className="text-sm font-semibold text-slate-700">
            Hero Title
          </label>

          <input
            value={heroTitle}
            onChange={(e) => setHeroTitle(e.target.value)}
            placeholder="NEW SEASON"
            className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700">
            Hero Subtitle
          </label>

          <input
            value={heroSubtitle}
            onChange={(e) => setHeroSubtitle(e.target.value)}
            placeholder="DEFINE YOUR STYLE"
            className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700">
            Button Text
          </label>

          <input
            value={heroButtonText}
            onChange={(e) => setHeroButtonText(e.target.value)}
            placeholder="SHOP NOW"
            className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
          />
        </div>

      </div>

      {/* MESSAGE */}
      {message && (
        <p className="mt-5 text-sm text-slate-600">
          {message}
        </p>
      )}

      {/* SAVE */}
      <button
        type="button"
        onClick={handleSave}
        disabled={saving || uploading}
        className="mt-6 rounded-lg bg-black px-7 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Homepage"}
      </button>

    </div>
  );
}