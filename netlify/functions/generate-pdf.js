// netlify/functions/generate-pdf.js
const puppeteer = require('puppeteer');

exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const formData = JSON.parse(event.body);
    
    // Generate PDF
    const pdfBuffer = await generatePDF(formData);
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Beobachtungsbogen_${formData.date || 'unbekannt'}_${formData.referee?.replace(/\s+/g, '_') || 'unbekannt'}.pdf"`,
      },
      body: pdfBuffer.toString('base64'),
      isBase64Encoded: true,
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        success: false, 
        error: 'Fehler beim Erstellen der PDF: ' + error.message 
      }),
    };
  }
};

async function generatePDF(formData) {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });

  const page = await browser.newPage();
  
  const htmlContent = generateHTMLForPDF(formData);
  
  await page.setContent(htmlContent, {
    waitUntil: 'networkidle0',
  });
  
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: {
      top: '1cm',
      bottom: '1cm',
      left: '1cm',
      right: '1cm',
    },
  });
  
  await browser.close();
  return pdfBuffer;
}

function generateHTMLForPDF(data) {
  const criteriaLabels = {
    'criteria_1_1': '1.1 Erkennen des Spielcharakters / von Spielphasen',
    'criteria_1_2': '1.2 Regelkonformität / Regelverstöße',
    'criteria_2_1': '2.1 Fußvergehen',
    'criteria_2_2': '2.2 Oberkörpervergehen',
    'criteria_3_1': '3.1 Ansprachen / Ermahnungen',
    'criteria_3_2': '3.2 Verwarnungen',
    'criteria_3_3': '3.3 Feldverweise',
    'criteria_4_1': '4.1 Akzeptanz / Persönlichkeit',
    'criteria_4_2': '4.2 Durchsetzungsvermögen',
    'criteria_4_3': '4.3 Kommunikation (Ansprache, Dialog)',
    'criteria_4_4': '4.4 Präsentation (Gestik, Mimik, Pfiffe)',
    'criteria_5_1': '5.1 Laufvermögen',
    'criteria_5_2': '5.2 Einblick und Positionierung laufendes Spiel',
    'criteria_5_3': '5.3 Einblick und Positionierung Spielfortsetzungen',
    'criteria_6_1': '6.1 Zusammenarbeit'
  };

  let criteriaHTML = '';
  Object.keys(criteriaLabels).forEach(key => {
    if (data[key]) {
      criteriaHTML += `
        <tr>
          <td>${criteriaLabels[key]}</td>
          <td style="text-align: center; font-weight: bold;">${data[key]}</td>
        </tr>
      `;
    }
  });

  return `
    <!DOCTYPE html>
    <html lang="de">
    <head>
      <meta charset="UTF-8">
      <title>FVN Beobachtungsbogen</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          background: white;
        }
        
        .header {
          text-align: center;
          color: #0066cc;
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 30px;
          line-height: 1.3;
        }
        
        .section {
          margin-bottom: 25px;
          page-break-inside: avoid;
        }
        
        .section-title {
          background: #0066cc;
          color: white;
          padding: 10px;
          font-weight: bold;
          margin-bottom: 15px;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
        }
        
        td, th {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        
        th {
          background-color: #f2f2f2;
          font-weight: bold;
        }
        
        .info-table td:first-child {
          font-weight: bold;
          background-color: #f9f9f9;
          width: 150px;
        }
        
        .criteria-table td:first-child {
          width: 70%;
        }
        
        .criteria-table td:last-child {
          text-align: center;
          font-weight: bold;
        }
        
        .text-section {
          margin: 15px 0;
        }
        
        .text-label {
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .text-content {
          border: 1px solid #ddd;
          padding: 10px;
          min-height: 60px;
          background: #f9f9f9;
          white-space: pre-wrap;
        }
        
        .summary-table {
          background: #f8f9fa;
        }
        
        .summary-table td, .summary-table th {
          text-align: center;
          font-weight: bold;
        }
        
        .total-row {
          background: #e6f2ff;
          font-size: 16px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        FVN - Schiedsrichter<br>
        Beobachtungsbogen A- und B-Junioren-Niederrheinliga
      </div>
      
      <div class="section">
        <div class="section-title">Informationen zur Beobachtung</div>
        <table class="info-table">
          <tr><td>Beobachter:</td><td>${data.observer || ''}</td></tr>
          <tr><td>Datum:</td><td>${data.date || ''}</td></tr>
          <tr><td>Begegnung:</td><td>${data.match || ''}</td></tr>
          <tr><td>Spielklasse:</td><td>${data.league || ''}</td></tr>
          <tr><td>Schiedsrichter:</td><td>${data.referee || ''}</td></tr>
          <tr><td>Halbzeitstand:</td><td>${data.halftime || ''}</td></tr>
          <tr><td>Schiedsrichterassistent 1:</td><td>${data.assistant1 || ''}</td></tr>
          <tr><td>Endstand:</td><td>${data.fulltime || ''}</td></tr>
          <tr><td>Schiedsrichterassistent 2:</td><td>${data.assistant2 || ''}</td></tr>
          <tr><td>Kader:</td><td>${data.squad || ''}</td></tr>
        </table>
      </div>
      
      <div class="section">
        <div class="section-title">Bewertungskriterien</div>
        <table class="criteria-table">
          <tr><th>Kriterium</th><th>Bewertung</th></tr>
          ${criteriaHTML}
        </table>
      </div>
      
      <div class="section">
        <div class="section-title">Erläuterung der Schiedsrichterleistung</div>
        <div class="text-section">
          <div class="text-label">Positive Erkenntnisse:</div>
          <div class="text-content">${data.positive_notes || 'Keine Angaben'}</div>
        </div>
        <div class="text-section">
          <div class="text-label">Zu optimierende Bereiche:</div>
          <div class="text-content">${data.improvement_notes || 'Keine Angaben'}</div>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">Beurteilung der Gesamtleistung</div>
        <table class="summary-table">
          <tr>
            <th>Bewertung</th>
            <th>Anzahl</th>
            <th>Punkte pro Bewertung</th>
            <th>Gesamtpunkte</th>
          </tr>
          <tr>
            <td>1 (Optimierungsbedarf)</td>
            <td>${data.summary?.count1 || '0'}</td>
            <td>1</td>
            <td>${data.summary?.points1 || '0'}</td>
          </tr>
          <tr>
            <td>2 (Entspricht Anforderungen)</td>
            <td>${data.summary?.count2 || '0'}</td>
            <td>2</td>
            <td>${data.summary?.points2 || '0'}</td>
          </tr>
          <tr>
            <td>3 (Überdurchschnittlich)</td>
            <td>${data.summary?.count3 || '0'}</td>
            <td>3</td>
            <td>${data.summary?.points3 || '0'}</td>
          </tr>
          <tr class="total-row">
            <td colspan="3"><strong>GESAMTPUNKTZAHL:</strong></td>
            <td><strong>${data.summary?.totalPoints || '0'}</strong></td>
          </tr>
        </table>
      </div>
      
      <div style="margin-top: 30px; font-size: 12px; color: #666; text-align: center;">
        Erstellt am: ${new Date().toLocaleDateString('de-DE')} um ${new Date().toLocaleTimeString('de-DE')}
      </div>
    </body>
    </html>
  `;
}