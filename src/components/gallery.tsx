import { useState } from 'react';
import './gallery.css';
import Gallery1 from "../assets/gallery/gallery1.jpg"
import Gallery2 from "../assets/gallery/gallery2.jpeg"
import Gallery3 from "../assets/gallery/gallery3.jpg"
import Gallery4 from "../assets/gallery/gallery4.jpeg"
import Gallery5 from "../assets/gallery/gallery5.jpg"
import LeftArrow from '../assets/chevron.left.png';
import RightArrow from '../assets/chevron.right.png';



const Gallery = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const images = [Gallery1, Gallery2, Gallery3, Gallery4, Gallery5];
    const thumbs = [...images];

    const prevImage = () => {
        setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const nextImage = () => {
        setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

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
