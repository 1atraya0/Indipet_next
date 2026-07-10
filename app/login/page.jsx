import LoginForm from "./LoginForm";
import "../globals.css";

export default function LoginPage() {
  return (
    <div className="login-page">
      <div className="login-backdrop" />
      <div className="login-card">
        <LoginForm />
      </div>
      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          background: #0f172a;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        .login-backdrop {
          position: absolute;
          inset: 0;
          background: url("/loginpage.png") center/cover no-repeat;
          opacity: 0.25;
          pointer-events: none;
        }
        .login-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 420px;
          margin: 1rem;
        }
        .login-form {
          background: rgba(255,255,255,0.97);
          border-radius: 16px;
          padding: 2.5rem 2rem;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
        }
        .login-form-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .login-logo {
          width: 64px;
          height: 64px;
          margin-bottom: 0.75rem;
          border-radius: 12px;
        }
        .login-form-header h1 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
          color: #0f172a;
        }
        .login-form-header p {
          margin: 0.25rem 0 0;
          font-size: 0.875rem;
          color: #64748b;
        }
        .login-error {
          background: #fef2f2;
          color: #b91c1c;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }
        .login-field {
          margin-bottom: 1.25rem;
        }
        .login-field label {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: #334155;
          margin-bottom: 0.375rem;
        }
        .login-field input {
          width: 100%;
          padding: 0.75rem 1rem;
          font-size: 0.9375rem;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          outline: none;
          transition: border-color 0.2s;
          box-sizing: border-box;
          background: #f8fafc;
        }
        .login-field input:focus {
          border-color: #3b82f6;
          background: #fff;
        }
        .login-field input::placeholder {
          color: #94a3b8;
        }
        .login-submit {
          width: 100%;
          padding: 0.8125rem;
          font-size: 1rem;
          font-weight: 600;
          color: #fff;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.1s;
          margin-top: 0.5rem;
        }
        .login-submit:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        .login-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
