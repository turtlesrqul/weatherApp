const { app } = require('@azure/functions');
const sql = require('mssql');

const MAX_CITY_NAME_LENGTH = 255;

let poolPromise;

const getConnectionPool = () => {
  const connectionString = process.env.SQL_CONNECTION_STRING;

  if (!connectionString) {
    throw new Error('Missing SQL_CONNECTION_STRING application setting.');
  }

  if (!poolPromise) {
    poolPromise = sql.connect(connectionString).catch((error) => {
      poolPromise = undefined;
      throw error;
    });
  }

  return poolPromise;
};

const parseRequestBody = async (request) => {
  try {
    return await request.json();
  } catch (error) {
    return {};
  }
};

app.http('searches', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'searches',
  handler: async (request, context) => {
    const body = await parseRequestBody(request);
    const cityName = typeof body.cityName === 'string' ? body.cityName.trim() : '';

    if (!cityName) {
      return {
        status: 400,
        jsonBody: {
          saved: false,
          message: 'cityName is required.',
        },
      };
    }

    if (cityName.length > MAX_CITY_NAME_LENGTH) {
      return {
        status: 400,
        jsonBody: {
          saved: false,
          message: `cityName must be ${MAX_CITY_NAME_LENGTH} characters or fewer.`,
        },
      };
    }

    try {
      const pool = await getConnectionPool();
      const result = await pool
        .request()
        .input('cityName', sql.NVarChar(MAX_CITY_NAME_LENGTH), cityName)
        .query(`
          INSERT INTO dbo.search_history (city_name)
          OUTPUT INSERTED.id, INSERTED.city_name, INSERTED.searched_at
          VALUES (@cityName);
        `);

      return {
        status: 201,
        jsonBody: {
          saved: true,
          search: result.recordset[0],
        },
      };
    } catch (error) {
      poolPromise = undefined;
      context.error('Failed to save search history.', error);

      return {
        status: 500,
        jsonBody: {
          saved: false,
          message: 'Search history is temporarily unavailable.',
        },
      };
    }
  },
});
