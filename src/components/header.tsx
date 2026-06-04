import { useRef, useState, useCallback, useEffect } from "react";
import './header.css'
import Logo from '../assets/favicon.svg'
import { ORIGIN } from "../constants";
import { scrollToId } from "../lib/scroll";
import { logout } from "../api/auth";

type HeaderProps = {
    isFundraiserPage?: boolean;
    isEventPage?: boolean;
    isArticlePage?: boolean;
    isDashboardPage?: boolean;
    isDashboardFundraisersPage?: boolean;
    isDashboardEventsPage?: boolean;
    isDashboardTeamPage?: boolean;
    isDashboardArticlesPage?: boolean;
    isTeamPage?: boolean;
}

type MenuItem = {
    label: string;
    key: string;
    onClick: () => void;
    section?: string;
};

// Landing nav, in display order. `section` items are in-page anchors that
// drive scrollspy and are filtered to whichever sections actually rendered;
// `href` items (e.g. Articles) navigate to a separate page.
const LANDING_NAV: { key: string; label: string; section?: string; href?: string }[] = [
    { key: 'about', label: 'About', section: 'about' },
    { key: 'events', label: 'Events', section: 'events' },
    { key: 'articles', label: 'Articles', href: 'Articles/' },
    { key: 'contact', label: 'Contact', section: 'contact' },
];

