import { NextResponse } from 'next/server';
import axios from 'axios';

const BACKEND_PATH = process.env.NEXT_PUBLIC_BACKEND_PATH || "";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { data } = await axios.post(`${BACKEND_PATH}/my-courses`, {
      Username: body.Username,
    });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { response: error.response?.data?.response || "Failed to retrieve user course arrays" },
      { status: error.response?.status || 500 }
    );
  }
}