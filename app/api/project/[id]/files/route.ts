import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Get all files and folders for a project
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const folders = await prisma.folder.findMany({
      where: { projectId: params.id, parentId: null },
      include: { files: true, children: { include: { files: true, children: true } } },
      orderBy: { name: 'asc' },
    });
    const files = await prisma.file.findMany({
      where: { projectId: params.id, folderId: null },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ folders, files });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch files/folders', detail: error }, { status: 500 });
  }
}

// Create a file or folder
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { type, name, parentId, content } = await req.json();
    if (type === 'folder') {
      const folder = await prisma.folder.create({
        data: { name, parentId, projectId: params.id },
      });
      return NextResponse.json(folder);
    } else if (type === 'file') {
      const file = await prisma.file.create({
        data: { name, folderId: parentId, projectId: params.id, content: content || '' },
      });
      return NextResponse.json(file);
    }
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create file/folder', detail: error }, { status: 500 });
  }
}
