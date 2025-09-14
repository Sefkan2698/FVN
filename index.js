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

    // Add event listeners for score calculation
    const criteriaRadios = document.querySelectorAll('#scoutingForm input[type="radio"][name^="scout_criteria_"]');
    criteriaRadios.forEach(radio => {
        radio.addEventListener('change', calculateScoutingScores);
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

function calculateScoutingScores() {
    const criteriaRadios = document.querySelectorAll('#scoutingForm input[type="radio"][name^="scout_criteria_"]:checked');
    let counts = { '1': 0, '2': 0, '3': 0 };
    
    criteriaRadios.forEach(radio => {
        counts[radio.value]++;
    });
    
    // Update counts mit den korrekten Scout-IDs
    document.getElementById('scout_count1').textContent = counts['1'];
    document.getElementById('scout_count2').textContent = counts['2'];
    document.getElementById('scout_count3').textContent = counts['3'];
    
    // Calculate weighted scores
    const points1 = counts['1'] * 1;
    const points2 = counts['2'] * 2;
    const points3 = counts['3'] * 3;
    
    document.getElementById('scout_points1').textContent = points1;
    document.getElementById('scout_points2').textContent = points2;
    document.getElementById('scout_points3').textContent = points3;
    
    const totalPoints = points1 + points2 + points3;
    document.getElementById('scout_totalPoints').innerHTML = `<strong>${totalPoints}</strong>`;
}

// Submit Functions
function submitBeobachtungsForm(event) {
    event.preventDefault();
    
    const form = document.getElementById('observationForm');
    
    if (!validateBeobachtungsForm(form)) {
        return false;
    }
    
    // PDF generieren via Browser Print
    generatePDF();
    
    document.getElementById('successMessage').textContent = 'PDF wird erstellt...';
    document.getElementById('successMessage').style.display = 'block';
    
    return false;
}

function submitScoutingForm(event) {
    event.preventDefault();
    
    const form = document.getElementById('scoutForm');
    
    if (!validateScoutingForm(form)) {
        return false;
    }
    
    // PDF generieren via Browser Print
    generatePDF();
    
    document.getElementById('scoutSuccessMessage').textContent = 'PDF wird erstellt...';
    document.getElementById('scoutSuccessMessage').style.display = 'block';
    
    return false;
}

function generatePDF() {
    // Vor dem Drucken: Navigation und unnötige Elemente ausblenden
    const backButtons = document.querySelectorAll('.back-button');
    const submitButtons = document.querySelectorAll('.submit-button');
    const successMessages = document.querySelectorAll('.success-message');
    
    // Elemente ausblenden
    backButtons.forEach(btn => btn.style.display = 'none');
    submitButtons.forEach(btn => btn.style.display = 'none');
    successMessages.forEach(msg => msg.style.display = 'none');
    
    // Print Dialog öffnen
    window.print();
    
    // Nach dem Drucken: Elemente wieder einblenden
    setTimeout(() => {
        backButtons.forEach(btn => btn.style.display = '');
        submitButtons.forEach(btn => btn.style.display = '');
        successMessages.forEach(msg => msg.style.display = '');
    }, 1000);
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