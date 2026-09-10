import { NextRequest, NextResponse } from 'next/server';
import { getUserData, saveUserData, readDb } from '@/lib/fileDb';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      const db = readDb();
      return NextResponse.json({
        users: Object.values(db.users),
        communityPosts: db.communityPosts || [],
      });
    }

    const data = getUserData(userId);
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('Error reading from file db:', err);
    return NextResponse.json({ error: 'Failed to read file database' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, user, profile, dailyLogs, measurements, dietPlan, workoutPlan, communityPosts } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const result = saveUserData(userId, {
      user,
      profile,
      dailyLogs,
      measurements,
      dietPlan,
      workoutPlan,
      communityPosts,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Error saving to file db:', err);
    return NextResponse.json({ error: 'Failed to save to file database' }, { status: 500 });
  }
}
