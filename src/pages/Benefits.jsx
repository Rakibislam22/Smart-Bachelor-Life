import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import {
	Utensils,
	Calculator,
	Eye,
	MessageSquare,
	ClipboardList,
	UserCheck,
	History,
	ShieldCheck,
} from "lucide-react";
import ButtonPrimary from "../component/common/ButtonPrimary";

/* ---------------- reusable feature row ---------------- */
const FeatureRow = ({ title, desc, icon, reverse }) => {
	const IconComponent = icon;

	return (
		<div className="w-full grid md:grid-cols-2 gap-14 items-center">
			{/* text */}
			<motion.div
				initial={{ opacity: 0, x: reverse ? 80 : -80 }}
				whileInView={{ opacity: 1, x: 0 }}
				viewport={{ once: true }}
				transition={{ duration: 0.6 }}
				className="flex flex-col gap-6"
			>
				<div className="w-14 h-14 rounded-2xl bg-primary/15 text-primary flex items-center justify-center">
					<IconComponent size={28} />
				</div>

				<h2 className="text-3xl md:text-4xl font-urbanist leading-tight">
					{title}
				</h2>

				<p className="text-subtle text-lg font-unbounded leading-relaxed max-w-xl">
					{desc}
				</p>
			</motion.div>

			{/* visual mock card */}
			<motion.div
				initial={{ opacity: 0, x: reverse ? -80 : 80 }}
				whileInView={{ opacity: 1, x: 0 }}
				viewport={{ once: true }}
				transition={{ duration: 0.6 }}
				className="rounded-2xl border border-border bg-card h-65 md:h-80 relative overflow-hidden p-6 shadow-[0_0_60px_rgba(0,0,0,0.25)] "
			>
				<div className="flex flex-col gap-4">
					<div className="h-6 w-32 rounded-md bg-primary/20" />
					<div className="h-4 w-full rounded bg-muted" />
					<div className="h-4 w-5/6 rounded bg-muted" />
					<div className="h-4 w-4/6 rounded bg-muted" />

					<div className="mt-4 grid grid-cols-3 gap-3">
						<div className="h-16 rounded-lg bg-primary/20" />
						<div className="h-16 rounded-lg bg-primary/10" />
						<div className="h-16 rounded-lg bg-primary/20" />
					</div>
				</div>

				<div className="absolute -bottom-20 -right-20 w-60 h-60 bg-primary/20 blur-[90px]" />
			</motion.div>
		</div>
	);
};

/* ---------------- small card ---------------- */
const SmallCard = ({ icon, title, desc }) => {
	const IconComponent = icon;

	return (
		<motion.div
			initial={{ opacity: 0, y: 30 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			whileHover={{ y: -5 }}
			className="rounded-xl border border-border bg-card p-6 transition"
		>
			<div className="w-12 h-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center mb-4">
				<IconComponent size={24} />
			</div>

			<h3 className="font-urbanist text-lg font-semibold mb-2">
				{title}
			</h3>
			<p className="text-subtle font-unbounded text-[15px]">{desc}</p>
		</motion.div>
	);
};

const Benefits = () => {
	return (
		<section className="w-full flex flex-col items-center">
			{/* ================= HERO ================= */}
			<div className="max-w-6xl px-6 pt-28 pb-24 text-center flex flex-col gap-6 items-center">
				<motion.h1
					initial={{ opacity: 0, y: 40 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className="font-urbanist text-4xl md:text-6xl leading-tight"
				>
					Manage Your Mess Life
					<span className="text-primary"> Without Stress</span>
				</motion.h1>

				<p className="max-w-2xl text-subtle font-unbounded text-lg">
					No more notebooks, manual calculations, or money arguments.
					Smart Bachelor Life automates meals, expenses, and monthly
					bills so roommates can live peacefully.
				</p>
			</div>

			{/* ================= FEATURE SHOWCASE ================= */}
			<div className="max-w-6xl w-full px-6 flex flex-col gap-28 pb-28">
				<FeatureRow
					icon={Utensils}
					title="Control Meals From Anywhere"
					desc="Turn your meals on or off anytime using your phone. Late today? Traveling home? No need to call the manager — just tap once and the system updates the meal count automatically."
				/>

				<FeatureRow
					icon={Calculator}
					title="Automatic Monthly Bill Calculation"
					desc="The system calculates each member’s bill based on total expenses and total meals. No spreadsheets. No manual counting. No end-of-month arguments."
					reverse
				/>

				<FeatureRow
					icon={Eye}
					title="Complete Expense Transparency"
					desc="Every market expense can be uploaded with proof. All members can see where the money is spent, building trust between roommates."
				/>
			</div>

			{/* ================= BENEFIT GRID ================= */}
			<div className="w-full max-w-6xl px-6 pb-28 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
				<SmallCard
					icon={MessageSquare}
					title="Group Chat"
					desc="Communicate instantly with all mess members."
				/>

				<SmallCard
					icon={ClipboardList}
					title="Meal Planning"
					desc="Daily menu visible to members and cook."
				/>

				<SmallCard
					icon={UserCheck}
					title="Guest & Leave Mode"
					desc="Add guest meals and set leave days easily."
				/>

				<SmallCard
					icon={History}
					title="History Tracking"
					desc="View past meals and monthly expenses."
				/>

				<SmallCard
					icon={ShieldCheck}
					title="Secure Access"
					desc="Role-based login protects user data."
				/>

				<SmallCard
					icon={Utensils}
					title="Reduce Food Waste"
					desc="Cook exact amount based on real meal count."
				/>

				<SmallCard
					icon={Calculator}
					title="No Money Confusion"
					desc="System shows who owes whom clearly."
				/>

				<SmallCard
					icon={Eye}
					title="Trust Building"
					desc="Everyone sees all expenses transparently."
				/>
			</div>

			{/* ================= FINAL CTA ================= */}
			<div className="w-full flex justify-center pb-32 px-6">
				<div className="max-w-5xl w-full rounded-[30px] border border-border p-12 text-center bg-[linear-gradient(120deg,rgba(132,204,22,0.25),rgba(14,165,233,0.2))]">
					<h2 className="text-3xl md:text-4xl font-urbanist mb-4">
						Stop Managing Mess Manually
					</h2>

					<p className="text-subtle font-unbounded max-w-xl mx-auto mb-8">
						Let Smart Bachelor Life handle meals, expenses and
						billing automatically so you can focus on study, work,
						and real life.
					</p>

					<ButtonPrimary>Get Started</ButtonPrimary>
				</div>
			</div>
		</section>
	);
};

export default Benefits;
