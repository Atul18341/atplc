import { NextResponse } from 'next/server';
import axios from 'axios';

const BACKEND_PATH = process.env.NEXT_PUBLIC_BACKEND_PATH || "";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Authenticate user credentials
    const loginResponse = await axios.post(`${BACKEND_PATH}/login`, {
      Username: body.Username,
      Password: body.Password,
    });

    // 2. Fetch the corresponding profile payload using the returned identifier
    const profileResponse = await axios.post(`${BACKEND_PATH}/profile`, {
      Username: loginResponse.data.id,
    });

    return NextResponse.json({
      loginData: loginResponse.data,
      profileData: profileResponse.data,
    });
  } catch (error: any) {
    console.error("PROXY_LOGIN_ERROR:", error.response?.data || error.message);
    return NextResponse.json(
      { response: error.response?.data?.response || error.response?.data?.message || "Internal server proxy auth failure" },
      { status: error.response?.status || 500 }
    );
  }
}