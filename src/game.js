const WIDTH = 960;
const HEIGHT = 640;

const CHARACTERS = [
  {
    id: 'dokkaebi',
    name: '도깨비',
    role: '철퇴의 선봉',
    accent: '#ef8b31',
    description: '강한 물리 공격과 높은 체력으로 정면을 돌파합니다.',
    stats: { damage: 24, magic: 8, speed: 172, maxHP: 150, attackDelay: 620, armor: 2 }
  },
  {
    id: 'gumiho',
    name: '구미호',
    role: '여우불 술사',
    accent: '#d7594f',
    description: '빠른 마법 투사체와 높은 치명타 확률을 지녔습니다.',
    stats: { damage: 18, magic: 28, speed: 170, maxHP: 105, attackDelay: 500, crit: .16 }
  },
  {
    id: 'haechi',
    name: '해치',
    role: '금빛 수호자',
    accent: '#e6b84e',
    description: '튼튼한 방어와 피해 감소로 오래 버팁니다.',
    stats: { damage: 20, magic: 10, speed: 148, maxHP: 180, attackDelay: 700, armor: 5 }
  },
  {
    id: 'sansin',
    name: '산신',
    role: '산맥의 궁수',
    accent: '#62a05b',
    description: '빠른 이동과 긴 사거리로 적을 먼저 제압합니다.',
    stats: { damage: 19, magic: 14, speed: 194, maxHP: 120, attackDelay: 540, pickupRadius: 100 }
  },
  {
    id: 'cheoyong',
    name: '처용',
    role: '탈춤의 칼날',
    accent: '#8d63c7',
    description: '민첩한 몸놀림과 연속 공격에 특화되어 있습니다.',
    stats: { damage: 16, magic: 12, speed: 205, maxHP: 115, attackDelay: 430, crit: .10 }
  },
  {
    id: 'baridegi',
    name: '바리데기',
    role: '저승의 무녀',
    accent: '#e99ab4',
    description: '회복력과 넓은 호롱불 범위로 밤을 이겨냅니다.',
    stats: { damage: 15, magic: 26, speed: 165, maxHP: 125, attackDelay: 570, regen: 1.2, lightRadius: 185 }
  }
];

const SKILLS = [
  {
    id: 'fire',
    icon: '🔥',
    title: '도깨비불',
    description: '공격력이 25% 증가합니다.',
    apply: scene => { scene.stats.damage *= 1.25; }
  },
  {
    id: 'crow',
    icon: '☀️',
    title: '삼족오의 깃',
    description: '공격 속도가 18% 빨라집니다.',
    apply: scene => { scene.stats.attackDelay = Math.max(150, scene.stats.attackDelay * .82); }
  },
  {
    id: 'tiger',
    icon: '🐯',
    title: '산군의 발걸음',
    description: '이동 속도가 15% 증가합니다.',
    apply: scene => { scene.stats.speed *= 1.15; }
  },
  {
    id: 'scale',
    icon: '🛡️',
    title: '해치의 비늘',
    description: '최대 체력 +30, 방어력 +2를 얻습니다.',
    apply: scene => {
      scene.stats.maxHP += 30;
      scene.stats.hp += 30;
      scene.stats.armor += 2;
    }
  },
  {
    id: 'lantern',
    icon: '🏮',
    title: '긴 호롱불 심지',
    description: '밤의 시야와 경험치 획득 범위가 넓어집니다.',
    apply: scene => {
      scene.stats.lightRadius += 35;
      scene.stats.pickupRadius += 28;
    }
  },
  {
    id: 'bell',
    icon: '🔔',
    title: '바리데기의 방울',
    description: '초당 체력 회복 +1.5를 얻습니다.',
    apply: scene => { scene.stats.regen += 1.5; }
  },
  {
    id: 'talisman',
    icon: '🧿',
    title: '처용의 부적',
    description: '치명타 확률이 12% 증가합니다.',
    apply: scene => { scene.stats.crit += .12; }
  },
  {
    id: 'moon',
    icon: '🌙',
    title: '달빛 화살',
    description: '투사체가 하나 더 발사됩니다.',
    apply: scene => { scene.stats.projectiles += 1; }
  },
  {
    id: 'medicine',
    icon: '🌿',
    title: '불사약 한 모금',
    description: '체력을 45 회복합니다.',
    apply: scene => { scene.stats.hp = Math.min(scene.stats.maxHP, scene.stats.hp + 45); }
  },
  {
    id: 'fox-orb',
    icon: '🔮',
    title: '구미호의 여우구슬',
    description: '공격력 +45%, 치명타 확률 +10%.',
    rare: true,
    apply: scene => {
      scene.stats.damage *= 1.45;
      scene.stats.crit += .10;
    }
  },
  {
    id: 'king-lantern',
    icon: '🏮',
    title: '왕실의 호롱불',
    description: '밤 시야가 크게 넓어지고 초당 회복 +2.',
    rare: true,
    apply: scene => {
      scene.stats.lightRadius += 90;
      scene.stats.regen += 2;
    }
  },
  {
    id: 'storm',
    icon: '⚡',
    title: '천둥 도깨비방망이',
    description: '투사체 +2, 공격 속도 +15%.',
    rare: true,
    apply: scene => {
      scene.stats.projectiles += 2;
      scene.stats.attackDelay = Math.max(140, scene.stats.attackDelay * .85);
    }
  },
  {
    id: 'immortal',
    icon: '💠',
    title: '저승꽃',
    description: '최대 체력 +70, 체력을 모두 회복합니다.',
    rare: true,
    apply: scene => {
      scene.stats.maxHP += 70;
      scene.stats.hp = scene.stats.maxHP;
    }
  }
];

