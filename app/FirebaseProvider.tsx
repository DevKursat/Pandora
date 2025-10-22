"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { app, auth, analytics } from "@/lib/firebase";
import { FirebaseApp } from "firebase/app";
import { Auth } from "firebase/auth";
import { Analytics } from "firebase/analytics";

interface FirebaseContextType {
  app: FirebaseApp;
  auth: Auth;
  analytics: Analytics | null;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const FirebaseProvider = ({ children }: { children: ReactNode }) => {
  return (
    <FirebaseContext.Provider value={{ app, auth, analytics }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error("useFirebase must be used within a FirebaseProvider");
  }
  return context;
};
