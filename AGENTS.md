<!-- iepon-collaboration-standard: 2026-10-05.1 -->
# iepon_desk-releases 작업 안내

## 1. 이 저장소의 자리

- 상태: **현행** — lee 담당 공개 배포 저장소. 2026-11-13 허브 확인 기록상 `stable`에 0.2.0이 있으며 Windows 실기 설치·자동 업데이트는 미확인이다.
- 목적은 교실 판 Windows 설치 파일·업데이트 패키지와 서명한 자동 업데이트 목록의 공개 배포다. **코드·비밀·학생 자료를 두지 않는다.** git 파일은 용도 안내와 필수 협업 어댑터·검증 도구만 둔다.
- 정본 관계: [조직 저장소 지도](https://github.com/iepon-edu/.github/blob/main/REPO_MAP.md)의 배포 전용 저장소다. 앱 소스와 발행 절차는 비공개 [`iepon_desk`](https://github.com/iepon-edu/iepon_desk), 화면·로그인·학생 자료는 v3가 맡는다. 다른 저장소의 코드·데이터를 이곳으로 자동 이식하지 않는다.
- 중앙 기준은 [AGENTS.md](https://github.com/iepon-edu/.github/blob/main/AGENTS.md), [CONTRIBUTING.md](https://github.com/iepon-edu/.github/blob/main/CONTRIBUTING.md), [SECURITY.md](https://github.com/iepon-edu/.github/blob/main/SECURITY.md)다.
- `thin` 어댑터·`confirmed` 기준선: lee의 용도 지정과 제공 clone의 `origin/HEAD → main`, 최초 README 커밋 `cf9f716a8fb6a7abc65c137b323521b763c51631`을 근거로 한다. 앱 검증 완료나 어댑터 전파 완료를 뜻하지 않는다. 이 어댑터는 독립 검수·사람 승인·기본 브랜치 반영 전까지 전파 후보다.
- 목표는 현재 구현이나 완료를 뜻하지 않는다.

## 2. 작업 시작

1. 이 파일과 [README.md](./README.md)를 완독하고 작업에 해당하는 중앙 기준을 읽는다. 발행 관련 작업은 비공개 `iepon_desk`의 `AGENTS.md` → `docs/UPDATE.md` §3 순서로 추가 확인한다.
2. 담당 사람은 lee다. 위임자에 따라 `lee/...` 또는 `kim/...` 브랜치를 쓰며 기준 브랜치·전체 SHA·분기 시각을 PR에 기록한다. clone의 오래된 `main`을 현재 원격 상태로 간주하지 않는다. 기준선이 불명확하면 `BLOCK — 사람 확인 필요`다.
3. 큰 작업은 허용된 환경에서 브랜치 push 또는 draft PR로 담당자·주요 파일을 먼저 선점한다. 네트워크가 금지된 위임 작업은 로컬 검증·커밋과 인계 기록까지만 진행한다.
4. 새 판은 lee만 집 맥의 `iepon_desk`에서 `scripts/release.sh publish <판> <beta|stable> --upload`로 발행한다. 태그는 채널 이름이다. `stable`에 0.2.0이 있고 `beta`는 아직 없다는 것은 2026-11-13 기록이다. 개인 서명 열쇠의 경로·내용은 기록하지 않는다.

## 3. 검증

- Node 24와 pnpm을 사용한다. `package.json`·의존성·설치 과정이 없는 문서/배포 저장소이므로 패키지를 설치하지 않는다. 앱 typecheck·lint·build·test 명령은 이 저장소에 없으며, 해당 검증은 비공개 `iepon_desk`에서 **확인 필요**다. 여기에는 앱 소스나 빌드 설정이 없기 때문이다.
- 로컬 문서·어댑터 검증: `pnpm exec node scripts/verify-iepon-collaboration.mjs`.
- 스크립트 문법 검증: `pnpm exec node --check scripts/verify-iepon-collaboration.mjs`.
- 중앙 clone에서 교차 검증: `pnpm exec node scripts/verify-collaboration-standard.mjs --adapter /absolute/path/to/iepon_desk-releases`.
- workflow는 필수 협업 파일 변경만 검사한다. `contents: read`, 불변 checkout SHA, `persist-credentials: false`, 5분 제한을 유지하며 빌드·서명·릴리스 발행을 추가하지 않는다.
- 배포를 확인할 때는 자산 다운로드·SHA-256·업데이트 목록 서명과 Windows 실제 설치·업데이트 흐름을 확인한다. 현재 0.2.0은 앱 draft PR #5의 병합 전 브랜치 `lee/feat/desk-self-update-20261112`·`dbdbfbe`에서 만든 판이다. 허브의 HTTP 200 확인과 Windows 실기 검증은 별개이며 후자는 **확인 필요**다.
- 이 저장소는 UI·API·DB를 구현하지 않는다. 관련 제품 변경은 해당 코드 저장소에서 조건별 UI·API·DB 검증을 수행한다. 원격 감사·앱 검증을 실행하지 못했다면 미실행 사유와 후속 담당자를 기록한다.

## 4. 중단 조건

문서·결정 충돌, 기준선·원격 환경 불명, 같은 파일의 동시 수정, 비밀·학생정보 노출 가능성, 사람 승인 없는 원격 쓰기·병합·공식 발행은 `BLOCK`이다. 공개 저장소로 앱 소스나 학생 자료를 옮기려는 변경도 멈춘다. 우회하지 말고 멈춰 보고한다.

## 5. 공통 안전 기준

- 교사가 한 번 쓴 것이 관찰·IEP·시간표로 끊김 없이 흐르게 한다. 같은 것을 두 번 쓰게 하지 않는다.
- `main` 또는 기본 브랜치 직접 push 금지.
- 작성자와 독립 검수자를 분리한다.
- 사람 승인 전 병합하지 않는다.
- 작성 에이전트는 자기 변경을 병합하지 않는다.
- canonical DDL·RLS·실데이터 쓰기는 별도 사람 승인 전 실행하지 않는다.
- `service_role`은 서버·관리 스크립트 전용이며 `NEXT_PUBLIC_`로 노출하지 않는다.