class GameAudio {
  constructor() {
    this.context = null;
    this.master = null;
    this.muted = false;
    this.bgmTimer = null;
    this.step = 0;
    this.night = false;
  }

  ensure() {
    if (!this.context) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      this.context = new AudioContextClass();
      this.master = this.context.createGain();
      this.master.gain.value = this.muted ? 0 : .22;
      this.master.connect(this.context.destination);
    }
    if (this.context.state === 'suspended') this.context.resume();
  }

  tone(frequency, duration = .12, type = 'sine', volume = .1, delay = 0) {
    this.ensure();
    if (!this.context || this.muted) return;
    const now = this.context.currentTime + delay;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(Math.max(.001, volume), now + .012);
    gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
    oscillator.connect(gain);
    gain.connect(this.master);
    oscillator.start(now);
    oscillator.stop(now + duration + .02);
  }

  click() {
    this.tone(320, .06, 'square', .035);
    this.tone(480, .08, 'square', .025, .045);
  }

  shoot() { this.tone(this.night ? 260 : 340, .045, 'triangle', .015); }
  collect() { this.tone(660, .05, 'sine', .03); }
  hit() { this.tone(95, .09, 'sawtooth', .04); }

  level() {
    [440, 554, 659, 880].forEach((note, index) => this.tone(note, .24, 'triangle', .055, index * .09));
  }

  chest() {
    [330, 440, 554, 740, 880].forEach((note, index) => this.tone(note, .36, 'square', .04, index * .11));
  }

  startBgm() {
    this.stopBgm();
    this.ensure();
    const dayScale = [220, 277, 330, 370, 330, 277, 247, 277];
    const nightScale = [147, 175, 220, 196, 165, 147, 131, 147];
    const playStep = () => {
      if (!this.context || this.muted) return;
      const scale = this.night ? nightScale : dayScale;
      const note = scale[this.step % scale.length];
      this.tone(note, this.night ? .5 : .28, this.night ? 'triangle' : 'sine', .028);
      if (this.step % 2 === 0) this.tone(note / 2, .45, 'sine', .016);
      if (this.step % 4 === 2) this.tone(note * 2, .09, 'triangle', .012, .12);
      this.step += 1;
    };
    playStep();
    this.bgmTimer = window.setInterval(playStep, this.night ? 540 : 430);
  }

  setNight(isNight) {
    if (this.night === isNight) return;
    this.night = isNight;
    if (this.bgmTimer) this.startBgm();
  }

  stopBgm() {
    if (this.bgmTimer) window.clearInterval(this.bgmTimer);
    this.bgmTimer = null;
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.master) this.master.gain.value = this.muted ? 0 : .22;
    return this.muted;
  }
}

const audio = new GameAudio();

const ui = {
  title: document.getElementById('title-screen'),
  characters: document.getElementById('character-screen'),
  characterGrid: document.getElementById('character-grid'),
  hud: document.getElementById('hud'),
  heroName: document.getElementById('hero-name'),
  hpFill: document.getElementById('hp-fill'),
  hpText: document.getElementById('hp-text'),
  xpFill: document.getElementById('xp-fill'),
  levelText: document.getElementById('level-text'),
  phase: document.getElementById('phase'),
  timer: document.getElementById('timer'),
  runStats: document.getElementById('run-stats'),
  toast: document.getElementById('toast'),
  choice: document.getElementById('choice-screen'),
  choiceKicker: document.getElementById('choice-kicker'),
  choiceTitle: document.getElementById('choice-title'),
  choiceCopy: document.getElementById('choice-copy'),
  choiceGrid: document.getElementById('choice-grid'),
  pause: document.getElementById('pause-screen'),
  pauseKicker: document.querySelector('#pause-screen .eyebrow'),
  pauseHeading: document.querySelector('#pause-screen .section-heading'),
  resume: document.getElementById('resume-button')
};

