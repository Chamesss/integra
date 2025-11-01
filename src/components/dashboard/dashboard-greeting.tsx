import { Card } from "@/components/ui/card";
import { Building2, Calendar } from "lucide-react";
import { useEffect, useState } from "react";

interface UserInfo {
  name: string;
  email: string;
}

export default function DashboardGreeting() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Fetch current user
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const result = await window.ipcRenderer.invoke("user:get", token);
          if (result.success && result.data) {
            setUserInfo({
              name: result.data.name,
              email: result.data.email,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();

    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Bonjour";
    if (hour < 18) return "Bon après-midi";
    return "Bonsoir";
  };

  const formatDate = () => {
    return currentTime.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = () => {
    return currentTime.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="border shadow-none bg-white overflow-hidden">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Greeting Section */}
          <div className="flex-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
              {getGreeting()}
              {userInfo && (
                <span className="text-violet-600">, {userInfo.name}!</span>
              )}
            </h2>
            <p className="text-sm text-muted-foreground capitalize">
              {formatDate()}
            </p>
          </div>

          {/* Quick Info Section */}
          <div className="flex flex-col sm:items-end gap-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-violet-500" />
              <span className="font-medium">{formatTime()}</span>
            </div>

            {/* Company Info (if needed, can be populated from settings) */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Building2 className="h-3.5 w-3.5" />
              <span>Ska Artisanal</span>
            </div>
          </div>
        </div>

        {/* Quick Summary */}
        <div className="mt-4 pt-4 border-t border-violet-100 flex flex-wrap gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span>Système opérationnel</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span>Données synchronisées</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
