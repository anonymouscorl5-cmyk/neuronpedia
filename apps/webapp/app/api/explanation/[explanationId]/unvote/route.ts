import { unvote } from '@/lib/db/vote';
import { RequestAuthedUser, withAuthedUser } from '@/lib/with-user';
import { NextResponse } from 'next/server';

export const POST = withAuthedUser(
  async (request: RequestAuthedUser, { params }: { params: Promise<{ explanationId: string }> }) => {
    const { explanationId } = await params;
    return unvote(request.user.id, explanationId).then((deletedVote) => NextResponse.json(deletedVote));
  },
);
