import './latest_fundraiser.css';

function LatestFundraiser() {
    const amountRaised = 3001;
    const goal = 3000;
    const donors = 7;
    const percentageRaised = Math.min((amountRaised / goal) * 100, 100);

    return (
        <section id="latest-fundraiser" className="latest-fundraiser">
            <div className="latest-fundraiser-container">
                <div className="fundraiser-image">
                    <img src="/src/assets/gallery/gallery1.jpg" alt="Latest fundraiser team photo" />

                </div>

                <div className="fundraiser-content">
                    <p className="fundraiser-label">LATEST FUNDRAISER:</p>
                    <h3>Support Health Equity & Diversity in Research</h3>
                    <p className="fundraiser-description">
                        With Fred Hutchinson Cancer Center, we can create a future where every advancement in cancer care is an advancement for all. Support us in transforming this vision into a reality.
                    </p>
                    <button className="btn-secondary">Donate Now</button>
                    <button className="btn-secondary" onClick={() => window.location.href = "Fundraisers/"}>View more fundraisers</button>
                </div>
            </div>
        </section>
    );
}

export default LatestFundraiser;
