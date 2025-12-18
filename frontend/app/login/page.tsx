"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "../../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await apiRequest<{ access_token: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      if (typeof window !== "undefined") {
        localStorage.setItem("tmf_token", data.access_token);
      }
      router.push("/home");
    } catch (err: any) {
      setError(err.message ?? "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={mainStyle}>
      {/* Logo Section - Floating above card */}
      <div style={logoContainerStyle}>
        <div style={logoWrapperStyle} className="logo-wrapper">
          <Image
            src="/logo.png"
            alt="TMF Stock Logo"
            width={120}
            height={120}
            priority
            style={logoImageStyle}
          />
        </div>
      </div>

      <div style={cardStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <h2 style={titleStyle}>Bon Retour</h2>
          <p style={subtitleStyle}>Connectez-vous à votre compte</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={formStyle}>
          <label style={labelStyle}>
            <span style={labelTextStyle}>Adresse Email</span>
            <div style={inputContainerStyle} className="input-container">
              <EmailIcon />
              <input
                type="email"
                placeholder="vous@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
                required
              />
            </div>
          </label>

          <label style={labelStyle}>
            <span style={labelTextStyle}>Mot de passe</span>
            <div style={inputContainerStyle} className="input-container">
              <LockIcon />
              <input
                type="password"
                placeholder="........"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
                required
              />
            </div>
          </label>

          {error && (
            <div style={errorStyle}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={submitButtonStyle} className="submit-button">
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        {/* Separator */}
        <div style={separatorStyle}>
          <div style={separatorLineStyle}></div>
          <span style={separatorTextStyle}>OU</span>
          <div style={separatorLineStyle}></div>
        </div>

        {/* Footer Link */}
        <div style={footerStyle}>
          <span style={footerTextStyle}>Pas encore de compte ? </span>
          <Link href="/signup" style={footerLinkStyle}>
            S&apos;inscrire
          </Link>
        </div>
      </div>
    </main>
  );
}

// Icons
function SignInIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#137C8B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" y1="12" x2="3" y2="12" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

// Styles
const mainStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "2rem",
  backgroundColor: "#F8FAFB",
  position: "relative",
};

const logoContainerStyle: React.CSSProperties = {
  position: "relative",
  marginBottom: "1.5rem",
  zIndex: 10,
  animation: "logoFloat 3s ease-in-out infinite",
};

const logoWrapperStyle: React.CSSProperties = {
  width: "140px",
  height: "140px",
  borderRadius: "50%",
  backgroundColor: "#ffffff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 10px 25px -5px rgba(19, 124, 139, 0.2), 0 8px 10px -6px rgba(19, 124, 139, 0.1)",
  border: "4px solid #d1fae5",
  padding: "0.75rem",
  transition: "all 0.3s ease",
  cursor: "pointer",
};

const logoImageStyle: React.CSSProperties = {
  objectFit: "contain",
  borderRadius: "50%",
};

const cardStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "420px",
  backgroundColor: "#ffffff",
  borderRadius: "0.75rem",
  padding: "2rem",
  boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  marginTop: "-20px",
};

const headerStyle: React.CSSProperties = {
  textAlign: "center",
  marginBottom: "2rem",
  width: "100%",
};

const titleStyle: React.CSSProperties = {
  fontSize: "1.875rem",
  fontWeight: 600,
  color: "#137C8B",
  margin: 0,
  marginBottom: "0.5rem",
};

const subtitleStyle: React.CSSProperties = {
  fontSize: "0.95rem",
  color: "#6b7280",
  margin: 0,
};

const formStyle: React.CSSProperties = {
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: "1.25rem",
  marginBottom: "1.5rem",
};

const labelStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
};

const labelTextStyle: React.CSSProperties = {
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "#344D59",
};

const inputContainerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  padding: "0.75rem 1rem",
  borderRadius: "0.5rem",
  border: "1px solid #e5e7eb",
  backgroundColor: "#ffffff",
  transition: "all 0.2s",
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  border: "none",
  outline: "none",
  fontSize: "0.95rem",
  color: "#344D59",
  backgroundColor: "transparent",
};

const errorStyle: React.CSSProperties = {
  padding: "0.75rem 1rem",
  borderRadius: "0.5rem",
  backgroundColor: "#fee2e2",
  color: "#991b1b",
  fontSize: "0.875rem",
  marginTop: "-0.5rem",
};

const submitButtonStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.75rem 1rem",
  borderRadius: "0.5rem",
  border: "none",
  backgroundColor: "#137C8B",
  color: "#ffffff",
  fontSize: "0.95rem",
  fontWeight: 500,
  cursor: "pointer",
  transition: "all 0.2s",
  marginTop: "0.5rem",
};

const separatorStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  width: "100%",
  marginBottom: "1.5rem",
};

const separatorLineStyle: React.CSSProperties = {
  flex: 1,
  height: "1px",
  backgroundColor: "#e5e7eb",
};

const separatorTextStyle: React.CSSProperties = {
  fontSize: "0.875rem",
  color: "#6b7280",
  textTransform: "uppercase",
};

const footerStyle: React.CSSProperties = {
  textAlign: "center",
  fontSize: "0.95rem",
};

const footerTextStyle: React.CSSProperties = {
  color: "#344D59",
};

const footerLinkStyle: React.CSSProperties = {
  color: "#137C8B",
  textDecoration: "none",
  fontWeight: 500,
};
