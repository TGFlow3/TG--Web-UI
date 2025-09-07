require('dotenv').config();
const express = require('express')
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/save-file', async (req, res) => {
  const { path, content, sha, message } = req.body;
  const repo = 'tralyonh4/TG--Web-UI';
  const token = process.env.GITHUB_TOKEN;
  const apiUrl = `https://api.github.com/repos/${repo}/contents/${path}`;

  const response = await fetch(apiUrl, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: message || 'Edit file via web app',
      content: Buffer.from(content).toString('base64'),
      sha: sha
    })
  });

  const data = await response.json();
  if (response.ok) {
    res.json({ success: true, data });
  } else {
    res.status(response.status).json({ success: false, error: data });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));