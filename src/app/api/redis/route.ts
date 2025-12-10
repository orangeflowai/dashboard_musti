import { NextRequest, NextResponse } from 'next/server';
import { createClient } from 'redis';

// Initialize Redis client
let redisClient: ReturnType<typeof createClient> | null = null;

async function getRedisClient() {
  if (redisClient) {
    return redisClient;
  }

  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  redisClient = createClient({ url: redisUrl });

  redisClient.on('error', (err) => {
    console.error('Redis Client Error', err);
  });

  await redisClient.connect();
  return redisClient;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 });
    }

    const client = await getRedisClient();
    const value = await client.get(key);

    if (value === null) {
      return NextResponse.json({ value: null });
    }

    return NextResponse.json({ value: JSON.parse(value) });
  } catch (error: any) {
    console.error('Redis GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value, ttl } = body;

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: 'Key and value are required' },
        { status: 400 }
      );
    }

    const client = await getRedisClient();
    const stringValue = JSON.stringify(value);

    if (ttl) {
      await client.setEx(key, ttl, stringValue);
    } else {
      await client.set(key, stringValue);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Redis SET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 });
    }

    const client = await getRedisClient();
    await client.del(key);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Redis DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}



