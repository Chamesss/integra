import { AttributeDto, AttributeErrorState } from "./default-value";

export const validateAttribute = (
  newAttribute: AttributeDto,
  setErrors: (e: AttributeErrorState) => void
): boolean => {
  const newErrors: AttributeErrorState = {};
  if (!newAttribute.name.trim())
    newErrors.name = "Le nom de l'attribut ne peut pas être vide.";
  const termErrors = newAttribute.terms.map((term) =>
    !term.name.trim() ? "Le nom du terme ne peut pas être vide." : ""
  );
  if (termErrors.some((error) => error)) newErrors.terms = termErrors;
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return false;
  }
  setErrors({});
  return true;
};

export const prepareTermsOperations = (
  originalTerms: any[],
  currentTerms: any[]
) => {
  const operations = {
    create: [] as any[],
    update: [] as any[],
    delete: [] as number[],
  };

  // Track IDs of current terms
  const currentTermIds = new Set(
    currentTerms.filter((term) => term.id > 0).map((term) => term.id)
  );
  const originalTermIds = new Set(originalTerms.map((term) => term.id));

  // Find terms to delete (exist in original but not in current)
  originalTermIds.forEach((id) => {
    if (!currentTermIds.has(id)) {
      operations.delete.push(id);
    }
  });

  // Process current terms
  currentTerms.forEach((term) => {
    if (term.id === 0) {
      // New term
      operations.create.push({
        name: term.name.trim(),
        description: term.description.trim(),
      });
    } else {
      // Existing term - check if modified
      const originalTerm = originalTerms.find((t) => t.id === term.id);
      if (
        originalTerm &&
        (originalTerm.name !== term.name.trim() ||
          originalTerm.description !== term.description.trim())
      ) {
        operations.update.push({
          id: term.id,
          name: term.name.trim(),
          description: term.description.trim(),
        });
      }
    }
  });

  return operations;
};
