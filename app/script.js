const grades = [];
const tasks = [];

const gradeForm = document.getElementById('grade-form');
const taskForm = document.getElementById('task-form');
const gradeList = document.getElementById('grade-list');
const taskList = document.getElementById('task-list');
const averageEl = document.getElementById('average');
const aiTipsEl = document.getElementById('ai-tips');
const planningEl = document.getElementById('planning');
const generatePlanButton = document.getElementById('generate-plan');

gradeForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const subject = document.getElementById('subject').value.trim();
  const score = Number(document.getElementById('score').value);

  grades.push({ subject, score });
  event.target.reset();
  renderGrades();
  renderAdvice();
});

taskForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = document.getElementById('task-name').value.trim();
  const subject = document.getElementById('task-subject').value.trim();
  const deadline = document.getElementById('task-deadline').value;
  const duration = Number(document.getElementById('task-duration').value);

  tasks.push({ name, subject, deadline, duration });
  event.target.reset();
  renderTasks();
});

generatePlanButton.addEventListener('click', renderPlanning);

function renderGrades() {
  gradeList.innerHTML = '';
  grades.forEach((grade) => {
    const line = document.createElement('li');
    line.textContent = `${grade.subject}: ${grade.score}/20`;
    gradeList.append(line);
  });

  if (grades.length === 0) {
    averageEl.textContent = '-';
    return;
  }

  const total = grades.reduce((sum, grade) => sum + grade.score, 0);
  averageEl.textContent = (total / grades.length).toFixed(2) + '/20';
}

function renderTasks() {
  taskList.innerHTML = '';
  tasks
    .slice()
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .forEach((task) => {
      const line = document.createElement('li');
      line.textContent = `${task.name} (${task.subject}) • ${task.deadline} • ${task.duration} min`;
      taskList.append(line);
    });
}

function renderAdvice() {
  if (grades.length === 0) {
    aiTipsEl.textContent = 'Ajoute des notes pour recevoir des recommandations personnalisées.';
    return;
  }

  const average = grades.reduce((sum, grade) => sum + grade.score, 0) / grades.length;
  const weakSubjects = grades.filter((grade) => grade.score < 10).map((grade) => grade.subject);
  const strongSubjects = grades.filter((grade) => grade.score >= 15).map((grade) => grade.subject);

  const lines = [];
  lines.push(`Moyenne actuelle: ${average.toFixed(2)}/20.`);

  if (weakSubjects.length > 0) {
    lines.push(`⚠️ Priorité de révision: ${[...new Set(weakSubjects)].join(', ')}.`);
    lines.push('Conseil IA: fais 2 sessions de 30 min par matière faible + 10 min de quiz actif.');
  } else {
    lines.push('✅ Très bonne dynamique, aucune matière en alerte immédiate.');
  }

  if (strongSubjects.length > 0) {
    lines.push(`💡 Capitalise tes points forts (${[...new Set(strongSubjects)].join(', ')}) en aidant un camarade: enseigner consolide la mémoire.`);
  }

  lines.push('Routine IA suggérée: 25 min focus + 5 min pause, puis auto-évaluation rapide.');
  aiTipsEl.textContent = lines.join('\n');
}

function renderPlanning() {
  planningEl.innerHTML = '';

  if (tasks.length === 0) {
    const empty = document.createElement('li');
    empty.textContent = 'Ajoute des devoirs pour générer un planning intelligent.';
    planningEl.append(empty);
    return;
  }

  const gradeBySubject = Object.fromEntries(
    grades.map((grade) => [grade.subject.toLowerCase(), grade.score]),
  );

  const rankedTasks = tasks
    .slice()
    .map((task) => {
      const relatedScore = gradeBySubject[task.subject.toLowerCase()] ?? 12;
      const urgency = Math.max(1, Math.ceil((new Date(task.deadline) - new Date()) / 86400000));
      const weaknessBoost = Math.max(0, 14 - relatedScore);
      const priority = (task.duration / 30) + weaknessBoost + 8 / urgency;
      return { ...task, priority, relatedScore };
    })
    .sort((a, b) => b.priority - a.priority);

  rankedTasks.forEach((task, index) => {
    const line = document.createElement('li');
    const sessions = Math.max(1, Math.ceil(task.duration / 30));
    line.textContent = `${index + 1}. ${task.subject} - ${task.name}: ${sessions} session(s) de 30 min avant le ${task.deadline} (priorité ${task.priority.toFixed(1)}).`;
    planningEl.append(line);
  });
}
