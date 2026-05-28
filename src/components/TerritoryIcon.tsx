type Props = { slug: string; className?: string };

/**
 * Small icon (≈ 40-60 px) representing each concern territory.
 * Used in the SBC-style "悩みから探す" grid.
 */
export default function TerritoryIcon({ slug, className = "" }: Props) {
  const Icon = icons[slug] ?? Default;
  return (
    <span
      className={`inline-flex items-center justify-center text-ink ${className}`}
      aria-hidden
    >
      <Icon />
    </span>
  );
}

const SIZE = "w-10 h-10 sm:w-12 sm:h-12";

const icons: Record<string, () => JSX.Element> = {
  "sweat-odor": SweatOdor,
  "skin-acne": SkinAcne,
  "face-impression": FaceImpression,
  "mind-awareness": MindAwareness,
  "hair-loss": HairLoss,
  "beard-body-hair": BeardBodyHair,
};

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={SIZE}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

function SweatOdor() {
  return (
    <Frame>
      <path d="M24 6c-3 6-6 10-6 15a6 6 0 0 0 12 0c0-5-3-9-6-15z" />
      <path d="M14 38c2-1 4-1 5 0M29 38c2-1 4-1 5 0" opacity="0.6" />
    </Frame>
  );
}

function SkinAcne() {
  return (
    <Frame>
      <circle cx="24" cy="24" r="16" opacity="0.35" />
      <circle cx="24" cy="24" r="10" opacity="0.6" />
      <circle cx="24" cy="24" r="4" fill="currentColor" stroke="none" />
      <circle cx="38" cy="14" r="1.6" fill="currentColor" stroke="none" opacity="0.7" />
    </Frame>
  );
}

function FaceImpression() {
  return (
    <Frame>
      <ellipse cx="24" cy="24" rx="11" ry="14" />
      <path d="M19 22c1-1 2-1 3 0M26 22c1-1 2-1 3 0" />
      <path d="M21 30c2 1 4 1 6 0" opacity="0.7" />
    </Frame>
  );
}

function MindAwareness() {
  return (
    <Frame>
      <line x1="10" y1="24" x2="38" y2="24" />
      <line x1="20" y1="14" x2="28" y2="14" opacity="0.55" />
      <circle cx="10" cy="24" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="34" cy="34" r="1.4" fill="currentColor" stroke="none" opacity="0.7" />
    </Frame>
  );
}

function HairLoss() {
  return (
    <Frame>
      <line x1="14" y1="14" x2="14" y2="34" opacity="0.7" />
      <line x1="19" y1="20" x2="19" y2="34" opacity="0.45" />
      <line x1="24" y1="11" x2="24" y2="34" opacity="0.85" />
      <line x1="29" y1="17" x2="29" y2="34" opacity="0.55" />
      <line x1="34" y1="22" x2="34" y2="34" opacity="0.4" />
      <line x1="10" y1="34" x2="38" y2="34" />
    </Frame>
  );
}

function BeardBodyHair() {
  return (
    <Frame>
      <line x1="14" y1="20" x2="20" y2="14" />
      <line x1="20" y1="22" x2="28" y2="16" opacity="0.7" />
      <line x1="16" y1="28" x2="22" y2="24" opacity="0.55" />
      <line x1="26" y1="30" x2="34" y2="22" />
      <line x1="22" y1="34" x2="30" y2="30" opacity="0.7" />
      <line x1="30" y1="34" x2="36" y2="32" opacity="0.55" />
    </Frame>
  );
}

function Default() {
  return (
    <Frame>
      <circle cx="24" cy="24" r="14" />
    </Frame>
  );
}
