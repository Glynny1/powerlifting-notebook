import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function base(props: IconProps) {
  return {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...props,
  };
}

export function HomeIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h5.5v-5.5h3V21H19V9.5" />
    </svg>
  );
}

export function BarbellIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M2 12h2" />
      <rect x="4" y="8" width="3" height="8" rx="0.5" />
      <rect x="17" y="8" width="3" height="8" rx="0.5" />
      <path d="M7 12h10" />
      <path d="M20 12h2" />
    </svg>
  );
}

export function ScaleIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M8.5 9.5a4.5 4.5 0 0 1 7 0" />
      <path d="M12 8.2 13.4 6" />
    </svg>
  );
}

export function FlameIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3c1 3-3.5 5-3.5 9a4.7 4.7 0 0 0 4.6 4.8A4.9 4.9 0 0 0 18 12c0-2-1-3.5-2-4.5.2 2-1 3-1.8 3.2C15 8 14.5 4.5 12 3Z" />
      <path d="M12 21h0" />
    </svg>
  );
}

export function GearIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2.1-1.3L14 3h-4l-.5 2.6a7 7 0 0 0-2.1 1.3l-2.3-1-2 3.4 2 1.5a7 7 0 0 0 0 2.4l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 2.1 1.3L10 21h4l.5-2.6a7 7 0 0 0 2.1-1.3l2.3 1 2-3.4-2-1.5A7 7 0 0 0 19 12Z" />
    </svg>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <svg {...base({ width: 18, height: 18, ...props })}>
      <path d="M4 7h16" />
      <path d="M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7" />
      <path d="M6.5 7 7.5 21h9L17.5 7" />
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 6.5h16" />
      <path d="M4 12h16" />
      <path d="M4 17.5h16" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m5.5 5.5 13 13" />
      <path d="m18.5 5.5-13 13" />
    </svg>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <svg {...base({ width: 16, height: 16, ...props })}>
      <path d="m9 5 7 7-7 7" />
    </svg>
  );
}

export function PulseIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M2.5 12h4l2.5-6.5 4 13L15.5 12h6" />
    </svg>
  );
}

export function QuoteIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 5.5h16v11H12l-4.5 3.8V16.5H4v-11Z" />
    </svg>
  );
}

export function BandageIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M12 8v8" />
      <path d="M8 12h8" />
    </svg>
  );
}

export function PencilIcon(props: IconProps) {
  return (
    <svg {...base({ width: 18, height: 18, ...props })}>
      <path d="m14.5 5 4.5 4.5L8.5 20 3.5 20.5 4 15.5 14.5 5Z" />
      <path d="m12.5 7 4.5 4.5" />
    </svg>
  );
}
