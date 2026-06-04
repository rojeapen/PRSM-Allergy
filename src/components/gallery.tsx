import { useState, useEffect, useRef, useCallback } from "react";
import "./gallery.css";
import Reveal from "./reveal";
import { DEFAULT_COPY, type PRSM } from "../constants";

const Chevron = ({ dir }: { dir: "left" | "right" }) => (
  <svg
    viewBox="0 0 24 24"
    width="22"
    height="22"
    fill="none"
    aria-hidden="true"
  >
    <path
      d={dir === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"}
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Gallery = ({ prsm }: { prsm: PRSM }) => {
  const images = prsm.galleryPhotos.map((photo) => photo.url);
  const [activeIndex, setActiveIndex] = useState(0);
  // only load images once they've been shown (defers heavy off-screen photos)
  const [seen, setSeen] = useState<Set<number>>(() => new Set([0]));
  const [reduced] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const activeRef = useRef(0);

  const goTo = useCallback((i: number) => {
    activeRef.current = i;
    setActiveIndex(i);
    setSeen((prev) => (prev.has(i) ? prev : new Set(prev).add(i)));
  }, []);

  const prevImage = () =>
    goTo((activeIndex - 1 + images.length) % images.length);
  const nextImage = () => goTo((activeIndex + 1) % images.length);

  // Auto-rotate, paused under reduced-motion or when only one image
  useEffect(() => {
    if (reduced || images.length <= 1) return;
    const interval = setInterval(
      () => goTo((activeRef.current + 1) % images.length),
      5500,
    );
    return () => clearInterval(interval);
  }, [images.length, reduced, goTo]);

  return (
    <section id="gallery" className="gallery-section section">
      <div className="shell">
        <Reveal className="gallery-head">
          <p className="kicker">{prsm.galleryKicker || DEFAULT_COPY.galleryKicker}</p>
          <h2 className="gallery-title">
            {prsm.galleryTitle || DEFAULT_COPY.galleryTitle}
          </h2>
          <p className="lede">
            {prsm.gallerySubtitle || DEFAULT_COPY.gallerySubtitle}
          </p>
        </Reveal>

        <Reveal className="gallery" delay={80}>
          <div
            className="gallery-stage"
            aria-live="polite"
            aria-roledescription="carousel"
          >
            <div className="gallery-track">
              {images.map((src, idx) => (
                <div
                  key={idx}
                  className={`gallery-slide${idx === activeIndex ? " active" : ""}`}
                  aria-hidden={idx !== activeIndex}
                >
                  {seen.has(idx) && (
                    <img
                      src={src}
                      alt={`PRSM community photo ${idx + 1} of ${images.length}`}
                      loading={idx === 0 ? "eager" : "lazy"}
                      decoding="async"
                    />
                  )}
                </div>
              ))}

              <span className="gallery-counter" aria-hidden="true">
                {String(activeIndex + 1).padStart(2, "0")} /{" "}
                {String(images.length).padStart(2, "0")}
              </span>

              {images.length > 1 && (
                <>
                  <button
                    className="gallery-nav left"
                    aria-label="Previous photo"
                    onClick={prevImage}
                  >
                    <Chevron dir="left" />
                  </button>
                  <button
                    className="gallery-nav right"
                    aria-label="Next photo"
                    onClick={nextImage}
                  >
                    <Chevron dir="right" />
                  </button>
                </>
              )}
            </div>
          </div>

          {images.length > 1 && (
            <div
              className="gallery-dots"
              role="tablist"
              aria-label="Choose a photo"
            >
              {images.map((_, idx) => (
                <button
                  className={`gallery-dot${activeIndex === idx ? " active" : ""}`}
                  key={idx}
                  role="tab"
                  aria-label={`Photo ${idx + 1}`}
                  aria-selected={activeIndex === idx}
                  onClick={() => goTo(idx)}
                />
              ))}
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
};

export default Gallery;
