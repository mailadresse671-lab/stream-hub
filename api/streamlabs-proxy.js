export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const token = process.env.STREAMLABS_SOCKET_TOKEN;

  if (!token) {
    return res.status(500).json({
      success: false,
      message: 'STREAMLABS_SOCKET_TOKEN ist nicht als Vercel-Umgebungsvariable gesetzt.'
    });
  }

  return res.status(200).json({ success: true, token });
}
