import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDb, COLLECTIONS } from '@/lib/firebase';
import { FieldValue } from 'firebase-admin/firestore';

export interface Comment {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  userImage?: string;
  content: string;
  createdAt: string;
}

// GET /api/comments?projectId=xxx - Get comments for a project
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Missing projectId parameter' },
        { status: 400 }
      );
    }

    const db = getDb();
    const snapshot = await db
      .collection(COLLECTIONS.COMMENTS)
      .where('projectId', '==', projectId)
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();

    const comments: Comment[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      comments.push({
        id: doc.id,
        projectId: data.projectId,
        userId: data.userId,
        userName: data.userName,
        userImage: data.userImage,
        content: data.content,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      });
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error('Comments GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/comments - Add a comment (requires auth)
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { projectId, content } = body;

    if (!projectId || !content) {
      return NextResponse.json(
        { error: 'Missing projectId or content' },
        { status: 400 }
      );
    }

    if (content.length > 2000) {
      return NextResponse.json(
        { error: 'Comment too long (max 2000 characters)' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Verify project exists
    const projectDoc = await db.collection(COLLECTIONS.REPOSITORIES).doc(projectId).get();
    if (!projectDoc.exists) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Create comment
    const commentData = {
      projectId,
      userId: session.user.id || session.user.email,
      userName: session.user.name || 'Anonymous',
      userImage: session.user.image || undefined,
      content: content.trim(),
      createdAt: FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection(COLLECTIONS.COMMENTS).add(commentData);

    const comment: Comment = {
      id: docRef.id,
      projectId,
      userId: commentData.userId as string,
      userName: commentData.userName,
      userImage: commentData.userImage,
      content: commentData.content,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error('Comments POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/comments?id=xxx - Delete a comment (only owner can delete)
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('id');

    if (!commentId) {
      return NextResponse.json(
        { error: 'Missing comment id' },
        { status: 400 }
      );
    }

    const db = getDb();
    const commentRef = db.collection(COLLECTIONS.COMMENTS).doc(commentId);
    const commentDoc = await commentRef.get();

    if (!commentDoc.exists) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    const commentData = commentDoc.data();
    const userId = session.user.id || session.user.email;

    if (commentData?.userId !== userId) {
      return NextResponse.json(
        { error: 'Not authorized to delete this comment' },
        { status: 403 }
      );
    }

    await commentRef.delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Comments DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
