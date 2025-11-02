import LoginForm from "@/components/forms/authentication/login-form";
import { companyInfo } from "@/config";
import logo from "@/assets/logo/text.svg";
import symbol from "@/assets/logo/symbol.svg";
import { ChartSpline, Package2, Receipt, Tag } from "lucide-react";

export default function Login() {
  return (
    <div className="h-screen flex font-inter items-center justify-center">
      <div
        className="relative w-1/2 h-full bg-cover bg-center"
        style={{ backgroundImage: `url(${companyInfo.loginBg})` }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <div className="relative flex flex-col justify-between h-full py-12 px-10 text-white">
          <div className="flex flex-col items-center gap-3">
            <img
              src={symbol}
              alt="symbol"
              className="w-20 h-20 drop-shadow-lg"
            />
            <img src={logo} alt="logo" className="w-40 drop-shadow-lg" />
          </div>
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-semibold leading-snug">
              Gérez votre entreprise en toute simplicité
            </h1>
            <p className="text-sm text-gray-200 max-w-sm mx-auto">
              Contrôlez vos produits, vos stocks et vos ventes en un seul
              endroit.
            </p>

            {/* Feature icons */}
            <div className="flex items-center justify-center gap-8 text-gray-200 mt-8">
              {[
                { icon: <Package2 size={20} />, label: "Inventaire" },
                { icon: <Tag size={20} />, label: "Produits" },
                { icon: <ChartSpline size={20} />, label: "Statistiques" },
                { icon: <Receipt size={20} />, label: "Factures" },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="rounded-full p-3 bg-white/10 backdrop-blur-sm shadow-md">
                    {item.icon}
                  </div>
                  <span className="text-xs opacity-80">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div />
        </div>
      </div>

      <div className="w-1/2 relative flex flex-col overflow-auto scrollbar justify-between py-10 h-full px-12">
        <div className="text-right text-xs text-gray-600 flex items-center justify-end gap-3 mb-2">
          <img src={symbol} alt="symbol" className="w-5 h-5" />
          <span>{companyInfo.name}</span>
        </div>
        <div className="max-w-lg mx-auto">
          <div className="flex flex-col items-start mb-6 gap-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Bienvenue{" "}
              <span className="font-light text-gray-400">de nouveau!</span>
            </h2>
            <small className="uppercase font-medium text-gray-600 mb-6">
              Veuillez saisir vos informations personnelles ci-dessous afin de
              vous connecter à votre compte.
            </small>
          </div>
          <LoginForm />
        </div>
        <div className="w-full h-10" />
        <div className="absolute bottom-0 left-0 right-0">
          <div className="text-center text-xs text-gray-600">
            © {new Date().getFullYear()} {companyInfo.name}. Tous droits
            réservés.
          </div>
          <div className="text-center text-xs text-gray-600 pb-1.5 pt-1">
            Une question ou un souci ?
            <a
              href="mailto:chamsedin.azouz@gmail.com"
              className="hover:underline ml-1 font-medium"
            >
              Contactez-nous
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
