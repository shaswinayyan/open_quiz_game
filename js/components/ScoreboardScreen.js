// Scoreboard Screen Component
class ScoreboardScreen {
  /**
   * Creates a ScoreboardScreen instance.
   * @param {Function} onRestartCallback - Callback triggered when clicking "Play Again" button.
   */
  constructor(onRestartCallback) {
    this.onRestart = onRestartCallback;

    // Cache DOM Elements
    this.scoreRows = document.getElementById('score-rows');
    this.breakdownWrap = document.getElementById('breakdown-table-wrap');
    this.restartBtn = document.getElementById('restart-btn');

    this.initEvents();
  }

  /**
   * Binds click handlers to controls.
   */
  initEvents() {
    if (this.restartBtn) {
      this.restartBtn.addEventListener('click', () => {
        if (this.onRestart) {
          this.onRestart();
        }
      });
    }
  }

  /**
   * Calculates scores and outputs final rankings, accuracy, and detailed breakdown.
   * @param {number} numTeams - Number of competing teams.
   * @param {string[]} teamNames - Array of team names.
   * @param {Array<Array<number|null>>} teamSelections - 2D array tracking each team's answers per question.
   */
  render(numTeams, teamNames, teamSelections) {
    const scores = new Array(numTeams).fill(0);
    const perQResult = window.QUESTIONS.map((q, qi) => {
      const correctIdx = typeof q.correct === 'number' ? q.correct : 0;
      return teamSelections[qi].map(ans => {
        if (ans === null) return 'skip';
        return ans === correctIdx ? 'correct' : 'wrong';
      });
    });

    perQResult.forEach((qRes) => {
      qRes.forEach((r, ti) => {
        if (r === 'correct') scores[ti]++;
      });
    });

    const ranked = teamNames.map((name, ti) => ({ name, ti, score: scores[ti] }))
      .sort((a, b) => b.score - a.score);

    // Render ranked team list
    if (this.scoreRows) {
      this.scoreRows.innerHTML = '';
      ranked.forEach((team, rank) => {
        const medal = rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : (rank + 1) + '.';
        const cls = rank < 3 ? 'rank-' + (rank + 1) : '';
        const pct = Math.round((team.score / window.QUESTIONS.length) * 100);
        const row = document.createElement('div');
        row.className = 'score-row ' + cls + ' pop';
        row.style.animationDelay = (rank * 0.07) + 's';
        row.innerHTML = `
          <div class="rank-num">${medal}</div>
          <div class="team-score-info">
            <div class="team-score-name" style="color:${window.TEAM_HEX[team.ti]}">${team.name}</div>
            <div class="team-score-detail">${team.score} correct · ${pct}% accuracy</div>
          </div>
          <div class="score-val">${team.score}<span style="font-size:1rem;color:var(--muted)">/${window.QUESTIONS.length}</span></div>`;
        this.scoreRows.appendChild(row);
      });
    }

    // Render question-by-question grid breakdown
    if (this.breakdownWrap) {
      const ths = teamNames.map((n, ti) =>
        '<th style="color:' + window.TEAM_HEX[ti] + '">' + (n.length > 7 ? n.substring(0, 7) + '…' : n) + '</th>'
      ).join('');

      const rows = window.QUESTIONS.map((q, qi) => {
        const cells = perQResult[qi].map(r => {
          if (r === 'correct') return '<td class="cell-correct">✓</td>';
          if (r === 'wrong') return '<td class="cell-wrong">✗</td>';
          return '<td class="cell-skip">—</td>';
        }).join('');

        const correctIdx = typeof q.correct === 'number' ? q.correct : 0;
        const options = Array.isArray(q.options) ? q.options : ['N/A', 'N/A', 'N/A', 'N/A'];
        const cLetter = window.LETTERS[correctIdx] || '?';
        const rawText = options[correctIdx] || 'N/A';
        const cText = rawText.length > 28 ? rawText.substring(0, 28) + '…' : rawText;
        const diffColor = window.DIFF_COLORS[q.difficulty] || '#fff';
        const aiRate = q.aiRate || '0%';

        return `<tr>
          <td style="color:var(--muted);white-space:nowrap">Q${qi + 1} <span style="color:${diffColor};font-size:0.7rem">${q.difficulty}</span></td>
          ${cells}
          <td style="color:var(--correct);font-size:0.78rem;text-align:left">${cLetter}. ${cText}</td>
          <td style="text-align:right"><span class="ai-rate-pill">AI: ${aiRate}</span></td>
        </tr>`;
      }).join('');

      this.breakdownWrap.innerHTML = `
        <table class="breakdown-table">
          <thead><tr>
            <th></th>${ths}
            <th style="text-align:left;color:var(--correct)">Correct Answer</th>
            <th style="text-align:right;color:var(--accent2)">AI Rate</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>`;
    }
  }
}

window.ScoreboardScreen = ScoreboardScreen;
