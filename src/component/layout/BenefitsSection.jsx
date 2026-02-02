import React from "react";
import Card from "../common/Card.jsx";

const BenefitsSection = () => {
	return (
		<section className="flex items-center justify-center text-center border-2 border-black min-h-dvh ">
			<div className="flex w-screen px-20 justify-evenly pt-15">
				<Card
					title="Keep track of your daily meal"
					description="Reduce food shortage and food waste"
				/>
				<Card
					title="Utility Calculation"
					description="let’s you keep track of your monthly bill expense"
				/>
				<Card
					title="Seamless Collaboration"
					description="Keep your team aligned with real-time updates and clear workflows."
				/>
			</div>
		</section>
	);
};

export default BenefitsSection;
