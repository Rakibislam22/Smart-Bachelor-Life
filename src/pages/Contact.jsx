// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useState } from "react";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);

    const data = {
      name,
      email,
      message,
      time: new Date().toISOString(),
    };

    const oldMessages =
      JSON.parse(localStorage.getItem("contactMessages")) || [];

    localStorage.setItem(
      "contactMessages",
      JSON.stringify([...oldMessages, data])
    );

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
        {/* TWO COLUMN MAIN LAYOUT */}
        <div className="grid md:grid-cols-2 gap-16 items-start">
          {/* LEFT SIDE (CONTACT INFO + TITLE) */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-8"
          >
            {/* CONTACT US TITLE */}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground font-urbanist">
                Contact <span className="text-primary">Us</span>
              </h1>

              <p className="mt-4 text-subtle max-w-md font-unbounded">
                Have questions, feedback, or business inquiries?
                <br />
                We’re always happy to hear from you.
              </p>
            </div>

            {/* COMPANY INFO */}
            <div>
              <h3 className="text-2xl font-semibold text-foreground font-urbanist mb-4">
                Smart Bachelor Life
              </h3>

              <ul className="space-y-4 text-subtle font-unbounded">
                <li>
                  📧 <span className="text-foreground">Email:</span>{" "}
                  smartbachelorlife@gmail.com
                </li>
                <li>
                  📞 <span className="text-foreground">Phone:</span> +880
                  1900000000
                </li>
                <li>
                  🏢 <span className="text-foreground">Company:</span> SBL Tech
                </li>
                <li>
                  📍 <span className="text-foreground">Location:</span> Mirpur-02,
                  Dhaka, Bangladesh
                </li>
              </ul>
            </div>
          </motion.div>

          {/* RIGHT SIDE (FORM) */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-surface border border-border rounded-xl p-10 space-y-6"
          >
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-background border border-border p-4 rounded-lg placeholder:text-muted-foreground"
              placeholder="Your name"
            />

            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              type="email"
              className="w-full bg-background border border-border p-4 rounded-lg placeholder:text-muted-foreground"
              placeholder="Email address"
            />

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              className="w-full bg-background border border-border p-4 rounded-lg placeholder:text-muted-foreground"
              rows="5"
              placeholder="Your message"
            />

            <button
              type="submit"
              disabled={sending}
              className="bg-primary text-primary-foreground px-8 py-3 rounded-lg disabled:opacity-60"
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
