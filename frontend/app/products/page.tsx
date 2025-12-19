"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "../../lib/api";
import type { Product, Technician, Movement, ProductType } from "../../lib/types";
import { getProductTypeLabel } from "../../lib/types";
import Sidebar from "../../components/Sidebar";

type CreateProductPayload = {
  name: string;
  quantity: number;
  invoiceNumber?: string;
  invoiceAttachment?: string;
  comment?: string;
  type: ProductType;
};

type ProductsResponse = {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
};

export default function ProductsPage() {
  const router = useRouter();
  const [response, setResponse] = useState<ProductsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [selectedProductType, setSelectedProductType] = useState<ProductType>("TYPE1");
  const [search, setSearch] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState<string>("");
  const [filterDateTo, setFilterDateTo] = useState<string>("");
  const [sortBy, setSortBy] = useState<"name" | "quantity" | "createdAt">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const limit = 20;

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState<CreateProductPayload>({
    name: "",
    quantity: 0,
    invoiceNumber: "",
    invoiceAttachment: "",
    comment: "",
    type: "TYPE1"
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<CreateProductPayload>({
    name: "",
    quantity: 0,
    invoiceNumber: "",
    invoiceAttachment: "",
    comment: "",
    type: "TYPE1"
  });

  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [assigningProductId, setAssigningProductId] = useState<string | null>(null);
  const [assignForm, setAssignForm] = useState({
    technicianId: "",
    quantity: 1,
    date: new Date().toISOString().split("T")[0],
    comment: ""
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = window.localStorage.getItem("tmf_token");
    if (!token) {
      router.push("/login");
      return;
    }
    load();
    loadTechnicians();
    loadMovements();
  }, [router, search, sortBy, sortOrder, page, selectedProductType]);

  // Fermer le modal d'image avec la touche ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && viewingImage) {
        setViewingImage(null);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [viewingImage]);

  const loadTechnicians = async () => {
    try {
      const data = await apiRequest<Technician[]>("/technicians");
      setTechnicians(data);
    } catch (err: any) {
      console.error("Erreur lors du chargement des techniciens:", err);
    }
  };

  const loadMovements = async () => {
    try {
      const data = await apiRequest<Movement[]>("/movements");
      setMovements(data);
    } catch (err: any) {
      console.error("Erreur lors du chargement des mouvements:", err);
    }
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
        type: selectedProductType,
      });
      if (search.trim()) {
        params.append("search", search.trim());
      }
      const data = await apiRequest<ProductsResponse>(`/products?${params.toString()}`);
      setResponse(data);
    } catch (err: any) {
      setError(err.message ?? "Impossible de charger les produits");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setForm((prev) => ({ ...prev, invoiceAttachment: "" }));
      return;
    }
    if (!file.type.startsWith("image/") && !file.type.includes("pdf")) {
      setError("Le fichier doit être une image (JPG, PNG) ou un PDF.");
      return;
    }
    
    // Vérifier la taille du fichier (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("Le fichier est trop volumineux. Taille maximale : 10MB.");
      return;
    }

    setError(null);
    setUploadingImage(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Image = reader.result as string;
      try {
        // Upload vers Cloudinary
        const response = await apiRequest<{ url: string }>("/cloudinary/upload", {
          method: "POST",
          body: JSON.stringify({ image: base64Image, folder: "tmf-stock/invoices" }),
        });
        // Enregistrer l'URL Cloudinary dans le formulaire
        setForm((prev) => ({
          ...prev,
          invoiceAttachment: response.url,
        }));
      } catch (err: any) {
        setError(err.message ?? "Erreur lors de l'upload de l'image");
        setForm((prev) => ({ ...prev, invoiceAttachment: "" }));
      } finally {
        setUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreate = async () => {
    setError(null);
    setSuccessMessage(null);
    try {
      const payload: CreateProductPayload = {
        name: form.name.trim(),
        quantity: form.quantity,
        invoiceNumber: form.invoiceNumber?.trim() || undefined,
        invoiceAttachment: form.invoiceAttachment || undefined,
        comment: form.comment?.trim() || undefined,
        type: form.type,
      };
      await apiRequest<Product>("/products", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setSuccessMessage("Produit créé avec succès !");
      setError(null); // Clear any previous errors
      // Mettre à jour le type sélectionné pour afficher les produits du type créé
      setSelectedProductType(form.type);
      setForm({
        name: "",
        quantity: 0,
        invoiceNumber: "",
        invoiceAttachment: "",
        comment: "",
        type: "TYPE1"
      });
      setShowCreateModal(false);
      setPage(1);
      await load();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message ?? "Erreur lors de la création");
    }
  };

  const handleEdit = (product: Product) => {
    setError(null); // Clear any previous errors
    setEditingId(product._id);
    setEditForm({
      name: product.name,
      quantity: product.quantity,
      invoiceNumber: product.invoiceNumber || "",
      invoiceAttachment: product.invoiceAttachment || "",
      comment: "",
      type: product.type
    });
    setShowCreateModal(true);
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    setError(null);
    setSuccessMessage(null);
    try {
      const payload: CreateProductPayload = {
        name: editForm.name.trim(),
        quantity: editForm.quantity,
        invoiceNumber: editForm.invoiceNumber?.trim() || undefined,
        invoiceAttachment: editForm.invoiceAttachment || undefined,
        type: editForm.type,
      };
      await apiRequest<Product>(`/products/${editingId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      setSuccessMessage("Produit modifié avec succès !");
      setError(null); // Clear any previous errors
      // Mettre à jour le type sélectionné si le type a changé
      setSelectedProductType(editForm.type);
      setEditingId(null);
      setShowCreateModal(false);
      setPage(1);
      await load();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message ?? "Erreur lors de la modification");
    }
  };

  const handleAssign = (product: Product) => {
    setError(null); // Clear any previous errors
    if (product.quantity <= 0) {
      setError("Impossible d'affecter : stock vide");
      return;
    }
    setAssigningProductId(product._id);
    setAssignForm({
      technicianId: "",
      quantity: 1,
      date: new Date().toISOString().split("T")[0],
      comment: ""
    });
  };

  const handleAssignSubmit = async () => {
    if (!assigningProductId) return;
    setError(null);
    setSuccessMessage(null);
    try {
      const payload = {
        productId: assigningProductId,
        technicianId: assignForm.technicianId || undefined,
        quantity: assignForm.quantity,
        type: "SORTIE" as const,
        comment: assignForm.comment?.trim() || undefined,
      };
      await apiRequest<Movement>("/movements", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setSuccessMessage("Produit affecté avec succès !");
      setAssigningProductId(null);
      await load();
      await loadMovements(); // Recharger les mouvements pour mettre à jour la quantité disponible
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message ?? "Erreur lors de l'affectation");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) return;
    setError(null);
    setSuccessMessage(null);
    try {
      await apiRequest(`/products/${id}`, { method: "DELETE" });
      setSuccessMessage("Produit supprimé avec succès !");
      await load();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message ?? "Erreur lors de la suppression");
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "disponible") {
      return { label: "Disponible", style: availableBadgeStyle };
    }
    return { label: "Stock Vide", style: outOfStockBadgeStyle };
  };

  const getSortButtonStyle = (field: "name" | "quantity" | "createdAt") => {
    const isActive = sortBy === field;
    return {
      ...sortButtonStyle,
      backgroundColor: isActive ? "#137C8B" : "#ffffff",
      color: isActive ? "#ffffff" : "#344D59",
      borderColor: isActive ? "#137C8B" : "#e5e7eb",
    };
  };

  // Filtrer par plage de dates si des dates sont sélectionnées
  const filteredItems = (response?.data || []).filter((product) => {
    if (!filterDateFrom && !filterDateTo) return true;
    if (!product.createdAt) return false;
    const productDate = new Date(product.createdAt).toISOString().split('T')[0];
    const dateFrom = filterDateFrom || '1900-01-01';
    const dateTo = filterDateTo || '9999-12-31';
    return productDate >= dateFrom && productDate <= dateTo;
  });

  const items = filteredItems;

  // Calculer la quantité prêtée pour chaque produit
  const getLoanedQuantity = (productId: string): number => {
    return movements
      .filter(m => 
        m.productId === productId && 
        m.type === "SORTIE" && 
        (!m.loanStatus || m.loanStatus === "PRETE")
      )
      .reduce((sum, m) => sum + m.quantity, 0);
  };

  return (
    <div style={layoutStyle}>
      <Sidebar />
      <main style={mainStyle}>
        <div style={contentStyle}>
          {/* Header */}
          <header style={headerStyle}>
            <div>
              <h1 style={titleStyle}>Produits</h1>
              <p style={subtitleStyle}>Gérez votre inventaire d'outils</p>
            </div>
            <button
              type="button"
              style={addButtonStyle}
              className="add-product-button"
              onClick={() => {
                setError(null); // Clear any previous errors
                setEditingId(null);
                setForm({ name: "", quantity: 0, invoiceNumber: "", invoiceAttachment: "", type: "TYPE1" });
                setShowCreateModal(true);
              }}
            >
              <PlusIcon />
              <span>Ajouter un Produit</span>
            </button>
          </header>

          {/* Product Type Selector */}
          <div style={typeSelectorContainerStyle}>
            <label style={typeSelectorLabelStyle}>Catégorie :</label>
            <div style={typeSelectorButtonsStyle}>
              <button
                type="button"
                className={selectedProductType === "TYPE1" ? "active" : ""}
                style={selectedProductType === "TYPE1" ? activeTypeButtonStyle : typeButtonStyle}
                onClick={() => {
                  setSelectedProductType("TYPE1");
                  setPage(1);
                }}
              >
                {getProductTypeLabel("TYPE1")}
              </button>
              <button
                type="button"
                className={selectedProductType === "TYPE2" ? "active" : ""}
                style={selectedProductType === "TYPE2" ? activeTypeButtonStyle : typeButtonStyle}
                onClick={() => {
                  setSelectedProductType("TYPE2");
                  setPage(1);
                }}
              >
                {getProductTypeLabel("TYPE2")}
              </button>
            </div>
          </div>

          {/* Search and Sort Bar */}
          <div style={toolbarContainerStyle}>
            <div style={searchContainerStyle}>
              <SearchIcon />
              <input
                style={searchInputStyle}
                placeholder="Rechercher des produits..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div style={sortContainerStyle}>
              <div style={dateRangeContainerStyle}>
                <span style={sortLabelStyle}>Période :</span>
                <div style={dateRangeInputsStyle}>
                  <div style={dateInputWrapperStyle}>
                    <label style={dateInputLabelStyle}>Du</label>
                    <input
                      type="date"
                      style={dateInputStyle}
                      value={filterDateFrom}
                      onChange={(e) => {
                        setFilterDateFrom(e.target.value);
                        setPage(1);
                      }}
                      max={filterDateTo || undefined}
                      title="Date de début"
                    />
                  </div>
                  <div style={dateInputWrapperStyle}>
                    <label style={dateInputLabelStyle}>Au</label>
                    <input
                      type="date"
                      style={dateInputStyle}
                      value={filterDateTo}
                      onChange={(e) => {
                        setFilterDateTo(e.target.value);
                        setPage(1);
                      }}
                      min={filterDateFrom || undefined}
                      title="Date de fin"
                    />
                  </div>
                </div>
                {(filterDateFrom || filterDateTo) && (
                  <button
                    type="button"
                    style={clearDateButtonStyle}
                    onClick={() => {
                      setFilterDateFrom("");
                      setFilterDateTo("");
                      setPage(1);
                    }}
                    title="Effacer le filtre de date"
                  >
                    ×
                  </button>
                )}
              </div>
              <span style={sortLabelStyle}>Trier par :</span>
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
                  setPage(1);
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
          </div>

          {/* Messages - Only success messages, errors are shown in modals */}
          {successMessage && (
            <div style={successStyle}>
              {successMessage}
            </div>
          )}

          {/* Table */}
          <div style={cardStyle}>
            {loading ? (
              <div style={loadingStyle}>Chargement…</div>
            ) : items.length === 0 ? (
              <div style={emptyStyle}>Aucun produit pour le moment.</div>
            ) : (
              <table style={tableStyle}>
                <thead>
                  <tr style={theadRowStyle}>
                    <th style={thStyle}>Nom du Produit</th>
                    <th style={thStyle}>Quantité Totale</th>
                    <th style={thStyle}>Quantité Disponible</th>
                    <th style={thStyle}>Statut</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((product) => {
                    const statusBadge = getStatusBadge(product.status);
                    return (
                      <tr key={product._id} style={tbodyRowStyle}>
                        <td style={tdStyle}>{product.name}</td>
                        <td style={{ ...tdStyle, textAlign: "right" as const }}>{product.quantity}</td>
                        <td style={{ ...tdStyle, textAlign: "right" as const }}>
                          {(() => {
                            const loanedQty = getLoanedQuantity(product._id);
                            const availableQty = product.quantity - loanedQty;
                            return (
                              <span style={availableQty <= 0 ? { color: "#ef4444", fontWeight: 500 } : {}}>
                                {availableQty}
                              </span>
                            );
                          })()}
                        </td>
                        <td style={tdStyle}>
                          <span style={statusBadge.style}>{statusBadge.label}</span>
                        </td>
                        <td style={tdStyle}>
                          <div style={actionsStyle}>
                            <button
                              type="button"
                              style={iconButtonStyle}
                              className="icon-button"
                              onClick={() => handleEdit(product)}
                              title="Modifier"
                            >
                              <EditIcon />
                            </button>
                            <button
                              type="button"
                              style={assignIconButtonStyle}
                              className="assign-icon-button"
                              onClick={() => handleAssign(product)}
                              disabled={product.quantity <= 0}
                              title="Affecter"
                            >
                              <AssignIcon />
                            </button>
                            <button
                              type="button"
                              style={deleteIconButtonStyle}
                              className="delete-icon-button"
                              onClick={() => handleDelete(product._id)}
                              title="Supprimer"
                            >
                              <DeleteIcon />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {response && response.total > limit && (
            <div style={paginationStyle}>
              <button
                style={paginationButtonStyle}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <span style={paginationInfoStyle}>
                Page {response.page} / {Math.ceil(response.total / limit)}
              </span>
              <button
                style={paginationButtonStyle}
                onClick={() => setPage((p) => p + 1)}
                disabled={!response.hasNextPage}
              >
                Next
              </button>
            </div>
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
                {editingId ? "Modifier le Produit" : "Ajouter un Produit"}
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
                <span>Catégorie *</span>
                <select
                  style={inputStyle}
                  value={editingId ? editForm.type : form.type}
                  onChange={(e) =>
                    editingId
                      ? setEditForm({ ...editForm, type: e.target.value as ProductType })
                      : setForm({ ...form, type: e.target.value as ProductType })
                  }
                  required
                >
                  <option value="TYPE1">{getProductTypeLabel("TYPE1")}</option>
                  <option value="TYPE2">{getProductTypeLabel("TYPE2")}</option>
                </select>
              </label>
              <label style={labelStyle}>
                <span>Nom du Produit *</span>
                <input
                  style={inputStyle}
                  placeholder="Entrez le nom du produit"
                  value={editingId ? editForm.name : form.name}
                  onChange={(e) =>
                    editingId
                      ? setEditForm({ ...editForm, name: e.target.value })
                      : setForm({ ...form, name: e.target.value })
                  }
                />
              </label>
              <label style={labelStyle}>
                <span>Quantité *</span>
                <input
                  style={inputStyle}
                  type="number"
                  min={0}
                  placeholder="Entrez la quantité"
                  value={editingId ? editForm.quantity : form.quantity}
                  onChange={(e) =>
                    editingId
                      ? setEditForm({ ...editForm, quantity: Number(e.target.value) })
                      : setForm({ ...form, quantity: Number(e.target.value) })
                  }
                />
              </label>
              <label style={labelStyle}>
                <span>Numéro de Facture (optionnel)</span>
                <input
                  style={inputStyle}
                  placeholder="Entrez le numéro de facture"
                  value={editingId ? editForm.invoiceNumber : form.invoiceNumber}
                  onChange={(e) =>
                    editingId
                      ? setEditForm({ ...editForm, invoiceNumber: e.target.value })
                      : setForm({ ...form, invoiceNumber: e.target.value })
                  }
                />
              </label>
              <div style={fileUploadContainer}>
                <label style={fileUploadLabel}>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    disabled={!!editingId}
                    style={{ display: "none" }}
                  />
                  <div style={fileUploadButton} className="file-upload-button">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span>
                      {uploadingImage 
                        ? "Upload en cours..." 
                        : form.invoiceAttachment 
                          ? (form.invoiceAttachment.includes('cloudinary') || form.invoiceAttachment.startsWith('http') 
                              ? "Image uploadée ✅" 
                              : "Fichier joint ✅") 
                          : "Joindre facture"}
                    </span>
                  </div>
                </label>
                {!editingId && form.invoiceAttachment && (
                  <button
                    type="button"
                    style={removeFileButton}
                    onClick={() => setForm({ ...form, invoiceAttachment: "" })}
                    title="Retirer le fichier"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>
              <label style={labelStyle}>
                <span>Commentaire (optionnel)</span>
                <textarea
                  style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
                  placeholder="Commentaire sur cet ajout de stock..."
                  value={editingId ? editForm.comment : form.comment}
                  onChange={(e) =>
                    editingId
                      ? setEditForm({ ...editForm, comment: e.target.value })
                      : setForm({ ...form, comment: e.target.value })
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

      {/* Image View Modal */}
      {viewingImage && (
        <div 
          style={imageModalOverlay} 
          onClick={() => setViewingImage(null)}
        >
          <div style={imageModalContent} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="image-modal-close-button"
              style={imageModalCloseButton}
              onClick={() => setViewingImage(null)}
              title="Fermer (ESC)"
            >
              <CloseIcon />
            </button>
            <img 
              src={viewingImage} 
              alt="Facture agrandie" 
              style={imageModalImage}
            />
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {assigningProductId && (
        <div style={modalOverlay} onClick={() => {
          setAssigningProductId(null);
          setError(null); // Clear error when closing modal
        }}>
          <div style={modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeader}>
              <h3 style={modalTitle}>Affecter un Produit à un Technicien</h3>
              <button
                type="button"
                style={closeButton}
                onClick={() => {
                  setAssigningProductId(null);
                  setError(null); // Clear error when closing modal
                }}
              >
                ×
              </button>
            </div>
            <div style={modalBody}>
              {/* Error message in assign modal */}
              {error && (
                <div style={modalErrorStyle}>
                  {error}
                </div>
              )}
              <label style={labelStyle}>
                <span>Technicien *</span>
                <select
                  style={inputStyle}
                  value={assignForm.technicianId}
                  onChange={(e) =>
                    setAssignForm({ ...assignForm, technicianId: e.target.value })
                  }
                  required
                >
                  <option value="">Sélectionner un technicien</option>
                  {technicians.map((tech) => (
                    <option key={tech._id} value={tech._id}>
                      {tech.name} ({tech.team})
                    </option>
                  ))}
                </select>
              </label>
              <label style={labelStyle}>
                <span>Quantité *</span>
                <input
                  style={inputStyle}
                  type="number"
                  min={1}
                  max={items.find((p) => p._id === assigningProductId)?.quantity || 1}
                  value={assignForm.quantity}
                  onChange={(e) =>
                    setAssignForm({ ...assignForm, quantity: Number(e.target.value) })
                  }
                  required
                />
              </label>
              <label style={labelStyle}>
                <span>Date d'Affectation</span>
                <input
                  style={inputStyle}
                  type="date"
                  value={assignForm.date}
                  onChange={(e) =>
                    setAssignForm({ ...assignForm, date: e.target.value })
                  }
                />
              </label>
              <label style={labelStyle}>
                <span>Commentaire (optionnel)</span>
                <textarea
                  style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
                  value={assignForm.comment}
                  onChange={(e) =>
                    setAssignForm({ ...assignForm, comment: e.target.value })
                  }
                  placeholder="Commentaire sur cette affectation..."
                />
              </label>
            </div>
            <div style={modalFooter}>
              <button
                type="button"
                style={secondaryButton}
                onClick={() => setAssigningProductId(null)}
              >
                Annuler
              </button>
              <button
                type="button"
                style={primaryButton}
                onClick={handleAssignSubmit}
                disabled={!assignForm.technicianId || assignForm.quantity <= 0}
              >
                Confirmer l'Affectation
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

function SortIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18M7 12h10M11 18h2" />
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

function AssignIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <path d="M20 8v6M23 11h-6" />
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

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
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

const dateRangeContainerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  flexWrap: "wrap",
};

const dateRangeInputsStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
};

const dateInputWrapperStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",
};

const dateInputLabelStyle: React.CSSProperties = {
  fontSize: "0.75rem",
  fontWeight: 500,
  color: "#6b7280",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const dateInputStyle: React.CSSProperties = {
  padding: "0.625rem 1rem",
  borderRadius: "0.5rem",
  border: "1px solid #e5e7eb",
  backgroundColor: "#ffffff",
  color: "#344D59",
  fontSize: "0.95rem",
  cursor: "pointer",
  transition: "all 0.2s",
  minWidth: "140px",
};

const clearDateButtonStyle: React.CSSProperties = {
  padding: "0.5rem",
  borderRadius: "0.5rem",
  border: "none",
  backgroundColor: "transparent",
  color: "#ef4444",
  fontSize: "1.25rem",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.2s",
  width: "32px",
  height: "32px",
  alignSelf: "flex-end",
  marginBottom: "0.25rem",
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

const cardStyle: React.CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "0.75rem",
  border: "1px solid #e5e7eb",
  overflow: "hidden",
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

const availableBadgeStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "0.25rem 0.75rem",
  borderRadius: "999px",
  fontSize: "0.875rem",
  fontWeight: 500,
  backgroundColor: "#d1fae5",
  color: "#065f46",
};

const outOfStockBadgeStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "0.25rem 0.75rem",
  borderRadius: "999px",
  fontSize: "0.875rem",
  fontWeight: 500,
  backgroundColor: "#fee2e2",
  color: "#991b1b",
};

const actionsStyle: React.CSSProperties = {
  display: "flex",
  gap: "0.5rem",
};

const iconButtonStyle: React.CSSProperties = {
  padding: "0.5rem",
  borderRadius: "0.5rem",
  border: "none",
  backgroundColor: "transparent",
  color: "#344D59",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.2s",
};

const assignIconButtonStyle: React.CSSProperties = {
  ...iconButtonStyle,
  color: "#f59e0b",
};

const deleteIconButtonStyle: React.CSSProperties = {
  ...iconButtonStyle,
  color: "#ef4444",
};

const linkStyle: React.CSSProperties = {
  color: "#137C8B",
  textDecoration: "none",
  fontWeight: 500,
};

const paginationStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "1rem",
  marginTop: "1.5rem",
};

const paginationButtonStyle: React.CSSProperties = {
  padding: "0.5rem 1rem",
  borderRadius: "0.5rem",
  border: "1px solid #e5e7eb",
  backgroundColor: "#ffffff",
  color: "#344D59",
  cursor: "pointer",
  fontSize: "0.95rem",
};

const paginationInfoStyle: React.CSSProperties = {
  color: "#6b7280",
  fontSize: "0.95rem",
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

const fileUploadContainer: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
};

const fileUploadLabel: React.CSSProperties = {
  cursor: "pointer",
  flex: 1,
};

const fileUploadButton: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5rem",
  padding: "0.625rem 0.875rem",
  borderRadius: "0.5rem",
  border: "1px dashed #9ca3af",
  backgroundColor: "#f9fafb",
  color: "#6b7280",
  fontSize: "0.95rem",
  transition: "all 0.2s",
  minHeight: "42px",
};

const removeFileButton: React.CSSProperties = {
  padding: "0.5rem",
  borderRadius: "0.5rem",
  border: "1px solid #e5e7eb",
  backgroundColor: "transparent",
  color: "#6b7280",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
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

const imageThumbnailStyle: React.CSSProperties = {
  position: "relative",
  width: "56px",
  height: "56px",
  borderRadius: "0.5rem",
  overflow: "hidden",
  cursor: "pointer",
  transition: "all 0.2s",
  border: "2px solid #e5e7eb",
};

const imageThumbnailImgStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const imageOverlayStyle: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  opacity: 0,
  transition: "opacity 0.2s",
  color: "#ffffff",
};

const noImageStyle: React.CSSProperties = {
  width: "56px",
  height: "56px",
  borderRadius: "0.5rem",
  backgroundColor: "#f3f4f6",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#9ca3af",
  border: "2px dashed #d1d5db",
};

const imageModalOverlay: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.9)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 2000,
  padding: "2rem",
};

const imageModalContent: React.CSSProperties = {
  position: "relative",
  maxWidth: "90vw",
  maxHeight: "90vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const imageModalImage: React.CSSProperties = {
  maxWidth: "100%",
  maxHeight: "90vh",
  objectFit: "contain",
  borderRadius: "0.5rem",
  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
};

const imageModalCloseButton: React.CSSProperties = {
  position: "absolute",
  top: "-3rem",
  right: 0,
  padding: "0.5rem",
  borderRadius: "50%",
  border: "none",
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  color: "#ffffff",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.2s",
  width: "40px",
  height: "40px",
};
