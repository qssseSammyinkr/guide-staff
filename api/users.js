import { connectDB, User, Log } from './_db';

export async function GET() {
  await connectDB();
  const users = await User.find().sort({ createdAt: -1 }).lean();
  return new Response(JSON.stringify({ users }));
}

export async function DELETE(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { username, by } = body || {};
    if (!username) return new Response(JSON.stringify({ success: false, message: "Missing username" }), { status: 400 });

    const deleted = await User.findOneAndDelete({ username });
    if (!deleted) return new Response(JSON.stringify({ success: false, message: "User not found" }), { status: 404 });

    await Log.create({ username: by || "unknown", role: "owner", ip: "panel", action: `removed user ${username}` });
    return new Response(JSON.stringify({ success: true, message: "User removed" }));
  } catch (err) {
    console.error("users delete error", err);
    return new Response(JSON.stringify({ success: false, message: "Server error" }), { status: 500 });
  }
}
