import { google } from 'googleapis';
import fs from 'fs';

async function getSheetInfo() {
  const credentials = JSON.parse(fs.readFileSync('./today-19f9c-6c5525c183fc.json', 'utf8'));
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '1BnEc-uIbfzig_SmP38O-Aj3IynUfDtouo7VipLR_5Fk';

  try {
    const response = await sheets.spreadsheets.get({
      spreadsheetId,
    });
    
    const sheetNames = response.data.sheets.map(s => s.properties.title);
    console.log('Available sheets:', sheetNames);

    for (const sheetName of sheetNames) {
      const dataResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A1:Z1`, // read first row
      });
      console.log(`Headers for ${sheetName}:`, dataResponse.data.values ? dataResponse.data.values[0] : 'No data');
    }
  } catch (error) {
    console.error('Error fetching sheet:', error.message);
  }
}

getSheetInfo();
