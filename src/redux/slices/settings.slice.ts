import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

export interface AppSettings {
  name: string;
  email: string;
  website: string;
  logo: string; // base64
  phone: string;
  fax: string;
  address: string;
  rib: string;
  tax_id: string;
  tax_rate: string;
  fiscal_value: string; // timbre fiscal value (default: "1.000")
}

type UpdateSettingsFieldPayload<
  K extends keyof AppSettings = keyof AppSettings,
> = {
  field: K;
  value: AppSettings[K];
};

const initialState: AppSettings = {
  name: "",
  email: "",
  website: "",
  logo: "",
  phone: "",
  fax: "",
  address: "",
  rib: "",
  tax_id: "",
  tax_rate: "19", // Default TVA rate in Tunisia
  fiscal_value: "1.000", // Default timbre fiscal
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    updateSettings: (state, action: PayloadAction<Partial<AppSettings>>) => {
      Object.assign(state, action.payload);
    },
    updateSettingsField: <K extends keyof AppSettings>(
      state: AppSettings,
      action: PayloadAction<UpdateSettingsFieldPayload<K>>
    ) => {
      const { field, value } = action.payload;
      state[field] = value;
    },
    resetSettings: (state) => {
      Object.assign(state, initialState);
    },
  },
});

export const { updateSettings, updateSettingsField, resetSettings } =
  settingsSlice.actions;

export const selectSettings = (state: RootState) => state.settings;
export const selectSettingsField =
  <K extends keyof AppSettings>(field: K) =>
  (state: RootState) =>
    state.settings[field];

export default settingsSlice.reducer;
