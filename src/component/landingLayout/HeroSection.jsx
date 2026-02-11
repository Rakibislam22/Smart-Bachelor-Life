import React from "react";
import ButtonPrimary from "../common/ButtonPrimary.jsx";
import ButtonSecondary from "../common/ButtonSecondary.jsx";
import { Link } from "react-router";

const HeroSection = () => {
	return (
		<section className="flex items-center justify-center text-center min-h-screen">
			<div className="max-w-3xl  px-8">
				<div className="-translate-y-30 sm:-translate-y-10 md:-translate-y-16">
					<h1 className="text-4xl font-urbanist font-semibold leading-tight md:text-6xl">
						Manage Your Mess
						<br />
						<span className="text-primary">
							Track. Live Better
						</span>
					</h1>

					<p className="mt-6 font-unbounded font-light text-md sm:text-lg text-subtle">
						Smart Bachelor Life helps you organize expenses and
						bring clarity to your daily life.
					</p>
				</div>

				<div className="flex flex-col sm:flex-row items-center justify-center gap-6">
					<Link to="/auth/login" className="w-full sm:w-auto cour">
						<ButtonPrimary className="w-full sm:w-auto px-8 py-3">
							Get Started
						</ButtonPrimary>
					</Link>

					<ButtonSecondary className="w-full sm:w-auto px-8 py-3">
						Watch Demo
					</ButtonSecondary>
				</div>
			</div>
		</section>
	);
};

export default HeroSection;
