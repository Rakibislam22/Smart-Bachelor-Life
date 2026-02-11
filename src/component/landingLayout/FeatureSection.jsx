import React from "react";
import landingImage from "../../assets/images/landing.png";

const FeatureSection = () => {
	return (
		<section className="min-h-dvh">
			<div className="grid grid-cols-1 md:grid-cols-2 justify-center items-center max-w-7xl p-10 mx-auto pt-35 gap-25 ">
				{/* Left Text */}
				<div className="">
					{/* <p className="mb-3 text-sm tracking-wide uppercase text-highlight/90">
						Eliminate distractions
					</p> */}

					<h2 className="mb-4 text-3xl font-medium md:text-[48px] font-urbanist">
						Productivity <span className="text-primary">Without the Chaos</span>
					</h2>

					<p className="leading-relaxed text-subtle font-unbounded font-light text-sm sm:text-[15px]">
						Smart Bachelor Life brings you a place to keep track of
						your necessary living expenses in your chaotic bachelor
						life.
					</p>
				</div>

				{/* Right Image */}
				<div className="flex justify-center">
					<img
						src={landingImage}
						alt="Productivity illustration"
						className="w-full max-w-sm"
					/>
				</div>
			</div>
		</section>
	);
};

export default FeatureSection;
