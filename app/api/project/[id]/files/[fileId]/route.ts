import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Get a file
export async function GET(_req: Request, { params }: { params: { fileId: string } }) {
  try {
    const file = await prisma.file.findUnique({ where: { id: params.fileId } });
    if (!file) return NextResponse.json({ error: 'File not found' }, { status: 404 });
    return NextResponse.json(file);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch file', detail: error }, { status: 500 });
  }
}

// Update a file
export async function PATCH(req: Request, { params }: { params: { fileId: string } }) {
  try {
    const { name, content } = await req.json();
    const file = await prisma.file.update({
      where: { id: params.fileId },
      data: { name, content },
    });
    return NextResponse.json(file);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update file', detail: error }, { status: 500 });
  }
}

// Delete a file
export async function DELETE(_req: Request, { params }: { params: { fileId: string } }) {
  try {
    await prisma.file.delete({ where: { id: params.fileId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete file', detail: error }, { status: 500 });
  }
}
