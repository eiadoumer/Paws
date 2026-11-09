// Decorative paw print. Size and colour come from the className prop.
function PawIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <ellipse cx="6" cy="10" rx="2.2" ry="3" />
      <ellipse cx="10" cy="5.5" rx="2.2" ry="3" />
      <ellipse cx="14" cy="5.5" rx="2.2" ry="3" />
      <ellipse cx="18" cy="10" rx="2.2" ry="3" />
      <path d="M12 10.5c-3.2 0-6 3.4-6 6.3 0 2 1.5 3.2 3.2 3.2 1.2 0 1.9-.6 2.8-.6s1.6.6 2.8.6c1.7 0 3.2-1.2 3.2-3.2 0-2.9-2.8-6.3-6-6.3z" />
    </svg>
  );
}

export default PawIcon;
