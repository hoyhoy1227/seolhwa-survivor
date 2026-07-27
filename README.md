# 설화 서바이버

한국 설화 속 인물을 선택해 몰려오는 적과 적응형 보스를 상대하는 Phaser 3 기반 브라우저 게임입니다.

## 바로 플레이

GitHub Pages 배포 후 이 영역에 공개 게임 링크가 표시됩니다.

## 조작법

- 캐릭터 선택: 마우스 클릭
- 이동: 방향키 또는 `WASD`
- 공격: 가장 가까운 적을 향해 자동 공격

## 로컬 실행

정적 웹 서버로 저장소 루트를 연 뒤 브라우저에서 접속합니다.

```powershell
python -m http.server 8000
```

그 다음 <http://localhost:8000>을 엽니다. `index.html` 파일을 직접 열면 브라우저 보안 정책 때문에 일부 기능이 다르게 동작할 수 있습니다.

## GitHub Pages 배포

`main` 브랜치에 푸시하면 [배포 워크플로](./.github/workflows/deploy-pages.yml)가 자동으로 실행됩니다. 저장소의 **Settings → Pages → Build and deployment → Source**가 **GitHub Actions**로 설정되어 있어야 합니다.

## 프로젝트 구조

```text
.
├─ index.html
├─ src/
│  └─ game.js
└─ .github/
   └─ workflows/
      └─ deploy-pages.yml
```
