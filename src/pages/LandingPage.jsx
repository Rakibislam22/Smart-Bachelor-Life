import React from 'react';
import Navbar from '../component/layout/Navbar.jsx';
import FeatureSection from '../component/layout/FeatureSection.jsx';
import HeroSection from '../component/layout/HeroSection.jsx';
import BenefitsSection from '../component/layout/BenefitsSection.jsx';
import HowItWorks from '../component/layout/HowItWorks.jsx';

const LandingPage = () => {
    return (
        <div>
            <Navbar/>
            <HeroSection/>
            <FeatureSection />
            <BenefitsSection/>
            <HowItWorks/>
            {/* <h1 className='text-4xl text-center pt-30'>Welcome To Smart Bachelor Life</h1> */}
        </div>
    );
};

export default LandingPage;