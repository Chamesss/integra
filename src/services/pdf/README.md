# PDF Generation Service

## Overview

Modular PDF generation system for invoices and quotes using `@react-pdf/renderer`.

## Architecture

```
pdf.service.tsx          # Main service with QuotePDF/InvoicePDF components
pdf/
├── header.tsx           # Company info, client details, document metadata
├── products-table.tsx   # Product listings with pricing
├── tax-summary.tsx      # Two-table tax breakdown (TAUX/BASE/MONTANT | TOTAL H.T/REMISE/TVA)
├── bottom-section.tsx   # Amount in words + NET À PAYER box (side-by-side)
├── footer.tsx           # Company footer (absolute positioned at page bottom)
└── index.ts            # Component exports
```

## Key Features

- **Modular Components**: Each PDF section is a separate, reusable component
- **Consistent Styling**: Rounded tables (#ddd borders, #FAFAFA headers, #758084 text)
- **Tax Calculations**: Proper discount handling (percentage-based) with currency formatting
- **Responsive Layout**: Two-column tax summary, side-by-side bottom section
- **Footer Positioning**: Absolute positioned at page bottom (handles multi-page documents)

## Usage

```tsx
// Download Quote PDF
PDFService.downloadQuotePDF(quoteData);

// Download Invoice PDF
PDFService.downloadInvoicePDF(invoiceData);

// React Component
<PDFDownloadLink document={<QuotePDF quote={data} />} />;
```

## Styling Convention

- Headers: `#FAFAFA` background, `#758084` text, 8px font
- Borders: `#ddd` color, 6px border-radius
- Currency: Tunisian Dinar format with 3 decimal places
- Typography: Helvetica, 10px base size
