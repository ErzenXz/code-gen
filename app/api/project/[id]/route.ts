import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Update a project
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { name, description } = await req.json();
    const updated = await prisma.project.update({
      where: { id: params.id },
      data: { name, description },
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update project', detail: error }, { status: 500 });
  }
}

// Delete a project
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.project.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete project', detail: error }, { status: 500 });
  }
}
