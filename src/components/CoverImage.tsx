import Image from "next/image";

type AspectRatio = "video" | "16/10" | "4/3" | "1/1" | "21/9";

type Props = {
  src?: string;
  alt: string;
  eyebrow?: string;
  title: string;
  meta?: string;
  aspectRatio?: AspectRatio;
  size?: "sm" | "md" | "lg";
  priority?: boolean;
  className?: string;
};

const aspectClass: Record<AspectRatio, string> = {
  video: "aspect-video",
  "16/10": "aspect-[16/10]",
  "4/3": "aspect-[4/3]",
  "1/1": "aspect-square",
  "21/9": "aspect-[21/9]",
};

const titleSize = {
  sm: "text-base sm:text-lg",
  md: "text-lg sm:text-xl",
  lg: "text-xl sm:text-3xl",
};

const padding = {
  sm: "p-5 sm:p-6",
  md: "p-6 sm:p-8",
  lg: "p-8 sm:p-12",
};

export default function CoverImage({
  src,
  alt,
  eyebrow,
  title,
  meta,
  aspectRatio = "16/10",
  size = "md",
  priority = false,
  className = "",
}: Props) {
  if (src) {
    return (
      <div
        className={`${aspectClass[aspectRatio]} relative overflow-hidden bg-cream-deep ${className}`}
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 560px, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
      </div>
    );
  }

  // Typographic poster — uses navy/gold/cream palette
  return (
    <div
      className={`${aspectClass[aspectRatio]} relative overflow-hidden bg-cream-deep ${className}`}
      aria-label={alt}
    >
      <div
        className={`absolute inset-0 ${padding[size]} flex flex-col justify-between`}
      >
        {eyebrow && (
          <div className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-navy/70">
            {eyebrow}
          </div>
        )}
        <div
          className={`font-mincho ${titleSize[size]} leading-[1.55] text-navy`}
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {title}
        </div>
        {meta && (
          <div className="text-[11px] tracking-wider text-navy/70">{meta}</div>
        )}
      </div>
      <div className="absolute bottom-0 left-6 right-6 sm:left-8 sm:right-8 h-px bg-gold/50" />
    </div>
  );
}
