import React from "react";
import Step from "../common/Step";

const HowItWorks = () => {
	return (
		<section className="flex justify-center px-4 sm:px-6 lg:px-12 py-16 min-h-dvh items-center ">
			<div className="w-full max-w-7xl ">
				<div className="flex flex-col gap-14 rounded-3xl bg-[linear-gradient(210deg,rgba(132,204,22,0.25),rgba(14,165,233,0.2))] backdrop-blur-md px-6 sm:px-10 lg:px-16 py-12">
					{/* 🔹 HEADER */}
					<div className="flex flex-col gap-6">
						{/* TAG */}
						<div className="flex items-center gap-2">
							<span className="w-2.5 h-2.5 bg-primary rounded-full" />
							<span className="font-unbounded text-xs text-foreground">
								Get started effortlessly
							</span>
						</div>

						{/* TITLE */}
						<h1 className="font-urbanist font-medium text-3xl sm:text-4xl lg:text-5xl leading-tight text-foreground max-w-2xl">
							Get started in <span className="text-primary">3 easy steps</span>
						</h1>
					</div>

					{/* 🔹 STEPS */}
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 ">
						<Step
							step="Step 1"
							title="Sign up & connect to group"
						/>
						<Step
							step="Step 2"
							title="Set a default plan and expense"
						/>
						<Step step="Step 3" title="Keep track & stay focused" />
					</div>
				</div>
			</div>
		</section>
	);
};

export default HowItWorks;
