import { firebaseConfig } from "./firebase-config.js";

const questions = [
  [
    "Which sensor is commonly used to measure distance in robotics?",
    [
      "Temperature sensor",
      "Ultrasonic sensor (HC-SR04)",
      "Microphone",
      "Humidity sensor",
    ],
    1,
  ],
  [
    "An actuator is a device that produces motion from energy.",
    ["True", "False"],
    0,
  ],
  [
    "Which microcontroller is widely used in automation projects?",
    ["Arduino UNO", "Photoshop", "Excel", "Chrome"],
    0,
  ],
  ["A servo motor can stop at a precise angle.", ["True", "False"], 0],
  [
    "In automation, a PLC is mainly used to:",
    [
      "Control industrial processes",
      "Edit videos",
      "Browse the internet",
      "Play music",
    ],
    0,
  ],
  [
    "An infrared sensor can detect an object without touching it.",
    ["True", "False"],
    0,
  ],
  [
    "What motor rotates a fixed number of steps for each electrical pulse?",
    ["Stepper motor", "Simple DC motor", "Common fan", "Gasoline engine"],
    0,
  ],
  [
    "Robotics combines mechanics, electronics, and programming.",
    ["True", "False"],
    0,
  ],
  [
    "Which is NOT a typical stage of an automated system?",
    ["Sensing", "Processing/control", "Actuation", "Mandatory 3D printing"],
    3,
  ],
  [
    "A control loop in a robot only runs once and then shuts down.",
    ["True", "False"],
    1,
  ],
  [
    "What does PLC stand for?",
    [
      "Programmable Logic Controller",
      "Personal Light Computer",
      "Program Logic Cable",
      "Power Level Control",
    ],
    0,
  ],
  [
    "What does a sensor do?",
    [
      "Detects information from the environment",
      "Only produces sound",
      "Only displays images",
      "Turns off the computer",
    ],
    0,
  ],
  [
    "Which signal is commonly used to control DC motor speed?",
    ["PWM", "JPEG", "PDF", "HDMI"],
    0,
  ],
  [
    "What does CAD software help engineers do?",
    [
      "Design models and systems",
      "Measure temperature",
      "Play music",
      "Browse only",
    ],
    0,
  ],
  [
    "Which component converts electrical energy into mechanical movement?",
    ["Actuator", "Database", "Monitor", "Spreadsheet"],
    0,
  ],
  [
    "Feedback in a control system is mainly used to:",
    [
      "Compare output with desired behavior",
      "Turn off all sensors",
      "Store images",
      "Print documents",
    ],
    0,
  ],
  [
    "Which Arduino function repeatedly executes during normal operation?",
    ["loop()", "setup() only", "mainImage()", "startRobot()"],
    0,
  ],
  [
    "What is an emergency stop mainly designed for?",
    [
      "Safely stopping machinery",
      "Increasing motor speed",
      "Improving Wi-Fi",
      "Saving game scores",
    ],
    0,
  ],
  [
    "Which sensor commonly detects rotation or orientation?",
    ["Gyroscope", "Microphone", "LDR only", "Thermometer"],
    0,
  ],
  [
    "A robot end effector is:",
    [
      "The tool attached to the robot arm",
      "The robot battery only",
      "A programming language",
      "A web browser",
    ],
    0,
  ],
];

const $ = (id) => document.getElementById(id);
let selected = [],
  current = 0,
  score = 0,
  streak = 0,
  bestStreak = 0,
  lives = 3,
  timer = null,
  timeLeft = 20,
  username = "";

