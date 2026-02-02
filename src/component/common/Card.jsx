import React from "react";
import "../../index.css";
import Logo from "./Logo.jsx";

const Card = ({ title, description }) => {
	return (
		<div>
			<div className="flex gap-20 left-5 top-4.25 w-83.5 h-101 flex-col justify-items-center rounded-[25px]  bg-[linear-gradient(101deg,rgba(13,77,56,0.2)_18.53%,rgba(8,136,88,0.2)_81.47%)]  backdrop-blur-[5px]  ">
				<div className="flex flex-col items-center px-5 text-center gap-7 pt-21 ">
					<h2 className=" font-urbanist font-medium text-foreground text-[30px] leading-9.5 text-center self-stretch flex-none pb-5">
						{" "}
						{title}{" "}
					</h2>
					<p className="font-unbounded font-normal text-subtle text-[15px] leading-4.75 text-center flex-none self-stretch">
						{" "}
						{description}{" "}
					</p>
				</div>
				<div className="flex justify-center">
					<Logo />
				</div>
			</div>
		</div>
	);
};

export default Card;
