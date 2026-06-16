import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Seo from "../../components/seo/Seo";
import { useAuth } from "../../hooks/useAuth";
import { teacherLogin } from "../../services/teacherPortalService";

const TeacherLogin = () => {
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { isAuthenticated, user, setAuthToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || "/teacher/dashboard";

  useEffect(() => {
    const role = String(user?.role || "").toLowerCase();
    if (isAuthenticated && role === "teacher") {
      navigate("/teacher/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate, user?.role]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await teacherLogin({
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
      });
      const token = data?.token;
      if (!token)
        throw new Error("Login succeeded but token was not returned.");
      setAuthToken(token);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-sky-950 to-teal-900 text-white flex items-center justify-center px-4">
      <Seo title="Teacher Login" description="Teacher login portal for class dashboard, assignments, and tests." keywords="teacher login, teacher portal" path="/teacher/login" noIndex />

      <div className="w-full max-w-md rounded-2xl bg-white/10 border border-white/20 p-6 md:p-7 backdrop-blur">
        <h1 className="text-2xl font-bold mb-1">Teacher Login</h1>
        <p className="text-sm text-sky-100/90 mb-6">
          Login with your registered email and phone number.
        </p>

        {error ? <p className="mb-4 text-sm text-rose-200">{error}</p> : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-lg border border-white/25 bg-white/15 px-3 py-2 text-white placeholder:text-sky-100/70 outline-none" required />
          <input type="text" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="Phone Number" className="w-full rounded-lg border border-white/25 bg-white/15 px-3 py-2 text-white placeholder:text-sky-100/70 outline-none" required />
          <button type="submit" disabled={loading} className="w-full rounded-lg bg-sky-300 text-slate-950 font-semibold py-2.5 disabled:opacity-70">
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <button type="button" onClick={() => navigate("/")} className="mt-4 w-full rounded-lg border border-white/35 py-2 text-sm">
          Back To Home
        </button>
      </div>
    </div>
  );
};

export default TeacherLogin;
