import React from "react";
import { siteConfig } from "@/lib/site-config";

export const metadata = {
  title: "Account Authentication",
  description: "Sign in or register for CareerWise, the AI-powered career intelligence platform.",
  robots: {
    index: true,
    follow: true,
  },
};

const AuthLayout = ({ children }) => {
  return <div className="flex justify-center pt-40">{children}</div>;
};

export default AuthLayout;