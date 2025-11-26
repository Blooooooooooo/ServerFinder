# ServerFinder Website

A modern, beautiful website for the ServerFinder Discord bot. Browse and discover thousands of Discord servers with an intuitive interface.

## 🚀 Features

- **Server Browser**: Search and filter through Discord servers
- **A-Z Categories**: Browse servers alphabetically
- **Trending Servers**: See what's popular this week
- **Real-time Stats**: Live server counts and search statistics
- **Premium Design**: Modern Discord-themed UI with glassmorphism effects

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB Atlas
- **Deployment**: Netlify

## 📋 Prerequisites

- Node.js 20 or higher
- MongoDB connection string

## 🔧 Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env.local` file in the root directory:
   ```
   MONGODB_URI=your_mongodb_connection_string
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🌐 Deployment to Netlify

### Option 1: Netlify CLI

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**:
   ```bash
   netlify login
   ```

3. **Deploy**:
   ```bash
   netlify deploy --prod
   ```

### Option 2: GitHub Integration

1. Push your code to a GitHub repository
2. Go to [Netlify](https://app.netlify.com/)
3. Click "Add new site" → "Import an existing project"
4. Connect your GitHub repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
6. Add environment variables in Netlify dashboard:
   - `MONGODB_URI`: Your MongoDB connection string
7. Deploy!

## 📁 Project Structure

```
website/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── servers/       # Server endpoints
│   │   └── stats/         # Statistics endpoint
│   ├── servers/           # Server browser page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Homepage
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── HeroSection.tsx
│   ├── Navigation.tsx
│   ├── ServerCard.tsx
│   └── StatsCard.tsx
├── lib/                   # Utilities
│   └── mongodb.ts         # Database connection
├── models/                # Mongoose models
│   ├── Server.ts
│   └── Search.ts
├── public/                # Static assets
├── .env.local             # Environment variables (not in git)
├── netlify.toml           # Netlify configuration
├── next.config.js         # Next.js configuration
├── tailwind.config.ts     # Tailwind configuration
└── package.json
```

## 🔑 Environment Variables

- `MONGODB_URI`: MongoDB Atlas connection string

## 📝 API Endpoints

- `GET /api/servers` - Fetch servers (with pagination, search, filters)
  - Query params: `page`, `limit`, `search`, `letter`
- `GET /api/servers/trending` - Fetch trending servers
- `GET /api/stats` - Fetch overall statistics

## 🎨 Design

The website features a modern Discord-themed design with:
- Glassmorphism effects
- Smooth animations
- Responsive layout
- Dark mode optimized
- Custom color palette based on Discord branding

## 📄 License

This project is part of the ServerFinder Discord bot ecosystem.

## 🤝 Support

For issues or questions, please contact the bot administrators.
