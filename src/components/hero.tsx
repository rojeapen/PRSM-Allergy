import "./hero.css";

const Hero = () => {
    return (
        <div className="hero hero-light">
            <div className="hero-content">
                <h1 className="hero-title hero-title-dark">Help fund life-changing allergy research</h1>
                <p className="hero-subtitle hero-subtitle-dark">
                    Allergies affect over 100 million Americans (<a href="https://www.niaid.nih.gov/research/allergy-statistics" target="_blank" rel="noopener noreferrer">NIH</a>). Your gift funds research, patient programs, and equitable access to care.
                </p>
                <div className="hero-buttons">
                    <button className="hero-btn donate">Donate Now</button>
                    <button className="hero-btn learn">Learn More</button>
                </div>
            </div>
            <div className="hero-image hero-image-light">
                {/* Placeholder for illustration, replace with SVG or image as needed */}
                <svg width="350" height="300" viewBox="0 0 350 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ background: '#f6fbfd', borderRadius: '2rem' }}>
                    <circle cx="90" cy="90" r="50" fill="#177899" />
                    <ellipse cx="220" cy="200" rx="80" ry="40" fill="#177899" />
                </svg>
            </div>
        </div>
    );
};

export default Hero;