import { Database } from "@libsql/client";
import 'dotenv/config';

const db = new Database({
  url: "libsql://staffdashboarddb-qsssesammyinkr.aws-ap-south-1.turso.io",
  authToken: process.env.TURSO_AUTH_TOKEN
});

export default async function handler(req,res){
  if(req.method === "GET"){
    const result = await db.execute("SELECT * FROM reports ORDER BY date DESC");
    res.status(200).json(result.rows);
  } else if(req.method === "POST"){
    const { user, report } = req.body;
    const date = new Date().toISOString();
    await db.execute("INSERT INTO reports (user, report, date) VALUES (?, ?, ?)", [user, report, date]);
    res.status(200).json({success:true});
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
