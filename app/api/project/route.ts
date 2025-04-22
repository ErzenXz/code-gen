import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Get all projects
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch projects', detail: error }, { status: 500 });
  }
}

// Create a new project
export async function POST(req: Request) {
  try {
    const { name, description } = await req.json();
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    const project = await prisma.project.create({
      data: { name, description },
    });
    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create project', detail: error }, { status: 500 });
  }
}
