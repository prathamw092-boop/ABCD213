import { NextResponse } from "next/server";
const ADMIN_EMAILS = [
  "prathamwadiyar@gmail.com",
  "prathamw092@gmail.com"
];
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!ADMIN_EMAILS.includes(email)) {
      return NextResponse.json(
        { message: "Access denied. Not an authorized admin." },
        { status: 403 }
      );
    }
    if (password === "admin123") {
      return NextResponse.json({ success: true, message: "Login successful" });
    } else {
      return NextResponse.json(
        { message: "Invalid password for admin account" },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 