const Contact = () => {
  return (
    <section id="contact" className="site-section py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="site-card p-6 md:p-10">
          <div className="text-center mb-10 animate-fade-up">
            <p className="text-emerald-600 font-semibold uppercase tracking-[0.14em] text-xs mb-2">
              Contact
            </p>
            <h2 className="site-title text-3xl md:text-5xl font-bold">
              Talk To Our Team
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="rounded-xl overflow-hidden border border-emerald-100 animate-fade-up">
              <iframe title="Kongu Neet Location" src="https://www.google.com/maps?q=Tamil%20Nadu%2C%20India&output=embed" className="w-full h-72 border-0" loading="lazy" />
            </div>

            <form className="space-y-4 animate-fade-up" style={{ animationDelay: "100ms" }}>
              <input type="text" placeholder="Name" className="site-input" />
              <input type="email" placeholder="Email address" className="site-input" />
              <textarea placeholder="Message" rows="5" className="site-input" />
              <button type="submit" className="site-btn-primary w-full">
                Send Message
              </button>
            </form>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mt-10 text-sm">
            <div className="site-card p-4 text-center">
              <p className="font-bold text-emerald-800 mb-1">Call</p>
              <p className="text-slate-600">+91 98765 43210</p>
            </div>
            <div className="site-card p-4 text-center">
              <p className="font-bold text-emerald-800 mb-1">Email</p>
              <p className="text-slate-600">konguneetacademy@gmail.com</p>
            </div>
            <div className="site-card p-4 text-center">
              <p className="font-bold text-emerald-800 mb-1">Location</p>
              <p className="text-slate-600">Tamil Nadu, India</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
