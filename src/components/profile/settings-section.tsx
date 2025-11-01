import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  updateSettings,
  selectSettings,
  AppSettings,
} from "@/redux/slices/settings.slice";
import { useToastLoader } from "@/hooks/useToasterLoader";
import { Camera, X } from "lucide-react";
import FormInput from "../ui/custom-ui/form-input";
import FormTextarea from "../ui/custom-ui/form-textarea";
import { Button } from "../ui/button";
import { Label } from "../ui/label";

export default function SettingsSection() {
  const dispatch = useAppDispatch();
  const settings = useAppSelector(selectSettings);
  const { showToast } = useToastLoader();
  const [logoPreview, setLogoPreview] = useState<string>("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AppSettings>({
    defaultValues: settings,
  });

  const logoValue = watch("logo");

  // Update logo preview when file changes
  useEffect(() => {
    if (logoValue && !logoValue.startsWith("data:image")) {
      setLogoPreview("");
      setValue("logo", "", { shouldDirty: true });
    }
  }, [logoValue, setValue]);

  // Sync form with updated settings from store
  useEffect(() => {
    reset(settings);
    if (settings.logo) {
      setLogoPreview(settings.logo);
    } else {
      setLogoPreview("");
    }
  }, [settings, reset]);

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        showToast("error", "Veuillez sélectionner une image valide.", {
          duration: 3000,
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setValue("logo", base64, { shouldDirty: true });
        setLogoPreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setValue("logo", "", { shouldDirty: true });
    setLogoPreview("");
    const fileInput = document.getElementById(
      "logo-upload"
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleClickLogoUpload = () => {
    document.getElementById("logo-upload")?.click();
  };

  const onSubmit = (data: AppSettings) => {
    try {
      dispatch(updateSettings(data));
      showToast("success", "Paramètres sauvegardés avec succès", {
        duration: 3000,
      });
    } catch (error) {
      showToast("error", "Échec de la sauvegarde des paramètres", {
        duration: 3000,
      });
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-full lg:max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Paramètres de Devis/Factures
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            Gérez les informations de votre entreprise
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Logo & Company Name Section */}
          <section className="bg-white rounded-xl shadow-xs border p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-6 border-b pb-2">
              Logo et Nom de l'entreprise
            </h2>

            <div className="flex flex-col lg:flex-row lg:items-start gap-8">
              {/* Logo Upload */}
              <div className="flex flex-col items-center min-w-[15rem] space-y-4 lg:shrink-0">
                <div className="relative group">
                  {logoPreview ? (
                    <>
                      <div className="w-28 h-28 p-1 rounded-xl border-2 border-gray-200 overflow-hidden shadow-sm">
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 shadow transition"
                        aria-label="Supprimer le logo"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <div
                      onClick={handleClickLogoUpload}
                      className="w-28 h-28 p-1 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-gray-50 transition"
                    >
                      <Camera className="w-10 h-10 text-gray-400" />
                      <span className="text-xs text-gray-500 mt-1">
                        Uploader
                      </span>
                    </div>
                  )}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClickLogoUpload}
                  className="text-xs"
                >
                  {logoPreview ? "Changer le logo" : "Ajouter un logo"}
                </Button>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
              </div>

              {/* Company Name */}
              <div className="flex-1 mt-4 space-y-2">
                <Label>Nom de l'établissement</Label>
                <FormInput
                  {...register("name")}
                  type="text"
                  placeholder="Ex: SARL ABC Services"
                  error={errors.name}
                  className="mt-1"
                />
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section className="bg-white rounded-xl shadow-xs border p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-6 border-b pb-2">
              Informations de Contact
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Courriel</Label>
                <FormInput
                  {...register("email")}
                  type="email"
                  placeholder="contact@entreprise.tn"
                  error={errors.email}
                />
              </div>

              <div className="space-y-2">
                <Label>Téléphone</Label>
                <FormInput
                  id="phone"
                  {...register("phone", {
                    pattern: {
                      value: /^[0-9+\-()\s]+$/,
                      message: "Numéro de téléphone invalide",
                    },
                  })}
                  onKeyDown={(e) => {
                    const allowed = /[0-9+\-()\s]/;
                    if (e.key.length === 1 && !allowed.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  placeholder="Téléphone"
                  type="tel"
                  inputMode="tel"
                  pattern="[0-9+\-()\s]*"
                  className="w-full"
                  error={errors.phone}
                />
              </div>

              <div className="space-y-2">
                <Label>Fax</Label>
                <FormInput
                  {...register("fax")}
                  type="tel"
                  placeholder="+216 XX XXX XXX"
                  error={errors.fax}
                />
              </div>

              <div className="space-y-2">
                <Label>Site Web</Label>
                <FormInput
                  {...register("website")}
                  placeholder="https://www.entreprise.tn"
                  error={errors.website}
                />
              </div>

              <div className="space-y-2 xl:col-span-2">
                <Label>Adresse</Label>
                <FormTextarea
                  {...register("address")}
                  placeholder="123 Rue Exemple, Ville, Pays"
                  rows={3}
                  error={errors.address}
                />
              </div>
            </div>
          </section>

          {/* Financial & Legal Info */}
          <section className="bg-white rounded-xl shadow-xs border p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-6 border-b pb-2">
              Informations Fiscales et Bancaires
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Identifiant Fiscal (IF)</Label>
                <FormInput
                  {...register("tax_id")}
                  type="text"
                  placeholder="1234567M"
                  error={errors.tax_id}
                />
              </div>

              <div className="space-y-2">
                <Label>RIB</Label>
                <FormInput
                  {...register("rib")}
                  type="text"
                  placeholder="12 345678 9012345678 90"
                  error={errors.rib}
                />
              </div>

              <div className="space-y-2">
                <Label>Timbre Fiscal (DT)</Label>
                <FormInput
                  {...register("fiscal_value", {
                    valueAsNumber: false,
                  })}
                  type="number"
                  step="1.000"
                  min="0"
                  placeholder="0.600"
                  error={errors.fiscal_value}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value && !value.includes("."))
                      e.target.value = (parseFloat(value) || 0).toFixed(3);
                  }}
                />
              </div>
              {/* Empty placeholder to balance layout */}
              <div></div>
            </div>
          </section>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting} className="px-8 py-2">
              {isSubmitting ? "Enregistrement..." : "Mettre à jour"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
