import { useEffect, useState } from "react";
import { useRouteError } from "react-router";

export default function ErrorFallback() {
  const error = useRouteError();
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (retryAttempt > 0) {
      setTimeout(() => {
        setErrorMessage(`Nouvelle tentative #${retryAttempt} échouée.`);
      }, 1500);
    }
  }, [retryAttempt]);

  const handleRefresh = () => {
    setRetryAttempt((prev) => prev + 1);
    setErrorMessage(null);
    window.location.reload();
  };

  return (
    <div className="p-6">
      <h1 className="text-lg font-semibold mb-2">Erreur</h1>
      <p className="mb-4">Une erreur est survenue. Veuillez réessayer.</p>

      {error instanceof Error && (
        <div className="mb-4">
          <strong>Détails :</strong>
          <pre className="bg-gray-100 text-sm p-2 mt-1 whitespace-pre-wrap">
            {error.message}
          </pre>
          {error.stack && (
            <pre className="bg-gray-100 text-xs p-2 mt-1 whitespace-pre-wrap">
              {error.stack}
            </pre>
          )}
        </div>
      )}

      {errorMessage && (
        <p className="text-sm text-red-500 mb-4">{errorMessage}</p>
      )}

      <button
        onClick={handleRefresh}
        className="px-4 py-2 border border-gray-400 text-sm hover:bg-primary/10 cursor-pointer transition"
      >
        Réessayer
      </button>
    </div>
  );
}
