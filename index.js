const express = require('express');
const cors = require('cors');
const dbConnect = require('./mongodb');
const { v4: uuidv4 } = require('uuid');
const Tracking = require('./model/trackschema');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 7000;

app.use(cors());
app.use(express.json());

// Database Connect
dbConnect();

// Send mail
app.post('/send-mail', async (req, res) => {
  try {
    const { emails, password } = req.body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ error: 'emails must be a non-empty array' });
    }

    if (!password || password !== process.env.PASSWORD) {
      return res.status(400).json({ error: 'password is required and must match the environment password' });
    }

    const trackingId = uuidv4();
    await Tracking.create({trackingId});
    //Mail send

  } catch (error) {
    console.error('Error in send-mail endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Ping endpoint
app.get('/ping', (req, res) => {
  res.send('pong');
});

// Start server
app.listen(port, () => {
  console.log(`Server running at port ${port}`);
});