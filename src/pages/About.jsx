import { motion } from "framer-motion";

const About = () => {
  return (
    <main className="min-h-screen bg-background">
      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-20">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold text-foreground"
        >
          About <span className="text-primary">Smart Bachelor Life</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-6 max-w-3xl text-subtle text-lg"
        >
          Smart Bachelor Life (SBL) is a modern lifestyle and expense management
          platform designed especially for students and bachelors who want
          clarity, control, and confidence in daily life.
        </motion.p>
      </section>

      {/* INFO GRID */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Why We Built SBL",
              text: "Managing expenses, habits, and daily routines shouldn’t be stressful. SBL simplifies everything into one smart system.",
            },
            {
              title: "What We Solve",
              text: "Daily expense tracking, habit awareness, clarity in spending, and organized personal life management.",
            },
            {
              title: "Our Vision",
              text: "To empower bachelors with tools that make financial and lifestyle decisions simple, visual, and smart.",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-card border border-border rounded-xl p-6"
            >
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {item.title}
              </h3>
              <p className="text-subtle">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default About;
