# Tone Formatter

A simple, privacy-focused web application that transforms your text between formal and casual tones using AI. Built with Node.js, Express, and the Groq API.

![Tone Formatter Demo](https://via.placeholder.com/800x400/2563eb/ffffff?text=Tone+Formatter+Interface)

## ✨ Features

- **🎯 Dual Tone Conversion**: Transform text to either formal or casual tone
- **🔒 Privacy-First**: No data logging, users have full control over their text
- **⚡ Fast & Lightweight**: Vanilla JavaScript frontend, no heavy frameworks
- **📱 Responsive Design**: Works seamlessly on desktop and mobile
- **🚀 Production Ready**: Configured for easy deployment on Render
- **💾 Auto-Save**: Automatic text recovery in case of browser crashes
- **⌨️ Keyboard Shortcuts**: Ctrl/Cmd + Enter for quick formatting

## 🛠 Tech Stack

- **Backend**: Node.js + Express
- **AI API**: Groq (LLaMA-3-8B model)
- **Frontend**: HTML, CSS, Vanilla JavaScript
- **Styling**: Modern CSS with Inter font
- **Hosting**: Optimized for Render deployment

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- A Groq API key ([Get one here](https://console.groq.com/))

### 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/yourusername/tone-formatter.git
cd tone-formatter

# Install dependencies
npm install
```

### 2. Environment Setup

```bash
# Copy the example environment file
cp backend/env.example backend/.env

# Edit the .env file and add your Groq API key
# GROQ_API_KEY=your_actual_api_key_here
# PORT=3000
```

### 3. Run Locally

```bash
# Start development server
npm run dev

# Or start production server
npm start
```

Visit `http://localhost:3000` to use the application.

## 🌐 Deployment on Render

### Method 1: One-Click Deploy

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/yourusername/tone-formatter)

### Method 2: Manual Deployment

1. **Create a New Web Service**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New" → "Web Service"
   - Connect your GitHub repository

2. **Configure the Service**
   ```
   Name: tone-formatter (or your preferred name)
   Environment: Node
   Region: Choose closest to your users
   Branch: main
   Build Command: npm install
   Start Command: npm start
   ```

3. **Set Environment Variables**
   - Go to "Environment" tab
   - Add: `GROQ_API_KEY` = your Groq API key
   - Add: `NODE_ENV` = production

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Your app will be available at `https://your-service-name.onrender.com`

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `GROQ_API_KEY` | Your Groq API key | Yes | - |
| `PORT` | Server port | No | 3000 |
| `NODE_ENV` | Environment mode | No | development |

### API Limits

- Maximum text length: 10,000 characters
- Request timeout: 30 seconds
- Original text preserved: No modifications or redactions applied

## 📖 Usage

### Web Interface

1. **Paste Your Text**: Copy and paste any text into the large textarea
2. **Choose Tone**: Click "Make More Formal" or "Make More Casual"
3. **Get Results**: The formatted text will replace your original text
4. **Iterate**: Continue refining by applying different tones

### Keyboard Shortcuts

- `Ctrl/Cmd + Enter`: Apply formal formatting
- `Escape`: Close error dialogs

### API Endpoint

```bash
POST /api/format
Content-Type: application/json

{
  "text": "Your text here",
  "tone": "formal" | "casual"
}
```

Response:
```json
{
  "formattedText": "Your formatted text here"
}
```

## 🔒 Privacy & Security

- **No Data Storage**: Text is never stored on servers
- **Original Text Preserved**: Your text is sent as-is to the AI service without any modifications
- **No Request Logging**: Request/response bodies are never logged
- **Secure Headers**: CORS and security headers properly configured
- **Client-Side Auto-Save**: Text saved locally for crash recovery only

## 🏗 Project Structure

```
tone-formatter/
├── backend/
│   ├── server.js          # Express server with API endpoints
│   ├── package.json       # Backend dependencies
│   └── env.example        # Environment variables template
├── frontend/
│   ├── index.html         # Main HTML file
│   ├── style.css          # Styles and responsive design
│   └── script.js          # Frontend JavaScript logic
├── package.json           # Root package file with scripts
├── .gitignore            # Git ignore rules
└── README.md             # This file
```

## 🎨 Customization

### Styling

The app uses CSS custom properties for easy theming:

```css
:root {
    --color-primary: #2563eb;      /* Primary button color */
    --color-secondary: #10b981;    /* Secondary button color */
    --color-text: #1f2937;         /* Main text color */
    /* ... more variables in style.css */
}
```

### AI Model Configuration

Edit the `callGroqAPI` function in `backend/server.js` to:
- Change the model (`llama3-8b-8192`)
- Adjust temperature for creativity
- Modify system prompts for different behaviors

## 🧪 Testing

### Manual Testing Checklist

- [ ] Text input and character counting
- [ ] Formal tone conversion
- [ ] Casual tone conversion
- [ ] Error handling (network issues, long text)
- [ ] Mobile responsiveness
- [ ] Text preservation (no unwanted modifications)
- [ ] Auto-save and recovery

### API Testing

```bash
# Test the format endpoint
curl -X POST http://localhost:3000/api/format \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello there, I hope you are doing well today.", "tone": "formal"}'

# Test health endpoint
curl http://localhost:3000/api/health
```

## 🐛 Troubleshooting

### Common Issues

**"API configuration error"**
- Ensure `GROQ_API_KEY` is set in your `.env` file
- Verify the API key is valid and active

**"External API error"**
- Check your Groq API quota and billing
- Verify network connectivity to Groq API

**Frontend not loading**
- Ensure you're accessing the correct port (default: 3000)
- Check browser console for JavaScript errors

**Deployment Issues on Render**
- Verify all environment variables are set
- Check build logs for dependency installation errors
- Ensure Node.js version compatibility (18+)

## 📝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Use ES6+ JavaScript features
- Follow the existing code style and naming conventions
- Add comments for complex logic
- Test on both desktop and mobile devices
- Ensure accessibility standards are met

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Groq](https://groq.com/) for providing fast AI inference
- [Inter Font](https://rsms.me/inter/) for beautiful typography
- [Render](https://render.com/) for seamless deployment platform

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Search through [existing issues](https://github.com/yourusername/tone-formatter/issues)
3. Create a [new issue](https://github.com/yourusername/tone-formatter/issues/new) with detailed information

---

**Made with ❤️ by [Sahil Khatri](https://github.com/yourusername)**

*Transform your writing, enhance your communication.*
