import { Button } from "@/components/ui/button";
import FormInput from "@/components/ui/custom-ui/form-input";
import Loading from "@/components/ui/custom-ui/loading";
import { useMutation } from "@/hooks/useMutation";
import { useToastLoader } from "@/hooks/useToasterLoader";
import { saveUser } from "@/redux/slices/user.slice";
import { useAppDispatch } from "@/redux/store";
import { UserCreateDto, UserDto } from "electron/types/user.types";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<UserCreateDto>({
    mode: "onChange",
    defaultValues: { name: "", password: "", email: "" },
  });
  const { showToast } = useToastLoader();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { mutate: login, isPending } = useMutation<UserCreateDto, UserDto>();
  const [method, setMethod] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: UserCreateDto) => {
    showToast("loading", "Connexion en cours...", {
      id: "login-toast",
      duration: Infinity,
    });

    data.name = data.name.trim().toLowerCase();
    data.email = data.email.trim().toLowerCase();
    data.password = data.password.trim().toLowerCase();

    login(
      {
        method: method === "login" ? "auth:login" : "auth:signup",
        data,
      },
      {
        onSuccess: (result) => {
          if (result.success) {
            showToast("success", result.message, {
              id: "login-toast",
              duration: 3000,
            });
            if (method === "login") {
              setLoading(true);

              if (result.data?.Role) {
                result.data.Role = {
                  id: result.data.Role.id || "",
                  name: result.data.Role.name || "",
                };
              }
              dispatch(saveUser(result));
              // Wait for the store to persist the token before navigating
              const checkTokenPersisted = () => {
                const token = localStorage.getItem("persist:root");
                if (token) {
                  try {
                    const parsed = JSON.parse(token);
                    const userState = JSON.parse(parsed.user || "{}");
                    if (userState.tokens?.accessToken) {
                      navigate("/");
                      return;
                    }
                  } catch (e) {
                    console.log("Error parsing persisted state:", e);
                  }
                }
                setTimeout(checkTokenPersisted, 100);
              };

              setTimeout(checkTokenPersisted, 500);
            }
          } else {
            showToast("error", result.message || "Échec de la connexion.", {
              id: "login-toast",
              duration: 3000,
            });
          }
        },
        onError: (error: any) => {
          showToast(
            "error",
            error?.message || "Une erreur s'est produite lors de la connexion.",
            {
              id: "login-toast",
              duration: 3000,
            }
          );
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="flex flex-col gap-8">
        {method !== "login" && (
          <FormInput
            type="text"
            placeholder="Email"
            {...register("email", {
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Veuillez entrer une adresse e-mail valide.",
              },
            })}
            error={errors.name}
          />
        )}
        <FormInput
          type="text"
          placeholder="Nom d'utilisateur"
          {...register("name", {
            required: "Ce champ est requis.",
          })}
          error={errors.name}
        />
        <FormInput
          type="password"
          placeholder="Mot de passe"
          {...register("password", {
            required: "Ce champ est requis.",
          })}
          error={errors.password}
        />
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={!isValid || isPending || loading}
      >
        {loading || isPending ? (
          <Loading />
        ) : method === "login" ? (
          "Se connecter"
        ) : (
          "S'inscrire"
        )}
      </Button>
      <div className="flex justify-end">
        <button
          type="button"
          className="w-fit cursor-pointer text-sm text-neutral-950 hover:underline"
          onClick={() => setMethod(method === "login" ? "register" : "login")}
          disabled={isPending}
        >
          {method === "login" ? "Créer un compte" : "Se connecter"}
        </button>
      </div>
    </form>
  );
}
