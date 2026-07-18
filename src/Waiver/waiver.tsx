import "./waiver.css";

import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "../index.css";

import Footer from "../components/footer";
import { PRSM } from "../constants";
import { getPRSM } from "../api/db";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Terms />
  </StrictMode>,
);

// Fallback for when no waiver has been uploaded through the dashboard yet.
const DEFAULT_PDF_URL = "/waiver.pdf";
const PDF_TITLE = "2026 PRSM Pickleball Tournament Waiver";

function Terms() {
  const [prsm, setPrsm] = useState<PRSM | null>(null);

  useEffect(() => {
    getPRSM().then((data) => setPrsm(data));
  }, []);

  if (!prsm) {
    return (
      <div className="loader-container" role="status" aria-label="Loading">
        <div className="loader"></div>
      </div>
    );
  }

  const PDF_URL = prsm.waiverDoc?.url || DEFAULT_PDF_URL;

  return (
    <>
      <main className="terms-page">
        <br></br>
        <section className="terms-doc section" aria-label={PDF_TITLE}>
          <div className="shell terms-doc-shell">
            <object
              className="terms-frame"
              data={PDF_URL}
              type="application/pdf"
              aria-label={PDF_TITLE}
            >
              {/* Fallback for browsers that can't embed PDFs inline. */}
              <div className="terms-fallback">
                <p>This browser can't display the PDF inline</p>
                <a
                  className="btn-primary"
                  href={PDF_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open the document
                  <span className="btn-arrow" aria-hidden="true">
                    →
                  </span>
                </a>
              </div>
            </object>
          </div>
        </section>
      </main>
      <Footer prsm={prsm} />
    </>
  );
}

export default Terms;
