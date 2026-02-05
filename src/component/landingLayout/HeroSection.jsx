import React from "react";
import ButtonPrimary from "../common/ButtonPrimary.jsx";
import ButtonSecondary from "../common/ButtonSecondary.jsx";
import { Link } from "react-router";

const HeroSection = () => {
	return (
		<section className="flex items-center justify-center text-center border-2 border-black min-h-dvh">
			<div className="max-w-3xl pt-15 px-8">
				<h1 className="text-4xl font-urbanist font-semibold leading-tight md:text-6xl">
					Manage Your Mess
					<br />
					<span className="text-highlight">Track. Live Better</span>
				</h1>

				<p className="mt-6 font-unbounded font-normal text-lg text-subtle">
					Smart Bachelor Life helps you organize expenses and bring
					clarity to your daily life.
				</p>

<<<<<<< HEAD:src/component/layout/HeroSection.jsx
				<div className="flex pt-15 sm:pt-7.5 sm:flex-row flex-col justify-center gap-4 mt-8">
					<ButtonPrimary>Get Started</ButtonPrimary>
=======
				<div className="flex sm:flex-row flex-col justify-center gap-4 mt-8">
					<Link to="/auth/login"><ButtonPrimary>Get Started</ButtonPrimary></Link>
>>>>>>> team/main:src/component/landingLayout/HeroSection.jsx

					<ButtonSecondary>Watch Demo</ButtonSecondary>
				</div>
			</div>
		</section>
	);
};

export default HeroSection;
