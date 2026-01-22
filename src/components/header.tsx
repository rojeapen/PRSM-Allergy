import { useRef, useState } from "react";
import './header.css'
import Logo from '../assets/favicon.svg'

type HeaderProps = {
    isFundraiserPage?: boolean;
}

function Header({ isFundraiserPage = false }: HeaderProps) {


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
                    <h3 className="header-subtitle">Fundraising and promoting awareness for allergic & immunologic diseases</h3>
                </div>

                <nav className="header-nav">
                    {!isFundraiserPage ? <><label className="header-btn" onClick={() => {
                        //Scroll to about section
                        const aboutSection = document.getElementById('about');
                        if (aboutSection) {
                            //take into account fixed header height
                            const headerOffset = headerRef.current ? headerRef.current.offsetHeight : 0;
                            const elementPosition = aboutSection.getBoundingClientRect().top;
                            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                            window.scrollTo({
                                top: offsetPosition,
                                behavior: 'smooth'
                            });
                        }
                    }}>About</label>
                        <label className="header-btn" onClick={() => window.location.href = "/fundraisers/"}>Fundraising</label>
                        <label className="header-btn" onClick={() => {
                            //Scroll to about section
                            const eventsSection = document.getElementById('events');
                            if (eventsSection) {
                                //take into account fixed header height
                                const headerOffset = headerRef.current ? headerRef.current.offsetHeight : 0;
                                const elementPosition = eventsSection.getBoundingClientRect().top;
                                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                                window.scrollTo({
                                    top: offsetPosition,
                                    behavior: 'smooth'
                                });
                            }
                        }}>Events</label>
                        <label className="header-btn" onClick={() => {
                            //Scroll to about section
                            const contactSection = document.getElementById('contact');
                            if (contactSection) {
                                //take into account fixed header height
                                const headerOffset = headerRef.current ? headerRef.current.offsetHeight : 0;
                                const elementPosition = contactSection.getBoundingClientRect().top;
                                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                                window.scrollTo({
                                    top: offsetPosition,
                                    behavior: 'smooth'
                                });
                            }
                        }}>Contact</label> </> : <><label className="header-btn" onClick={() => {
                            //Scroll to about section
                            window.location.href = "/";
                        }}>Home</label></>}
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