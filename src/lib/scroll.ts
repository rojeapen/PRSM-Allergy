/** Smooth-scroll to an in-page section, accounting for the sticky header. */
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const header = document.querySelector(".header") as HTMLElement | null;
  const offset = (header?.offsetHeight ?? 0) + 12;
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
}
