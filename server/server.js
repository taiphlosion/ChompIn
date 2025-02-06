const express = require('express');
const pool = require('./db');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});

app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()'); // Query the database
    res.json({ message: 'Database connected!', time: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Database connection failed' });
  }
});

app.listen(5000, () => console.log('Server running on port 5000'));
