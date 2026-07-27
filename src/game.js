/* Phaser 3 데모 (수정본)
   - 밤 배경(조선 산 실루엣)
   - 플레이어가 드는 호롱불을 중심으로 '빛 범위'만 보이는 암전 마스크 구현
   - 제목 "Mountain Demons" 표시
   - 기존 자동 공격/적/보스 로직 유지
*/

const WIDTH = 960;
const HEIGHT = 640;

const CHARACTERS = [
  { id: 'dokkaebi', name: '도깨비', magic: 10, phys: 24, speed: 14, color: 0xFF8C00 },
  { id: 'gumiho',   name: '구미호', magic: 28, phys: 8,  speed: 14, color: 0xD32F2F },
  { id: 'haechi',   name: '해치',   magic: 8,  phys: 26, speed: 10, color: 0xFFD54F },
  { id: 'sansin',   name: '산신',   magic: 24, phys: 12, speed: 12, color: 0x4CAF50 },
  { id: 'cheoyong', name: '처용',   magic: 12, phys: 10, speed: 28, color: 0x673AB7 },
  { id: 'baridegi', name: '바리데기',magic: 20, phys: 8,  speed: 12, color: 0xFFCDD2 }
];

class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  preload() {
    // 런타임 생성 텍스처 사용 — 필요하면 PNG로 교체 가능
  }

  create() {
    // 배경(밤하늘 + 산 실루엣)
    this.createBackground();

    // 타이틀
    this.add.text(WIDTH/2, 18, 'Mountain Demons', { fontFamily:'Arial', fontSize:'28px', color:'#fff' })
      .setOrigin(0.5, 0).setDepth(61);

    // 텍스처(픽셀 32x32) 생성 - 플레이어, 적, 호롱불
    CHARACTERS.forEach(ch => this.createPixelTexture(ch.id, ch.color));
    this.createPixelTexture('enemy', 0x9E9E9E);
    this.createPixelTexture('boss', 0x212121);
    this.createPixelTexture('lantern', 0xE65100); // 호롱불 자리표시자

    // selection UI
    this.createSelectionUI();

    // groups
    this.enemies = this.physics.add.group();
    this.projectiles = this.physics.add.group();

    // input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D');

    // HUD refs
    this.hudName = document.getElementById('charName');
    this.hudStats = document.getElementById('stats');
    this.bossTimerEl = document.getElementById('bossTimer');

    // game state
    this.spawnTimer = 0;
    this.enemyCount = 0;
    this.kills = 0;
    this.timeSinceStart = 0;
    this.bossSpawnAt = 45; // seconds until boss spawns
    this.boss = null;
    this.bossDefeated = false;
    this.level = 1;
    this.lastPlayerHitAt = -Infinity;

    // 암전(어둠) 마스크 설정
    // 전체 검은 레이어를 위에 두고, lightGraphics의 흰색 원으로 '구멍'을 내서 보이게 함
    this.darkness = this.add.rectangle(0, 0, WIDTH, HEIGHT, 0x000000, 1).setOrigin(0).setDepth(50);
    this.lightGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    this.lightMask = this.lightGraphics.createGeometryMask();
    this.lightMask.invertAlpha = true;
    this.darkness.setMask(this.lightMask);

    // lantern sprite (플레이어에 부착용)
    this.lanternSprite = this.add.image(0, 0, 'lantern').setScale(1.6).setDepth(40).setVisible(false);

    // collisions
    this.physics.add.overlap(this.projectiles, this.enemies, this.onProjectileHit, null, this);

    // debug: show mask graphic if needed
    // this.lightGraphics.setVisible(true); // debug용
  }

  createBackground() {
    // 밤하늘
    this.cameras.main.setBackgroundColor('#060612');

    // 단순 픽셀 스타일 산 실루엣 레이어 생성
    const bg = this.add.graphics({ x: 0, y: 0, add: true });
    // 먼 산 (가장 어두움)
    bg.fillStyle(0x071019, 1);
    bg.beginPath();
    bg.moveTo(0, HEIGHT * 0.75);
    bg.lineTo(WIDTH * 0.12, HEIGHT * 0.55);
    bg.lineTo(WIDTH * 0.22, HEIGHT * 0.68);
    bg.lineTo(WIDTH * 0.32, HEIGHT * 0.53);
    bg.lineTo(WIDTH * 0.44, HEIGHT * 0.69);
    bg.lineTo(WIDTH * 0.64, HEIGHT * 0.5);
    bg.lineTo(WIDTH * 0.78, HEIGHT * 0.66);
    bg.lineTo(WIDTH, HEIGHT * 0.52);
    bg.lineTo(WIDTH, HEIGHT);
    bg.lineTo(0, HEIGHT);
    bg.closePath();
    bg.fillPath();

    // 중간 산
    bg.fillStyle(0x0c1720, 1);
    bg.beginPath();
    bg.moveTo(0, HEIGHT * 0.85);
    bg.lineTo(WIDTH * 0.15, HEIGHT * 0.6);
    bg.lineTo(WIDTH * 0.33, HEIGHT * 0.78);
    bg.lineTo(WIDTH * 0.5, HEIGHT * 0.6);
    bg.lineTo(WIDTH * 0.68, HEIGHT * 0.78);
    bg.lineTo(WIDTH * 0.86, HEIGHT * 0.62);
    bg.lineTo(WIDTH, HEIGHT * 0.78);
    bg.lineTo(WIDTH, HEIGHT);
    bg.lineTo(0, HEIGHT);
    bg.closePath();
    bg.fillPath();

    // 앞 산 (가까움)
    bg.fillStyle(0x11161f, 1);
    bg.beginPath();
    bg.moveTo(0, HEIGHT * 0.95);
    bg.lineTo(WIDTH * 0.18, HEIGHT * 0.72);
    bg.lineTo(WIDTH * 0.35, HEIGHT * 0.9);
    bg.lineTo(WIDTH * 0.52, HEIGHT * 0.7);
    bg.lineTo(WIDTH * 0.7, HEIGHT * 0.9);
    bg.lineTo(WIDTH * 0.88, HEIGHT * 0.74);
    bg.lineTo(WIDTH, HEIGHT * 0.92);
    bg.lineTo(WIDTH, HEIGHT);
    bg.lineTo(0, HEIGHT);
    bg.closePath();
    bg.fillPath();

    // 별 몇 개
    const starCount = 40;
    for (let i = 0; i < starCount; i++) {
      const sx = Phaser.Math.Between(10, WIDTH - 10);
      const sy = Phaser.Math.Between(10, HEIGHT * 0.45);
      const s = this.add.rectangle(sx, sy, 2, 2, 0xFFFFFF, Phaser.Math.FloatBetween(0.3, 0.9));
      s.setDepth(0);
    }
  }

  createPixelTexture(key, color) {
    // 32x32 픽셀 텍스처 생성 (간단 디테일)
    const rt = this.add.renderTexture(0,0,32,32);
    const g = this.make.graphics({x:0,y:0,add:false});
    g.fillStyle(color, 1);
    g.fillRect(0,0,32,32);
    // 하이라이트/심볼
    g.fillStyle(0xFFFFFF, 0.08);
    g.fillRect(3,3,10,5);
    rt.draw(g);
    rt.saveTexture(key);
    g.destroy();
    rt.destroy();
  }

  createSelectionUI() {
    const x0 = 110;
    const y = 40;
    const gap = 110;
    this.selectionSprites = [];
    this.selectionObjects = [];
    CHARACTERS.forEach((ch, i) => {
      const x = x0 + i * gap;
      const sprite = this.add.image(x, y, ch.id).setOrigin(0.5).setScale(2).setInteractive().setDepth(61);
      const label = this.add.text(x, y+28, ch.name, { fontSize: '12px', color:'#fff' }).setOrigin(0.5, 0).setDepth(61);
      sprite.on('pointerdown', () => {
        this.startGameWith(ch);
      });
      this.selectionSprites.push(sprite);
      this.selectionObjects.push(sprite, label);
    });
    const guide = this.add.text(24, 12, '캐릭터를 선택하세요 (설화 컨셉)', { fontSize:'16px', color:'#fff' }).setDepth(61);
    this.selectionObjects.push(guide);
  }

  startGameWith(ch) {
    if (this.started) return;
    this.started = true;
    this.selected = JSON.parse(JSON.stringify(ch)); // 복사
    this.hudName.innerText = `선택: ${ch.name}`;
    this.updateHUD();

    // 제거된 선택 UI
    this.selectionObjects.forEach(object => object.destroy());

    // 플레이어
    this.player = this.physics.add.sprite(WIDTH/2, HEIGHT/2, ch.id).setScale(2).setDepth(10);
    this.player.setCollideWorldBounds(true);
    this.player.stats = { magic: ch.magic, phys: ch.phys, speed: ch.speed };
    this.player.maxHP = 100 + ch.phys * 2;
    this.player.hp = this.player.maxHP;
    this.player.attackCooldown = Math.max(120, 800 - this.player.stats.speed * 10);
    this.nextAttackAt = 0;

    // lantern visible
    this.lanternSprite.setVisible(true).setDepth(11);

    // collisions
    this.physics.add.overlap(this.player, this.enemies, this.onPlayerHit, null, this);

    // text
    this.timerText = this.add.text(WIDTH-12, 12, '', { fontSize:'14px', color:'#fff' })
      .setOrigin(1, 0).setDepth(61);

    // start spawn loop
    this.spawnEvent = this.time.addEvent({ delay: 800, loop: true, callback: ()=>this.spawnEnemy() });
  }

  spawnEnemy() {
    if (!this.started || this.boss) return;
    const side = Phaser.Math.Between(0,3);
    let x,y;
    if (side === 0) { x = -20; y = Phaser.Math.Between(0, HEIGHT); }
    else if (side === 1) { x = WIDTH+20; y = Phaser.Math.Between(0, HEIGHT); }
    else if (side === 2) { x = Phaser.Math.Between(0, WIDTH); y = -20; }
    else { x = Phaser.Math.Between(0, WIDTH); y = HEIGHT+20; }

    const hp = 8 + this.level * 4 + Phaser.Math.Between(0,6);
    const spd = 30 + this.level * 2;
    const e = this.enemies.create(x,y,'enemy').setScale(2).setDepth(9);
    e.hp = hp;
    e.speed = spd;
    e.setData('type','minion');
    this.enemyCount++;
  }

  update(time, dt) {
    if (!this.started) return;
    const deltaSec = dt/1000;
    this.timeSinceStart += deltaSec;

    // movement
    const moveSpeed = 120 + this.player.stats.speed * 3;
    let vx = 0, vy = 0;
    if (this.cursors.left.isDown || this.keys.A.isDown) vx = -1;
    if (this.cursors.right.isDown || this.keys.D.isDown) vx = 1;
    if (this.cursors.up.isDown || this.keys.W.isDown) vy = -1;
    if (this.cursors.down.isDown || this.keys.S.isDown) vy = 1;
    const mag = Math.hypot(vx,vy) || 1;
    this.player.setVelocity((vx/mag)*moveSpeed, (vy/mag)*moveSpeed);

    // lantern position (플레이어 우측 하단에 배치하여 '손에 든' 느낌)
    const lanternOffsetX = 14;
    const lanternOffsetY = 6;
    this.lanternSprite.x = this.player.x + lanternOffsetX;
    this.lanternSprite.y = this.player.y + lanternOffsetY;

    // auto attack
    if (time > this.nextAttackAt) {
      this.autoAttack();
      this.nextAttackAt = time + this.player.attackCooldown;
    }

    // enemies simple AI
    this.enemies.getChildren().forEach(e => {
      if (!e.active) return;
      const angle = Phaser.Math.Angle.Between(e.x, e.y, this.player.x, this.player.y);
      const chaseSpeed = e.getData('type') === 'boss' && e.bossData.speedChase
        ? e.speed + 40
        : e.speed;
      this.physics.velocityFromRotation(angle, chaseSpeed, e.body.velocity);

      if (e.getData('type') === 'boss' && e.bossData.magicReflect && Math.random() < 0.005 * deltaSec * 60) {
        e.hp = Math.min(e.maxHP, e.hp + Math.round(e.maxHP * 0.02));
      }
    });

    // projectiles lifetime
    this.projectiles.getChildren().forEach(p => {
      if (p.x < -40 || p.x > WIDTH+40 || p.y < -40 || p.y > HEIGHT+40) p.destroy();
    });

    // level progression by kills
    if (this.kills > this.level * 6) {
      this.levelUp();
    }

    // boss spawn
    const timeLeft = Math.max(0, Math.floor(this.bossSpawnAt - this.timeSinceStart));
    this.bossTimerEl.innerText = `보스 출현까지: ${timeLeft}s`;
    if (!this.boss && !this.bossDefeated && this.timeSinceStart >= this.bossSpawnAt) {
      this.spawnBoss();
    }

    // update HUD
    this.updateHUD();
    this.timerText.setText(`처치 ${this.kills} · ${Math.floor(this.timeSinceStart)}초`);

    // update light mask (암전 구멍)
    this.updateLightMask();
  }

  autoAttack() {
    let nearest = null; let minDist = 99999;
    this.enemies.getChildren().forEach(e => {
      if (!e.active) return;
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, e.x, e.y);
      if (d < minDist) { minDist = d; nearest = e; }
    });
    if (!nearest) return;

    const proj = this.projectiles.create(this.player.x, this.player.y, null).setDepth(9);
    const tkey = 'proj';
    if (!this.textures.exists(tkey)) {
      const rt = this.add.renderTexture(0,0,6,6);
      const g = this.make.graphics({add:false});
      g.fillStyle(0xFFFFFF,1); g.fillRect(0,0,6,6);
      rt.draw(g); rt.saveTexture(tkey); g.destroy(); rt.destroy();
    }
    proj.setTexture(tkey);
    proj.setDisplaySize(8,8);
    proj.damage = Math.floor(this.player.stats.magic*0.8 + this.player.stats.phys*0.8 + Phaser.Math.Between(-2,6));
    proj.setData('isMagic', this.player.stats.magic >= this.player.stats.phys);
    this.physics.moveToObject(proj, nearest, 420 + this.player.stats.speed*6);
    proj.body.setAllowGravity(false);
  }

  onProjectileHit(proj, enemy) {
    if (!proj?.active || !enemy?.active) return;
    let dmg = proj.damage || 5;
    if (enemy.getData('type') === 'boss') {
      const isMagic = proj.getData('isMagic');
      if (Math.random() < (enemy.bossData.eva || 0) / 100) {
        proj.destroy();
        return;
      }
      if (isMagic) {
        const def = enemy.bossData.magicDef || 0;
        dmg = Math.round(dmg * (100 / (100 + def)));
        if (enemy.bossData.magicReflect && Math.random() < enemy.bossData.reflectRate) {
          this.player.hp -= Math.max(1, Math.floor(dmg * 0.3));
        }
      } else {
        if (enemy.bossData.physImmune) {
          dmg = Math.max(1, Math.round(dmg * 0.15));
        } else {
          const def = enemy.bossData.physDef || 0;
          dmg = Math.round(dmg * (100 / (100 + def)));
        }
      }
    }
    enemy.hp -= Math.max(1, dmg);
    proj.destroy();

    if (enemy.hp <= 0) {
      if (enemy.getData('type') === 'boss') this.onBossDefeated(enemy);
      else { enemy.destroy(); this.kills++; this.enemyCount--; }
    }
  }

  onPlayerHit(player, enemy) {
    if (!enemy?.active || this.time.now - this.lastPlayerHitAt < 700) return;
    this.lastPlayerHitAt = this.time.now;
    this.player.hp -= 6;
    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
    this.player.setVelocity(Math.cos(angle)*200, Math.sin(angle)*200);
    if (Math.random() < 0.08) { enemy.destroy(); this.enemyCount--; this.kills++; }
    if (this.player.hp <= 0) {
      this.gameOver();
    }
  }

  levelUp() {
    this.level++;
    const choice = Phaser.Math.Between(0,2);
    if (choice === 0) this.player.stats.magic += Phaser.Math.Between(1,3);
    if (choice === 1) this.player.stats.phys += Phaser.Math.Between(1,3);
    if (choice === 2) this.player.stats.speed += Phaser.Math.Between(1,3);
    this.player.attackCooldown = Math.max(120, 800 - this.player.stats.speed * 10);
    this.player.hp = Math.min(this.player.maxHP, this.player.hp + 8 + this.level);
  }

  spawnBoss() {
    const pm = this.player.stats.magic;
    const pp = this.player.stats.phys;
    const ps = this.player.stats.speed;
    const sum = pm + pp + ps;
    const pMagic = pm / sum;
    const pPhys = pp / sum;
    const pSpeed = ps / sum;

    const boss = this.enemies.create(WIDTH/2, -120, 'boss').setScale(4).setDepth(9);
    boss.setData('type','boss');
    boss.maxHP = 500 + this.level * 400;
    boss.hp = boss.maxHP;
    boss.setImmovable(true);
    boss.setCollideWorldBounds(true);
    boss.speed = 40 + this.level * 6;

    const adaptFactor = 60;
    boss.bossData = {
      magicDef: 20 + Math.round(adaptFactor * pMagic),
      physDef: 20 + Math.round(adaptFactor * pPhys),
      eva: 5  + Math.round(30 * pSpeed),
      magicReflect: false,
      reflectRate: 0.0,
      physImmune: false,
      speedChase: false
    };

    const maxP = Math.max(pMagic,pPhys,pSpeed);
    if (pMagic === maxP && pMagic > 0.45) {
      boss.bossData.magicReflect = true;
      boss.bossData.reflectRate = 0.3 + 0.2 * (pMagic-0.45);
    } else if (pPhys === maxP && pPhys > 0.45) {
      boss.bossData.physImmune = true;
    } else if (pSpeed === maxP && pSpeed > 0.45) {
      boss.bossData.speedChase = true;
    }

    if (pMagic >= pPhys && pMagic >= pSpeed) boss.setTint(0x6A1B9A);
    else if (pPhys >= pMagic && pPhys >= pSpeed) boss.setTint(0x37474F);
    else boss.setTint(0x1E88E5);

    this.boss = boss;
  }

  onBossDefeated(boss) {
    boss.destroy();
    this.boss = null;
    this.bossDefeated = true;
    this.player.stats.magic += 6;
    this.player.stats.phys += 6;
    this.player.stats.speed += 6;
    this.player.hp = Math.min(this.player.maxHP, this.player.hp + 50);
    this.add.text(WIDTH/2 - 120, HEIGHT/2 - 20, '최종 보스 격파!', { fontSize:'24px', color:'#fff' }).setDepth(20);
  }

  updateHUD() {
    if (!this.player) return;
    this.hudStats.innerText = `마법:${this.player.stats.magic} 물리:${this.player.stats.phys} 속도:${this.player.stats.speed}  HP:${Math.max(0,this.player.hp)}/${this.player.maxHP} LV:${this.level}`;
  }

  updateLightMask() {
    // light radius: 기본 120 + speed 영향 (조정 가능)
    const baseRadius = 120;
    const speedBonus = Math.max(0, this.player ? this.player.stats.speed : 0) * 2;
    const radius = baseRadius + speedBonus;

    // 플레이어 중심 좌표 (호롱불 위치로 이동)
    const x = this.lanternSprite.visible ? this.lanternSprite.x : WIDTH/2;
    const y = this.lanternSprite.visible ? this.lanternSprite.y : HEIGHT/2;

    // 그래픽 클리어 후 3단계 원으로 그라데이션 근사(성능 고려)
    this.lightGraphics.clear();
    // 중앙(완전히 투명 구멍)
    this.lightGraphics.fillStyle(0xffffff, 1.0);
    this.lightGraphics.fillCircle(x, y, radius * 0.35);
    // 중간
    this.lightGraphics.fillStyle(0xffffff, 0.6);
    this.lightGraphics.fillCircle(x, y, radius * 0.65);
    // 외곽(약간 보이게)
    this.lightGraphics.fillStyle(0xffffff, 0.28);
    this.lightGraphics.fillCircle(x, y, radius);

    // mask가 invertAlpha=true 이므로, 위 흰색 원들은 '구멍'으로 작동합니다.
  }

  gameOver() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.physics.pause();
    this.add.text(WIDTH/2, HEIGHT/2, '게임 오버', { fontSize:'32px', color:'#f55' })
      .setOrigin(0.5).setDepth(100);
  }
}

// Phaser config
const config = {
  type: Phaser.AUTO,
  width: WIDTH,
  height: HEIGHT,
  parent: 'game-container',
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

window.addEventListener('load', () => {
  window.game = new Phaser.Game(config);
});
