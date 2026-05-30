
const paperMap = { part1: ["2025_sep"] }; 

let rawQuestions = [];
let filtered = [];
let currentIdx = 0;

const catSel = document.getElementById('categorySelect');
const papSel = document.getElementById('paperSelect');
const subSel = document.getElementById('subjectSelect');
const loadBtn = document.getElementById('loadBtn');

catSel.addEventListener('change', () => {
    papSel.innerHTML = '<option value="">Select Paper</option>';
    paperMap[catSel.value]?.forEach(p => papSel.innerHTML += `<option value="${p}">${p.replace('_', ' ')}</option>`);
    papSel.disabled = !catSel.value;
});

papSel.addEventListener('change', async () => {
    const url = `data/${catSel.value}/${papSel.value}.json`;
    const res = await fetch(url);
    rawQuestions = await res.json();
    
    const subjects = [...new Set(rawQuestions.map(q => q.primary_system))];
    subSel.innerHTML = '<option value="">All Specialties</option>';
    subjects.forEach(s => subSel.innerHTML += `<option value="${s}">${s}</option>`);
    subSel.disabled = false;
    loadBtn.disabled = false;
});

loadBtn.addEventListener('click', () => {
    filtered = subSel.value ? rawQuestions.filter(q => q.primary_system === subSel.value) : rawQuestions;
    currentIdx = 0;
    document.getElementById('quizContainer').classList.remove('hidden');
    showQ();
});

function showQ() {
    const q = filtered[currentIdx];
    document.getElementById('progress').textContent = `Question ${currentIdx + 1} / ${filtered.length}`;
    document.getElementById('systemBadge').textContent = q.primary_system;
    document.getElementById('questionText').textContent = q.question;
    
    const cont = document.getElementById('optionsContainer');
    cont.innerHTML = '';
    
    // Map your new options object structure
    Object.entries(q.options).forEach(([key, val]) => {
        cont.innerHTML += `
            <label class="option-label" data-key="${key}">
                <input type="radio" name="q" value="${key}"> <strong>${key}.</strong> ${val}
            </label>`;
    });
    document.getElementById('explanationContainer').classList.add('hidden');
    document.getElementById('submitBtn').classList.remove('hidden');
}

document.getElementById('submitBtn').addEventListener('click', () => {
    const selected = document.querySelector('input[name="q"]:checked');
    if (!selected) return alert('Select an option');
    
    const q = filtered[currentIdx];
    const labels = document.querySelectorAll('.option-label');
    
    labels.forEach(l => {
        const key = l.dataset.key;
        if (q.options[key] === q.answer) l.classList.add('correct');
        else if (key === selected.value) l.classList.add('incorrect');
    });
    
    document.getElementById('explanationText').textContent = q.explanation;
    document.getElementById('explanationContainer').classList.remove('hidden');
    document.getElementById('submitBtn').classList.add('hidden');
});

document.getElementById('nextBtn').addEventListener('click', () => {
    if (++currentIdx < filtered.length) showQ();
    else alert('Finished!');
});
