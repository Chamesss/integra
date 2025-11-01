import { PencilLine, Trash, Eye } from "lucide-react";

export const TrashIcon = () => (
  <Trash className="h-4 w-4 mt-0.5 text-red-500" />
);
export const PencilIcon = () => (
  <PencilLine className="h-4 w-4 mt-0.5 text-black" />
);

export const EyeIcon = () => <Eye className="h-4 w-4 mt-0.5 text-black" />;
