# React Weather App

A React weather app deployed on Azure Static Web Apps with a simple three-layer Azure architecture.

## Architecture

```text
User
  |
  v
Azure Static Web App
  |
  v
Managed Azure Function
  |
  v
Azure SQL Database
```

## Features

- City weather search powered by Open-Meteo
- Current temperature and weather description
- Current date
- Seven-day forecast summary
- Search history API at `/api/searches`
- Azure SQL table for saved city searches
- GitHub Actions deployment to Azure Static Web Apps

## Project Structure

```text
.
|-- .github/workflows/azure-static-web-apps-witty-sea-032759a00.yml
|-- api/
|   |-- src/functions/searches.js
|   |-- host.json
|   |-- package.json
|-- database/
|   |-- schema.sql
|-- weather-app/
|   |-- public/staticwebapp.config.json
|   |-- src/
|   |   |-- components/
|   |   |-- services/SearchHistoryService.js
|   |   |-- services/WeatherService.js
|   |   |-- App.js
|   |-- package.json
|-- AZURE_DEPLOYMENT.md
```

## Local Frontend

```bash
cd weather-app
npm install
npm start
```

## Build And Test

Frontend:

```bash
cd weather-app
npm test -- --watchAll=false
npm run build
```

API:

```bash
cd api
npm install
npm test
```

## Azure Setup

Full Azure SQL, Static Web Apps environment variable, and deployment instructions are in [AZURE_DEPLOYMENT.md](AZURE_DEPLOYMENT.md).

Required runtime environment variable in Azure Static Web Apps:

```text
SQL_CONNECTION_STRING
```

## License

This project is licensed under the MIT License.
