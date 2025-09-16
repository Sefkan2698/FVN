// Global Variables
let currentForm = null;

// Form Navigation Functions
function showSelection() {
    document.getElementById('selectionScreen').classList.remove('hidden');
    document.getElementById('beobachtungsForm').classList.add('hidden');
    document.getElementById('scoutingForm').classList.add('hidden');
    currentForm = null;
}

function showForm(formType) {
    document.getElementById('selectionScreen').classList.add('hidden');
    
    if (formType === 'beobachtung') {
        document.getElementById('beobachtungsForm').classList.remove('hidden');
        document.getElementById('scoutingForm').classList.add('hidden');
        currentForm = 'beobachtung';
        initializeBeobachtungsForm();
    } else if (formType === 'scouting') {
        document.getElementById('scoutingForm').classList.remove('hidden');
        document.getElementById('beobachtungsForm').classList.add('hidden');
        currentForm = 'scouting';
        initializeScoutingForm();
    }
}

// Form Initialization Functions
function initializeBeobachtungsForm() {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.querySelector('#beobachtungsForm input[name="date"]').value = today;
    
    // Add event listeners for score calculation
    const criteriaRadios = document.querySelectorAll('#beobachtungsForm input[type="radio"][name^="criteria_"]');
    criteriaRadios.forEach(radio => {
        radio.addEventListener('change', calculateBeobachtungsScores);
    });
    
    // Add validation for score format
    const scoreInputs = document.querySelectorAll('#beobachtungsForm input[name="halftime"], #beobachtungsForm input[name="fulltime"]');
    scoreInputs.forEach(input => {
        input.addEventListener('input', validateScoreFormat);
    });

    // Add event listener for league selection to auto-fill squad
    const leagueSelect = document.querySelector('#beobachtungsForm select[name="league"]');
    const squadSelect = document.querySelector('#beobachtungsForm select[name="squad"]');

    leagueSelect.addEventListener('change', function() {
        if (this.value === 'B-NRL') {
            squadSelect.innerHTML = `
                <option value="">Bitte wählen</option>
                <option value="U18" selected>U18</option>
                <option value="U19">U19</option>
                <option value="U20">U20</option>
            `;
        } else if (this.value === 'A-NRL') {
            squadSelect.innerHTML = `
                <option value="">Bitte wählen</option>
                <option value="U18">U18</option>
                <option value="U19">U19</option>
                <option value="U20" selected>U20</option>
            `;
        } else {
            squadSelect.innerHTML = `
                <option value="">Bitte wählen</option>
                <option value="U18">U18</option>
                <option value="U19">U19</option>
                <option value="U20">U20</option>
            `;
        }
    });

    // Add criteria change listeners for comments
    addCriteriaListeners('beobachtungsForm');
}

function initializeScoutingForm() {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.querySelector('#scoutingForm input[name="date"]').value = today;
    
    // Add validation for score format
    const scoreInputs = document.querySelectorAll('#scoutingForm input[name="halftime"], #scoutingForm input[name="fulltime"]');
    scoreInputs.forEach(input => {
        input.addEventListener('input', validateScoreFormat);
    });

    // Add criteria change listeners for comments
    addCriteriaListeners('scoutingForm');
}

// Validation Functions
function validateScoreFormat(event) {
    const input = event.target;
    const value = input.value;
    const pattern = /^\d+:\d+$/;
    
    if (value && !pattern.test(value)) {
        input.classList.add('invalid-input');
        if (!input.nextElementSibling || !input.nextElementSibling.classList.contains('error-text')) {
            const errorSpan = document.createElement('span');
            errorSpan.className = 'error-text';
            errorSpan.textContent = 'Format: x:y (z.B. 1:2)';
            input.parentNode.appendChild(errorSpan);
        }
    } else {
        input.classList.remove('invalid-input');
        const errorSpan = input.parentNode.querySelector('.error-text');
        if (errorSpan) {
            errorSpan.remove();
        }
    }
}

function validateBeobachtungsForm(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value || (field.type === 'radio' && !form.querySelector(`input[name="${field.name}"]:checked`))) {
            field.classList.add('invalid-input');
            isValid = false;
        } else {
            field.classList.remove('invalid-input');
        }
    });
    
    // Validate score format
    const scoreFields = ['halftime', 'fulltime'];
    scoreFields.forEach(fieldName => {
        const field = form.querySelector(`input[name="${fieldName}"]`);
        if (field.value && !/^\d+:\d+$/.test(field.value)) {
            field.classList.add('invalid-input');
            isValid = false;
        }
    });
    
    // Validate comment fields for ratings 1 and 3
    const commentFields = form.querySelectorAll('.comment-field[style*="block"] textarea');
    commentFields.forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('invalid-input');
            isValid = false;
        } else {
            field.classList.remove('invalid-input');
        }
    });
    
    if (!isValid) {
        alert('Bitte füllen Sie alle Pflichtfelder korrekt aus. Bei Bewertungen mit 1 oder 3 Punkten ist eine Begründung erforderlich.');
        return false;
    }
    
    return true;
}

