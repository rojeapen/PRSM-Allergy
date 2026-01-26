import type { PRSM } from '../constants';
import './footer.css';

function Footer({ prsm }: { prsm: PRSM }) {
    return (
        <footer id="footer" className="footer">
            <div className="footer-container">
                <div className="footer-content">
                    <div className="footer-section">
                        <p className="footer-title">© PRSM Allergy Foundation.</p>
                        <p className="footer-text">
                            PRSM is an unincorporated nonprofit association. 100% of donations go directly to the external allergy research organizations we support.
                        </p>
                    </div>

                    <div className="footer-section">
                        <h4 className="footer-heading">Follow Us</h4>
                        <div className="social-links">
                            {prsm.socialMediaLinks.map((link) => (
                                <a key={link.platform} href={link.url} aria-label={`Follow us on ${link.platform}`}>
                                    {link.platform}
                                </a>
                            ))}

                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
