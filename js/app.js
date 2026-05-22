// Main Trivia Application Orchestrator
class TriviaApp {
  constructor() {
    this.numTeams = 2;
    this.teamNames = [];
    this.currentQ = 0;
    this.teamSelections = [];

    // Initialize Core Components
    this.timer = new QuizTimer();
    
    this.setupScreen = new SetupScreen(
      (numTeams, teamNames) => {
        this.numTeams = numTeams;
        this.teamNames = teamNames;
        this.startQuiz();
      },
      () => {
        this.showScreen('admin');
        this.adminScreen.render();
      }
    );

    this.adminScreen = new AdminScreen(() => {
      this.showScreen('setup');
    });

    this.quizScreen = new QuizScreen(this.timer, () => {
      this.handleNextQuestion();
    });

    this.scoreboardScreen = new ScoreboardScreen(() => {
      this.handleRestart();
    });
  }

  /**
   * Initializes the application screen states.
   */
  init() {
    this.showScreen('setup');
    this.setupScreen.render();
  }

  /**
   * Transitions active screens.
   * @param {string} id - The screen id suffix ('setup', 'quiz', or 'scores').
   */
  showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screenEl = document.getElementById('screen-' + id);
    if (screenEl) {
      screenEl.classList.add('active');
    }
  }

  /**
   * Fired from SetupScreen when quiz starts.
   * Prepares the answers array and renders the first question.
   */
  startQuiz() {
    // 2D Array: Questions x Teams
    this.teamSelections = window.QUESTIONS.map(() => new Array(this.numTeams).fill(null));
    this.currentQ = 0;
    this.showScreen('quiz');
    this.quizScreen.renderQuestion(
      this.currentQ,
      this.numTeams,
      this.teamNames,
      this.teamSelections
    );
  }

  /**
   * Progresses the game state or shows final scoreboard.
   */
  handleNextQuestion() {
    if (this.currentQ < window.QUESTIONS.length - 1) {
      this.currentQ++;
      this.quizScreen.renderQuestion(
        this.currentQ,
        this.numTeams,
        this.teamNames,
        this.teamSelections
      );
      this.quizScreen.animateQuestionCard();
    } else {
      this.showScreen('scores');
      this.scoreboardScreen.render(
        this.numTeams,
        this.teamNames,
        this.teamSelections
      );
    }
  }

  /**
   * Resets the entire game state.
   */
  handleRestart() {
    this.timer.stop();
    this.setupScreen.reset();
    this.showScreen('setup');
  }
}

window.TriviaApp = TriviaApp;
