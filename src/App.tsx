
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

function App() {
  return (
    <>
      <Header />
      <Hero />
      <Gallery />
      <About />
      <LatestFundraiser />
      <Events />
      <Newsletter />
      <Contact />
      <Footer />
    </>
  );
}

export default App;
