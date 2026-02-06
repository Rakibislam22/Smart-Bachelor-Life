import { motion } from "framer-motion";
import { useState } from "react";

const Contact = () => {
  // 🔹 Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  // 🔹 Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);

    const data = {
      name,
      email,
      message,
      time: new Date().toISOString(),
    };

    // Get old messages
    const oldMessages =
      JSON.parse(localStorage.getItem("contactMessages")) || [];

    // Save new message
    localStorage.setItem(
      "contactMessages",
      JSON.stringify([...oldMessages, data])
    );

    // UX feedback
    setTimeout(() => {
      setSending(false);
      alert("✅ Message sent successfully!");
      setName("");
      setEmail("");
      setMessage("");
    }, 600);
  };

  return (
    <main className="min-h-screen bg-background">
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-24">
        {/* TITLE */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold text-foreground"
        >
          Contact <span className="text-primary">Us</span>
        </motion.h1>

        {/* SUBTITLE */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-subtle max-w-2xl"
        >
          Have questions, feedback, or business inquiries?
          <br />
          We’re always happy to hear from you.
        </motion.p>

        <div className="mt-16 grid md:grid-cols-2 gap-12">
          {/*  contact info dyr jnne*/}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-semibold text-foreground mb-6">
              Smart Bachelor Life
            </h3>

            <ul className="space-y-4 text-subtle">
              <li>
                📧 <span className="text-foreground">Email:</span>{" "}
                smartbachelorlife@gmail.com
              </li>
              <li>
                📞 <span className="text-foreground">Phone:</span> +880 1900000000
              </li>
              <li>
                🏢 <span className="text-foreground">Company:</span> SBL Tech
              </li>
              <li>
                📍 <span className="text-foreground">Location:</span> Mirpur-02 , Dhaka , Bangladesh
              </li>
            </ul>
          </motion.div>

          {/* FORM */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-card border border-border rounded-xl p-8 space-y-6"
          >
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-background border border-border p-3 rounded-lg"
              placeholder="Your name"
            />

            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              type="email"
              className="w-full bg-background border border-border p-3 rounded-lg"
              placeholder="Email address"
            />

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              className="w-full bg-background border border-border p-3 rounded-lg"
              rows="4"
              placeholder="Your message"
            />

            <button
              type="submit"
              disabled={sending}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg disabled:opacity-60"
            >
              {sending ? "Sending..." : "Send Message"}
            </button>
          </motion.form>
        </div>
      </section>
    </main>
  );
};

export default Contact;
