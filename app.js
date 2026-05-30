const paperMap = {
    part1: ["2025_sep"], 
    part2: [],
    paces: []
};

let rawFetchedQuestions = []; // Stores the complete original paper array
let filteredQuestions = [];   // Stores only the filtered questions for the quiz
let currentIndex = 0;
let selectedOptionKey = null;

const categorySelect = document.getElementById('categorySelect');
const paperSelect = document.getElementById('paperSelect');
const subjectSelect = document.getElementById('subjectSelect');
const loadBtn = document.getElementById('loadBtn');
const quizContainer = document.getElementById('quizContainer');

// Step 1: When Category changes, update the Paper list
categorySelect.addEventListener('change', (e) => {
    const cat = e.target.value;
    paperSelect.innerHTML = '<option value="">Select Paper (Year/Month)</option>';
    subjectSelect.innerHTML = '<option value="">All Subjects / Specialties</option>';
    subjectSelect.disabled = true;
    loadBtn.disabled = true;

    if (cat && paperMap[cat] && paperMap[cat].length > 0) {
        paperMap[cat].forEach(paper => {
            const opt = document.createElement('option');
            opt.value = paper;
            opt.textContent = paper.replace('_', ' ');
            paperSelect.appendChild(opt);
        });
        paperSelect.disabled = false;
    } else {
        paperSelect.disabled = true;
    }
});

// Step 2: When Paper changes, fetch the JSON instantly to discover its available specialties
paperSelect.addEventListener('change', async (e) => {
    const cat = categorySelect.value;
    const paper = e.target.value;
    
    subjectSelect.innerHTML = '<option value="">All Subjects / Specialties</option>';
    subjectSelect.disabled = true;
    loadBtn.disabled = true;

    if (!paper) return;

    const url = `data/${cat}/${paper}.json`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Paper file not found.');
        
        rawFetchedQuestions = await response.json();
        
        // Extract unique systems/specialties from this specific JSON file
        const uniqueSubjects = [...new Set(rawFetchedQuestions.map(item => item.system))].sort();
        
        // Populate the Subject Dropdown dynamically
        uniqueSubjects.forEach(subj => {
            if (subj) { 
                const opt = document.createElement('option');
                opt.value = subj;
                opt.textContent = subj;
                subjectSelect.appendChild(opt);
            }
        });

        subjectSelect.disabled = false;
        loadBtn.disabled = false; // Ready to render the exam layout

    } catch (err) {
        alert('Error parsing paper map layout: ' + err.message);
    }
});

// Step 3: Run the quiz based on selection filters
loadBtn.addEventListener('click', () => {
    const chosenSubject = subjectSelect.value;
    
    // Filter down questions if a specific specialty was targeted
    if (chosenSubject) {
        filteredQuestions = rawFetchedQuestions.filter(q => q.system === chosenSubject);
    } else {
        filteredQuestions = [...rawFetchedQuestions]; // Use the whole file
    }

    if (filteredQuestions.length === 0) {
        alert('No questions found matching this subset criteria.');
        return;
    }

    currentIndex = 0;
    quizContainer.classList.remove('hidden');
    showQuestion();
});

function showQuestion() {
    const qData = filteredQuestions[currentIndex];
    
    document.getElementById('progress').textContent = `Question ${currentIndex + 1} of ${filteredQuestions.length}`;
    document.getElementById('systemBadge').textContent = qData.system;
    document.getElementById('questionText').textContent = qData.q;
    
    const optionsDiv = document.getElementById('optionsContainer');
    optionsDiv.innerHTML = '';
    document.getElementById('explanationContainer').classList.add('hidden');
    document.getElementById('submitBtn').classList.remove('hidden');
    selectedOptionKey = null;

    Object.keys(qData.o).forEach(key => {
        const optionValue = qData.o[key];
        const label = document.createElement('label');
        label.className = 'option-label';
        label.dataset.key = key;
        
        label.innerHTML = `<input type="radio" name="quiz-opt" value="${key}"> <strong>${key}.</strong> ${optionValue}`;
        label.addEventListener('change', () => { selectedOptionKey = key; });
        optionsDiv.appendChild(label);
    });
}

