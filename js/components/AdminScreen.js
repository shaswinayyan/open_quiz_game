// Question & Timer Manager Component
class AdminScreen {
  /**
   * Creates an AdminScreen instance.
   * @param {Function} onBackCallback - Callback triggered when clicking "Back to Setup".
   */
  constructor(onBackCallback) {
    this.onBack = onBackCallback;

    // Cache DOM Elements
    this.screenEl = document.getElementById('screen-admin');
    this.listEl = document.getElementById('admin-questions-list');
    this.btnBack = document.getElementById('btn-close-admin');
    this.btnAdd = document.getElementById('btn-add-question');
    this.btnReset = document.getElementById('btn-reset-questions');
    this.btnExport = document.getElementById('btn-export-json');
    this.inputImport = document.getElementById('import-json-input');

    // Modal Elements
    this.modalEl = document.getElementById('editor-modal');
    this.formEl = document.getElementById('question-form');
    this.modalTitleEl = document.getElementById('modal-title');
    this.btnCancel = document.getElementById('btn-cancel-edit');

    // Form inputs
    this.inputQId = document.getElementById('edit-q-id');
    this.inputQText = document.getElementById('edit-q-text');
    this.inputQCorrect = document.getElementById('edit-q-correct');
    this.inputQTimer = document.getElementById('edit-q-timer');
    this.inputQDiff = document.getElementById('edit-q-diff');
    this.inputQAiRate = document.getElementById('edit-q-airate');

    this.initEvents();
  }

  /**
   * Binds UI events.
   */
  initEvents() {
    if (this.btnBack) {
      this.btnBack.addEventListener('click', () => {
        if (this.onBack) this.onBack();
      });
    }

    if (this.btnAdd) {
      this.btnAdd.addEventListener('click', () => this.openAddModal());
    }

    if (this.btnReset) {
      this.btnReset.addEventListener('click', () => this.handleReset());
    }

    if (this.btnExport) {
      this.btnExport.addEventListener('click', () => this.handleExport());
    }

    if (this.inputImport) {
      this.inputImport.addEventListener('change', (e) => this.handleImport(e));
    }

    if (this.btnCancel) {
      this.btnCancel.addEventListener('click', () => this.closeModal());
    }

    if (this.formEl) {
      this.formEl.addEventListener('submit', (e) => this.handleSave(e));
    }
  }

  /**
   * Renders the question list on screen.
   */
  render() {
    if (!this.listEl) return;
    this.listEl.innerHTML = '';

    if (window.QUESTIONS.length === 0) {
      this.listEl.innerHTML = '<div style="text-align:center; padding:2rem; color:var(--muted)">No questions available. Click "+ Add Question" to create one!</div>';
      return;
    }

    window.QUESTIONS.forEach((q, idx) => {
      const item = document.createElement('div');
      item.className = 'admin-q-item';
      
      const diffColor = window.DIFF_COLORS[q.difficulty] || '#fff';
      
      item.innerHTML = `
        <div class="admin-q-content">
          <div class="admin-q-text">Q${idx + 1}: ${q.text}</div>
          <div class="admin-q-meta">
            <span class="admin-badge badge-timer">⏱ ${q.timer}s</span>
            <span class="admin-badge" style="background:${diffColor}1c; color:${diffColor}; border:1px solid ${diffColor}40">${q.difficulty}</span>
            <span class="admin-badge badge-ai">AI Rate: ${q.aiRate}</span>
            <span style="font-size:0.75rem; color:var(--muted)">Correct: ${window.LETTERS[q.correct]}. ${q.options[q.correct]}</span>
          </div>
        </div>
        <div class="admin-q-actions">
          <button class="btn-edit-q" data-id="${q.id}">Edit</button>
          <button class="btn-delete-q" data-id="${q.id}">Delete</button>
        </div>
      `;

      // Event listeners for Edit and Delete
      item.querySelector('.btn-edit-q').addEventListener('click', (e) => {
        const qId = parseInt(e.target.dataset.id);
        this.openEditModal(qId);
      });

      item.querySelector('.btn-delete-q').addEventListener('click', (e) => {
        const qId = parseInt(e.target.dataset.id);
        this.handleDelete(qId);
      });

      this.listEl.appendChild(item);
    });
  }

  /**
   * Opens the modal for adding a new question.
   */
  openAddModal() {
    if (!this.modalEl) return;
    this.modalTitleEl.textContent = 'Add New Question';
    this.inputQId.value = ''; // Empty ID indicates new question
    
    // Clear inputs
    this.inputQText.value = '';
    for (let i = 0; i < 4; i++) {
      document.getElementById(`edit-opt-${i}`).value = '';
    }
    this.inputQCorrect.value = '0';
    this.inputQTimer.value = '45';
    this.inputQDiff.value = 'Medium';
    this.inputQAiRate.value = '50%';

    this.modalEl.classList.add('active');
  }

