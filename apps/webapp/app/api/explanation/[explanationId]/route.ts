import { getExplanationByIdWithDetails } from '@/lib/db/explanation';
import { RequestOptionalUser, withOptionalUser } from '@/lib/with-user';
import { NextResponse } from 'next/server';

export const GET = withOptionalUser(
  async (
    request: RequestOptionalUser,
    {
      params,
    }: {
      params: Promise<{ explanationId: string }>;
    },
  ) => {
    const { explanationId } = await params;
    const explanation = await getExplanationByIdWithDetails(explanationId, request.user);
    return NextResponse.json(explanation);
  },
);
