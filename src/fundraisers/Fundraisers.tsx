
import './Fundraisers.css';

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import Header from '../components/header';
import Fundraiser from '../components/fundraiser';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fundraisers />
  </StrictMode>,
)

function Fundraisers() {
  return (
    <>
      <Header isFundraiserPage={true} />
      <Fundraiser />
      <Fundraiser />
      <Fundraiser />

    </>
  );
}

export default Fundraisers;
