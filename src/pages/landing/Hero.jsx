import heroImage from "../../assets/hero.webp";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section id="home" className="site-section pt-28 md:pt-32 pb-16 md:pb-20 bg-gradient-to-br from-[#072c21] via-[#0a3f2e] to-[#0f5c43] text-white">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
        <div className="animate-fade-up">
          <p className="text-emerald-200 uppercase tracking-[0.14em] text-xs mb-4">
            Future Ready Academy
          </p>
          <h1 className="text-emerald-100 site-title text-emerald-100 text-4xl md:text-6xl font-bold leading-tight mb-5">
            Kongu Neet Academy
            <br />  
            NEET Coaching With Purpose
          </h1>
          <p className="text-emerald-100/90 max-w-xl mb-8 text-base md:text-lg">
            A focused NEET coaching ecosystem with expert mentors, structured
            programs, and modern classrooms in Tamil Nadu.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            {/* <a href="#about" className="site-btn-primary">
              Explore Academy
            </a> */}
            <button type="button" onClick={() => navigate("/student/login", { state: { forceLogin: true } })} className="site-btn-ghost">
              Student Login
            </button>
            <a href="#contact" className="site-btn-ghost">
              Talk To Us
            </a>
          </div>
        </div>

        <div className="relative flex justify-center animate-fade-up " style={{ animationDelay: "120ms" }}>
          <div className="absolute -top-8 -right-6 w-28 h-28 rounded-full bg-emerald-300/30 blur-xl animate-pulse-soft" />
          <div className="absolute -bottom-10 -left-8 w-32 h-32 rounded-full bg-cyan-200/30 blur-xl animate-pulse-soft" />
          <img src={heroImage} alt="Students learning" className="w-[330px] h-[330px] md:w-[440px] md:h-[440px] object-cover rounded-[2rem] border border-white/20 shadow-2xl animate-float" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
