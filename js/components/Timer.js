// Timer Component for Quiz Game
class QuizTimer {
  constructor() {
    this.intervalId = null;
    this.remaining = 0;
    
    // Cache DOM Elements
    this.fillEl = document.getElementById('timer-ring-fill');
    this.numEl = document.getElementById('timer-number');
    this.labelEl = document.getElementById('timer-label-text');
    this.diffEl = document.getElementById('timer-diff-label');
    this.wrapEl = document.getElementById('timer-wrap');
  }

  /**
   * Starts the countdown timer.
   * @param {number} seconds - Countdown duration in seconds.
   * @param {string} difficulty - Difficulty label (Easy, Medium, Hard, Expert).
   * @param {Function} [onExpireCallback] - Callback fired when timer hits 0.
   */
  start(seconds, difficulty, onExpireCallback) {
    this.stop();
    this.remaining = seconds;
    const total = seconds;
    const color = window.DIFF_COLORS[difficulty] || '#3fc77e';

    if (this.fillEl) {
      this.fillEl.style.stroke = color;
      this.fillEl.style.strokeDasharray = window.CIRCUMFERENCE;
    }
    if (this.numEl) {
      this.numEl.style.color = color;
      this.numEl.classList.remove('pulse-red');
    }
    if (this.wrapEl) {
      this.wrapEl.classList.remove('timer-expired');
    }
    if (this.diffEl) {
      this.diffEl.textContent = 'Difficulty: ' + difficulty;
    }

    const tick = () => {
      const pct = this.remaining / total;
      if (this.fillEl) {
        this.fillEl.style.strokeDashoffset = window.CIRCUMFERENCE * (1 - pct);
      }
      if (this.numEl) {
        this.numEl.textContent = this.remaining;
      }

      if (this.remaining <= 10 && this.remaining > 0) {
        if (this.fillEl) this.fillEl.style.stroke = '#f05b5b';
        if (this.numEl) {
          this.numEl.style.color = '#f05b5b';
          this.numEl.classList.add('pulse-red');
        }
      }
      
      if (this.remaining <= 0) {
        this.stop();
        if (this.numEl) {
          this.numEl.textContent = '0';
          this.numEl.classList.remove('pulse-red');
          this.numEl.style.color = '#f05b5b';
        }
        if (this.labelEl) {
          this.labelEl.textContent = "Time's up!";
        }
        if (this.wrapEl) {
          this.wrapEl.classList.add('timer-expired');
        }
        if (this.fillEl) {
          this.fillEl.style.strokeDashoffset = window.CIRCUMFERENCE;
        }
        if (onExpireCallback) {
          onExpireCallback();
        }
      }
      this.remaining--;
    };

    tick();
    this.intervalId = setInterval(tick, 1000);
  }

  /**
   * Stops the active countdown.
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

window.QuizTimer = QuizTimer;
