import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  /** stagger delay in ms */
  delay?: number;
  className?: string;
  id?: string;
};

/**
 * Fades + lifts its children into view once, on scroll.
 * Motion lives in CSS ([data-reveal]); reduced-motion is handled there too,
 * so this only toggles the `is-in` class via IntersectionObserver.
 */
function Reveal({ children, as, delay = 0, className = "", id }: RevealProps) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || shown) return;

    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    io.observe(node);
    return () => io.disconnect();
  }, [shown]);

  return (
    <Tag
      ref={ref}
      id={id}
      data-reveal
      className={`${shown ? "is-in " : ""}${className}`.trim()}
      style={delay ? ({ "--reveal-delay": `${delay}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}

export default Reveal;
