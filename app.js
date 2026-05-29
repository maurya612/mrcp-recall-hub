const paperMap = {
    part1: ["2026_01"], 
    part2: [],
    paces: []
};

let currentQuestions = [];
let currentIndex = 0;
let selectedOptionKey = null;

const categorySelect = document.getElementById('categorySelect');
const paperSelect = document.getElementById('paperSelect');
const loadBtn = document.getElementById('loadBtn');
const quizContainer = document.getElementById('quizContainer');

categorySelect.addEventListener('change', (e) => {
    const cat = e.target.value;
    paperSelect.innerHTML = '<option value="">Select Paper (Year/Month)</option>';
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
        loadBtn.disabled = true;
    }
});

paperSelect.addEventListener('change', (e) => {
    loadBtn.disabled = !e.target.value;
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
      
