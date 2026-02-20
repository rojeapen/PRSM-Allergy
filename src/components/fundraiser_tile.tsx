import { Fundraiser } from '../constants';
import './fundraiser_tile.css';

type FundraiserTileProps = {
    fundraiser: Fundraiser;
    backgroundColor: string;
}

function FundraiserTile({ fundraiser, backgroundColor }: FundraiserTileProps) {

    return (
        <section id="fundraiser-tile" className={`fundraiser-tile ${backgroundColor}`}>
            <div className="fundraiser-tile-container">
                <div className="fundraiser-image">
                    <img src={fundraiser.photo.url} alt={fundraiser.name} />

                </div>

                <div className="fundraiser-content">

                    <h3>{fundraiser.name}</h3>
                    <p className="fundraiser-description">
                        {fundraiser.description}
                    </p>
                    <button className="btn-secondary" onClick={() => window.open(fundraiser.link, "_blank")}>Donate Now</button>
                </div>
            </div>
        </section>
    );
}

export default FundraiserTile;