function Header({ isFundraiserPage = false, isEventPage = false, isArticlePage = false, isDashboardPage = false, isDashboardEventsPage = false, isDashboardFundraisersPage = false, isDashboardTeamPage = false, isDashboardArticlesPage = false, isTeamPage = false }: HeaderProps) {

    const headerRef = useRef<HTMLElement>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState<string>('');
    const [landingNav, setLandingNav] = useState(LANDING_NAV);

    const isDashboard = isDashboardPage || isDashboardEventsPage || isDashboardFundraisersPage || isDashboardTeamPage || isDashboardArticlesPage;
    const isLanding = !isDashboard && !isFundraiserPage && !isEventPage && !isTeamPage && !isArticlePage;
    const showDonate = !isDashboard;
    const solid = !isLanding || scrolled || menuOpen;

    const goHome = () => {
        window.location.href = isDashboard ? ORIGIN + "Dashboard/" : ORIGIN;
    };
    const goDonate = () => { window.location.href = ORIGIN + "Fundraisers/"; setMenuOpen(false); };

    // --- Scroll state (rAF-throttled): transparent over hero, solid after ---
    useEffect(() => {
        let raf = 0;
        const onScroll = () => {
            if (raf) return;
            raf = requestAnimationFrame(() => {
                setScrolled(window.scrollY > 24);
                raf = 0;
            });
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', onScroll);
            if (raf) cancelAnimationFrame(raf);
        };
    }, []);

    // --- Landing: drop in-page nav items whose section didn't render ---
    useEffect(() => {
        if (!isLanding) return;
        setLandingNav(LANDING_NAV.filter((s) => !s.section || document.getElementById(s.section)));
    }, [isLanding]);

    // --- Scrollspy: highlight the section most in view (landing only) ---
    useEffect(() => {
        const sectionItems = landingNav.filter((s) => s.section);
        if (!isLanding || sectionItems.length === 0 || typeof IntersectionObserver === 'undefined') return;
        const els = sectionItems
            .map((s) => document.getElementById(s.section!))
            .filter((el): el is HTMLElement => !!el);
        if (els.length === 0) return;

        const ratios = new Map<string, number>();
        const headerH = headerRef.current?.offsetHeight ?? 80;
        const io = new IntersectionObserver(
            (entries) => {
                for (const e of entries) {
                    ratios.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0);
                }
                let best = '';
                let bestRatio = 0;
                for (const [id, r] of ratios) {
                    if (r > bestRatio) { bestRatio = r; best = id; }
                }
                setActiveSection(bestRatio > 0 ? best : '');
            },
            { rootMargin: `-${headerH + 8}px 0px -55% 0px`, threshold: [0, 0.2, 0.5, 0.9] },
        );
        els.forEach((el) => io.observe(el));
        return () => io.disconnect();
    }, [isLanding, landingNav]);

    // --- Mobile menu: Esc to close + click outside ---
    useEffect(() => {
        if (!menuOpen) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
        const onClick = (e: MouseEvent) => {
            if (headerRef.current && !headerRef.current.contains(e.target as Node)) setMenuOpen(false);
        };
        document.addEventListener('keydown', onKey);
        document.addEventListener('pointerdown', onClick);
        return () => {
            document.removeEventListener('keydown', onKey);
            document.removeEventListener('pointerdown', onClick);
        };
    }, [menuOpen]);

    // Non-landing / dashboard variants keep their existing page-to-page nav.
    const getPageMenuItems = useCallback((): MenuItem[] => {
        if (isDashboardPage) {
            return [
                { label: 'About Us', key: 'team', onClick: () => window.location.href = ORIGIN + "Dashboard/Team/" },

                { label: 'Fundraising', key: 'fundraising', onClick: () => window.location.href = ORIGIN + "Dashboard/Fundraisers/" },
                { label: 'Events', key: 'events', onClick: () => window.location.href = ORIGIN + "Dashboard/Events/" },
                { label: 'Articles', key: 'articles', onClick: () => window.location.href = ORIGIN + "Dashboard/Articles/" },
                { label: 'Home', key: 'home', onClick: () => window.location.href = ORIGIN },
                { label: 'Log Out', key: 'logout', onClick: () => logout() },
            ];
        } else if (isDashboardFundraisersPage) {
            return [
                { label: 'Dashboard', key: 'dashboard', onClick: () => window.location.href = ORIGIN + "Dashboard/" },
                { label: 'Events', key: 'events', onClick: () => window.location.href = ORIGIN + "Dashboard/Events/" },
                { label: 'About Us', key: 'team', onClick: () => window.location.href = ORIGIN + "Dashboard/Team/" },
                { label: 'Articles', key: 'articles', onClick: () => window.location.href = ORIGIN + "Dashboard/Articles/" },
                { label: 'Home', key: 'home', onClick: () => window.location.href = ORIGIN },
                { label: 'Log Out', key: 'logout', onClick: () => logout() },
            ];
        } else if (isDashboardEventsPage) {
            return [
                { label: 'Dashboard', key: 'dashboard', onClick: () => window.location.href = ORIGIN + "Dashboard/" },
                { label: 'Fundraising', key: 'fundraising', onClick: () => window.location.href = ORIGIN + "Dashboard/Fundraisers/" },
                { label: 'About Us', key: 'team', onClick: () => window.location.href = ORIGIN + "Dashboard/Team/" },
                { label: 'Articles', key: 'articles', onClick: () => window.location.href = ORIGIN + "Dashboard/Articles/" },
                { label: 'Home', key: 'home', onClick: () => window.location.href = ORIGIN },
                { label: 'Log Out', key: 'logout', onClick: () => logout() },
            ];
        } else if (isDashboardTeamPage) {
            return [
                { label: 'Dashboard', key: 'dashboard', onClick: () => window.location.href = ORIGIN + "Dashboard/" },
                { label: 'Fundraising', key: 'fundraising', onClick: () => window.location.href = ORIGIN + "Dashboard/Fundraisers/" },
                { label: 'Events', key: 'events', onClick: () => window.location.href = ORIGIN + "Dashboard/Events/" },
                { label: 'Articles', key: 'articles', onClick: () => window.location.href = ORIGIN + "Dashboard/Articles/" },
                { label: 'Home', key: 'home', onClick: () => window.location.href = ORIGIN },
                { label: 'Log Out', key: 'logout', onClick: () => logout() },
            ];
        } else if (isDashboardArticlesPage) {
            return [
                { label: 'Dashboard', key: 'dashboard', onClick: () => window.location.href = ORIGIN + "Dashboard/" },
                { label: 'Fundraising', key: 'fundraising', onClick: () => window.location.href = ORIGIN + "Dashboard/Fundraisers/" },
                { label: 'Events', key: 'events', onClick: () => window.location.href = ORIGIN + "Dashboard/Events/" },
                { label: 'About Us', key: 'team', onClick: () => window.location.href = ORIGIN + "Dashboard/Team/" },
                { label: 'Home', key: 'home', onClick: () => window.location.href = ORIGIN },
                { label: 'Log Out', key: 'logout', onClick: () => logout() },
            ];
        } else if (isFundraiserPage) {
            return [
                { label: 'Events', key: 'events', onClick: () => window.location.href = ORIGIN + "Events/" },
                { label: 'About Us', key: 'team', onClick: () => window.location.href = ORIGIN + "Team/" },
                { label: 'Articles', key: 'articles', onClick: () => window.location.href = ORIGIN + "Articles/" },
                { label: 'Home', key: 'home', onClick: () => window.location.href = ORIGIN },
            ];
        } else if (isEventPage) {
            return [
                { label: 'Fundraisers', key: 'fundraisers', onClick: () => window.location.href = ORIGIN + "Fundraisers/" },
                { label: 'About Us', key: 'team', onClick: () => window.location.href = ORIGIN + "Team/" },
                { label: 'Articles', key: 'articles', onClick: () => window.location.href = ORIGIN + "Articles/" },
                { label: 'Home', key: 'home', onClick: () => window.location.href = ORIGIN },
            ];
        } else if (isTeamPage) {
            return [
                { label: 'Fundraisers', key: 'fundraisers', onClick: () => window.location.href = ORIGIN + "Fundraisers/" },
                { label: 'Events', key: 'events', onClick: () => window.location.href = ORIGIN + "Events/" },
                { label: 'Articles', key: 'articles', onClick: () => window.location.href = ORIGIN + "Articles/" },
                { label: 'Home', key: 'home', onClick: () => window.location.href = ORIGIN },
            ];
        } else if (isArticlePage) {
            return [
                { label: 'Fundraisers', key: 'fundraisers', onClick: () => window.location.href = ORIGIN + "Fundraisers/" },
                { label: 'Events', key: 'events', onClick: () => window.location.href = ORIGIN + "Events/" },
                { label: 'About Us', key: 'team', onClick: () => window.location.href = ORIGIN + "Team/" },
                { label: 'Home', key: 'home', onClick: () => window.location.href = ORIGIN },
            ];
        }
        return [];
    }, [isDashboardPage, isFundraiserPage, isEventPage, isDashboardEventsPage, isDashboardFundraisersPage, isDashboardTeamPage, isDashboardArticlesPage, isTeamPage, isArticlePage]);

    let menuItems: MenuItem[];
    if (isLanding) {
        menuItems = landingNav.map((s) => ({
            key: s.key,
            label: s.label,
            section: s.section,
            onClick: s.section
                ? () => { scrollToId(s.section!); setMenuOpen(false); }
                : () => { window.location.href = ORIGIN + s.href!; setMenuOpen(false); },
        }));
        if (typeof localStorage !== 'undefined' && localStorage.getItem("isAdmin") === "true") {
            menuItems.push({ label: 'Dashboard', key: 'dashboard', onClick: () => { window.location.href = ORIGIN + "Dashboard/"; } });
        }
    } else {
        menuItems = getPageMenuItems();
    }

    return (
        <>
            <header
                ref={headerRef}
                className={`header${solid ? ' is-solid' : ' is-transparent'}`}
                id="myHeader"
            >
                <button className="header-brand" onClick={goHome} aria-label="PRSM Allergy Foundation, home">
                    <img src={Logo} alt="" className="header-logo" />
                    <span className="header-text">
                        <span className="header-title">
                            PRSM Allergy Foundation{isDashboard ? " Dashboard" : ""}
                        </span>
                        <span className="header-subtitle">Accelerating progress in allergy and immune health</span>
                    </span>
                </button>

                <nav className="header-nav" aria-label="Primary">
                    {menuItems.map(item => (
                        <button
                            className="btn-ghost"
                            key={item.key}
                            onClick={item.onClick}
                            aria-current={item.section && activeSection === item.section ? 'page' : undefined}
                        >
                            {item.label}
                        </button>
                    ))}
                    {showDonate && (
                        <button className="btn-primary header-donate" onClick={goDonate}>
                            Donate
                            <span className="btn-arrow" aria-hidden="true">→</span>
                        </button>
                    )}
                </nav>

                <button
                    className={`hamburger ${menuOpen ? 'active' : ''}`}
                    onClick={() => setMenuOpen((o) => !o)}
                    aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
                    aria-expanded={menuOpen}
                    aria-controls="mobile-menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                {menuOpen && (
                    <nav className="mobile-menu" id="mobile-menu" aria-label="Primary">
                        {menuItems.map((item, i) => (
                            <button
                                className="mobile-menu-item"
                                key={item.key}
                                onClick={item.onClick}
                                aria-current={item.section && activeSection === item.section ? 'page' : undefined}
                                style={{ '--i': i } as React.CSSProperties}
                            >
                                {item.label}
                            </button>
                        ))}
                        {showDonate && (
                            <button className="btn-primary mobile-donate" onClick={goDonate}>
                                Donate now
                                <span className="btn-arrow" aria-hidden="true">→</span>
                            </button>
                        )}
                    </nav>
                )}
            </header>
        </>
    )
}

export default Header
