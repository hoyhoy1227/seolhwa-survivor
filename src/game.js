const WIDTH = 960;
const HEIGHT = 640;
const WORLD_WIDTH = 1536;
const WORLD_HEIGHT = 1024;
const RENDER_RESOLUTION = 2;
const SPRITE_VERSION = '20260808-9';
const CAMERA_ZOOM = .9;
const PLAYER_DISPLAY_SIZE = (132 * .9 * .9 * .95) / CAMERA_ZOOM;
const ENEMY_VISUAL_SCALE = 1.2 / CAMERA_ZOOM;
const NORMAL_ENEMY_SPAWN_RATE_SCALE = .95;
const SFX_MASTER_GAIN = .65;
const IN_GAME_MUSIC_GAIN = .52;
const MENU_BGM_VOLUME_OFFSET = -10;
const IN_GAME_BGM_VOLUME_OFFSET = 10;
const SUNSET_START = 34;
const NIGHT_START = 55;
const MID_BOSS_TIMES = [18, 38];
const BOSS_REINFORCEMENT_SECONDS = 10;
const ENEMY_DAMAGE_SCALE = 1.3;
const FINAL_BOSS_CURRENT_HP_MULTIPLIER = 4;
const FINAL_BOSS_ATTACK_SPEED_MULTIPLIER = 1.05;
const FINAL_BOSS_SUMMON_LIMIT = 2;
const FIRST_CHAPTER_SPAWN_INTERVAL_SCALE = 1.5;
const RAPID_TREASURE_WINDOW_MS = 100;
const TREASURE_MIN_SEPARATION = 180;
const CHEST_PICKUP_RADIUS = 96;
const CHEST_PICKUP_SWEEP_LIMIT = 320;
const CHOICE_EXIT_INVULNERABILITY_MS = 500;
const LEVEL_MAX_HP_GROWTH = .05;
const LATE_CHAPTER_NORMAL_DAMAGE_SCALE = .97;
const SEJONG_UNLOCK_KEY = 'seolhwa-survivor:sejong-unlocked';
const BGM_VOLUME_KEY = 'seolhwa-survivor:bgm-volume';
const HANGUL_GLYPHS = Object.freeze(['가', '나', '다', '라', '마', '바', '사', '아', '자', '차', '카', '타', '파', '하']);
const HERO_ATTACK_PALETTES = Object.freeze({
  dokkaebi: Object.freeze({ primary: 0xff9a32, secondary: 0xffe29a }),
  gumiho: Object.freeze({ primary: 0xff4f9a, secondary: 0xffb2d4 }),
  haechi: Object.freeze({ primary: 0xffcf47, secondary: 0xfff4b8 }),
  sansin: Object.freeze({ primary: 0x58d88a, secondary: 0xd8f3b7 }),
  cheoyong: Object.freeze({ primary: 0xa56bea, secondary: 0xf0b5ff }),
  baridegi: Object.freeze({ primary: 0x49c8f0, secondary: 0xc9f3ff }),
  sejong: Object.freeze({ primary: 0x526bd8, secondary: 0xffedc2 })
});
const HOSTILE_ATTACK_COLOR = 0xff4055;
const HOSTILE_ATTACK_DARK = 0x26050c;
const SPRITE_BASE = new URL('./assets/sprites/', document.baseURI).href.replace(/\/$/, '');
const remoteSpriteUrl = fileName => `${SPRITE_BASE}/${fileName}?v=${SPRITE_VERSION}`;
const spriteUrl = fileName => window.EMBEDDED_SPRITES?.[fileName] || remoteSpriteUrl(fileName);
const BACKGROUND_BASE = new URL('./assets/backgrounds/', document.baseURI).href.replace(/\/$/, '');
const BGM_URL = new URL(`./assets/audio/bgm-hwiririk-8bit.wav?v=${SPRITE_VERSION}`, document.baseURI).href;
const CHAPTER_BACKGROUND_FILES = Object.freeze([
  'chapter-01-dokkaebi-market-v1.png',
  'chapter-02-fox-pass-v1.png',
  'chapter-03-golden-gate-v1.png',
  'chapter-04-tiger-peak-v1.png',
  'chapter-05-moon-palace-v1.png',
  'chapter-06-underworld-road-v1.png'
]);
const chapterBackgroundKey = index => `chapter-background-${index}`;
const chapterBackgroundUrl = fileName => `${BACKGROUND_BASE}/${fileName}?v=${SPRITE_VERSION}`;

const experienceRequired = level => Math.round(11 + level * 6 + level * level * .65);

const CHARACTERS = [
  {
    id: 'dokkaebi',
    name: '도깨비',
    role: '철퇴의 선봉',
    accent: '#ef8b31',
    attack: '철퇴 지진파',
    description: '전방의 적들을 철퇴 지진파로 한꺼번에 분쇄합니다.',
    spriteFacesLeft: true,
    stats: { damage: 24, magic: 8, speed: 172, maxHP: 150, attackDelay: 620, armor: 2 }
  },
  {
    id: 'gumiho',
    name: '구미호',
    role: '여우불 술사',
    accent: '#d7594f',
    attack: '추적 여우불',
    description: '적을 따라가 폭발하는 여우불과 높은 치명타 확률을 지녔습니다.',
    spriteFacesLeft: true,
    stats: { damage: 18, magic: 28, speed: 170, maxHP: 105, attackDelay: 500, crit: .16 }
  },
  {
    id: 'haechi',
    name: '해치',
    role: '금빛 수호자',
    accent: '#e6b84e',
    attack: '금빛 수호 파동',
    description: '전방위 수호 파동으로 적을 밀어내며 오래 버팁니다.',
    spriteFacesLeft: true,
    stats: { damage: 20, magic: 10, speed: 148, maxHP: 180, attackDelay: 700, armor: 5 }
  },
  {
    id: 'sansin',
    name: '산신',
    role: '산맥의 궁수',
    accent: '#62a05b',
    attack: '관통 산바람 화살',
    description: '긴 사거리의 관통 화살로 여러 적을 꿰뚫습니다.',
    stats: { damage: 19, magic: 14, speed: 194, maxHP: 120, attackDelay: 540, pickupRadius: 100 }
  },
  {
    id: 'cheoyong',
    name: '처용',
    role: '탈춤의 칼날',
    accent: '#8d63c7',
    attack: '처용 연무',
    description: '가까운 적들 사이를 춤추는 칼날로 연속 베기합니다.',
    stats: { damage: 16, magic: 12, speed: 205, maxHP: 115, attackDelay: 430, crit: .10 }
  },
  {
    id: 'baridegi',
    name: '바리데기',
    role: '저승의 무녀',
    accent: '#e99ab4',
    attack: '저승 영혼꽃',
    description: '연쇄되는 영혼꽃과 회복력, 넓은 호롱불로 밤을 이겨냅니다.',
    spriteFacesLeft: true,
    stats: { damage: 15, magic: 26, speed: 165, maxHP: 125, attackDelay: 570, regen: 1.2, lightRadius: 185 }
  },
  {
    id: 'sejong',
    name: '세종대왕',
    role: '훈민정음의 성군',
    accent: '#e0b653',
    attack: '훈민정음 비격',
    description: '한글 글자를 여러 방향으로 날려 적을 관통하고 지혜의 파동을 일으킵니다.',
    unlock: 'campaign-clear',
    stats: { damage: 22, magic: 34, speed: 168, maxHP: 140, attackDelay: 480, armor: 2, crit: .12, projectiles: 2 }
  }
];

const CAMPAIGN = [
  {
    id: 'dokkaebi-market', name: '도깨비 장터', story: '도깨비의 흥겨운 장터가 탐욕의 불길에 삼켜졌습니다.',
    bossName: '도깨비 대왕', bossTexture: 'boss-dokkaebi', bossPattern: 'smash',
    enemyNames: ['도깨비 장사꾼', '각시 장난귀', '불씨 저승사자'],
    ground: 0x7f6949, path: 0xd0a568, accent: 0xff7a32, map: '#59472f',
    rangedChance: .12, hpScale: 1, speedScale: 1, damageScale: 1, spawnScale: 1, bossHpScale: 1,
    hazard: 'embers', deviceName: '장터 불화로', deviceHint: '주기적으로 폭발해 주변의 모두를 태웁니다.',
    traitName: '탐욕의 불씨', combatHint: '근거리 도깨비가 떼로 몰려옵니다. 화로가 붉게 달아오르면 폭발 범위에서 즉시 벗어나세요.'
  },
  {
    id: 'fox-pass', name: '여우고개', story: '아홉 꼬리의 환영이 달빛 고개를 뒤덮었습니다.',
    bossName: '천년 구미호', bossTexture: 'boss-gumiho', bossPattern: 'foxfire',
    enemyNames: ['홀린 나그네', '여우 그림자', '환영 무당'],
    ground: 0x624c6a, path: 0xb8899e, accent: 0xff6575, map: '#49364f',
    rangedChance: .28, hpScale: 1.12, speedScale: 1.08, damageScale: 1.05, spawnScale: .88, bossHpScale: 1.25,
    hazard: 'illusions', deviceName: '여우 안개석', deviceHint: '안개 안에서는 이동이 느려지고 환영이 몰려옵니다.',
    traitName: '홀리는 안개', combatHint: '환영과 원거리 공격이 늘어납니다. 안개석 주변에 오래 머물지 말고 빈 공간을 확보하세요.'
  },
  {
    id: 'golden-gate', name: '해치의 금문', story: '정의를 지키던 금문이 쇠를 먹는 괴수에게 무너지고 있습니다.',
    bossName: '불가살이', bossTexture: 'boss-bulgasari', bossPattern: 'charge',
    enemyNames: ['철갑 요괴', '금문 수문귀', '쇳조각 술사'],
    ground: 0x75623d, path: 0xd7bb6b, accent: 0xffca55, map: '#514728',
    rangedChance: .16, hpScale: 1.34, speedScale: .94, damageScale: 1.15, spawnScale: .77, bossHpScale: 1.55,
    hazard: 'shards', deviceName: '금문 수호진', deviceHint: '충전된 수호진이 주변 요괴를 밀어냅니다.',
    traitName: '쇳조각 폭우', combatHint: '단단한 철갑 요괴와 낙하하는 쇳조각이 길을 막습니다. 수호진의 밀쳐내기를 방어선으로 활용하세요.'
  },
  {
    id: 'tiger-peak', name: '산군 봉우리', story: '뒤틀린 산바람이 봉우리의 수호령들을 사납게 만들었습니다.',
    bossName: '산군', bossTexture: 'boss-sangun', bossPattern: 'pounce',
    enemyNames: ['산짐승 귀', '바람 각시', '절벽 사냥꾼'],
    ground: 0x52634a, path: 0xa39467, accent: 0x9bd56b, map: '#33462f',
    rangedChance: .2, hpScale: 1.3, speedScale: 1.24, damageScale: 1.12, spawnScale: .67, bossHpScale: 1.9,
    hazard: 'wind', deviceName: '산바람 돌탑', deviceHint: '돌탑의 바람길이 이동 방향을 강하게 밀어냅니다.',
    traitName: '거센 산바람', combatHint: '빠른 산짐승과 돌풍이 이동 경로를 흔듭니다. 바람 방향을 보고 절벽 쪽으로 밀리지 않게 움직이세요.'
  },
  {
    id: 'moon-palace', name: '처용의 달궁', story: '달궁에 역병의 춤이 번져 그림자들이 가면을 빼앗았습니다.',
    bossName: '역신', bossTexture: 'boss-yeoksin', bossPattern: 'plague',
    enemyNames: ['역병 탈귀', '저주받은 무희', '부적 술사'],
    ground: 0x4f4660, path: 0x897596, accent: 0x67d7e4, map: '#352d45',
    rangedChance: .34, hpScale: 1.45, speedScale: 1.12, damageScale: 1.24, spawnScale: .58, bossHpScale: 2.3,
    hazard: 'plague', deviceName: '처용 정화 북', deviceHint: '북의 결계 안에서는 피해가 줄고 역병이 정화됩니다.',
    traitName: '번지는 역병', combatHint: '저주 장판과 원거리 술사가 전장을 오염시킵니다. 위험할 때 정화 북의 결계 안에서 전열을 정비하세요.'
  },
  {
    id: 'underworld-road', name: '바리의 저승꽃길', story: '저승꽃길의 문이 닫히며 떠도는 혼들이 길을 잃었습니다.',
    bossName: '염라대왕', bossTexture: 'boss-yeomra', bossPattern: 'legacy-random',
    enemyNames: ['길 잃은 혼', '저승 옥졸', '명부 술사'],
    ground: 0x30374d, path: 0x6e6688, accent: 0x78b9ff, map: '#20273c',
    rangedChance: .4, hpScale: 1.62, speedScale: 1.16, damageScale: 1.36, spawnScale: .5, bossHpScale: 2.75,
    hazard: 'rifts', deviceName: '저승 영혼샘', deviceHint: '생명력을 회복하지만 정예 옥졸도 끌어들입니다.',
    traitName: '갈라진 저승길', combatHint: '차원의 균열과 원거리 혼령이 끊임없이 압박합니다. 영혼샘의 회복과 정예 소환 위험을 함께 계산하세요.'
  }
];

const CHAPTER_DEVICE_SPRITES = [
  'device-brazier.png',
  'device-mist-stone.png',
  'device-golden-seal.png',
  'device-wind-totem.png',
  'device-moon-drum.png',
  'device-soul-well.png'
];

const CHAPTER_PROP_KEYS = [
  'prop-market-landmark',
  'prop-fox-shrine',
  'prop-golden-gate',
  'prop-mountain-shrine',
  'prop-moon-court',
  'prop-underworld-memorial'
];

const EMBEDDED_TEXTURE_FILES = Object.freeze({
  dokkaebi: 'dokkaebi.png',
  gumiho: 'gumiho.png',
  haechi: 'haechi.png',
  sansin: 'sansin.png',
  cheoyong: 'cheoyong.png',
  baridegi: 'baridegi.png',
  sejong: 'sejong.png',
  lantern: 'lantern.png',
  'treasure-chest': 'treasure-chest.png',
  'enemy-dokkaebi': 'enemy-dokkaebi.png',
  'enemy-gaksi': 'enemy-gaksi.png',
  'enemy-jeoseung': 'enemy-jeoseung.png',
  'boss-dokkaebi': 'boss-dokkaebi.png',
  'boss-gumiho': 'boss-gumiho.png',
  'boss-bulgasari': 'boss-bulgasari.png',
  'boss-sangun': 'boss-sangun.png',
  'boss-yeoksin': 'boss-yeoksin.png',
  'boss-yeomra': 'boss-yeomra.png',
  'device-brazier': 'device-brazier.png',
  'device-mist-stone': 'device-mist-stone.png',
  'device-golden-seal': 'device-golden-seal.png',
  'device-wind-totem': 'device-wind-totem.png',
  'device-moon-drum': 'device-moon-drum.png',
  'device-soul-well': 'device-soul-well.png',
  'prop-market-landmark': 'prop-market-landmark-v1.png',
  'prop-fox-shrine': 'prop-fox-shrine-v1.png',
  'prop-golden-gate': 'prop-golden-gate-v1.png',
  'prop-mountain-shrine': 'prop-mountain-shrine-v1.png',
  'prop-moon-court': 'prop-moon-court-v1.png',
  'prop-underworld-memorial': 'prop-underworld-memorial-v1.png',
  'ground-forest': 'ground-forest-v2.png'
});

async function decodeEmbeddedSprites() {
  const entries = Object.entries(window.EMBEDDED_SPRITES || {});
  const decoded = await Promise.all(entries.map(([fileName, source]) => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve([fileName, image]);
    image.onerror = () => reject(new Error(`Embedded sprite decode failed: ${fileName}`));
    image.src = source;
  })));
  return Object.fromEntries(decoded);
}

async function decodeChapterBackgrounds(maxAttempts = 3) {
  let lastError = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    let completed = 0;
    try {
      const decoded = await Promise.all(CHAPTER_BACKGROUND_FILES.map(fileName => new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
          completed += 1;
          updateMapLoadingScreen(
            completed / CHAPTER_BACKGROUND_FILES.length,
            `한국 설화 지도 확인 중… ${completed} / ${CHAPTER_BACKGROUND_FILES.length}`
          );
          resolve([fileName, image]);
        };
        image.onerror = () => reject(new Error(`Chapter background decode failed: ${fileName}`));
        image.src = chapterBackgroundUrl(fileName);
      })));
      return Object.fromEntries(decoded);
    } catch (error) {
      lastError = error;
      updateMapLoadingScreen(
        completed / CHAPTER_BACKGROUND_FILES.length,
        `맵 이미지를 다시 확인하는 중… (${attempt}/${maxAttempts})`,
        true
      );
      if (attempt < maxAttempts) {
        await new Promise(resolve => window.setTimeout(resolve, 450 * attempt));
      }
    }
  }
  throw lastError || new Error('Chapter backgrounds failed to load.');
}

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
    id: 'spirit-pouch',
    icon: '🧧',
    title: '정기 복주머니',
    description: '경험치가 끌려오는 범위가 65 넓어집니다.',
    apply: scene => { scene.stats.pickupRadius += 65; }
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
  },
  {
    id: 'wind-dagger', icon: '🗡️', title: '바람 동곳',
    description: '투사체 속도 +22%, 크기 +18%.',
    apply: scene => {
      scene.stats.projectileSpeed *= 1.22;
      scene.stats.projectileSize *= 1.18;
    }
  },
  {
    id: 'guardian-knot', icon: '🪢', title: '수호 매듭',
    description: '접촉 피해를 20% 줄이고 밀쳐내는 힘이 증가합니다.',
    apply: scene => {
      scene.stats.contactGuard = Math.min(.65, scene.stats.contactGuard + .2);
      scene.stats.knockback += 26;
    }
  },
  {
    id: 'salt-jar', icon: '🏺', title: '액막이 소금단지',
    description: '보스에게 주는 피해가 15% 증가합니다.',
    apply: scene => { scene.stats.bossDamage += .15; }
  },
  {
    id: 'frost-pin', icon: '❄️', title: '서리 비녀',
    description: '공격이 적을 1.2초 동안 느리게 만듭니다.',
    apply: scene => { scene.stats.frost += 1; }
  },
  {
    id: 'wide-sleeve', icon: '🪭', title: '선녀의 날개옷',
    description: '공격 범위와 폭발 범위가 25% 넓어집니다.',
    apply: scene => { scene.stats.areaScale *= 1.25; }
  },
  {
    id: 'orbit-talisman', icon: '☯️', title: '회전 액막이 부적',
    description: '주위를 회전하며 닿는 적을 베는 부적을 추가합니다.',
    rare: true,
    apply: scene => {
      scene.stats.orbitals += 1;
      scene.rebuildOrbitals();
    }
  },
  {
    id: 'lotus-array', icon: '🪷', title: '바리의 연꽃 진',
    description: '4초마다 넓은 영혼 파동이 모든 방향으로 퍼집니다.',
    rare: true,
    apply: scene => { scene.stats.areaPulse += 1; }
  },
  {
    id: 'crow-lightning', icon: '⚡', title: '삼족오의 낙뢰',
    description: '공격할 때 번개가 최대 세 명의 적에게 연쇄됩니다.',
    rare: true,
    apply: scene => { scene.stats.lightning += 1; }
  },
  {
    id: 'phoenix-feather', icon: '🪶', title: '봉황의 불깃',
    description: '공격이 불꽃을 남겨 3초 동안 추가 피해를 줍니다.',
    rare: true,
    apply: scene => { scene.stats.burn += 1; }
  },
  {
    id: 'mirror-blade', icon: '🪞', title: '월광 반사경',
    description: '공격이 한 번 튕겨 다른 적을 다시 타격합니다.',
    rare: true,
    apply: scene => { scene.stats.ricochet += 1; }
  }
];

const ITEM_ICON_SVGS = Object.freeze({
  fire: '<path d="M25 4c2 8-5 9-2 16 3-3 5-6 5-10 7 6 11 12 9 20-2 8-8 13-16 13S7 38 8 29c1-6 5-11 10-15-1 5 1 8 4 10-1-8 4-12 3-20Z"/><path d="M24 25c4 4 5 7 3 11-1 3-6 4-8 1-3-4 1-8 5-12Z"/>',
  crow: '<circle cx="24" cy="24" r="9"/><path d="M24 4v7M24 37v7M4 24h7M37 24h7M10 10l5 5M33 33l5 5M38 10l-5 5M15 33l-5 5"/>',
  tiger: '<circle cx="24" cy="29" r="9"/><circle cx="11" cy="18" r="5"/><circle cx="21" cy="12" r="5"/><circle cx="37" cy="18" r="5"/><path d="M17 28c4-5 10-5 14 0M19 34c3 2 7 2 10 0"/>',
  scale: '<path d="M24 4 39 10v11c0 10-6 18-15 23C15 39 9 31 9 21V10l15-6Z"/><path d="m17 23 5 5 10-11"/>',
  lantern: '<path d="M18 5h12M16 9h16l3 7-3 23H16l-3-23 3-7ZM16 16h16M16 34h16M20 39v5M28 39v5"/><path d="M20 17h8v16h-8z"/>',
  'spirit-pouch': '<path d="M17 8c4 3 10 3 14 0l-3 8c7 4 11 11 9 19-2 7-8 9-13 9s-11-2-13-9c-2-8 2-15 9-19l-3-8Z"/><path d="M17 17h14M24 22v14M19 28h10"/>',
  bell: '<path d="M13 34h22l-4-6v-8c0-7-3-12-7-12s-7 5-7 12v8l-4 6Z"/><path d="M20 39c1 4 7 4 8 0M20 6h8"/>',
  talisman: '<circle cx="24" cy="24" r="17"/><path d="M7 24h34M24 7c8 5 8 12 0 17s-8 12 0 17"/><circle cx="20" cy="17" r="2"/><circle cx="28" cy="31" r="2"/>',
  moon: '<path d="M35 36A17 17 0 1 1 25 7c-7 10-3 24 10 29Z"/><path d="m34 9 1 4 4 1-4 1-1 4-1-4-4-1 4-1 1-4Z"/>',
  medicine: '<path d="M23 41V20C23 11 31 6 40 7c0 9-6 17-17 17"/><path d="M23 31C18 21 10 18 5 20c0 8 6 14 18 14M23 24l11-11M23 31l-11-7"/>',
  'fox-orb': '<circle cx="24" cy="25" r="14"/><path d="M16 26c3-8 15-8 16 0 1 6-8 10-12 5-3-4 2-8 6-5"/><path d="m14 10-4-6 8 3M34 10l4-6-8 3"/>',
  'king-lantern': '<path d="M16 6h16M13 11h22l3 7-4 21H14l-4-21 3-7ZM14 18h20M14 34h20"/><path d="m24 20 3 5 5 1-4 4 1 5-5-3-5 3 1-5-4-4 5-1 3-5Z"/>',
  storm: '<path d="M28 3 12 27h11l-3 18 16-25H25l3-17Z"/>',
  immortal: '<path d="M24 41c-3-10-1-18 0-24M24 22C17 12 10 10 6 13c1 9 7 14 18 14M24 22c7-10 14-12 18-9-1 9-7 14-18 14"/><path d="M14 39c4-8 16-8 20 0-6 5-14 5-20 0Z"/>',
  'wind-dagger': '<path d="m34 5 8 8-21 22-8-8L34 5ZM10 30l8 8M8 40l4-8 4 4-8 4Z"/><path d="M7 12h13M4 19h11"/>',
  'guardian-knot': '<path d="M16 8c-7 0-10 9-5 14l13 13 13-13c5-5 2-14-5-14-5 0-8 4-8 8 0-4-3-8-8-8Z"/><path d="M16 40c7 0 10-9 5-14L8 13M32 40c-7 0-10-9-5-14l13-13"/>',
  'salt-jar': '<path d="M16 7h16l-2 8c6 4 9 11 8 19-1 7-7 10-14 10S11 41 10 34c-1-8 2-15 8-19l-2-8ZM16 13h16M15 28h18"/><path d="m21 23 3-4 3 4-3 4-3-4Z"/>',
  'frost-pin': '<path d="M24 4v40M7 14l34 20M41 14 7 34M24 4l-4 6M24 4l4 6M24 44l-4-6M24 44l4-6M7 14l7 1M7 14l2 7M41 14l-7 1M41 14l-2 7"/>',
  'wide-sleeve': '<path d="M7 36c8-20 20-28 34-28-1 15-11 27-29 33l-5-5Z"/><path d="M12 36 38 11M17 34l1-15M24 29l5-15M12 40l-5 4"/>',
  'orbit-talisman': '<circle cx="24" cy="24" r="18"/><path d="M24 6c9 5 9 14 0 18s-9 13 0 18"/><circle cx="20" cy="16" r="3"/><circle cx="28" cy="32" r="3"/><path d="M4 24h5M39 24h5"/>',
  'lotus-array': '<path d="M24 39c-8-5-12-11-10-18 7 1 10 5 10 11 0-8 4-14 10-17 4 8 0 15-10 24Z"/><path d="M24 39C13 40 6 35 5 28c8-2 14 1 19 11M24 39c11 1 18-4 19-11-8-2-14 1-19 11M13 42h22"/>',
  'crow-lightning': '<circle cx="24" cy="24" r="18"/><path d="m27 5-12 21h9l-3 17 13-23h-9l2-15Z"/>',
  'phoenix-feather': '<path d="M37 5C20 8 10 21 11 43c8-13 15-21 26-38Z"/><path d="M13 39 32 12M17 30l-7-2M23 23l9 2M27 16l-6-3"/>',
  'mirror-blade': '<ellipse cx="24" cy="21" rx="14" ry="17"/><path d="M18 37h12l4 7H14l4-7ZM18 10c6-5 13-2 16 4M14 22c4 5 9 7 15 6"/>'
});