document.getElementById('submitBtn').addEventListener('click', () => {
    if (!selectedOptionKey) {
        alert('Please select an answer choice.');
        return;
    }
    
    const qData = filteredQuestions[currentIndex];
    const labels = document.querySelectorAll('.option-label');
    const correctAnswerKey = qData.a;

    labels.forEach(label => {
        const currentLabelKey = label.dataset.key;
        const input = label.querySelector('input');
        
        if (currentLabelKey === correctAnswerKey) {
            label.classList.add('correct');
        } else if (currentLabelKey === selectedOptionKey && selectedOptionKey !== correctAnswerKey) {
            label.classList.add('incorrect');
        }
        input.disabled = true;
    });

    document.getElementById('explanationText').textContent = qData.e;
    document.getElementById('explanationContainer').classList.remove('hidden');
    document.getElementById('submitBtn').classList.add('hidden');
});

document.getElementById('nextBtn').addEventListener('click', () => {
    currentIndex++;
    if (currentIndex < filteredQuestions.length) {
        showQuestion();
    } else {
        alert('Evaluation session completed for this selection layout.');
        quizContainer.classList.add('hidden');
    }
});
loadBtn.addEventListener('click', async () => {
    const cat = categorySelect.value;
    const paper = paperSelect.value;
    const url = `data/${cat}/${paper}.json`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Paper file not found.');
        currentQuestions = await response.json();
        currentIndex = 0;
        quizContainer.classList.remove('hidden');
        showQuestion();
    } catch (err) {
        alert('Error: ' + err.message);
    }
});

function showQuestion() {
    const qData = currentQuestions[currentIndex];
    
    document.getElementById('progress').textContent = `Question ${currentIndex + 1} of ${currentQuestions.length}`;
    document.getElementById('systemBadge').textContent = qData.system;
    document.getElementById('questionText').textContent = qData.q;
    
    const optionsDiv = document.getElementById('optionsContainer');
    optionsDiv.innerHTML = '';
    document.getElementById('explanationContainer').classList.add('hidden');
    document.getElementById('submitBtn').classList.remove('hidden');
    selectedOptionKey = null;

    Object.keys(qData.o).forEach(key => {
        const optionValue = qData.o[key];
        const label = document.createElement('label');
        label.className = 'option-label';
        label.dataset.key = key;
        
        label.innerHTML = `<input type="radio" name="quiz-opt" value="${key}"> <strong>${key}.</strong> ${optionValue}`;
        label.addEventListener('change', () => { selectedOptionKey = key; });
        optionsDiv.appendChild(label);
    });
}

document.getElementById('submitBtn').addEventListener('click', () => {
    if (!selectedOptionKey) {
        alert('Please select an answer choice.');
        return;
    }
    
    const qData = currentQuestions[currentIndex];
    const labels = document.querySelectorAll('.option-label');
    const correctAnswerKey = qData.a;

    labels.forEach(label => {
        const currentLabelKey = label.dataset.key;
        const input = label.querySelector('input');
        
        if (currentLabelKey === correctAnswerKey) {
            label.classList.add('correct');
        } else if (currentLabelKey === selectedOptionKey && selectedOptionKey !== correctAnswerKey) {
            label.classList.add('incorrect');
        }
        input.disabled = true;
    });

    document.getElementById('explanationText').textContent = qData.e;
    document.getElementById('explanationContainer').classList.remove('hidden');
    document.getElementById('submitBtn').classList.add('hidden');
});

document.getElementById('nextBtn').addEventListener('click', () => {
    currentIndex++;
    if (currentIndex < currentQuestions.length) {
        showQuestion();
    } else {
        alert('Evaluation finished!');
        quizContainer.classList.add('hidden');
    }
});
      