let toastTimer = null;

function showToast(message, duration = 2200) {
  ui.toast.textContent = message;
  ui.toast.classList.add('show');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => ui.toast.classList.remove('show'), duration);
}

function hideScreens() {
  ui.title.classList.add('hidden');
  ui.characters.classList.add('hidden');
  ui.choice.classList.add('hidden');
  ui.pause.classList.add('hidden');
}

function currentScene() {
  return window.game?.scene.getScene('GameScene');
}

function buildCharacterCards() {
  ui.characterGrid.innerHTML = '';
  CHARACTERS.forEach(character => {
    const card = document.createElement('button');
    card.className = 'character-card';
    card.style.setProperty('--accent', character.accent);
    card.innerHTML = `
      <img src="./assets/sprites/${character.id}.png" alt="">
      <strong>${character.name}</strong>
      <em>${character.role}</em>
      <span>${character.description}</span>
    `;
    card.addEventListener('click', () => {
      audio.click();
      hideScreens();
      ui.hud.classList.remove('hidden');
      currentScene().scene.restart({ character });
    });
    ui.characterGrid.appendChild(card);
  });
}

function showTitle() {
  audio.stopBgm();
  hideScreens();
  ui.hud.classList.add('hidden');
  ui.title.classList.remove('hidden');
  currentScene()?.scene.restart();
}

document.getElementById('start-button').addEventListener('click', () => {
  audio.ensure();
  audio.click();
  ui.title.classList.add('hidden');
  ui.characters.classList.remove('hidden');
});

document.getElementById('how-button').addEventListener('click', () => {
  audio.click();
  showToast('적을 처치해 경험치를 모으고, 보물상자에서 희귀 능력을 얻으세요. 밤에는 호롱불 밖의 적이 보이지 않습니다.', 4800);
});

document.getElementById('sound-button').addEventListener('click', event => {
  const muted = audio.toggleMute();
  event.currentTarget.textContent = `소리: ${muted ? '꺼짐' : '켜짐'}`;
  if (!muted) audio.click();
});

document.getElementById('selection-back').addEventListener('click', () => {
  audio.click();
  ui.characters.classList.add('hidden');
  ui.title.classList.remove('hidden');
});

document.getElementById('pause-button').addEventListener('click', () => currentScene()?.togglePause());
document.getElementById('resume-button').addEventListener('click', () => currentScene()?.togglePause(false));
document.getElementById('restart-button').addEventListener('click', () => {
  audio.click();
  const scene = currentScene();
  if (scene?.selectedCharacter) scene.scene.restart({ character: scene.selectedCharacter });
});
document.getElementById('title-button').addEventListener('click', () => {
  audio.click();
  showTitle();
});

document.addEventListener('keydown', event => {
  if (event.code === 'Escape' || event.code === 'KeyP') currentScene()?.togglePause();
  if (event.code === 'KeyM') {
    const muted = audio.toggleMute();
    document.getElementById('sound-button').textContent = `소리: ${muted ? '꺼짐' : '켜짐'}`;
    showToast(`소리 ${muted ? '꺼짐' : '켜짐'}`);
  }
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden && currentScene()?.state === 'running') currentScene().togglePause(true);
});

