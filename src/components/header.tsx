import { useRef, useState, useCallback } from "react";
import './header.css'
import Logo from '../assets/favicon.svg'
import { ORIGIN } from "../constants";
import { logout } from "../api/auth";

type HeaderProps = {
    isFundraiserPage?: boolean;
    isEventPage?: boolean;
    isDashboardPage?: boolean;
}

function Header({ isFundraiserPage = false, isEventPage = false, isDashboardPage = false }: HeaderProps) {


    const headerRef = useRef<HTMLDivElement>(null);
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const closeMenu = () => {
        setMenuOpen(false);
    };

    // Menu items type
    type MenuItem = {
        label: string;
        onClick: () => void;
        key: string;
    };

    // Helper function to compute menu items based on current props/state
    const getMenuItems = useCallback((): MenuItem[] => {
        let items: MenuItem[] = [];
        if (isDashboardPage) {
            items = [
                { label: 'Team', key: 'team', onClick: () => window.location.href = ORIGIN + "Dashboard/Team/" },
                { label: 'Newsletter', key: 'newsletter', onClick: () => window.location.href = ORIGIN + "Dashboard/Newsletter/" },
                { label: 'Fundraising', key: 'fundraising', onClick: () => window.location.href = ORIGIN + "Dashboard/Fundraisers/" },
                { label: 'Events', key: 'events', onClick: () => window.location.href = ORIGIN + "Dashboard/Events/" },
                { label: 'Home', key: 'home', onClick: () => window.location.href = ORIGIN },
                { label: 'Log Out', key: 'logout', onClick: () => logout() },
            ];
        } else if (isFundraiserPage) {
            items = [
                { label: 'Events', key: 'events', onClick: () => window.location.href = ORIGIN + "Events/" },
                { label: 'Home', key: 'home', onClick: () => window.location.href = ORIGIN },
            ];
        } else if (isEventPage) {
            items = [
                { label: 'Fundraisers', key: 'fundraisers', onClick: () => window.location.href = ORIGIN + "Fundraisers/" },
                { label: 'Home', key: 'home', onClick: () => window.location.href = ORIGIN },
            ];
        } else {
            items = [
                {
                    label: 'About',
                    key: 'about',
                    onClick: () => {
                        const aboutSection = document.getElementById('about');
                        if (aboutSection) {
                            const headerElement = document.querySelector('.header') as HTMLElement;
                            const headerOffset = headerElement?.offsetHeight ?? 0;
                            const elementPosition = aboutSection.getBoundingClientRect().top;
                            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                        }
                        setMenuOpen(false);
                    }
                },
                {
                    label: 'Fundraising',
                    key: 'fundraising',
                    onClick: () => { window.location.href = ORIGIN + "Fundraisers/"; setMenuOpen(false); }
                },
                {
                    label: 'Events',
                    key: 'events',
                    onClick: () => { window.location.href = ORIGIN + "Events/"; setMenuOpen(false); }
                },
                {
                    label: 'Contact',
                    key: 'contact',
                    onClick: () => {
                        const contactSection = document.getElementById('contact');
                        if (contactSection) {
                            const headerElement = document.querySelector('.header') as HTMLElement;
                            const headerOffset = headerElement?.offsetHeight ?? 0;
                            const elementPosition = contactSection.getBoundingClientRect().top;
                            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                        }
                        setMenuOpen(false);
                    }
                },
            ];
            const isAdmin = localStorage.getItem("isAdmin");
            if (isAdmin === "true") {
                items.push({ label: 'Dashboard', key: 'dashboard', onClick: () => window.location.href = ORIGIN + "Dashboard/" });
            }
        }
        return items;
    }, [isDashboardPage, isFundraiserPage, isEventPage, menuOpen]);

    const menuItems = getMenuItems();
    return (
        <>
            <div ref={headerRef} className={"header"} id="myHeader">
                <img src={Logo} alt="" className="Logo" />
                <div className="header-text">
                    <h2 className="header-title">PRSM Allergy {isDashboardPage ? "Dashboard" : ""}</h2>
                    <h3 className="header-subtitle">Fundraising and promoting awareness for allergic & immunologic diseases</h3>
                </div>
                <nav className="header-nav">
                    {menuItems.map(item => (
                        <label className="header-btn" key={item.key} onClick={item.onClick}>{item.label}</label>
                    ))}
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
                    {menuItems.map(item => (
                        <label className="mobile-menu-item" key={item.key} onClick={item.onClick}>{item.label}</label>
                    ))}
                </nav>
            )}
        </>
    )
}

export default Header