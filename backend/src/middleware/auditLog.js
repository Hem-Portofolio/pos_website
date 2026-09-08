export function auditLog(req, res, next){
  const start = Date.now();
  const { method, originalUrl } = req;
  const user = req.headers.authorization ? "auth" : "anon";
  res.on("finish", ()=>{
    const ms = Date.now() - start;
    const line = `[audit] ${new Date().toISOString()} ${method} ${originalUrl} ${res.statusCode} ${ms}ms user:${user} ip:${req.ip}`;
    // di production bisa kirim ke file / external logger
    if(res.statusCode >= 400) console.warn(line);
    else if(process.env.NODE_ENV !== "production") console.log(line);
  });
  next();
}
