import path from "path";
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Serve static files from the React build folder
const buildPath = path.join(__dirname, '../../client/dist');
app.use(express.static(buildPath));

app.post('/api/greet', (req: { body: { name: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { message: string; }): void; new(): any; }; }; }) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Name is required.' });
  }
  res.status(200).json({ message: `Hello, ${name}! Welcome to the app.` });
});

// Serve React frontend for all other routes
app.get('*', (req: any, res: { sendFile: (arg0: string) => void; }) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
