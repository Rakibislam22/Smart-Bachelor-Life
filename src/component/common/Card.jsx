import React from "react";
import "../../index.css";
import Logo from "./Logo.jsx";

const Card = ({ title, description }) => {
	return (
		<div>
			<div className="flex gap-20 left-5 top-4.25 w-83.5 h-101 flex-col justify-between border-border hover:border hover:border-primary rounded-[25px] bg-card backdrop-blur-[5px]  shadow-[0_10px_30px_-12px_rgba(7,117,80,0.35)] hover:-translate-y-1 hover:shadow-[0_18px_40px_-10px_rgba(7,117,80,0.45)] transition-all duration-300 ">
				<div className="flex flex-col items-center px-5 text-center gap-7 pt-21 ">
					<h2 className=" font-urbanist font-medium text-foreground text-[30px] leading-9.5 text-center self-stretch flex-none pb-5">
						{" "}
						{title}{" "}
					</h2>
					<p className="font-unbounded font-light text-subtle text-[15px] leading-4.75 text-center flex-none self-stretch px-4">
						{" "}
						{description}{" "}
					</p>
				</div>
				<div className="flex justify-center pb-10">
					<Logo />
				</div>
			</div>
		</div>
	);
};

export default Card;
