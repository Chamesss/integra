import {
  FolderOpen,
  Handshake,
  Layers,
  LayoutGrid,
  Package,
  ReceiptText,
  Settings,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

export interface SidebarItems {
  title: string;
  Icon: LucideIcon;
  url: string;
  disabled: boolean;
}

export const sidebarItemsMain: SidebarItems[] = [
  {
    title: "Tableau de bord",
    Icon: LayoutGrid,
    url: "/",
    disabled: false,
  },
  {
    title: "Catégories",
    Icon: Layers,
    url: "/category",
    disabled: false,
  },
  {
    title: "Inventaire",
    Icon: Package,
    url: "/inventory",
    disabled: false,
  },
  {
    title: "Devis",
    Icon: FolderOpen,
    url: "/quotes",
    disabled: false,
  },
  {
    title: "Factures",
    Icon: ReceiptText,
    url: "/invoices",
    disabled: false,
  },
  {
    title: "Clients",
    Icon: Handshake,
    url: "/clients",
    disabled: false,
  },
  {
    title: "Employés",
    Icon: UsersRound,
    url: "/employees",
    disabled: false,
  },
  {
    title: "Paramètres",
    Icon: Settings,
    url: "/profile",
    disabled: false,
  },
];
