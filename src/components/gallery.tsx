import { useState, useEffect } from 'react';
import './gallery.css';

import LeftArrow from '../assets/chevron.left.png';
import RightArrow from '../assets/chevron.right.png';
import type { PRSM } from '../constants';



const Gallery = ({ prsm }: { prsm: PRSM }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const images = prsm.galleryPhotos.map(photo => photo.url);
    const thumbs = [...images];

    const prevImage = () => {
        setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const nextImage = () => {
        setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    // Auto-rotate images every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
        }, 5000);

        return () => clearInterval(interval);
    }, [images.length]);

    return (
        <section id="gallery" className="wrap section gallery-section">
            <div className='section-title'>
                <h3>Gallery</h3>
                <p>Highlights from our recent events and community programs.</p>
            </div>

            <div className="gallery">
                <div className="gallery-stage" aria-live="polite">
                    <button className="gallery-nav left" aria-label="Previous image" onClick={prevImage}>

                        <img src={LeftArrow}></img>

                    </button>
                    <div className="gallery-track" style={{ width: '100%', height: '100%', position: 'relative' }}>
                        {images.map((src, idx) => (
                            <img
                                key={idx}
                                src={src}
                                alt={`Gallery photo ${idx + 1}`}
                                className={`gallery-img${idx === activeIndex ? ' active' : ''}`}
                                data-index={idx}
                                tabIndex={idx === activeIndex ? 0 : -1}
                                aria-hidden={idx !== activeIndex}
                                style={{
                                    position: 'absolute',
                                    left: 0,
                                    top: 0,
                                    width: '100%',
                                    height: '100%',
                                    opacity: idx === activeIndex ? 1 : 0,
                                    zIndex: idx === activeIndex ? 2 : 1,
                                    transition: 'opacity 0.5s',
                                    pointerEvents: idx === activeIndex ? 'auto' : 'none',
                                }}
                            />
                        ))}
                    </div>
                    <button className="gallery-nav right" aria-label="Next image" onClick={nextImage}>

                        <img src={RightArrow}></img>

                    </button>
                </div>
                <div className="gallery-thumbs" role="tablist" aria-label="Gallery thumbnails">
                    {thumbs.map((src, idx) => (
                        <button
                            className="thumb"
                            key={idx}
                            data-index={idx}
                            aria-label={`Open image ${idx + 1}`}
                            aria-pressed={activeIndex === idx}
                            onClick={() => setActiveIndex(idx)}
                        >
                            <img src={src} alt={`Thumb ${idx + 1}`} />
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Gallery;
