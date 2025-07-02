const express = require('express');
const cors = require('cors');


const app = express();
const port = process.env.PORT || 7000;

app.use(cors())

// Ping endpoint
app.get('/ping', (req, res) => {
  res.send('pong');
});

// Start server
app.listen(port, () => {
  console.log(`Server running at ${port}`);
});
