const story = [
    {
        name: "Ruru",
        text: "Hôm nay sân khấu vắng hơn bình thường.",
        left: "../images/Ruru_talk.png",
        right: ""
    },
    {
        name: "Arsenic",
        text: "Tôi có linh cảm chuyện gì đó sẽ xảy ra.",
        left: "../images/Ruru_wait.png",
        right: "../images/Arsenic_talk.png"
    },
    {
        name: "Ruru",
        text: "Đừng nói mấy điều đáng sợ như vậy.",
        left: "../images/Ruru_talk.png",
        right: "../images/Arsenic_wait.png"
    }
];

let index = 0;

const nameBox = document.getElementById("name");
const text = document.getElementById("text");
const left = document.getElementById("left");
const right = document.getElementById("right");
const nextBtn = document.getElementById("next");
const nextGameBtn = document.getElementById("nextGame");
const bgm = document.getElementById('bgm');

function loadScene() {
    const currentScene = story[index];

    nameBox.innerHTML = currentScene.name;
    text.innerHTML = currentScene.text;

    if (currentScene.left) {
        left.src = currentScene.left;
        left.style.display = "block";
    } else {
        left.style.display = "none";
    }

    if (currentScene.right) {
        right.src = currentScene.right;
        right.style.display = "block";
    } else {
        right.style.display = "none";
    }
}

loadScene();

nextBtn.onclick = () => {
    index++;

    if (index >= story.length) {
        finishGame();
        return;
    }

    loadScene();
}

function finishGame() {

    nextBtn.style.display = "none";


    nextGameBtn.style.display = "block";
}

nextGameBtn.onclick = function () {

    window.location.href = "../runninggame_ruru/run_ruru.html";
}