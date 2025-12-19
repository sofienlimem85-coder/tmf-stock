"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "../../lib/api";
import type { Technician } from "../../lib/types";
import { exportToExcel } from "../../lib/excel";
import Sidebar from "../../components/Sidebar";

type CreateTechnicianPayload = {
  name: string;
  email: string;
  team: string;
  phone?: string;
};

export default function TechniciansPage() {
  const router = useRouter();
  const [items, setItems] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState<CreateTechnicianPayload>({
    name: "",
    email: "",
    team: "",
    phone: ""
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<CreateTechnicianPayload>({
    name: "",
    email: "",
    team: "",
    phone: ""
  });

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
      const data = await apiRequest<Technician[]>("/technicians");
      setItems(data);
    } catch (err: any) {
      setError(err.message ?? "Impossible de charger les techniciens");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    setError(null);
    setSuccessMessage(null);
    try {
      const payload: CreateTechnicianPayload = {
        name: form.name.trim(),
        email: form.email.trim(),
        team: form.team.trim(),
        phone: form.phone?.trim() || undefined
      };
      await apiRequest<Technician>("/technicians", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      setSuccessMessage("Technicien créé avec succès !");
      setError(null); // Clear any previous errors
      setForm({ name: "", email: "", team: "", phone: "" });
      setShowCreateModal(false);
      await load();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message ?? "Erreur lors de la création");
    }
  };

  const handleEdit = (technician: Technician) => {
    setError(null); // Clear any previous errors
    setEditingId(technician._id);
    setEditForm({
      name: technician.name,
      email: technician.email,
      team: technician.team,
      phone: technician.phone || ""
    });
    setShowCreateModal(true);
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    setError(null);
    setSuccessMessage(null);
    try {
      const payload: CreateTechnicianPayload = {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        team: editForm.team.trim(),
        phone: editForm.phone?.trim() || undefined
      };
      await apiRequest<Technician>(`/technicians/${editingId}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      });
      setSuccessMessage("Technicien modifié avec succès !");
      setError(null); // Clear any previous errors
      setEditingId(null);
      setShowCreateModal(false);
      await load();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message ?? "Erreur lors de la modification");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce technicien ?")) return;
    setError(null);
    setSuccessMessage(null);
    try {
      await apiRequest(`/technicians/${id}`, { method: "DELETE" });
      setSuccessMessage("Technicien supprimé avec succès !");
      await load();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message ?? "Erreur lors de la suppression");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredItems = items.filter((tech) =>
    search.trim()
      ? tech.name.toLowerCase().includes(search.toLowerCase()) ||
        tech.email.toLowerCase().includes(search.toLowerCase()) ||
        tech.team.toLowerCase().includes(search.toLowerCase()) ||
        (tech.phone && tech.phone.toLowerCase().includes(search.toLowerCase()))
      : true
  );

  // Pagination pour techniciens
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  // Fonction pour exporter en Excel
  const handleExportExcel = () => {
    const exportData = filteredItems.map((tech) => ({
      "Nom": tech.name,
      "Email": tech.email,
      "Équipe": tech.team,
      "Téléphone": tech.phone || "",
      "Date de Création": tech.createdAt ? new Date(tech.createdAt).toLocaleDateString('fr-FR') : "",
    }));
    exportToExcel(exportData, `techniciens_${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div style={layoutStyle}>
      <Sidebar />
      <main style={mainStyle}>
        <div style={contentStyle}>
          {/* Header */}
          <header style={headerStyle}>
            <div>
              <h1 style={titleStyle}>Techniciens</h1>
              <p style={subtitleStyle}>Gérez les membres de votre équipe</p>
            </div>
            <button
              type="button"
              style={addButtonStyle}
              className="add-product-button"
              onClick={() => {
                setError(null); // Clear any previous errors
                setEditingId(null);
                setForm({ name: "", email: "", team: "", phone: "" });
                setShowCreateModal(true);
              }}
            >
              <PlusIcon />
              <span>Ajouter un Technicien</span>
            </button>
          </header>

          {/* Search Bar */}
          <div style={toolbarContainerStyle}>
            <div style={searchContainerStyle}>
              <SearchIcon />
              <input
                style={searchInputStyle}
                placeholder="Rechercher des techniciens..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <button
              type="button"
              style={exportButtonStyle}
              onClick={handleExportExcel}
              title="Exporter en Excel"
            >
              <ExportIcon />
              <span>Exporter Excel</span>
            </button>
          </div>

          {/* Messages - Only success messages, errors are shown in modals */}
          {successMessage && (
            <div style={successStyle}>
              {successMessage}
            </div>
          )}

          {/* Cards Grid */}
          {loading ? (
            <div style={loadingStyle}>Chargement…</div>
          ) : filteredItems.length === 0 ? (
            <div style={emptyStyle}>
              {search ? "Aucun technicien ne correspond à votre recherche." : "Aucun technicien pour le moment."}
            </div>
          ) : (
            <>
              <div style={cardsGridStyle}>
                {paginatedItems.map((technician) => (
                <div key={technician._id} style={cardStyle} className="technician-card">
                  {/* Card Header */}
                  <div style={cardHeaderStyle}>
                    <div style={avatarStyle}>
                      {getInitials(technician.name)}
                    </div>
                    <span style={activeBadgeStyle}>Actif</span>
                  </div>

                  {/* Card Body */}
                  <div style={cardBodyStyle}>
                    <h3 style={cardNameStyle}>{technician.name}</h3>
                    <p style={cardRoleStyle}>{technician.team}</p>

                    <div style={contactInfoStyle}>
                      <div style={contactItemStyle}>
                        <EmailIcon />
                        <span style={contactTextStyle}>{technician.email}</span>
                      </div>
                      {technician.phone && (
                        <div style={contactItemStyle}>
                          <PhoneIcon />
                          <span style={contactTextStyle}>{technician.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div style={cardFooterStyle}>
                    <button
                      type="button"
                      style={editButtonStyle}
                      className="edit-technician-button"
                      onClick={() => handleEdit(technician)}
                    >
                      <EditIcon />
                      <span>Modifier</span>
                    </button>
                    <button
                      type="button"
                      style={deleteIconButtonStyle}
                      className="delete-icon-button"
                      onClick={() => handleDelete(technician._id)}
                      title="Supprimer"
                    >
                      <DeleteIcon />
                    </button>
                  </div>
                </div>
                ))}
              </div>
              {/* Pagination */}
              {totalPages > 1 && (
                <div style={paginationStyle}>
                  <button
                    style={paginationButtonStyle}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Précédent
                  </button>
                  <span style={paginationInfoStyle}>
                    Page {currentPage} / {totalPages}
                  </span>
                  <button
                    style={paginationButtonStyle}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Suivant
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div style={modalOverlay} onClick={() => {
          setShowCreateModal(false);
          setEditingId(null);
          setError(null); // Clear error when closing modal
        }}>
          <div style={modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeader}>
              <h3 style={modalTitle}>
                {editingId ? "Modifier le Technicien" : "Ajouter un Technicien"}
              </h3>
              <button
                type="button"
                style={closeButton}
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingId(null);
                  setError(null); // Clear error when closing modal
                }}
              >
                ×
              </button>
            </div>
            <div style={modalBody}>
              {/* Error message in modal */}
              {error && (
                <div style={modalErrorStyle}>
                  {error}
                </div>
              )}
              <label style={labelStyle}>
                <span>Nom Complet *</span>
                <input
                  style={inputStyle}
                  placeholder="Entrez le nom complet"
                  value={editingId ? editForm.name : form.name}
                  onChange={(e) =>
                    editingId
                      ? setEditForm({ ...editForm, name: e.target.value })
                      : setForm({ ...form, name: e.target.value })
                  }
                />
              </label>
              <label style={labelStyle}>
                <span>Email *</span>
                <input
                  style={inputStyle}
                  type="email"
                  placeholder="Entrez l'adresse email"
                  value={editingId ? editForm.email : form.email}
                  onChange={(e) =>
                    editingId
                      ? setEditForm({ ...editForm, email: e.target.value })
                      : setForm({ ...form, email: e.target.value })
                  }
                />
              </label>
              <label style={labelStyle}>
                <span>Équipe / Spécialité *</span>
                <input
                  style={inputStyle}
                  placeholder="Entrez l'équipe ou la spécialité (ex: Maintenance, Électrique)"
                  value={editingId ? editForm.team : form.team}
                  onChange={(e) =>
                    editingId
                      ? setEditForm({ ...editForm, team: e.target.value })
                      : setForm({ ...form, team: e.target.value })
                  }
                />
              </label>
              <label style={labelStyle}>
                <span>Numéro de Téléphone (optionnel)</span>
                <input
                  style={inputStyle}
                  type="tel"
                  placeholder="Entrez le numéro de téléphone"
                  value={editingId ? editForm.phone || "" : form.phone || ""}
                  onChange={(e) =>
                    editingId
                      ? setEditForm({ ...editForm, phone: e.target.value })
                      : setForm({ ...form, phone: e.target.value })
                  }
                />
              </label>
            </div>
            <div style={modalFooter}>
              <button
                type="button"
                style={secondaryButton}
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingId(null);
                  setError(null); // Clear error when canceling
                }}
              >
                Annuler
              </button>
              <button
                type="button"
                style={primaryButton}
                onClick={editingId ? handleUpdate : handleCreate}
              >
                {editingId ? "Mettre à jour" : "Créer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Icons
function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
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

function EmailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function ExportIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
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
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
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

const addButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.625rem 1.25rem",
  borderRadius: "0.75rem",
  border: "none",
  backgroundColor: "#137C8B",
  color: "#ffffff",
  fontSize: "0.95rem",
  fontWeight: 500,
  cursor: "pointer",
  transition: "all 0.2s",
};

const toolbarContainerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  marginBottom: "1.5rem",
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
  width: "100%",
  maxWidth: "500px",
};

const exportButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.625rem 1rem",
  borderRadius: "0.5rem",
  border: "1px solid #10b981",
  backgroundColor: "#10b981",
  color: "#ffffff",
  fontSize: "0.875rem",
  fontWeight: 500,
  cursor: "pointer",
  transition: "all 0.2s",
};

const searchInputStyle: React.CSSProperties = {
  flex: 1,
  border: "none",
  outline: "none",
  fontSize: "0.95rem",
  color: "#344D59",
  backgroundColor: "transparent",
};

const cardsGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
  gap: "1.5rem",
};

const cardStyle: React.CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "0.75rem",
  border: "1px solid #e5e7eb",
  padding: "1.5rem",
  display: "flex",
  flexDirection: "column",
  boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
  transition: "all 0.2s",
};

const cardHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: "1rem",
};

const avatarStyle: React.CSSProperties = {
  width: "48px",
  height: "48px",
  borderRadius: "50%",
  backgroundColor: "#d1fae5",
  color: "#137C8B",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "1.125rem",
  fontWeight: 600,
};

const activeBadgeStyle: React.CSSProperties = {
  padding: "0.25rem 0.75rem",
  borderRadius: "999px",
  fontSize: "0.875rem",
  fontWeight: 500,
  backgroundColor: "#d1fae5",
  color: "#065f46",
};

const cardBodyStyle: React.CSSProperties = {
  flex: 1,
  marginBottom: "1rem",
};

const cardNameStyle: React.CSSProperties = {
  fontSize: "1.125rem",
  fontWeight: 600,
  color: "#344D59",
  margin: 0,
  marginBottom: "0.25rem",
};

const cardRoleStyle: React.CSSProperties = {
  fontSize: "0.95rem",
  color: "#6b7280",
  margin: 0,
  marginBottom: "1rem",
};

const contactInfoStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
  paddingTop: "1rem",
  borderTop: "1px solid #e5e7eb",
};

const contactItemStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
};

const contactTextStyle: React.CSSProperties = {
  fontSize: "0.875rem",
  color: "#344D59",
};

const cardFooterStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "0.5rem",
  paddingTop: "1rem",
  borderTop: "1px solid #e5e7eb",
};

const editButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.5rem 1rem",
  borderRadius: "0.5rem",
  border: "none",
  backgroundColor: "#f0f9fa",
  color: "#137C8B",
  fontSize: "0.875rem",
  fontWeight: 500,
  cursor: "pointer",
  transition: "all 0.2s",
  flex: 1,
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

const successStyle: React.CSSProperties = {
  padding: "0.75rem 1rem",
  borderRadius: "0.5rem",
  backgroundColor: "#d1fae5",
  color: "#065f46",
  fontSize: "0.95rem",
  marginBottom: "1rem",
};

const errorStyle: React.CSSProperties = {
  padding: "0.75rem 1rem",
  borderRadius: "0.5rem",
  backgroundColor: "#fee2e2",
  color: "#991b1b",
  fontSize: "0.95rem",
  marginBottom: "1rem",
};

const modalOverlay: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
  padding: "1rem",
};

