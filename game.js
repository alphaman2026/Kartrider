const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let kart = {
  x: 300,
  y: 300,
  speed: 0,
  angle: 0,
  drift: false,
  boost: 0,
};

let keys = {
  left: false,
  right: false,
  accel: false,
  brake: false,
  drift: false
};

let lap = 0;
let startTime = Date.now();

function handleInput() {
  document.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") keys.left = true;
    if (e.key === "ArrowRight") keys.right = true;
    if (e.key === "ArrowUp") keys.accel = true;
    if (e.key === "ArrowDown") keys.brake = true;
    if (e.key === "Shift") keys.drift = true;
  });

  document.addEventListener("keyup", e => {
    if (e.key === "ArrowLeft") keys.left = false;
    if (e.key === "ArrowRight") keys.right = false;
    if (e.key === "ArrowUp") keys.accel = false;
    if (e.key === "ArrowDown") keys.brake = false;
    if (e.key === "Shift") keys.drift = false;
  });

  ["left","right","accel","brake","drift"].forEach(id => {
    let btn = document.getElementById(id);
    btn.addEventListener("touchstart", () => keys[id] = true);
    btn.addEventListener("touchend", () => keys[id] = false);
  });
}

handleInput();

function update() {
  // 가속
  if (keys.accel) kart.speed += 0.2;
  if (keys.brake) kart.speed -= 0.2;

  // 드리프트
  kart.drift = keys.drift;
  let turnPower = kart.drift ? 0.08 : 0.04;

  if (keys.left) kart.angle -= turnPower;
  if (keys.right) kart.angle += turnPower;

  // 드리프트 중 부스터 충전
  if (kart.drift && Math.abs(kart.speed) > 2) {
    kart.boost += 0.5;
  }

  // 부스터 자동 사용
  if (kart.boost > 100) {
    kart.speed += 3;
    kart.boost = 0;
  }

  // 마찰
  kart.speed *= 0.98;

  // 최대속도 제한
  kart.speed = Math.max(-4, Math.min(kart.speed, 8));

  // 이동
  kart.x += Math.cos(kart.angle) * kart.speed;
  kart.y += Math.sin(kart.angle) * kart.speed;

  // 벽 충돌
  if (kart.x < 100 || kart.x > canvas.width-100 ||
      kart.y < 100 || kart.y > canvas.height-100) {
    kart.speed *= -0.3;
  }

  // 랩 체크 (간단)
  if (kart.x > canvas.width - 120 && kart.y > canvas.height/2 - 50 && kart.y < canvas.height/2 + 50) {
    lap++;
  }
}

function draw() {
  ctx.fillStyle = "#222";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // 트랙
  ctx.fillStyle = "#555";
  ctx.fillRect(100,100,canvas.width-200,canvas.height-200);

  // 스타트 라인
  ctx.fillStyle = "white";
  ctx.fillRect(canvas.width-120, canvas.height/2 - 50, 20, 100);

  // 카트
  ctx.save();
  ctx.translate(kart.x, kart.y);
  ctx.rotate(kart.angle);

  ctx.fillStyle = kart.drift ? "cyan" : "red";
  ctx.fillRect(-15, -10, 30, 20);

  ctx.restore();

  // UI
  document.getElementById("lap").innerText = "Lap: " + lap;
  document.getElementById("time").innerText = "Time: " + ((Date.now()-startTime)/1000).toFixed(2);
  document.getElementById("boost").innerText = "Boost: " + Math.floor(kart.boost) + "%";
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
