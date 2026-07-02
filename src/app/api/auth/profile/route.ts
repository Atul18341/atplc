import { NextResponse } from 'next/server';
import axios from 'axios';

const BACKEND_PATH = process.env.NEXT_PUBLIC_BACKEND_PATH || "";

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { data } = await axios.put(`${BACKEND_PATH}/profile`, body);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { response: error.response?.data?.response || "Failed to update backend profile mapping" },
      { status: error.response?.status || 500 }
    );
  }
}