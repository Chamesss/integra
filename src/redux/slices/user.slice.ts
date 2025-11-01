import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserDto } from "electron/types/user.types";
import { RootState } from "../store";
import { IResult } from "electron/types/core.types";

interface UserGlobalState extends UserDto {
  tokens: {
    accessToken: string | null;
    refreshToken: string | null;
  };
}

type UpdateFieldPayload<
  K extends keyof UserGlobalState = keyof UserGlobalState
> = {
  field: K;
  value: UserGlobalState[K];
};

const initialState: UserGlobalState = {
  id: "",
  email: "",
  name: "",
  tokens: {
    accessToken: null,
    refreshToken: null,
  },
  roleId: "",
  avatar: "",
  createdAt: "",
  updatedAt: "",
  banned: false,
  Role: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    storeTokens: (
      state,
      action: PayloadAction<{
        accessToken: string;
        refreshToken: string;
      }>
    ) => {
      state.tokens.accessToken = action.payload.accessToken;
      state.tokens.refreshToken = action.payload.refreshToken;
    },
    removeUser: (state) => {
      Object.assign(state, initialState);
    },
    updateField: <K extends keyof UserGlobalState>(
      state: UserGlobalState,
      action: PayloadAction<UpdateFieldPayload<K>>
    ) => {
      const { field, value } = action.payload;
      state[field] = value;
    },
    saveUser: (state, action: PayloadAction<IResult<UserDto>>) => {
      const { data } = action.payload;
      if (data) {
        state.id = data.id || "";
        state.email = data.email || "";
        state.name = data.name || "";
        state.roleId = data.roleId || "";
        state.avatar = data.avatar || "";
        state.createdAt =
          typeof data.createdAt === "string"
            ? data.createdAt
            : data.createdAt?.toISOString() || "";
        state.updatedAt =
          typeof data.updatedAt === "string"
            ? data.updatedAt
            : data.updatedAt?.toISOString() || "";
        state.banned = data.banned || false;
        state.Role = data.Role
          ? {
              id: data.Role.id,
              name: data.Role.name,
            }
          : null;
        state.tokens.accessToken = action.payload.token || null;
        state.tokens.refreshToken = action.payload.token || null;
      }
    },
  },
});

export const { storeTokens, removeUser, updateField, saveUser } =
  userSlice.actions;
export const selectUser = (state: RootState) => state.user;
export const isAuthenticated = (state: RootState) =>
  state.user.tokens.accessToken ? true : false;
export default userSlice.reducer;
