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
        suppressHydrationWarning
        className={`${outfit.variable} ${plusJakartaSans.variable} h-full antialiased font-sans`}
      >
        <head>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  try {
                    var stored = localStorage.getItem('theme');
                    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    if (stored === 'dark' || (!stored && prefersDark)) {
                      document.documentElement.classList.add('dark');
                    } else {
                      document.documentElement.classList.remove('dark');
                    }
                  } catch (e) {}
                })();
              `,
            }}
          />
        </head>
        <body className="min-h-full flex flex-col bg-[#F8FAFC] dark:bg-[#0B0F19] text-[#0F172A] dark:text-slate-100 selection:bg-indigo-500 selection:text-white transition-colors duration-150">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
