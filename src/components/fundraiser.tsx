import './fundraiser.css';

function Fundraiser() {
    const amountRaised = 3001;
    const goal = 3000;
    const donors = 7;
    const percentageRaised = Math.min((amountRaised / goal) * 100, 100);

    return (
        <section id="latest-fundraiser" className="fundraiser">
            <div className="fundraiser-container">
                <div className="fundraiser-image">
                    <img src="/src/assets/gallery/gallery1.jpg" alt="Latest fundraiser team photo" />
                    <div className="fundraiser-stats">
                        <div className="stat">
                            <span className="stat-value">${amountRaised.toLocaleString()}</span>
                            <span className="stat-label">RAISED</span>
                        </div>
                        <div className="stat">
                            <span className="stat-value">{donors}</span>
                            <span className="stat-label">DONORS</span>
                        </div>
                    </div>
                    <div className="fundraiser-progress">
                        <div className="progress-info">
                            <span>{Math.round(percentageRaised)}% RAISED</span>
                            <span>GOAL: ${goal.toLocaleString()}</span>
                        </div>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${percentageRaised}%` }}></div>
                        </div>
                    </div>
                </div>

                <div className="fundraiser-content">
                    <p className="fundraiser-label">LATEST FUNDRAISER:</p>
                    <h3>Support Health Equity & Diversity in Research</h3>
                    <p className="fundraiser-description">
                        With Fred Hutchinson Cancer Center, we can create a future where every advancement in cancer care is an advancement for all. Support us in transforming this vision into a reality.
                    </p>
                    <button className="btn-secondary">Link to Donate</button>
                    <button className="btn-secondary">View more fundraisers</button>
                </div>
            </div>
        </section>
    );
}

export default Fundraiser;
