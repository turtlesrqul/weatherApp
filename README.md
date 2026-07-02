# React Weather App

A simple React weather app that lets users search for a city, view the current date, see current weather, and read a weekly forecast summary.

This version uses [Open-Meteo](https://open-meteo.com/) instead of OpenWeatherMap, so the app does not need a weather API key.

## Features

- City weather search
- Current temperature and weather description
- Current date
- Seven-day meteorological forecast summary
- Azure Static Web Apps deployment workflow

## Project Structure

```text
.
|-- .github/workflows/azure-static-web-apps.yml
|-- AZURE_DEPLOYMENT.md
|-- weather-app/
|   |-- public/
|   |   |-- staticwebapp.config.json
|   |-- src/
|   |   |-- components/
|   |   |-- services/WeatherService.js
|   |   |-- App.js
|   |-- package.json
```

## Local Development

```bash
cd weather-app
npm install
npm start
```

The app runs at http://localhost:3000.

## Build And Test

```bash
cd weather-app
npm test -- --watchAll=false
npm run build
```

## Azure Deployment

Use Azure Static Web Apps on the Free plan. Full beginner-friendly deployment instructions are in [AZURE_DEPLOYMENT.md](AZURE_DEPLOYMENT.md).

Recommended settings:

- App location: `weather-app`
- API location: leave empty
- Output location: `build`
- Build command: `npm run build`

## License

This project is licensed under the MIT License.
