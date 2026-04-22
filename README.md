# 🌤️ SkyPulse — Weather App

A stunning, modern weather application with real-time forecasts, dynamic animations, and a complete CI/CD pipeline.

![SkyPulse Weather App](https://img.shields.io/badge/SkyPulse-Weather%20App-6366f1?style=for-the-badge)
![CI](https://img.shields.io/badge/CI-GitHub%20Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)
![Deploy](https://img.shields.io/badge/Deploy-GitHub%20Pages-222?style=for-the-badge&logo=github&logoColor=white)

## ✨ Features

- 🔍 **City Search** with autocomplete suggestions
- 🌡️ **Current Weather** — temperature, feels-like, humidity, wind, pressure, visibility
- 📅 **5-Day Forecast** with daily high/low and weather icons
- 📍 **Geolocation** — detect your current location automatically
- 🌅 **Sunrise/Sunset** times
- 🎨 **Dynamic backgrounds** that change based on weather (sunny, rainy, cloudy, night)
- ✨ **Canvas animations** — rain drops, snowfall, twinkling stars, drifting clouds
- 🌙 **Auto dark/light mode** based on day/night at the searched city
- 📱 **Fully responsive** — mobile, tablet, and desktop
- ⚡ **Glassmorphism UI** with frosted glass effects

## 🚀 Quick Start

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/weather-app.git
cd weather-app

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check formatting |

## 🔧 Configuration

### API Key

This app uses the [OpenWeatherMap API](https://openweathermap.org/api) (free tier).

To use your own API key:
1. Sign up at [openweathermap.org](https://openweathermap.org/api)
2. Get your free API key
3. Replace the `API_KEY` in `src/js/api.js`

### GitHub Pages Deployment

1. Push to a GitHub repository
2. Go to **Settings → Pages → Source → GitHub Actions**
3. The app auto-deploys on every push to `main`

## 🏗️ CI/CD Pipeline

### Pull Request Checks (`ci.yml`)
- ✅ **ESLint** — JavaScript quality checks
- ✅ **Prettier** — Code formatting verification
- ✅ **Build** — Ensures production build succeeds

### Auto Deploy (`deploy.yml`)
- Triggered on push to `main`
- Runs lint + format check + build
- Deploys to GitHub Pages automatically

## 🛠️ Tech Stack

- **Frontend**: HTML5, Vanilla CSS, JavaScript (ES6+)
- **Build Tool**: Vite
- **API**: OpenWeatherMap
- **CI/CD**: GitHub Actions
- **Hosting**: GitHub Pages

## 📁 Project Structure

```
weather-app/
├── .github/workflows/     # CI/CD pipelines
│   ├── ci.yml             # PR checks
│   └── deploy.yml         # Auto deploy
├── src/
│   ├── css/
│   │   ├── index.css      # Design system & themes
│   │   ├── components.css # Component styles
│   │   └── animations.css # Keyframe animations
│   └── js/
│       ├── app.js         # Main entry point
│       ├── api.js         # Weather API service
│       ├── ui.js          # DOM rendering
│       ├── utils.js       # Helpers & utilities
│       └── animations.js  # Canvas weather effects
├── index.html             # HTML shell
├── vite.config.js         # Vite configuration
├── eslint.config.js       # ESLint configuration
├── .prettierrc            # Prettier configuration
└── package.json           # Dependencies & scripts
```

## 📝 License

MIT
