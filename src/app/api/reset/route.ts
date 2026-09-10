import { NextResponse } from 'next/server';
import { resetEntireDb } from '@/lib/fileDb';

export async function POST() {
  try {
    resetEntireDb();
    return NextResponse.json({
      success: true,
      message: 'Clean slate restored. Database wiped successfully.',
    });
  } catch (err: any) {
    console.error('Error resetting file database:', err);
    return NextResponse.json({ error: 'Failed to reset database' }, { status: 500 });
  }
}
