import { ORIGIN, type PRSM } from '../constants';
import './about.css';

function About({ prsm }: { prsm: PRSM }) {
    return (
        <section id="about" className="about">
            <div className="about-container">
                <h3>Who we are</h3>
                <p className="about-lede">{prsm.aboutSubtitle}</p>
                <div className="about-grid">
                    {prsm.aboutTiles.map((tile, index) => (
                        <article key={index} className="about-card">
                            <h4>{tile.title}</h4>
                            <p>{tile.description}</p>
                        </article>
                    ))}

                </div>
                <div className='center'>
                    <button className='btn-secondary' onClick={() => window.location.href = ORIGIN + "Team/"}>Meet the Team</button>

                </div>
            </div>
        </section>
    );
}

export default About;
