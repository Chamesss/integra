import ErrorFallback from "@/pages/fallback/error";
import LoadingPage from "@/pages/fallback/loading";
import { getUser } from "@/redux/loaders/get-user";
import { createHashRouter } from "react-router";

const router = createHashRouter([
  {
    path: "/",
    lazy: () =>
      import("@/components/layouts/layout").then((module) => ({
        Component: module.default,
      })),
    hydrateFallbackElement: <LoadingPage />,
    errorElement: (
      <div>Une erreur est survenue. Veuillez réessayer plus tard.</div>
    ),
    loader: () => getUser(),
    children: [
      {
        index: true,
        lazy: () =>
          import("@/pages/dashboard").then((module) => ({
            Component: module.default,
          })),
        errorElement: <ErrorFallback />,
      },
      {
        path: "category",
        lazy: () =>
          import("@/pages/categories").then((module) => ({
            Component: module.default,
          })),
        errorElement: <ErrorFallback />,
      },
      {
        path: "inventory",
        lazy: () =>
          import("@/pages/inventory/inventory").then((module) => ({
            Component: module.default,
          })),
        errorElement: <ErrorFallback />,
      },
      {
        path: "inventory/:id",
        lazy: () =>
          import("@/pages/inventory/product-details").then((module) => ({
            Component: module.default,
          })),
        errorElement: <ErrorFallback />,
      },
      {
        path: "quotes",
        lazy: () =>
          import("@/pages/quotes/quotes").then((module) => ({
            Component: module.default,
          })),
        errorElement: <ErrorFallback />,
      },
      {
        path: "quotes/new",
        lazy: () =>
          import("@/pages/quotes/quote-new").then((module) => ({
            Component: module.default,
          })),
        errorElement: <ErrorFallback />,
      },
      {
        path: "quotes/edit/:id",
        lazy: () =>
          import("@/pages/quotes/quote-edit").then((module) => ({
            Component: module.default,
          })),
        errorElement: <ErrorFallback />,
      },
      {
        path: "invoices",
        lazy: () =>
          import("@/pages/invoices").then((module) => ({
            Component: module.default,
          })),
        errorElement: <ErrorFallback />,
      },
      {
        path: "clients",
        lazy: () =>
          import("@/pages/clients").then((module) => ({
            Component: module.default,
          })),
        errorElement: <ErrorFallback />,
      },
      {
        path: "employees",
        lazy: () =>
          import("@/pages/employees").then((module) => ({
            Component: module.default,
          })),
        errorElement: <ErrorFallback />,
      },
      {
        path: "profile",
        lazy: () =>
          import("@/pages/profile").then((module) => ({
            Component: module.default,
          })),
        errorElement: <ErrorFallback />,
      },
    ],
  },
  {
    path: "login",
    lazy: () =>
      import("@/pages/login").then((module) => ({
        Component: module.default,
      })),
    errorElement: <ErrorFallback />,
  },
  {
    path: "*",
    lazy: () =>
      import("@/pages/fallback/notfound").then((module) => ({
        Component: module.default,
      })),
    errorElement: <ErrorFallback />,
  },
]);

export default router;
