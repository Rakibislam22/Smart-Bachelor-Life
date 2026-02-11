import React from 'react';
import FeatureSection from '../component/landingLayout/FeatureSection.jsx';
import HeroSection from '../component/landingLayout/HeroSection.jsx';
import BenefitsSection from '../component/landingLayout/BenefitsSection.jsx';
import HowItWorks from '../component/landingLayout/HowItWorks.jsx';
import ProductCTA from '../component/landingLayout/ProductCTA.jsx';

const LandingPage = () => {
    return (
        <div>
            <HeroSection />
            <FeatureSection />
            <BenefitsSection />
            <HowItWorks />
            <ProductCTA/>
            {/* <h1 className='text-4xl text-center pt-30'>Welcome To Smart Bachelor Life</h1> */}
        </div>
    );
};

export default LandingPage;