import React from "react";
// import illustration from "..src/assets/images/landing.png";
// use your own image path

const FeatureSection = () => {
	return (
		<section className="border-2 border-black min-h-dvh">
			<div className="grid items-center max-w-6xl pl-10 mx-auto pt-35 gap-25 md:grid-cols-2">
				{/* Left Text */}
				<div className="pl-15">
					{/* <p className="mb-3 text-sm tracking-wide uppercase text-highlight/90">
						Eliminate distractions
					</p> */}

					<h2 className="mb-4 text-3xl font-bold md:text-4xl">
						Productivity without the chaos
					</h2>

					<p className="leading-relaxed text-subtle">
						Smart Bachelor Life brings you a place to keep track of
						your necessary living expenses in your chaotic bachelor
						life.
					</p>
				</div>

				{/* Right Image */}
				<div className="flex justify-center">
					<img
						src="src\assets\images\landing.png"
						alt="Productivity illustration"
						className="w-full max-w-sm"
					/>
				</div>
			</div>
		</section>
	);
};

export default FeatureSection;
