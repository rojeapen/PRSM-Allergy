import { useRef, useState } from "react";
import './header.css'
import Logo from '../assets/favicon.svg'



function Header() {


    const headerRef = useRef<HTMLDivElement>(null);
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const closeMenu = () => {
        setMenuOpen(false);
    };

    return (
        <>
            <div ref={headerRef} className={"header"} id="myHeader">

                <img src={Logo} alt="" className="Logo" />
                <div className="header-text">
                    <h2 className="header-title">PRSM Allergy</h2>
                    <h3 className="header-subtitle">Fundraising and promoting awareness for allergy & immunology research and community support</h3>
                </div>

                <nav className="header-nav">
                    <label className="header-btn">About</label>
                    <label className="header-btn">Fundraising</label>
                    <label className="header-btn">Events</label>
                    <label className="header-btn">Contact</label>
                </nav>

                <button
                    className={`hamburger ${menuOpen ? 'active' : ''}`}
                    onClick={toggleMenu}
                    aria-label="Toggle navigation menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>

            {menuOpen && (
                <nav className="mobile-menu">
                    <label className="mobile-menu-item" onClick={closeMenu}>About</label>
                    <label className="mobile-menu-item" onClick={closeMenu}>Fundraising</label>
                    <label className="mobile-menu-item" onClick={closeMenu}>Events</label>
                    <label className="mobile-menu-item" onClick={closeMenu}>Contact</label>
                </nav>
            )}
        </>
    )
}

export default Header