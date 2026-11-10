import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";

 
export function useReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false,
  );
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, []);
  return reduced;
}

export function AnimatedNumber({ value }) {
  const reduced = useReducedMotion();
  const [displayed, setDisplayed] = useState(0);
  const previous = useRef(0);
  useEffect(() => {
    if (reduced || typeof window.requestAnimationFrame !== "function") {
      previous.current = value;
      setDisplayed(value);
      return;
    }
    const from = previous.current;
    let frame;
    let started;
    const update = (timestamp) => {
      started ??= timestamp;
      const progress = Math.min((timestamp - started) / 650, 1);
      const next = Math.round(
        from + (value - from) * (1 - (1 - progress) ** 3),
      );
      previous.current = next;
      setDisplayed(next);
      if (progress < 1) frame = window.requestAnimationFrame(update);
    };
    frame = window.requestAnimationFrame(update);
    return () => window.cancelAnimationFrame(frame);
  }, [value, reduced]);
   
  return (
    <span className="paws-number">
      <span className="sr-only">{value}</span>
      <span aria-hidden="true">{displayed}</span>
    </span>
  );
}

export function Reveal({
  as: Tag = "div",
  children,
  className = "",
  delay = 0,
  ...props
}) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    if (reduced || typeof window.IntersectionObserver !== "function") {
      setVisible(true);
      return;
    }
    const element = ref.current;
    setVisible(false);
    const observer = new window.IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [reduced]);
  return (
    <Tag
      {...props}
      ref={ref}
      data-visible={visible}
      className={`paws-reveal ${className}`}
      style={{ ...props.style, "--paws-delay": `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

export function TiltCard({
  as: Tag = "article",
  children,
  className = "",
  style,
  ...props
}) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const reset = () => {
    ref.current?.style.setProperty("--paws-tilt-x", "0deg");
    ref.current?.style.setProperty("--paws-tilt-y", "0deg");
  };
  useEffect(() => {
    if (reduced) reset();
  }, [reduced]);
  function move(event) {
    if (reduced || event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    const x = Math.max(
      -0.5,
      Math.min(0.5, (event.clientX - bounds.left) / bounds.width - 0.5),
    );
    const y = Math.max(
      -0.5,
      Math.min(0.5, (event.clientY - bounds.top) / bounds.height - 0.5),
    );
    ref.current.style.setProperty("--paws-tilt-x", `${(-y * 4).toFixed(2)}deg`);
    ref.current.style.setProperty("--paws-tilt-y", `${(x * 4).toFixed(2)}deg`);
  }
  return (
    <Tag
      {...props}
      ref={ref}
      style={style}
      className={`paws-tilt ${className}`}
      onPointerMove={move}
      onPointerLeave={reset}
      onPointerCancel={reset}
      onBlur={reset}
    >
      {children}
    </Tag>
  );
}

export function Celebration() {
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 1600);
    return () => window.clearTimeout(timer);
  }, []);
  if (reduced || !visible) return null;
  return (
    <div aria-hidden="true" className="paws-celebration">
      {Array.from({ length: 14 }, (_, index) => (
        <span
          key={index}
          className="paws-celebration-piece"
          style={{
            left: `${12 + index * 5.7}%`,
            "--paws-delay": `${(index % 4) * 65}ms`,
            "--paws-drift": `${(index % 2 ? 1 : -1) * (20 + index * 3)}px`,
            "--paws-turn": `${index % 2 ? 80 : -65}deg`,
            color: ["#d9785d", "#b9634a", "#29344f", "#e2a287"][index % 4],
          }}
        >
          <Icon
            name={index % 3 ? "heart" : "paw"}
            size={12 + (index % 3) * 4}
          />
        </span>
      ))}
    </div>
  );
}
