export type ProductStatus = 'disponible' | 'stock_vide';
export type ProductType = 'TYPE1' | 'TYPE2';

export type Product = {
  _id: string;
  name: string;
  quantity: number;
  invoiceNumber?: string;
  invoiceAttachment?: string;
  status: ProductStatus;
  type: ProductType;
  createdAt?: string;
  updatedAt?: string;
};

export type Technician = {
  _id: string;
  name: string;
  email: string;
  team: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type MovementType = "ENTREE" | "SORTIE";

export type Movement = {
  _id: string;
  productId: string;
  technicianId?: string;
  quantity: number;
  type: MovementType;
  comment?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ToolLoanStatus = "EN_COURS" | "RETARD" | "DISPONIBLE";

export type ToolLoan = {
  _id: string;
  toolName: string;
  category: string;
  serialNumber?: string;
  technicianId?: string;
  loanedAt?: string;
  dueDate?: string;
  status: ToolLoanStatus;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};


