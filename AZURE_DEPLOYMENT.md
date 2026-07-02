# Azure Three-Layer Deployment

This project uses the simplest Azure architecture that satisfies the app, API, and database requirements.

```text
User
  |
  v
Azure Static Web App
  |
  v
Managed Azure Function at /api/searches
  |
  v
Azure SQL Database
```

## Architecture

- Presentation layer: `weather-app`, a React app hosted by Azure Static Web Apps.
- Application layer: `api`, a managed Azure Functions API deployed with the same Static Web App.
- Database layer: Azure SQL Database with one table, `dbo.search_history`.

The browser still gets weather from Open-Meteo. After a successful weather lookup, the frontend sends a separate fire-and-forget POST request to `/api/searches`. If the API or SQL database is down, the weather result still appears because the save request is not awaited by the search flow.

## How Each Layer Communicates

- User -> Azure Static Web App: The user opens the public Azure Static Web Apps URL.
- Static Web App -> Open-Meteo: The React app calls Open-Meteo directly for weather data.
- Static Web App -> Azure Function: The React app posts `{ "cityName": "..." }` to `/api/searches`.
- Azure Function -> Azure SQL Database: The function reads `SQL_CONNECTION_STRING` from Static Web Apps environment variables and inserts the city name into `dbo.search_history`.

## Files That Matter

- `.github/workflows/azure-static-web-apps-witty-sea-032759a00.yml`: builds and deploys the frontend plus API.
- `weather-app/src/services/WeatherService.js`: Open-Meteo weather lookup.
- `weather-app/src/services/SearchHistoryService.js`: sends successful searches to `/api/searches`.
- `api/src/functions/searches.js`: Azure Function that writes to SQL.
- `database/schema.sql`: table schema to run in Azure SQL.
- `weather-app/public/staticwebapp.config.json`: Static Web Apps config and Node 20 API runtime.

## SQL Schema

Run this in Azure SQL Query editor:

```sql
CREATE TABLE dbo.search_history (
    id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_search_history PRIMARY KEY,
    city_name NVARCHAR(255) NOT NULL,
    searched_at DATETIME2(0) NOT NULL CONSTRAINT DF_search_history_searched_at DEFAULT SYSUTCDATETIME()
);

CREATE INDEX IX_search_history_searched_at
ON dbo.search_history (searched_at DESC);
```

## Azure SQL Database Portal Steps

1. Open https://portal.azure.com/.
2. Search for `SQL databases`.
3. Select `Create`.
4. Basics tab:
   - Subscription: use the same subscription as the Static Web App.
   - Resource group: use `rg-react-weather-app` or the resource group that contains your Static Web App.
   - Database name: `weatherappdb`.
   - Server: select `Create new`.
5. New server:
   - Server name: use a globally unique name, for example `weatherapp-sql-turtlesrqul`.
   - Location: choose a nearby region.
   - Authentication method: `Use SQL authentication`.
   - Server admin login: for example `sqladminuser`.
   - Password: create a strong password and save it somewhere safe.
   - Select `OK`.
6. Workload environment: choose `Development`.
7. Compute + storage:
   - If Azure offers a free Azure SQL Database option, select it.
   - Otherwise choose the lowest-cost development/serverless option shown in the portal.
   - Use locally redundant backup storage for the lowest-cost simple setup.
8. Networking tab:
   - Connectivity method: `Public endpoint`.
   - Add current client IP address: `Yes` so you can use Query editor.
   - Allow Azure services and resources to access this server: `Yes` so the managed Azure Function can connect.
   - Minimum TLS version: keep the default or `1.2`.
9. Security tab:
   - Leave Microsoft Defender for SQL off unless you intentionally want that paid/security feature.
10. Additional settings:
   - Use existing data: `None`.
11. Select `Review + create`.
12. Select `Create`.
13. After the database is created, open the SQL database resource.
14. Select `Query editor (preview)`.
15. Sign in using SQL authentication with the admin login and password from step 5.
16. Paste the SQL schema above and select `Run`.

## Connection String

In the SQL database resource:

1. Open `Connection strings`.
2. Choose `ADO.NET`.
3. Copy the connection string.
4. Replace `{your_password}` with your SQL admin password.
5. Use this as the value for `SQL_CONNECTION_STRING`.

Example shape:

```text
Server=tcp:<server-name>.database.windows.net,1433;Initial Catalog=weatherappdb;Persist Security Info=False;User ID=<sql-admin-user>;Password=<sql-admin-password>;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;
```

## Static Web Apps Environment Variables

In your Static Web App resource:

1. Open your `weatherApp` Static Web App in Azure Portal.
2. In the left menu, go to `Settings` -> `Environment variables`.
3. Select the `Production` environment.
4. Select `+ Add`.
5. Add:
   - Name: `SQL_CONNECTION_STRING`
   - Value: the Azure SQL connection string above.
6. Select `Apply`.
7. Select `Apply` again to save.

Only one runtime environment variable is required:

```text
SQL_CONNECTION_STRING
```

GitHub Actions also needs the Azure deployment secret that Azure already created for this app:

```text
AZURE_STATIC_WEB_APPS_API_TOKEN_WITTY_SEA_032759A00
```

Do not put the SQL connection string in GitHub secrets for this setup. It belongs in Azure Static Web Apps environment variables because the backend API reads it at runtime.

## GitHub Actions Deployment

The workflow deploys both layers:

```yaml
app_location: "./weather-app"
api_location: "api"
output_location: "build"
```

Every push to `main` triggers a new deployment. The frontend and API are deployed together. The API is available under the same domain at:

```text
/api/searches
```

## Local Commands

Frontend:

```bash
cd weather-app
npm install
npm test -- --watchAll=false
npm run build
```

API:

```bash
cd api
npm install
npm test
```

Optional local API settings:

1. Copy `api/local.settings.json.sample` to `api/local.settings.json`.
2. Fill in `SQL_CONNECTION_STRING`.
3. Do not commit `api/local.settings.json`.

## Test The Database Save

After deployment and after setting `SQL_CONNECTION_STRING`:

1. Open the live site.
2. Search for `Singapore`.
3. Open Azure SQL Query editor.
4. Run:

```sql
SELECT TOP 20 id, city_name, searched_at
FROM dbo.search_history
ORDER BY searched_at DESC;
```

You should see the searched city with a UTC timestamp.

## Troubleshooting

- Weather works but rows are not saved: check `SQL_CONNECTION_STRING` in Static Web Apps environment variables.
- API returns 500: confirm the table exists by running `SELECT TOP 1 * FROM dbo.search_history;`.
- SQL login fails: reset the SQL server admin password or check the connection string user/password.
- Timeout from API to SQL: in the SQL server networking settings, enable `Allow Azure services and resources to access this server`.
- GitHub Actions does not deploy API: confirm the workflow has `api_location: "api"`.
- Duplicate workflows run: keep only `.github/workflows/azure-static-web-apps-witty-sea-032759a00.yml`.
- Local API install warns about Node version: Azure uses Node 20 through `staticwebapp.config.json`; local Node 22 can still load the code for syntax checks.
