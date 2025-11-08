import { connectDB, User, Log } from './_db';

const ROLE_PASSWORDS = {
  owner: "coremaster123",
  admin: "adminpass123",
  mod: "modpass123",
  helper: "helperpass123"
};

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { username, role, password } = body || {};
    const ip = (req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown").split(",")[0].trim();

    if (!username || !role || !password) {
      await Log.create({ username, role, ip, action: "login failed - missing fields" });
      return new Response(JSON.stringify({ success: false, message: "Missing fields" }), { status: 400 });
    }

    if (password !== ROLE_PASSWORDS[role]) {
      await Log.create({ username, role, ip, action: "login failed - wrong password" });
      return new Response(JSON.stringify({ success: false, message: "Senha incorreta" }), { status: 401 });
    }

    const users = await User.find({});
    if (users.length === 0 && role !== "owner") {
      await Log.create({ username, role, ip, action: "First setup denied - not owner" });
      return new Response(JSON.stringify({ success: false, message: "O primeiro usuário deve ser Owner." }), { status: 403 });
    }

    let user = await User.findOne({ username, role });
    if (!user) {
      user = await User.create({ username, role, ip });
      await Log.create({ username, role, ip, action: "user registered" });
      return new Response(JSON.stringify({ success: true, message: "Registrado com sucesso" }));
    }

    if (user.ip !== ip) {
      await Log.create({ username, role, ip, action: "IP mismatch - denied" });
      return new Response(JSON.stringify({ success: false, message: "Acesso negado: IP não autorizado" }), { status: 403 });
    }

    await Log.create({ username, role, ip, action: "login success" });
    return new Response(JSON.stringify({ success: true, message: "Acesso concedido" }));
  } catch (err) {
    console.error("login error", err);
    return new Response(JSON.stringify({ success: false, message: "Erro no servidor" }), { status: 500 });
  }
}
