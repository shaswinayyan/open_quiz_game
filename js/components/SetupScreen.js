// Setup Screen Component
class SetupScreen {
  /**
   * Creates a SetupScreen instance.
   * @param {Function} onStartQuizCallback - Callback invoked when the user starts the quiz. Fired with (numTeams, teamNames).
   * @param {Function} onManageQuestionsCallback - Callback invoked when the user clicks "Manage Questions".
   */
  constructor(onStartQuizCallback, onManageQuestionsCallback) {
    this.numTeams = 2;
    this.teamNames = [];
    this.onStartQuiz = onStartQuizCallback;
    this.onManageQuestions = onManageQuestionsCallback;

    // Cache DOM Elements
    this.decBtn = document.getElementById('dec-teams');
    this.incBtn = document.getElementById('inc-teams');
    this.countDisplay = document.getElementById('team-count-display');
    this.namesGrid = document.getElementById('team-names-grid');
    this.startBtn = document.getElementById('start-btn');
    this.manageBtn = document.getElementById('manage-questions-btn');

    this.initEvents();
  }

  /**
   * Binds click handlers to configuration controls.
   */
  initEvents() {
    if (this.decBtn) {
      this.decBtn.addEventListener('click', () => {
        if (this.numTeams > 2) {
          this.numTeams--;
          this.render();
        }
      });
    }

    if (this.incBtn) {
      this.incBtn.addEventListener('click', () => {
        if (this.numTeams < 6) {
          this.numTeams++;
          this.render();
        }
      });
    }

    if (this.startBtn) {
      this.startBtn.addEventListener('click', () => {
        // Ensure all active teams have a non-empty name
        for (let i = 0; i < this.numTeams; i++) {
          if (!this.teamNames[i] || !this.teamNames[i].trim()) {
            this.teamNames[i] = 'Team ' + (i + 1);
          }
        }
        if (this.onStartQuiz) {
          this.onStartQuiz(this.numTeams, this.teamNames);
        }
      });
    }

    if (this.manageBtn) {
      this.manageBtn.addEventListener('click', () => {
        if (this.onManageQuestions) {
          this.onManageQuestions();
        }
      });
    }
  }

  /**
   * Resets setup configurations back to default.
   */
  reset() {
    this.numTeams = 2;
    this.teamNames = [];
    this.render();
  }

  /**
   * Renders the team size selector and team name text input fields.
   */
  render() {
    if (this.countDisplay) {
      this.countDisplay.textContent = this.numTeams;
    }
    if (this.namesGrid) {
      this.namesGrid.innerHTML = '';
      for (let i = 0; i < this.numTeams; i++) {
        const wrap = document.createElement('div');
        wrap.className = 'team-input-wrap';
        wrap.innerHTML = `
          <label class="field-label" style="font-size:0.75rem">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:5px;background:${window.TEAM_HEX[i]}"></span>Team ${i+1}
          </label>
          <input type="text" placeholder="Team ${i+1} name" value="${this.teamNames[i] || ''}" data-idx="${i}" />`;
        this.namesGrid.appendChild(wrap);
      }

      this.namesGrid.querySelectorAll('input').forEach(inp => {
        inp.addEventListener('input', e => {
          const idx = parseInt(e.target.dataset.idx);
          this.teamNames[idx] = e.target.value;
        });
      });
    }
  }
}

window.SetupScreen = SetupScreen;
