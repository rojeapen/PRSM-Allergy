
import './App.css';

import About from './components/about';
import Contact from './components/contact';
import Events from './components/events';
import Footer from './components/footer';
import LatestFundraiser from './components/latest_fundraiser';
import Gallery from './components/gallery';
import Header from './components/header';
import Hero from './components/hero';
import Newsletter from './components/newsletter';
import { useState, useEffect } from 'react';
import { getPRSM } from './api/db';
import type { PRSM } from './constants';

function App() {
  const [prsm, setPrsm] = useState<PRSM | null>(null);

  useEffect(() => {
    getPRSM().then(data => setPrsm(data));
  }, []);

  return (
    prsm ?
      <>

        <Header />
        <Hero prsm={prsm} />
        <Gallery prsm={prsm} />
        <About prsm={prsm} />
        {prsm.fundraisers.find((f) => f.isFeatured) ? <LatestFundraiser featuredFundraiser={prsm.fundraisers.find((f) => f.isFeatured)!} /> : null}
        <Events />
        <Newsletter />
        <Contact />
        <Footer prsm={prsm} />
      </> : <>
        <div className='loader-container'><div className='loader'></div></div>
      </>
  );
}

export default App;
