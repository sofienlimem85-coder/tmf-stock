"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "../../lib/api";
import type { Movement, Product, Technician, ProductType } from "../../lib/types";
import Sidebar from "../../components/Sidebar";

export default function MovementsPage() {
  const router = useRouter();
  const [movements, setMovements] = useState<Movement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "ENTREE" | "SORTIE">("ALL");
  const [selectedProductType, setSelectedProductType] = useState<ProductType>("TYPE1");
  const [sortBy, setSortBy] = useState<"quantity" | "createdAt">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = window.localStorage.getItem("tmf_token");
    if (!token) {
      router.push("/login");
      return;
    }
    load();
  }, [router]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [movs, prodsRes, techs] = await Promise.all([
        apiRequest<Movement[]>("/movements"),
        apiRequest<{ data: Product[] }>("/products?limit=1000"),
        apiRequest<Technician[]>("/technicians")
      ]);
      setMovements(movs);
      setProducts(Array.isArray(prodsRes) ? prodsRes : (prodsRes.data || []));
      setTechnicians(techs);
    } catch (err: any) {
      setError(err.message ?? "Impossible de charger les mouvements");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce mouvement ?")) return;
    setError(null);
    try {
      await apiRequest(`/movements/${id}`, { method: "DELETE" });
      await load();
    } catch (err: any) {
      setError(err.message ?? "Erreur lors de la suppression");
    }
  };

  const productById = new Map(products.map((p) => [p._id, p]));
  const techById = new Map(technicians.map((t) => [t._id, t]));

  const filteredMovements = movements
    .filter((movement) => {
      const product = productById.get(movement.productId);
      const technician = movement.technicianId ? techById.get(movement.technicianId) : undefined;
      
      const matchesSearch = search.trim()
        ? product?.name.toLowerCase().includes(search.toLowerCase()) ||
          technician?.name.toLowerCase().includes(search.toLowerCase()) ||
          movement.comment?.toLowerCase().includes(search.toLowerCase())
        : true;

      const matchesFilter = filterType === "ALL" || movement.type === filterType;

      const matchesProductType = product?.type === selectedProductType;

      return matchesSearch && matchesFilter && matchesProductType;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === "quantity") {
        comparison = a.quantity - b.quantity;
      } else if (sortBy === "createdAt") {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        comparison = dateA - dateB;
      }
      
      return sortOrder === "asc" ? comparison : -comparison;
    });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", { year: "numeric", month: "2-digit", day: "2-digit" });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

  const getSortButtonStyle = (field: "quantity" | "createdAt") => {
    const isActive = sortBy === field;
    return {
      ...sortButtonStyle,
      backgroundColor: isActive ? "#137C8B" : "#ffffff",
      color: isActive ? "#ffffff" : "#344D59",
      borderColor: isActive ? "#137C8B" : "#e5e7eb",
    };
  };

  return (
    <div style={layoutStyle}>
      <Sidebar />
      <main style={mainStyle}>
        <div style={contentStyle}>
          {/* Header */}
          <header style={headerStyle}>
            <div>
              <h1 style={titleStyle}>Mouvements</h1>
              <p style={subtitleStyle}>Suivez tous les mouvements d'inventaire</p>
            </div>
          </header>

          {/* Product Type Selector */}
          <div style={typeSelectorContainerStyle}>
            <label style={typeSelectorLabelStyle}>Type de Produit :</label>
            <div style={typeSelectorButtonsStyle}>
              <button
                type="button"
                className={selectedProductType === "TYPE1" ? "active" : ""}
                style={selectedProductType === "TYPE1" ? activeTypeButtonStyle : typeButtonStyle}
                onClick={() => setSelectedProductType("TYPE1")}
              >
                Type 1
              </button>
              <button
                type="button"
                className={selectedProductType === "TYPE2" ? "active" : ""}
                style={selectedProductType === "TYPE2" ? activeTypeButtonStyle : typeButtonStyle}
                onClick={() => setSelectedProductType("TYPE2")}
              >
                Type 2
              </button>
            </div>
          </div>

          {/* Search, Filter and Sort Bar */}
          <div style={toolbarStyle}>
            <div style={searchContainerStyle}>
              <SearchIcon />
              <input
                style={searchInputStyle}
                placeholder="Rechercher des mouvements..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div style={sortContainerStyle}>
              <span style={sortLabelStyle}>Trier par :</span>
              <button
                type="button"
                className="sort-button"
                style={getSortButtonStyle("createdAt")}
                onClick={() => {
                  if (sortBy === "createdAt") {
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  } else {
                    setSortBy("createdAt");
                    setSortOrder("desc");
                  }
                }}
                title="Trier par date"
              >
                <CalendarIcon />
                <span>Date</span>
                {sortBy === "createdAt" && (
                  <span style={sortIndicatorStyle}>
                    {sortOrder === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </button>
              <button
                type="button"
                className="sort-button"
                style={getSortButtonStyle("quantity")}
                onClick={() => {
                  if (sortBy === "quantity") {
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  } else {
                    setSortBy("quantity");
                    setSortOrder("desc");
                  }
                }}
                title="Trier par quantité"
              >
                <PackageIcon />
                <span>Quantité</span>
                {sortBy === "quantity" && (
                  <span style={sortIndicatorStyle}>
                    {sortOrder === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </button>
            </div>
            <button
              type="button"
              style={filterButtonStyle}
              className="filter-button"
              onClick={() => {
                if (filterType === "ALL") setFilterType("ENTREE");
                else if (filterType === "ENTREE") setFilterType("SORTIE");
                else setFilterType("ALL");
              }}
            >
              <FilterIcon />
              <span>
                {filterType === "ALL"
                  ? "Tous les Mouvements"
                  : filterType === "ENTREE"
                  ? "Entrée Stock"
                  : "Sortie Stock"}
              </span>
            </button>
          </div>

          {/* Messages */}
          {error && (
            <div style={errorStyle}>
              {error}
            </div>
          )}

          {/* Table */}
          <div style={cardStyle}>
            {loading ? (
              <div style={loadingStyle}>Chargement…</div>
            ) : filteredMovements.length === 0 ? (
              <div style={emptyStyle}>
                {search || filterType !== "ALL"
                  ? "Aucun mouvement ne correspond à vos critères."
                  : "Aucun mouvement pour le moment."}
              </div>
            ) : (
              <table style={tableStyle}>
                <thead>
                  <tr style={theadRowStyle}>
                    <th style={thStyle}>Type</th>
                    <th style={thStyle}>Article</th>
                    <th style={thStyle}>Quantité</th>
                    <th style={thStyle}>Technicien</th>
                    <th style={thStyle}>Commentaire</th>
                    <th style={thStyle}>Date</th>
                    <th style={thStyle}>Heure</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMovements.map((movement) => {
                    const product = productById.get(movement.productId);
                    const technician = movement.technicianId
                      ? techById.get(movement.technicianId)
                      : undefined;
                    const isStockIn = movement.type === "ENTREE";
                    return (
                      <tr key={movement._id} style={tbodyRowStyle} className="movement-row">
                        <td style={tdStyle}>
                          <div style={typeBadgeStyle(isStockIn)}>
                            {isStockIn ? <StockInIcon /> : <StockOutIcon />}
                            <span>{isStockIn ? "Entrée Stock" : "Sortie Stock"}</span>
                          </div>
                        </td>
                        <td style={tdStyle}>
                          <strong>{product?.name ?? "Inconnu"}</strong>
                        </td>
                        <td style={{ ...tdStyle, textAlign: "right" as const }}>
                          {movement.quantity}
                        </td>
                        <td style={tdStyle}>
                          {technician ? (
                            <span style={technicianLinkStyle}>{technician.name}</span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td style={tdStyle}>
                          {movement.comment ? (
                            <div style={commentStyle}>
                              <CommentIcon />
                              <span style={commentTextStyle}>{movement.comment}</span>
                            </div>
                          ) : (
                            <span style={noCommentStyle}>—</span>
                          )}
                        </td>
                        <td style={tdStyle}>
                          {movement.createdAt ? formatDate(movement.createdAt) : "—"}
                        </td>
                        <td style={tdStyle}>
                          {movement.createdAt ? formatTime(movement.createdAt) : "—"}
                        </td>
                        <td style={tdStyle}>
                          <button
                            type="button"
                            style={deleteIconButtonStyle}
                            className="delete-icon-button"
                            onClick={() => handleDelete(movement._id)}
                            title="Supprimer"
                          >
                            <DeleteIcon />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Icons
function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}

function StockInIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19V5M5 12l7-7 7 7" />
      <rect x="3" y="17" width="4" height="4" rx="1" />
    </svg>
  );
}

function StockOutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M19 12l-7-7-7 7" />
      <rect x="17" y="3" width="4" height="4" rx="1" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function PackageIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
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

const typeSelectorContainerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  marginBottom: "1.5rem",
  padding: "0.75rem 1rem",
  backgroundColor: "#ffffff",
  borderRadius: "0.75rem",
  border: "1px solid #e5e7eb",
  width: "fit-content",
};

const typeSelectorLabelStyle: React.CSSProperties = {
  fontSize: "0.95rem",
  fontWeight: 500,
  color: "#344D59",
};

const typeSelectorButtonsStyle: React.CSSProperties = {
  display: "flex",
  gap: "0.5rem",
};

const typeButtonStyle: React.CSSProperties = {
  padding: "0.5rem 1rem",
  borderRadius: "0.5rem",
  border: "1px solid #e5e7eb",
  backgroundColor: "#ffffff",
  color: "#344D59",
  fontSize: "0.95rem",
  fontWeight: 500,
  cursor: "pointer",
  transition: "all 0.2s",
};

const activeTypeButtonStyle: React.CSSProperties = {
  ...typeButtonStyle,
  backgroundColor: "#137C8B",
  color: "#ffffff",
  borderColor: "#137C8B",
};

const toolbarStyle: React.CSSProperties = {
  display: "flex",
  gap: "1rem",
  marginBottom: "1.5rem",
  alignItems: "center",
  flexWrap: "wrap",
};

const searchContainerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  padding: "0.75rem 1rem",
  backgroundColor: "#ffffff",
  borderRadius: "0.75rem",
  border: "1px solid #e5e7eb",
  flex: 1,
  minWidth: "300px",
};

const searchInputStyle: React.CSSProperties = {
  flex: 1,
  border: "none",
  outline: "none",
  fontSize: "0.95rem",
  color: "#344D59",
  backgroundColor: "transparent",
};

const sortContainerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  flexWrap: "wrap",
};

const sortLabelStyle: React.CSSProperties = {
  fontSize: "0.95rem",
  fontWeight: 500,
  color: "#344D59",
};

const sortButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.625rem 1rem",
  borderRadius: "0.5rem",
  border: "1px solid #e5e7eb",
  backgroundColor: "#ffffff",
  color: "#344D59",
  fontSize: "0.875rem",
  fontWeight: 500,
  cursor: "pointer",
  transition: "all 0.2s",
};

const sortIndicatorStyle: React.CSSProperties = {
  fontSize: "0.75rem",
  fontWeight: 600,
  marginLeft: "0.25rem",
};

const filterButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.75rem 1rem",
  borderRadius: "0.75rem",
  border: "1px solid #e5e7eb",
  backgroundColor: "#ffffff",
  color: "#344D59",
  fontSize: "0.95rem",
  fontWeight: 500,
  cursor: "pointer",
  transition: "all 0.2s",
};

const cardStyle: React.CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "0.75rem",
  border: "1px solid #e5e7eb",
  overflow: "hidden",
  boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
};

const theadRowStyle: React.CSSProperties = {
  backgroundColor: "#f9fafb",
};

const thStyle: React.CSSProperties = {
  padding: "1rem",
  textAlign: "left",
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "#344D59",
  borderBottom: "1px solid #e5e7eb",
};

const tbodyRowStyle: React.CSSProperties = {
  borderBottom: "1px solid #e5e7eb",
  transition: "background-color 0.2s",
};

const tdStyle: React.CSSProperties = {
  padding: "1rem",
  fontSize: "0.95rem",
  color: "#344D59",
};

const typeBadgeStyle = (isStockIn: boolean): React.CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.375rem 0.75rem",
  borderRadius: "0.5rem",
  backgroundColor: isStockIn ? "#d1fae5" : "#f3f4f6",
  color: isStockIn ? "#065f46" : "#6b7280",
  fontSize: "0.875rem",
  fontWeight: 500,
});

const technicianLinkStyle: React.CSSProperties = {
  color: "#137C8B",
  fontWeight: 500,
  cursor: "pointer",
};

const deleteIconButtonStyle: React.CSSProperties = {
  padding: "0.5rem",
  borderRadius: "0.5rem",
  border: "none",
  backgroundColor: "transparent",
  color: "#ef4444",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.2s",
};

const loadingStyle: React.CSSProperties = {
  padding: "2rem",
  textAlign: "center",
  color: "#6b7280",
};

const emptyStyle: React.CSSProperties = {
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

const commentStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: "0.5rem",
  padding: "0.5rem 0.75rem",
  backgroundColor: "#f0f9ff",
  borderRadius: "0.5rem",
  border: "1px solid #e0f2fe",
  maxWidth: "300px",
};

const commentTextStyle: React.CSSProperties = {
  fontSize: "0.875rem",
  color: "#0c4a6e",
  lineHeight: "1.4",
  flex: 1,
  wordBreak: "break-word",
};

const noCommentStyle: React.CSSProperties = {
  color: "#9ca3af",
  fontSize: "0.875rem",
};
