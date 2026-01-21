import './about.css';

function About() {
    return (
        <section id="about" className="about">
            <div className="about-container">
                <h3>Who we are</h3>
                <p className="about-lede">PRSM is a nonprofit dedicated to supporting cutting-edge allergy research, patient education, and community interventions to reduce the burden of allergic disease.</p>
                <div className="about-grid">
                    <article className="about-card">
                        <h4>Research Grants</h4>
                        <p>We fund early-career investigators and collaborative projects that target prevention and treatment of severe allergies.</p>
                    </article>
                    <article className="about-card">
                        <h4>Community Programs</h4>
                        <p>Programs to improve allergy diagnosis, education in underserved areas, and support networks for families.</p>
                    </article>
                    <article className="about-card">
                        <h4>Advocacy</h4>
                        <p>We work with policymakers and health systems to improve allergy care access and research funding.</p>
                    </article>
                </div>
            </div>
        </section>
    );
}

export default About;
