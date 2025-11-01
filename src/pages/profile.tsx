import SettingsSection from "@/components/profile/settings-section";
import SectionTitle from "@/components/ui/custom-ui/section-title";

export default function Profile() {
  return (
    <main className="flex flex-col h-screen w-full">
      <div className="flex items-center justify-between px-6 pt-6 pb-8 gap-4 border-b flex-col bg-white">
        <SectionTitle className="w-full text-start">
          Paramètres Generale
        </SectionTitle>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar">
        <SettingsSection />
      </div>
    </main>
  );
}
