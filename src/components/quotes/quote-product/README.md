# Quote Product Components - Refactoring Summary

This folder contains the refactored quote product management components, broken down from the original large `quote-products-section.tsx` file into smaller, more focused components.

## Component Structure

### 📁 Files Overview

- **`index.tsx`** - Main orchestrator component (QuoteProductsSection)
- **`selected-products-table.tsx`** - Table showing selected products with quantities, TVA, and pricing
- **`product-selection-dialog.tsx`** - Modal dialog for browsing and selecting products
- **`product-row.tsx`** - Individual product row for simple products
- **`variable-product-row.tsx`** - Expandable row for variable products with variations
- **`types.ts`** - Shared TypeScript interfaces and types

### 🔄 Component Hierarchy

```
QuoteProductsSection (index.tsx)
├── SelectedProductsTable
│   ├── Product rows with quantity/TVA inputs
│   ├── Stock warnings display
│   └── Browse products button
└── ProductSelectionDialog
    ├── Search functionality
    ├── Product list with selection
    ├── ProductRow (for simple products)
    ├── VariableProductRow (for variable products)
    │   └── Variation accordion with checkboxes
    └── Add selected button
```

## Key Features

### ✅ Variable Products Support

- Accordion-style expansion for variable products
- Individual variation selection with attributes display
- Stock quantity and pricing per variation
- Sale price indicators for variations

### ✅ Stock Management

- Real-time stock warnings for insufficient inventory
- Visual indicators for low stock products
- Stock quantity validation during selection

### ✅ Smart Pricing

- Automatic sale price detection and display
- Original price cross-out for sale items
- TVA (tax) calculation per product

### ✅ Search & Selection

- Real-time product search
- Bulk selection with temporary state
- Selection persistence during dialog interactions

## Props & Data Flow

### Main Component Props

```typescript
interface QuoteProductsSectionProps {
  selectedProducts: SelectedProduct[];
  setSelectedProducts: React.Dispatch<React.SetStateAction<SelectedProduct[]>>;
  stockWarnings: StockWarning[];
  setStockWarnings: React.Dispatch<React.SetStateAction<StockWarning[]>>;
}
```

### Key Data Structures

- **SelectedProduct**: Enhanced with variation support (`variation_id`, `parent_product_id`, `variation_attributes`)
- **ProductVariation**: WooCommerce variation data with attributes and pricing
- **StockWarning**: Real-time inventory shortage alerts

## Benefits of Refactoring

1. **Modularity**: Each component has a single responsibility
2. **Reusability**: Components can be used independently
3. **Maintainability**: Easier to locate and fix issues
4. **Testability**: Smaller components are easier to unit test
5. **Performance**: Lighter re-renders with focused state management
6. **Readability**: Clear separation of concerns

## Migration Notes

- Updated imports in `pages/quotes/quote-new.tsx` and `pages/quotes/quote-edit.tsx`
- Moved "Browse Products" button into table header for better UX
- Preserved all existing functionality while improving code organization
- Type safety maintained throughout the refactoring
