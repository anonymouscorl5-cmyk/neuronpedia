import { getSourceSet } from '@/lib/db/source';
import { RequestOptionalUser, withOptionalUser } from '@/lib/with-user';

import { NextResponse } from 'next/server';

export const GET = withOptionalUser(
  async (
    request: RequestOptionalUser,
    {
      params,
    }: {
      params: Promise<{ modelId: string; name: string }>;
    },
  ) => {
    const { modelId, name } = await params;
    const sourceSet = await getSourceSet(modelId, name, request.user);
    return NextResponse.json(sourceSet);
  },
);
