# Azure Static Web Apps Deployment

This React app is ready for Azure Static Web Apps. It uses Open-Meteo for weather data, so there are no weather API keys, application secrets, or paid weather services. Azure Static Web Apps still needs a deployment credential for GitHub Actions; that token only authorizes GitHub to publish the static site to your Azure resource.

## How The App Works

- `weather-app/src/App.js` renders the city search form, current date, weather card, weekly forecast text, loading state, and errors.
- `weather-app/src/services/WeatherService.js` calls Open-Meteo's geocoding API to convert a city name into latitude and longitude, then calls Open-Meteo's forecast API for current temperature, current weather code, and a seven-day forecast.
- `weather-app/src/components/WeatherCard.js` keeps the original UI contract: it reads `name`, `main.temp`, and `weather[0].description`.
- `weather-app/src/components/Calendar.js` shows today's date.
- `weather-app/src/components/MeteorologicalPredictions.js` shows the forecast summary.

## Local Commands

Run these from `weather-app`:

```bash
npm install
npm test -- --watchAll=false
npm run build
npm start
```

## GitHub Setup

You cannot push to `arasgungore/react-weather-app` unless you own it or have write access. Use one of these simple options:

1. Fork the repository on GitHub, then push this updated code to your fork.
2. Or create a new empty GitHub repository and push this folder to it.

Example commands from the repository root:

```bash
git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git add .
git commit -m "Deploy React weather app to Azure Static Web Apps"
git push -u origin main
```

## Azure Portal Steps

1. Go to https://azure.microsoft.com/free/ and create a free Azure account.
2. Open https://portal.azure.com/ and sign in.
3. Search for `Static Web Apps`.
4. Select `Static Web Apps`, then select `Create`.
5. On the Basics tab:
   - Subscription: choose your subscription.
   - Resource group: select `Create new`, for example `rg-react-weather-app`.
   - Name: for example `react-weather-open-meteo`.
   - Plan type: `Free`.
   - Region: choose the nearest region offered for Azure Functions and staging details.
6. Deployment details:
   - Source: choose `Other` if available. This is the most predictable path because this repository already includes `.github/workflows/azure-static-web-apps.yml`.
   - If Azure asks for a deployment authorization policy, choose `Deployment token`.
   - If `Other` is not available, choose `GitHub`, authorize Azure, select your repository and branch, then use the Build Details in step 7.
7. Build Details, only if you chose Source `GitHub`:
   - Build Presets: `React`.
   - App location: `weather-app`.
   - API location: leave empty.
   - Output location: `build`.
   - If Azure creates a second workflow file, keep only one Azure Static Web Apps workflow to avoid duplicate deployments.
8. Select `Review + create`.
9. Select `Create`.
10. After deployment, select `Go to resource`.
11. If you used Source `Other`, open `Manage deployment token`, copy the token, and add it to GitHub:
    - GitHub repository > Settings > Secrets and variables > Actions > New repository secret.
    - Name: `AZURE_STATIC_WEB_APPS_API_TOKEN`.
    - Secret: paste the Azure deployment token.
12. If you used Source `GitHub` and Azure created a secret with a generated name, either rename that GitHub secret to `AZURE_STATIC_WEB_APPS_API_TOKEN` or update `.github/workflows/azure-static-web-apps.yml` to use the generated secret name.
13. Go to GitHub > Actions and run `Azure Static Web Apps CI/CD`, or push a commit to `main`.
14. When the action succeeds, return to the Azure Static Web Apps Overview page and open the generated public URL.

## Automatic Redeployment

The workflow in `.github/workflows/azure-static-web-apps.yml` runs automatically on:

- Every push to `main`.
- Pull requests opened, updated, reopened, or closed against `main`.
- Manual runs from the GitHub Actions `workflow_dispatch` button.

To redeploy, commit and push:

```bash
git add .
git commit -m "Update weather app"
git push
```

## Troubleshooting

- `The app build failed`: open the failed GitHub Actions run and check the build log. Run `npm install` and `npm run build` locally from `weather-app`.
- `No matching app_location found`: confirm the workflow uses `app_location: weather-app`.
- `Output location not found`: confirm the workflow uses `output_location: build`, not `weather-app/build`.
- `Missing AZURE_STATIC_WEB_APPS_API_TOKEN`: add the deployment token as a GitHub Actions repository secret with exactly that name.
- `404 after refresh`: confirm `weather-app/public/staticwebapp.config.json` exists and was included in the build output.
- `City not found`: try a more specific city name such as `Paris, France` or `Springfield Illinois`.
- `Open-Meteo request blocked in browser`: check the browser console and retry. The app makes direct HTTPS requests to Open-Meteo and does not use a backend.
