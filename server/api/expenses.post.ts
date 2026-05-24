import { google } from 'googleapis';

export default defineEventHandler(async (event) => {
  try {
    // 1. Validate Authentication
    const token = getCookie(event, 'auth_token');
    if (!token || !token.startsWith('authenticated_')) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized. Please login first.' });
    }

    // Extract username from token
    const username = token.replace('authenticated_', '');

    // 2. Validate Request Body
    const body = await readBody(event);
    const { date, amount, category, description } = body;

    if (!date || !amount || !category) {
      throw createError({ statusCode: 400, statusMessage: 'Missing required fields' });
    }

    // 3. Determine Month and Year from date
    const dateObj = new Date(date);
    const year = dateObj.getFullYear().toString();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthName = monthNames[dateObj.getMonth()];
    const sheetName = `${monthName}${year}`;

    // 4. Authenticate Google API using environment variables
    const config = useRuntimeConfig();
    const credentialsStr = config.googleCredentials;
    if (!credentialsStr) {
      throw createError({ statusCode: 500, statusMessage: 'Google Credentials missing in environment variables' });
    }

    const credentials = JSON.parse(credentialsStr as string);
    // Fix newline escaping issue from .env string parsing
    if (credentials.private_key) {
      credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
    }
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    // We will use the single main spreadsheet for all years
    const spreadsheetId = '1BnEc-uIbfzig_SmP38O-Aj3IynUfDtouo7VipLR_5Fk';

    // 5. Check if Month tab exists in the spreadsheet
    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const existingSheets = meta.data.sheets?.map((s: any) => s.properties.title) || [];
    
    if (!existingSheets.includes(sheetName)) {
      // Create new tab
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: sheetName
                }
              }
            }
          ]
        }
      });
      
      // Add headers to the new tab (Added User column)
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetName}!A1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [['Date', 'Category', 'Amount', 'Description', 'User']]
        }
      });
    }

    // 6. Append the new expense to the specific month tab (Include username)
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:E`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[date, category, amount, description, username]]
      }
    });

    return { success: true, message: 'Expense saved successfully!' };
  } catch (error: any) {
    console.error('API Error:', error);
    throw createError({ statusCode: error.statusCode || 500, statusMessage: error.message || error.statusMessage });
  }
});
