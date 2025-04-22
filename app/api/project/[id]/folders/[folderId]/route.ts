import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Get a folder
export async function GET(_req: Request, { params }: { params: { folderId: string } }) {
  try {
    const folder = await prisma.folder.findUnique({
      where: { id: params.folderId },
      include: { files: true, children: true },
    });
    if (!folder) return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    return NextResponse.json(folder);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch folder', detail: error }, { status: 500 });
  }
}

// Update a folder
export async function PATCH(req: Request, { params }: { params: { folderId: string } }) {
  try {
    const { name, parentId } = await req.json();
    const folder = await prisma.folder.update({
      where: { id: params.folderId },
      data: { name, parentId },
    });
    return NextResponse.json(folder);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update folder', detail: error }, { status: 500 });
  }
}

// Delete a folder
export async function DELETE(_req: Request, { params }: { params: { folderId: string } }) {
  try {
    // First, recursively delete all subfolders and their files
    const deleteFolder = async (folderId: string) => {
      // Get all subfolders
      const subfolders = await prisma.folder.findMany({
        where: { parentId: folderId },
      });
      
      // Recursively delete each subfolder
      for (const subfolder of subfolders) {
        await deleteFolder(subfolder.id);
      }
      
      // Delete all files in this folder
      await prisma.file.deleteMany({
        where: { folderId },
      });
      
      // Delete the folder itself
      await prisma.folder.delete({
        where: { id: folderId },
      });
    };
    
    await deleteFolder(params.folderId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete folder', detail: error }, { status: 500 });
  }
}