buildCharacterCards();

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  init(data) {
    this.initialCharacter = data?.character || null;
  }

  preload() {
    CHARACTERS.forEach(character => {
      this.load.image(character.id, `assets/sprites/${character.id}.png`);
    });
    this.load.image('lantern', 'assets/sprites/lantern.png');
    this.load.image('treasure-chest', 'assets/sprites/treasure-chest.png');
  }

  create() {
    this.createWorld();
    this.createGeneratedTextures();

    this.enemies = this.physics.add.group();
    this.projectiles = this.physics.add.group();
    this.orbs = this.physics.add.group();
    this.chests = this.physics.add.group();

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D');

    this.state = 'menu';
    this.elapsed = 0;
    this.kills = 0;
    this.pendingLevels = 0;
    this.nextAttackAt = 0;
    this.nextChestAt = 22;
    this.lastHitAt = -Infinity;
    this.lastHudAt = 0;
    this.lastRegenAt = 0;

    this.spawnEvent = this.time.addEvent({
      delay: 720,
      loop: true,
      callback: () => {
        if (this.state === 'running') this.spawnEnemy();
      }
    });

    this.physics.add.overlap(this.projectiles, this.enemies, this.onProjectileHit, null, this);

    this.events.once('shutdown', () => audio.stopBgm());

    if (this.initialCharacter) {
      this.time.delayedCall(0, () => this.beginRun(this.initialCharacter));
    }
  }

  createWorld() {
    this.sky = this.add.rectangle(0, 0, WIDTH, HEIGHT, 0x88cdea).setOrigin(0).setDepth(-20);
    this.sun = this.add.circle(790, 92, 36, 0xffefab).setDepth(-18);
    this.moon = this.add.circle(150, 100, 29, 0xdce8f3).setDepth(-18).setAlpha(0);

    const mountains = this.add.graphics().setDepth(-15);
    mountains.fillStyle(0x557b72, 1);
    mountains.beginPath();
    mountains.moveTo(0, 390);
    mountains.lineTo(90, 235);
    mountains.lineTo(175, 350);
    mountains.lineTo(300, 205);
    mountains.lineTo(430, 355);
    mountains.lineTo(585, 190);
    mountains.lineTo(730, 350);
    mountains.lineTo(860, 230);
    mountains.lineTo(WIDTH, 370);
    mountains.lineTo(WIDTH, HEIGHT);
    mountains.lineTo(0, HEIGHT);
    mountains.closePath();
    mountains.fillPath();

    const foreground = this.add.graphics().setDepth(-14);
    foreground.fillStyle(0x314b45, 1);
    foreground.beginPath();
    foreground.moveTo(0, 440);
    foreground.lineTo(130, 325);
    foreground.lineTo(260, 440);
    foreground.lineTo(410, 300);
    foreground.lineTo(560, 440);
    foreground.lineTo(750, 315);
    foreground.lineTo(960, 455);
    foreground.lineTo(960, 640);
    foreground.lineTo(0, 640);
    foreground.closePath();
    foreground.fillPath();

    this.ground = this.add.rectangle(0, 420, WIDTH, 220, 0x365444).setOrigin(0).setDepth(-12);
    const trail = this.add.graphics().setDepth(-11);
    trail.fillStyle(0x8c7a59, .55);
    trail.beginPath();
    trail.moveTo(410, HEIGHT);
    trail.lineTo(455, 420);
    trail.lineTo(565, 420);
    trail.lineTo(650, HEIGHT);
    trail.closePath();
    trail.fillPath();

    const detail = this.add.graphics().setDepth(-10);
    for (let index = 0; index < 75; index += 1) {
      const x = Phaser.Math.Between(10, WIDTH - 10);
      const y = Phaser.Math.Between(430, HEIGHT - 8);
      detail.fillStyle(index % 3 === 0 ? 0x89a35b : 0x254337, Phaser.Math.FloatBetween(.35, .75));
      detail.fillRect(x, y, Phaser.Math.Between(2, 5), Phaser.Math.Between(2, 5));
    }

    this.darkness = this.add.rectangle(0, 0, WIDTH, HEIGHT, 0x02030a, 1)
      .setOrigin(0)
      .setDepth(200)
      .setAlpha(0);
    this.lightGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    this.lightMask = this.lightGraphics.createGeometryMask();
    this.lightMask.invertAlpha = true;
    this.darkness.setMask(this.lightMask);
    this.lantern = this.add.image(0, 0, 'lantern')
      .setDisplaySize(48, 48)
      .setDepth(199)
      .setVisible(false);
  }

  createGeneratedTextures() {
    if (!this.textures.exists('enemy')) {
      const graphics = this.make.graphics({ add: false });
      graphics.fillStyle(0xe8eee9, 1);
      graphics.fillCircle(16, 12, 10);
      graphics.fillRoundedRect(6, 10, 20, 20, 7);
      graphics.fillStyle(0x24263b, 1);
      graphics.fillCircle(12, 11, 2);
      graphics.fillCircle(20, 11, 2);
      graphics.fillStyle(0xb8c2c5, 1);
      graphics.fillTriangle(6, 25, 10, 31, 14, 25);
      graphics.fillTriangle(14, 25, 18, 31, 22, 25);
      graphics.fillTriangle(22, 25, 26, 31, 28, 25);
      graphics.generateTexture('enemy', 32, 32);
      graphics.destroy();
    }

    if (!this.textures.exists('projectile')) {
      const graphics = this.make.graphics({ add: false });
      graphics.fillStyle(0xfff1ac, 1);
      graphics.fillCircle(7, 7, 6);
      graphics.fillStyle(0xff8b32, 1);
      graphics.fillCircle(7, 7, 3);
      graphics.generateTexture('projectile', 14, 14);
      graphics.destroy();
    }

    if (!this.textures.exists('xp-orb')) {
      const graphics = this.make.graphics({ add: false });
      graphics.fillStyle(0x7bdcff, 1);
      graphics.fillRect(4, 0, 4, 12);
      graphics.fillRect(0, 4, 12, 4);
      graphics.fillStyle(0xffffff, 1);
      graphics.fillRect(4, 4, 4, 4);
      graphics.generateTexture('xp-orb', 12, 12);
      graphics.destroy();
    }
  }

  beginRun(character) {
    this.selectedCharacter = character;
    const base = character.stats;
    this.stats = {
      damage: base.damage + base.magic * .25,
      speed: base.speed,
      maxHP: base.maxHP,
      hp: base.maxHP,
      attackDelay: base.attackDelay,
      armor: base.armor || 0,
      crit: base.crit || .05,
      regen: base.regen || 0,
      lightRadius: base.lightRadius || 145,
      pickupRadius: base.pickupRadius || 76,
      projectiles: 1
    };
    this.level = 1;
    this.xp = 0;
    this.xpNeeded = 18;
    this.elapsed = 0;
    this.kills = 0;
    this.pendingLevels = 0;
    this.nextChestAt = 22;
    this.state = 'running';

    this.player = this.physics.add.sprite(WIDTH / 2, HEIGHT / 2, character.id)
      .setDisplaySize(62, 62)
      .setDepth(30)
      .setCollideWorldBounds(true);
    this.player.body.setCircle(88, 40, 72);

    this.playerEnemyOverlap = this.physics.add.overlap(this.player, this.enemies, this.onPlayerHit, null, this);
    this.playerOrbOverlap = this.physics.add.overlap(this.player, this.orbs, this.collectOrb, null, this);
    this.playerChestOverlap = this.physics.add.overlap(this.player, this.chests, this.openChest, null, this);

    hideScreens();
    ui.hud.classList.remove('hidden');
    ui.heroName.textContent = `${character.name} · ${character.role}`;
    this.resetPauseCopy();
    this.updateHud();
    audio.setNight(false);
    audio.startBgm();
    showToast('해가 떠 있습니다. 어둠이 오기 전에 힘을 모으세요.', 3400);
  }

  update(time, delta) {
    if (this.state !== 'running' || !this.player?.active) return;

    const deltaSeconds = delta / 1000;
    this.elapsed += deltaSeconds;

    this.updateMovement();
    this.updateDayNight();
    this.updateEnemiesAndPickups(deltaSeconds);

    if (time >= this.nextAttackAt) {
      this.autoAttack();
      this.nextAttackAt = time + this.stats.attackDelay;
    }

    if (this.elapsed >= this.nextChestAt) {
      this.spawnChest();
      this.nextChestAt += 37;
    }

    if (this.stats.regen > 0 && time - this.lastRegenAt >= 1000) {
      this.stats.hp = Math.min(this.stats.maxHP, this.stats.hp + this.stats.regen);
      this.lastRegenAt = time;
    }

    if (time - this.lastHudAt > 100) {
      this.updateHud();
      this.lastHudAt = time;
    }
  }

  updateMovement() {
    let horizontal = 0;
    let vertical = 0;
    if (this.cursors.left.isDown || this.keys.A.isDown) horizontal -= 1;
    if (this.cursors.right.isDown || this.keys.D.isDown) horizontal += 1;
    if (this.cursors.up.isDown || this.keys.W.isDown) vertical -= 1;
    if (this.cursors.down.isDown || this.keys.S.isDown) vertical += 1;

    if (horizontal === 0 && vertical === 0 && this.input.activePointer.isDown) {
      const pointer = this.input.activePointer;
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, pointer.worldX, pointer.worldY);
      if (distance > 24) {
        horizontal = pointer.worldX - this.player.x;
        vertical = pointer.worldY - this.player.y;
      }
    }

    const magnitude = Math.hypot(horizontal, vertical) || 1;
    this.player.setVelocity(
      (horizontal / magnitude) * this.stats.speed,
      (vertical / magnitude) * this.stats.speed
    );
    if (horizontal !== 0) this.player.setFlipX(horizontal < 0);
  }

  updateDayNight() {
    let phase = '낮';
    let darkness = 0;
    let dayMix = 0;

    if (this.elapsed >= 55) {
      phase = '밤 · 호롱불';
      darkness = .86;
      dayMix = 1;
    } else if (this.elapsed >= 34) {
      const dusk = (this.elapsed - 34) / 21;
      phase = '황혼';
      darkness = dusk * .86;
      dayMix = dusk;
    }

    const day = { r: 136, g: 205, b: 234 };
    const dusk = { r: 196, g: 93, b: 72 };
    const night = { r: 7, g: 10, b: 29 };
    const firstMix = Math.min(1, dayMix * 2);
    const secondMix = Math.max(0, dayMix * 2 - 1);
    let color = Phaser.Display.Color.Interpolate.ColorWithColor(day, dusk, 100, firstMix * 100);
    if (secondMix > 0) color = Phaser.Display.Color.Interpolate.ColorWithColor(dusk, night, 100, secondMix * 100);
    this.sky.setFillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b));
    this.ground.setFillStyle(dayMix < .5 ? 0x365444 : 0x172b2d);
    this.sun.setAlpha(1 - dayMix).setPosition(790 - dayMix * 230, 92 + dayMix * 110);
    this.moon.setAlpha(Math.max(0, dayMix * 1.4 - .4)).setPosition(130 + dayMix * 70, 120 - dayMix * 50);
    this.darkness.setAlpha(darkness);

    const lanternVisible = dayMix > .08;
    this.lantern.setVisible(lanternVisible);
    if (lanternVisible) {
      this.lantern.setPosition(this.player.x + (this.player.flipX ? -22 : 22), this.player.y + 10);
      this.lantern.setFlipX(this.player.flipX);
      this.lightGraphics.clear();
      this.lightGraphics.fillStyle(0xffffff, 1);
      this.lightGraphics.fillCircle(this.lantern.x, this.lantern.y, this.stats.lightRadius);
    }

    ui.phase.textContent = phase;
    ui.phase.style.color = phase.startsWith('밤') ? '#9fc9ef' : phase === '황혼' ? '#ef9d62' : '#f0b94f';
    audio.setNight(this.elapsed >= 55);
  }

  updateEnemiesAndPickups(deltaSeconds) {
    this.enemies.getChildren().forEach(enemy => {
      if (!enemy.active) return;
      const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
      this.physics.velocityFromRotation(angle, enemy.speed, enemy.body.velocity);
    });

    this.orbs.getChildren().forEach(orb => {
      if (!orb.active) return;
      const distance = Phaser.Math.Distance.Between(orb.x, orb.y, this.player.x, this.player.y);
      const age = this.time.now - (orb.getData('spawnedAt') || this.time.now);
      if (distance <= this.stats.pickupRadius || age > 4200) {
        this.physics.moveToObject(orb, this.player, 250 + this.stats.pickupRadius);
      } else {
        orb.setVelocity(0, 0);
      }
    });

    this.projectiles.getChildren().forEach(projectile => {
      if (projectile.active && this.time.now - projectile.getData('bornAt') > 1600) projectile.destroy();
    });

    if (this.stats.regen > 0) {
      this.stats.hp = Math.min(this.stats.maxHP, this.stats.hp + this.stats.regen * deltaSeconds * .03);
    }
  }

  spawnEnemy() {
    if (!this.player?.active) return;
    const edge = Phaser.Math.Between(0, 3);
    let x;
    let y;
    if (edge === 0) { x = -24; y = Phaser.Math.Between(40, HEIGHT - 30); }
    if (edge === 1) { x = WIDTH + 24; y = Phaser.Math.Between(40, HEIGHT - 30); }
    if (edge === 2) { x = Phaser.Math.Between(30, WIDTH - 30); y = -24; }
    if (edge === 3) { x = Phaser.Math.Between(30, WIDTH - 30); y = HEIGHT + 24; }

    const eliteChance = Math.min(.22, .03 + this.elapsed / 700);
    const elite = Math.random() < eliteChance;
    const enemy = this.enemies.create(x, y, 'enemy')
      .setDisplaySize(elite ? 48 : 36, elite ? 48 : 36)
      .setDepth(20);
    enemy.hp = (16 + this.level * 4 + this.elapsed * .22) * (elite ? 3.2 : 1);
    enemy.speed = 48 + Math.min(62, this.elapsed * .42) + (elite ? 7 : 0);
    enemy.damage = 7 + Math.floor(this.elapsed / 25) + (elite ? 5 : 0);
    enemy.xpValue = elite ? 7 : 3;
    enemy.elite = elite;
    enemy.setTint(elite ? 0xf0a33a : Phaser.Display.Color.GetColor(
      Phaser.Math.Between(175, 235),
      Phaser.Math.Between(185, 235),
      Phaser.Math.Between(195, 240)
    ));
  }

  autoAttack() {
    const targets = this.enemies.getChildren()
      .filter(enemy => enemy.active)
      .map(enemy => ({
        enemy,
        distance: Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y)
      }))
      .sort((left, right) => left.distance - right.distance);

    if (!targets.length) return;
    const shotCount = Math.max(1, Math.floor(this.stats.projectiles));
    for (let index = 0; index < shotCount; index += 1) {
      const target = targets[index % Math.min(targets.length, shotCount)].enemy;
      let angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, target.x, target.y);
      if (targets.length === 1 && shotCount > 1) angle += (index - (shotCount - 1) / 2) * .15;
      const projectile = this.projectiles.create(this.player.x, this.player.y, 'projectile')
        .setDisplaySize(12, 12)
        .setDepth(25);
      const critical = Math.random() < this.stats.crit;
      projectile.damage = this.stats.damage * (critical ? 1.85 : 1) * Phaser.Math.FloatBetween(.88, 1.12);
      projectile.setData('bornAt', this.time.now);
      projectile.setData('critical', critical);
      projectile.setTint(critical ? 0xffef62 : this.selectedCharacter.id === 'gumiho' ? 0xff7e68 : 0xffffff);
      this.physics.velocityFromRotation(angle, 465, projectile.body.velocity);
    }
    audio.shoot();
  }

  onProjectileHit(projectile, enemy) {
    if (!projectile?.active || !enemy?.active) return;
    enemy.hp -= projectile.damage;
    enemy.setTintFill(0xffffff);
    this.time.delayedCall(55, () => {
      if (enemy.active) enemy.clearTint();
    });
    projectile.destroy();
    if (enemy.hp <= 0) this.killEnemy(enemy);
  }

  killEnemy(enemy) {
    if (!enemy.active) return;
    const { x, y, xpValue, elite } = enemy;
    enemy.destroy();
    this.kills += 1;
    const orbCount = elite ? 3 : 1;
    for (let index = 0; index < orbCount; index += 1) {
      const orb = this.orbs.create(
        x + Phaser.Math.Between(-12, 12),
        y + Phaser.Math.Between(-12, 12),
        'xp-orb'
      ).setDepth(16);
      orb.value = xpValue / orbCount;
      orb.setData('spawnedAt', this.time.now);
      orb.setDisplaySize(elite ? 15 : 11, elite ? 15 : 11);
    }
    if (Math.random() < .012 && this.chests.countActive(true) === 0) this.spawnChest(x, y);
  }

  collectOrb(player, orb) {
    if (!orb?.active) return;
    this.xp += orb.value || 1;
    orb.destroy();
    audio.collect();

    while (this.xp >= this.xpNeeded) {
      this.xp -= this.xpNeeded;
      this.level += 1;
      this.xpNeeded = Math.round(17 + this.level * 8.5);
      this.pendingLevels += 1;
    }

    if (this.pendingLevels > 0 && this.state === 'running') this.offerChoices(false);
  }

  spawnChest(forcedX, forcedY) {
    if (this.chests.countActive(true) > 0) return;
    const x = forcedX ?? Phaser.Math.Between(120, WIDTH - 120);
    const y = forcedY ?? Phaser.Math.Between(160, HEIGHT - 90);
    const chest = this.chests.create(x, y, 'treasure-chest')
      .setDisplaySize(58, 58)
      .setDepth(18)
      .setImmovable(true);
    chest.body.setAllowGravity(false);
    this.tweens.add({
      targets: chest,
      scaleX: chest.scaleX * 1.08,
      scaleY: chest.scaleY * 1.08,
      yoyo: true,
      repeat: -1,
      duration: 650
    });
    showToast('보물상자가 나타났습니다!');
  }

  openChest(player, chest) {
    if (!chest?.active || this.state !== 'running') return;
    chest.destroy();
    this.offerChoices(true);
  }

  offerChoices(treasure) {
    this.state = 'choosing';
    this.physics.pause();
    this.player.setVelocity(0, 0);
    if (treasure) audio.chest();
    else audio.level();

    const pool = SKILLS.filter(skill => treasure ? skill.rare : !skill.rare);
    const shuffled = Phaser.Utils.Array.Shuffle([...pool]).slice(0, 3);
    ui.choiceKicker.textContent = treasure ? 'TREASURE FOUND' : `LEVEL ${this.level}`;
    ui.choiceTitle.textContent = treasure ? '보물의 힘을 선택하세요' : '새로운 힘을 선택하세요';
    ui.choiceCopy.textContent = treasure ? '상자에서 희귀한 설화의 힘이 깨어났습니다.' : '하나를 선택하면 전투가 계속됩니다.';
    ui.choiceGrid.innerHTML = '';

    shuffled.forEach(skill => {
      const button = document.createElement('button');
      button.className = 'choice-card';
      button.innerHTML = `
        <span class="choice-icon">${skill.icon}</span>
        <strong>${skill.title}</strong>
        <small>${skill.description}</small>
        ${skill.rare ? '<span class="rare-label">희귀 보물</span>' : ''}
      `;
      button.addEventListener('click', () => {
        audio.click();
        skill.apply(this);
        ui.choice.classList.add('hidden');
        if (!treasure) this.pendingLevels = Math.max(0, this.pendingLevels - 1);
        if (this.pendingLevels > 0) {
          this.time.delayedCall(80, () => this.offerChoices(false));
          return;
        }
        this.state = 'running';
        this.physics.resume();
        this.updateHud();
        showToast(`${skill.title} 획득!`);
      }, { once: true });
      ui.choiceGrid.appendChild(button);
    });

    ui.choice.classList.remove('hidden');
  }

  onPlayerHit(player, enemy) {
    if (!enemy?.active || this.state !== 'running') return;
    if (this.time.now - this.lastHitAt < 650) return;
    this.lastHitAt = this.time.now;
    const damage = Math.max(1, enemy.damage - this.stats.armor);
    this.stats.hp -= damage;
    this.cameras.main.shake(80, .006);
    player.setTintFill(0xff5c5c);
    this.time.delayedCall(100, () => {
      if (player.active) player.clearTint();
    });
    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
    player.setVelocity(Math.cos(angle) * 250, Math.sin(angle) * 250);
    audio.hit();
    if (this.stats.hp <= 0) this.gameOver();
  }

  updateHud() {
    if (!this.stats) return;
    const hpPercent = Phaser.Math.Clamp(this.stats.hp / this.stats.maxHP * 100, 0, 100);
    const xpPercent = Phaser.Math.Clamp(this.xp / this.xpNeeded * 100, 0, 100);
    ui.hpFill.style.width = `${hpPercent}%`;
    ui.hpText.textContent = `${Math.max(0, Math.ceil(this.stats.hp))}/${Math.round(this.stats.maxHP)}`;
    ui.xpFill.style.width = `${xpPercent}%`;
    ui.levelText.textContent = `LV ${this.level}`;
    const minutes = Math.floor(this.elapsed / 60).toString().padStart(2, '0');
    const seconds = Math.floor(this.elapsed % 60).toString().padStart(2, '0');
    ui.timer.textContent = `${minutes}:${seconds}`;
    ui.runStats.textContent = `처치 ${this.kills} · 공격력 ${Math.round(this.stats.damage)} · 방어 ${this.stats.armor}`;
  }

  resetPauseCopy() {
    ui.pauseKicker.textContent = 'PAUSED';
    ui.pauseHeading.textContent = '잠시 숨을 고르세요';
    ui.resume.classList.remove('hidden');
  }

  togglePause(forcePause) {
    if (!this.player?.active || this.state === 'choosing' || this.state === 'gameover') return;
    const shouldPause = forcePause ?? this.state === 'running';
    if (shouldPause && this.state === 'running') {
      this.state = 'paused';
      this.physics.pause();
      audio.stopBgm();
      this.player.setVelocity(0, 0);
      this.resetPauseCopy();
      ui.pause.classList.remove('hidden');
    } else if (!shouldPause && this.state === 'paused') {
      this.state = 'running';
      this.physics.resume();
      audio.startBgm();
      ui.pause.classList.add('hidden');
    }
  }

  gameOver() {
    this.state = 'gameover';
    this.physics.pause();
    audio.stopBgm();
    ui.pauseKicker.textContent = 'GAME OVER';
    ui.pauseHeading.textContent = `${Math.floor(this.elapsed)}초 동안 설화를 지켰습니다`;
    ui.resume.classList.add('hidden');
    ui.pause.classList.remove('hidden');
  }
}

const config = {
  type: Phaser.AUTO,
  width: WIDTH,
  height: HEIGHT,
  parent: 'game-container',
  backgroundColor: '#070914',
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: { debug: false }
  },
  scene: [GameScene]
};

window.game = new Phaser.Game(config);
