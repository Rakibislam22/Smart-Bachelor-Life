import React from "react";
import Step from "../common/Step";

const HowItWorks = () => {
	return (
		<section className="flex justify-center px-4 sm:px-6 lg:px-12 py-16 min-h-dvh border-black border-2 items-center ">
			<div className="w-full max-w-7xl ">
				<div className="flex flex-col gap-14 rounded-3xl bg-[linear-gradient(101deg,rgba(13,77,56,0.2)_18.53%,rgba(8,136,88,0.2)_81.47%)] backdrop-blur-md px-6 sm:px-10 lg:px-16 py-12">
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
							Get started in 3 easy steps
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