  /**
   * Opens the modal for editing an existing question.
   */
  openEditModal(qId) {
    if (!this.modalEl) return;
    const q = window.QUESTIONS.find(item => item.id === qId);
    if (!q) return;

    this.modalTitleEl.textContent = 'Edit Question';
    this.inputQId.value = q.id;
    this.inputQText.value = q.text;
    
    for (let i = 0; i < 4; i++) {
      document.getElementById(`edit-opt-${i}`).value = q.options[i] || '';
    }
    
    this.inputQCorrect.value = q.correct;
    this.inputQTimer.value = q.timer;
    this.inputQDiff.value = q.difficulty;
    this.inputQAiRate.value = q.aiRate;

    this.modalEl.classList.add('active');
  }

  /**
   * Closes the editor modal.
   */
  closeModal() {
    if (this.modalEl) {
      this.modalEl.classList.remove('active');
    }
  }

  /**
   * Handles saving the form (both Edit and Add).
   */
  handleSave(e) {
    e.preventDefault();

    const text = this.inputQText.value.trim();
    const options = [
      document.getElementById('edit-opt-0').value.trim(),
      document.getElementById('edit-opt-1').value.trim(),
      document.getElementById('edit-opt-2').value.trim(),
      document.getElementById('edit-opt-3').value.trim()
    ];
    const correct = parseInt(this.inputQCorrect.value);
    const timer = parseInt(this.inputQTimer.value);
    const difficulty = this.inputQDiff.value;
    const aiRate = this.inputQAiRate.value.trim();

    const qIdStr = this.inputQId.value;

    if (qIdStr) {
      // Editing Existing Question
      const qId = parseInt(qIdStr);
      const qIdx = window.QUESTIONS.findIndex(item => item.id === qId);
      if (qIdx !== -1) {
        window.QUESTIONS[qIdx] = {
          id: qId,
          text,
          options,
          correct,
          timer,
          difficulty,
          aiRate
        };
      }
    } else {
      // Adding New Question
      const newId = window.QUESTIONS.length > 0
        ? Math.max(...window.QUESTIONS.map(item => item.id)) + 1
        : 1;
      
      window.QUESTIONS.push({
        id: newId,
        text,
        options,
        correct,
        timer,
        difficulty,
        aiRate
      });
    }

    this.saveToStorage();
    this.closeModal();
    this.render();
  }

  /**
   * Handles deleting a question.
   */
  handleDelete(qId) {
    if (confirm('Are you sure you want to delete this question?')) {
      window.QUESTIONS = window.QUESTIONS.filter(item => item.id !== qId);
      this.saveToStorage();
      this.render();
    }
  }

  /**
   * Resets questions back to defaults.
   */
  handleReset() {
    if (confirm('Reset to the original 8 questions? This will erase all custom questions.')) {
      localStorage.removeItem('trivia_questions');
      window.loadQuestions();
      this.render();
    }
  }

  /**
   * Exports questions to a JSON file.
   */
  handleExport() {
    const dataStr = JSON.stringify(window.QUESTIONS, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'brain_dusk_questions.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Imports questions from a JSON file.
   */
  handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        
        // Basic validation
        if (!Array.isArray(imported)) {
          throw new Error('JSON is not an array');
        }
        
        const validated = imported.map((q, idx) => {
          if (!q.text || !Array.isArray(q.options) || q.options.length !== 4 || typeof q.correct !== 'number') {
            throw new Error(`Invalid format at index ${idx}`);
          }
          return {
            id: q.id || idx + 1,
            text: q.text,
            options: q.options,
            correct: q.correct,
            timer: q.timer || 45,
            difficulty: q.difficulty || 'Medium',
            aiRate: q.aiRate || '50%'
          };
        });

        window.QUESTIONS = validated;
        this.saveToStorage();
        this.render();
        alert(`Successfully imported ${validated.length} questions!`);
      } catch (err) {
        alert('Failed to import JSON: ' + err.message);
      }
      
      // Reset input
      this.inputImport.value = '';
    };
    
    reader.readAsText(file);
  }

  /**
   * Helper to write window.QUESTIONS to localStorage.
   */
  saveToStorage() {
    localStorage.setItem('trivia_questions', JSON.stringify(window.QUESTIONS));
  }
}

window.AdminScreen = AdminScreen;
