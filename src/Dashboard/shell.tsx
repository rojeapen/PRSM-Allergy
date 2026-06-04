/* =====================================================================
   Dashboard shell — shared React primitives for every admin page.
   Pairs with dashboard-shell.css. Pages compose these with their own
   page-specific content and CSS.
   ===================================================================== */
import { useEffect, useRef, useState, type ReactNode } from "react";
import "./dashboard-shell.css";

export type Section = { id: string; label: string };

export function CheckIcon() {
  return (
    <svg
      className="check-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/* Scrollspy + smooth jumps for the section rail. `ready` gates observation
   until the panels have actually mounted (i.e. data loaded). */
export function useDashboardRail(sections: readonly Section[], ready: boolean) {
  const [activeSection, setActiveSection] = useState<string>(
    sections[0]?.id ?? "",
  );

  useEffect(() => {
    if (!ready) return;
    const els = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => !!el);
    if (els.length === 0 || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveSection(visible[0].target.id);
      },
      { rootMargin: "-90px 0px -60% 0px", threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ready, sections]);

  const goToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    setActiveSection(id);
  };

  return { activeSection, goToSection };
}

export function SectionRail({
  sections,
  activeSection,
  goToSection,
  title = "On this page",
}: {
  sections: readonly Section[];
  activeSection: string;
  goToSection: (id: string) => void;
  title?: string;
}) {
  return (
    <aside className="dash-rail" aria-label="Dashboard sections">
      <p className="dash-rail-title">{title}</p>
      <nav className="dash-rail-list">
        {sections.map((s) => (
          <button
            key={s.id}
            className="rail-link"
            aria-current={activeSection === s.id ? "true" : undefined}
            onClick={() => goToSection(s.id)}
          >
            {s.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

export function Panel({
  id,
  title,
  desc,
  action,
  children,
}: {
  id: string;
  title: string;
  desc?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="panel" id={id} aria-labelledby={`${id}-h`}>
      <div className="panel-head">
        <div className="panel-head-text">
          <h2 id={`${id}-h`}>{title}</h2>
          {desc && <p>{desc}</p>}
        </div>
        {action && <div className="panel-head-action">{action}</div>}
      </div>
      <div className="panel-body">{children}</div>
    </section>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="field-group">
      <label className="form-label" htmlFor={htmlFor}>
        {label}
        {hint && <span className="form-hint"> · {hint}</span>}
      </label>
      {children}
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="empty">{children}</div>;
}

/* Always-mounted save button: disabled until dirty, swaps to a spinner while
   saving and flashes "Saved" when a save resolves. Never unmounts, so the
   panel header never shifts. */
export function SaveButton({
  dirty,
  loading,
  onClick,
  label = "Save changes",
}: {
  dirty: boolean;
  loading: boolean;
  onClick: () => void;
  label?: string;
}) {
  const [justSaved, setJustSaved] = useState(false);
  const prevLoading = useRef(loading);

  useEffect(() => {
    if (prevLoading.current && !loading) {
      setJustSaved(true);
      const t = setTimeout(() => setJustSaved(false), 1800);
      prevLoading.current = loading;
      return () => clearTimeout(t);
    }
    prevLoading.current = loading;
  }, [loading]);

  if (loading) {
    return (
      <button className="btn-primary save-btn" disabled>
        <span className="spinner-sm" aria-hidden="true" />
        Saving…
      </button>
    );
  }
  if (justSaved && !dirty) {
    return (
      <button className="btn-primary save-btn is-saved" disabled>
        <CheckIcon />
        Saved
      </button>
    );
  }
  return (
    <button className="btn-primary save-btn" onClick={onClick} disabled={!dirty}>
      {label}
    </button>
  );
}

export function DashboardSkeleton({
  sections,
  panels = 2,
  rail = true,
}: {
  sections: readonly Section[];
  panels?: number;
  rail?: boolean;
}) {
  return (
    <>
      {rail && (
        <aside className="dash-rail" aria-hidden="true">
          <div className="skel-rail">
            {sections.map((s) => (
              <div key={s.id} className="skeleton" style={{ width: "70%" }} />
            ))}
          </div>
        </aside>
      )}
      <div className="dash-main" aria-busy="true" aria-label="Loading dashboard">
        {Array.from({ length: panels }).map((_, i) => (
          <div className="skel-panel" key={i}>
            <div className="skeleton skel-h" />
            <div className="skeleton skel-line" style={{ width: "85%" }} />
            <div className="skeleton skel-block" />
          </div>
        ))}
      </div>
    </>
  );
}
