import { NextRequest, NextResponse } from 'next/server';
import { createClient } from 'redis';

async function getRedisClient() {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  const client = createClient({ url: redisUrl });

  client.on('error', (err) => {
    console.error('Redis Client Error', err);
  });

  await client.connect();
  return client;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pattern } = body;

    const client = await getRedisClient();

    if (pattern) {
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(keys);
      }
    } else {
      await client.flushDb();
    }

    await client.quit();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Redis CLEAR error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}



