import './footer.css';

function Footer() {
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
                            <a href="#" aria-label="Follow us on Twitter">Twitter</a>
                            <a href="#" aria-label="Follow us on Facebook">Facebook</a>
                            <a href="#" aria-label="Follow us on Instagram">Instagram</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
