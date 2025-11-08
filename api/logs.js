import { connectDB, Log } from './_db';

export async function GET() {
  await connectDB();
  const logs = await Log.find().sort({ time: -1 }).limit(200).lean();
  return new Response(JSON.stringify({ logs }));
}
