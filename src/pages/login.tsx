import LoginForm from "@/components/forms/authentication/login-form";
import { companyInfo } from "@/config";

export default function Login() {
  return (
    <div className="h-screen flex font-inter items-center justify-center">
      <div className="w-1/2 h-full">
        <img
          src={companyInfo.loginBg}
          alt="Soap"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="w-1/2 relative flex flex-col overflow-auto scrollbar justify-between py-10 h-full px-12">
        <div className="text-right text-xs text-gray-600 mb-2">
          {companyInfo.name}
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
              href="mailto:contact@quetratech.com"
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
