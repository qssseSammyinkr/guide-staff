import { Database } from "@libsql/client";

const db = new Database({
  url: "libsql://staffdashboarddb-qsssesammyinkr.aws-ap-south-1.turso.io",
  authToken: process.env.TURSO_AUTH_TOKEN
});

export default async function handler(req, res){
  if(req.method === "POST"){
    const { username, password } = req.body;
    const result = await db.execute(
      "SELECT * FROM users WHERE username = ? AND password = ?",
      [username, password]
    );
    if(result.rows.length > 0){
      res.status(200).json({ success: true, user: result.rows[0] });
    } else {
      res.status(200).json({ success: false });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
