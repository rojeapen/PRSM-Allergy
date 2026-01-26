import type { Fundraiser } from '../constants';
import './latest_fundraiser.css';

function LatestFundraiser({ featuredFundraiser }: { featuredFundraiser: Fundraiser }) {


    return (
        <section id="latest-fundraiser" className="latest-fundraiser">
            <div className="latest-fundraiser-container">
                <div className="fundraiser-image">
                    <img src={featuredFundraiser.photo.url} alt="Latest fundraiser team photo" />

                </div>

                <div className="fundraiser-content">
                    <p className="fundraiser-label">FEATURED FUNDRAISER:</p>
                    <h3>{featuredFundraiser.name}</h3>
                    <p className="fundraiser-description">
                        {featuredFundraiser.description}
                    </p>
                    <button className="btn-secondary" onClick={() => window.open(featuredFundraiser.link, "_blank")}>Donate Now</button>
                    <button className="btn-secondary" onClick={() => window.location.href = "Fundraisers/"}>View more fundraisers</button>
                </div>
            </div>
        </section>
    );
}

export default LatestFundraiser;
