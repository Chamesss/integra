import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import SearchDropdownItem from "@/components/ui/custom-ui/search-dropdown-item";
import { TableCell, TableRow } from "@/components/ui/table";
import { Client } from "electron/models/client";
import { useState } from "react";
import ClientAddNew from "./client-add-new";
import ClientDeletePopup from "./client-delete-popup";
import { cn } from "@/lib/utils";

interface Props {
  client: Client;
  selectedClients: Set<number>;
  toggleSelectClient: (clientId: number) => void;
  clients: Client[];
  refetch: () => void;
}

export default function ClientTableRow({
  client,
  selectedClients,
  toggleSelectClient,
  clients,
  refetch,
}: Props) {
  const [isEditMode, setIsEditMode] = useState<boolean | null>(null);
  const [isDeleteMode, setIsDeleteMode] = useState<boolean | null>(null);

  const isSelected = selectedClients.has(client.id);

  return (
    <>
      <TableRow
        className={cn(
          "cursor-pointe group transition-all",
          isSelected && "bg-blue-pale hover:bg-blue-pale/70"
        )}
      >
        <TableCell className="pl-3 relative">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => toggleSelectClient(client.id)}
            aria-label={`Select client ${client.name}`}
          />
          {isSelected && <span className="absolute inset-0 w-1 bg-selected" />}
        </TableCell>
        <TableCell className="max-w-[200px]">
          <div className="flex flex-col">
            <span className="font-medium truncate">{client.name}</span>
          </div>
        </TableCell>
        <TableCell>
          <Badge
            variant={client.type === "company" ? "company" : "individual"}
            className="capitalize"
          >
            {client.type === "company" ? "Entreprise" : "Particulier"}
          </Badge>
        </TableCell>
        <TableCell className="max-w-[150px]">
          <span className="truncate">{client.phone}</span>
        </TableCell>
        <TableCell className="max-w-[200px]">
          <span className="truncate">{client.address}</span>
        </TableCell>
        <TableCell>
          {client.tva ? (
            <span className="text-sm">{client.tva}</span>
          ) : (
            <span className="text-gray-400 text-sm">—</span>
          )}
        </TableCell>
        <TableCell className="text-sm text-gray-500">
          {new Date(client.createdAt).toLocaleDateString("fr-FR")}
        </TableCell>
        <TableCell>
          <SearchDropdownItem
            onEdit={() => setIsEditMode(true)}
            onDelete={() => setIsDeleteMode(true)}
          />
        </TableCell>
      </TableRow>
      <ClientAddNew
        isAdding={isEditMode}
        setIsAdding={setIsEditMode}
        refetch={refetch}
        mode="edit"
        client={client}
      />
      <ClientDeletePopup
        isDeleteMode={isDeleteMode}
        setIsDeleteMode={setIsDeleteMode}
        clientId={client.id}
        clients={clients}
        refetch={refetch}
      />
    </>
  );
}
