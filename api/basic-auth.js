export default function handler(req, res) {
  const { BASIC_AUTH_USER, BASIC_AUTH_PASSWORD } = process.env;

  if (!BASIC_AUTH_USER || !BASIC_AUTH_PASSWORD) {
    return res.status(200).json({ message: 'Basic auth not configured' });
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [username, password] = credentials.split(':');

  if (username !== BASIC_AUTH_USER || password !== BASIC_AUTH_PASSWORD) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
    return res.status(401).json({ message: 'Unauthorized' });
  }

  res.status(200).json({ message: 'Authorized' });
}