const WIDTH = 960;
const HEIGHT = 640;
const WORLD_WIDTH = 2400;
const WORLD_HEIGHT = 1800;
const SPRITE_VERSION = '20260728-2';
const SUNSET_START = 34;
const NIGHT_START = 55;
const SPRITE_BASE = window.location.hostname.endsWith('github.io')
  ? 'https://raw.githubusercontent.com/hoyhoy1227/seolhwa-survivor/main/assets/sprites'
  : './assets/sprites';
const spriteUrl = fileName => `${SPRITE_BASE}/${fileName}?v=${SPRITE_VERSION}`;

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
  how: document.getElementById('how-screen'),
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
  sunsetLabel: document.getElementById('sunset-label'),
  sunsetCountdown: document.getElementById('sunset-countdown'),
  sunClockHand: document.getElementById('sun-clock-hand'),
  minimap: document.getElementById('minimap'),
  treasureHint: document.getElementById('treasure-hint'),
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
  ui.how.classList.add('hidden');
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
      <img src="${spriteUrl(`${character.id}.png`)}" alt="">
      <strong>${character.name}</strong>
      <em>${character.role}</em>
      <span>${character.description}</span>
    `;
    card.addEventListener('click', () => {
      audio.click();
      hideScreens();
      ui.hud.classList.remove('hidden');
      window.game.scene.start('GameScene', { character });
    });
    ui.characterGrid.appendChild(card);
  });
}

function showTitle() {
  audio.stopBgm();
  window.clearTimeout(toastTimer);
  ui.toast.classList.remove('show');
  ui.toast.textContent = '';
  const scene = currentScene();
  if (scene?.scene.isActive() || scene?.scene.isPaused() || scene?.scene.isSleeping()) {
    scene.state = 'menu';
    scene.physics?.pause();
    scene.scene.stop();
  }
  hideScreens();
  ui.hud.classList.add('hidden');
  ui.title.classList.remove('hidden');
}

document.getElementById('start-button').addEventListener('click', () => {
  audio.ensure();
  audio.click();
  ui.title.classList.add('hidden');
  ui.characters.classList.remove('hidden');
});

document.getElementById('how-button').addEventListener('click', () => {
  audio.click();
  ui.title.classList.add('hidden');
  ui.how.classList.remove('hidden');
});

document.getElementById('how-back').addEventListener('click', () => {
  audio.click();
  ui.how.classList.add('hidden');
  ui.title.classList.remove('hidden');
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
      this.load.image(character.id, spriteUrl(`${character.id}.png`));
    });
    this.load.image('lantern', spriteUrl('lantern.png'));
    this.load.image('treasure-chest', spriteUrl('treasure-chest.png'));
  }

  create() {
    this.ensureSpriteTextures();
    this.createWorld();
    this.createGeneratedTextures();

    this.enemies = this.physics.add.group();
    this.enemyProjectiles = this.physics.add.group();
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
      delay: 820,
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

  ensureSpriteTextures() {
    CHARACTERS.forEach(character => {
      if (this.textures.exists(character.id)) return;
      const color = Phaser.Display.Color.HexStringToColor(character.accent).color;
      const graphics = this.make.graphics({ add: false });
      graphics.fillStyle(0x15131d, 1);
      graphics.fillCircle(32, 28, 24);
      graphics.fillStyle(color, 1);
      graphics.fillCircle(32, 25, 18);
      graphics.fillRoundedRect(16, 36, 32, 24, 8);
      graphics.fillStyle(0xffe0a3, 1);
      graphics.fillRect(23, 22, 5, 5);
      graphics.fillRect(36, 22, 5, 5);
      graphics.generateTexture(character.id, 64, 64);
      graphics.destroy();
    });

    if (!this.textures.exists('lantern')) {
      const graphics = this.make.graphics({ add: false });
      graphics.fillStyle(0x442312, 1);
      graphics.fillRoundedRect(9, 8, 46, 50, 5);
      graphics.lineStyle(5, 0x8f5424, 1);
      graphics.strokeRoundedRect(9, 8, 46, 50, 5);
      graphics.fillStyle(0xffd66f, 1);
      graphics.fillRect(17, 17, 30, 32);
      graphics.generateTexture('lantern', 64, 64);
      graphics.destroy();
    }

    if (!this.textures.exists('treasure-chest')) {
      const graphics = this.make.graphics({ add: false });
      graphics.fillStyle(0x4b2515, 1);
      graphics.fillRoundedRect(4, 13, 56, 45, 8);
      graphics.lineStyle(5, 0xe3a53f, 1);
      graphics.strokeRoundedRect(4, 13, 56, 45, 8);
      graphics.fillStyle(0xf4c35d, 1);
      graphics.fillRect(27, 30, 10, 15);
      graphics.generateTexture('treasure-chest', 64, 64);
      graphics.destroy();
    }
  }

  createWorld() {
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.roundPixels = true;

    this.ground = this.add.rectangle(0, 0, WORLD_WIDTH, WORLD_HEIGHT, 0x496d4f)
      .setOrigin(0)
      .setDepth(-30);

    const terrain = this.add.graphics().setDepth(-28);
    const tileSize = 120;
    for (let row = 0; row < WORLD_HEIGHT / tileSize; row += 1) {
      for (let column = 0; column < WORLD_WIDTH / tileSize; column += 1) {
        const shade = (row + column) % 2 === 0 ? 0x426648 : 0x4d7352;
        terrain.fillStyle(shade, .32);
        terrain.fillRect(column * tileSize, row * tileSize, tileSize, tileSize);
      }
    }

    terrain.fillStyle(0x988361, .34);
    terrain.fillRoundedRect(0, WORLD_HEIGHT / 2 - 68, WORLD_WIDTH, 136, 48);
    terrain.fillRoundedRect(WORLD_WIDTH / 2 - 72, 0, 144, WORLD_HEIGHT, 48);
    terrain.lineStyle(3, 0xb9a276, .18);
    terrain.strokeRoundedRect(0, WORLD_HEIGHT / 2 - 68, WORLD_WIDTH, 136, 48);
    terrain.strokeRoundedRect(WORLD_WIDTH / 2 - 72, 0, 144, WORLD_HEIGHT, 48);

    const details = this.add.graphics().setDepth(-26);
    for (let index = 0; index < 420; index += 1) {
      const x = Phaser.Math.Between(24, WORLD_WIDTH - 24);
      const y = Phaser.Math.Between(24, WORLD_HEIGHT - 24);
      const type = index % 5;
      if (type === 0) {
        details.fillStyle(0x1f4636, .75);
        details.fillCircle(x, y, Phaser.Math.Between(3, 7));
        details.fillStyle(0x315b42, .75);
        details.fillCircle(x + 5, y + 2, Phaser.Math.Between(2, 5));
      } else if (type === 1) {
        details.fillStyle(0xd8b55c, .65);
        details.fillRect(x, y, 3, 8);
        details.fillRect(x - 2, y + 2, 7, 3);
      } else {
        details.fillStyle(type === 2 ? 0x7da05d : 0x31543f, .62);
        details.fillRect(x, y, Phaser.Math.Between(2, 5), Phaser.Math.Between(2, 6));
      }
    }

    const landmarks = this.add.graphics().setDepth(-24);
    [
      [230, 250], [2140, 310], [300, 1480], [2050, 1430],
      [720, 620], [1690, 1180]
    ].forEach(([x, y], index) => {
      landmarks.fillStyle(0x263f35, .9);
      landmarks.fillCircle(x, y + 18, 42);
      landmarks.fillStyle(index % 2 ? 0x274f39 : 0x315c43, 1);
      landmarks.fillCircle(x - 22, y, 28);
      landmarks.fillCircle(x + 20, y - 6, 32);
      landmarks.fillStyle(0x6a4b33, .8);
      landmarks.fillRect(x - 5, y + 18, 10, 34);
    });

    this.sun = this.add.circle(WIDTH - 90, 92, 30, 0xffefab)
      .setDepth(-5)
      .setScrollFactor(0);
    this.moon = this.add.circle(92, 92, 25, 0xdce8f3)
      .setDepth(-5)
      .setScrollFactor(0)
      .setAlpha(0);

    this.darkness = this.add.rectangle(0, 0, WORLD_WIDTH, WORLD_HEIGHT, 0x02030a, 1)
      .setOrigin(0)
      .setDepth(200)
      .setAlpha(0);
    this.lightGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    this.lightMask = this.lightGraphics.createGeometryMask();
    this.lightMask.invertAlpha = true;
    this.darkness.setMask(this.lightMask);
    this.lantern = this.add.image(0, 0, 'lantern')
      .setDisplaySize(52, 52)
      .setDepth(199)
      .setVisible(false);
    this.damageFlash = this.add.rectangle(0, 0, WIDTH, HEIGHT, 0xc91f2c, .18)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(240)
      .setAlpha(0);
  }

  createGeneratedTextures() {
    if (!this.textures.exists('enemy-melee')) {
      const graphics = this.make.graphics({ add: false });
      graphics.fillStyle(0x481f2a, 1);
      graphics.fillRoundedRect(7, 11, 26, 27, 8);
      graphics.fillStyle(0x9b3f35, 1);
      graphics.fillCircle(20, 15, 12);
      graphics.fillTriangle(8, 8, 12, 0, 17, 10);
      graphics.fillTriangle(23, 9, 29, 1, 32, 13);
      graphics.fillStyle(0xf0bd66, 1);
      graphics.fillRect(13, 13, 5, 4);
      graphics.fillRect(23, 13, 5, 4);
      graphics.fillStyle(0x15131d, 1);
      graphics.fillRect(15, 14, 2, 2);
      graphics.fillRect(24, 14, 2, 2);
      graphics.fillStyle(0xd8d1be, 1);
      graphics.fillTriangle(17, 22, 20, 28, 23, 22);
      graphics.fillStyle(0x2d2734, 1);
      graphics.fillRect(4, 31, 8, 8);
      graphics.fillRect(28, 31, 8, 8);
      graphics.generateTexture('enemy-melee', 40, 40);
      graphics.destroy();
    }

    if (!this.textures.exists('enemy-ranged')) {
      const graphics = this.make.graphics({ add: false });
      graphics.fillStyle(0x34294f, 1);
      graphics.fillRoundedRect(7, 8, 26, 31, 10);
      graphics.fillStyle(0xb6a2d7, 1);
      graphics.fillCircle(20, 13, 11);
      graphics.fillStyle(0x241d38, 1);
      graphics.fillRect(12, 12, 5, 4);
      graphics.fillRect(23, 12, 5, 4);
      graphics.fillStyle(0xd5c8ed, 1);
      graphics.fillTriangle(7, 31, 12, 40, 17, 31);
      graphics.fillTriangle(17, 31, 22, 40, 27, 31);
      graphics.fillTriangle(27, 31, 32, 40, 35, 29);
      graphics.lineStyle(3, 0xc86c52, 1);
      graphics.strokeCircle(20, 23, 6);
      graphics.generateTexture('enemy-ranged', 40, 40);
      graphics.destroy();
    }

    if (!this.textures.exists('enemy-projectile')) {
      const graphics = this.make.graphics({ add: false });
      graphics.fillStyle(0xd47bff, .35);
      graphics.fillCircle(8, 8, 8);
      graphics.fillStyle(0xcab0ff, 1);
      graphics.fillCircle(8, 8, 5);
      graphics.fillStyle(0xffffff, 1);
      graphics.fillCircle(7, 6, 2);
      graphics.generateTexture('enemy-projectile', 16, 16);
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

    this.player = this.physics.add.sprite(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, character.id)
      .setDisplaySize(68, 68)
      .setDepth(30)
      .setCollideWorldBounds(true);
    this.player.body.setCircle(78, 50, 68);
    this.player.setData('baseScaleX', this.player.scaleX);
    this.player.setData('baseScaleY', this.player.scaleY);
    this.cameras.main.startFollow(this.player, true, .11, .11);
    this.cameras.main.centerOn(this.player.x, this.player.y);

    this.playerEnemyOverlap = this.physics.add.overlap(this.player, this.enemies, this.onPlayerHit, null, this);
    this.playerEnemyProjectileOverlap = this.physics.add.overlap(
      this.player,
      this.enemyProjectiles,
      this.onEnemyProjectileHit,
      null,
      this
    );
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

    const moving = horizontal !== 0 || vertical !== 0;
    const baseScaleX = this.player.getData('baseScaleX');
    const baseScaleY = this.player.getData('baseScaleY');
    if (moving) {
      const stride = Math.sin(this.time.now * .018);
      this.player.setScale(
        baseScaleX * (1 + stride * .035),
        baseScaleY * (1 - stride * .045)
      );
      this.player.setAngle(stride * 2.4);
    } else {
      this.player.setScale(baseScaleX, baseScaleY);
      this.player.setAngle(0);
    }
  }

  updateDayNight() {
    let phase = '낮';
    let darkness = 0;
    let dayMix = 0;

    if (this.elapsed >= NIGHT_START) {
      phase = '밤 · 호롱불';
      darkness = .86;
      dayMix = 1;
    } else if (this.elapsed >= SUNSET_START) {
      const dusk = (this.elapsed - SUNSET_START) / (NIGHT_START - SUNSET_START);
      phase = '황혼';
      darkness = dusk * .86;
      dayMix = dusk;
    }

    const dayGround = { r: 73, g: 109, b: 79 };
    const duskGround = { r: 78, g: 77, b: 62 };
    const nightGround = { r: 25, g: 43, b: 44 };
    const firstMix = Math.min(1, dayMix * 2);
    const secondMix = Math.max(0, dayMix * 2 - 1);
    let color = Phaser.Display.Color.Interpolate.ColorWithColor(dayGround, duskGround, 100, firstMix * 100);
    if (secondMix > 0) color = Phaser.Display.Color.Interpolate.ColorWithColor(duskGround, nightGround, 100, secondMix * 100);
    this.ground.setFillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b));
    this.sun.setAlpha(1 - dayMix).setPosition(WIDTH - 90 - dayMix * 100, 92 + dayMix * 55);
    this.moon.setAlpha(Math.max(0, dayMix * 1.4 - .4)).setPosition(92 + dayMix * 55, 92 - dayMix * 20);
    this.darkness.setAlpha(darkness);

    const lanternVisible = dayMix > .08;
    this.lantern.setVisible(lanternVisible);
    if (lanternVisible) {
      this.lantern.setPosition(this.player.x + (this.player.flipX ? -22 : 22), this.player.y + 10);
      this.lantern.setFlipX(this.player.flipX);
      this.lantern.setAngle(Math.sin(this.time.now * .01) * 3);
      this.lightGraphics.clear();
      this.lightGraphics.fillStyle(0xffffff, 1);
      this.lightGraphics.fillCircle(this.lantern.x, this.lantern.y, this.stats.lightRadius);
    }

    ui.phase.textContent = phase;
    ui.phase.style.color = phase.startsWith('밤') ? '#9fc9ef' : phase === '황혼' ? '#ef9d62' : '#f0b94f';
    audio.setNight(this.elapsed >= NIGHT_START);
  }

  updateEnemiesAndPickups(deltaSeconds) {
    this.enemies.getChildren().forEach(enemy => {
      if (!enemy.active) return;
      if (enemy.getData('attacking') || enemy.getData('casting')) {
        enemy.setVelocity(0, 0);
        return;
      }
      const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
      const distance = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
      if (enemy.kind === 'ranged') {
        if (distance < 210) {
          this.physics.velocityFromRotation(angle + Math.PI, enemy.speed * .8, enemy.body.velocity);
        } else if (distance > 330) {
          this.physics.velocityFromRotation(angle, enemy.speed, enemy.body.velocity);
        } else {
          const strafe = Math.sin(this.time.now * .0015 + enemy.x) > 0 ? 1 : -1;
          this.physics.velocityFromRotation(angle + strafe * Math.PI / 2, enemy.speed * .45, enemy.body.velocity);
        }
        if (distance < 440 && this.time.now >= enemy.nextAttackAt) this.fireEnemyProjectile(enemy);
      } else {
        this.physics.velocityFromRotation(angle, enemy.speed, enemy.body.velocity);
      }
      enemy.setFlipX(enemy.body.velocity.x < 0);
      enemy.setAngle(Math.sin(this.time.now * .012 + enemy.x * .03) * (enemy.kind === 'ranged' ? 2 : 3.5));
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
    this.enemyProjectiles.getChildren().forEach(projectile => {
      if (!projectile.active) return;
      if (this.time.now - projectile.getData('bornAt') > 4600) {
        projectile.destroy();
        return;
      }
      projectile.setAngle(projectile.angle + 9);
      if (this.time.now - (projectile.getData('lastTrailAt') || 0) > 65) {
        projectile.setData('lastTrailAt', this.time.now);
        const trail = this.add.circle(projectile.x, projectile.y, 5, 0xd8a8ff, .62).setDepth(23);
        this.tweens.add({
          targets: trail,
          alpha: 0,
          scaleX: .2,
          scaleY: .2,
          duration: 260,
          onComplete: () => trail.destroy()
        });
      }
    });

    if (this.stats.regen > 0) {
      this.stats.hp = Math.min(this.stats.maxHP, this.stats.hp + this.stats.regen * deltaSeconds * .03);
    }
  }

  spawnEnemy() {
    if (!this.player?.active) return;
    const spawnAngle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const spawnDistance = Phaser.Math.Between(430, 560);
    const x = Phaser.Math.Clamp(
      this.player.x + Math.cos(spawnAngle) * spawnDistance,
      28,
      WORLD_WIDTH - 28
    );
    const y = Phaser.Math.Clamp(
      this.player.y + Math.sin(spawnAngle) * spawnDistance,
      28,
      WORLD_HEIGHT - 28
    );

    const eliteChance = Math.min(.18, .025 + this.elapsed / 850);
    const elite = Math.random() < eliteChance;
    const ranged = Math.random() < .18;
    const enemy = this.enemies.create(x, y, ranged ? 'enemy-ranged' : 'enemy-melee')
      .setDisplaySize(elite ? 52 : ranged ? 39 : 43, elite ? 52 : ranged ? 39 : 43)
      .setDepth(20);
    enemy.hp = (18 + this.level * 4 + this.elapsed * .18) * (elite ? 3 : 1);
    enemy.speed = (ranged ? 30 : 38) + Math.min(ranged ? 18 : 30, this.elapsed * .16) + (elite ? 4 : 0);
    enemy.damage = (ranged ? 5 : 6) + Math.floor(this.elapsed / 35) + (elite ? 4 : 0);
    enemy.xpValue = elite ? 8 : ranged ? 4 : 3;
    enemy.elite = elite;
    enemy.kind = ranged ? 'ranged' : 'melee';
    enemy.nextAttackAt = this.time.now + Phaser.Math.Between(2200, 3400);
    enemy.nextContactAt = 0;
    if (elite) enemy.setTint(0xf0a33a);
  }

  fireEnemyProjectile(enemy) {
    if (!enemy?.active || this.state !== 'running' || enemy.getData('casting')) return;
    enemy.nextAttackAt = this.time.now + Phaser.Math.Between(2600, 3800);
    enemy.setData('casting', true);
    enemy.setTint(0xe9b0ff);

    const warning = this.add.graphics().setDepth(22);
    warning.lineStyle(3, 0xe5a8ff, .72);
    warning.lineBetween(enemy.x, enemy.y, this.player.x, this.player.y);
    warning.fillStyle(0xb94ee8, .28);
    warning.fillCircle(enemy.x, enemy.y, 31);
    warning.lineStyle(3, 0xf3d3ff, .9);
    warning.strokeCircle(enemy.x, enemy.y, 28);
    this.tweens.add({
      targets: warning,
      alpha: .25,
      yoyo: true,
      repeat: 2,
      duration: 145
    });

    this.time.delayedCall(520, () => {
      warning.destroy();
      if (!enemy.active) return;
      enemy.setData('casting', false);
      enemy.clearTint();
      if (this.state !== 'running' || !this.player?.active) return;

      const fireAngle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
      const projectile = this.enemyProjectiles.create(enemy.x, enemy.y, 'enemy-projectile')
        .setDisplaySize(18, 18)
        .setDepth(24);
      projectile.damage = enemy.damage;
      projectile.setData('bornAt', this.time.now);
      projectile.setData('lastTrailAt', this.time.now);
      this.physics.velocityFromRotation(fireAngle, enemy.elite ? 124 : 108, projectile.body.velocity);

      const muzzle = this.add.circle(enemy.x, enemy.y, 12, 0xf2c7ff, .9).setDepth(25);
      this.tweens.add({
        targets: muzzle,
        alpha: 0,
        scaleX: 2.8,
        scaleY: 2.8,
        duration: 260,
        onComplete: () => muzzle.destroy()
      });
    });
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
    const chestAngle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const x = forcedX ?? Phaser.Math.Clamp(
      this.player.x + Math.cos(chestAngle) * Phaser.Math.Between(210, 330),
      90,
      WORLD_WIDTH - 90
    );
    const y = forcedY ?? Phaser.Math.Clamp(
      this.player.y + Math.sin(chestAngle) * Phaser.Math.Between(210, 330),
      90,
      WORLD_HEIGHT - 90
    );
    const chest = this.chests.create(x, y, 'treasure-chest')
      .setDisplaySize(66, 66)
      .setDepth(18)
      .setImmovable(true);
    chest.body.setAllowGravity(false);
    chest.setData('spawnedAt', this.time.now);
    this.tweens.add({
      targets: chest,
      scaleX: chest.scaleX * 1.08,
      scaleY: chest.scaleY * 1.08,
      angle: 2.5,
      y: y - 7,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      duration: 720
    });
    const location = this.getTreasureDirection(chest);
    showToast(`보물상자가 나타났습니다! 지도에서 ${location}을 확인하세요.`, 3200);
  }

  openChest(player, chest) {
    if (!chest?.active || this.state !== 'running') return;
    this.createChestBurst(chest.x, chest.y);
    chest.destroy();
    this.offerChoices(true);
  }

  createChestBurst(x, y) {
    const burst = this.add.graphics().setDepth(40);
    burst.lineStyle(4, 0xffd36a, 1);
    burst.strokeCircle(x, y, 28);
    burst.fillStyle(0xfff2ac, .9);
    for (let index = 0; index < 8; index += 1) {
      const angle = index / 8 * Math.PI * 2;
      burst.fillRect(x + Math.cos(angle) * 38 - 2, y + Math.sin(angle) * 38 - 2, 5, 5);
    }
    this.tweens.add({
      targets: burst,
      alpha: 0,
      scaleX: 1.8,
      scaleY: 1.8,
      duration: 420,
      onComplete: () => burst.destroy()
    });
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
    if (this.time.now < (enemy.nextContactAt || 0) || enemy.getData('attacking')) return;
    enemy.nextContactAt = this.time.now + 1650;
    enemy.setData('attacking', true);
    enemy.setVelocity(0, 0);
    enemy.setTint(0xffc55c);

    const warning = this.add.circle(enemy.x, enemy.y, 34, 0xff3f2f, .14)
      .setStrokeStyle(4, 0xffc55c, .92)
      .setDepth(19);
    this.tweens.add({
      targets: warning,
      scaleX: .62,
      scaleY: .62,
      alpha: .9,
      duration: 420
    });

    this.time.delayedCall(430, () => {
      warning.destroy();
      if (!enemy.active) return;
      enemy.setData('attacking', false);
      enemy.clearTint();
      if (this.state !== 'running' || !this.player?.active) return;
      const distance = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
      if (distance > 102) return;
      this.createMeleeSlash(enemy.x, enemy.y, this.player.x, this.player.y);
      this.takePlayerDamage(enemy.damage, enemy.x, enemy.y);
    });
  }

  createMeleeSlash(sourceX, sourceY, targetX, targetY) {
    const angle = Phaser.Math.Angle.Between(sourceX, sourceY, targetX, targetY);
    const impactX = targetX - Math.cos(angle) * 18;
    const impactY = targetY - Math.sin(angle) * 18;
    const slash = this.add.graphics().setDepth(36);
    slash.lineStyle(7, 0xffe29a, 1);
    slash.beginPath();
    slash.arc(impactX, impactY, 28, angle - .9, angle + .9, false);
    slash.strokePath();
    slash.lineStyle(3, 0xff5d45, .9);
    slash.lineBetween(sourceX, sourceY, targetX, targetY);
    this.tweens.add({
      targets: slash,
      alpha: 0,
      scaleX: 1.35,
      scaleY: 1.35,
      duration: 230,
      onComplete: () => slash.destroy()
    });
  }

  onEnemyProjectileHit(player, projectile) {
    if (!projectile?.active || this.state !== 'running') return;
    const { x, y, damage } = projectile;
    projectile.destroy();
    const impact = this.add.circle(x, y, 13, 0xe7b4ff, .95)
      .setStrokeStyle(4, 0x9b38cf, 1)
      .setDepth(38);
    this.tweens.add({
      targets: impact,
      alpha: 0,
      scaleX: 2.4,
      scaleY: 2.4,
      duration: 280,
      onComplete: () => impact.destroy()
    });
    this.takePlayerDamage(damage, x, y);
  }

  takePlayerDamage(rawDamage, sourceX, sourceY) {
    if (this.time.now - this.lastHitAt < 900) return;
    this.lastHitAt = this.time.now;
    const damage = Math.max(1, rawDamage - this.stats.armor);
    this.stats.hp -= damage;
    this.cameras.main.shake(70, .0045);
    this.tweens.killTweensOf(this.damageFlash);
    this.damageFlash.setAlpha(.26);
    this.tweens.add({
      targets: this.damageFlash,
      alpha: 0,
      duration: 260
    });
    this.player.setTintFill(0xff5c5c);
    this.time.delayedCall(100, () => {
      if (this.player.active) this.player.clearTint();
    });
    const angle = Phaser.Math.Angle.Between(sourceX, sourceY, this.player.x, this.player.y);
    this.player.setVelocity(Math.cos(angle) * 190, Math.sin(angle) * 190);
    const damageText = this.add.text(this.player.x, this.player.y - 40, `-${Math.ceil(damage)}`, {
      fontFamily: '"Malgun Gothic", sans-serif',
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#fff2d3',
      stroke: '#8d1420',
      strokeThickness: 5
    }).setOrigin(.5).setDepth(45);
    this.tweens.add({
      targets: damageText,
      y: damageText.y - 34,
      alpha: 0,
      duration: 680,
      ease: 'Cubic.easeOut',
      onComplete: () => damageText.destroy()
    });
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
    this.updateSunClock();
    this.drawMinimap();
  }

  updateSunClock() {
    const progress = Phaser.Math.Clamp(this.elapsed / NIGHT_START, 0, 1);
    const angle = -135 + progress * 270;
    ui.sunClockHand.style.transform = `rotate(${angle}deg)`;

    if (this.elapsed < NIGHT_START) {
      const remaining = Math.max(0, Math.ceil(NIGHT_START - this.elapsed));
      ui.sunsetLabel.textContent = this.elapsed < SUNSET_START ? '해 질 때까지' : '황혼 · 밤까지';
      ui.sunsetCountdown.textContent = `00:${remaining.toString().padStart(2, '0')}`;
      ui.sunClockHand.style.background = this.elapsed < SUNSET_START ? '#fff0a5' : '#ff9860';
      ui.sunClockHand.style.boxShadow = this.elapsed < SUNSET_START ? '0 0 7px #ffb84e' : '0 0 7px #e9684d';
    } else {
      ui.sunsetLabel.textContent = '달이 떴습니다';
      ui.sunsetCountdown.textContent = '밤';
      ui.sunClockHand.style.background = '#cce5ff';
      ui.sunClockHand.style.boxShadow = '0 0 7px #8dbde8';
    }
  }

  getTreasureDirection(chest) {
    if (!chest?.active || !this.player?.active) return '보물 없음';
    const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, chest.x, chest.y);
    const octant = Math.round((angle + Math.PI * 2) / (Math.PI / 4)) % 8;
    const directions = ['동쪽', '남동쪽', '남쪽', '남서쪽', '서쪽', '북서쪽', '북쪽', '북동쪽'];
    const distance = Math.round(Phaser.Math.Distance.Between(this.player.x, this.player.y, chest.x, chest.y) / 10) * 10;
    return `보물 ${directions[octant]} · ${distance}걸음`;
  }

  drawMinimap() {
    const canvas = ui.minimap;
    const context = canvas?.getContext('2d');
    if (!context || !this.player?.active) return;

    const width = canvas.width;
    const height = canvas.height;
    const scaleX = width / WORLD_WIDTH;
    const scaleY = height / WORLD_HEIGHT;
    const mapColor = this.elapsed >= NIGHT_START ? '#142429' : this.elapsed >= SUNSET_START ? '#3b4035' : '#294839';

    context.clearRect(0, 0, width, height);
    context.fillStyle = mapColor;
    context.fillRect(0, 0, width, height);

    context.fillStyle = this.elapsed >= NIGHT_START ? 'rgba(119,111,104,.3)' : 'rgba(181,159,111,.34)';
    context.fillRect(0, (WORLD_HEIGHT / 2 - 68) * scaleY, width, 136 * scaleY);
    context.fillRect((WORLD_WIDTH / 2 - 72) * scaleX, 0, 144 * scaleX, height);

    context.fillStyle = 'rgba(42,76,55,.9)';
    [
      [230, 250], [2140, 310], [300, 1480], [2050, 1430],
      [720, 620], [1690, 1180]
    ].forEach(([x, y]) => {
      context.beginPath();
      context.arc(x * scaleX, y * scaleY, 8, 0, Math.PI * 2);
      context.fill();
    });

    const camera = this.cameras.main;
    context.strokeStyle = 'rgba(255,255,255,.38)';
    context.lineWidth = 3;
    context.strokeRect(camera.worldView.x * scaleX, camera.worldView.y * scaleY, camera.worldView.width * scaleX, camera.worldView.height * scaleY);

    const activeChests = this.chests?.getChildren().filter(chest => chest.active) || [];
    activeChests.forEach(chest => {
      const x = chest.x * scaleX;
      const y = chest.y * scaleY;
      const pulse = 8 + Math.sin(this.time.now * .008) * 3;
      context.strokeStyle = 'rgba(255,211,106,.55)';
      context.lineWidth = 4;
      context.beginPath();
      context.arc(x, y, pulse, 0, Math.PI * 2);
      context.stroke();
      context.save();
      context.translate(x, y);
      context.rotate(Math.PI / 4);
      context.fillStyle = '#ffb738';
      context.fillRect(-7, -7, 14, 14);
      context.strokeStyle = '#fff0a3';
      context.lineWidth = 2;
      context.strokeRect(-7, -7, 14, 14);
      context.restore();
    });

    context.beginPath();
    context.arc(this.player.x * scaleX, this.player.y * scaleY, 7, 0, Math.PI * 2);
    context.fillStyle = '#fff4bd';
    context.shadowColor = '#ffcb4f';
    context.shadowBlur = 10;
    context.fill();
    context.shadowBlur = 0;
    context.strokeStyle = '#793c24';
    context.lineWidth = 3;
    context.stroke();

    ui.treasureHint.textContent = activeChests.length ? this.getTreasureDirection(activeChests[0]) : '보물 없음';
    ui.treasureHint.style.color = activeChests.length ? '#ffd36a' : '#bdb5a7';
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
