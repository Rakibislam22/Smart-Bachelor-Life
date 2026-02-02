export default function HowItWorks() {
	return (
		<section className="flex p-30  border-2 border-black justify-center min-h-dvh flex-col items-center">
			<div className=" flex flex-col w-full  gap-12.25 py-10 rounded-[30px] bg-[linear-gradient(101deg,rgba(13,77,56,0.2)_18.53%,rgba(8,136,88,0.2)_81.47%)] backdrop-blur-[5px]  ">
				{/* 🔹 CONTENT */}
				<div className="flex pl-15 flex-col gap-13">
					{/* TAG */}
					<div className="flex flex-col gap-3">
						<div className="flex items-center gap-1.25">
							<div className=" flex items-center justify-center gap-1.25 rounded-lg  ">
								{/* icon placeholder */}
								<span className="w-2.5 h-2.5 bg-primary rounded-full" />

								<span className=" font-unbounded text-[10px] leading-3 text-foreground  ">
									Get started effortlessly
								</span>
							</div>
						</div>

						{/* TEXT BLOCK */}
						<div className="flex flex-col  gap-7">
							<h1 className=" font-urbanist font-medium text-[48px] leading-14.5 text-foreground  ">
								Get started in 3 easy steps
							</h1>

							{/* <p className="">...</p> */}
						</div>
					</div>
					{/* 🔹 STEPS */}
					<div className="">
						<div className=" flex w-full justify-around items-center ">
							<Step
								step="Step 1"
								title="Sign up & connect to group"
							/>
							<Step
								step="Step 2"
								title="Set a default plan and expense"
							/>
							<Step
								step="Step 3"
								title="Keep track & stay focused"
							/>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

function Step({ step, title }) {
	return (
		<div className=" w-[344.67px] flex flex-col gap-6 ">
			{/* STEP BADGE */}
			<div className=" flex items-center gap-1.25 px-2 py-2 rounded-lg bg-[rgba(7,117,80,0.1)] w-fit ">
				{/* icon placeholder */}
				<span className="w-2 h-2 bg-highlight rounded-full" />

				<span className=" font-unbounded text-[10px] leading-3 text-foreground ">
					{step}
				</span>
			</div>

			{/* TITLE */}
			<p className=" font-urbanist font-medium text-[20px] leading-6 text-foreground  ">
				{title}
			</p>
		</div>
	);
}
