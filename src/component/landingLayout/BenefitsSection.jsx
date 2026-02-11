import React from "react";
import Card from "../common/Card.jsx";

const BenefitsSection = () => {
	return (
		<section className="relative flex items-center justify-center min-h-dvh p-4 sm:p-18 ">
			<div className="w-full px-2.5 py-10 max-w-7xl flex flex-col items-center text-center gap-10 sm:gap-14">
				{/* SMALL LABEL */}
				<div className="flex items-center gap-2">
					<span className="w-2 h-2 bg-primary rounded-full" />
					<span className="font-unbounded text-[11px] tracking-wide text-foreground">
						Key benefits
					</span>
				</div>

				{/* HEADING */}
				<h1 className=" font-urbanist font-medium text-3xl sm:text-4xl lg:text-[48px] leading-tight sm:leading-[1.2] text-foreground ">
					Why choose <span className="text-primary">SmartBachelorLife</span>
				</h1>

				{/* CARDS */}
				<div className=" w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 pt-4 sm:pt-6 place-items-center ">
					<Card
						title="Keep track of your daily meal"
						description="Reduce food shortage and food waste"
					/>
					<Card
						title={
							<>
								Utility <br /> Calculation
							</>
						}
						description="let’s you keep track of your monthly bill expense"
					/>
					<Card
						title="Seamless Collaboration"
						description="Keep your team aligned with real-time updates and clear workflows."
					/>
				</div>
			</div>
		</section>
	);
};

export default BenefitsSection;
