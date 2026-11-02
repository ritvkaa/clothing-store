type StorefrontImageProps = {
  src?: string | null;
  alt: string;
  className: string;
};

const PRODUCT_FALLBACK = "/images/product-fallback.jpg";

export default function StorefrontImage({
  src,
  alt,
  className,
}: StorefrontImageProps) {
  const imageSrc = src?.trim() || PRODUCT_FALLBACK;

  return (
    <img
      src={imageSrc}
      alt={alt ? (src?.trim() ? alt : "Representative clothing photo") : ""}
      className={className}
    />
  );
}
