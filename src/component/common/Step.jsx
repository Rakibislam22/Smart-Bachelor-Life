import React from "react";

const Step = ( {title, step} ) => {
	return (
		<div className="flex flex-col gap-5 p-6 rounded-2xl bg-[linear-gradient(160deg,rgba(7,117,80,0.18),rgba(7,117,80,0.08))] border border-[rgba(7,117,80,0.25)] shadow-[0_10px_30px_-12px_rgba(7,117,80,0.35)] hover:-translate-y-1 hover:shadow-[0_18px_40px_-10px_rgba(7,117,80,0.45)] transition-all duration-300">
			{/* STEP BADGE */}
			<div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[rgba(7,117,80,0.15)] w-fit">
				<span className="w-2 h-2 bg-highlight rounded-full" />
				<span className="font-unbounded text-xs text-foreground">
					{step}
				</span>
			</div>

			{/* TITLE */}
			<p className="font-urbanist font-medium text-lg sm:text-xl text-foreground">
				{title}
			</p>
		</div>
	);
};

export default Step;