function skillIconMarkup(skill) {
  const drawing = ITEM_ICON_SVGS[skill.id] || '<circle cx="24" cy="24" r="17"/><path d="M24 12v24M12 24h24"/>';
  return `<span class="choice-icon${skill.rare ? ' rare' : ''}"><svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">${drawing}</svg></span>`;
}

class GameAudio {
  constructor() {
    this.context = null;
    this.master = null;
    this.muted = false;
    this.night = false;
    this.bgmTimer = null;
    this.step = 0;
    let savedVolume = 65;
    try {
      const storedValue = window.localStorage.getItem(BGM_VOLUME_KEY);
      const storedVolume = Number(storedValue);
      if (storedValue !== null && Number.isFinite(storedVolume)) savedVolume = storedVolume;
    } catch (error) {
      console.warn('BGM 볼륨 설정을 읽지 못했습니다.', error);
    }
    this.bgmVolume = Math.max(0, Math.min(100, savedVolume));
    this.menuTrack = new Audio(BGM_URL);
    this.menuTrack.loop = true;
    this.menuTrack.preload = 'metadata';
    this.menuTrack.volume = this.getMenuBgmVolume();
  }

  getMenuBgmVolume() {
    return Math.max(0, Math.min(100, this.bgmVolume + MENU_BGM_VOLUME_OFFSET)) / 100;
  }

  getInGameBgmVolume() {
    if (this.bgmVolume <= 0) return 0;
    return Math.max(0, Math.min(100, this.bgmVolume + IN_GAME_BGM_VOLUME_OFFSET)) / 100;
  }

  ensure() {
    if (!this.context) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      this.context = new AudioContextClass();
      this.master = this.context.createGain();
      this.master.gain.value = this.muted ? 0 : SFX_MASTER_GAIN;
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

  attack(kind) {
    const patterns = {
      dokkaebi: [[92, .13, 'square'], [58, .19, 'sawtooth']],
      gumiho: [[620, .09, 'sine'], [860, .14, 'triangle']],
      haechi: [[185, .2, 'triangle'], [370, .24, 'sine']],
      sansin: [[760, .045, 'square'], [310, .08, 'triangle']],
      cheoyong: [[410, .055, 'sawtooth'], [520, .07, 'triangle']],
      baridegi: [[280, .2, 'sine'], [560, .26, 'triangle']],
      sejong: [[392, .1, 'triangle'], [523, .13, 'sine'], [659, .16, 'triangle']]
    };
    (patterns[kind] || patterns.gumiho).forEach(([note, duration, type], index) => this.tone(note, duration, type, .026, index * .035));
  }

  impact(heavy = false) {
    this.tone(heavy ? 52 : 112, heavy ? .26 : .11, 'sawtooth', heavy ? .07 : .035);
    if (heavy) this.tone(84, .32, 'square', .035, .04);
  }

  boss() {
    [110, 82, 55].forEach((note, index) => this.tone(note, .55, 'sawtooth', .07, index * .2));
  }

  portal() {
    [294, 392, 587, 784].forEach((note, index) => this.tone(note, .34, 'sine', .05, index * .11));
  }

  victory() {
    [262, 330, 392, 523, 659, 784].forEach((note, index) => this.tone(note, .5, 'triangle', .055, index * .13));
  }

  level() {
    [440, 554, 659, 880].forEach((note, index) => this.tone(note, .24, 'triangle', .055, index * .09));
  }

  chest() {
    [330, 440, 554, 740, 880].forEach((note, index) => this.tone(note, .36, 'square', .04, index * .11));
  }

  musicTone(frequency, duration, type, volume, delay = 0) {
    this.tone(frequency, duration, type, volume * this.getInGameBgmVolume() * IN_GAME_MUSIC_GAIN, delay);
  }

  startMenuBgm() {
    this.stopBgm();
    this.ensure();
    this.menuTrack.muted = this.muted;
    this.menuTrack.volume = this.getMenuBgmVolume();
    const playback = this.menuTrack.play();
    if (playback?.catch) playback.catch(error => console.warn('메뉴 BGM 재생을 시작하지 못했습니다.', error));
  }

  startBgm() {
    this.stopMenuBgm(true);
    if (this.bgmTimer) return;
    this.ensure();
    const dayScale = [220, 277, 330, 370, 330, 277, 247, 277];
    const nightScale = [147, 175, 220, 196, 165, 147, 131, 147];
    const playStep = () => {
      if (!this.context || this.muted) return;
      const scale = this.night ? nightScale : dayScale;
      const note = scale[this.step % scale.length];
      this.musicTone(note, this.night ? .5 : .28, this.night ? 'triangle' : 'sine', .028);
      if (this.step % 2 === 0) this.musicTone(note / 2, .45, 'sine', .016);
      if (this.step % 4 === 2) this.musicTone(note * 2, .09, 'triangle', .012, .12);
      this.step += 1;
    };
    playStep();
    this.bgmTimer = window.setInterval(playStep, this.night ? 540 : 430);
  }

  setNight(isNight) {
    if (this.night === isNight) return;
    this.night = isNight;
    if (this.bgmTimer) {
      this.stopBgm();
      this.startBgm();
    }
  }

  stopMenuBgm(reset = false) {
    this.menuTrack.pause();
    if (reset) {
      try {
        this.menuTrack.currentTime = 0;
      } catch (error) {
        console.warn('메뉴 BGM 재생 위치를 초기화하지 못했습니다.', error);
      }
    }
  }

  stopBgm() {
    if (this.bgmTimer) window.clearInterval(this.bgmTimer);
    this.bgmTimer = null;
  }

  stopAllBgm(resetMenu = false) {
    this.stopBgm();
    this.stopMenuBgm(resetMenu);
  }

  previewBgmVolume() {
    if (this.muted || this.bgmVolume <= 0) return;
    this.musicTone(523, .13, 'sine', .055);
    this.musicTone(659, .18, 'triangle', .045, .11);
  }

  setBgmVolume(value) {
    const volume = Math.round(Math.max(0, Math.min(100, Number(value) || 0)));
    this.bgmVolume = volume;
    this.menuTrack.volume = this.getMenuBgmVolume();
    try {
      window.localStorage.setItem(BGM_VOLUME_KEY, String(volume));
    } catch (error) {
      console.warn('BGM 볼륨 설정을 저장하지 못했습니다.', error);
    }
    return volume;
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.master) this.master.gain.value = this.muted ? 0 : SFX_MASTER_GAIN;
    this.menuTrack.muted = this.muted;
    return this.muted;
  }
}

const audio = new GameAudio();

const ui = {
  title: document.getElementById('title-screen'),
  how: document.getElementById('how-screen'),
  settings: document.getElementById('settings-screen'),
  characters: document.getElementById('character-screen'),
  characterGrid: document.getElementById('character-grid'),
  story: document.getElementById('story-screen'),
  storyPanel: document.getElementById('story-panel'),
  storyKicker: document.getElementById('story-kicker'),
  storyHeading: document.getElementById('story-heading'),
  storyVisual: document.getElementById('story-visual'),
  storyPortrait: document.getElementById('story-portrait'),
  storyFigureLabel: document.getElementById('story-figure-label'),
  storyNarrative: document.getElementById('story-narrative'),
  storyObjective: document.getElementById('story-objective'),
  storyDetails: document.getElementById('story-details'),
  storyBack: document.getElementById('story-back'),
  storyContinue: document.getElementById('story-continue'),
  hud: document.getElementById('hud'),
  hudPortrait: document.getElementById('hud-portrait'),
  heroName: document.getElementById('hero-name'),
  hpFill: document.getElementById('hp-fill'),
  hpText: document.getElementById('hp-text'),
  xpFill: document.getElementById('xp-fill'),
  levelText: document.getElementById('level-text'),
  phase: document.getElementById('phase'),
  timer: document.getElementById('timer'),
  runStats: document.getElementById('run-stats'),
  chapterLabel: document.getElementById('chapter-label'),
  chapterName: document.getElementById('chapter-name'),
  bossPanel: document.getElementById('boss-panel'),
  bossName: document.getElementById('boss-name'),
  bossFill: document.getElementById('boss-fill'),
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
  portalConfirm: document.getElementById('portal-confirm-screen'),
  portalConfirmHeading: document.getElementById('portal-confirm-heading'),
  portalConfirmCopy: document.getElementById('portal-confirm-copy'),
  portalGo: document.getElementById('portal-go-button'),
  portalStay: document.getElementById('portal-stay-button'),
  pause: document.getElementById('pause-screen'),
  pauseKicker: document.querySelector('#pause-screen .eyebrow'),
  pauseHeading: document.querySelector('#pause-screen .section-heading'),
  pauseSoundSettings: document.getElementById('pause-sound-settings'),
  resume: document.getElementById('resume-button')
};

function syncBgmVolumeControls(volume = audio.bgmVolume) {
  const normalized = Math.round(Math.max(0, Math.min(100, volume)));
  document.querySelectorAll('.bgm-volume-slider').forEach(slider => {
    slider.value = String(normalized);
    slider.setAttribute('aria-valuetext', `${normalized}%`);
  });
  document.querySelectorAll('.bgm-volume-value').forEach(output => {
    output.textContent = `${normalized}`;
  });
}

let volumePreviewTimer = null;
document.querySelectorAll('.bgm-volume-slider').forEach(slider => {
  slider.addEventListener('input', event => {
    syncBgmVolumeControls(audio.setBgmVolume(event.currentTarget.value));
    window.clearTimeout(volumePreviewTimer);
    volumePreviewTimer = window.setTimeout(() => audio.previewBgmVolume(), 180);
  });
});
syncBgmVolumeControls();

let toastTimer = null;
let pendingIntroCharacter = null;
let sessionSejongUnlocked = false;

function showToast(message, duration = 2200) {
  ui.toast.textContent = message;
  ui.toast.classList.add('show');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => ui.toast.classList.remove('show'), duration);
}

function hideScreens() {
  ui.title.classList.add('hidden');
  ui.how.classList.add('hidden');
  ui.settings.classList.add('hidden');
  ui.characters.classList.add('hidden');
  ui.story.classList.add('hidden');
  ui.choice.classList.add('hidden');
  ui.portalConfirm.classList.add('hidden');
  ui.pause.classList.add('hidden');
}

function currentScene() {
  return window.game?.scene.getScene('GameScene');
}

function updateMapLoadingScreen(progress, message, failed = false) {
  const screen = document.getElementById('map-loading-screen');
  const label = document.getElementById('map-loading-message');
  const fill = document.getElementById('map-loading-fill');
  if (!screen || !label || !fill) return;
  const normalized = Math.max(0, Math.min(1, Number(progress) || 0));
  fill.style.width = `${Math.round(normalized * 100)}%`;
  fill.style.background = failed ? '#b43d38' : '';
  label.textContent = message;
}

function markGameReady(scene) {
  const missingBackgrounds = CHAPTER_BACKGROUND_FILES
    .map((fileName, index) => ({ fileName, key: chapterBackgroundKey(index) }))
    .filter(({ key }) => !scene?.textures?.exists(key));
  if (missingBackgrounds.length) {
    const missingNames = missingBackgrounds.map(({ fileName }) => fileName).join(', ');
    console.error(`Chapter backgrounds failed to load: ${missingNames}`);
    updateMapLoadingScreen(0, '맵 이미지를 불러오지 못했습니다. 새로고침해 주세요.', true);
    return false;
  }
  const button = document.getElementById('start-button');
  window.GAME_READY = true;
  button.disabled = false;
  button.textContent = button.dataset.readyLabel || '모험 시작';
  updateMapLoadingScreen(1, '지도 준비 완료');
  const loadingScreen = document.getElementById('map-loading-screen');
  loadingScreen?.classList.add('ready');
  window.setTimeout(() => loadingScreen?.classList.add('hidden'), 280);
  return true;
}

function renderStoryDetails(details) {
  ui.storyDetails.innerHTML = '';
  details.forEach(({ label, text, emphasis }) => {
    const card = document.createElement('div');
    card.className = 'story-detail-card';
    if (emphasis) card.classList.add('combat-detail');
    const heading = document.createElement('b');
    heading.textContent = label;
    const copy = document.createElement('span');
    copy.textContent = text;
    card.append(heading, copy);
    ui.storyDetails.appendChild(card);
  });
}

function showCampaignIntro(character) {
  const firstChapter = CAMPAIGN[0];
  pendingIntroCharacter = character;
  hideScreens();
  ui.hud.classList.add('hidden');
  ui.story.dataset.mode = 'intro';
  ui.storyPanel.style.setProperty('--story-accent', character.accent);
  ui.storyKicker.textContent = 'PROLOGUE · 여섯 설화의 붕괴';
  ui.storyHeading.textContent = '잊힌 설화가 깨어난 밤';
  ui.storyVisual.dataset.kind = 'hero';
  ui.storyPortrait.src = spriteUrl(`${character.id}.png`);
  ui.storyPortrait.alt = `${character.name} 캐릭터`;
  ui.storyFigureLabel.textContent = `${character.name} · ${character.role}`;
  ui.storyNarrative.textContent = '사람들이 옛이야기를 잊기 시작하자, 여섯 설화의 경계가 무너졌습니다. 탐욕의 불길과 여우의 환영, 쇳조각의 폭우, 뒤틀린 산바람, 역병의 춤과 저승의 균열이 이야기 속 세상을 삼키고 있습니다.\n\n설화가 완전히 사라지기 전, 선택받은 수호자만이 밤을 건너 이야기를 되돌릴 수 있습니다.';
  ui.storyObjective.textContent = `${character.name}의 힘으로 낮 동안 성장하고 밤의 보스를 쓰러뜨리세요. 열린 포탈을 통과해 여섯 설화를 모두 구하면 이야기가 완성됩니다.`;
  renderStoryDetails([
    { label: '전투 특성과 방식', text: `${character.name} · ${character.attack} — ${character.description}`, emphasis: true },
    { label: '여정의 목표', text: '각 설화의 밤 보스를 처치하고 포탈을 통과해 총 6개의 세계를 복원합니다.' },
    { label: '첫 번째 설화', text: `${firstChapter.name} · ${firstChapter.deviceName}을 경계하며 ${firstChapter.bossName}에게 맞서세요.` }
  ]);
  ui.storyBack.classList.remove('hidden');
  ui.storyContinue.textContent = '첫 설화로 출발';
  ui.story.classList.remove('hidden');
}

function showChapterBriefing(scene, chapter) {
  const chapterNumber = scene.chapterIndex + 1;
  ui.story.dataset.mode = 'chapter';
  ui.storyPanel.style.setProperty('--story-accent', `#${chapter.accent.toString(16).padStart(6, '0')}`);
  ui.storyKicker.textContent = `FOLKLORE ${chapterNumber} / ${CAMPAIGN.length}`;
  ui.storyHeading.textContent = `${chapter.name}에 도착했습니다`;
  ui.storyVisual.dataset.kind = 'device';
  ui.storyPortrait.src = spriteUrl(CHAPTER_DEVICE_SPRITES[scene.chapterIndex]);
  ui.storyPortrait.alt = `${chapter.deviceName} 장치`;
  ui.storyFigureLabel.textContent = chapter.deviceName;
  ui.storyNarrative.textContent = `${chapter.story}\n\n이곳의 지형과 요괴는 이전 설화와 다른 방식으로 움직입니다. 아래 안내를 확인한 뒤 전투를 시작하세요.`;
  ui.storyObjective.textContent = `낮 동안 힘을 모으고, 밤에 나타나는 ${chapter.bossName}을 쓰러뜨려 다음 설화의 포탈을 여세요.`;
  renderStoryDetails([
    { label: `맵 특성 · ${chapter.traitName}`, text: chapter.combatHint },
    { label: `지형 장치 · ${chapter.deviceName}`, text: chapter.deviceHint },
    { label: `밤의 보스 · ${chapter.bossName}`, text: '해가 완전히 지면 등장합니다. 처치 후 남은 요괴가 파란 경험치로 변해 캐릭터에게 모이고 다음 포탈이 열립니다.' }
  ]);
  ui.storyBack.classList.add('hidden');
  ui.storyContinue.textContent = '안내 확인 · 전투 시작';
  ui.story.classList.remove('hidden');
}

function isSejongUnlocked() {
  if (sessionSejongUnlocked) return true;
  try {
    return window.localStorage.getItem(SEJONG_UNLOCK_KEY) === '1';
  } catch (error) {
    console.warn('세종대왕 해금 기록을 읽을 수 없습니다.', error);
    return false;
  }
}

function unlockSejong() {
  const newlyUnlocked = !isSejongUnlocked();
  sessionSejongUnlocked = true;
  try {
    window.localStorage.setItem(SEJONG_UNLOCK_KEY, '1');
  } catch (error) {
    console.warn('세종대왕 해금 기록을 저장할 수 없습니다.', error);
  }
  return newlyUnlocked;
}

function isCharacterUnlocked(character) {
  return character.unlock !== 'campaign-clear' || isSejongUnlocked();
}

function buildCharacterCards() {
  ui.characterGrid.innerHTML = '';
  CHARACTERS.forEach(character => {
    const unlocked = isCharacterUnlocked(character);
    const card = document.createElement('button');
    card.className = 'character-card';
    card.style.setProperty('--accent', unlocked ? character.accent : '#696b78');
    if (!unlocked) {
      card.classList.add('locked-character');
      card.disabled = true;
      card.setAttribute('aria-label', '잠긴 숨겨진 수호자. 여섯 번째 설화의 최종 보스를 처치하면 해금됩니다.');
      card.innerHTML = `
        <img src="${spriteUrl(`${character.id}.png`)}" alt="" aria-hidden="true">
        <strong>???</strong>
        <em>HIDDEN GUARDIAN</em>
        <span>여섯 번째 설화의 최종 보스를 처치하면 정체가 드러납니다.</span>
      `;
      ui.characterGrid.appendChild(card);
      return;
    }
    card.innerHTML = `
      <img src="${spriteUrl(`${character.id}.png`)}" alt="">
      <strong>${character.name}</strong>
      <em>${character.role}</em>
      <span>${character.description}</span>
    `;
    card.addEventListener('click', () => {
      audio.click();
      showCampaignIntro(character);
    });
    ui.characterGrid.appendChild(card);
  });
}

function showTitle() {
  audio.stopAllBgm(true);
  audio.startMenuBgm();
  pendingIntroCharacter = null;
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
  buildCharacterCards();
  ui.title.classList.remove('hidden');
}

document.getElementById('start-button').addEventListener('click', () => {
  audio.ensure();
  audio.startMenuBgm();
  audio.click();
  ui.title.classList.add('hidden');
  ui.characters.classList.remove('hidden');
});

document.getElementById('how-button').addEventListener('click', () => {
  audio.startMenuBgm();
  audio.click();
  ui.title.classList.add('hidden');
  ui.how.classList.remove('hidden');
});

document.getElementById('how-back').addEventListener('click', () => {
  audio.click();
  ui.how.classList.add('hidden');
  ui.title.classList.remove('hidden');
});

document.getElementById('settings-button').addEventListener('click', () => {
  audio.startMenuBgm();
  audio.click();
  ui.title.classList.add('hidden');
  ui.settings.classList.remove('hidden');
});

document.getElementById('settings-back').addEventListener('click', () => {
  audio.click();
  ui.settings.classList.add('hidden');
  ui.title.classList.remove('hidden');
});

document.getElementById('sound-button').addEventListener('click', event => {
  const muted = audio.toggleMute();
  event.currentTarget.textContent = `전체 소리: ${muted ? '꺼짐' : '켜짐'}`;
  if (!muted) {
    audio.startMenuBgm();
    audio.click();
  }
});

document.getElementById('selection-back').addEventListener('click', () => {
  audio.click();
  ui.characters.classList.add('hidden');
  ui.title.classList.remove('hidden');
});

ui.storyBack.addEventListener('click', () => {
  audio.click();
  pendingIntroCharacter = null;
  ui.story.classList.add('hidden');
  ui.characters.classList.remove('hidden');
});

ui.storyContinue.addEventListener('click', () => {
  audio.click();
  if (ui.story.dataset.mode === 'intro') {
    const character = pendingIntroCharacter;
    if (!character) return;
    pendingIntroCharacter = null;
    hideScreens();
    ui.hud.classList.remove('hidden');
    // 제출된 WAV 메뉴 음악을 멈추고 기존 인게임 음악과 효과음으로 전환한다.
    audio.stopMenuBgm(true);
    audio.startBgm();
    window.game.scene.start('GameScene', { character });
    return;
  }
  ui.story.classList.add('hidden');
  currentScene()?.resumeChapterBriefing();
});

ui.portalGo.addEventListener('click', () => {
  audio.click();
  currentScene()?.confirmPortalTransition();
});

