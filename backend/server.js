const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Global project usage counter (persistent)
const fs = require('fs');
const statsFile = path.join(__dirname, 'usage-stats.json');

// Load existing stats or create new
let projectStats = { totalCalls: 0 };
try {
  if (fs.existsSync(statsFile)) {
    projectStats = JSON.parse(fs.readFileSync(statsFile, 'utf8'));
  }
} catch (error) {
  console.log('Starting with fresh usage stats');
}

// Save stats to file
const saveStats = () => {
  try {
    fs.writeFileSync(statsFile, JSON.stringify(projectStats, null, 2));
  } catch (error) {
    console.error('Could not save usage stats:', error);
  }
};

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// PII Redaction Middleware
const redactPII = (text) => {
  if (!text || typeof text !== 'string') return text;
  
  // Email redaction pattern
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  // Phone number patterns (various formats)
  const phonePattern = /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g;
  // SSN pattern
  const ssnPattern = /\b\d{3}-\d{2}-\d{4}\b/g;
  
  let redactedText = text
    .replace(emailPattern, '[EMAIL_REDACTED]')
    .replace(phonePattern, '[PHONE_REDACTED]')
    .replace(ssnPattern, '[SSN_REDACTED]');
    
  return redactedText;
};

// Groq API integration
const callGroqAPI = async (text, tone) => {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY environment variable is not set');
  }

  const systemPrompt = tone === 'formal' 
    ? "You are a professional writing assistant. Rewrite the given text to make it more formal, professional, and polished while preserving the original meaning. Return ONLY the rewritten text with no explanations, alternatives, or prefixes."
    : "You are a casual writing assistant. Rewrite the given text to make it more casual, conversational, and relaxed while preserving the original meaning. Return ONLY the rewritten text with no explanations, alternatives, or prefixes.";

  const payload = {
    messages: [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: `Rewrite this text to be more ${tone}. Return only the rewritten text with no additional commentary:\n\n${text}`
      }
    ],
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    temperature: 0.3,
    max_tokens: 512
  };

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Groq API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error calling Groq API:', error.message);
    throw error;
  }
};

// Routes
app.post('/api/format', async (req, res) => {
  try {
    const { text, tone } = req.body;

    // Validate input
    if (!text || !tone) {
      return res.status(400).json({ 
        error: 'Both text and tone are required' 
      });
    }

    if (!['formal', 'casual'].includes(tone)) {
      return res.status(400).json({ 
        error: 'Tone must be either "formal" or "casual"' 
      });
    }

    if (text.length > 10000) {
      return res.status(400).json({ 
        error: 'Text is too long. Maximum 10,000 characters allowed.' 
      });
    }

    // Redact PII before sending to API
    const redactedText = redactPII(text);
    
    // Increment global project usage
    projectStats.totalCalls++;
    saveStats();
    
    // Log request without body for privacy
    console.log(`[${new Date().toISOString()}] Format request #${projectStats.totalCalls} - tone: ${tone}, text length: ${text.length}`);

    // Call Groq API
    const formattedText = await callGroqAPI(redactedText, tone);

    // Send response without logging the actual content
    res.json({ formattedText });

  } catch (error) {
    console.error('Error in /api/format:', error.message);
    
    // Don't expose internal error details to client
    if (error.message.includes('GROQ_API_KEY')) {
      res.status(500).json({ error: 'API configuration error. Please check server setup.' });
    } else if (error.message.includes('Groq API error')) {
      res.status(500).json({ error: 'External API error. Please try again later.' });
    } else {
      res.status(500).json({ error: 'Internal server error. Please try again later.' });
    }
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// Simple usage stats for public display
app.get('/api/usage', (req, res) => {
  res.json({
    totalUsage: projectStats.totalCalls,
    message: projectStats.totalCalls > 0 ? "🚀 Growing usage!" : "✨ New project!"
  });
});

// Serve frontend for all other routes (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Tone Formatter server running on port ${PORT}`);
  console.log(`📝 Frontend available at http://localhost:${PORT}`);
  console.log(`🔧 API endpoint: http://localhost:${PORT}/api/format`);
});
