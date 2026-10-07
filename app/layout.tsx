import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Wexlogic CRM",
  description: "Wexlogic CMS and CRM portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      publishableKey={
        process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
        "pk_test_c2V0dGxpbmcta2l0LTIxNzMuY2xlcmsuYWNjb3VudHMuZGV2JA"
      }
      appearance={{
        variables: {
          colorPrimary: "#8B5CF6",
          colorBackground: "#FFFFFF",
          colorInput: "#FFFFFF",
          colorNeutral: "#1E293B",
        },
      }}
    >
      <html
        lang="en"
        className={`${outfit.variable} ${plusJakartaSans.variable} h-full antialiased font-sans`}
      >
        <body className="min-h-full flex flex-col bg-[#FFFDF5] text-[#1E293B] selection:bg-[#FBBF24] selection:text-[#1E293B]">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