const modalContent: React.CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "0.75rem",
  padding: "1.5rem",
  maxWidth: "500px",
  width: "100%",
  maxHeight: "90vh",
  overflowY: "auto",
  boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
};

const modalHeader: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "1.5rem",
};

const modalTitle: React.CSSProperties = {
  fontSize: "1.25rem",
  fontWeight: 600,
  color: "#344D59",
  margin: 0,
};

const modalBody: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  marginBottom: "1.5rem",
};

const modalFooter: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "0.5rem",
};

const labelStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
};

const inputStyle: React.CSSProperties = {
  padding: "0.625rem 0.875rem",
  borderRadius: "0.5rem",
  border: "1px solid #e5e7eb",
  backgroundColor: "#ffffff",
  color: "#344D59",
  fontSize: "0.95rem",
};

const primaryButton: React.CSSProperties = {
  padding: "0.625rem 1.25rem",
  borderRadius: "0.5rem",
  border: "none",
  backgroundColor: "#137C8B",
  color: "#ffffff",
  fontSize: "0.95rem",
  fontWeight: 500,
  cursor: "pointer",
};

const secondaryButton: React.CSSProperties = {
  padding: "0.625rem 1.25rem",
  borderRadius: "0.5rem",
  border: "1px solid #e5e7eb",
  backgroundColor: "transparent",
  color: "#344D59",
  fontSize: "0.95rem",
  fontWeight: 500,
  cursor: "pointer",
};

const closeButton: React.CSSProperties = {
  padding: 0,
  width: "32px",
  height: "32px",
  borderRadius: "0.5rem",
  border: "none",
  backgroundColor: "transparent",
  color: "#6b7280",
  fontSize: "1.5rem",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const modalErrorStyle: React.CSSProperties = {
  padding: "0.75rem 1rem",
  borderRadius: "0.5rem",
  backgroundColor: "#fee2e2",
  color: "#991b1b",
  fontSize: "0.875rem",
  marginBottom: "1rem",
  border: "1px solid #fecaca",
};

const paginationStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "1rem",
  marginTop: "2rem",
  padding: "1rem",
};

const paginationButtonStyle: React.CSSProperties = {
  padding: "0.5rem 1rem",
  borderRadius: "0.5rem",
  border: "1px solid #e5e7eb",
  backgroundColor: "#ffffff",
  color: "#344D59",
  fontSize: "0.875rem",
  fontWeight: 500,
  cursor: "pointer",
  transition: "all 0.2s",
};

const paginationInfoStyle: React.CSSProperties = {
  fontSize: "0.875rem",
  color: "#6b7280",
  fontWeight: 500,
};
