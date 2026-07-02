import { NextResponse } from "next/server";
import axios from "axios";

// Pull the secure internal endpoint signature safely from environment configuration profiles
const BACKEND_PATH = process.env.NEXT_PUBLIC_BACKEND_PATH || "";

export async function GET() {
  try {
    // 🔑 Secure server-to-server request dispatching block
    const { data } = await axios.get(`${BACKEND_PATH}/courses?format=json`);
    const fetchedCourses = data?.courses || [];

    // Return an explicit, optimized JSON payload structure
    return NextResponse.json(
      { success: true, courses: fetchedCourses },
      { status: 200 }
    );
  } catch (err: any) {
    const errorMessage =
      err.response?.data?.response ||
      err.response?.data?.message ||
      err.message ||
      "An integrated server error occurred while retrieving courses.";

    console.error("Route Handler Error [/api/courses]:", errorMessage);

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: err.response?.status || 500 }
    );
  }
}