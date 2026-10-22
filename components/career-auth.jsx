"use client";
import { SignIn, SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";
export default function CareerAuth({ signup = false }) {
  const { resolvedTheme } = useTheme();
  const appearance = {
    baseTheme: resolvedTheme === "dark" ? dark : undefined,
    variables: { colorPrimary: "#325bea", borderRadius: "10px", fontFamily: "Arial, sans-serif", fontSize: "14px" },
    elements: {
      rootBox: "cw-clerk-root", cardBox: "cw-clerk-card", card: "cw-clerk-inner",
      header: "cw-clerk-header", headerTitle: "cw-clerk-title", headerSubtitle: "cw-clerk-subtitle",
      main: "cw-clerk-main", form: "cw-clerk-fields", formFieldRow: "cw-clerk-field-row",
      formFieldInput: "cw-clerk-input", formButtonPrimary: "cw-clerk-submit",
      socialButtonsBlockButton: "cw-clerk-social", dividerRow: "cw-clerk-divider",
      footer: "cw-clerk-footer", footerAction: "cw-clerk-footer-action",
    },
  };
  return signup ? <SignUp appearance={appearance}/> : <SignIn appearance={appearance}/>;
}
