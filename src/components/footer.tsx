import { ORIGIN, DEFAULT_COPY, type PRSM } from "../constants";
import "./footer.css";
import Logo from "../assets/favicon.svg";

function Footer({ prsm }: { prsm: PRSM }) {
  const year = new Date().getFullYear();
  const hasSocial = prsm.socialMediaLinks.length > 0;

  const links = [
    { label: "Fundraisers", href: ORIGIN + "Fundraisers/" },
    { label: "Events", href: ORIGIN + "Events/" },
    { label: "Articles", href: ORIGIN + "Articles/" },
    { label: "About Us", href: ORIGIN + "Team/" },
  ];

  return (
    <footer id="footer" className="footer">
      <div className="shell footer-top">
        <div className="footer-brand">
          <p className="footer-wordmark">
            <img src={Logo} alt="" className="header-logo" />
            PRSM Allergy Foundation
          </p>
          <p className="footer-mission">
            {prsm.footerMission || DEFAULT_COPY.footerMission}
          </p>
        </div>

        <nav className="footer-col" aria-label="Footer">
          <h2 className="footer-heading">Explore</h2>
          {links.map((l) => (
            <a key={l.label} href={l.href} className="footer-link">
              {l.label}
            </a>
          ))}
        </nav>

        {hasSocial && (
          <div className="footer-col">
            <h2 className="footer-heading">Follow us</h2>
            {prsm.socialMediaLinks.map((link) => (
              <a
                key={link.platform}
                href={link.url}
                className="footer-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.platform}
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="shell footer-base">
        <p className="footer-copy">© {year} PRSM Allergy Foundation</p>
        <p className="footer-fine">
          {prsm.footerFine || DEFAULT_COPY.footerFine}
        </p>
      </div>
    </footer>
  );
}

export default Footer;
