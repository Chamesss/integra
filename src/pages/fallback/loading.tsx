import Loading from "@/components/ui/custom-ui/loading";

export default function LoadingPage() {
  return (
    <div className="flex flex-1 h-screen items-center justify-center">
      <Loading />
      Chargement...
    </div>
  );
}
