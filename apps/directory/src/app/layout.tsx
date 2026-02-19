import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getProject } from "@/lib/data";
import { getTheme, buildThemeCss } from "@/lib/theme";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const project = await getProject();
  const seo =
    (project?.settings?.seo as {
      defaultTitle?: string;
      defaultDescription?: string;
      titleTemplate?: string;
    }) ?? {};

  return {
    title: {
      default: seo.defaultTitle ?? project?.name ?? "Directory",
      template:
        seo.titleTemplate ?? `%s | ${project?.name ?? "Directory"}`,
    },
    description: seo.defaultDescription ?? "Browse our directory",
    metadataBase: project?.domain
      ? new URL(`https://${project.domain}`)
      : undefined,
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const project = await getProject();
  const theme = getTheme((project?.settings as Record<string, unknown>) ?? {});
  const themeCss = buildThemeCss(theme);

  return (
    <html lang="en">
      <head>
        <style>{`:root { ${themeCss} }`}</style>
      </head>
      <body
        className={inter.className}
        style={{
          background: "var(--theme-background)",
          color: "var(--theme-foreground)",
          fontFamily: "var(--theme-font-body)",
        }}
      >
        {children}
      </body>
    </html>
  );
}
