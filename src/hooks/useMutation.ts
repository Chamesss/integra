import { useMutation as useQueryMutation } from "@tanstack/react-query";
import { IResult } from "electron/types/core.types";
import useLogout from "./useLogout";

interface MutationProps<I> {
  method: string;
  data: I;
}

export function useMutation<I, O, E = any>(key_name?: string) {
  const { logout } = useLogout();

  return useQueryMutation({
    mutationFn: async ({
      method,
      data,
    }: MutationProps<I>): Promise<IResult<O> & Record<string, any>> => {
      try {
        const response = (await window.ipcRenderer.invoke(
          method,
          data
        )) as IResult<O> & Record<string, any>;

        const result: IResult<O> & Record<string, any> = {
          ...response,
        };

        // add optional fields if they exist as keyname
        if (key_name && response[key_name] !== undefined) {
          result[key_name] = response[key_name] as E;
        }

        return result;
      } catch (error) {
        // Handle auth errors here to prevent them from bubbling up
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        const errorName = error instanceof Error ? error.name : "";

        // Check for authentication errors
        if (
          errorName === "AuthError" ||
          errorMessage.includes("Invalid token") ||
          errorMessage.includes("Unauthorized")
        ) {
          logout();

          return {
            success: false,
            message: "Session expirée, veuillez vous reconnecter.",
            error: "AUTH_BLOCKED",
            status: 401,
          } as IResult<O> & Record<string, any>;
        }

        // Re-throw other errors normally
        throw error;
      }
    },
  });
}

// usage example
// const { mutate: createCategory } = useMutation();