function validateScoutingForm(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value || (field.type === 'radio' && !form.querySelector(`input[name="${field.name}"]:checked`))) {
            field.classList.add('invalid-input');
            isValid = false;
        } else {
            field.classList.remove('invalid-input');
        }
    });
    
    // Validate score format
    const scoreFields = ['halftime', 'fulltime'];
    scoreFields.forEach(fieldName => {
        const field = form.querySelector(`input[name="${fieldName}"]`);
        if (field.value && !/^\d+:\d+$/.test(field.value)) {
            field.classList.add('invalid-input');
            isValid = false;
        }
    });
    
    // Validate comment fields for ratings 1 and 3
    const commentFields = form.querySelectorAll('.comment-field[style*="block"] textarea');
    commentFields.forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('invalid-input');
            isValid = false;
        } else {
            field.classList.remove('invalid-input');
        }
    });
    
    if (!isValid) {
        alert('Bitte füllen Sie alle Pflichtfelder korrekt aus. Bei Bewertungen mit 1 oder 3 Punkten ist eine Begründung erforderlich.');
        return false;
    }
    
    return true;
}

// Score Calculation Functions
function calculateBeobachtungsScores() {
    const criteriaRadios = document.querySelectorAll('#beobachtungsForm input[type="radio"][name^="criteria_"]:checked');
    let counts = { '1': 0, '2': 0, '3': 0 };
    
    criteriaRadios.forEach(radio => {
        counts[radio.value]++;
    });
    
    // Update counts
    document.getElementById('count1').textContent = counts['1'];
    document.getElementById('count2').textContent = counts['2'];  
    document.getElementById('count3').textContent = counts['3'];
    
    // Calculate weighted scores
    const points1 = counts['1'] * 1;
    const points2 = counts['2'] * 2;
    const points3 = counts['3'] * 3;
    
    document.getElementById('points1').textContent = points1;
    document.getElementById('points2').textContent = points2;
    document.getElementById('points3').textContent = points3;
    
    const totalPoints = points1 + points2 + points3;
    document.getElementById('totalPoints').innerHTML = `<strong>${totalPoints}</strong>`;
}

// Submit Functions
function submitBeobachtungsForm(event) {
    event.preventDefault();
    
    const form = document.getElementById('observationForm');
    
    if (!validateBeobachtungsForm(form)) {
        return false;
    }
    
    // Erfolgstext anzeigen
    document.getElementById('successMessage').textContent = 'PDF wird erstellt...';
    document.getElementById('successMessage').style.display = 'block';
    
    // PDF generieren
    setTimeout(() => {
        generatePDF('beobachtung');
    }, 500);
    
    return false;
}

function submitScoutingForm(event) {
    event.preventDefault();
    
    const form = document.getElementById('scoutForm');
    
    if (!validateScoutingForm(form)) {
        return false;
    }
    
    // Erfolgstext anzeigen
    document.getElementById('scoutSuccessMessage').textContent = 'PDF wird erstellt...';
    document.getElementById('scoutSuccessMessage').style.display = 'block';
    
    // PDF generieren
    setTimeout(() => {
        generatePDF('scouting');
    }, 500);
    
    return false;
}

