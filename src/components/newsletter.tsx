import { useState } from "react";
import "./newsletter.css";
import Reveal from "./reveal";
import { subscribeNewsletter } from "../api/db";
import { DEFAULT_COPY } from "../constants";

function Newsletter({
  kicker,
  title,
  subtitle,
}: {
  kicker?: string;
  title?: string;
  subtitle?: string;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      await subscribeNewsletter(email);
      setStatus("success");
      setEmail("");
      setTimeout(() => setStatus("idle"), 4000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  return (
    <section id="newsletter" className="newsletter section">
      <div className="cartographic newsletter-grid-bg" aria-hidden="true" />
      <Reveal className="shell newsletter-shell">
        <p className="kicker newsletter-kicker">
          {kicker || DEFAULT_COPY.newsletterKicker}
        </p>
        <h2 className="newsletter-title">
          {title || DEFAULT_COPY.newsletterTitle}
        </h2>
        <p className="newsletter-copy">
          {subtitle || DEFAULT_COPY.newsletterSubtitle}
        </p>

        <form className="newsletter-form" onSubmit={handleSubmit}>
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="newsletter-input"
            disabled={status === "loading"}
            autoComplete="email"
          />
          <button
            type="submit"
            className="btn-on-dark"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Subscribing…" : "Subscribe"}
          </button>
        </form>

        <p className="newsletter-status" role="status" aria-live="polite">
          {status === "success" && (
            <span className="is-success">Thank you for subscribing.</span>
          )}
          {status === "error" && (
            <span className="is-error">
              Something went wrong. Please try again.
            </span>
          )}
        </p>
      </Reveal>
    </section>
  );
}

export default Newsletter;
