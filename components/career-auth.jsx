"use client";
import { SignIn, SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";
export default function CareerAuth({ signup = false }) {
  const { resolvedTheme } = useTheme();
  const appearance = { baseTheme: resolvedTheme === "dark" ? dark : undefined, variables: { colorPrimary: "#325bea", borderRadius: "10px", fontFamily: "Arial, sans-serif" }, elements: { cardBox: "cw-clerk-card", card: "cw-clerk-inner" } };
  return signup ? <SignUp appearance={appearance}/> : <SignIn appearance={appearance}/>;
}
