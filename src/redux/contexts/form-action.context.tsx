import { createContext, useContext, useState, ReactNode } from "react";

export interface FormActionContextType {
  isOnAction: boolean;
  setIsOnAction: (isOnAction: boolean) => void;
}

export const FormActionContext = createContext<
  FormActionContextType | undefined
>(undefined);

export const useFormAction = () => {
  const context = useContext(FormActionContext);
  if (context === undefined) {
    throw new Error("useFormAction must be used within a FormActionProvider");
  }
  return context;
};

interface FormActionProviderProps {
  children: ReactNode;
}

export const FormActionProvider = ({ children }: FormActionProviderProps) => {
  const [isOnAction, setIsOnAction] = useState(false);

  return (
    <FormActionContext.Provider value={{ isOnAction, setIsOnAction }}>
      {children}
    </FormActionContext.Provider>
  );
};