function shuffle(a) {
  return [...a].sort(() => Math.random() - 0.5);
}
function show(id) {
  document
    .querySelectorAll(".screen")
    .forEach((x) => x.classList.remove("active"));
  $(id).classList.add("active");
}
function saveScore() {
  // Local persistent ranking. Firebase can replace this later.
  const ranking = JSON.parse(localStorage.getItem("robotRanking") || "[]");
  ranking.push({ username, score, date: new Date().toISOString() });
  ranking.sort((a, b) => b.score - a.score);
  localStorage.setItem("robotRanking", JSON.stringify(ranking.slice(0, 50)));
}
function startGame() {
  username = $("username").value.trim();
  if (!username) {
    alert("Please enter a username.");
    return;
  }
  selected = shuffle(questions).slice(0, 10);
  current = 0;
  score = 0;
  streak = 0;
  bestStreak = 0;
  lives = 3;
  $("playerName").textContent = username;
  $("score").textContent = 0;
  $("streak").textContent = 0;
  updateLives();
  show("gameScreen");
  loadQuestion();
}
function updateLives() {
  $("lives").textContent = "❤️".repeat(lives) + "🖤".repeat(3 - lives);
}
function loadQuestion() {
  clearInterval(timer);
  timeLeft = 20;
  const q = selected[current],
    items = shuffle(q[1].map((text, i) => ({ text, correct: i === q[2] })));
  $("questionText").textContent = q[0];
  $("questionCount").textContent = `QUESTION ${current + 1}/10`;
  $("progressBar").style.width = `${((current + 1) / 10) * 100}%`;
  $("feedback").textContent = "";
  const box = $("answers");
  box.innerHTML = "";
  items.forEach((a, i) => {
    const b = document.createElement("button");
    b.className = "answer";
    b.innerHTML = `<strong>${String.fromCharCode(65 + i)}</strong> — ${a.text}`;
    b.onclick = () => answer(a.correct, b);
    box.appendChild(b);
  });
  timer = setInterval(() => {
    timeLeft--;
    $("timerText").textContent = timeLeft + "s";
    if (timeLeft <= 0) {
      clearInterval(timer);
      timeout();
    }
  }, 1000);
  $("timerText").textContent = "20s";
}
function answer(correct, button) {
  clearInterval(timer);
  document.querySelectorAll(".answer").forEach((b) => (b.disabled = true));
  if (correct) {
    const speedBonus = timeLeft * 2,
      streakBonus = streak * 10,
      gained = 100 + speedBonus + streakBonus;
    score += gained;
    streak++;
    bestStreak = Math.max(bestStreak, streak);
    button.classList.add("correct");
    $("feedback").textContent = `✅ CORRECT! +${gained} POINTS`;
  } else {
    button.classList.add("wrong");
    streak = 0;
    lives--;
    updateLives();
    $("feedback").textContent = "❌ INCORRECT — LIFE LOST";
    if (lives <= 0) {
      setTimeout(finish, 1100);
      return;
    }
  }
  $("score").textContent = score;
  $("streak").textContent = streak;
  setTimeout(next, 1200);
}
function timeout() {
  document.querySelectorAll(".answer").forEach((b) => (b.disabled = true));
  streak = 0;
  lives--;
  updateLives();
  $("feedback").textContent = "⏱ TIME OUT — LIFE LOST";
  if (lives <= 0) setTimeout(finish, 1100);
  else setTimeout(next, 1100);
}
function next() {
  current++;
  if (current >= selected.length) finish();
  else loadQuestion();
}
function finish() {
  clearInterval(timer);
  saveScore();
  show("resultScreen");
  $("finalScore").textContent = score;
  let level =
    score >= 1500
      ? "🏆 EXPERT"
      : score >= 1000
        ? "⚡ ADVANCED"
        : score >= 600
          ? "🤖 INTERMEDIATE"
          : "🌱 BEGINNER";
  $("levelText").textContent = level;
  $("bestStreakText").textContent = `🔥 BEST STREAK: ${bestStreak}`;
}
function ranking() {
  const r = JSON.parse(localStorage.getItem("robotRanking") || "[]")
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
  $("modalContent").innerHTML =
    `<h2>🏆 GLOBAL RANKING</h2>` +
    (r.length
      ? r
          .map(
            (x, i) =>
              `<div class="ranking-row rank-${i + 1}"><span>${i + 1}. ${escapeHtml(x.username)}</span><strong>${x.score}</strong></div>`,
          )
          .join("")
      : "<p>No scores yet. Be the first!</p>") +
    `<p style="color:#7d91a5;margin-top:20px;font-size:14px">Currently saved locally. Configure Firebase for a shared online ranking.</p>`;
  $("modal").classList.add("show");
}
function escapeHtml(s) {
  const d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}
function rules() {
  $("modalContent").innerHTML =
    `<h2>HOW TO PLAY</h2><ul class="rules"><li>Answer 10 random questions.</li><li>You start with 3 lives ❤️.</li><li>Correct answers give 100 points plus speed and streak bonuses.</li><li>Wrong answers or timeouts cost one life.</li><li>Each question has 20 seconds.</li><li>Build streaks 🔥 for extra points.</li></ul>`;
  $("modal").classList.add("show");
}
$("startBtn").onclick = startGame;
$("rankingBtn").onclick = ranking;
$("resultRankingBtn").onclick = ranking;
$("rulesBtn").onclick = rules;
$("playAgainBtn").onclick = () => show("startScreen");
$("closeModal").onclick = () => $("modal").classList.remove("show");
$("modal").onclick = (e) => {
  if (e.target === $("modal")) $("modal").classList.remove("show");
};
