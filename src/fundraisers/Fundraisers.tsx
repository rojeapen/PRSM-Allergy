
import './Fundraisers.css';

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import Header from '../components/header';

import FundraiserTile from '../components/fundraiser_tile';
import { Fundraiser } from '../constants';
import Footer from '../components/footer';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fundraisers />
  </StrictMode>,
)

function Fundraisers() {
  const demoFundraisers: Fundraiser[] = [
    new Fundraiser({
      name: "Fundraiser 1",
      description: "Description for Fundraiser 1",
      photoUrl: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fminorityrelief.org%2Fwp-content%2Fuploads%2F2022%2F03%2FUntitled-2-1024x683.jpg&f=1&nofb=1&ipt=28953917d4a0f421e78b830c9f90c355c7b16b6ab8ced8547838fc618289d32c",
      link: "https://example.com/fundraiser1"
    }),
    new Fundraiser({
      name: "Fundraiser 2",
      description: "Description for Fundraiser 2",
      photoUrl: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fdmgroupconsulting.com%2Fwp-content%2Fuploads%2F2024%2F12%2Fgetty-images-vlgDv4gDNtk-unsplash.jpg&f=1&nofb=1&ipt=4d31248d753ca4a5532e66de9f54a3cc1e2ec9b710f61e178b7c72f73b483d28",
      link: "https://example.com/fundraiser2"
    }),
    new Fundraiser({
      name: "Fundraiser 3",
      description: "Description for Fundraiser 3",
      photoUrl: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.careerguide.com%2Fcareer%2Fwp-content%2Fuploads%2F2023%2F04%2FAdobeStock_328277534.jpeg&f=1&nofb=1&ipt=8cf5a9b74765cd23486079dfa884cc329a01dd6d350c3546e2000207a9bbf3ae",
      link: "https://example.com/fundraiser3"
    }),
  ];


  return (
    <>
      <Header isFundraiserPage={true} />
      <main className="fundraisers-page">
        <div className='page-hero'>
          <h1 className="page-title">Fundraising Initiatives</h1>
          <p className="page-subtitle">Support our cause and make a meaningful impact. Every contribution helps us reach our mission.</p>
        </div>

        <div className="fundraisers-list">
          {demoFundraisers.map((fundraiser, index) => (
            <FundraiserTile
              key={index}
              fundraiser={fundraiser}
              backgroundColor={index % 2 === 0 ? 'light' : 'white'}
            />
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default Fundraisers;
