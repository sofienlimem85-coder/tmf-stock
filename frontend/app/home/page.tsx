"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "../../lib/api";
import type { Product, Technician, Movement, ToolLoan } from "../../lib/types";
import Sidebar from "../../components/Sidebar";

type DashboardStats = {
  totalProducts: number;
  activeTechnicians: number;
  todayMovements: number;
  activeLoans: number;
};

export default function HomePage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    activeTechnicians: 0,
    todayMovements: 0,
    activeLoans: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = window.localStorage.getItem("tmf_token");
    if (!token) {
      router.push("/login");
      return;
    }
    loadStats();
  }, [router]);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const [productsRes, technicians, movements, toolLoans] = await Promise.all([
        apiRequest<{ data: Product[]; total: number }>("/products?limit=1"),
        apiRequest<Technician[]>("/technicians"),
        apiRequest<Movement[]>("/movements"),
        apiRequest<ToolLoan[]>("/tool-loans"),
      ]);

      const totalProducts = Array.isArray(productsRes) ? productsRes.length : productsRes.total;
      const activeTechnicians = technicians.length;

      // Count today's movements
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayMovements = movements.filter((mov) => {
        const movDate = new Date(mov.createdAt || "");
        movDate.setHours(0, 0, 0, 0);
        return movDate.getTime() === today.getTime();
      }).length;

      // Count active loans (EN_COURS status)
      const activeLoans = toolLoans.filter(
        (loan) => loan.status === "EN_COURS"
      ).length;

      setStats({
        totalProducts,
        activeTechnicians,
        todayMovements,
        activeLoans,
      });
    } catch (err: any) {
      setError(err.message ?? "Impossible de charger les statistiques");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={layoutStyle}>
      <Sidebar />
      <main style={mainStyle}>
        <div style={contentStyle}>
          {/* Header */}
          <header style={headerStyle}>
            <div>
              <h1 style={titleStyle}>Tableau de Bord</h1>
              <p style={subtitleStyle}>Bienvenue dans votre système de gestion de stock</p>
            </div>
          </header>

          {/* Messages */}
          {error && (
            <div style={errorStyle}>
              {error}
            </div>
          )}

          {/* Metric Cards - Vertical Layout */}
          {loading ? (
            <div style={loadingStyle}>Chargement des statistiques…</div>
          ) : (
            <div style={cardsContainerStyle}>
              <MetricCard
                icon={<ProductsIcon />}
                title="Total Produits"
                value={stats.totalProducts.toLocaleString()}
                iconBgColor="#137C8B"
              />
              <MetricCard
                icon={<TechniciansIcon />}
                title="Techniciens Actifs"
                value={stats.activeTechnicians.toLocaleString()}
                iconBgColor="#60a5fa"
              />
              <MetricCard
                icon={<MovementsIcon />}
                title="Mouvements Aujourd'hui"
                value={stats.todayMovements.toLocaleString()}
                iconBgColor="#60a5fa"
              />
              <MetricCard
                icon={<LoansIcon />}
                title="Prêts Actifs"
                value={stats.activeLoans.toLocaleString()}
                iconBgColor="#60a5fa"
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Metric Card Component
function MetricCard({
  icon,
  title,
  value,
  iconBgColor,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  iconBgColor: string;
}) {
  return (
    <div style={cardStyle} className="metric-card">
      <div style={cardIconStyle(iconBgColor)}>{icon}</div>
      <div style={cardContentStyle}>
        <p style={cardTitleStyle}>{title}</p>
        <p style={cardValueStyle}>{value}</p>
      </div>
    </div>
  );
}

// Icons
function ProductsIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

function TechniciansIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function MovementsIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function LoansIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

// Styles
const layoutStyle: React.CSSProperties = {
  display: "flex",
  minHeight: "100vh",
  backgroundColor: "#F8FAFB",
};

const mainStyle: React.CSSProperties = {
  flex: 1,
  marginLeft: "260px",
  padding: "2rem",
};

const contentStyle: React.CSSProperties = {
  maxWidth: "1400px",
  margin: "0 auto",
};

const headerStyle: React.CSSProperties = {
  marginBottom: "1.5rem",
};

const titleStyle: React.CSSProperties = {
  fontSize: "2rem",
  fontWeight: 600,
  color: "#344D59",
  margin: 0,
  marginBottom: "0.25rem",
};

const subtitleStyle: React.CSSProperties = {
  fontSize: "0.95rem",
  color: "#6b7280",
  margin: 0,
};

const cardsContainerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  maxWidth: "400px",
};

const cardStyle: React.CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "0.75rem",
  border: "1px solid #e5e7eb",
  padding: "1.5rem",
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
  transition: "all 0.2s",
};

const cardIconStyle = (bgColor: string): React.CSSProperties => ({
  width: "56px",
  height: "56px",
  borderRadius: "0.75rem",
  backgroundColor: bgColor,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
});

const cardContentStyle: React.CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",
};

const cardTitleStyle: React.CSSProperties = {
  fontSize: "0.875rem",
  color: "#6b7280",
  margin: 0,
  fontWeight: 500,
};

const cardValueStyle: React.CSSProperties = {
  fontSize: "1.875rem",
  fontWeight: 600,
  color: "#344D59",
  margin: 0,
};

const loadingStyle: React.CSSProperties = {
  padding: "2rem",
  textAlign: "center",
  color: "#6b7280",
};

const errorStyle: React.CSSProperties = {
  padding: "0.75rem 1rem",
  borderRadius: "0.5rem",
  backgroundColor: "#fee2e2",
  color: "#991b1b",
  fontSize: "0.95rem",
  marginBottom: "1rem",
};
