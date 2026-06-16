import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import Seo from "../../components/seo/Seo";
import Hero from "./Hero";
import About from "./About";
import Features from "./Features";
import Contact from "./Contact";

const Landing = () => {
  return (
    <div className="site-shell">
      <Seo title="NEET Coaching Academy In Tamil Nadu" description="Kongu Neet Academy offers focused NEET coaching, expert mentors, structured test schedules, and student performance tracking." keywords="NEET coaching, NEET academy, Tamil Nadu coaching center, medical entrance coaching, Kongu Neet Academy" path="/" image="/vite.svg" structuredData={[{ "@context": "https://schema.org", "@type": "EducationalOrganization", name: "Kongu Neet Academy", url: "https://konguneetacademy.com", telephone: "+91 98765 43210", email: "konguneetacademy@gmail.com", address: { "@type": "PostalAddress", addressRegion: "Tamil Nadu", addressCountry: "IN" } }, { "@context": "https://schema.org", "@type": "WebSite", name: "Kongu Neet Academy", url: "https://konguneetacademy.com" }]} />
      <Header />
      <Hero />
      <About />
      <Features />
      <Contact />
      <Footer />
    </div>
  );
};

export default Landing;
