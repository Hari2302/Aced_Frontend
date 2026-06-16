import aboutImage from "../../assets/about.webp";

const highlights = [
  "Training Services",
  "Experienced Mentors",
  "Exam Strategy",
  "Lifetime Guidance",
];

const About = () => {
  return (
    <section id="about" className="site-section py-20">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <div className="relative flex justify-center animate-fade-up">
          <img src={aboutImage} alt="Academy campus" className="w-[320px] h-[320px] md:w-[420px] md:h-[420px] object-cover rounded-[2rem] border border-emerald-100 shadow-xl" />
          <div className="absolute -bottom-5 right-2 site-card px-4 py-3 text-sm animate-fade-up" style={{ animationDelay: "120ms" }}>
            <p className="font-semibold text-emerald-900">25+ Years</p>
            <p className="text-slate-500">Teaching excellence</p>
          </div>
        </div>

        <div className="animate-fade-up" style={{ animationDelay: "100ms" }}>
          <p className="text-emerald-600 font-semibold uppercase tracking-[0.14em] text-xs mb-3">
            About Us
          </p>
          <h2 className="site-title text-3xl md:text-5xl font-bold mb-5">
            A Better Strategy For NEET Learning Growth
          </h2>
          <p className="site-subtitle mb-7">
            We combine concept clarity, personal mentoring, and measurable
            progress to help students achieve strong NEET and board exam
            outcomes.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {highlights.map((item) => (
              <div key={item} className="site-card px-4 py-3 text-sm font-semibold text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
