const paths = {
  paw: (
    <>
      <ellipse cx="12" cy="16" rx="5.5" ry="4" />
      <ellipse cx="5" cy="10" rx="2" ry="3" transform="rotate(-25 5 10)" />
      <ellipse cx="10" cy="6" rx="2" ry="3" />
      <ellipse cx="16" cy="6" rx="2" ry="3" />
      <ellipse cx="21" cy="11" rx="2" ry="3" transform="rotate(25 21 11)" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
  back: <path d="M19 12H5m6-6-6 6 6 6" />,
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 4 4" />
    </>
  ),
  heart: (
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
  ),
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
    </>
  ),
  inbox: (
    <>
      <path d="m4 4-2 11v5h20v-5L20 4ZM2 15h6l2 3h4l2-3h6" />
      <path d="M12 5v7m-3-3 3 3 3-3" />
    </>
  ),
  send: <path d="m22 2-7 20-4-9-9-4ZM22 2 11 13" />,
  edit: <path d="m15 5 4 4M4 20l5-1L21 7a2.8 2.8 0 0 0-4-4L5 15ZM13 20h8" />,
  trash: <path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7" />,
  pin: (
    <>
      <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
    </>
  ),
  moon: <path d="M20.8 13A9 9 0 0 1 11 3.2 9 9 0 1 0 20.8 13Z" />,
  shield: (
    <>
      <path d="M12 2 3 6v6c0 5 9 10 9 10s9-5 9-10V6Z" />
      <path d="m8 12 3 3 5-6" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <circle cx="8" cy="8" r="2" />
      <path d="m3 17 5-5 4 4 4-6 5 7" />
    </>
  ),
};
export default function Icon({ name, size = 20, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={name === "paw" ? "currentColor" : "none"}
      stroke={name === "paw" ? "none" : "currentColor"}
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {paths[name] || paths.paw}
    </svg>
  );
}
