import './Team.css';

import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import Header from '../components/header';
import { ORIGIN, PRSM, TeamMember } from '../constants';
import Footer from '../components/footer';
import Reveal from '../components/reveal';
import { getPRSM } from '../api/db';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Team />
  </StrictMode>,
)

const DEFAULT_SUBTITLE =
  'Meet the researchers, caregivers, and advocates working to advance allergy research and support the people who live with allergies every day.';

/** First and last initials, for the photo-less fallback tile. */
function monogram(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function MemberPortrait({ member }: { member: TeamMember }) {
  const url = member.photo?.url?.trim();
  return (
    <div className="member-portrait">
      {url ? (
        <img
          src={url}
          alt={`Portrait of ${member.name}`}
          className="member-photo"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="member-photo member-photo--blank" aria-hidden="true">
          <span className="member-monogram">{monogram(member.name)}</span>
        </div>
      )}
    </div>
  );
}

function Team() {
  const [prsm, setPrsm] = useState<PRSM | null>(null);

  useEffect(() => {
    getPRSM().then(data => setPrsm(data));
  }, []);

  if (!prsm) {
    return (
      <div className='loader-container' role="status" aria-label="Loading">
        <div className='loader'></div>
      </div>
    );
  }

  const hasStory = !!(prsm.ourStory && prsm.ourStory.trim());
  const team = prsm.teamMembers;

  return (
    <>
      <Header isTeamPage={true} />
      <main className="about-page">

        {/* ---- Hero: left-aligned editorial header ---- */}
        <section className="about-hero section" aria-labelledby="about-hero-title">
          <div className="shell about-hero-shell">
            <Reveal className="about-hero-head">
              <p className="kicker">Our foundation</p>
              <h1 id="about-hero-title" className="about-hero-title">About us</h1>
              <p className="lede about-hero-lede">
                {prsm.teamSubtitle?.trim() || DEFAULT_SUBTITLE}
              </p>
            </Reveal>
          </div>
        </section>

        {/* ---- Our Story: asymmetric, sticky label + long-form prose ---- */}
        {hasStory && (
          <section className="story section" aria-labelledby="story-title">
            <div className="shell story-shell">
              <Reveal className="story-aside">
                <p className="kicker">Our story</p>
                <h2 id="story-title" className="story-title">How we started</h2>
                <p className="story-note">
                  A look at how the foundation began, and what keeps us
                  working for the allergy community today.
                </p>
              </Reveal>
              <Reveal className="story-body" delay={90}>
                <p className="story-text">{prsm.ourStory}</p>
              </Reveal>
            </div>
          </section>
        )}

        {/* ---- The team: a roster of people, photos carry the page ---- */}
        <section className="roster section" aria-labelledby="roster-title">
          <div className="shell roster-shell">
            <Reveal className="roster-head">
              <p className="kicker">Our team</p>
              <h2 id="roster-title" className="roster-title">Meet the team</h2>
            </Reveal>

            {team.length > 0 ? (
              <ol className="roster-grid" aria-label="PRSM team members">
                {team.map((member, index) => (
                  <Reveal
                    as="li"
                    className="member"
                    key={index}
                    delay={(index % 4) * 80}
                  >
                    <MemberPortrait member={member} />
                    <div className="member-meta">
                      {member.role && (
                        <span className="member-role">{member.role}</span>
                      )}
                    </div>
                    <h3 className="member-name">{member.name}</h3>
                    {member.description && (
                      <p className="member-bio">{member.description}</p>
                    )}
                  </Reveal>
                ))}
              </ol>
            ) : (
              <div className="roster-empty">
                <p className="roster-empty-title">Our team is growing.</p>
                <p className="roster-empty-text">
                  We're introducing the people behind PRSM soon. In the
                  meantime, see what we're working on and how you can help.
                </p>
                <a className="btn-secondary" href={ORIGIN + 'Events/'}>
                  See upcoming events
                  <span className="btn-arrow" aria-hidden="true">→</span>
                </a>
              </div>
            )}
          </div>
        </section>

        {/* ---- Closing: light invitation back into the mission ---- */}
        <section className="about-invite section" aria-labelledby="invite-title">
          <div className="shell about-invite-shell">
            <div className="about-invite-copy">
              <h2 id="invite-title" className="about-invite-title">
                Be part of the work.
              </h2>
              <p className="about-invite-text">
                Every donation goes directly to allergy research, and every
                event brings our community closer. There's a place here for you.
              </p>
            </div>
            <div className="about-invite-actions">
              <a className="btn-primary" href={ORIGIN + 'Fundraisers/'}>
                Support the research
                <span className="btn-arrow" aria-hidden="true">→</span>
              </a>
              <a className="btn-secondary" href={ORIGIN + 'Events/'}>
                Join an event
              </a>
            </div>
          </div>
        </section>

      </main>
      <Footer prsm={prsm} />
    </>
  );
}

export default Team;
