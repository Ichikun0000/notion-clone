import { readFileSync } from 'fs';
import { join } from 'path';

export default function handler(req, res) {
  const auth = req.headers.authorization;
  
  if (!auth || !auth.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Protected Area"');
    res.status(401).json({ message: 'Authentication required' });
    return;
  }
  
  const credentials = Buffer.from(auth.split(' ')[1], 'base64').toString();
  const [username, password] = credentials.split(':');
  
  // 環境変数から認証情報を取得
  const validUsername = process.env.BASIC_AUTH_USERNAME || 'admin';
  const validPassword = process.env.BASIC_AUTH_PASSWORD || 'password';
  
  if (username !== validUsername || password !== validPassword) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Protected Area"');
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }
  
  // 認証成功時は静的ファイルを返す
  const path = req.query.path || 'index.html';
  
  try {
    if (path.includes('..') || path.startsWith('/')) {
      res.status(404).json({ message: 'Not found' });
      return;
    }
    
    let filePath;
    let contentType = 'text/html';
    
    if (path === '' || path === 'index.html') {
      filePath = join(process.cwd(), 'dist', 'index.html');
    } else {
      filePath = join(process.cwd(), 'dist', path);
      
      // Content-Typeを設定
      if (path.endsWith('.js')) contentType = 'application/javascript';
      else if (path.endsWith('.css')) contentType = 'text/css';
      else if (path.endsWith('.json')) contentType = 'application/json';
      else if (path.endsWith('.png')) contentType = 'image/png';
      else if (path.endsWith('.jpg') || path.endsWith('.jpeg')) contentType = 'image/jpeg';
      else if (path.endsWith('.svg')) contentType = 'image/svg+xml';
    }
    
    const content = readFileSync(filePath);
    res.setHeader('Content-Type', contentType);
    res.status(200).send(content);
  } catch (error) {
    // ファイルが見つからない場合はindex.htmlを返す（SPAのルーティング対応）
    try {
      const indexContent = readFileSync(join(process.cwd(), 'dist', 'index.html'));
      res.setHeader('Content-Type', 'text/html');
      res.status(200).send(indexContent);
    } catch {
      res.status(404).json({ message: 'Not found' });
    }
  }
}