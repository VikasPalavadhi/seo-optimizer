# SEO & Schema Genius

Enterprise SEO optimization tool powered by AI (Google Gemini & OpenAI GPT-4). Generate SEO variants, schema markup, and strategic recommendations for your web pages.

**🚀 Auto-deployment enabled**: Changes pushed to main branch automatically deploy to production at https://seo.xopenai.in

> Last updated: 2026-02-04

## Features

- **Dual AI Model Support**: Choose between Google Gemini 2.0 Flash or OpenAI GPT-4o
- **3 SEO Variant Generation**: Get multiple optimized SEO strategies for any page
- **Schema.org JSON-LD**: Automatic structured data generation
- **Strategic Impact Scoring**: Visibility, Trust, and Compliance scores
- **Interactive Chat Assistant**: Refine variants and schema with AI assistance
- **Brand Profile Management**: Support for multiple brand identities
- **History Tracking**: Save and review past generations

## Tech Stack

**Frontend:**
- React 19.2.4
- TypeScript
- Tailwind CSS
- Vite

**Backend:**
- Node.js + Express
- Google Gemini API
- OpenAI API
- Security: Helmet, CORS, Rate Limiting

## Installation

### Prerequisites
- Node.js 18+ (recommended: v22.x)
- npm or yarn
- Google Gemini API key
- OpenAI API key

### Setup

1. **Clone the repository:**
```bash
git clone <your-repo-url>
cd seo-schema-generator
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment variables:**
```bash
cp .env.example .env
```

Edit `.env` and add your API keys:
```env
API_KEY=your_gemini_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
PORT=3001
NODE_ENV=development
```

4. **Run development servers:**
```bash
# Terminal 1: Frontend (port 3000)
npm run dev:frontend

# Terminal 2: Backend (port 3001)
npm run dev:backend
```

5. **Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## Production Deployment

### Build Frontend
```bash
npm run build
```

This creates optimized files in the `dist/` directory.

### Digital Ocean Deployment (Following xopenai.in Pattern)

1. **SSH into server:**
```bash
ssh -i ~/.ssh/id_ed25519_digitalocean root@64.227.187.111
```

2. **Clone repository:**
```bash
cd /root
git clone <your-repo-url> seo-schema-generator
cd seo-schema-generator
```

3. **Install dependencies:**
```bash
npm install --production
```

4. **Configure environment:**
```bash
nano .env
# Add your production API keys and set:
# PORT=3006 (use a different port from webpage-builder which is on 3005)
# NODE_ENV=production
```

5. **Build frontend:**
```bash
npm run build
```

6. **Copy to web directory:**
```bash
sudo mkdir -p /var/www/seo-schema-generator
sudo cp -r dist/* /var/www/seo-schema-generator/
sudo chown -R www-data:www-data /var/www/seo-schema-generator
```

7. **Configure Nginx:**

Create `/etc/nginx/sites-available/seo-schema-generator`:

```nginx
server {
    listen 80;
    server_name seo.xopenai.in;  # or your subdomain

    root /var/www/seo-schema-generator;
    index index.html;

    # Frontend - SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:3006;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/seo-schema-generator /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

8. **Set up SSL (Let's Encrypt):**
```bash
sudo certbot --nginx -d seo.xopenai.in
```

9. **Configure PM2:**
```bash
cd /root/seo-schema-generator
pm2 start server.js --name seo-schema-generator-api
pm2 save
```

10. **Verify deployment:**
```bash
pm2 list                           # Backend should be "online"
sudo systemctl status nginx        # Should be "active"
curl -I https://seo.xopenai.in     # Should return 200 OK
```

## Updating Production

### Frontend Changes:
```bash
cd /root/seo-schema-generator
git pull
npm run build
sudo cp -r dist/* /var/www/seo-schema-generator/
sudo chown -R www-data:www-data /var/www/seo-schema-generator
```

### Backend Changes:
```bash
cd /root/seo-schema-generator
git pull
npm install --production
pm2 restart seo-schema-generator-api
pm2 logs seo-schema-generator-api
```

## Project Structure

```
seo-schema-generator/
├── components/           # React components
│   ├── ChatBot.tsx      # AI chat assistant
│   ├── Generator.tsx    # Main form
│   ├── Layout.tsx       # App layout
│   ├── Login.tsx        # Auth screen
│   └── ResultsView.tsx  # SEO results display
├── services/
│   └── geminiService.ts # AI API integration
├── types.ts             # TypeScript types
├── constants.ts         # Brand profiles & configs
├── server.js            # Express backend API
├── index.html           # HTML entry point
├── index.tsx            # React entry point
├── App.tsx              # Main React component
├── .env.example         # Environment template
└── package.json         # Dependencies
```

## API Endpoints

### POST /api/generate
Generate SEO variants and schema for a URL or content.

**Request:**
```json
{
  "input": "https://example.com",
  "profile": { ...brandProfile },
  "isUrl": true,
  "modelProvider": "gemini|openai"
}
```

### POST /api/chat
Chat with AI assistant about SEO variants.

**Request:**
```json
{
  "messages": [
    { "role": "user", "content": "Create a conversion-focused variant" }
  ],
  "context": { ...currentGeneration }
}
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `API_KEY` | Google Gemini API key | Yes |
| `GEMINI_API_KEY` | Google Gemini API key (same as API_KEY) | Yes |
| `OPENAI_API_KEY` | OpenAI API key | Yes |
| `PORT` | Backend port (default: 3001, use 3006 for production) | No |
| `NODE_ENV` | Environment (development/production) | No |

## Security Features

- **Rate Limiting**: 20 requests per 15 minutes per IP
- **CORS Protection**: Configured allowed origins
- **Helmet Security Headers**: XSS, clickjacking protection
- **API Key Server-Side**: Keys never exposed to frontend
- **Input Validation**: Request payload validation

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## License

MIT
