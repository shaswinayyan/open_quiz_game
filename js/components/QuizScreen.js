// Quiz Screen Component
class QuizScreen {
  /**
   * Creates a QuizScreen instance.
   * @param {QuizTimer} timerInstance - Shared instance of the timer.
   * @param {Function} onNextQuestionCallback - Callback triggered when clicking "Next Question".
   */
  constructor(timerInstance, onNextQuestionCallback) {
    this.timer = timerInstance;
    this.onNextQuestion = onNextQuestionCallback;

    // Cache DOM Elements
    this.progressFill = document.getElementById('progress-fill');
    this.qCounter = document.getElementById('q-counter');
    this.qBadge = document.getElementById('q-badge');
    this.qText = document.getElementById('q-text');
    this.optionsGrid = document.getElementById('options-grid');
    this.teamAnswersList = document.getElementById('team-answers-list');
    this.hostInfo = document.getElementById('host-info');
    this.btnNext = document.getElementById('btn-next');
    this.questionPanel = document.querySelector('.question-panel');

    this.initEvents();
  }

  /**
   * Binds host control events.
   */
  initEvents() {
    if (this.btnNext) {
      this.btnNext.addEventListener('click', () => {
        this.timer.stop();
        if (this.onNextQuestion) {
          this.onNextQuestion();
        }
      });
    }
  }

  /**
   * Renders the active question, option buttons, and answers selector dropdowns for each team.
   * @param {number} currentQ - Index of the current question.
   * @param {number} numTeams - Number of competing teams.
   * @param {string[]} teamNames - Array of team names.
   * @param {Array<Array<number|null>>} teamSelections - 2D array tracking each team's answers per question.
   */
  renderQuestion(currentQ, numTeams, teamNames, teamSelections) {
    const qRaw = window.QUESTIONS[currentQ];
    const total = window.QUESTIONS.length;

    // Robustness: ensure q has all needed fields
    const q = {
      text: qRaw.text || 'Error: Question text missing',
      options: Array.isArray(qRaw.options) ? qRaw.options : ['N/A', 'N/A', 'N/A', 'N/A'],
      correct: typeof qRaw.correct === 'number' ? qRaw.correct : 0,
      timer: qRaw.timer || 30,
      difficulty: qRaw.difficulty || 'Medium',
      aiRate: qRaw.aiRate || '0%'
    };

    if (this.progressFill) {
      this.progressFill.style.width = ((currentQ / total) * 100) + '%';
    }
    if (this.qCounter) {
      this.qCounter.textContent = 'Q ' + (currentQ + 1) + ' / ' + total;
    }
    if (this.qBadge) {
      this.qBadge.textContent = 'Question ' + (currentQ + 1);
    }
    if (this.qText) {
      this.qText.textContent = q.text;
    }

    if (this.optionsGrid) {
      this.optionsGrid.innerHTML = '';
      q.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.dataset.idx = i;
        btn.disabled = true;
        btn.innerHTML = '<span class="opt-letter">' + (window.LETTERS[i] || '?') + '</span><span>' + opt + '</span>';
        this.optionsGrid.appendChild(btn);
      });
    }

    if (this.teamAnswersList) {
      this.teamAnswersList.innerHTML = '';
      for (let t = 0; t < numTeams; t++) {
        const row = document.createElement('div');
        row.className = 'team-answer-row';
        const opts = q.options.map((o, i) => {
          const sel = teamSelections[currentQ][t] === i ? 'selected' : '';
          const label = (window.LETTERS[i] || '?') + '. ' + (o.length > 26 ? o.substring(0, 26) + '…' : o);
          return '<option value="' + i + '" ' + sel + '>' + label + '</option>';
        }).join('');
        row.innerHTML = `
          <div class="team-name-badge">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${window.TEAM_HEX[t]}"></span>
            <span class="${window.TEXT_COLORS[t]}" style="font-weight:600">${teamNames[t]}</span>
          </div>
          <select class="team-answer-select" data-team="${t}">
            <option value="-1" ${teamSelections[currentQ][t] === null ? 'selected' : ''}>— Not answered —</option>
            ${opts}
          </select>`;
        this.teamAnswersList.appendChild(row);
      }

      this.teamAnswersList.querySelectorAll('select').forEach(sel => {
        sel.addEventListener('change', e => {
          const ti = parseInt(e.target.dataset.team);
          const val = parseInt(e.target.value);
          teamSelections[currentQ][ti] = val === -1 ? null : val;
        });
      });
    }

    const isLast = currentQ === total - 1;
    if (this.hostInfo) {
      this.hostInfo.textContent = isLast
        ? 'Last question! Submit answers then reveal everything.'
        : "Select each team's answer, then move on. Answers & AI pass rates revealed at the end!";
    }
    if (this.btnNext) {
      this.btnNext.textContent = isLast ? 'See Final Scores & Answers 🏆' : 'Next Question →';
    }

    // Trigger timer
    this.timer.start(q.timer, q.difficulty);
  }

  /**
   * Triggers entrance animation for the question panel card.
   */
  animateQuestionCard() {
    if (this.questionPanel) {
      this.questionPanel.style.animation = 'none';
      this.questionPanel.offsetHeight; // trigger reflow
      this.questionPanel.style.animation = 'fadeUp 0.3s ease both';
    }
  }
}

window.QuizScreen = QuizScreen;
