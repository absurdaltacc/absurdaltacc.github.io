interface AtomLogoProps {
  size?: number;
  className?: string;
}

export default function AtomLogo({ size = 44, className = "" }: AtomLogoProps) {
  return (
    <svg
      class={`atom-logo ${className}`}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Absent cross"
    >
      <rect x="42" y="8" width="16" height="84" rx="3" class="cross-vertical" />
      <rect x="14" y="29" width="72" height="16" rx="3" class="cross-horizontal" />
    </svg>
  );
}
