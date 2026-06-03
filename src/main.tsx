import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ConfirmDialogProvider } from "@/components/providers/ConfirmDialogProvider";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "./context/AuthContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <ConfirmDialogProvider>
        <App />
        <Toaster />
      </ConfirmDialogProvider>
    </AuthProvider>
  </StrictMode>
);
