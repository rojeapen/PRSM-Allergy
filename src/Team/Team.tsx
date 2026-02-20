import './Team.css';

import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import Header from '../components/header';
import { PRSM } from '../constants';
import Footer from '../components/footer';
import { getPRSM } from '../api/db';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Team />
  </StrictMode>,
)

function Team() {
  const [prsm, setPrsm] = useState<PRSM | null>(null);

  useEffect(() => {
    getPRSM().then(data => setPrsm(data));
  }, []);

  return (
    prsm ?
      <>
        <Header isTeamPage={true} />
        <main className="team-page">
          <div className='page-hero'>
            <h1 className="page-title">Meet the Team</h1>
            <p className="page-subtitle">Get to know the dedicated individuals working to advance allergy research and community awareness.</p>
          </div>

          {prsm.teamMembers.length > 0 ? (
            <div className="team-list">
              {prsm.teamMembers.map((member, index) => (
                <div className="team-card" key={index}>
                  <img 
                    src={member.photo.url} 
                    alt={member.name} 
                    className="team-card-photo"
                  />
                  <div className="team-card-content">
                    <h3 className="team-card-name">{member.name}</h3>
                    {member.role && <p className="team-card-role">{member.role}</p>}
                    <p className="team-card-description">{member.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="team-empty">
              <p>Team members coming soon!</p>
            </div>
          )}
        </main>
        <Footer prsm={prsm} />
      </> : <>
        <div className='loader-container'><div className='loader'></div></div>
      </>
  );
}

export default Team;
