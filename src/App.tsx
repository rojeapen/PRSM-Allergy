import "./App.css";

import About from "./components/about";
import Contact from "./components/contact";
import Events from "./components/events";
import Footer from "./components/footer";
import LatestFundraiser from "./components/latest_fundraiser";
import Gallery from "./components/gallery";
import Header from "./components/header";
import Hero from "./components/hero";
import Newsletter from "./components/newsletter";
import SponsorStrip from "./components/sponsors";
import { useState, useEffect } from "react";
import { getPRSM } from "./api/db";
import type { PRSM, Event } from "./constants";

function App() {
  const [prsm, setPrsm] = useState<PRSM | null>(null);

  useEffect(() => {
    getPRSM().then((data) => setPrsm(data));
  }, []);

  const getUpcomingEvents = (events: Event[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Keep each event's original index so detail links stay correct after sorting/filtering.
    return events
      .map((event, index) => ({ event, index }))
      .filter(({ event }) => new Date(event.date + "T00:00:00") >= today)
      .sort(
        (a, b) =>
          new Date(a.event.date + "T00:00:00").getTime() -
          new Date(b.event.date + "T00:00:00").getTime(),
      );
  };

  if (!prsm) {
    return (
      <div className="loader-container" role="status" aria-label="Loading">
        <div className="loader" />
      </div>
    );
  }

  const featured = prsm.fundraisers.find((f) => f.isFeatured);
  const upcoming = getUpcomingEvents(prsm.events);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Hero prsm={prsm} />
        {prsm.sponsors.length > 0 ? <SponsorStrip prsm={prsm} /> : null}
        {prsm.galleryPhotos.length > 0 ? <Gallery prsm={prsm} /> : null}
        <About prsm={prsm} />
        {featured ? (
          <LatestFundraiser
            featuredFundraiser={featured}
            kicker={prsm.fundraiserKicker}
          />
        ) : null}

        {upcoming.length > 0 ? (
          <Events
            upcomingEvents={upcoming}
            kicker={prsm.eventsKicker}
            title={prsm.eventsTitle}
            subtitle={prsm.upcomingEventsSubtitle}
          />
        ) : null}
        <Newsletter
          kicker={prsm.newsletterKicker}
          title={prsm.newsletterTitle}
          subtitle={prsm.newsletterSubtitle}
        />
        <Contact
          kicker={prsm.contactKicker}
          title={prsm.contactTitle}
          subtitle={prsm.contactSubtitle}
        />
      </main>
      <Footer prsm={prsm} />
    </>
  );
}

export default App;
