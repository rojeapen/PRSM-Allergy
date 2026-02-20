import { PRSM, ORIGIN } from "../constants";
import "./hero.css";

const Hero = ({ prsm }: { prsm: PRSM }) => {
    return (
        <div className="hero hero-light">
            <div className="hero-content">
                <h1 className="hero-title hero-title-dark">{prsm.landingPageTitle}</h1>
                <p className="hero-subtitle hero-subtitle-dark">
                    {prsm.landingPageSubtitle}
                </p>
                <div className="hero-buttons">
                    <button className="hero-btn donate" onClick={() => {
                        window.location.href = ORIGIN + "Fundraisers/";
                    }}>Donate Now</button>
                    <button className="hero-btn learn" onClick={() => {
                        const aboutSection = document.getElementById('about');
                        if (aboutSection) {
                            const headerElement = document.querySelector('.header') as HTMLElement;
                            const headerOffset = headerElement?.offsetHeight ?? 0;
                            const elementPosition = aboutSection.getBoundingClientRect().top;
                            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                        }
                    }}>Learn More</button>
                </div>
            </div>
            <div className="hero-image hero-image-light">
                {/* Placeholder for illustration, replace with SVG or image as needed */}
                <img src={prsm.landingPagePhoto.url} alt="Hero Illustration" />
            </div>
        </div>
    );
};

export default Hero;