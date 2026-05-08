import { getExplanationById } from '@/lib/db/explanation';
import { vote } from '@/lib/db/vote';
import { RequestAuthedUser, withAuthedUser } from '@/lib/with-user';
import { NextResponse } from 'next/server';

export const POST = withAuthedUser(
  async (request: RequestAuthedUser, { params }: { params: Promise<{ explanationId: string }> }) => {
    const { explanationId } = await params;
    const explanation = await getExplanationById(explanationId, request.user);
    if (!explanation) {
      throw new Error('Explanation not found');
    }

    const result = await vote(request.user.id, explanation.id);

    return NextResponse.json(result);
  },
);