// PDF Generation Function
function generatePDF(formType) {
    console.log('generatePDF aufgerufen mit:', formType);
    
    const elementToCapture = formType === 'beobachtung' ? 
        document.getElementById('beobachtungsForm') : 
        document.getElementById('scoutingForm');
    
    if (!elementToCapture) {
        console.error('Formular-Element nicht gefunden!');
        return;
    }
    
    // Elemente für PDF ausblenden
    const submitSection = elementToCapture.querySelector('.submit-section');
    const topNav = elementToCapture.querySelector('.top-navigation');
    
    if (submitSection) submitSection.style.display = 'none';
    if (topNav) topNav.style.display = 'none';
    
    // CSS von der Seite sammeln
    const cssContent = getAllCSS();
    
    // HTML Content erstellen
    const htmlContent = `
        <!DOCTYPE html>
        <html lang="de">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>FVN ${formType === 'beobachtung' ? 'Beobachtungsbogen' : 'Scoutingbogen'}</title>
            <style>
                ${cssContent}
                
                /* PDF-spezifische Styles */
                .submit-section, .top-navigation {
                    display: none !important;
                }
                
                body {
                    margin: 0;
                    padding: 0;
                }
                
                .container {
                    max-width: 100%;
                    margin: 0;
                    padding: 10px;
                }
                
                /* Textareas für PDF optimieren */
                textarea {
                    min-height: 60px;
                    height: auto;
                    overflow: visible;
                    resize: none;
                    white-space: pre-wrap;
                    word-wrap: break-word;
                }
            </style>
        </head>
        <body>
            ${elementToCapture.outerHTML}
        </body>
        </html>
    `;
    
    const filename = `${formType}sbogen_${new Date().toISOString().split('T')[0]}.pdf`;
    
    // An Netlify Function senden
    fetch('/.netlify/functions/generate-pdf', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            htmlContent: htmlContent,
            filename: filename
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.blob();
    })
    .then(blob => {
        // PDF Download
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        console.log('PDF erfolgreich heruntergeladen');
    })
    .catch(error => {
        console.error('Fehler beim Erstellen der PDF:', error);
        alert('Fehler beim Erstellen der PDF: ' + error.message);
    })
    .finally(() => {
        // Elemente wieder einblenden
        if (submitSection) submitSection.style.display = '';
        if (topNav) topNav.style.display = '';
        
        // Success message ausblenden
        setTimeout(() => {
            if (formType === 'beobachtung') {
                document.getElementById('successMessage').style.display = 'none';
            } else {
                document.getElementById('scoutSuccessMessage').style.display = 'none';
            }
        }, 2000);
    });
}

// Hilfsfunktion um alle CSS-Regeln zu sammeln
function getAllCSS() {
    let css = '';
    
    // CSS aus den Stylesheets sammeln
    for (let i = 0; i < document.styleSheets.length; i++) {
        try {
            const sheet = document.styleSheets[i];
            if (sheet.cssRules) {
                for (let j = 0; j < sheet.cssRules.length; j++) {
                    css += sheet.cssRules[j].cssText + '\n';
                }
            }
        } catch (e) {
            console.warn('Could not access stylesheet:', e);
        }
    }
    
    return css;
}

// Comment Field Functions
function createCommentField(criteriaName, ratingValue) {
    const criteriaLabels = {
        // Beobachtungsbogen
        'criteria_1_1': '1.1',
        'criteria_1_2': '1.2',
        'criteria_2_1': '2.1',
        'criteria_2_2': '2.2',
        'criteria_3_1': '3.1',
        'criteria_3_2': '3.2',
        'criteria_3_3': '3.3',
        'criteria_4_1': '4.1',
        'criteria_4_2': '4.2',
        'criteria_4_3': '4.3',
        'criteria_4_4': '4.4',
        'criteria_5_1': '5.1',
        'criteria_5_2': '5.2',
        'criteria_5_3': '5.3',
        'criteria_6_1': '6.1',
        // Scoutingbogen
        'scout_criteria_1': 'Spielverständnis',
        'scout_criteria_2': 'Zweikampfbeurteilung',
        'scout_criteria_3': 'Disziplinarkontrolle',
        'scout_criteria_4': 'Persönliches Auftreten',
        'scout_criteria_5': 'Fitness und Stellungsspiel',
        'scout_criteria_6': 'Teamarbeit'
    };

    const commentDiv = document.createElement('div');
    commentDiv.className = `comment-field rating-${ratingValue}-comment`;
    commentDiv.id = `comment_${criteriaName}`;
    
    const label = document.createElement('label');
    label.textContent = `Zu ${criteriaLabels[criteriaName]}:`;
    
    const textarea = document.createElement('textarea');
    textarea.name = `comment_${criteriaName}`;
    textarea.placeholder = 'Bitte begründen Sie Ihre Bewertung...';
    textarea.required = true;
    
    commentDiv.appendChild(label);
    commentDiv.appendChild(textarea);
    
    return commentDiv;
}

function handleCriteriaChange(event) {
    const radio = event.target;
    const criteriaName = radio.name;
    const ratingValue = radio.value;
    const criteriaItem = radio.closest('.criteria-item');
    
    // Remove existing comment field
    const existingComment = document.getElementById(`comment_${criteriaName}`);
    if (existingComment) {
        existingComment.remove();
    }
    
    // Add comment field if rating is 1 or 3
    if (ratingValue === '1' || ratingValue === '3') {
        const commentField = createCommentField(criteriaName, ratingValue);
        criteriaItem.appendChild(commentField);
        commentField.style.display = 'block';
    }
}

function addCriteriaListeners(formId) {
    const criteriaRadios = document.querySelectorAll(`#${formId} input[type="radio"][name*="criteria"]`);
    criteriaRadios.forEach(radio => {
        radio.addEventListener('change', handleCriteriaChange);
    });
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    showSelection();
});