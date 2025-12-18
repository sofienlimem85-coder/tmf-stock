"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("tmf_token");
    }
    router.push("/login");
  };

  const navItems = [
    { href: "/home", label: "Accueil", icon: HomeIcon },
    { href: "/products", label: "Produits", icon: BoxIcon },
    { href: "/technicians", label: "Techniciens", icon: UsersIcon },
    { href: "/movements", label: "Mouvements", icon: ChartIcon },
  ];

  return (
    <aside style={sidebarStyle}>
      <div style={sidebarHeader}>
        <h2 style={sidebarTitle}>Gestion de Stock</h2>
      </div>
      <nav style={navStyle}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={isActive ? activeNavItemStyle : navItemStyle}
              className={!isActive ? "nav-item" : ""}
            >
              <Icon />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div style={logoutContainer}>
        <button type="button" onClick={handleLogout} style={logoutButton} className="logout-button">
          <LogoutIcon />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}

// Icons
function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function BoxIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function WrenchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

const sidebarStyle: React.CSSProperties = {
  width: "260px",
  height: "100vh",
  backgroundColor: "#ffffff",
  display: "flex",
  flexDirection: "column",
  borderRight: "1px solid #e5e7eb",
  position: "fixed",
  left: 0,
  top: 0,
};

const sidebarHeader: React.CSSProperties = {
  padding: "1.5rem 1.25rem",
  borderBottom: "1px solid #e5e7eb",
};

const sidebarTitle: React.CSSProperties = {
  fontSize: "1.25rem",
  fontWeight: 600,
  color: "#137C8B",
  margin: 0,
};

const navStyle: React.CSSProperties = {
  flex: 1,
  padding: "0.75rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",
};

const navItemStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  padding: "0.75rem 1rem",
  borderRadius: "0.5rem",
  color: "#344D59",
  textDecoration: "none",
  fontSize: "0.95rem",
  transition: "all 0.2s",
};

const activeNavItemStyle: React.CSSProperties = {
  ...navItemStyle,
  backgroundColor: "#137C8B",
  color: "#ffffff",
};

const logoutContainer: React.CSSProperties = {
  padding: "1rem",
  borderTop: "1px solid #e5e7eb",
};

const logoutButton: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  width: "100%",
  padding: "0.75rem 1rem",
  borderRadius: "0.5rem",
  border: "none",
  backgroundColor: "transparent",
  color: "#344D59",
  cursor: "pointer",
  fontSize: "0.95rem",
  transition: "all 0.2s",
};

