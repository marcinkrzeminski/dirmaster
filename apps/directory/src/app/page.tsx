import { notFound } from "next/navigation";
import { getProject, getPublishedEntries } from "@/lib/data";
import { getTheme } from "@/lib/theme";
import { MinimalTemplate } from "@/components/templates/MinimalTemplate";
import { BoldTemplate } from "@/components/templates/BoldTemplate";
import { ClassicTemplate } from "@/components/templates/ClassicTemplate";

export const revalidate = 3600; // ISR: revalidate every hour

export default async function HomePage() {
  const [project, entries] = await Promise.all([getProject(), getPublishedEntries()]);

  if (!project) {
    notFound();
  }

  const theme = getTheme((project.settings as Record<string, unknown>) ?? {});

  switch (theme.template) {
    case "bold":
      return <BoldTemplate project={project} entries={entries} />;
    case "classic":
      return <ClassicTemplate project={project} entries={entries} />;
    default:
      return <MinimalTemplate project={project} entries={entries} />;
  }
}
