const startScreen = document.getElementById("start-screen");
const gameContainer = document.getElementById("game-container");
const startBtn = document.getElementById("start-button");

const music = document.getElementById("music");
const game = document.getElementById("game");
const scoreText = document.getElementById("score");
const comboText = document.getElementById("combo");
const judgeText = document.getElementById("judge");
const laneElements = [
    document.getElementById("lane0"),
    document.getElementById("lane1"),
    document.getElementById("lane2"),
    document.getElementById("lane3")
];
const keyElements = document.getElementById("keys").children;

let notes = [];
let score = 0;
let combo = 0;
const speed = 6;
const judgeY = 595;
let currentBeatmap = [];
let isPlaying = false;

function generateDynamicBeatmap(bpm, durationSeconds, style) {
    const beatmap = [];
    const totalDurationMs = durationSeconds * 1000;
    const interval = (60 / bpm) * 1000 / 2;
    let lastLane = -1;

    for (let time = 1500; time < totalDurationMs - 3000; time += interval) {
        if (Math.random() > 0.15) {
            let lane = Math.floor(Math.random() * 4);
            if (lane === lastLane) {
                lane = (lane + 1) % 4;
            }
            lastLane = lane;

            beatmap.push({ time: time, lane: lane });

            if ((style === 'chord' && Math.random() < 0.35) || (Math.random() < 0.20)) {
                let secondLane = (lane + 2) % 4;
                beatmap.push({ time: time, lane: secondLane });
            }

            if (time > 90000 && Math.random() < 0.40) {
                let burstLane = Math.floor(Math.random() * 4);
                beatmap.push({ time: time + (interval / 2), lane: burstLane });
            }
        }
    }
    return beatmap;
}

const songs = {
    song1: {
        src: "owari.mp3",
        bpm: 130,
        duration: 150,
        style: 'stream'
    },
};

function spawn(noteData) {
    let note = document.createElement("div");
    note.className = "note";
    note.style.left = (noteData.lane * 105) + "px";
    note.y = -20;
    note.dataset.lane = noteData.lane;
    game.appendChild(note);
    notes.push(note);
}

function triggerJudgeAnimation() {
    judgeText.classList.remove("animate");
    void judgeText.offsetWidth;
    judgeText.classList.add("animate");
}

function update() {
    if (!isPlaying) return;

    let current = music.currentTime * 1000;

    currentBeatmap.forEach(n => {
        if (!n.spawned && current >= n.time - (judgeY / speed) * 16.67) {
            spawn(n);
            n.spawned = true;
        }
    });

    for (let i = notes.length - 1; i >= 0; i--) {
        let note = notes[i];
        note.y += speed;
        note.style.top = note.y + "px";

        if (note.y > 700) {
            combo = 0;
            comboText.innerText = "Combo : " + combo;

            judgeText.innerText = "MISS";
            judgeText.style.color = "#ffffff";
            triggerJudgeAnimation();

            note.remove();
            notes.splice(i, 1);
        }
    }

    if (music.ended) {
        isPlaying = false;

        const winScore = 50000;
        const isWin = score >= winScore;

        const resultDiv = document.createElement("div");
        resultDiv.id = "result-screen";

        resultDiv.innerHTML = `
        <h2>${isWin ? "BẠN ĐÃ THOÁT" : "BẠN ĐÃ CHẾT"}</h2>

        <p>Điểm: <span>${score}</span></p>
        <p>Combo cao nhất: <span>${combo}</span></p>
        <p>
            Kết quả:
            <span style="color:${isWin ? "#ff3333" : "#ff3333"}">
                ${isWin ? "CHIẾN THẮNG" : "THẤT BẠI"}
            </span>
        </p>

        <button id="owari-button">CHƠI LẠI</button>
        <button id="back-button">QUAY LẠI</button>
    `;

        game.appendChild(resultDiv);

        document.getElementById("owari-button").onclick = () => {
            resultDiv.remove();

            notes.forEach(note => note.remove());
            notes = [];

            score = 0;
            combo = 0;

            scoreText.innerText = "Score : 0";
            comboText.innerText = "Combo : 0";

            judgeText.innerText = "Ready";
            judgeText.classList.remove("animate");

            gameContainer.style.display = "none";
            startScreen.style.display = "flex";
        };

        document.getElementById("back-button").onclick = () => {
            music.pause();
            window.location.href = "../index.html";
        };
    }

    requestAnimationFrame(update);
}

function hit(lane) {
    let target = null;
    let min = 999;

    notes.forEach(note => {
        if (Number(note.dataset.lane) == lane) {
            let d = Math.abs(note.y - judgeY);
            if (d < min) {
                min = d;
                target = note;
            }
        }
    });

    if (target == null) return;

    if (min < 18) {
        judgeText.innerText = "PERFECT";
        judgeText.style.color = "#ffffff";
        score += 300;
        combo++;
    }
    else if (min < 35) {
        judgeText.innerText = "GREAT";
        judgeText.style.color = "#ffffff";
        score += 200;
        combo++;
    }
    else if (min < 55) {
        judgeText.innerText = "GOOD";
        judgeText.style.color = "#ffffff";
        score += 100;
        combo++;
    }
    else {
        return;
    }

    scoreText.innerText = "Score : " + score;
    comboText.innerText = "Combo : " + combo;
    triggerJudgeAnimation();

    target.remove();
    notes = notes.filter(n => n != target);
}

const keyMap = {
    'd': 0, 'D': 0,
    'f': 1, 'F': 1,
    'j': 2, 'J': 2,
    'k': 3, 'K': 3
};

window.addEventListener("keydown", (e) => {
    const lane = keyMap[e.key];
    if (lane === undefined) return;
    hit(lane);
    laneElements[lane].classList.add("active");
    keyElements[lane].classList.add("pressed");
});

window.addEventListener("keyup", (e) => {
    const lane = keyMap[e.key];
    if (lane === undefined) return;
    laneElements[lane].classList.remove("active");
    keyElements[lane].classList.remove("pressed");
});

// Hàm khởi chạy game xử lý mượt mà cho Mobile
// Thay thế hàm này trong script.js để ép iOS mở khóa Audio
async function startGame() {

    // Chống gọi nhiều lần
    if (isPlaying) return;

    score = 0;
    combo = 0;

    scoreText.innerText = "Score : 0";
    comboText.innerText = "Combo : 0";

    currentBeatmap = generateDynamicBeatmap(
        songs.song1.bpm,
        songs.song1.duration,
        songs.song1.style
    );

    startScreen.style.display = "none";
    gameContainer.style.display = "flex";

    music.pause();
    music.currentTime = 0;
    music.volume = 1;

    try {

        await music.play();

        isPlaying = true;
        update();

        console.log("Music Started");

    } catch (err) {

        console.error("Không thể phát nhạc:", err);

        alert("Safari đã chặn phát nhạc.");
    }

}
startBtn.addEventListener("pointerdown", startGame, {
    once: true
});