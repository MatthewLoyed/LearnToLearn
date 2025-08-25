import type { Metadata } from "next";
import "./globals.css";
import { ProgressProvider } from "@/contexts/ProgressContext";

export const metadata: Metadata = {
  title: "Skill Forge - Learn anything, faster",
  description: "Generate personalized learning roadmaps powered by AI. Master any skill with structured paths, curated resources, and smart progress tracking.",
  keywords: ["learning", "education", "roadmap", "AI", "skills", "tutorials", "courses"],
  authors: [{ name: "Skill Forge Team" }],
  creator: "Skill Forge",
  openGraph: {
    title: "Skill Forge - Learn anything, faster",
    description: "Generate personalized learning roadmaps powered by AI. Master any skill with structured paths, curated resources, and smart progress tracking.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Skill Forge - Learn anything, faster",
    description: "Generate personalized learning roadmaps powered by AI. Master any skill with structured paths, curated resources, and smart progress tracking.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased" suppressHydrationWarning={true}>
        <ProgressProvider>
          {children}
        </ProgressProvider>
      </body>
    </html>
  );
}
