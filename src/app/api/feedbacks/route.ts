import { NextResponse } from "next/server";
import axios from "axios";

const BACKEND_PATH = process.env.NEXT_PUBLIC_BACKEND_PATH || "";

export async function GET() {
  try {
    // 🔑 Secure server-to-server request dispatching block
    const { data } = await axios.get(`${BACKEND_PATH}/all-feedbacks`);

    return NextResponse.json(
      { success: true, feedbacks: data || [] },
      { status: 200 }
    );
  } catch (err: any) {
    const errorMessage =
      err.response?.data?.response ||
      err.response?.data?.message ||
      err.message ||
      "An integrated server error occurred while syncing feedback records.";

    console.error("Route Handler Error [/api/feedbacks]:", errorMessage);

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: err.response?.status || 500 }
    );
  }
}