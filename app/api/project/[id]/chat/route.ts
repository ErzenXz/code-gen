import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Get chat threads for a project
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const threads = await prisma.chatThread.findMany({
      where: { projectId: params.id },
      include: { messages: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(threads);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch threads', detail: error }, { status: 500 });
  }
}

// Send a message to AI (create or use thread)
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { message, threadId } = await req.json();
    let thread;
    if (threadId) {
      thread = await prisma.chatThread.findUnique({ where: { id: threadId }, include: { messages: true } });
    } else {
      thread = await prisma.chatThread.create({
        data: { projectId: params.id, title: message.slice(0, 32) },
        include: { messages: true },
      });
    }
    if (!thread) return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    // Add user message
    const userMsg = await prisma.chatMessage.create({
      data: { threadId: thread.id, content: message, sender: 'user' },
    });
    // TODO: AI response logic goes here
    const aiMsg = await prisma.chatMessage.create({
      data: { threadId: thread.id, content: 'AI: (response coming soon)', sender: 'ai' },
    });
    return NextResponse.json({ threadId: thread.id, messages: [userMsg, aiMsg] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send message', detail: error }, { status: 500 });
  }
}
