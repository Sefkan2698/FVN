// netlify/functions/generate-pdf.js
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
    
    // Generate beautiful HTML for PDF printing
    const htmlContent = generatePrintableHTML(formData);
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="Beobachtungsbogen_${formData.date || 'unbekannt'}_${formData.referee?.replace(/\s+/g, '_') || 'unbekannt'}.html"`,
      },
      body: htmlContent,
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

function generatePrintableHTML(data) {
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

  const criteriaBySection = {
    'Spielverständnis': ['criteria_1_1', 'criteria_1_2'],
    'Zweikampfbeurteilung': ['criteria_2_1', 'criteria_2_2'],
    'Disziplinarkontrolle': ['criteria_3_1', 'criteria_3_2', 'criteria_3_3'],
    'Persönliches Auftreten': ['criteria_4_1', 'criteria_4_2', 'criteria_4_3', 'criteria_4_4'],
    'Fitness und Stellungsspiel': ['criteria_5_1', 'criteria_5_2', 'criteria_5_3'],
    'Teamarbeit': ['criteria_6_1']
  };

  let criteriaHTML = '';
  Object.keys(criteriaBySection).forEach(sectionName => {
    criteriaHTML += `
      <tr class="section-header">
        <td colspan="2"><strong>${sectionName}</strong></td>
      </tr>
    `;
    
    criteriaBySection[sectionName].forEach(key => {
      if (data[key]) {
        const rating = data[key];
        const ratingText = rating === '1' ? '1 (Optimierungsbedarf)' : 
                          rating === '2' ? '2 (Entspricht Anforderungen)' : 
                          '3 (Überdurchschnittlich)';
        const ratingClass = rating === '1' ? 'rating-low' : 
                           rating === '2' ? 'rating-medium' : 
                           'rating-high';
        
        criteriaHTML += `
          <tr>
            <td class="criteria-label">${criteriaLabels[key]}</td>
            <td class="rating-cell ${ratingClass}">${ratingText}</td>
          </tr>
        `;
      }
    });
  });

  return `
    <!DOCTYPE html>
    <html lang="de">
    <head>
      <meta charset="UTF-8">
      <title>FVN Beobachtungsbogen</title>
      <style>
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
          .page-break { page-break-before: always; }
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          padding: 20mm;
          background: white;
          color: #333;
          line-height: 1.4;
        }
        
        .container {
          max-width: 180mm;
          margin: 0 auto;
        }
        
        .header {
          text-align: center;
          color: #0066cc;
          font-size: 22px;
          font-weight: bold;
          margin-bottom: 30px;
          line-height: 1.3;
          border-bottom: 3px solid #0066cc;
          padding-bottom: 15px;
        }
        
        .section {
          margin-bottom: 25px;
          break-inside: avoid;
        }
        
        .section-title {
          background: linear-gradient(135deg, #0066cc, #0052a3);
          color: white;
          padding: 12px 15px;
          font-weight: bold;
          margin-bottom: 15px;
          border-radius: 5px;
          font-size: 16px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        td, th {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: left;
          vertical-align: top;
        }
        
        th {
          background: linear-gradient(135deg, #f8f9fa, #e9ecef);
          font-weight: bold;
          color: #495057;
        }
        
        .info-table td:first-child {
          font-weight: bold;
          background-color: #f8f9fa;
          width: 35%;
          color: #495057;
        }
        
        .info-table td:last-child {
          background-color: white;
        }
        
        .section-header td {
          background: linear-gradient(135deg, #e6f2ff, #cce7ff);
          font-weight: bold;
          color: #0066cc;
          border-top: 2px solid #0066cc;
          padding: 10px 12px;
        }
        
        .criteria-label {
          width: 70%;
          font-weight: 500;
        }
        
        .rating-cell {
          text-align: center;
          font-weight: bold;
          width: 30%;
        }
        
        .rating-low {
          background-color: #ffebee;
          color: #c62828;
        }
        
        .rating-medium {
          background-color: #f3e5f5;
          color: #7b1fa2;
        }
        
        .rating-high {
          background-color: #e8f5e8;
          color: #2e7d32;
        }
        
        .text-section {
          margin: 20px 0;
          break-inside: avoid;
        }
        
        .text-label {
          font-weight: bold;
          margin-bottom: 8px;
          color: #495057;
          font-size: 14px;
        }
        
        .text-content {
          border: 1px solid #dee2e6;
          border-radius: 5px;
          padding: 15px;
          min-height: 80px;
          background: #f8f9fa;
          white-space: pre-wrap;
          font-size: 14px;
          line-height: 1.5;
        }
        
        .summary-table {
          background: white;
          border: 2px solid #0066cc;
        }
        
        .summary-table th {
          background: linear-gradient(135deg, #0066cc, #0052a3);
          color: white;
          text-align: center;
          font-weight: bold;
        }
        
        .summary-table td {
          text-align: center;
          font-weight: bold;
          padding: 15px;
        }
        
        .total-row {
          background: linear-gradient(135deg, #e6f2ff, #cce7ff);
          font-size: 18px;
          border-top: 2px solid #0066cc;
        }
        
        .total-row td {
          color: #0066cc;
          font-weight: bold;
        }
        
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #dee2e6;
          font-size: 12px;
          color: #6c757d;
          text-align: center;
        }
        
        .print-button {
          position: fixed;
          top: 20px;
          right: 20px;
          background: #28a745;
          color: white;
          padding: 12px 24px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          z-index: 1000;
        }
        
        .print-button:hover {
          background: #218838;
        }
        
        .explanation-box {
          background: linear-gradient(135deg, #fff9c4, #fff59d);
          border: 1px solid #ffc107;
          border-radius: 5px;
          padding: 15px;
          margin: 20px 0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .explanation-box p {
          margin: 5px 0;
          font-size: 13px;
          color: #856404;
        }
      </style>
    </head>
    <body>
      <button class="print-button no-print" onclick="window.print()">📄 Als PDF drucken</button>
      
      <div class="container">
        <div class="header">
          ⚽ FVN - Schiedsrichter<br>
          Beobachtungsbogen A- und B-Junioren-Niederrheinliga
        </div>
        
        <div class="section">
          <div class="section-title">📋 Informationen zur Beobachtung</div>
          <table class="info-table">
            <tr><td>👤 Beobachter:</td><td>${data.observer || ''}</td></tr>
            <tr><td>📅 Datum:</td><td>${data.date || ''}</td></tr>
            <tr><td>⚽ Begegnung:</td><td>${data.match || ''}</td></tr>
            <tr><td>🏆 Spielklasse:</td><td>${data.league || ''}</td></tr>
            <tr><td>👨‍⚖️ Schiedsrichter:</td><td>${data.referee || ''}</td></tr>
            <tr><td>⏰ Halbzeitstand:</td><td>${data.halftime || ''}</td></tr>
            <tr><td>🚩 Schiedsrichterassistent 1:</td><td>${data.assistant1 || ''}</td></tr>
            <tr><td>⏱️ Endstand:</td><td>${data.fulltime || ''}</td></tr>
            <tr><td>🚩 Schiedsrichterassistent 2:</td><td>${data.assistant2 || ''}</td></tr>
            <tr><td>👥 Kader:</td><td>${data.squad || ''}</td></tr>
          </table>
        </div>
        
        <div class="explanation-box">
          <p><strong>1</strong> = Optimierungsbedarf (nicht zufrieden stellend)</p>
          <p><strong>2</strong> = Entspricht den Anforderungen (keine Relevanz/Neutrale Bewertung)</p>
          <p><strong>3</strong> = Überdurchschnittliche Anforderung (mehr als zufrieden stellend)</p>
        </div>
        
        <div class="section">
          <div class="section-title">📊 Bewertungskriterien</div>
          <table>
            <thead>
              <tr><th>Kriterium</th><th>Bewertung</th></tr>
            </thead>
            <tbody>
              ${criteriaHTML}
            </tbody>
          </table>
        </div>
        
        <div class="section">
          <div class="section-title">💬 Erläuterung der Schiedsrichterleistung</div>
          <div class="text-section">
            <div class="text-label">✅ Positive Erkenntnisse:</div>
            <div class="text-content">${data.positive_notes || 'Keine Angaben'}</div>
          </div>
          <div class="text-section">
            <div class="text-label">🔧 Zu optimierende Bereiche:</div>
            <div class="text-content">${data.improvement_notes || 'Keine Angaben'}</div>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">📈 Beurteilung der Gesamtleistung</div>
          <table class="summary-table">
            <thead>
              <tr>
                <th>Bewertung</th>
                <th>Anzahl</th>
                <th>Punkte pro Bewertung</th>
                <th>Gesamtpunkte</th>
              </tr>
            </thead>
            <tbody>
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
                <td colspan="3"><strong>🏆 GESAMTPUNKTZAHL:</strong></td>
                <td><strong>${data.summary?.totalPoints || '0'}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="footer">
          📄 Erstellt am: ${new Date().toLocaleDateString('de-DE')} um ${new Date().toLocaleTimeString('de-DE')}<br>
          🏟️ FVN - Fußballverband Niederrhein
        </div>
      </div>
      
      <script>
        // Auto-print after 1 second
        setTimeout(() => {
          window.print();
        }, 1000);
      </script>
    </body>
    </html>
  `;
}