const express = require('express');
const cors = require('cors');
const dbConnect = require('./mongodb');
const { v4: uuidv4 } = require('uuid');
const Tracking = require('./model/trackschema');
const os = require('os');
const mongoose = require('mongoose');

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

// Server start time for uptime calculation
const serverStartTime = new Date();

// /health route code done with the Claude 👌🏻 code op mindblowing code written
app.get('/health', async (req, res) => {
  try {
    // Get system information
    const uptime = process.uptime();
    const systemUptime = os.uptime();
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    const loadAverage = os.loadavg();
    
    // Database connectivity check
    let dbStatus = 'disconnected';
    let dbResponseTime = 0;
    
    try {
      const startTime = Date.now();
      await mongoose.connection.db.admin().ping();
      dbResponseTime = Date.now() - startTime;
      dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    } catch (error) {
      dbStatus = 'error';
    }

    // Get tracking records count
    let trackingCount = 0;
    try {
      trackingCount = await Tracking.countDocuments();
    } catch (error) {
      trackingCount = 'N/A';
    }

    // Format uptime
    const formatUptime = (seconds) => {
      const days = Math.floor(seconds / 86400);
      const hours = Math.floor((seconds % 86400) / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = Math.floor(seconds % 60);
      return `${days}d ${hours}h ${minutes}m ${secs}s`;
    };

    // Format memory
    const formatMemory = (bytes) => {
      const mb = bytes / 1024 / 1024;
      return `${mb.toFixed(2)} MB`;
    };

    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      server: {
        name: 'Mail Tracking Server',
        version: '1.0.0',
        port: port,
        environment: process.env.NODE_ENV || 'development',
        uptime: formatUptime(uptime),
        startTime: serverStartTime.toISOString()
      },
      system: {
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
        hostname: os.hostname(),
        systemUptime: formatUptime(systemUptime),
        loadAverage: loadAverage.map(load => load.toFixed(2)),
        cpuCount: os.cpus().length
      },
      memory: {
        rss: formatMemory(memoryUsage.rss),
        heapTotal: formatMemory(memoryUsage.heapTotal),
        heapUsed: formatMemory(memoryUsage.heapUsed),
        external: formatMemory(memoryUsage.external),
        systemTotal: formatMemory(os.totalmem()),
        systemFree: formatMemory(os.freemem()),
        systemUsed: formatMemory(os.totalmem() - os.freemem())
      },
      database: {
        status: dbStatus,
        responseTime: `${dbResponseTime}ms`,
        host: mongoose.connection.host || 'N/A',
        name: mongoose.connection.name || 'N/A',
        trackingRecords: trackingCount
      },
      endpoints: {
        '/ping': 'Active',
        '/send-mail': 'Active',
        '/health': 'Active'
      }
    };

    // Check if request wants JSON
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.json(healthData);
    }

    // Return beautiful HTML dashboard
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Server Health Dashboard</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                padding: 20px;
                color: #333;
            }

            .container {
                max-width: 1200px;
                margin: 0 auto;
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(10px);
                border-radius: 20px;
                padding: 30px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            }

            .header {
                text-align: center;
                margin-bottom: 40px;
                position: relative;
            }

            .header::before {
                content: '';
                position: absolute;
                top: -10px;
                left: 50%;
                transform: translateX(-50%);
                width: 100px;
                height: 4px;
                background: linear-gradient(90deg, #667eea, #764ba2);
                border-radius: 2px;
            }

            .header h1 {
                font-size: 2.5em;
                color: #2c3e50;
                margin-bottom: 10px;
                font-weight: 700;
            }

            .status-badge {
                display: inline-block;
                padding: 8px 20px;
                background: linear-gradient(135deg, #2ecc71, #27ae60);
                color: white;
                border-radius: 25px;
                font-size: 0.9em;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 1px;
                animation: pulse 2s infinite;
            }

            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }

            .grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }

            .card {
                background: white;
                border-radius: 15px;
                padding: 25px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                transition: transform 0.3s ease, box-shadow 0.3s ease;
                border: 1px solid rgba(102, 126, 234, 0.1);
            }

            .card:hover {
                transform: translateY(-5px);
                box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
            }

            .card-header {
                display: flex;
                align-items: center;
                margin-bottom: 20px;
            }

            .card-icon {
                width: 40px;
                height: 40px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5em;
                margin-right: 15px;
                color: white;
            }

            .server-icon { background: linear-gradient(135deg, #3498db, #2980b9); }
            .system-icon { background: linear-gradient(135deg, #e74c3c, #c0392b); }
            .memory-icon { background: linear-gradient(135deg, #f39c12, #e67e22); }
            .database-icon { background: linear-gradient(135deg, #9b59b6, #8e44ad); }
            .endpoints-icon { background: linear-gradient(135deg, #1abc9c, #16a085); }

            .card-title {
                font-size: 1.3em;
                font-weight: 600;
                color: #2c3e50;
            }

            .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
            }

            .info-item {
                display: flex;
                flex-direction: column;
            }

            .info-label {
                font-size: 0.85em;
                color: #7f8c8d;
                margin-bottom: 5px;
                font-weight: 500;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .info-value {
                font-size: 1.1em;
                color: #2c3e50;
                font-weight: 600;
            }

            .status-indicator {
                display: inline-block;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                margin-right: 8px;
                animation: blink 1.5s infinite;
            }

            .status-connected { background: #2ecc71; }
            .status-active { background: #3498db; }
            .status-error { background: #e74c3c; }

            @keyframes blink {
                0%, 50% { opacity: 1; }
                51%, 100% { opacity: 0.3; }
            }

            .timestamp {
                text-align: center;
                margin-top: 30px;
                padding: 15px;
                background: rgba(102, 126, 234, 0.1);
                border-radius: 10px;
                font-size: 0.9em;
                color: #666;
            }

            .progress-bar {
                width: 100%;
                height: 8px;
                background: rgba(102, 126, 234, 0.2);
                border-radius: 4px;
                overflow: hidden;
                margin-top: 5px;
            }

            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #667eea, #764ba2);
                border-radius: 4px;
                transition: width 0.3s ease;
            }

            .endpoints-list {
                list-style: none;
            }

            .endpoints-list li {
                padding: 10px 0;
                border-bottom: 1px solid rgba(0, 0, 0, 0.05);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .endpoints-list li:last-child {
                border-bottom: none;
            }

            .refresh-btn {
                position: fixed;
                bottom: 30px;
                right: 30px;
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                border: none;
                border-radius: 50%;
                width: 60px;
                height: 60px;
                font-size: 1.5em;
                cursor: pointer;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                transition: all 0.3s ease;
            }

            .refresh-btn:hover {
                transform: scale(1.1);
                box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
            }

            @media (max-width: 768px) {
                .container {
                    padding: 20px;
                }
                
                .grid {
                    grid-template-columns: 1fr;
                }
                
                .info-grid {
                    grid-template-columns: 1fr;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚀 Server Health Dashboard</h1>
                <div class="status-badge">
                    <span class="status-indicator status-connected"></span>
                    ${healthData.status.toUpperCase()}
                </div>
            </div>

            <div class="grid">
                <div class="card">
                    <div class="card-header">
                        <div class="card-icon server-icon">🖥️</div>
                        <div class="card-title">Server Information</div>
                    </div>
                    <div class="info-grid">
                        <div class="info-item">
                            <div class="info-label">Name</div>
                            <div class="info-value">${healthData.server.name}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Version</div>
                            <div class="info-value">${healthData.server.version}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Port</div>
                            <div class="info-value">${healthData.server.port}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Environment</div>
                            <div class="info-value">${healthData.server.environment}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Uptime</div>
                            <div class="info-value">${healthData.server.uptime}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Started</div>
                            <div class="info-value">${new Date(healthData.server.startTime).toLocaleString()}</div>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <div class="card-icon system-icon">⚙️</div>
                        <div class="card-title">System Information</div>
                    </div>
                    <div class="info-grid">
                        <div class="info-item">
                            <div class="info-label">Platform</div>
                            <div class="info-value">${healthData.system.platform}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Architecture</div>
                            <div class="info-value">${healthData.system.arch}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Node Version</div>
                            <div class="info-value">${healthData.system.nodeVersion}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Hostname</div>
                            <div class="info-value">${healthData.system.hostname}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">System Uptime</div>
                            <div class="info-value">${healthData.system.systemUptime}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">CPU Cores</div>
                            <div class="info-value">${healthData.system.cpuCount}</div>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <div class="card-icon memory-icon">💾</div>
                        <div class="card-title">Memory Usage</div>
                    </div>
                    <div class="info-grid">
                        <div class="info-item">
                            <div class="info-label">RSS</div>
                            <div class="info-value">${healthData.memory.rss}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Heap Total</div>
                            <div class="info-value">${healthData.memory.heapTotal}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Heap Used</div>
                            <div class="info-value">${healthData.memory.heapUsed}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">External</div>
                            <div class="info-value">${healthData.memory.external}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">System Total</div>
                            <div class="info-value">${healthData.memory.systemTotal}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">System Used</div>
                            <div class="info-value">${healthData.memory.systemUsed}</div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(1)}%"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <div class="card-icon database-icon">🗄️</div>
                        <div class="card-title">Database Status</div>
                    </div>
                    <div class="info-grid">
                        <div class="info-item">
                            <div class="info-label">Status</div>
                            <div class="info-value">
                                <span class="status-indicator ${healthData.database.status === 'connected' ? 'status-connected' : 'status-error'}"></span>
                                ${healthData.database.status}
                            </div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Response Time</div>
                            <div class="info-value">${healthData.database.responseTime}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Host</div>
                            <div class="info-value">${healthData.database.host}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Database</div>
                            <div class="info-value">${healthData.database.name}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Tracking Records</div>
                            <div class="info-value">${healthData.database.trackingRecords}</div>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <div class="card-icon endpoints-icon">🌐</div>
                        <div class="card-title">API Endpoints</div>
                    </div>
                    <ul class="endpoints-list">
                        ${Object.entries(healthData.endpoints).map(([endpoint, status]) => `
                            <li>
                                <span><strong>${endpoint}</strong></span>
                                <span>
                                    <span class="status-indicator status-active"></span>
                                    ${status}
                                </span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </div>

            <div class="timestamp">
                🕐 Last updated: ${new Date(healthData.timestamp).toLocaleString()}
            </div>
        </div>

        <button class="refresh-btn" onclick="location.reload()" title="Refresh Dashboard">
            🔄
        </button>

        <script>
            // Auto-refresh every 30 seconds
            setTimeout(() => {
                location.reload();
            }, 30000);

            // Add some interactive animations
            document.querySelectorAll('.card').forEach(card => {
                card.addEventListener('mouseenter', () => {
                    card.style.transform = 'translateY(-5px) scale(1.02)';
                });
                
                card.addEventListener('mouseleave', () => {
                    card.style.transform = 'translateY(0) scale(1)';
                });
            });
        </script>
    </body>
    </html>
    `;

    res.send(html);
  } catch (error) {
    console.error('Error in health endpoint:', error);
    res.status(500).json({ error: 'Health check failed', details: error.message });
  }
});




// Start server
app.listen(port, () => {
  console.log(`Server running at port ${port}`);
});