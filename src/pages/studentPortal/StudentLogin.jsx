import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { studentLogin } from "../../services/studentPortalService";
import {
  clearStudentSession,
  setStudentSession,
  isStudentAuthenticated,
} from "../../services/studentPortalAuth";
import Seo from "../../components/seo/Seo";

const StudentLogin = () => {
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const forceLogin = Boolean(location.state?.forceLogin);

  const redirectPath = location.state?.from?.pathname || "/student/dashboard";

  useEffect(() => {
    if (forceLogin) {
      clearStudentSession();
      return;
    }

    if (isStudentAuthenticated()) {
      navigate("/student/dashboard", { replace: true });
    }
  }, [forceLogin, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await studentLogin({
        email: email.trim(),
        mobileNumber: mobileNumber.trim(),
      });
      setStudentSession({ token: data?.token, student: data?.student });
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-shell flex">
      <Seo title="Student Login" description="Student login portal for Kongu Neet Academy timetable, tests, and study updates." keywords="student login, kongu neet academy student portal" path="/student/login" noIndex />

      <div className="hidden md:flex w-1/2 p-10 items-center justify-center">
        <div className="relative max-w-md text-emerald-950 animate-fade-up">
          <div className="absolute -top-8 -left-8 w-24 h-24 rounded-full bg-emerald-200/70 blur-xl animate-pulse-soft" />
          <h2 className="site-title text-5xl font-bold leading-tight mb-4">
            Kongu Neet Academy
          </h2>
          <p className="site-subtitle text-lg">
            Student academic portal for timetable updates, tests, and learning
            resources.
          </p>
        </div>
      </div>

      <div className="flex w-full md:w-1/2 items-center justify-center px-6 py-10">
        <div className="site-card w-full max-w-md p-7 md:p-8 animate-fade-up" style={{ animationDelay: "80ms" }}>
          <div className="text-center mb-7">
            <p className="text-emerald-600 uppercase text-xs tracking-[0.14em] font-semibold">
              Student Access
            </p>
            <h1 className="site-title text-3xl font-bold mt-2">Welcome Back</h1>
            <p className="text-slate-500 text-sm mt-2">
              Login with your registered email and phone number.
            </p>
          </div>

          {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="site-input" required />
            <input type="text" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} placeholder="Phone Number" className="site-input" required />
            <button type="submit" disabled={loading} className="site-btn-primary w-full disabled:opacity-70">
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <button type="button" onClick={() => navigate("/")} className="site-btn-ghost w-full mt-4">
            Back To Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;
