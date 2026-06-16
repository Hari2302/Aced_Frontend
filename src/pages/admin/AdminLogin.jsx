import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  forgotPassword,
  login,
  resetPassword,
} from "../../services/authService";
import Seo from "../../components/seo/Seo";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const googleRedirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI;

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, setAuthToken } = useAuth();
  const forceLogin = Boolean(location.state?.forceLogin);
  const redirectPath = location.state?.from?.pathname;

  const getDashboardPathByRole = (roleValue) => {
    const role = String(roleValue || "")
      .trim()
      .toLowerCase();
    if (role === "superadmin") return "/superadmin/dashboard";
    if (role === "teacher") return "/teacher/dashboard";
    return "/admin/dashboard";
  };

  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState("phone");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("login");
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotStep, setForgotStep] = useState("request");
  const [forgotMessage, setForgotMessage] = useState("");

  useEffect(() => {
    if (isAuthenticated && !forceLogin) {
      const preferredPath = getDashboardPathByRole(user?.role);
      const safeRedirectPath = location.state?.from?.pathname || preferredPath;
      navigate(safeRedirectPath, { replace: true });
    }
  }, [
    forceLogin,
    isAuthenticated,
    location.state?.from?.pathname,
    navigate,
    user?.role,
  ]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(userName, password);
      const token = data?.token;
      if (!token)
        throw new Error("Login succeeded but token was not returned.");
      setAuthToken(token);
      const role = String(data?.user?.role || "")
        .trim()
        .toLowerCase();
      if (redirectPath) {
        navigate(redirectPath, { replace: true });
      } else {
        navigate(getDashboardPathByRole(role), { replace: true });
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError("");
    setForgotMessage("");
    setLoading(true);
    try {
      const response = await forgotPassword(forgotEmail);
      setForgotMessage(response?.message || "OTP sent to your email.");
      setForgotStep("verify");
    } catch (err) {
      console.error("Forgot password error:", err);
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setForgotMessage("");
    setLoading(true);
    try {
      await resetPassword({
        email: forgotEmail,
        otp,
        newPassword,
        confirmPassword,
      });
      const loginResult = await login(forgotEmail, newPassword);
      const token = loginResult?.token;
      if (!token)
        throw new Error(
          "Password reset succeeded but login token was not returned.",
        );
      setAuthToken(token);
      const role = String(loginResult?.user?.role || "")
        .trim()
        .toLowerCase();
      navigate(redirectPath || getDashboardPathByRole(role), { replace: true });
    } catch (err) {
      console.error("Reset password error:", err);
      setError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const backToLogin = () => {
    setMode("login");
    setForgotStep("request");
    setForgotMessage("");
    setError("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleGoogleLogin = () => {
    setError("");
    if (googleClientId && googleRedirectUri) {
      const googleUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
      googleUrl.searchParams.set("client_id", googleClientId);
      googleUrl.searchParams.set("redirect_uri", googleRedirectUri);
      googleUrl.searchParams.set("response_type", "code");
      googleUrl.searchParams.set("scope", "openid email profile");
      googleUrl.searchParams.set("prompt", "select_account");
      window.open(googleUrl.toString(), "_blank", "noopener,noreferrer");
      return;
    }

    window.open(
      "https://accounts.google.com/signin/v2/identifier",
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handleFacebookLogin = () => {
    window.open(
      "https://www.facebook.com/login",
      "_blank",
      "noopener,noreferrer",
    );
  };

  const modeTitle = mode === "login" ? "Welcome Back" : "Secure Password Reset";
  const modeSubtitle =
    mode === "login"
      ? "Login to access your account"
      : "Reset password with OTP verification";

  return (
    <div className="login-shell flex">
      <Seo title="Admin Teacher Login" description="Secure login portal for Super Admin, Admin, and Teacher." keywords="admin login, teacher login, super admin login" path="/admin/login" noIndex />
      <div className="login-orb login-orb-one" />
      <div className="login-orb login-orb-two" />
      <div className="login-grid" />

      <div className="hidden md:flex w-1/2 p-10 items-center justify-center">
        <div className="login-hero relative max-w-2xl text-white">
          <div className="login-hero-glow" />
          <div className="login-hero-grid" />
          <div className="login-hero-badge animate-fade-up">
            Elite Academic Control Center
          </div>

          <div className="relative z-10 animate-fade-up" style={{ animationDelay: "80ms" }}>
            <h2 className="site-title login-hero-title text-5xl font-bold leading-tight">
              Kongu Neet Academy
            </h2>
            <p className="login-hero-copy mt-5 text-lg">
              A grand sign-in experience for super admins, admins, and teachers
              with a sharper, more premium first impression.
            </p>
          </div>

          <div className="login-hero-panels relative z-10 mt-8 grid gap-4 md:grid-cols-2">
            <div className="login-hero-panel animate-fade-up" style={{ animationDelay: "160ms" }}>
              <p className="login-hero-label">Live Access</p>
              <h3 className="text-xl font-bold text-white">
                Unified academic operations
              </h3>
              <p className="mt-2 text-sm text-emerald-50/80">
                Manage student records, teacher workflows, and secure admin
                control from one portal.
              </p>
            </div>
            <div className="login-hero-panel animate-fade-up" style={{ animationDelay: "240ms" }}>
              <p className="login-hero-label">Trusted Workflow</p>
              <h3 className="text-xl font-bold text-white">
                Fast login, calm motion
              </h3>
              <p className="mt-2 text-sm text-emerald-50/80">
                Layered animation, glass panels, and spotlight effects without
                making the form harder to use.
              </p>
            </div>
          </div>

          <div className="login-hero-rings" aria-hidden="true">
            <span className="login-ring login-ring-one" />
            <span className="login-ring login-ring-two" />
            <span className="login-ring login-ring-three" />
          </div>
        </div>
      </div>

      <div className="flex w-full md:w-1/2 items-center justify-center px-6 py-10">
        <div className="site-card login-form-card w-full max-w-md p-7 md:p-8 animate-fade-up" style={{ animationDelay: "120ms" }}>
          <div className="text-center mb-7">
            <h1 className="site-title text-3xl font-bold mt-3 text-slate-950">
              {modeTitle}
            </h1>
            <p className="text-slate-500 text-sm mt-2">{modeSubtitle}</p>
          </div>

          {mode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="login-method-switch">
                <button type="button" className={`login-method-pill ${loginMethod === "phone" ? "is-active" : ""}`} onClick={() => setLoginMethod("phone")}>
                  Phone Number
                </button>
                <button type="button" className={`login-method-pill ${loginMethod === "email" ? "is-active" : ""}`} onClick={() => setLoginMethod("email")}>
                  Email
                </button>
              </div>

              {error ? (
                <p className="login-form-alert login-form-alert-error">
                  {error}
                </p>
              ) : null}
              <label className="login-field login-field-minimal">
                <span className="login-field-label">
                  {loginMethod === "phone" ? "Phone Number" : "Email"}
                </span>
                <input type={loginMethod === "email" ? "email" : "text"} placeholder={loginMethod === "phone" ? "+91 98765 43210" : "name@example.com"} value={userName} onChange={e => setUserName(e.target.value)} className="site-input login-field-input" required />
              </label>
              <div className="space-y-2">
                <label className="login-field login-field-minimal">
                  <span className="login-field-label">Password</span>
                  <div className="login-password-row">
                    <input type={showPassword ? "text" : "password"} placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)} className="site-input login-field-input" required />
                    <button type="button" className="login-password-toggle" onClick={() => setShowPassword(value => !value)}>
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </label>
              </div>
              <div className="login-form-meta">
                <label className="login-remember">
                  <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
                  <span>Remember me</span>
                </label>
                <button type="button" onClick={() => { setMode("forgot"); setError(""); setForgotMessage(""); }} className="login-forgot-link">
                  Forget password?
                </button>
              </div>
              <button type="submit" disabled={loading} className="site-btn-primary login-submit-btn w-full disabled:opacity-70">
                {loading ? "Logging in..." : "Log In"}
              </button>

              <div className="login-divider">
                <span>Or Sign In With</span>
              </div>

              <div className="login-social-grid">
                <button type="button" onClick={handleGoogleLogin} className="login-social-btn">
                  <span className="login-social-icon login-social-icon-google" aria-hidden="true">
                    G
                  </span>
                  <span>Google</span>
                </button>
                <button type="button" className="login-social-btn" onClick={handleFacebookLogin}>
                  <span className="login-social-icon login-social-icon-facebook" aria-hidden="true">
                    f
                  </span>
                  <span>Facebook</span>
                </button>
              </div>
            </form>
          ) : forgotStep === "request" ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              {error ? (
                <p className="login-form-alert login-form-alert-error">
                  {error}
                </p>
              ) : null}
              {forgotMessage ? (
                <p className="login-form-alert login-form-alert-success">
                  {forgotMessage}
                </p>
              ) : null}
              <label className="login-field login-field-minimal">
                <span className="login-field-label">Registered Email</span>
                <input type="email" placeholder="Registered Email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} className="site-input login-field-input" required />
              </label>
              <button type="submit" disabled={loading} className="site-btn-primary login-submit-btn w-full disabled:opacity-70">
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
              <button type="button" onClick={backToLogin} className="site-btn-ghost w-full">
                Back to Login
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {error ? (
                <p className="login-form-alert login-form-alert-error">
                  {error}
                </p>
              ) : null}
              {forgotMessage ? (
                <p className="login-form-alert login-form-alert-success">
                  {forgotMessage}
                </p>
              ) : null}
              <label className="login-field login-field-minimal">
                <span className="login-field-label">Registered Email</span>
                <input type="email" placeholder="Registered Email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} className="site-input login-field-input" required />
              </label>
              <label className="login-field login-field-minimal">
                <span className="login-field-label">Verification OTP</span>
                <input type="text" placeholder="OTP" value={otp} onChange={e => setOtp(e.target.value)} className="site-input login-field-input login-otp-input" required />
              </label>
              <label className="login-field login-field-minimal">
                <span className="login-field-label">New Password</span>
                <input type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="site-input login-field-input" required />
              </label>
              <label className="login-field login-field-minimal">
                <span className="login-field-label">Confirm Password</span>
                <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="site-input login-field-input" required />
              </label>
              <button type="submit" disabled={loading} className="site-btn-primary login-submit-btn w-full disabled:opacity-70">
                {loading ? "Resetting..." : "Reset Password"}
              </button>
              <button type="button" onClick={() => setForgotStep("request")} className="site-btn-ghost w-full">
                Resend OTP
              </button>
              <button type="button" onClick={backToLogin} className="site-btn-ghost w-full">
                Back to Login
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