ui.portalStay.addEventListener('click', () => {
  audio.click();
  currentScene()?.cancelPortalTransition();
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
    document.getElementById('sound-button').textContent = `전체 소리: ${muted ? '꺼짐' : '켜짐'}`;
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
    this.load.on('progress', progress => {
      updateMapLoadingScreen(progress, `한국 설화 지도를 불러오는 중… ${Math.round(progress * 100)}%`);
    });
    this.load.on('loaderror', file => {
      console.error(`게임 이미지 로드 실패: ${file?.key || file?.src || 'unknown'}`);
      if (String(file?.key || '').startsWith('chapter-background-')) {
        updateMapLoadingScreen(0, '맵 이미지를 다시 불러오는 중입니다…', true);
      }
    });
    Object.entries(EMBEDDED_TEXTURE_FILES).forEach(([key, fileName]) => {
      if (this.textures.exists(key)) return;
      const decodedImage = window.DECODED_SPRITES?.[fileName];
      if (decodedImage) this.textures.addImage(key, decodedImage);
      else this.load.image(key, remoteSpriteUrl(fileName));
    });
    CHAPTER_BACKGROUND_FILES.forEach((fileName, index) => {
      const key = chapterBackgroundKey(index);
      if (this.textures.exists(key)) return;
      const decodedImage = window.DECODED_BACKGROUNDS?.[fileName];
      if (decodedImage) this.textures.addImage(key, decodedImage);
      else this.load.image(key, chapterBackgroundUrl(fileName));
    });
  }

  create() {
    this.validateSpriteTextures();
    this.createWorld();
    this.createGeneratedTextures();

    this.enemies = this.physics.add.group();
    this.enemyProjectiles = this.physics.add.group();
    this.projectiles = this.physics.add.group();
    this.orbs = this.physics.add.group();
    this.chests = this.physics.add.group();
    this.portals = this.physics.add.group();
    this.orbitalGroup = this.physics.add.group();
    this.hazardZones = [];

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D');

    this.state = 'menu';
    this.elapsed = 0;
    this.kills = 0;
    this.pendingLevels = 0;
    this.pendingLevelChoices = [];
    this.pendingTreasureChoices = 0;
    this.nextAttackAt = 0;
    this.nextSpawnAt = 0;
    this.nextHazardAt = 7000;
    this.nextAreaPulseAt = 0;
    this.nextBossPatternAt = 0;
    this.lastHitAt = -Infinity;
    this.choiceInvulnerableUntil = -Infinity;
    this.choiceFreezeActive = false;
    this.pendingPortal = null;
    this.portalConfirmCooldownUntil = 0;
    this.lastHudAt = 0;
    this.lastRegenAt = 0;

    this.spawnEvent = this.time.addEvent({
      delay: 160,
      loop: true,
      callback: () => {
        if (this.state === 'running' && this.time.now >= this.nextSpawnAt) this.spawnWave();
      }
    });

    this.physics.add.overlap(this.projectiles, this.enemies, this.onProjectileHit, null, this);
    this.events.on('postupdate', this.updateChestPickups, this);

    this.events.once('shutdown', () => {
      this.events.off('postupdate', this.updateChestPickups, this);
      audio.stopBgm();
    });

    markGameReady(this);

    if (this.initialCharacter) {
      this.time.delayedCall(0, () => this.beginRun(this.initialCharacter));
    }
  }

  validateSpriteTextures() {
    const required = [
      ...CHARACTERS.map(character => character.id),
      'lantern',
      'treasure-chest',
      'enemy-dokkaebi',
      'enemy-gaksi',
      'enemy-jeoseung',
      ...CAMPAIGN.map(chapter => chapter.bossTexture),
      'device-brazier',
      'device-mist-stone',
      'device-golden-seal',
      'device-wind-totem',
      'device-moon-drum',
      'device-soul-well',
      ...CHAPTER_PROP_KEYS,
      'ground-forest',
      ...CHAPTER_BACKGROUND_FILES.map((fileName, index) => chapterBackgroundKey(index))
    ];
    this.missingSpriteKeys = required.filter(key => !this.textures.exists(key));
    if (this.missingSpriteKeys.length) {
      console.error('Required embedded sprites failed to load:', this.missingSpriteKeys.join(', '));
    }
    const highResolutionTextureKeys = [
      ...Object.keys(EMBEDDED_TEXTURE_FILES),
      ...CHAPTER_BACKGROUND_FILES.map((fileName, index) => chapterBackgroundKey(index))
    ];
    highResolutionTextureKeys.forEach(key => {
      if (!this.textures.exists(key)) return;
      const texture = this.textures.get(key);
      if (typeof texture.setFilter === 'function') texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    });
  }

  createWorld() {
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.setZoom(CAMERA_ZOOM);
    this.cameras.main.roundPixels = false;

    this.groundBase = this.add.rectangle(0, 0, WORLD_WIDTH, WORLD_HEIGHT, 0x263b2e)
      .setOrigin(0)
      .setDepth(-32);
    const initialBackgroundKey = this.textures.exists(chapterBackgroundKey(0)) ? chapterBackgroundKey(0) : 'ground-forest';
    this.chapterBackground = this.add.image(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, initialBackgroundKey)
      .setDepth(-31);
    this.ground = this.add.tileSprite(0, 0, WORLD_WIDTH, WORLD_HEIGHT, 'ground-forest')
      .setOrigin(0)
      .setDepth(-30);

    this.terrain = this.add.graphics().setDepth(-28);
    this.pathDetails = this.add.graphics().setDepth(-27);
    this.landmarks = this.add.graphics().setDepth(-24);
    this.scenery = this.add.graphics().setDepth(-22);
    this.applyChapterTheme(0);

    this.sun = this.add.circle(WIDTH - 90, 92, 30, 0xffefab)
      .setDepth(-5)
      .setScrollFactor(0)
      .setVisible(true);
    this.moon = this.add.circle(92, 92, 25, 0xdce8f3)
      .setDepth(-5)
      .setScrollFactor(0)
      .setAlpha(0)
      .setVisible(true);

    this.daylight = this.add.rectangle(0, 0, WORLD_WIDTH, WORLD_HEIGHT, 0xfff0c7, .04)
      .setOrigin(0)
      .setDepth(-6);

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

  applyChapterTheme(index) {
    const chapter = CAMPAIGN[index] || CAMPAIGN[0];
    this.groundBase.setFillStyle(chapter.ground, 1);
    const requestedBackgroundKey = chapterBackgroundKey(index);
    const backgroundKey = this.textures.exists(requestedBackgroundKey) ? requestedBackgroundKey : 'ground-forest';
    this.chapterBackground.setTexture(backgroundKey).setPosition(WORLD_WIDTH / 2, WORLD_HEIGHT / 2).setAlpha(1);
    this.chapterBackground.setDisplaySize(WORLD_WIDTH, WORLD_HEIGHT);
    // 원본 맵의 길, 건물, 수목 위를 덮던 생성형 타일과 장식층을 비운다.
    this.ground.setAlpha(0);
    this.terrain.clear();
    this.pathDetails.clear();
    this.landmarks.clear();
    this.scenery.clear();
    this.clearChapterProps();
    this.buildMapDevices(index, chapter);
  }

  drawChapterTerrain(index, chapter) {
    const terrain = this.terrain;
    const details = this.pathDetails;
    const pathShadow = Phaser.Display.Color.ValueToColor(chapter.path).darken(34).color;
    terrain.clear();
    details.clear();

    const drawRoute = (points, width, alpha = .43, color = chapter.path) => {
      terrain.lineStyle(width + 18, pathShadow, .22);
      terrain.beginPath().moveTo(points[0][0], points[0][1]);
      points.slice(1).forEach(([x, y]) => terrain.lineTo(x, y));
      terrain.strokePath();
      terrain.lineStyle(width, color, alpha);
      terrain.beginPath().moveTo(points[0][0], points[0][1]);
      points.slice(1).forEach(([x, y]) => terrain.lineTo(x, y));
      terrain.strokePath();
      terrain.lineStyle(3, chapter.accent, .24);
      terrain.beginPath().moveTo(points[0][0], points[0][1]);
      points.slice(1).forEach(([x, y]) => terrain.lineTo(x, y));
      terrain.strokePath();
    };

    if (index === 0) {
      // 도깨비 장터: 장방형 상점 구획과 중앙 흥정 마당
      terrain.fillStyle(chapter.path, .34).fillCircle(1200, 900, 285);
      terrain.lineStyle(10, 0x5a3225, .42).strokeCircle(1200, 900, 292);
      [510, 900, 1290].forEach(y => drawRoute([[-80, y], [2480, y]], y === 900 ? 164 : 104));
      [590, 1200, 1810].forEach(x => drawRoute([[x, -80], [x, 1880]], x === 1200 ? 132 : 88));
      details.lineStyle(2, 0x4d2d20, .38);
      for (let row = 0; row < 8; row += 1) {
        for (let col = 0; col < 11; col += 1) {
          const x = 110 + col * 218 + (row % 2) * 28;
          const y = 110 + row * 220;
          details.strokeRoundedRect(x, y, 118, 72, 12);
          details.lineStyle(2, chapter.accent, .18).lineBetween(x + 12, y + 58, x + 106, y + 58);
        }
      }
      for (let stone = 0; stone < 44; stone += 1) {
        const angle = stone / 44 * Math.PI * 2;
        details.fillStyle(stone % 3 ? 0xc69b62 : 0x6f4830, .22).fillCircle(1200 + Math.cos(angle) * (185 + stone % 4 * 18), 900 + Math.sin(angle) * (185 + stone % 4 * 18), 7 + stone % 5);
      }
    } else if (index === 1) {
      // 여우고개: 달빛 아래 굽이치는 고갯길과 환영 연못
      drawRoute([[-80,1510],[280,1350],[520,1110],[820,1190],[1080,920],[1360,1010],[1610,720],[1900,780],[2180,470],[2480,300]], 148, .46);
      drawRoute([[260,1880],[410,1530],[700,1370],[980,1080]], 86, .3);
      [[430,430,175],[920,520,115],[1530,1350,160],[2050,1180,120]].forEach(([x, y, radius], pool) => {
        terrain.fillStyle(pool % 2 ? 0x392a48 : 0x2c243e, .68).fillCircle(x, y, radius);
        terrain.lineStyle(5, 0xe9b8d0, .28).strokeCircle(x, y, radius - 9);
        terrain.lineStyle(2, chapter.accent, .34).strokeCircle(x, y, radius * .68);
      });
      for (let wisp = 0; wisp < 52; wisp += 1) {
        const x = 70 + (wisp * 181) % 2260;
        const y = 80 + (wisp * 317) % 1640;
        details.lineStyle(2, wisp % 2 ? 0xffb8d5 : 0xb28bc7, .28).beginPath().arc(x, y, 10 + wisp % 5 * 4, .2, Math.PI * 1.65).strokePath();
      }
    } else if (index === 2) {
      // 해치의 금문: 성벽, 사각 궁정, 금빛 수호선
      terrain.fillStyle(0x40382d, .48).fillRoundedRect(300, 210, 1800, 1380, 48);
      terrain.lineStyle(44, 0x3b3328, .9).strokeRoundedRect(300, 210, 1800, 1380, 48);
      terrain.lineStyle(7, 0xe4bd55, .48).strokeRoundedRect(330, 240, 1740, 1320, 38);
      drawRoute([[1200,-80],[1200,1880]], 188, .5);
      drawRoute([[-80,900],[2480,900]], 136, .39);
      [[300,210],[2100,210],[300,1590],[2100,1590]].forEach(([x, y]) => {
        terrain.fillStyle(0x5a4a31, .96).fillCircle(x, y, 82);
        terrain.lineStyle(8, 0xf0cf68, .5).strokeCircle(x, y, 70);
      });
      details.lineStyle(3, 0xe3c566, .28);
      for (let x = 430; x <= 1970; x += 140) {
        details.lineBetween(x, 250, x, 1550);
        for (let y = 280; y < 1540; y += 126) details.strokeRect(x - 52, y, 104, 62);
      }
      details.lineStyle(5, 0xffe797, .26).strokeCircle(1200, 900, 230).strokeCircle(1200, 900, 160);
    } else if (index === 3) {
      // 산군 봉우리: 능선을 오르는 지그재그 산길과 고도선
      drawRoute([[-100,1570],[360,1470],[620,1220],[980,1290],[1230,980],[1550,1050],[1810,740],[2170,790],[2500,520]], 128, .42);
      drawRoute([[120,-80],[360,250],[720,340],[940,600],[1280,520],[1510,760]], 78, .29);
      for (let ridge = 0; ridge < 12; ridge += 1) {
        const x = 100 + ridge * 205;
        const y = ridge % 2 ? 250 : 1540;
        terrain.fillStyle(ridge % 2 ? 0x314b39 : 0x273f32, .7).fillTriangle(x - 135, y + 110, x, y - 125 - ridge % 3 * 24, x + 135, y + 110);
        terrain.lineStyle(4, 0x9bc989, .22).lineBetween(x - 48, y - 34, x, y - 125 - ridge % 3 * 24).lineBetween(x, y - 125 - ridge % 3 * 24, x + 44, y - 42);
      }
      for (let contour = 0; contour < 30; contour += 1) {
        const x = 90 + (contour * 269) % 2200;
        const y = 100 + (contour * 173) % 1600;
        details.lineStyle(2, contour % 2 ? 0xb0d29a : chapter.accent, .2).strokeCircle(x, y, 34 + contour % 5 * 17);
      }
    } else if (index === 4) {
      // 처용의 달궁: 대칭 궁정, 월륜 무대, 기와 회랑
      terrain.fillStyle(0x332942, .62).fillRoundedRect(250, 180, 1900, 1440, 72);
      terrain.lineStyle(34, 0x251d32, .82).strokeRoundedRect(250, 180, 1900, 1440, 72);
      terrain.lineStyle(6, 0x8fc8d5, .35).strokeRoundedRect(285, 215, 1830, 1370, 58);
      drawRoute([[1200,-80],[1200,1880]], 154, .38);
      drawRoute([[-80,900],[2480,900]], 118, .3);
      terrain.fillStyle(0x211a31, .85).fillCircle(1200, 900, 340);
      terrain.lineStyle(12, chapter.accent, .38).strokeCircle(1200, 900, 316);
      terrain.lineStyle(4, 0xd6c2f1, .42).strokeCircle(1200, 900, 236).strokeCircle(1200, 900, 138);
      for (let ray = 0; ray < 16; ray += 1) {
        const angle = ray / 16 * Math.PI * 2;
        details.lineStyle(ray % 2 ? 2 : 5, ray % 2 ? 0x8ec8d5 : 0xc791df, .26).lineBetween(1200 + Math.cos(angle) * 150, 900 + Math.sin(angle) * 150, 1200 + Math.cos(angle) * 305, 900 + Math.sin(angle) * 305);
      }
      for (let tile = 0; tile < 36; tile += 1) {
        const x = 330 + (tile % 9) * 218;
        const y = tile < 18 ? 255 + Math.floor(tile / 9) * 112 : 1430 + Math.floor((tile - 18) / 9) * 86;
        details.lineStyle(3, 0x9bcbd4, .22).strokeRoundedRect(x, y, 142, 54, 18);
      }
    } else {
      // 바리의 저승꽃길: 삼도천, 비스듬한 혼의 길, 저승 징검돌
      terrain.lineStyle(250, 0x18283f, .84);
      terrain.beginPath().moveTo(-100, 410).lineTo(360, 520).lineTo(770, 390).lineTo(1190, 540).lineTo(1620, 400).lineTo(2020, 530).lineTo(2500, 430).strokePath();
      terrain.lineStyle(8, 0x78b9ff, .28);
      terrain.beginPath().moveTo(-100, 410).lineTo(360, 520).lineTo(770, 390).lineTo(1190, 540).lineTo(1620, 400).lineTo(2020, 530).lineTo(2500, 430).strokePath();
      drawRoute([[-120,1640],[300,1490],[610,1260],[940,1320],[1210,1050],[1510,1110],[1820,850],[2130,900],[2500,700]], 138, .42, 0x60627d);
      for (let stone = 0; stone < 25; stone += 1) {
        const x = 40 + stone * 102;
        const y = 450 + Math.sin(stone * .8) * 62;
        terrain.fillStyle(stone % 2 ? 0x58677e : 0x3f4f69, .88).fillRoundedRect(x - 26, y - 13, 52, 27, 8);
        details.lineStyle(2, 0xa9d7ff, .28).strokeRoundedRect(x - 24, y - 11, 48, 23, 7);
      }
      for (let rune = 0; rune < 38; rune += 1) {
        const x = 90 + (rune * 233) % 2210;
        const y = 650 + (rune * 167) % 1040;
        details.lineStyle(2, rune % 2 ? 0x91c9ff : 0xa88cdf, .25).strokeCircle(x, y, 16 + rune % 4 * 6);
        details.lineBetween(x - 10, y, x + 10, y).lineBetween(x, y - 10, x, y + 10);
      }
    }
  }

  drawChapterScenery(index, chapter) {
    const graphics = this.scenery;
    graphics.clear();
    const detailColor = Phaser.Display.Color.ValueToColor(chapter.accent).darken(26).color;
    for (let marker = 0; marker < 96; marker += 1) {
      const x = 44 + (marker * 197 + index * 83) % (WORLD_WIDTH - 88);
      const y = 36 + (marker * 113 + index * 157) % (WORLD_HEIGHT - 72);
      const size = 2 + marker % 4;
      graphics.fillStyle(marker % 3 ? detailColor : chapter.accent, .2 + marker % 4 * .04).fillCircle(x, y, size);
      if (marker % 7 === 0) graphics.lineStyle(2, chapter.accent, .18).lineBetween(x - 9, y + 5, x + 10, y - 6);
    }

    if (index === 0) {
      // 장터의 포목 좌판, 깃발, 돌등과 불씨 자국
      [[420,330],[770,1450],[1740,350],[2020,1280]].forEach(([x, y], stall) => {
        const roof = stall % 2 ? 0x293534 : 0x303431;
        const wood = stall % 2 ? 0x593b2a : 0x66412c;
        const paper = stall % 2 ? 0xd8d0b2 : 0xe2d6b5;

        // 조선 장터의 기와 행랑: 석단, 툇마루와 한지 격자문
        graphics.fillStyle(0x2c2923, .44).fillEllipse(x, y + 53, 158, 25);
        graphics.fillStyle(0x776c58, .8).fillRoundedRect(x - 67, y + 40, 134, 12, 3);
        graphics.fillStyle(0x3d2a20, .98).fillRect(x - 59, y - 20, 118, 64);
        graphics.fillStyle(paper, .9).fillRect(x - 46, y - 10, 92, 42);
        graphics.fillStyle(wood, 1).fillRect(x - 62, y - 28, 8, 76).fillRect(x + 54, y - 28, 8, 76);
        graphics.fillRect(x - 54, y - 17, 108, 7).fillRect(x - 54, y + 33, 108, 7);
        graphics.lineStyle(3, wood, .9);
        [-28, 0, 28].forEach(offset => graphics.lineBetween(x + offset, y - 10, x + offset, y + 32));
        graphics.lineBetween(x - 46, y + 10, x + 46, y + 10);

        // 검은 기와와 위로 들린 처마선
        graphics.fillStyle(0x181d1d, .98).fillTriangle(x - 76, y - 23, x, y - 72, x + 76, y - 23);
        graphics.fillStyle(roof, 1).fillTriangle(x - 68, y - 27, x, y - 66, x + 68, y - 27);
        graphics.fillStyle(0x141919, 1).fillRoundedRect(x - 79, y - 28, 158, 9, 4);
        graphics.lineStyle(2, 0x66706a, .62);
        for (let tile = -54; tile <= 54; tile += 18) graphics.lineBetween(x + tile, y - 30, x + tile * .5, y - 62);
        for (let tile = -63; tile <= 63; tile += 14) graphics.strokeCircle(x + tile, y - 24, 5);
        graphics.lineStyle(4, 0x252322, 1).lineBetween(x - 12, y - 69, x + 12, y - 69);

        // 행랑 옆 옹기와 낮은 포목 좌판
        const side = stall % 2 ? -1 : 1;
        graphics.fillStyle(0x6b3d25, .96).fillEllipse(x + side * 72, y + 35, 18, 23);
        graphics.fillStyle(0x33251d, .9).fillEllipse(x + side * 72, y + 25, 13, 5);
        graphics.fillStyle(stall % 2 ? 0x755849 : 0x7b3340, .88).fillRect(x - side * 70 - 18, y + 36, 35, 8);
      });
      for (let stone = 0; stone < 22; stone += 1) {
        const x = 110 + stone * 103;
        graphics.fillStyle(0x4c3023, .4).fillRoundedRect(x, 845 + (stone % 2) * 48, 42, 24, 8);
      }
    } else if (index === 1) {
      // 여우 발자국, 달문과 층층이 번지는 환영 연못
      [[380,440],[1980,520],[510,1370],[1890,1390]].forEach(([x, y]) => {
        graphics.lineStyle(7, 0xf4c6dc, .55).strokeCircle(x, y, 58);
        graphics.lineStyle(3, chapter.accent, .7).strokeCircle(x, y, 44);
        graphics.fillStyle(0x2b2034, .8).fillRect(x - 62, y + 52, 124, 14);
      });
      for (let paw = 0; paw < 28; paw += 1) {
        const x = 180 + paw * 74;
        const y = 820 + Math.sin(paw * .7) * 165;
        graphics.fillStyle(0xffb1ce, .35).fillCircle(x, y, 7).fillCircle(x - 7, y - 9, 3).fillCircle(x + 1, y - 12, 3).fillCircle(x + 8, y - 7, 3);
      }
    } else if (index === 2) {
      // 금문 성벽, 금속 광맥, 해치 인장이 새겨진 석판
      for (let block = 0; block < 18; block += 1) {
        const x = 70 + block * 132;
        graphics.fillStyle(0x3d3428, .7).fillRect(x, block % 2 ? 190 : 1530, 104, 48);
        graphics.lineStyle(3, 0xc9a844, .6).strokeRect(x, block % 2 ? 190 : 1530, 104, 48);
      }
      [[420,530],[1980,510],[430,1290],[1980,1270]].forEach(([x, y]) => {
        graphics.fillStyle(0x54472f, .9).fillRoundedRect(x - 54, y - 46, 108, 92, 10);
        graphics.lineStyle(5, 0xffd66f, .72).strokeCircle(x, y, 30);
        graphics.lineStyle(3, 0xffe7a0, .6).lineBetween(x - 26, y, x + 26, y).lineBetween(x, y - 26, x, y + 26);
      });
      for (let vein = 0; vein < 16; vein += 1) {
        const x = 150 + vein * 142;
        const y = 520 + (vein * 271) % 770;
        graphics.lineStyle(4, vein % 2 ? 0xe4bd55 : 0x95a4a9, .42).lineBetween(x - 25, y + 18, x, y - 14).lineBetween(x, y - 14, x + 31, y + 7);
      }
    } else if (index === 3) {
      // 겹봉우리, 소나무 숲, 금줄이 둘러진 산신 돌탑
      for (let peak = 0; peak < 14; peak += 1) {
        const x = 80 + peak * 178;
        const y = peak % 2 ? 260 : 1510;
        graphics.fillStyle(0x294537, .72).fillTriangle(x - 82, y + 56, x, y - 76, x + 82, y + 56);
        graphics.lineStyle(3, 0xa7d58e, .32).lineBetween(x - 32, y - 25, x, y - 76).lineBetween(x, y - 76, x + 24, y - 36);
      }
      [[350,520],[2050,480],[420,1320],[1980,1330]].forEach(([x, y]) => {
        for (let tier = 0; tier < 4; tier += 1) graphics.fillStyle(0x40564b, .95).fillRoundedRect(x - 34 + tier * 7, y + 25 - tier * 19, 68 - tier * 14, 18, 5);
        graphics.lineStyle(4, 0xe6cf86, .65).strokeCircle(x, y - 45, 38);
      });
    } else if (index === 4) {
      // 달궁 기와, 처용 가면, 북과 춤선이 이어지는 궁정
      for (let tile = 0; tile < 24; tile += 1) {
        const x = 60 + tile * 98;
        graphics.fillStyle(tile % 2 ? 0x302642 : 0x443252, .72).fillRoundedRect(x, tile % 3 ? 220 : 1500, 76, 32, 12);
        graphics.lineStyle(2, 0x8bbbc8, .38).strokeRoundedRect(x, tile % 3 ? 220 : 1500, 76, 32, 12);
      }
      [[360,470],[2030,470],[390,1340],[2010,1340]].forEach(([x, y]) => {
        graphics.fillStyle(0x21182e, .88).fillCircle(x, y, 54);
        graphics.lineStyle(5, 0x77dbe6, .58).strokeCircle(x, y, 54);
        graphics.fillStyle(0xe1c1ef, .72).fillCircle(x - 17, y - 10, 9).fillCircle(x + 17, y - 10, 9);
        graphics.lineStyle(5, 0xb97aca, .7).beginPath().arc(x, y + 5, 27, .2, Math.PI - .2).strokePath();
      });
    } else {
      // 삼도천 돌길, 명부 석등, 피어나는 저승꽃 무리
      graphics.lineStyle(26, 0x263b58, .5).beginPath().moveTo(0, 420).lineTo(420, 510).lineTo(820, 420).lineTo(1240, 520).lineTo(1700, 420).lineTo(WORLD_WIDTH, 510).strokePath();
      graphics.lineStyle(4, 0x89c5ff, .3).beginPath().moveTo(0, 420).lineTo(420, 510).lineTo(820, 420).lineTo(1240, 520).lineTo(1700, 420).lineTo(WORLD_WIDTH, 510).strokePath();
      [[330,700],[2070,690],[430,1360],[1940,1370]].forEach(([x, y]) => {
        graphics.fillStyle(0x171e31, .92).fillRoundedRect(x - 32, y - 42, 64, 84, 12);
        graphics.lineStyle(4, 0x79b8ee, .65).strokeRect(x - 22, y - 30, 44, 42);
        graphics.fillStyle(0xb7e1ff, .55).fillCircle(x, y - 10, 13);
      });
      for (let flower = 0; flower < 34; flower += 1) {
        const x = 90 + (flower * 211) % 2200;
        const y = 620 + (flower * 139) % 980;
        for (let petal = 0; petal < 5; petal += 1) {
          const angle = petal / 5 * Math.PI * 2;
          graphics.fillStyle(0x7cbaff, .36).fillCircle(x + Math.cos(angle) * 8, y + Math.sin(angle) * 8, 5);
        }
      }
    }
  }

  clearChapterProps() {
    (this.chapterPropObjects || []).forEach(object => {
      if (!object) return;
      this.tweens.killTweensOf(object);
      object.destroy();
    });
    this.chapterPropObjects = [];
  }

  buildChapterProps(index, chapter) {
    this.clearChapterProps();
    // 큰 설화 기물은 배경의 장터·문·석탑·가면·석등과 겹치지 않는 전용 구역에 둔다.
    const layouts = [
      [
        [250,650,202,false],[2150,670,186,true],[300,1120,190,true],
        [2100,980,210,false],[930,260,158,true],[1480,1530,166,false]
      ],
      [
        [720,300,190,false],[1620,320,184,true],[260,900,176,true],
        [2140,930,202,false],[900,1500,156,false],[1500,1550,164,true]
      ],
      [
        [300,840,228,false],[2100,850,218,true],[750,560,210,true],
        [1650,560,232,false],[760,1240,176,true],[1650,1240,180,false]
      ],
      [
        [700,600,192,false],[1700,610,184,true],[280,900,202,true],
        [2120,900,194,false],[800,1190,158,true],[1580,1180,170,false]
      ],
      [
        [760,520,214,false],[1640,520,204,true],[280,900,196,true],
        [2120,900,220,false],[820,1180,166,true],[1580,1180,174,false]
      ],
      [
        [740,260,204,false],[1640,260,194,true],[850,850,190,true],
        [1550,850,214,false],[800,1530,162,true],[1570,1530,178,false]
      ]
    ];
    const propKey = CHAPTER_PROP_KEYS[index] || CHAPTER_PROP_KEYS[0];
    const mystical = index === 1 || index === 4 || index === 5;

    (layouts[index] || layouts[0]).forEach(([x, y, size, flipped], order) => {
      const glow = this.add.ellipse(x, y + size * .08, size * .76, size * .52, chapter.accent, mystical ? .075 : .035)
        .setDepth(7 + Math.floor(y / 650));
      const shadow = this.add.ellipse(x, y + size * .33, size * .64, size * .15, 0x030407, .35)
        .setDepth(8 + Math.floor(y / 650));
      const prop = this.add.image(x, y, propKey)
        .setDisplaySize(size, size)
        .setFlipX(flipped)
        .setDepth(9 + Math.floor(y / 650));
      this.chapterPropObjects.push(glow, shadow, prop);
      if (mystical) {
        this.tweens.add({
          targets: glow,
          alpha: glow.alpha * 2.1,
          scaleX: 1.1,
          scaleY: 1.1,
          yoyo: true,
          repeat: -1,
          duration: 1250 + order * 90,
          ease: 'Sine.easeInOut'
        });
      }
    });
  }

  clearMapDevices() {
    (this.mapDeviceObjects || []).forEach(object => {
      if (!object) return;
      this.tweens.killTweensOf(object);
      object.destroy();
    });
    this.mapDeviceObjects = [];
    this.mapDevices = [];
  }

  buildMapDevices(index, chapter) {
    this.clearMapDevices();
    const sourcePositions = [
      [[820,650],[1580,1150],[520,1230]],
      [[640,650],[1780,640],[1670,1320]],
      [[740,610],[1660,610],[1200,1320]],
      [[650,670],[1760,720],[1530,1320]],
      [[690,650],[1710,650],[1200,1370]],
      [[620,690],[1780,690],[1550,1330]]
    ][index];
    const positions = sourcePositions.map(([x, y]) => [x / 2400 * WORLD_WIDTH, y / 1800 * WORLD_HEIGHT]);
    const types = ['brazier', 'mist', 'seal', 'windTotem', 'moonDrum', 'soulWell'];
    const spriteKeys = ['device-brazier', 'device-mist-stone', 'device-golden-seal', 'device-wind-totem', 'device-moon-drum', 'device-soul-well'];
    const spriteSizes = [118, 126, 132, 124, 126, 128];
    const radii = [112, 132, 158, 150, 128, 122];
    const colors = [0xff7a32, 0xff7ba8, 0xffd55f, 0xa8e4c2, 0x76dce7, 0x84bfff];
    positions.forEach(([x, y], order) => {
      const color = colors[index];
      const radius = radii[index];
      const aura = this.add.circle(x, y, radius, color, index === 1 ? .1 : .055).setStrokeStyle(3, color, .28).setDepth(11).setVisible(false).setAlpha(0);
      const core = this.add.image(x, y, spriteKeys[index]).setDisplaySize(spriteSizes[index], spriteSizes[index]).setDepth(13);
      core.setData('baseScaleX', core.scaleX);
      core.setData('baseScaleY', core.scaleY);
      const sigil = this.add.graphics({ x, y }).setDepth(12).setVisible(false).setAlpha(0);
      sigil.lineStyle(3, color, .82).strokeCircle(0, 0, 40 + index * 3);
      for (let ray = 0; ray < 8; ray += 1) {
        const angle = ray / 8 * Math.PI * 2;
        sigil.lineBetween(Math.cos(angle) * 30, Math.sin(angle) * 30, Math.cos(angle) * 48, Math.sin(angle) * 48);
      }
      if (index === 0) {
        sigil.fillStyle(0xffc04e, .9).fillTriangle(-13, 14, 0, -30, 13, 14).fillTriangle(-20, 16, -8, -13, 0, 18);
      } else if (index === 1) {
        sigil.lineStyle(5, 0xffbfd7, .82).beginPath().arc(0, 3, 28, -.4, Math.PI + .4).strokePath();
      } else if (index === 2) {
        sigil.lineStyle(4, 0xffe7a0, .86).lineBetween(-28, 0, 28, 0).lineBetween(0, -28, 0, 28);
      } else if (index === 3) {
        sigil.lineStyle(4, 0xd5f8e4, .82).beginPath().arc(0, 0, 28, -.8, 1.7).strokePath();
      } else if (index === 4) {
        sigil.fillStyle(0xe9d7ff, .65).fillCircle(-10, -5, 6).fillCircle(10, -5, 6);
      } else {
        sigil.lineStyle(4, 0xb5e3ff, .8).strokeCircle(0, 0, 18).strokeCircle(0, 0, 31);
      }
      const label = this.add.text(x, y + radius + 10, order === 0 ? chapter.deviceName : '', {
        fontFamily: '"Malgun Gothic", sans-serif', fontSize: '13px', fontStyle: 'bold', color: '#fff1c9', stroke: '#17131d', strokeThickness: 4
      }).setOrigin(.5).setDepth(14);
      this.mapDeviceObjects.push(aura, core, sigil, label);
      this.mapDevices.push({ type: types[index], x, y, radius, color, aura, core, sigil, activeUntil: 0, nextPulse: this.time.now + 2600 + order * 950, order });
    });
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
      graphics.fillStyle(HOSTILE_ATTACK_COLOR, .34);
      graphics.fillCircle(8, 8, 8);
      graphics.fillStyle(HOSTILE_ATTACK_DARK, 1);
      graphics.fillCircle(8, 8, 6);
      graphics.fillStyle(0xff5264, 1);
      graphics.fillCircle(8, 8, 5);
      graphics.fillStyle(0xffd2a1, 1);
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

    const textureBuilders = {
      'foxfire': graphics => {
        graphics.fillStyle(0xff5b6f, .35).fillCircle(12, 12, 11);
        graphics.fillStyle(0xffa0b0, 1).fillCircle(12, 12, 7);
        graphics.fillStyle(0xffffff, 1).fillCircle(10, 9, 3);
      },
      'arrow': graphics => {
        graphics.fillStyle(0xf5e2aa, 1).fillTriangle(28, 8, 18, 2, 18, 14);
        graphics.fillStyle(0x7a4b27, 1).fillRect(2, 6, 20, 4);
        graphics.fillStyle(0x9bd56b, 1).fillTriangle(5, 8, 0, 1, 1, 8).fillTriangle(5, 8, 0, 15, 1, 8);
      },
      'dance-blade': graphics => {
        graphics.fillStyle(0xe4d8ff, 1).fillTriangle(22, 3, 18, 20, 10, 12);
        graphics.fillStyle(0x8f62d0, 1).fillCircle(9, 14, 5);
        graphics.fillStyle(0xffd26f, 1).fillRect(4, 13, 8, 3);
      },
      'spirit-bloom': graphics => {
        for (let petal = 0; petal < 6; petal += 1) {
          const angle = petal / 6 * Math.PI * 2;
          graphics.fillStyle(0xa7d8ff, .9).fillCircle(12 + Math.cos(angle) * 6, 12 + Math.sin(angle) * 6, 5);
        }
        graphics.fillStyle(0xffffff, 1).fillCircle(12, 12, 4);
      },
      'orbit-talisman': graphics => {
        graphics.fillStyle(0xffefb0, 1).fillRect(5, 1, 14, 22);
        graphics.lineStyle(2, 0xbd3434, 1).strokeRect(5, 1, 14, 22);
        graphics.lineStyle(2, 0x74313a, 1).lineBetween(9, 6, 15, 17).lineBetween(15, 6, 9, 17);
      },
      'portal': graphics => {
        graphics.fillStyle(0x63b7ff, .18).fillCircle(32, 32, 31);
        graphics.lineStyle(7, 0xa7ddff, .92).strokeCircle(32, 32, 25);
        graphics.lineStyle(3, 0x6d55d8, 1).strokeCircle(32, 32, 15);
        graphics.fillStyle(0x1f164d, .85).fillCircle(32, 32, 11);
      }
    };
    Object.entries(textureBuilders).forEach(([key, draw]) => {
      if (this.textures.exists(key)) return;
      const graphics = this.make.graphics({ add: false });
      draw(graphics);
      const sizes = { arrow: [30, 16], 'dance-blade': [24, 24], portal: [64, 64] };
      const [width, height] = sizes[key] || [24, 24];
      graphics.generateTexture(key, width, height);
      graphics.destroy();
    });

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
    if (!this.textures.exists(character?.id)) {
      showTitle();
      showToast('선택한 수호자 이미지를 불러오지 못했습니다. Ctrl+F5로 새로고침해 주세요.', 5000);
      return;
    }
    if (!isCharacterUnlocked(character)) {
      showTitle();
      showToast('숨겨진 수호자는 여섯 번째 설화의 최종 보스를 처치한 뒤 선택할 수 있습니다.', 4200);
      return;
    }
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
      pickupSpeed: 1,
      projectiles: base.projectiles || 1,
      projectileSpeed: 1,
      projectileSize: 1,
      areaScale: 1,
      knockback: 24,
      contactGuard: 0,
      bossDamage: 0,
      frost: 0,
      burn: 0,
      lightning: 0,
      ricochet: 0,
      orbitals: 0,
      areaPulse: 0
    };
    this.level = 1;
    this.xp = 0;
    this.xpNeeded = experienceRequired(this.level);
    this.elapsed = 0;
    this.kills = 0;
    this.pendingLevels = 0;
    this.pendingLevelChoices = [];
    this.pendingTreasureChoices = 0;
    this.chapterIndex = 0;
    this.chapterKills = 0;
    this.totalElapsed = 0;
    this.bossSpawned = false;
    this.bossDefeated = false;
    this.bossSpawnElapsed = null;
    this.midBossesSpawned = 0;
    this.bossExperienceCollectionActive = false;
    this.sejongUnlockedThisRun = false;
    this.lastBossOrbAudioAt = 0;
    this.treasureRewardKeys = new Set();
    this.lastTreasureSpawnAt = -Infinity;
    this.lastTreasurePosition = null;
    this.choiceInvulnerableUntil = -Infinity;
    this.choiceFreezeActive = false;
    this.pendingPortal = null;
    this.portalConfirmCooldownUntil = 0;
    this.activeBoss = null;
    this.attackSequence = 0;
    this.nextSpawnAt = this.time.now + 1200;
    this.nextHazardAt = this.time.now + 7000;
    this.nextAreaPulseAt = this.time.now + 4000;
    this.nextAmbientAt = this.time.now;
    this.mapGuard = 0;
    this.state = 'running';

    this.player = this.physics.add.sprite(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, character.id)
      .setDisplaySize(PLAYER_DISPLAY_SIZE, PLAYER_DISPLAY_SIZE)
      .setDepth(30)
      .setCollideWorldBounds(true);
    // 큰 캐릭터 그림과 별개로 충돌 범위는 몸통 중심에 작게 유지한다.
    this.player.body.setCircle(54, 74, 108);
    this.player.setData('baseScaleX', this.player.scaleX);
    this.player.setData('baseScaleY', this.player.scaleY);
    this.player.setData('spriteFacesLeft', Boolean(character.spriteFacesLeft));
    this.player.setData('facingDirection', 1);
    this.player.setFlipX(Boolean(character.spriteFacesLeft));
    this.lastChestCheckPosition = { x: this.player.x, y: this.player.y };
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
    this.playerPortalOverlap = this.physics.add.overlap(this.player, this.portals, this.enterPortal, null, this);

    hideScreens();
    ui.hud.classList.remove('hidden');
    ui.hudPortrait.src = spriteUrl(`${character.id}.png`);
    ui.hudPortrait.alt = `${character.name} 초상화`;
    ui.heroName.textContent = `${character.name} · ${character.role}`;
    ui.bossPanel.classList.add('hidden');
    this.applyChapterTheme(this.chapterIndex);
    this.updateChapterHud();
    this.resetPauseCopy();
    this.updateHud();
    audio.setNight(false);
    audio.startBgm();
    showToast(`설화 1 · ${CAMPAIGN[0].story} 지형 장치: ${CAMPAIGN[0].deviceName}`, 5000);
  }

  update(time, delta) {
    if (this.state !== 'running' || !this.player?.active) return;

    const deltaSeconds = delta / 1000;
    this.elapsed += deltaSeconds;
    this.totalElapsed += deltaSeconds;

    this.updateMovement();
    this.updateMapDevices(time, deltaSeconds);
    this.updateAmbientScenery(time);
    this.updateDayNight();
    this.updateEnemiesAndPickups(deltaSeconds);
    this.reconcileBossExperienceCollection();
    if (this.state !== 'running' || this.processPendingChoiceQueue()) return;
    this.updateSecondaryWeapons(time);
    this.updateStageHazards(time);

    if (this.midBossesSpawned < MID_BOSS_TIMES.length && this.elapsed >= MID_BOSS_TIMES[this.midBossesSpawned] && !this.bossSpawned) {
      this.spawnMidBoss(this.midBossesSpawned);
      this.midBossesSpawned += 1;
    }
    if (this.elapsed >= NIGHT_START && !this.bossSpawned) this.spawnBoss();

    if (time >= this.nextAttackAt) {
      this.autoAttack();
      this.nextAttackAt = time + this.stats.attackDelay;
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
    if (horizontal !== 0) {
      const facingDirection = Math.sign(horizontal);
      const spriteFacesLeft = this.player.getData('spriteFacesLeft') === true;
      this.player.setData('facingDirection', facingDirection);
      this.player.setFlipX(spriteFacesLeft ? facingDirection > 0 : facingDirection < 0);
    }

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

  updateMapDevices(time, deltaSeconds) {
    this.mapGuard = 0;
    (this.mapDevices || []).forEach(device => {
      if (!device.core?.active) return;
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, device.x, device.y);
      const effectActive = time < device.activeUntil;
      device.core.setScale(device.core.getData('baseScaleX'), device.core.getData('baseScaleY'));

      if (effectActive && device.type === 'mist' && distance <= device.radius) {
        this.player.setVelocity(this.player.body.velocity.x * .72, this.player.body.velocity.y * .72);
      } else if (effectActive && device.type === 'moonDrum' && distance <= device.radius) {
        this.mapGuard = Math.max(this.mapGuard, .35);
        this.stats.hp = Math.min(this.stats.maxHP, this.stats.hp + deltaSeconds * .35);
      } else if (effectActive && device.type === 'soulWell' && distance <= device.radius) {
        this.stats.hp = Math.min(this.stats.maxHP, this.stats.hp + deltaSeconds * 1.15);
      }

      if (time < device.nextPulse || this.bossDefeated) return;
      const delays = { brazier: 4900, mist: 5200, seal: 4700, windTotem: 4500, moonDrum: 4800, soulWell: 6200 };
      device.nextPulse = time + delays[device.type];
      this.triggerMapDevice(device);
    });
  }

  triggerMapDevice(device) {
    if (!device?.core?.active || this.state !== 'running') return;
    const { x, y, radius, color, type } = device;
    const activeDurations = { brazier: 1150, mist: 1450, seal: 900, windTotem: 950, moonDrum: 1650, soulWell: 1700 };
    const activeDuration = activeDurations[type] || 1000;
    device.activeUntil = this.time.now + activeDuration;
    this.showMapDeviceEffect(device, activeDuration);
    this.createDevicePulse(x, y, color, radius);

    if (type === 'brazier') {
      const warning = this.add.circle(x, y, radius, 0xff5a2e, .1).setStrokeStyle(5, 0xffb653, .9).setDepth(21);
      this.tweens.add({ targets: warning, scaleX: .42, scaleY: .42, alpha: .8, duration: 650 });
      this.time.delayedCall(660, () => {
        warning.destroy();
        if (!device.core?.active || this.state !== 'running') return;
        this.createImpactBurst(x, y, 0xff7938, radius);
        this.createGroundCracks(x, y, 0xffb04c, radius * .9);
        if (Phaser.Math.Distance.Between(this.player.x, this.player.y, x, y) <= radius + 18) this.takePlayerDamage(7 + this.chapterIndex, x, y);
        this.enemies.getChildren().filter(enemy => enemy.active && Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y) <= radius).forEach(enemy => {
          this.damageEnemy(enemy, 24 + this.level * 1.4, { color: 0xff8138, knockback: 72 });
        });
        audio.impact(true);
      });
    } else if (type === 'mist') {
      const wisps = 3 + Math.floor(this.elapsed / 24);
      for (let count = 0; count < wisps; count += 1) this.spawnEnemy(count === 0 && this.elapsed >= SUNSET_START);
      for (let mote = 0; mote < 10; mote += 1) {
        const angle = mote / 10 * Math.PI * 2;
        const wisp = this.add.circle(x + Math.cos(angle) * 35, y + Math.sin(angle) * 35, 8, 0xff9fc4, .5).setDepth(22);
        this.tweens.add({ targets: wisp, x: x + Math.cos(angle) * radius, y: y + Math.sin(angle) * radius, alpha: 0, duration: 620, onComplete: () => wisp.destroy() });
      }
      audio.tone(680, .28, 'sine', .035);
    } else if (type === 'seal') {
      this.enemies.getChildren().filter(enemy => enemy.active && Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y) <= radius + 34).forEach(enemy => {
        this.damageEnemy(enemy, 20 + this.level * 1.15, { color: 0xffda69, knockback: 145 });
      });
      this.createGroundCracks(x, y, 0xffe291, radius * .72);
      audio.tone(210, .3, 'triangle', .045);
      audio.tone(420, .34, 'sine', .026, .04);
    } else if (type === 'windTotem') {
      const angle = (device.order * 2.15 + this.elapsed * .08) % (Math.PI * 2);
      this.createWindSweep(x, y, angle, radius * 1.75, 0xc8f5db);
      if (Phaser.Math.Distance.Between(this.player.x, this.player.y, x, y) <= radius * 1.55) {
        this.player.setVelocity(this.player.body.velocity.x + Math.cos(angle) * 310, this.player.body.velocity.y + Math.sin(angle) * 310);
      }
      audio.tone(240, .36, 'sine', .03);
    } else if (type === 'moonDrum') {
      this.hazardZones = this.hazardZones.filter(zone => {
        if (Phaser.Math.Distance.Between(x, y, zone.x, zone.y) > radius * 1.55) return true;
        zone.visual?.destroy();
        zone.rune?.destroy();
        return false;
      });
      if (Phaser.Math.Distance.Between(this.player.x, this.player.y, x, y) <= radius * 1.25) this.stats.hp = Math.min(this.stats.maxHP, this.stats.hp + 4);
      audio.tone(145, .4, 'triangle', .055);
      audio.tone(290, .45, 'sine', .03, .08);
    } else if (type === 'soulWell') {
      if (Phaser.Math.Distance.Between(this.player.x, this.player.y, x, y) <= radius * 1.35) this.stats.hp = Math.min(this.stats.maxHP, this.stats.hp + 7);
      this.spawnEnemy(true);
      for (let soul = 0; soul < 7; soul += 1) {
        const angle = soul / 7 * Math.PI * 2;
        const mote = this.add.circle(x, y, 6, 0xbde8ff, .72).setDepth(23);
        this.tweens.add({ targets: mote, x: x + Math.cos(angle) * radius, y: y + Math.sin(angle) * radius - 32, alpha: 0, duration: 780, onComplete: () => mote.destroy() });
      }
      audio.tone(330, .42, 'sine', .035);
    }
  }

  showMapDeviceEffect(device, duration) {
    const { aura, sigil, order } = device;
    if (!aura?.active || !sigil?.active) return;
    this.tweens.killTweensOf(aura);
    this.tweens.killTweensOf(sigil);
    aura.setVisible(true).setAlpha(.22).setScale(.76);
    sigil.setVisible(true).setAlpha(.88).setAngle(0).setScale(.84);
    this.tweens.add({
      targets: aura,
      scaleX: 1.08,
      scaleY: 1.08,
      alpha: 0,
      duration,
      ease: 'Cubic.easeOut',
      onComplete: () => aura.active && aura.setVisible(false)
    });
    this.tweens.add({
      targets: sigil,
      angle: order % 2 ? -150 : 150,
      scaleX: 1.08,
      scaleY: 1.08,
      alpha: 0,
      duration,
      ease: 'Sine.easeInOut',
      onComplete: () => sigil.active && sigil.setVisible(false)
    });
  }

  createDevicePulse(x, y, color, radius) {
    const outer = this.add.circle(x, y, 26, color, .08).setStrokeStyle(5, color, .78).setDepth(20);
    const inner = this.add.circle(x, y, 16, 0xffffff, .16).setStrokeStyle(2, 0xffffff, .7).setDepth(21);
    this.tweens.add({ targets: outer, radius, alpha: 0, duration: 620, ease: 'Cubic.easeOut', onComplete: () => outer.destroy() });
    this.tweens.add({ targets: inner, radius: radius * .65, alpha: 0, duration: 430, delay: 90, onComplete: () => inner.destroy() });
  }

  createGroundCracks(x, y, color, radius) {
    const cracks = this.add.graphics().setDepth(34);
    cracks.lineStyle(4, color, .88);
    for (let ray = 0; ray < 9; ray += 1) {
      const angle = ray / 9 * Math.PI * 2 + Phaser.Math.FloatBetween(-.16, .16);
      const inner = radius * .18;
      const middle = radius * Phaser.Math.FloatBetween(.45, .65);
      cracks.beginPath().moveTo(x + Math.cos(angle) * inner, y + Math.sin(angle) * inner)
        .lineTo(x + Math.cos(angle + .08) * middle, y + Math.sin(angle + .08) * middle)
        .lineTo(x + Math.cos(angle - .05) * radius, y + Math.sin(angle - .05) * radius).strokePath();
    }
    this.tweens.add({ targets: cracks, alpha: 0, duration: 520, onComplete: () => cracks.destroy() });
  }

  createWindSweep(x, y, angle, length, color) {
    const wind = this.add.graphics().setDepth(33);
    for (let streak = -3; streak <= 3; streak += 1) {
      const offsetX = Math.cos(angle + Math.PI / 2) * streak * 18;
      const offsetY = Math.sin(angle + Math.PI / 2) * streak * 18;
      wind.lineStyle(3 + (3 - Math.abs(streak)), color, .54 - Math.abs(streak) * .05);
      wind.lineBetween(x - Math.cos(angle) * length * .45 + offsetX, y - Math.sin(angle) * length * .45 + offsetY, x + Math.cos(angle) * length * .45 + offsetX, y + Math.sin(angle) * length * .45 + offsetY);
    }
    this.tweens.add({ targets: wind, x: Math.cos(angle) * 120, y: Math.sin(angle) * 120, alpha: 0, duration: 620, onComplete: () => wind.destroy() });
  }

  updateAmbientScenery(time) {
    if (time < (this.nextAmbientAt || 0)) return;
    this.nextAmbientAt = time + (this.elapsed >= NIGHT_START ? 150 : 245);
    const palettes = [0xff9a46, 0xff9fc9, 0xffd96b, 0xb9ecc8, 0x8be3ed, 0x9dcfff];
    const color = palettes[this.chapterIndex];
    const x = Phaser.Math.Clamp(this.player.x + Phaser.Math.Between(-470, 470), 20, WORLD_WIDTH - 20);
    const y = Phaser.Math.Clamp(this.player.y + Phaser.Math.Between(-310, 310), 20, WORLD_HEIGHT - 20);
    const mote = this.add.circle(x, y, 2 + this.chapterIndex % 3, color, .46).setDepth(15);
    const driftX = this.chapterIndex === 3 ? Phaser.Math.Between(90, 180) : Phaser.Math.Between(-35, 35);
    const driftY = this.chapterIndex === 0 || this.chapterIndex === 5 ? Phaser.Math.Between(-105, -55) : Phaser.Math.Between(-38, 38);
    this.tweens.add({ targets: mote, x: x + driftX, y: y + driftY, alpha: 0, scaleX: 2.2, scaleY: .35, duration: 1250 + Phaser.Math.Between(0, 650), onComplete: () => mote.destroy() });
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

    const chapterGround = (CAMPAIGN[this.chapterIndex] || CAMPAIGN[0]).ground;
    const baseGround = { r: chapterGround >> 16 & 255, g: chapterGround >> 8 & 255, b: chapterGround & 255 };
    const dayGround = {
      r: Math.min(255, Math.round(baseGround.r * .86 + 66)),
      g: Math.min(255, Math.round(baseGround.g * .86 + 62)),
      b: Math.min(255, Math.round(baseGround.b * .86 + 56))
    };
    const duskGround = { r: Math.round(dayGround.r * .92 + 42), g: Math.round(dayGround.g * .72 + 28), b: Math.round(dayGround.b * .65 + 25) };
    const nightGround = { r: Math.round(dayGround.r * .42 + 25), g: Math.round(dayGround.g * .48 + 35), b: Math.round(dayGround.b * .58 + 50) };
    const firstMix = Math.min(1, dayMix * 2);
    const secondMix = Math.max(0, dayMix * 2 - 1);
    let color = Phaser.Display.Color.Interpolate.ColorWithColor(dayGround, duskGround, 100, firstMix * 100);
    if (secondMix > 0) color = Phaser.Display.Color.Interpolate.ColorWithColor(duskGround, nightGround, 100, secondMix * 100);
    this.ground.setTint(Phaser.Display.Color.GetColor(color.r, color.g, color.b));
    this.sun.setAlpha(1 - dayMix).setPosition(WIDTH - 90 - dayMix * 100, 92 + dayMix * 55);
    this.moon.setAlpha(Math.max(0, dayMix * 1.4 - .4)).setPosition(92 + dayMix * 55, 92 - dayMix * 20);
    this.daylight.setAlpha(.04 * (1 - Math.pow(dayMix, .72)));
    this.darkness.setAlpha(darkness);

    const lanternVisible = dayMix > .08;
    this.lantern.setVisible(lanternVisible);
    if (lanternVisible) {
      const facingDirection = this.player.getData('facingDirection') || 1;
      this.lantern.setPosition(this.player.x + facingDirection * 22, this.player.y + 10);
      this.lantern.setFlipX(facingDirection < 0);
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
      if (enemy.getData('burnUntil') > this.time.now && this.time.now >= (enemy.getData('burnNext') || 0)) {
        enemy.setData('burnNext', this.time.now + 500);
        enemy.hp -= Math.max(2, this.stats.damage * .08 * this.stats.burn);
        this.createImpactBurst(enemy.x, enemy.y, 0xff7138, 11);
        if (enemy.hp <= 0) {
          this.killEnemy(enemy);
          return;
        }
      }
      const shadow = enemy.getData('shadow');
      if (shadow?.active) {
        shadow.setPosition(enemy.x, enemy.y + enemy.displayHeight * .34);
        shadow.setScale(enemy.scaleX < 0 ? -1 : 1, 1);
      }
      if (enemy.getData('attacking') || enemy.getData('casting')) {
        enemy.setVelocity(0, 0);
        return;
      }
      if (enemy.kind === 'boss') {
        this.updateBoss(enemy);
        return;
      }
      const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
      const distance = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
      const frostMultiplier = enemy.getData('frostUntil') > this.time.now ? .58 : 1;
      if (enemy.kind === 'ranged') {
        if (distance < 210) {
          this.physics.velocityFromRotation(angle + Math.PI, enemy.speed * .8 * frostMultiplier, enemy.body.velocity);
        } else if (distance > 330) {
          this.physics.velocityFromRotation(angle, enemy.speed * frostMultiplier, enemy.body.velocity);
        } else {
          const strafe = Math.sin(this.time.now * .0015 + enemy.x) > 0 ? 1 : -1;
          this.physics.velocityFromRotation(angle + strafe * Math.PI / 2, enemy.speed * .45 * frostMultiplier, enemy.body.velocity);
        }
        if (distance < 440 && this.time.now >= enemy.nextAttackAt) this.fireEnemyProjectile(enemy);
      } else {
        const weave = this.chapterIndex === 1 ? Math.sin(this.time.now * .003 + enemy.x) * .32 : 0;
        this.physics.velocityFromRotation(angle + weave, enemy.speed * frostMultiplier, enemy.body.velocity);
        if (distance < 92 && this.time.now >= enemy.nextAttackAt) this.performEnemyMeleeAttack(enemy);
      }
      if (this.chapterIndex === 5) enemy.setAlpha(.68 + Math.sin(this.time.now * .006 + enemy.x) * .22);
      enemy.setFlipX(enemy.body.velocity.x < 0);
      enemy.setAngle(Math.sin(this.time.now * .012 + enemy.x * .03) * (enemy.kind === 'ranged' ? 2 : 3.5));
    });

    this.separateBossesFromOtherEnemies();

    this.orbs.getChildren().forEach(orb => {
      if (!orb.active) return;
      const distance = Phaser.Math.Distance.Between(orb.x, orb.y, this.player.x, this.player.y);
      if (orb.getData('bossVacuum')) {
        if (distance <= 30) {
          this.collectOrb(this.player, orb);
          return;
        }
        const vacuumSpeed = Math.min(1900, 1120 + distance * .24);
        this.physics.moveToObject(orb, this.player, vacuumSpeed);
      } else if (distance <= this.stats.pickupRadius) {
        this.physics.moveToObject(orb, this.player, (250 + this.stats.pickupRadius) * this.stats.pickupSpeed);
      } else {
        orb.setVelocity(0, 0);
      }
    });

    this.projectiles.getChildren().forEach(projectile => {
      if (!projectile.active) return;
      if (this.time.now - projectile.getData('bornAt') > (projectile.getData('life') || 1900)) {
        projectile.destroy();
        return;
      }
      if (projectile.getData('homing')) {
        const target = projectile.getData('target');
        if (target?.active) {
          const angle = Phaser.Math.Angle.Between(projectile.x, projectile.y, target.x, target.y);
          const current = Math.atan2(projectile.body.velocity.y, projectile.body.velocity.x);
          const turn = Phaser.Math.Angle.RotateTo(current, angle, .055);
          this.physics.velocityFromRotation(turn, 330 * this.stats.projectileSpeed, projectile.body.velocity);
        }
      }
      if (projectile.getData('spin')) projectile.setAngle(projectile.angle + 18);
      else if (projectile.body?.velocity) projectile.setRotation(Math.atan2(projectile.body.velocity.y, projectile.body.velocity.x));
      if (this.time.now - (projectile.getData('lastTrailAt') || 0) > 65) {
        projectile.setData('lastTrailAt', this.time.now);
        this.createProjectileTrail(projectile);
      }
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
        const trailColor = projectile.getData('trailColor') || HOSTILE_ATTACK_COLOR;
        const trail = this.add.circle(projectile.x, projectile.y, projectile.displayWidth > 20 ? 7 : 5, trailColor, .56)
          .setStrokeStyle(3, HOSTILE_ATTACK_DARK, .92)
          .setDepth(23)
          .setAngle(45);
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

  canSpawnReinforcements() {
    if (!this.bossSpawned || !Number.isFinite(this.bossSpawnElapsed)) return true;
    return this.elapsed - this.bossSpawnElapsed < BOSS_REINFORCEMENT_SECONDS;
  }

  spawnWave() {
    if (this.bossDefeated) {
      this.nextSpawnAt = this.time.now + 1000;
      return;
    }
    if (!this.canSpawnReinforcements()) {
      this.nextSpawnAt = this.time.now + 1000;
      return;
    }
    const progress = Phaser.Math.Clamp(this.elapsed / NIGHT_START, 0, 1);
    const overtime = Phaser.Math.Clamp((this.elapsed - NIGHT_START) / 45, 0, .7);
    const chapter = CAMPAIGN[this.chapterIndex] || CAMPAIGN[0];
    const laterMap = this.chapterIndex > 0;
    const laterChapterPressure = laterMap ? 1.45 + this.chapterIndex * .22 : 1;
    const firstChapterIntervalScale = laterMap ? 1 : FIRST_CHAPTER_SPAWN_INTERVAL_SCALE;
    const cap = Math.min(210, 30 + this.chapterIndex * 28 + Math.floor(progress * (42 + this.chapterIndex * 8) + overtime * (18 + this.chapterIndex * 4)));
    if (this.enemies.countActive(true) >= cap) {
      this.nextSpawnAt = this.time.now + 320;
      return;
    }
    const interval = Phaser.Math.Linear(1720, 360, Math.pow(progress, 1.28)) * chapter.spawnScale * (1 - overtime * .24) * firstChapterIntervalScale / laterChapterPressure / NORMAL_ENEMY_SPAWN_RATE_SCALE;
    const laterMapBatch = laterMap ? 2 + Math.floor(this.chapterIndex * .8) : 0;
    const batch = 1 + Math.floor(progress * 2.65) + laterMapBatch + (progress > .76 ? 1 : 0) + Math.floor(overtime * 2);
    for (let index = 0; index < batch; index += 1) this.spawnEnemy(false);
    const minimumInterval = (laterMap ? Math.max(105, 165 - this.chapterIndex * 12) : 180 * firstChapterIntervalScale) / NORMAL_ENEMY_SPAWN_RATE_SCALE;
    const bossInterval = (laterMap ? Math.max(190, 340 - this.chapterIndex * 28) : 360 * firstChapterIntervalScale) / NORMAL_ENEMY_SPAWN_RATE_SCALE;
    this.nextSpawnAt = this.time.now + (this.activeBoss?.active ? Math.max(bossInterval, interval * .9) : Math.max(minimumInterval, interval));
  }

  spawnEnemy(forceElite = false, options = {}) {
    if (!this.player?.active || (!options.ignoreReinforcementLimit && !this.canSpawnReinforcements())) return;
    const spawnAngle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const spawnDistance = Phaser.Math.Between(options.minDistance || 430, options.maxDistance || 560);
    const originX = Number.isFinite(options.originX) ? options.originX : this.player.x;
    const originY = Number.isFinite(options.originY) ? options.originY : this.player.y;
    const x = Phaser.Math.Clamp(
      Number.isFinite(options.x) ? options.x : originX + Math.cos(spawnAngle) * spawnDistance,
      28,
      WORLD_WIDTH - 28
    );
    const y = Phaser.Math.Clamp(
      Number.isFinite(options.y) ? options.y : originY + Math.sin(spawnAngle) * spawnDistance,
      28,
      WORLD_HEIGHT - 28
    );

    const chapter = CAMPAIGN[this.chapterIndex] || CAMPAIGN[0];
    const stageProgress = Phaser.Math.Clamp(this.elapsed / NIGHT_START, 0, 1);
    const eliteChance = Math.min(.24, .018 + stageProgress * .12 + this.chapterIndex * .018);
    const elite = forceElite || Math.random() < eliteChance;
    const ranged = Math.random() < chapter.rangedChance;
    const meleeTexture = Math.random() < .62 ? 'enemy-dokkaebi' : 'enemy-gaksi';
    const preferredTexture = ranged ? 'enemy-jeoseung' : meleeTexture;
    const fallbackTexture = ranged ? 'enemy-ranged' : 'enemy-melee';
    const texture = this.textures.exists(preferredTexture) ? preferredTexture : fallbackTexture;
    const normalSize = ranged ? 58 : texture === 'enemy-gaksi' ? 62 : 64;
    const displaySize = Math.round(normalSize * (elite ? 1.24 : 1) * ENEMY_VISUAL_SCALE);
    const shadow = this.add.ellipse(x, y + displaySize * .34, displaySize * .66, displaySize * .22, 0x050508, ranged ? .28 : .4)
      .setDepth(17);
    const enemy = this.enemies.create(x, y, texture)
      .setDisplaySize(displaySize, displaySize)
      .setDepth(20);
    enemy.setData('shadow', shadow);
    const typeIndex = ranged ? 2 : texture === 'enemy-gaksi' ? 1 : 0;
    enemy.setData('folkName', chapter.enemyNames[typeIndex]);
    const laterEnemyHpScale = this.chapterIndex === 0 ? 1 : 1.5 + this.chapterIndex * .25;
    const laterEnemyDamageScale = this.chapterIndex === 0 ? 1 : 1.3 + this.chapterIndex * .2;
    const normalEnemyDamageScale = this.chapterIndex >= 2 && !options.preserveBossDamage
      ? LATE_CHAPTER_NORMAL_DAMAGE_SCALE
      : 1;
    enemy.hp = (18 + this.level * 4 + stageProgress * 18 + this.chapterIndex * 7) * chapter.hpScale * laterEnemyHpScale * (elite ? 3 : 1);
    enemy.maxHp = enemy.hp;
    enemy.speed = ((ranged ? 29 : 36) + stageProgress * (ranged ? 16 : 28) + (elite ? 4 : 0)) * chapter.speedScale;
    enemy.damage = ((ranged ? 5 : 6) + Math.floor(this.chapterIndex * 1.5) + stageProgress * 3 + (elite ? 4 : 0)) * chapter.damageScale * laterEnemyDamageScale * ENEMY_DAMAGE_SCALE * normalEnemyDamageScale;
    enemy.xpValue = elite ? 8 : ranged ? 4 : 3;
    enemy.elite = elite;
    enemy.kind = ranged ? 'ranged' : 'melee';
    enemy.nextAttackAt = this.time.now + Phaser.Math.Between(ranged ? 2200 : 1100, ranged ? 3400 : 1900);
    enemy.nextContactAt = 0;
    const chapterTints = [0xffffff, 0xffd7e8, 0xffe0a0, 0xcce4b0, 0xd8c6ff, 0xbad4ff];
    const baseTint = elite ? 0xf0a33a : chapterTints[this.chapterIndex];
    enemy.setData('baseTint', baseTint);
    enemy.setTint(baseTint);
    this.separateBossesFromOtherEnemies();
    return enemy;
  }

  separateEnemyFromBoss(enemy, boss) {
    if (!enemy?.active || !boss?.active || enemy === boss) return false;
    // 회전된 정사각형 이미지의 대각선까지 포함해 시각적으로 겹치지 않게 한다.
    const enemyRadius = Math.max(enemy.displayWidth, enemy.displayHeight) * .71;
    const bossRadius = Math.max(boss.displayWidth, boss.displayHeight) * .71;
    const minimumDistance = enemyRadius + bossRadius + 18;
    const distance = Phaser.Math.Distance.Between(enemy.x, enemy.y, boss.x, boss.y);
    if (distance >= minimumDistance) return false;

    const baseAngle = distance > .01
      ? Phaser.Math.Angle.Between(boss.x, boss.y, enemy.x, enemy.y)
      : Phaser.Math.Angle.Between(boss.x, boss.y, WORLD_WIDTH / 2, WORLD_HEIGHT / 2);
    const margin = Math.max(34, enemyRadius * .72);
    const candidates = [baseAngle, baseAngle + Math.PI, baseAngle + Math.PI / 2, baseAngle - Math.PI / 2];
    let best = null;
    candidates.forEach(angle => {
      const x = Phaser.Math.Clamp(boss.x + Math.cos(angle) * minimumDistance, margin, WORLD_WIDTH - margin);
      const y = Phaser.Math.Clamp(boss.y + Math.sin(angle) * minimumDistance, margin, WORLD_HEIGHT - margin);
      const clearance = Phaser.Math.Distance.Between(x, y, boss.x, boss.y);
      if (!best || clearance > best.clearance) best = { x, y, clearance };
    });
    if (!best) return false;

    enemy.setPosition(best.x, best.y);
    const awayX = best.x - boss.x;
    const awayY = best.y - boss.y;
    const awayLength = Math.max(.001, Math.hypot(awayX, awayY));
    const normalX = awayX / awayLength;
    const normalY = awayY / awayLength;
    const inwardVelocity = enemy.body.velocity.x * normalX + enemy.body.velocity.y * normalY;
    if (inwardVelocity < 0) {
      enemy.body.velocity.x -= inwardVelocity * normalX;
      enemy.body.velocity.y -= inwardVelocity * normalY;
    }
    const shadow = enemy.getData('shadow');
    if (shadow?.active) shadow.setPosition(enemy.x, enemy.y + enemy.displayHeight * .34);
    return true;
  }

  separateBossesFromOtherEnemies() {
    if (!this.enemies) return;
    const activeEnemies = this.enemies.getChildren().filter(enemy => enemy.active);
    const bosses = activeEnemies
      .filter(enemy => enemy.kind === 'boss' || enemy.isMidBoss)
      .sort((left, right) => Number(right.kind === 'boss') - Number(left.kind === 'boss'));
    bosses.forEach(boss => {
      activeEnemies.forEach(enemy => {
        if (enemy === boss || enemy.kind === 'boss') return;
        this.separateEnemyFromBoss(enemy, boss);
      });
    });
  }

  spawnMidBoss(order) {
    const enemy = this.spawnEnemy(true, { preserveBossDamage: true });
    if (!enemy?.active) return;
    const chapter = CAMPAIGN[this.chapterIndex] || CAMPAIGN[0];
    const sizeScale = 1.24;
    enemy.isMidBoss = true;
    enemy.setData('treasureRewardKey', `chapter-${this.chapterIndex}-midboss-${order}`);
    enemy.setData('treasureDropped', false);
    enemy.setDisplaySize(enemy.displayWidth * sizeScale, enemy.displayHeight * sizeScale).setDepth(22);
    const laterChapter = this.chapterIndex === 0 ? 0 : this.chapterIndex;
    enemy.hp *= 3.4 + laterChapter * 1.1;
    enemy.maxHp = enemy.hp;
    enemy.damage *= 1.38 + laterChapter * .28;
    enemy.speed *= .9;
    enemy.xpValue = 18 + this.chapterIndex * 4;
    enemy.setData('folkName', `${order + 1}번째 중간 수호자 · ${enemy.getData('folkName')}`);
    enemy.setData('baseTint', 0xffb44f);
    enemy.setTint(0xffb44f);
    const shadow = enemy.getData('shadow');
    if (shadow?.active) shadow.setScale(1.35, 1.35).setAlpha(.56);
    this.separateBossesFromOtherEnemies();
    this.createDevicePulse(enemy.x, enemy.y, chapter.accent, 92);
    this.cameras.main.shake(260, .005);
  }

  fireEnemyProjectile(enemy) {
    if (!enemy?.active || this.state !== 'running' || enemy.getData('casting')) return;
    enemy.nextAttackAt = this.time.now + Phaser.Math.Between(2600, 3800);
    enemy.setData('casting', true);
    enemy.setTint(0xff6b5e);

    const warning = this.add.graphics().setDepth(22);
    warning.lineStyle(7, HOSTILE_ATTACK_DARK, .68);
    warning.lineBetween(enemy.x, enemy.y, this.player.x, this.player.y);
    warning.lineStyle(3, HOSTILE_ATTACK_COLOR, .92);
    warning.lineBetween(enemy.x, enemy.y, this.player.x, this.player.y);
    warning.fillStyle(HOSTILE_ATTACK_DARK, .34);
    warning.fillCircle(enemy.x, enemy.y, 31);
    warning.lineStyle(3, 0xff765e, .95);
    warning.strokeCircle(enemy.x, enemy.y, 28);
    this.createHostileMarker(enemy.x, enemy.y, 34, 520);
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
        .setDepth(24)
        .setTint(HOSTILE_ATTACK_COLOR);
      projectile.damage = enemy.damage;
      projectile.setData('bornAt', this.time.now);
      projectile.setData('lastTrailAt', this.time.now);
      projectile.setData('hostile', true);
      projectile.setData('trailColor', HOSTILE_ATTACK_COLOR);
      this.physics.velocityFromRotation(fireAngle, enemy.elite ? 124 : 108, projectile.body.velocity);

      const muzzle = this.add.circle(enemy.x, enemy.y, 12, HOSTILE_ATTACK_COLOR, .9)
        .setStrokeStyle(4, HOSTILE_ATTACK_DARK, 1)
        .setDepth(25);
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

  spawnBoss() {
    if (this.bossSpawned || !this.player?.active) return;
    this.bossSpawned = true;
    this.bossSpawnElapsed = this.elapsed;
    const chapter = CAMPAIGN[this.chapterIndex];
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const x = Phaser.Math.Clamp(this.player.x + Math.cos(angle) * 390, 120, WORLD_WIDTH - 120);
    const y = Phaser.Math.Clamp(this.player.y + Math.sin(angle) * 390, 120, WORLD_HEIGHT - 120);
    const bossDisplaySize = Math.round(190 * ENEMY_VISUAL_SCALE);
    const shadow = this.add.ellipse(x, y + 62 * ENEMY_VISUAL_SCALE, 132 * ENEMY_VISUAL_SCALE, 42 * ENEMY_VISUAL_SCALE, 0x050508, .58).setDepth(18);
    const boss = this.enemies.create(x, y, chapter.bossTexture).setDisplaySize(bossDisplaySize, bossDisplaySize).setDepth(24);
    boss.body.setCircle(88, 40, 74);
    boss.kind = 'boss';
    const laterBossHpScale = this.chapterIndex === 0 ? 1 : 2.05 + this.chapterIndex * .35;
    const laterBossDamageScale = this.chapterIndex === 0 ? 1 : 1.35 + this.chapterIndex * .22;
    const requestedBossHpScale = this.chapterIndex === 0
      ? .4
      : this.chapterIndex === CAMPAIGN.length - 1
        ? 2 * FINAL_BOSS_CURRENT_HP_MULTIPLIER
        : 1.5;
    boss.hp = (1200 * (1 + this.chapterIndex * .18) * chapter.bossHpScale + this.level * 55) * laterBossHpScale * requestedBossHpScale;
    boss.maxHp = boss.hp;
    boss.damage = (13 + this.chapterIndex * 3.4) * chapter.damageScale * laterBossDamageScale * ENEMY_DAMAGE_SCALE;
    boss.speed = 44 + this.chapterIndex * 3;
    boss.armor = this.chapterIndex === 2 ? 4 : Math.floor(this.chapterIndex / 2);
    boss.xpValue = 35 + this.chapterIndex * 10;
    boss.nextAttackAt = this.time.now + 1700;
    boss.nextContactAt = 0;
    boss.setData('shadow', shadow);
    boss.setData('folkName', chapter.bossName);
    boss.setData('baseTint', 0xffffff);
    boss.setData('pattern', chapter.bossPattern);
    boss.setData('enraged', false);
    boss.setData('attackSpeedMultiplier', this.chapterIndex === CAMPAIGN.length - 1 ? FINAL_BOSS_ATTACK_SPEED_MULTIPLIER : 1);
    boss.setData('lastLegacyPattern', null);
    boss.setData('nextSummonAt', this.chapterIndex === CAMPAIGN.length - 1 ? this.time.now + 7200 : Infinity);
    this.activeBoss = boss;
    this.separateBossesFromOtherEnemies();
    ui.bossName.textContent = `${chapter.bossName} · ${this.chapterIndex + 1}번째 설화`;
    ui.bossFill.style.width = '100%';
    ui.bossPanel.classList.remove('hidden');
    this.cameras.main.shake(520, .009);
    this.cameras.main.flash(180, 160, 40, 55, false);
    audio.boss();
    showToast(`밤의 지배자 ${chapter.bossName}이(가) 나타났습니다!`, 4200);
  }

  updateBoss(boss) {
    if (!boss?.active || !this.player?.active) return;
    if (!boss.getData('enraged') && boss.hp / boss.maxHp <= .55) {
      boss.setData('enraged', true);
      boss.speed *= 1.2;
      boss.nextAttackAt = Math.min(boss.nextAttackAt, this.time.now + 620);
      this.createDevicePulse(boss.x, boss.y, CAMPAIGN[this.chapterIndex].accent, 165);
      this.createGroundCracks(boss.x, boss.y, CAMPAIGN[this.chapterIndex].accent, 125);
      this.cameras.main.flash(240, 255, 88, 72, false);
      this.cameras.main.shake(260, .009);
      audio.boss();
      showToast(`${CAMPAIGN[this.chapterIndex].bossName}이(가) 두 번째 힘을 해방했습니다!`, 2600);
    }
    if (this.chapterIndex === CAMPAIGN.length - 1 && !boss.getData('attacking') && this.time.now >= boss.getData('nextSummonAt')) {
      if (this.summonFinalBossGuardian(boss)) return;
    }
    const distance = Phaser.Math.Distance.Between(boss.x, boss.y, this.player.x, this.player.y);
    const angle = Phaser.Math.Angle.Between(boss.x, boss.y, this.player.x, this.player.y);
    if (distance > 175) this.physics.velocityFromRotation(angle, boss.speed, boss.body.velocity);
    else this.physics.velocityFromRotation(angle + Math.PI / 2, boss.speed * .38, boss.body.velocity);
    boss.setFlipX(boss.body.velocity.x < 0);
    boss.setAngle(Math.sin(this.time.now * .004) * 2.2);
    if (this.time.now >= boss.nextAttackAt) this.performBossPattern(boss);
  }

  summonFinalBossGuardian(boss) {
    if (!boss?.active || boss.getData('attacking')) return false;
    const activeSummons = this.enemies.getChildren().filter(enemy => enemy.active && enemy.getData('summonedByFinalBoss')).length;
    if (activeSummons >= FINAL_BOSS_SUMMON_LIMIT) {
      boss.setData('nextSummonAt', this.time.now + 2600);
      return false;
    }

    const attackSpeed = boss.getData('attackSpeedMultiplier') || 1;
    const summonDelay = Math.round(760 / attackSpeed);
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const summonX = Phaser.Math.Clamp(boss.x + Math.cos(angle) * Phaser.Math.Between(135, 205), 90, WORLD_WIDTH - 90);
    const summonY = Phaser.Math.Clamp(boss.y + Math.sin(angle) * Phaser.Math.Between(135, 205), 90, WORLD_HEIGHT - 90);
    boss.setData('attacking', true);
    boss.setData('nextSummonAt', this.time.now + (boss.getData('enraged') ? 9000 : 11800));
    boss.nextAttackAt = Math.max(boss.nextAttackAt, this.time.now + summonDelay + 520);
    boss.setVelocity(0, 0);
    boss.setTint(0xaecbff);

    const marker = this.createHazardTelegraph(summonX, summonY, 72, 0x9bbcff, summonDelay);
    this.createAttackSigil(boss.x, boss.y, 0x9bbcff, 105, 10);
    this.createHostileMarker(summonX, summonY, 80, summonDelay);
    const chain = this.add.graphics().setDepth(25);
    chain.lineStyle(12, HOSTILE_ATTACK_DARK, .7).lineBetween(boss.x, boss.y, summonX, summonY);
    chain.lineStyle(4, 0x9bbcff, .86).lineBetween(boss.x, boss.y, summonX, summonY);
    this.tweens.add({ targets: chain, alpha: 0, duration: summonDelay, onComplete: () => chain.destroy() });

    this.time.delayedCall(summonDelay, () => {
      marker.destroy();
      if (!boss.active) return;
      if (this.state !== 'running') {
        boss.setData('nextSummonAt', this.time.now + 2600);
        this.finishBossAttack(boss);
        return;
      }
      const guardian = this.spawnEnemy(true, {
        ignoreReinforcementLimit: true,
        preserveBossDamage: true,
        x: summonX,
        y: summonY
      });
      if (guardian?.active) {
        guardian.isMidBoss = true;
        guardian.setData('noTreasure', true);
        guardian.setData('treasureDropped', true);
        guardian.setData('summonedByFinalBoss', true);
        guardian.setData('folkName', '염라의 소환 수문장');
        guardian.setDisplaySize(guardian.displayWidth * 1.42, guardian.displayHeight * 1.42).setDepth(23);
        guardian.hp *= 2.35;
        guardian.maxHp = guardian.hp;
        guardian.damage *= 1.12;
        guardian.speed *= .88;
        guardian.xpValue = 20;
        guardian.setData('baseTint', 0xa9c7ff);
        guardian.setTint(0xa9c7ff);
        const shadow = guardian.getData('shadow');
        if (shadow?.active) shadow.setScale(1.48, 1.48).setAlpha(.62);
        this.createDevicePulse(summonX, summonY, 0x91bfff, 105);
        this.createGroundCracks(summonX, summonY, 0x789cff, 88);
      }
      this.finishBossAttack(boss);
    });
    return true;
  }

  performBossPattern(boss) {
    if (!boss?.active || boss.getData('attacking')) return;
    const configuredPattern = boss.getData('pattern');
    const legacyPatterns = CAMPAIGN.slice(0, 5).map(chapter => chapter.bossPattern);
    let pattern = configuredPattern;
    if (configuredPattern === 'legacy-random') {
      const previousPattern = boss.getData('lastLegacyPattern');
      const candidates = legacyPatterns.filter(candidate => candidate !== previousPattern);
      pattern = candidates[Phaser.Math.Between(0, candidates.length - 1)];
      boss.setData('lastLegacyPattern', pattern);
    }
    const enraged = boss.getData('enraged');
    const attackSpeed = boss.getData('attackSpeedMultiplier') || 1;
    const timing = milliseconds => Math.max(1, Math.round(milliseconds / attackSpeed));
    boss.nextAttackAt = this.time.now + Math.max(1000, (3100 - this.chapterIndex * 170) * (enraged ? .72 : 1) / attackSpeed);
    boss.setData('attacking', true);
    boss.setVelocity(0, 0);
    boss.setTint(0xffc2a1);
    const targetX = this.player.x;
    const targetY = this.player.y;

    if (pattern === 'charge') {
      const chargeAngle = Phaser.Math.Angle.Between(boss.x, boss.y, targetX, targetY);
      const line = this.add.graphics().setDepth(23);
      line.lineStyle(18, 0xff8d2f, .2).lineBetween(boss.x, boss.y, targetX, targetY);
      line.lineStyle(4, 0xffe08a, .82).lineBetween(boss.x, boss.y, targetX, targetY);
      for (let offset = -1; offset <= 1; offset += 2) {
        line.lineStyle(3, 0xffb43b, .58).lineBetween(boss.x + Math.cos(chargeAngle + Math.PI / 2) * offset * 18, boss.y + Math.sin(chargeAngle + Math.PI / 2) * offset * 18, targetX + Math.cos(chargeAngle + Math.PI / 2) * offset * 18, targetY + Math.sin(chargeAngle + Math.PI / 2) * offset * 18);
      }
      const targetMark = this.createHazardTelegraph(targetX, targetY, 72, 0xffb43b, timing(680));
      this.createHostileMarker(targetX, targetY, 78, timing(680));
      this.tweens.add({ targets: line, alpha: 0, duration: timing(680), onComplete: () => line.destroy() });
      this.time.delayedCall(timing(620), () => {
        if (!boss.active) {
          targetMark.destroy();
          return;
        }
        this.createImpactBurst(boss.x, boss.y, 0xffbd4f, 34);
        this.tweens.add({
          targets: boss,
          x: targetX,
          y: targetY,
          duration: timing(650),
          ease: 'Cubic.easeIn',
          onComplete: () => {
            targetMark.destroy();
            if (!boss.active) return;
            this.createImpactBurst(targetX, targetY, 0xffbd4f, 92);
            this.createGroundCracks(targetX, targetY, 0xffd36c, 94);
            if (Phaser.Math.Distance.Between(this.player.x, this.player.y, targetX, targetY) <= 118) this.takePlayerDamage(boss.damage * (enraged ? 1.45 : 1.2), boss.x, boss.y);
            this.finishBossAttack(boss);
          }
        });
      });
      return;
    }

    if (pattern === 'pounce') {
      const marker = this.add.circle(targetX, targetY, 70, 0xff4d3c, .15).setStrokeStyle(5, 0xffd170, .9).setDepth(21);
      this.createHostileMarker(targetX, targetY, 76, timing(780));
      this.tweens.add({ targets: marker, scaleX: .55, scaleY: .55, alpha: .8, duration: timing(760) });
      this.tweens.add({ targets: boss, y: boss.y - 90, alpha: .48, scaleX: boss.scaleX * .7, scaleY: boss.scaleY * .7, duration: timing(390), yoyo: true });
      this.time.delayedCall(timing(780), () => {
        marker.destroy();
        if (!boss.active) return;
        boss.setPosition(targetX, targetY);
        this.createImpactBurst(targetX, targetY, 0xffb84d, 95);
        this.createGroundCracks(targetX, targetY, 0xffd46b, 112);
        if (Phaser.Math.Distance.Between(this.player.x, this.player.y, targetX, targetY) < 105) this.takePlayerDamage(boss.damage * 1.3, boss.x, boss.y);
        if (enraged) for (let index = 0; index < 8; index += 1) this.createBossProjectile(boss, index / 8 * Math.PI * 2, 138, 0xbfe89b);
        this.finishBossAttack(boss);
      });
      return;
    }

    const warningColor = pattern === 'foxfire' ? 0xff6688 : pattern === 'plague' ? 0x63dce8 : pattern === 'judgment' ? 0x91bfff : 0xffa43b;
    const warning = this.add.circle(boss.x, boss.y, 54, warningColor, .17).setStrokeStyle(6, warningColor, .95).setDepth(23);
    this.createAttackSigil(boss.x, boss.y, warningColor, enraged ? 92 : 74, enraged ? 12 : 8);
    this.createHostileMarker(boss.x, boss.y, enraged ? 100 : 82, timing(660));
    this.tweens.add({ targets: warning, scaleX: .5, scaleY: .5, alpha: .9, yoyo: true, repeat: 1, duration: timing(250) });
    this.time.delayedCall(timing(660), () => {
      warning.destroy();
      if (!boss.active) return;
      if (pattern === 'smash') {
        this.createImpactBurst(boss.x, boss.y, 0xff9b3e, 120);
        this.cameras.main.shake(180, .008);
        if (Phaser.Math.Distance.Between(boss.x, boss.y, this.player.x, this.player.y) < 145) this.takePlayerDamage(boss.damage * 1.2, boss.x, boss.y);
        const count = enraged ? 14 : 10;
        for (let index = 0; index < count; index += 1) this.createBossProjectile(boss, index / count * Math.PI * 2, enraged ? 150 : 128, 0xff8a3d);
      } else if (pattern === 'foxfire') {
        const aimed = Phaser.Math.Angle.Between(boss.x, boss.y, this.player.x, this.player.y);
        const spread = enraged ? 4 : 3;
        for (let index = -spread; index <= spread; index += 1) this.createBossProjectile(boss, aimed + index * .16, enraged ? 166 : 142, 0xff5c88);
      } else if (pattern === 'plague') {
        this.createPersistentHazard(targetX, targetY, 92, 0x43d4dc, 6200, boss.damage * .45);
        const count = enraged ? 12 : 8;
        for (let index = 0; index < count; index += 1) this.createBossProjectile(boss, index / count * Math.PI * 2, enraged ? 142 : 118, 0x68d9ed);
      } else if (pattern === 'judgment') {
        const aimed = Phaser.Math.Angle.Between(boss.x, boss.y, this.player.x, this.player.y);
        const count = enraged ? 16 : 12;
        for (let index = 0; index < count; index += 1) this.createBossProjectile(boss, aimed + index / count * Math.PI * 2, index % 2 ? 128 : 172, 0x91bfff);
        this.createPersistentHazard(targetX, targetY, 72, 0x5d77dd, 4200, boss.damage * .55);
      }
      this.finishBossAttack(boss);
    });
  }

  createBossProjectile(boss, angle, speed, tint) {
    if (!boss?.active) return;
    const projectile = this.enemyProjectiles.create(boss.x, boss.y, 'enemy-projectile').setDisplaySize(24, 24).setDepth(26).setTint(HOSTILE_ATTACK_COLOR);
    projectile.damage = boss.damage * .72;
    projectile.setData('bornAt', this.time.now);
    projectile.setData('lastTrailAt', this.time.now);
    projectile.setData('trailColor', tint);
    projectile.setData('hostile', true);
    this.physics.velocityFromRotation(angle, speed * (boss.getData('attackSpeedMultiplier') || 1), projectile.body.velocity);
  }

  finishBossAttack(boss) {
    if (!boss?.active) return;
    boss.setData('attacking', false);
    boss.setTint(boss.getData('baseTint') || 0xffffff);
    boss.setAngle(0);
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
    this.attackSequence += 1;
    const attackMethods = {
      dokkaebi: () => this.attackDokkaebi(targets),
      gumiho: () => this.attackGumiho(targets),
      haechi: () => this.attackHaechi(targets),
      sansin: () => this.attackSansin(targets),
      cheoyong: () => this.attackCheoyong(targets),
      baridegi: () => this.attackBaridegi(targets),
      sejong: () => this.attackSejong(targets)
    };
    attackMethods[this.selectedCharacter.id]?.();
    if (this.stats.lightning > 0 && this.attackSequence % Math.max(1, 4 - this.stats.lightning) === 0) {
      this.chainLightning(targets[0].enemy, Math.min(4, 2 + this.stats.lightning));
    }
    audio.attack(this.selectedCharacter.id);
  }

  rollDamage(multiplier = 1) {
    const critical = Math.random() < this.stats.crit;
    return {
      amount: this.stats.damage * multiplier * (critical ? 1.85 : 1) * Phaser.Math.FloatBetween(.9, 1.1),
      critical
    };
  }

  launchProjectile(target, texture, options = {}) {
    if (!target?.active) return null;
    const angle = (options.angle ?? Phaser.Math.Angle.Between(this.player.x, this.player.y, target.x, target.y));
    const heroPalette = HERO_ATTACK_PALETTES[this.selectedCharacter.id] || { primary: 0xffffff, secondary: 0xffffff };
    const impactColor = options.impactColor || options.tint || heroPalette.primary;
    const projectile = this.projectiles.create(this.player.x, this.player.y, texture)
      .setDisplaySize((options.width || 18) * this.stats.projectileSize, (options.height || options.width || 18) * this.stats.projectileSize)
      .setDepth(25);
    const damage = this.rollDamage(options.multiplier || 1);
    projectile.damage = damage.amount;
    projectile.setData('critical', damage.critical);
    projectile.setData('bornAt', this.time.now);
    projectile.setData('life', options.life || 2000);
    projectile.setData('target', target);
    projectile.setData('homing', Boolean(options.homing));
    projectile.setData('pierce', options.pierce || 0);
    projectile.setData('splash', options.splash || 0);
    projectile.setData('chain', options.chain || 0);
    projectile.setData('spin', Boolean(options.spin));
    projectile.setData('ricochet', this.stats.ricochet);
    projectile.setData('friendly', true);
    projectile.setData('ownerCharacter', this.selectedCharacter.id);
    projectile.setData('impactColor', impactColor);
    projectile.setData('trailColor', options.trailColor || impactColor);
    projectile.setTint(options.tint || heroPalette.primary);
    this.physics.velocityFromRotation(angle, (options.speed || 430) * this.stats.projectileSpeed, projectile.body.velocity);
    return projectile;
  }

  launchHangulProjectile(target, glyph, options = {}) {
    if (!target?.active) return null;
    const angle = options.angle ?? Phaser.Math.Angle.Between(this.player.x, this.player.y, target.x, target.y);
    const palette = options.palette || { fill: '#fff1a6', stroke: '#4b2a38', trail: 0xf4c85c };
    const projectile = this.add.text(this.player.x, this.player.y, glyph, {
      fontFamily: '"Noto Sans KR", "Malgun Gothic", sans-serif',
      fontSize: `${Math.round(28 * this.stats.projectileSize)}px`,
      fontStyle: 'bold',
      color: palette.fill,
      stroke: palette.stroke,
      strokeThickness: 5,
      padding: { left: 4, right: 4, top: 3, bottom: 3 }
    }).setOrigin(.5).setDepth(26);
    this.physics.add.existing(projectile);
    projectile.body.setAllowGravity(false);
    projectile.body.setSize(Math.max(18, projectile.width * .68), Math.max(18, projectile.height * .68), true);
    this.projectiles.add(projectile);
    const damage = this.rollDamage(options.multiplier || 1);
    projectile.damage = damage.amount;
    projectile.setData('critical', damage.critical);
    projectile.setData('bornAt', this.time.now);
    projectile.setData('life', options.life || 2100);
    projectile.setData('target', target);
    projectile.setData('homing', false);
    projectile.setData('pierce', options.pierce ?? 1);
    projectile.setData('splash', options.splash || 0);
    projectile.setData('chain', 0);
    projectile.setData('spin', false);
    projectile.setData('ricochet', this.stats.ricochet);
    projectile.setData('hangul', true);
    projectile.setData('trailColor', palette.trail);
    projectile.setData('friendly', true);
    projectile.setData('ownerCharacter', 'sejong');
    projectile.setData('impactColor', palette.impact || HERO_ATTACK_PALETTES.sejong.primary);
    this.physics.velocityFromRotation(angle, (options.speed || 485) * this.stats.projectileSpeed, projectile.body.velocity);
    return projectile;
  }

  attackDokkaebi(targets) {
    const target = targets[0].enemy;
    const maxDistance = 235 * this.stats.areaScale;
    const facing = Phaser.Math.Angle.Between(this.player.x, this.player.y, target.x, target.y);
    const strikeX = this.player.x + Math.cos(facing) * Math.min(targets[0].distance, maxDistance * .72);
    const strikeY = this.player.y + Math.sin(facing) * Math.min(targets[0].distance, maxDistance * .72);
    const wave = this.add.graphics().setDepth(34);
    wave.lineStyle(10, 0xffc45c, .92).beginPath().arc(this.player.x, this.player.y, maxDistance, facing - .62, facing + .62).strokePath();
    wave.lineStyle(4, 0xfff0a8, .72).beginPath().arc(this.player.x, this.player.y, maxDistance * .82, facing - .7, facing + .7).strokePath();
    wave.lineStyle(4, 0x7a321d, .9).lineBetween(this.player.x, this.player.y, strikeX, strikeY);
    this.tweens.add({ targets: wave, alpha: 0, scaleX: 1.16, scaleY: 1.16, duration: 260, onComplete: () => wave.destroy() });
    this.enemies.getChildren().filter(enemy => enemy.active).forEach(enemy => {
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
      const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, enemy.x, enemy.y);
      if (distance <= maxDistance && Math.abs(Phaser.Math.Angle.Wrap(angle - facing)) <= .72) {
        this.damageEnemy(enemy, this.rollDamage(1.28).amount, { knockback: 86, color: 0xffa137 });
      }
    });
    this.createImpactBurst(strikeX, strikeY, 0xff8a32, 34 * this.stats.areaScale);
    this.createGroundCracks(strikeX, strikeY, 0xffbf5c, 62 * this.stats.areaScale);
    this.cameras.main.shake(55, .0028);
  }

  attackGumiho(targets) {
    const count = Math.max(1, Math.floor(this.stats.projectiles));
    this.createAttackSigil(this.player.x, this.player.y, 0xff739d, 48 + count * 5, 9);
    for (let index = 0; index < count; index += 1) {
      const target = targets[index % Math.min(count, targets.length)].enemy;
      this.launchProjectile(target, 'foxfire', { width: 22, multiplier: .94, speed: 340, homing: true, splash: 46 * this.stats.areaScale, tint: HERO_ATTACK_PALETTES.gumiho.primary, life: 2600 });
    }
  }

  attackHaechi(targets) {
    const radius = 185 * this.stats.areaScale;
    const ring = this.add.circle(this.player.x, this.player.y, 32, 0xffd86b, .15).setStrokeStyle(8, 0xffdd74, .95).setDepth(32);
    this.tweens.add({ targets: ring, radius, alpha: 0, duration: 420, onComplete: () => ring.destroy() });
    this.createAttackSigil(this.player.x, this.player.y, 0xffe58a, 64 * this.stats.areaScale, 8);
    const rays = this.add.graphics().setDepth(33);
    for (let ray = 0; ray < 12; ray += 1) {
      const angle = ray / 12 * Math.PI * 2;
      rays.lineStyle(ray % 2 ? 3 : 6, ray % 2 ? 0xfff4c0 : 0xffc84c, .75);
      rays.lineBetween(this.player.x + Math.cos(angle) * 48, this.player.y + Math.sin(angle) * 48, this.player.x + Math.cos(angle) * radius, this.player.y + Math.sin(angle) * radius);
    }
    this.tweens.add({ targets: rays, alpha: 0, angle: 9, duration: 360, onComplete: () => rays.destroy() });
    let struck = 0;
    targets.forEach(({ enemy, distance }) => {
      if (distance > radius) return;
      struck += 1;
      this.damageEnemy(enemy, this.rollDamage(1.08).amount, { knockback: 118, color: 0xffd457 });
    });
    if (!struck) this.launchProjectile(targets[0].enemy, 'projectile', { width: 18, multiplier: .82, speed: 380, tint: HERO_ATTACK_PALETTES.haechi.primary });
  }

  attackSansin(targets) {
    const count = Math.max(1, Math.floor(this.stats.projectiles));
    const aim = Phaser.Math.Angle.Between(this.player.x, this.player.y, targets[0].enemy.x, targets[0].enemy.y);
    this.createWindSweep(this.player.x, this.player.y, aim, 155, 0xd8f3b7);
    for (let index = 0; index < count; index += 1) {
      const target = targets[index % Math.min(count, targets.length)].enemy;
      const baseAngle = Phaser.Math.Angle.Between(this.player.x, this.player.y, target.x, target.y);
      const spread = count > 1 ? (index - (count - 1) / 2) * .085 : 0;
      this.launchProjectile(target, 'arrow', { width: 30, height: 16, multiplier: 1.12, speed: 620, angle: baseAngle + spread, pierce: 2 + Math.floor(count / 2), tint: HERO_ATTACK_PALETTES.sansin.primary, life: 2300 });
    }
  }

  attackCheoyong(targets) {
    const nearby = targets.filter(target => target.distance <= 225 * this.stats.areaScale).slice(0, 2 + Math.floor(this.stats.projectiles));
    this.createAttackSigil(this.player.x, this.player.y, 0xc39aed, 52 * this.stats.areaScale, 5);
    if (!nearby.length) {
      this.launchProjectile(targets[0].enemy, 'dance-blade', { width: 25, multiplier: .88, speed: 460, spin: true, ricochet: 1, tint: HERO_ATTACK_PALETTES.cheoyong.primary });
      return;
    }
    nearby.forEach(({ enemy }, index) => {
      this.time.delayedCall(index * 75, () => {
        if (!enemy.active) return;
        this.createHeroSlash(enemy.x, enemy.y, index);
        this.damageEnemy(enemy, this.rollDamage(.88).amount, { knockback: 42, color: 0xc18cff });
      });
    });
  }

  attackBaridegi(targets) {
    const count = Math.max(1, Math.floor(this.stats.projectiles));
    this.createAttackSigil(this.player.x, this.player.y, 0xa8ddff, 54 + count * 4, 6);
    for (let index = 0; index < count; index += 1) {
      const target = targets[index % Math.min(count, targets.length)].enemy;
      this.launchProjectile(target, 'spirit-bloom', { width: 25, multiplier: .88, speed: 370, homing: true, chain: 2, tint: HERO_ATTACK_PALETTES.baridegi.primary, life: 2700 });
    }
    if (this.attackSequence % 5 === 0) {
      this.stats.hp = Math.min(this.stats.maxHP, this.stats.hp + 2 + this.level * .15);
      this.createImpactBurst(this.player.x, this.player.y, 0x9fe7d7, 22);
    }
  }

  attackSejong(targets) {
    const count = Math.max(2, Math.floor(this.stats.projectiles));
    const palettes = [
      { fill: '#fff0cf', stroke: '#263a78', trail: 0x526bd8, impact: 0x526bd8 },
      { fill: '#cdd6ff', stroke: '#18284f', trail: 0x7f92f0, impact: 0x657ae3 },
      { fill: '#fffdf3', stroke: '#334c9b', trail: 0xd2b66d, impact: 0x526bd8 }
    ];
    this.createAttackSigil(this.player.x, this.player.y, HERO_ATTACK_PALETTES.sejong.primary, 58 + count * 4, 14);
    for (let index = 0; index < count; index += 1) {
      const target = targets[index % Math.min(count, targets.length)].enemy;
      const baseAngle = Phaser.Math.Angle.Between(this.player.x, this.player.y, target.x, target.y);
      const spread = count > 1 ? (index - (count - 1) / 2) * .11 : 0;
      const glyphIndex = (this.attackSequence * 2 + index) % HANGUL_GLYPHS.length;
      this.launchHangulProjectile(target, HANGUL_GLYPHS[glyphIndex], {
        angle: baseAngle + spread,
        multiplier: .96,
        speed: 500,
        pierce: 1 + Math.floor(count / 3),
        splash: 18 * this.stats.areaScale,
        palette: palettes[index % palettes.length]
      });
    }
  }

  onProjectileHit(projectile, enemy) {
    if (!projectile?.active || !enemy?.active) return;
    if (projectile.getData('lastEnemy') === enemy && this.time.now < (projectile.getData('lastHitAt') || 0) + 180) return;
    projectile.setData('lastEnemy', enemy);
    projectile.setData('lastHitAt', this.time.now);
    const impactColor = projectile.getData('impactColor') || projectile.tintTopLeft || 0xffffff;
    this.damageEnemy(enemy, projectile.damage, { color: impactColor });

    const splash = projectile.getData('splash') || 0;
    if (splash > 0) {
      this.createImpactBurst(enemy.x, enemy.y, impactColor, splash);
      this.enemies.getChildren().filter(other => other.active && other !== enemy).forEach(other => {
        if (Phaser.Math.Distance.Between(enemy.x, enemy.y, other.x, other.y) <= splash) this.damageEnemy(other, projectile.damage * .48, { color: impactColor });
      });
    }
    if (projectile.getData('chain') > 0) this.chainDamage(enemy, projectile.damage * .55, projectile.getData('chain'));

    const pierce = projectile.getData('pierce') || 0;
    if (pierce > 0) {
      projectile.setData('pierce', pierce - 1);
      return;
    }
    const ricochet = projectile.getData('ricochet') || 0;
    if (ricochet > 0) {
      const next = this.findNearestEnemy(enemy.x, enemy.y, enemy, 360);
      if (next) {
        projectile.setData('ricochet', ricochet - 1);
        projectile.setData('target', next);
        projectile.setData('homing', true);
        const angle = Phaser.Math.Angle.Between(projectile.x, projectile.y, next.x, next.y);
        this.physics.velocityFromRotation(angle, 430 * this.stats.projectileSpeed, projectile.body.velocity);
        return;
      }
    }
    projectile.destroy();
  }

  damageEnemy(enemy, rawDamage, options = {}) {
    if (!enemy?.active) return;
    let damage = rawDamage;
    if (enemy.kind === 'boss') damage *= 1 + this.stats.bossDamage;
    damage = Math.max(1, damage - (enemy.armor || 0));
    enemy.hp -= damage;
    if (this.stats.frost > 0) enemy.setData('frostUntil', this.time.now + 1200 + this.stats.frost * 180);
    if (this.stats.burn > 0) {
      enemy.setData('burnUntil', this.time.now + 3000);
      enemy.setData('burnNext', Math.min(enemy.getData('burnNext') || Infinity, this.time.now + 350));
    }
    if (options.knockback && enemy.kind !== 'boss') {
      const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, enemy.x, enemy.y);
      this.physics.velocityFromRotation(angle, options.knockback + this.stats.knockback, enemy.body.velocity);
    }
    enemy.setTintFill(0xffffff);
    this.time.delayedCall(70, () => {
      if (enemy.active) enemy.setTint(enemy.getData('baseTint') || 0xffffff);
    });
    this.createImpactBurst(enemy.x, enemy.y, options.color || 0xfff0ba, enemy.kind === 'boss' ? 18 : 10);
    if (enemy.kind === 'boss' || damage >= this.stats.damage * 1.45) this.createDamageNumber(enemy.x, enemy.y, damage, damage >= this.stats.damage * 1.65);
    if (enemy.hp <= 0) this.killEnemy(enemy);
  }

  findNearestEnemy(x, y, excluded, maxDistance = Infinity) {
    let nearest = null;
    let nearestDistance = maxDistance;
    this.enemies.getChildren().forEach(enemy => {
      if (!enemy.active || enemy === excluded) return;
      const distance = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
      if (distance < nearestDistance) {
        nearest = enemy;
        nearestDistance = distance;
      }
    });
    return nearest;
  }

  chainDamage(origin, damage, jumps) {
    let source = origin;
    const visited = new Set([origin]);
    for (let index = 0; index < jumps; index += 1) {
      const next = this.enemies.getChildren()
        .filter(enemy => enemy.active && !visited.has(enemy))
        .map(enemy => ({ enemy, distance: Phaser.Math.Distance.Between(source.x, source.y, enemy.x, enemy.y) }))
        .filter(candidate => candidate.distance <= 280)
        .sort((left, right) => left.distance - right.distance)[0]?.enemy;
      if (!next) break;
      this.createEnergyArc(source.x, source.y, next.x, next.y, 0x8ad6ff);
      this.damageEnemy(next, damage * Math.pow(.82, index), { color: 0x8ad6ff });
      visited.add(next);
      source = next;
    }
  }

  chainLightning(origin, jumps) {
    if (!origin?.active) return;
    const damage = this.stats.damage * (.48 + this.stats.lightning * .12);
    this.createImpactBurst(origin.x, origin.y, 0xffee70, 18);
    this.damageEnemy(origin, damage, { color: 0xffee70 });
    this.chainDamage(origin, damage, jumps);
    audio.tone(960, .07, 'square', .025);
  }

  createEnergyArc(x1, y1, x2, y2, color) {
    const arc = this.add.graphics().setDepth(37);
    arc.lineStyle(4, color, .95);
    arc.beginPath().moveTo(x1, y1);
    const segments = 5;
    for (let index = 1; index < segments; index += 1) {
      const mix = index / segments;
      arc.lineTo(Phaser.Math.Linear(x1, x2, mix) + Phaser.Math.Between(-14, 14), Phaser.Math.Linear(y1, y2, mix) + Phaser.Math.Between(-14, 14));
    }
    arc.lineTo(x2, y2).strokePath();
    this.tweens.add({ targets: arc, alpha: 0, duration: 180, onComplete: () => arc.destroy() });
  }

  createHeroSlash(x, y, index = 0) {
    const slash = this.add.graphics().setDepth(38);
    slash.lineStyle(9, index % 2 ? HERO_ATTACK_PALETTES.cheoyong.secondary : HERO_ATTACK_PALETTES.cheoyong.primary, .95);
    slash.beginPath().arc(x, y, 34 * this.stats.areaScale, -1.8 + index, .8 + index).strokePath();
    slash.lineStyle(3, 0xffffff, .82).beginPath().arc(x, y, 25 * this.stats.areaScale, -1.65 + index, .65 + index).strokePath();
    for (let ribbon = 0; ribbon < 4; ribbon += 1) {
      const angle = index + ribbon / 4 * Math.PI * 2;
      slash.lineStyle(2, 0x6f38aa, .72).lineBetween(x + Math.cos(angle) * 12, y + Math.sin(angle) * 12, x + Math.cos(angle + .35) * 48, y + Math.sin(angle + .35) * 48);
    }
    this.tweens.add({ targets: slash, alpha: 0, angle: 35, scaleX: 1.25, scaleY: 1.25, duration: 230, onComplete: () => slash.destroy() });
  }

  createAttackSigil(x, y, color, radius, points = 8) {
    const sigil = this.add.graphics({ x, y }).setDepth(34);
    sigil.lineStyle(3, color, .82).strokeCircle(0, 0, radius).strokeCircle(0, 0, radius * .52);
    for (let point = 0; point < points; point += 1) {
      const angle = point / points * Math.PI * 2;
      const nextAngle = (point + 2) / points * Math.PI * 2;
      sigil.lineStyle(point % 2 ? 2 : 4, point % 2 ? 0xffffff : color, .64);
      sigil.lineBetween(Math.cos(angle) * radius * .5, Math.sin(angle) * radius * .5, Math.cos(nextAngle) * radius, Math.sin(nextAngle) * radius);
      sigil.fillStyle(color, .72).fillCircle(Math.cos(angle) * radius, Math.sin(angle) * radius, 3 + point % 2);
    }
    this.tweens.add({ targets: sigil, angle: 35, scaleX: 1.22, scaleY: 1.22, alpha: 0, duration: 420, ease: 'Cubic.easeOut', onComplete: () => sigil.destroy() });
  }

  createHostileMarker(x, y, radius, duration = 520) {
    const marker = this.add.graphics({ x, y }).setDepth(35);
    marker.lineStyle(5, HOSTILE_ATTACK_DARK, .96).strokeCircle(0, 0, radius);
    marker.lineStyle(2, HOSTILE_ATTACK_COLOR, .98).strokeCircle(0, 0, radius - 4);
    for (let spoke = 0; spoke < 4; spoke += 1) {
      const angle = spoke / 4 * Math.PI * 2;
      marker.lineStyle(4, HOSTILE_ATTACK_COLOR, .92).lineBetween(
        Math.cos(angle) * radius * .62,
        Math.sin(angle) * radius * .62,
        Math.cos(angle) * radius * 1.12,
        Math.sin(angle) * radius * 1.12
      );
    }
    this.tweens.add({ targets: marker, angle: 45, scaleX: .72, scaleY: .72, alpha: 0, duration, onComplete: () => marker.destroy() });
    return marker;
  }

  createProjectileTrail(projectile) {
    if (!projectile?.active) return;
    if (projectile.getData('hangul')) {
      const color = projectile.getData('trailColor') || 0xf4c85c;
      const trail = this.add.circle(projectile.x, projectile.y, 6, color, .32)
        .setStrokeStyle(2, 0xffffff, .35)
        .setDepth(23);
      this.tweens.add({ targets: trail, alpha: 0, scaleX: .15, scaleY: .15, duration: 220, onComplete: () => trail.destroy() });
      return;
    }
    const texture = projectile.texture.key;
    if (texture === 'arrow') {
      const angle = Math.atan2(projectile.body.velocity.y, projectile.body.velocity.x);
      const trail = this.add.graphics().setDepth(23);
      trail.lineStyle(5, HERO_ATTACK_PALETTES.sansin.primary, .52).lineBetween(projectile.x, projectile.y, projectile.x - Math.cos(angle) * 34, projectile.y - Math.sin(angle) * 34);
      trail.lineStyle(2, 0xffffff, .7).lineBetween(projectile.x, projectile.y, projectile.x - Math.cos(angle) * 20, projectile.y - Math.sin(angle) * 20);
      this.tweens.add({ targets: trail, alpha: 0, duration: 170, onComplete: () => trail.destroy() });
      return;
    }
    if (texture === 'dance-blade') {
      const trail = this.add.graphics().setDepth(23);
      trail.lineStyle(5, HERO_ATTACK_PALETTES.cheoyong.primary, .62).beginPath().arc(projectile.x, projectile.y, 15, projectile.rotation - 1.3, projectile.rotation + .5).strokePath();
      this.tweens.add({ targets: trail, alpha: 0, scaleX: 1.35, scaleY: 1.35, duration: 210, onComplete: () => trail.destroy() });
      return;
    }
    if (texture === 'spirit-bloom') {
      const trail = this.add.circle(projectile.x, projectile.y, 5, HERO_ATTACK_PALETTES.baridegi.primary, .52).setStrokeStyle(2, HERO_ATTACK_PALETTES.baridegi.secondary, .58).setDepth(23);
      this.tweens.add({ targets: trail, y: trail.y - 12, angle: 90, alpha: 0, scaleX: .2, scaleY: .2, duration: 330, onComplete: () => trail.destroy() });
      return;
    }
    const color = projectile.getData('trailColor') || (texture === 'foxfire' ? HERO_ATTACK_PALETTES.gumiho.primary : HERO_ATTACK_PALETTES.haechi.primary);
    const trail = this.add.circle(projectile.x, projectile.y, texture === 'foxfire' ? 6 : 4, color, .55).setDepth(23);
    this.tweens.add({ targets: trail, alpha: 0, scaleX: .2, scaleY: .2, duration: 260, onComplete: () => trail.destroy() });
  }

  createImpactBurst(x, y, color, radius = 12) {
    const burst = this.add.circle(x, y, Math.max(4, radius * .3), color, .72).setStrokeStyle(3, color, 1).setDepth(39);
    const flash = this.add.circle(x, y, Math.max(3, radius * .16), 0xffffff, .85).setDepth(40);
    this.tweens.add({ targets: burst, radius, alpha: 0, duration: 250, onComplete: () => burst.destroy() });
    this.tweens.add({ targets: flash, radius: radius * .55, alpha: 0, duration: 150, onComplete: () => flash.destroy() });
    const sparkCount = radius >= 28 ? 8 : 4;
    for (let index = 0; index < sparkCount; index += 1) {
      const spark = this.add.rectangle(x, y, index % 2 ? 3 : 5, index % 2 ? 8 : 5, color, .9).setDepth(40);
      const angle = index / sparkCount * Math.PI * 2 + Phaser.Math.FloatBetween(-.25, .25);
      this.tweens.add({ targets: spark, x: x + Math.cos(angle) * radius, y: y + Math.sin(angle) * radius, alpha: 0, angle: angle * 180 / Math.PI + 90, duration: 280, onComplete: () => spark.destroy() });
    }
  }

  createDamageNumber(x, y, damage, critical) {
    const text = this.add.text(x, y - 34, `${Math.ceil(damage)}`, {
      fontFamily: 'ui-monospace, monospace', fontSize: critical ? '20px' : '15px', fontStyle: 'bold',
      color: critical ? '#fff07a' : '#fff1d1', stroke: '#53151e', strokeThickness: 4
    }).setOrigin(.5).setDepth(45);
    this.tweens.add({ targets: text, y: text.y - 28, alpha: 0, duration: 520, onComplete: () => text.destroy() });
  }

  rebuildOrbitals() {
    if (!this.orbitalGroup || !this.player?.active) return;
    this.orbitalGroup.clear(true, true);
    for (let index = 0; index < this.stats.orbitals; index += 1) {
      const orbital = this.orbitalGroup.create(this.player.x, this.player.y, 'orbit-talisman').setDisplaySize(24, 24).setDepth(29);
      orbital.setData('index', index);
      orbital.setData('hitTimes', new Map());
    }
  }

  updateSecondaryWeapons(time) {
    const orbitals = this.orbitalGroup.getChildren();
    orbitals.forEach((orbital, index) => {
      if (!orbital.active) return;
      const angle = time * .0024 + index / Math.max(1, orbitals.length) * Math.PI * 2;
      orbital.setPosition(this.player.x + Math.cos(angle) * 92, this.player.y + Math.sin(angle) * 92).setAngle(angle * 180 / Math.PI + 90);
      const hitTimes = orbital.getData('hitTimes');
      this.enemies.getChildren().forEach(enemy => {
        if (!enemy.active || Phaser.Math.Distance.Between(orbital.x, orbital.y, enemy.x, enemy.y) > 34) return;
        if ((hitTimes.get(enemy) || 0) > time) return;
        hitTimes.set(enemy, time + 520);
        this.damageEnemy(enemy, this.stats.damage * .42, { color: 0xffdf70 });
      });
    });
    if (this.stats.areaPulse > 0 && time >= this.nextAreaPulseAt) {
      this.nextAreaPulseAt = time + Math.max(2200, 4300 - this.stats.areaPulse * 400);
      const radius = (170 + this.stats.areaPulse * 25) * this.stats.areaScale;
      const pulse = this.add.circle(this.player.x, this.player.y, 28, 0x8edfc2, .12).setStrokeStyle(7, 0xb5ffe0, .9).setDepth(31);
      this.tweens.add({ targets: pulse, radius, alpha: 0, duration: 620, onComplete: () => pulse.destroy() });
      this.enemies.getChildren().forEach(enemy => {
        if (enemy.active && Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y) <= radius) this.damageEnemy(enemy, this.stats.damage * (.55 + this.stats.areaPulse * .12), { knockback: 55, color: 0x9be3c8 });
      });
      audio.tone(240, .3, 'sine', .04);
    }
  }

  updateStageHazards(time) {
    this.hazardZones = this.hazardZones.filter(zone => {
      if (time >= zone.expires || !zone.visual?.active) {
        zone.visual?.destroy();
        zone.rune?.destroy();
        return false;
      }
      zone.visual.setAlpha(.18 + Math.sin(time * .006) * .08);
      if (zone.rune?.active) zone.rune.setAngle(zone.rune.angle + .45);
      if (time >= zone.nextDamage && Phaser.Math.Distance.Between(this.player.x, this.player.y, zone.x, zone.y) <= zone.radius) {
        zone.nextDamage = time + 950;
        this.takePlayerDamage(zone.damage, zone.x, zone.y);
      }
      return true;
    });

    if (time < this.nextHazardAt || this.bossDefeated) return;
    const chapter = CAMPAIGN[this.chapterIndex];
    this.nextHazardAt = time + Math.max(2600, (8300 - this.elapsed * 36) * Math.pow(.9, this.chapterIndex));
    const x = Phaser.Math.Clamp(this.player.x + Phaser.Math.Between(-170, 170), 80, WORLD_WIDTH - 80);
    const y = Phaser.Math.Clamp(this.player.y + Phaser.Math.Between(-150, 150), 80, WORLD_HEIGHT - 80);
    if (chapter.hazard === 'illusions') {
      if (this.canSpawnReinforcements()) {
        for (let index = 0; index < 2 + Math.floor(this.elapsed / 28); index += 1) this.spawnEnemy(index === 0 && this.elapsed > SUNSET_START);
        showToast('여우 환영이 새로운 요괴 무리를 불러냈습니다!', 1800);
      }
    } else if (chapter.hazard === 'wind') {
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const gust = this.add.graphics().setDepth(33).lineStyle(11, 0xc9f1db, .38).lineBetween(this.player.x - Math.cos(angle) * 210, this.player.y - Math.sin(angle) * 210, this.player.x + Math.cos(angle) * 210, this.player.y + Math.sin(angle) * 210);
      this.tweens.add({ targets: gust, alpha: 0, x: Math.cos(angle) * 110, y: Math.sin(angle) * 110, duration: 650, onComplete: () => gust.destroy() });
      this.player.setVelocity(this.player.body.velocity.x + Math.cos(angle) * 260, this.player.body.velocity.y + Math.sin(angle) * 260);
      showToast('산바람이 이동 방향을 밀어냅니다!', 1500);
    } else if (chapter.hazard === 'rifts') {
      this.createPersistentHazard(x, y, 78, chapter.accent, 6200, 8 + this.chapterIndex * 2);
      if (this.canSpawnReinforcements()) {
        this.spawnEnemy(true);
        showToast('저승 균열에서 정예 옥졸이 나타났습니다!', 1800);
      }
    } else {
      const colors = { embers: 0xff7839, shards: 0xffcf62, plague: 0x67d7e4 };
      const radii = { embers: 68, shards: 58, plague: 82 };
      const delays = { embers: 720, shards: 880, plague: 620 };
      const marker = this.createHazardTelegraph(x, y, radii[chapter.hazard], colors[chapter.hazard], delays[chapter.hazard]);
      this.time.delayedCall(delays[chapter.hazard], () => {
        marker.destroy();
        this.createImpactBurst(x, y, colors[chapter.hazard], radii[chapter.hazard]);
        this.createGroundCracks(x, y, colors[chapter.hazard], radii[chapter.hazard] * .86);
        if (Phaser.Math.Distance.Between(this.player.x, this.player.y, x, y) <= radii[chapter.hazard] + 18) this.takePlayerDamage(7 + this.chapterIndex * 2, x, y);
        if (chapter.hazard === 'plague') this.createPersistentHazard(x, y, 72, colors[chapter.hazard], 4800, 6 + this.chapterIndex);
      });
    }
  }

  createHazardTelegraph(x, y, radius, color, duration) {
    const marker = this.add.graphics({ x, y }).setDepth(21);
    marker.fillStyle(color, .11).fillCircle(0, 0, radius);
    marker.lineStyle(5, color, .9).strokeCircle(0, 0, radius);
    marker.lineStyle(2, 0xffffff, .52).strokeCircle(0, 0, radius * .63);
    for (let tick = 0; tick < 12; tick += 1) {
      const angle = tick / 12 * Math.PI * 2;
      marker.lineStyle(tick % 3 ? 2 : 5, color, .78).lineBetween(Math.cos(angle) * radius * .72, Math.sin(angle) * radius * .72, Math.cos(angle) * radius, Math.sin(angle) * radius);
    }
    marker.fillStyle(0xffffff, .72).fillCircle(0, 0, 5);
    this.tweens.add({ targets: marker, scaleX: .48, scaleY: .48, alpha: .86, angle: 32, duration, ease: 'Cubic.easeIn' });
    return marker;
  }

  createPersistentHazard(x, y, radius, color, duration, damage) {
    const visual = this.add.graphics({ x, y }).setDepth(19);
    visual.fillStyle(color, .2).fillCircle(0, 0, radius);
    visual.lineStyle(5, color, .62).strokeCircle(0, 0, radius);
    visual.lineStyle(2, 0xffffff, .22).strokeCircle(0, 0, radius * .72);
    const rune = this.add.graphics({ x, y }).setDepth(20);
    rune.lineStyle(3, 0xffffff, .38).strokeCircle(0, 0, radius * .5);
    for (let point = 0; point < 6; point += 1) {
      const angle = point / 6 * Math.PI * 2;
      const next = (point + 2) / 6 * Math.PI * 2;
      rune.lineBetween(Math.cos(angle) * radius * .22, Math.sin(angle) * radius * .22, Math.cos(next) * radius * .5, Math.sin(next) * radius * .5);
    }
    this.tweens.add({ targets: rune, scaleX: 1.18, scaleY: 1.18, yoyo: true, repeat: Math.ceil(duration / 900), duration: 450 });
    this.hazardZones.push({ visual, rune, x, y, radius, damage, expires: this.time.now + duration, nextDamage: this.time.now + 300 });
  }

  spawnExperienceOrbs(x, y, totalExperience, count = 1, size = 11, scatter = 12) {
    const orbCount = Math.max(1, count);
    for (let index = 0; index < orbCount; index += 1) {
      const orb = this.orbs.create(
        x + Phaser.Math.Between(-scatter, scatter),
        y + Phaser.Math.Between(-scatter, scatter),
        'xp-orb'
      ).setDepth(16);
      orb.value = totalExperience / orbCount;
      orb.setData('spawnedAt', this.time.now);
      orb.setData('bossVacuum', false);
      orb.setDisplaySize(size, size).clearTint();
    }
  }

  killEnemy(enemy) {
    if (!enemy.active) return;
    if (enemy.kind === 'boss') {
      this.defeatBoss(enemy);
      return;
    }
    const { x, y, xpValue, elite, isMidBoss } = enemy;
    const treasureRewardKey = enemy.getData('treasureRewardKey');
    const shouldDropTreasure = Boolean(isMidBoss && !enemy.getData('noTreasure') && !enemy.getData('treasureDropped'));
    if (shouldDropTreasure) enemy.setData('treasureDropped', true);
    enemy.getData('shadow')?.destroy();
    enemy.destroy();
    this.kills += 1;
    this.chapterKills += 1;
    this.spawnExperienceOrbs(x, y, xpValue, elite ? 3 : 1, elite ? 15 : 11);
    if (shouldDropTreasure) this.spawnChest(x, y, treasureRewardKey);
  }

  defeatBoss(boss) {
    const chapter = CAMPAIGN[this.chapterIndex];
    const finalBossDefeated = this.chapterIndex === CAMPAIGN.length - 1;
    const x = boss.x;
    const y = boss.y;
    const bossXp = boss.xpValue || 35;
    boss.getData('shadow')?.destroy();
    boss.destroy();
    this.activeBoss = null;
    this.bossDefeated = true;
    this.kills += 1;
    this.chapterKills += 1;
    ui.bossPanel.classList.add('hidden');
    this.enemyProjectiles.clear(true, true);
    this.projectiles.clear(true, true);
    this.hazardZones.forEach(zone => {
      zone.visual?.destroy();
      zone.rune?.destroy();
    });
    this.hazardZones = [];
    this.clearMapDevices();
    let remainingEnemyCount = 0;
    this.enemies.getChildren().forEach(enemy => {
      if (!enemy.active) return;
      this.spawnExperienceOrbs(enemy.x, enemy.y, enemy.xpValue || 1, enemy.elite ? 3 : 1, enemy.elite ? 15 : 11);
      remainingEnemyCount += 1;
      enemy.getData('shadow')?.destroy();
      enemy.destroy();
    });
    this.kills += remainingEnemyCount;
    this.chapterKills += remainingEnemyCount;
    this.spawnExperienceOrbs(x, y, bossXp, 6, 16, 42);
    this.beginBossExperienceCollection();
    this.spawnPortal(x + 132, y);
    this.spawnChest(x, y, `chapter-${this.chapterIndex}-boss`);
    if (finalBossDefeated && !isSejongUnlocked()) {
      this.sejongUnlockedThisRun = unlockSejong();
      buildCharacterCards();
    }
    audio.portal();
    this.cameras.main.flash(420, 255, 225, 150, false);
    this.cameras.main.shake(360, .011);
    for (let index = 0; index < 6; index += 1) {
      this.time.delayedCall(index * 90, () => this.createImpactBurst(x + Phaser.Math.Between(-70, 70), y + Phaser.Math.Between(-70, 70), chapter.accent, 42));
    }
    showToast(
      this.sejongUnlockedThisRun
        ? `${chapter.bossName} 처치! 숨겨진 수호자 세종대왕이 해금되었습니다.`
        : `${chapter.bossName} 처치! 보물이 나타났습니다.`,
      this.sejongUnlockedThisRun ? 4400 : 3000
    );
  }

  beginBossExperienceCollection() {
    const orbs = this.orbs.getChildren().filter(orb => orb.active);
    this.bossExperienceCollectionActive = true;
    orbs.forEach((orb, index) => {
      orb.setData('bossVacuum', true);
      orb.clearTint();
      orb.setDepth(26 + index % 2);
    });
    audio.tone(520, .38, 'sine', .035);
    audio.tone(780, .42, 'triangle', .025, .12);
    if (!orbs.length) this.finishBossExperienceCollection();
  }

  finishBossExperienceCollection() {
    if (!this.bossExperienceCollectionActive) return;
    this.bossExperienceCollectionActive = false;
    this.processPendingChoiceQueue();
  }

  reconcileBossExperienceCollection() {
    if (!this.bossExperienceCollectionActive) return;
    const hasVacuumOrbs = this.orbs.getChildren().some(orb => (
      orb.active && orb.getData('bossVacuum') === true
    ));
    if (!hasVacuumOrbs) this.finishBossExperienceCollection();
  }

  spawnPortal(x, y) {
    const portalX = Phaser.Math.Clamp(x, 90, WORLD_WIDTH - 90);
    const portalY = Phaser.Math.Clamp(y, 90, WORLD_HEIGHT - 90);
    const portal = this.portals.create(portalX, portalY, 'portal').setDisplaySize(86, 86).setDepth(27).setImmovable(true);
    portal.body.setAllowGravity(false);
    portal.setData('chapter', this.chapterIndex);
    const chapter = CAMPAIGN[this.chapterIndex];
    const beam = this.add.rectangle(portalX, portalY - 72, 92, 250, chapter.accent, .09).setDepth(201);
    const arrow = this.add.triangle(portalX, portalY - 76, 0, 0, 24, 0, 12, 18, 0xffef9b, .95).setDepth(203);
    const label = this.add.text(portalX, portalY - 118, '', {
      fontFamily: '"Malgun Gothic", sans-serif', fontSize: '18px', fontStyle: 'bold', align: 'center',
      color: '#fff4c6', stroke: '#21142f', strokeThickness: 6, backgroundColor: 'rgba(8,7,16,.76)', padding: { x: 12, y: 7 }
    }).setOrigin(.5).setDepth(204);
    portal.setData('guideBeam', beam);
    portal.setData('guideArrow', arrow);
    portal.setData('guideLabel', label);
    this.tweens.add({ targets: beam, alpha: .2, scaleX: 1.2, yoyo: true, repeat: -1, duration: 860, ease: 'Sine.easeInOut' });
    this.tweens.add({ targets: arrow, y: arrow.y + 14, yoyo: true, repeat: -1, duration: 520, ease: 'Sine.easeInOut' });
    this.tweens.add({ targets: label, scaleX: 1.04, scaleY: 1.04, yoyo: true, repeat: -1, duration: 780, ease: 'Sine.easeInOut' });
    this.tweens.add({ targets: portal, scaleX: portal.scaleX * 1.16, scaleY: portal.scaleY * 1.16, angle: 360, yoyo: true, repeat: -1, duration: 920, ease: 'Sine.easeInOut' });
    this.updatePortalGuide();
  }

  updatePortalGuide() {
    this.portals?.getChildren().filter(portal => portal.active).forEach(portal => {
      const label = portal.getData('guideLabel');
      if (label?.active) label.setText('다음 설화로 이동\n포탈 안으로 들어가세요');
      const arrow = portal.getData('guideArrow');
      if (arrow?.active) arrow.setFillStyle(0xffef9b, .95);
    });
    this.updateChapterHud();
  }

  destroyPortalGuide(portal) {
    ['guideBeam', 'guideArrow', 'guideLabel'].forEach(key => {
      const object = portal?.getData(key);
      if (!object) return;
      this.tweens.killTweensOf(object);
      object.destroy();
    });
  }

  enterPortal(player, portal) {
    if (!portal?.active || this.state !== 'running' || !this.bossDefeated) return;
    if (this.time.now < this.portalConfirmCooldownUntil || portal.getData('confirming')) return;
    const touchedChest = this.findTouchedChest();
    this.rememberChestCheckPosition();
    if (touchedChest) {
      if (this.openChest(player, touchedChest)) this.portalConfirmCooldownUntil = this.time.now + 240;
      return;
    }
    this.showPortalConfirmation(portal);
  }

  showPortalConfirmation(portal) {
    if (!portal?.active || this.state !== 'running') return;
    audio.startBgm();
    const finalChapter = this.chapterIndex >= CAMPAIGN.length - 1;
    const nextChapter = CAMPAIGN[this.chapterIndex + 1];
    this.pendingPortal = portal;
    portal.setData('confirming', true);
    this.state = 'portal-confirm';
    this.physics.pause();
    this.player.setVelocity(0, 0);
    ui.portalConfirmHeading.textContent = finalChapter
      ? '여섯 설화를 모두 완성할까요?'
      : `${nextChapter.name}로 넘어갈까요?`;
    ui.portalConfirmCopy.textContent = finalChapter
      ? '마지막 포탈을 통과하면 이번 모험을 완성합니다. 아직 남아 있으려면 돌아가기를 선택하세요.'
      : `${CAMPAIGN[this.chapterIndex].name}을 떠나 ${nextChapter.name}로 이동합니다. 아직 보물이나 경험치를 확인하려면 현재 설화에 머무르세요.`;
    ui.portalGo.textContent = finalChapter ? '설화 완성하기' : '다음 설화로 이동';
    ui.portalConfirm.classList.remove('hidden');
  }

  confirmPortalTransition() {
    if (this.state !== 'portal-confirm') return;
    const portal = this.pendingPortal;
    ui.portalConfirm.classList.add('hidden');
    this.pendingPortal = null;
    if (!portal?.active) {
      this.state = 'running';
      this.physics.resume();
      return;
    }
    portal.setData('confirming', false);
    this.state = 'running';
    this.travelThroughPortal(portal);
  }

  cancelPortalTransition() {
    if (this.state !== 'portal-confirm') return;
    const portal = this.pendingPortal;
    ui.portalConfirm.classList.add('hidden');
    this.pendingPortal = null;
    portal?.setData('confirming', false);
    this.portalConfirmCooldownUntil = this.time.now + 1100;
    this.state = 'running';
    this.physics.resume();
    if (portal?.active && this.player?.active) {
      let dx = this.player.x - portal.x;
      let dy = this.player.y - portal.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 1) {
        dx = -1;
        dy = 0;
      } else {
        dx /= distance;
        dy /= distance;
      }
      this.player.setPosition(
        Phaser.Math.Clamp(portal.x + dx * 118, 45, WORLD_WIDTH - 45),
        Phaser.Math.Clamp(portal.y + dy * 118, 45, WORLD_HEIGHT - 45)
      ).setVelocity(0, 0);
      this.rememberChestCheckPosition();
    }
    showToast('현재 설화에 머무릅니다. 포탈에 다시 들어가면 이동 여부를 선택할 수 있습니다.', 2600);
  }

  travelThroughPortal(portal) {
    if (!portal?.active || !this.bossDefeated) return;
    const carryBossExperience = this.bossExperienceCollectionActive;
    this.destroyPortalGuide(portal);
    portal.destroy();
    if (this.chapterIndex >= CAMPAIGN.length - 1) {
      this.completeCampaign();
      return;
    }
    this.state = 'transition';
    this.physics.pause();
    this.chapterIndex += 1;
    this.elapsed = 0;
    this.chapterKills = 0;
    this.bossSpawned = false;
    this.bossDefeated = false;
    this.bossSpawnElapsed = null;
    this.portalConfirmCooldownUntil = 0;
    this.lastTreasureSpawnAt = -Infinity;
    this.lastTreasurePosition = null;
    this.midBossesSpawned = 0;
    this.activeBoss = null;
    this.nextSpawnAt = this.time.now + 1600;
    this.nextHazardAt = this.time.now + 6500;
    this.chests.clear(true, true);
    if (!carryBossExperience) this.orbs.clear(true, true);
    this.projectiles.clear(true, true);
    this.hazardZones.forEach(zone => zone.visual?.destroy());
    this.hazardZones.forEach(zone => zone.rune?.destroy());
    this.hazardZones = [];
    this.player.setPosition(WORLD_WIDTH / 2, WORLD_HEIGHT / 2).setVelocity(0, 0);
    this.rememberChestCheckPosition();
    this.cameras.main.flash(620, 190, 220, 255, false);
    this.applyChapterTheme(this.chapterIndex);
    this.updateChapterHud();
    audio.setNight(false);
    audio.portal();
    const chapter = CAMPAIGN[this.chapterIndex];
    showChapterBriefing(this, chapter);
  }

  resumeChapterBriefing() {
    if (!this.player?.active || this.state !== 'transition') return;
    const chapter = CAMPAIGN[this.chapterIndex];
    this.nextSpawnAt = this.time.now + 1000;
    this.nextHazardAt = this.time.now + 6500;
    this.nextAttackAt = this.time.now + 350;
    this.physics.resume();
    this.state = 'running';
    audio.startBgm();
    showToast(`설화 ${this.chapterIndex + 1} · ${chapter.name} 전투 시작`, 2600);
    if (!this.bossExperienceCollectionActive) this.time.delayedCall(80, () => {
      this.processPendingChoiceQueue();
    });
  }

  completeCampaign() {
    const sejongNewlyUnlocked = this.sejongUnlockedThisRun || (!isSejongUnlocked() && unlockSejong());
    buildCharacterCards();
    this.state = 'victory';
    this.physics.pause();
    audio.stopBgm();
    audio.victory();
    ui.pauseKicker.textContent = sejongNewlyUnlocked ? 'HIDDEN GUARDIAN UNLOCKED' : 'ALL FOLKLORE RESTORED';
    ui.pauseHeading.textContent = sejongNewlyUnlocked
      ? `여섯 설화를 모두 구했습니다 · 세종대왕 해금! 다음 판부터 선택할 수 있습니다.`
      : `여섯 설화를 모두 구했습니다 · 총 ${this.kills}마리 처치`;
    ui.pauseSoundSettings.classList.add('hidden');
    ui.resume.classList.add('hidden');
    ui.pause.classList.remove('hidden');
  }

  collectOrb(player, orb) {
    if (!orb?.active) return;
    const fromBossCollection = orb.getData('bossVacuum') === true;
    const experience = orb.value || 1;
    orb.destroy();
    if (!fromBossCollection || this.time.now - this.lastBossOrbAudioAt >= 70) {
      audio.collect();
      this.lastBossOrbAudioAt = this.time.now;
    }
    // 보스 흡수는 이동 방식만 다르며, 경험치와 레벨 계산은 일반 구슬과 완전히 같다.
    this.addExperience(experience);
    if (fromBossCollection && this.bossExperienceCollectionActive && this.orbs.countActive(true) === 0) {
      this.finishBossExperienceCollection();
    }
  }

  addExperience(amount) {
    this.xp += Math.max(0, amount);
    while (this.xp >= this.xpNeeded) {
      this.xp -= this.xpNeeded;
      this.level += 1;
      const previousMaxHP = this.stats.maxHP;
      this.stats.maxHP *= 1 + LEVEL_MAX_HP_GROWTH;
      const maxHPGain = this.stats.maxHP - previousMaxHP;
      this.stats.hp = Math.min(this.stats.maxHP, this.stats.hp + maxHPGain);
      this.xpNeeded = experienceRequired(this.level);
      this.pendingLevels += 1;
      this.pendingLevelChoices.push({ level: this.level, maxHPGain });
    }
    this.updateHud();
    this.processPendingChoiceQueue();
  }

  resolveTreasureSpawnPosition(forcedX, forcedY) {
    const origin = {
      x: Phaser.Math.Clamp(forcedX, 90, WORLD_WIDTH - 90),
      y: Phaser.Math.Clamp(forcedY, 90, WORLD_HEIGHT - 90)
    };
    if (this.time.now - this.lastTreasureSpawnAt > RAPID_TREASURE_WINDOW_MS) return origin;

    const occupied = this.chests.getChildren()
      .filter(chest => chest.active)
      .map(chest => ({ x: chest.x, y: chest.y }));
    if (this.lastTreasurePosition) occupied.push(this.lastTreasurePosition);
    if (!occupied.length) return origin;

    const nearestDistance = point => Math.min(...occupied.map(other => Phaser.Math.Distance.Between(point.x, point.y, other.x, other.y)));
    if (nearestDistance(origin) >= TREASURE_MIN_SEPARATION) return origin;

    let best = { ...origin, clearance: nearestDistance(origin) };
    [TREASURE_MIN_SEPARATION + 10, 240, 290].forEach(radius => {
      for (let step = 0; step < 12; step += 1) {
        const angle = step / 12 * Math.PI * 2 + this.chapterIndex * .37;
        const candidate = {
          x: Phaser.Math.Clamp(origin.x + Math.cos(angle) * radius, 90, WORLD_WIDTH - 90),
          y: Phaser.Math.Clamp(origin.y + Math.sin(angle) * radius, 90, WORLD_HEIGHT - 90)
        };
        const clearance = nearestDistance(candidate);
        if (clearance > best.clearance) best = { ...candidate, clearance };
      }
    });
    return { x: best.x, y: best.y };
  }

  spawnChest(forcedX, forcedY, rewardKey) {
    if (!Number.isFinite(forcedX) || !Number.isFinite(forcedY)) return;
    if (rewardKey && this.treasureRewardKeys.has(rewardKey)) return;
    if (rewardKey) this.treasureRewardKeys.add(rewardKey);
    const { x, y } = this.resolveTreasureSpawnPosition(forcedX, forcedY);
    const chest = this.chests.create(x, y, 'treasure-chest')
      .setDisplaySize(66, 66)
      .setDepth(18)
      .setImmovable(true);
    chest.body.setAllowGravity(false);
    chest.setData('spawnedAt', this.time.now);
    chest.setData('rewardKey', rewardKey || null);
    chest.setData('claimed', false);
    this.lastTreasureSpawnAt = this.time.now;
    this.lastTreasurePosition = { x, y };
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

  distanceToPlayerPickupPath(x, y) {
    const endX = this.player.x;
    const endY = this.player.y;
    const startX = this.lastChestCheckPosition?.x ?? endX;
    const startY = this.lastChestCheckPosition?.y ?? endY;
    const dx = endX - startX;
    const dy = endY - startY;
    const travelSquared = dx * dx + dy * dy;
    if (travelSquared <= 0 || travelSquared > CHEST_PICKUP_SWEEP_LIMIT * CHEST_PICKUP_SWEEP_LIMIT) {
      return Phaser.Math.Distance.Between(endX, endY, x, y);
    }
    const progress = Phaser.Math.Clamp(((x - startX) * dx + (y - startY) * dy) / travelSquared, 0, 1);
    const nearestX = startX + dx * progress;
    const nearestY = startY + dy * progress;
    return Phaser.Math.Distance.Between(nearestX, nearestY, x, y);
  }

  rememberChestCheckPosition() {
    if (!this.player?.active) return;
    this.lastChestCheckPosition = { x: this.player.x, y: this.player.y };
  }

  canCollectChest(chest) {
    return Boolean(
      chest?.active
      && chest.getData('claimed') !== true
      && this.player?.active
      && this.state === 'running'
    );
  }

  findTouchedChest() {
    if (!this.player?.active) return null;
    return this.chests.getChildren().find(chest => {
      if (!this.canCollectChest(chest)) return false;
      const visualRadius = (
        Math.max(this.player.displayWidth, this.player.displayHeight)
        + Math.max(chest.displayWidth, chest.displayHeight)
      ) * .55;
      const pickupRadius = Math.max(CHEST_PICKUP_RADIUS, visualRadius);
      return this.distanceToPlayerPickupPath(chest.x, chest.y) <= pickupRadius;
    }) || null;
  }

  updateChestPickups() {
    if (this.state !== 'running') return;
    const touchedChest = this.findTouchedChest();
    this.rememberChestCheckPosition();
    if (touchedChest) this.openChest(this.player, touchedChest);
  }

  processPendingChoiceQueue() {
    if (this.state !== 'running' || this.bossExperienceCollectionActive) return false;
    if (this.pendingLevels > 0) {
      this.offerChoices(false);
      return true;
    }
    return this.offerPendingTreasureChoice();
  }

  offerPendingTreasureChoice() {
    if (
      this.pendingTreasureChoices <= 0
      || this.state !== 'running'
      || this.bossExperienceCollectionActive
      || this.pendingLevels > 0
    ) return false;
    this.pendingTreasureChoices -= 1;
    this.offerChoices(true);
    return true;
  }

  openChest(player, chest) {
    if (!this.canCollectChest(chest)) return false;
    chest.setData('claimed', true);
    const deferTreasureChoice = this.bossExperienceCollectionActive || this.pendingLevels > 0 || this.pendingTreasureChoices > 0;
    const chestX = chest.x;
    const chestY = chest.y;
    this.tweens.killTweensOf(chest);
    this.createChestBurst(chestX, chestY);
    chest.destroy();
    if (deferTreasureChoice) {
      this.pendingTreasureChoices += 1;
      this.processPendingChoiceQueue();
      return true;
    }
    this.offerChoices(true);
    return true;
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

  freezeCombatForChoice() {
    if (this.choiceFreezeActive) return;
    this.choiceFreezeActive = true;
    this.physics.pause();
    this.tweens.pauseAll();
    this.time.paused = true;
    this.player?.setVelocity(0, 0);
  }

  resumeCombatAfterChoice() {
    if (!this.choiceFreezeActive) return;
    this.choiceInvulnerableUntil = performance.now() + CHOICE_EXIT_INVULNERABILITY_MS;
    this.time.paused = false;
    this.tweens.resumeAll();
    this.physics.resume();
    this.choiceFreezeActive = false;
  }

  offerChoices(treasure) {
    this.state = 'choosing';
    this.freezeCombatForChoice();
    if (treasure) audio.chest();
    else audio.level();

    const pool = SKILLS.filter(skill => treasure ? skill.rare : !skill.rare);
    const shuffled = Phaser.Utils.Array.Shuffle([...pool]).slice(0, 3);
    const pendingLevelChoice = treasure ? null : this.pendingLevelChoices[0];
    const displayedLevel = pendingLevelChoice?.level ?? Math.max(1, this.level - this.pendingLevels + 1);
    ui.choiceKicker.textContent = treasure ? 'TREASURE FOUND' : `LEVEL ${displayedLevel}`;
    ui.choiceTitle.textContent = treasure ? '보물의 힘을 선택하세요' : '새로운 힘을 선택하세요';
    ui.choiceCopy.textContent = treasure
      ? '상자에서 희귀한 설화의 힘이 깨어났습니다.'
      : `최대 체력이 ${Math.max(1, Math.round(pendingLevelChoice?.maxHPGain || 0))} 증가하고 같은 만큼 회복되었습니다. 하나를 선택하세요.`;
    ui.choiceGrid.innerHTML = '';

    shuffled.forEach(skill => {
      const button = document.createElement('button');
      button.className = 'choice-card';
      button.innerHTML = `
        ${skillIconMarkup(skill)}
        <strong>${skill.title}</strong>
        <small>${skill.description}</small>
        ${skill.rare ? '<span class="rare-label">희귀 보물</span>' : ''}
      `;
      button.addEventListener('click', () => {
        audio.click();
        skill.apply(this);
        ui.choice.classList.add('hidden');
        if (!treasure) {
          this.pendingLevels = Math.max(0, this.pendingLevels - 1);
          this.pendingLevelChoices.shift();
        }
        if (this.pendingLevels > 0) {
          window.setTimeout(() => {
            if (this.state === 'choosing') this.offerChoices(false);
          }, 80);
          return;
        }
        this.state = 'running';
        this.updateHud();
        showToast(`${skill.title} 획득!`);
        if (this.processPendingChoiceQueue()) return;
        this.resumeCombatAfterChoice();
      }, { once: true });
      ui.choiceGrid.appendChild(button);
    });

    ui.choice.classList.remove('hidden');
  }

  onPlayerHit(player, enemy) {
    if (!enemy?.active || this.state !== 'running') return;
    if (this.time.now < (enemy.nextContactAt || 0)) return;
    enemy.nextContactAt = this.time.now + (enemy.kind === 'boss' ? 1050 : 1250);
    const contactDamage = enemy.damage * (enemy.kind === 'boss' ? .8 : .65) * (1 - this.stats.contactGuard);
    this.createImpactBurst(player.x, player.y, 0xff5c45, enemy.kind === 'boss' ? 24 : 15);
    this.takePlayerDamage(contactDamage, enemy.x, enemy.y);
    if (enemy.kind === 'melee' && !enemy.getData('attacking') && this.time.now >= enemy.nextAttackAt) {
      this.performEnemyMeleeAttack(enemy);
    }
  }

  performEnemyMeleeAttack(enemy) {
    if (!enemy?.active || this.state !== 'running' || enemy.getData('attacking')) return;
    enemy.nextAttackAt = this.time.now + Phaser.Math.Between(1900, 2800);
    enemy.setData('attacking', true);
    enemy.setVelocity(0, 0);
    enemy.setTint(0xff6b5e);

    const startX = enemy.x;
    const startY = enemy.y;
    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
    const windupX = startX - Math.cos(angle) * 18;
    const windupY = startY - Math.sin(angle) * 18;
    this.tweens.add({
      targets: enemy,
      x: windupX,
      y: windupY,
      scaleX: enemy.scaleX * 1.12,
      scaleY: enemy.scaleY * .88,
      angle: enemy.flipX ? -12 : 12,
      duration: 300,
      ease: 'Cubic.easeOut'
    });

    const warning = this.add.circle(enemy.x, enemy.y, 34, HOSTILE_ATTACK_DARK, .3)
      .setStrokeStyle(4, HOSTILE_ATTACK_COLOR, .96)
      .setDepth(19);
    this.createHostileMarker(enemy.x, enemy.y, 38, 430);
    this.tweens.add({
      targets: warning,
      scaleX: .62,
      scaleY: .62,
      alpha: .9,
      duration: 420
    });

    const tell = this.add.graphics().setDepth(21);
    tell.lineStyle(8, HOSTILE_ATTACK_DARK, .76);
    tell.lineBetween(enemy.x, enemy.y, enemy.x + Math.cos(angle) * 100, enemy.y + Math.sin(angle) * 100);
    tell.lineStyle(3, HOSTILE_ATTACK_COLOR, .96);
    tell.lineBetween(enemy.x, enemy.y, enemy.x + Math.cos(angle) * 100, enemy.y + Math.sin(angle) * 100);
    this.tweens.add({ targets: tell, alpha: 0, duration: 430, onComplete: () => tell.destroy() });

    this.time.delayedCall(430, () => {
      warning.destroy();
      if (!enemy.active) return;
      if (this.state !== 'running' || !this.player?.active) {
        enemy.setData('attacking', false);
        enemy.setTint(enemy.getData('baseTint') || 0xffffff);
        return;
      }
      const strikeAngle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
      this.tweens.add({
        targets: enemy,
        x: enemy.x + Math.cos(strikeAngle) * 58,
        y: enemy.y + Math.sin(strikeAngle) * 58,
        scaleX: enemy.scaleX * .94,
        scaleY: enemy.scaleY * 1.14,
        duration: 110,
        yoyo: true,
        onComplete: () => {
          if (!enemy.active) return;
          enemy.setData('attacking', false);
          enemy.clearTint();
          enemy.setScale(Math.abs(enemy.scaleX), Math.abs(enemy.scaleY));
          enemy.setAngle(0);
        }
      });
      const distance = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
      if (distance > 118) return;
      this.createMeleeSlash(enemy.x, enemy.y, this.player.x, this.player.y);
      this.takePlayerDamage(enemy.damage, enemy.x, enemy.y);
      audio.impact();
    });
  }

  createMeleeSlash(sourceX, sourceY, targetX, targetY) {
    const angle = Phaser.Math.Angle.Between(sourceX, sourceY, targetX, targetY);
    const impactX = targetX - Math.cos(angle) * 18;
    const impactY = targetY - Math.sin(angle) * 18;
    const slash = this.add.graphics().setDepth(36);
    slash.lineStyle(9, HOSTILE_ATTACK_DARK, .96);
    slash.beginPath();
    slash.arc(impactX, impactY, 28, angle - .9, angle + .9, false);
    slash.strokePath();
    slash.lineStyle(5, HOSTILE_ATTACK_COLOR, 1);
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
    const impact = this.add.circle(x, y, 13, HOSTILE_ATTACK_COLOR, .95)
      .setStrokeStyle(5, HOSTILE_ATTACK_DARK, 1)
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
    if (this.state !== 'running' || performance.now() < this.choiceInvulnerableUntil) return;
    if (this.time.now - this.lastHitAt < 900) return;
    this.lastHitAt = this.time.now;
    const damage = Math.max(1, rawDamage * (1 - (this.mapGuard || 0)) - this.stats.armor);
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
    ui.levelText.textContent = `${Math.floor(this.xp)}/${this.xpNeeded} · LV ${this.level}`;
    const minutes = Math.floor(this.elapsed / 60).toString().padStart(2, '0');
    const seconds = Math.floor(this.elapsed % 60).toString().padStart(2, '0');
    ui.timer.textContent = `${minutes}:${seconds}`;
    ui.runStats.textContent = `처치 ${this.kills} · 공격력 ${Math.round(this.stats.damage)} · 방어 ${this.stats.armor} · ${this.selectedCharacter.attack}`;
    if (this.activeBoss?.active) {
      ui.bossFill.style.width = `${Phaser.Math.Clamp(this.activeBoss.hp / this.activeBoss.maxHp * 100, 0, 100)}%`;
      const phase = this.activeBoss.getData('enraged') ? ' · 폭주' : '';
      ui.bossName.textContent = `${CAMPAIGN[this.chapterIndex].bossName}${phase} · ${Math.max(0, Math.ceil(this.activeBoss.hp))}/${Math.ceil(this.activeBoss.maxHp)}`;
    }
    this.updateChapterHud();
    this.updateSunClock();
    this.drawMinimap();
  }

  updateSunClock() {
    const progress = Phaser.Math.Clamp(this.elapsed / NIGHT_START, 0, 1);
    const angle = -135 + progress * 270;
    ui.sunClockHand.style.transform = `rotate(${angle}deg)`;

    if (this.bossDefeated) {
      ui.sunsetLabel.textContent = '보스 처치 완료';
      ui.sunsetCountdown.textContent = '포탈로 이동';
      ui.sunClockHand.style.background = '#a9d8ff';
      ui.sunClockHand.style.boxShadow = '0 0 9px #7457df';
    } else if (this.elapsed < NIGHT_START) {
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

  updateChapterHud() {
    const chapter = CAMPAIGN[this.chapterIndex] || CAMPAIGN[0];
    ui.chapterLabel.textContent = `설화 ${this.chapterIndex + 1} / ${CAMPAIGN.length}`;
    ui.chapterName.textContent = this.bossDefeated
      ? `${chapter.name} · 포탈 안으로 들어가세요`
      : `${chapter.name} · ${chapter.bossName}`;
  }

  getTreasureDirection(chest) {
    if (!chest?.active || !this.player?.active) return '보물 없음';
    const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, chest.x, chest.y);
    const octant = Math.round((angle + Math.PI * 2) / (Math.PI / 4)) % 8;
    const directions = ['동쪽', '동남쪽', '남쪽', '서남쪽', '서쪽', '서북쪽', '북쪽', '동북쪽'];
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
    const chapter = CAMPAIGN[this.chapterIndex] || CAMPAIGN[0];
    const mapColor = this.elapsed >= NIGHT_START ? '#141724' : this.elapsed >= SUNSET_START ? '#38303d' : chapter.map;

    context.clearRect(0, 0, width, height);
    context.fillStyle = mapColor;
    context.fillRect(0, 0, width, height);

    context.fillStyle = this.elapsed >= NIGHT_START ? 'rgba(119,111,104,.3)' : 'rgba(181,159,111,.34)';
    context.fillRect(0, (WORLD_HEIGHT / 2 - 68) * scaleY, width, 136 * scaleY);
    context.fillRect((WORLD_WIDTH / 2 - 72) * scaleX, 0, 144 * scaleX, height);

    const accentCss = `#${chapter.accent.toString(16).padStart(6, '0')}`;
    context.fillStyle = `${accentCss}55`;
    [
      [230, 250], [2140, 310], [300, 1480], [2050, 1430],
      [720, 620], [1690, 1180]
    ].forEach(([x, y]) => {
      x = x / 2400 * WORLD_WIDTH;
      y = y / 1800 * WORLD_HEIGHT;
      context.beginPath();
      context.arc(x * scaleX, y * scaleY, 8, 0, Math.PI * 2);
      context.fill();
    });

    (this.mapDevices || []).forEach(device => {
      const x = device.x * scaleX;
      const y = device.y * scaleY;
      context.fillStyle = `${accentCss}33`;
      context.strokeStyle = accentCss;
      context.lineWidth = 3;
      context.beginPath();
      context.arc(x, y, 7 + Math.sin(this.time.now * .005 + device.order) * 2, 0, Math.PI * 2);
      context.fill();
      context.stroke();
      context.fillStyle = '#fff1c4';
      context.beginPath();
      context.arc(x, y, 2.5, 0, Math.PI * 2);
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

    const activePortals = this.portals?.getChildren().filter(portal => portal.active) || [];
    activePortals.forEach(portal => {
      const x = portal.x * scaleX;
      const y = portal.y * scaleY;
      context.strokeStyle = '#a5d8ff';
      context.lineWidth = 5;
      context.beginPath();
      context.arc(x, y, 11 + Math.sin(this.time.now * .006) * 3, 0, Math.PI * 2);
      context.stroke();
      context.fillStyle = '#7258d9';
      context.beginPath();
      context.arc(x, y, 5, 0, Math.PI * 2);
      context.fill();
    });

    if (this.activeBoss?.active) {
      context.fillStyle = '#f44745';
      context.strokeStyle = '#ffd274';
      context.lineWidth = 3;
      context.beginPath();
      context.arc(this.activeBoss.x * scaleX, this.activeBoss.y * scaleY, 10, 0, Math.PI * 2);
      context.fill();
      context.stroke();
    }

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

    ui.treasureHint.textContent = activePortals.length ? '다음 설화 포탈' : activeChests.length ? this.getTreasureDirection(activeChests[0]) : this.activeBoss?.active ? `보스: ${chapter.bossName}` : '보물 없음';
    ui.treasureHint.style.color = activePortals.length ? '#a8d7ff' : activeChests.length ? '#ffd36a' : this.activeBoss?.active ? '#ff8b78' : '#bdb5a7';
  }

  resetPauseCopy() {
    ui.pauseKicker.textContent = 'PAUSED';
    ui.pauseHeading.textContent = '잠시 숨을 고르세요';
    ui.pauseSoundSettings.classList.remove('hidden');
    ui.resume.classList.remove('hidden');
  }

  togglePause(forcePause) {
    if (!this.player?.active || ['choosing', 'portal-confirm', 'gameover', 'transition', 'victory'].includes(this.state)) return;
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
    ui.pauseHeading.textContent = `${this.chapterIndex + 1}번째 설화 · 총 ${Math.floor(this.totalElapsed)}초 동안 싸웠습니다`;
    ui.pauseSoundSettings.classList.add('hidden');
    ui.resume.classList.add('hidden');
    ui.pause.classList.remove('hidden');
  }
}

const config = {
  type: Phaser.AUTO,
  width: WIDTH,
  height: HEIGHT,
  resolution: RENDER_RESOLUTION,
  parent: 'game-container',
  backgroundColor: '#070914',
  antialias: true,
  antialiasGL: true,
  pixelArt: false,
  roundPixels: false,
  render: {
    antialias: true,
    antialiasGL: true,
    pixelArt: false,
    roundPixels: false,
    powerPreference: 'high-performance'
  },
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

const startButton = document.getElementById('start-button');
const defaultStartLabel = startButton.textContent;
window.GAME_READY = false;
startButton.dataset.readyLabel = defaultStartLabel;
startButton.disabled = true;
startButton.textContent = '게임 이미지 불러오는 중...';

Promise.all([
  decodeEmbeddedSprites().catch(error => {
    console.error(error);
    return {};
  }),
  decodeChapterBackgrounds()
])
  .then(([decodedSprites, decodedBackgrounds]) => {
    window.DECODED_SPRITES = decodedSprites;
    window.DECODED_BACKGROUNDS = decodedBackgrounds;
    window.game = new Phaser.Game(config);
  })
  .catch(error => {
    console.error(error);
    updateMapLoadingScreen(0, '맵 이미지를 불러오지 못했습니다. 새로고침해 주세요.', true);
  });
