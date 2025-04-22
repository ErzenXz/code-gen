import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ProjectWorkspace from '@/components/project-workspace';

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      folders: { include: { files: true } },
      files: true,
      chatThreads: { include: { messages: true } },
    },
  });
  if (!project) return notFound();
  return <ProjectWorkspace project={project} />;
}
