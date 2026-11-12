# iepon_desk-releases

교실 판 Windows 앱의 설치 파일·업데이트 패키지와 **서명한 자동 업데이트 목록만** 배포하는 공개 저장소입니다.

## 학교 PC에 처음 설치하기

1. [Windows 설치 파일 받기](https://github.com/iepon-edu/iepon_desk-releases/releases/download/stable/IeponDeskApp-win-Setup.exe)를 누릅니다.
2. 받은 `IeponDeskApp-win-Setup.exe`를 실행합니다. 처음 설치할 때 Windows 경고가 나오면 위 공식 주소에서 받은 파일인지 확인한 뒤 **추가 정보 → 실행**을 누릅니다.

GitHub 릴리스 태그는 채널 이름입니다. 2026-11-13 기준 `stable`에 첫 판 **0.2.0**이 올라와 있으며 `beta` 채널은 아직 없습니다. 0.2.0은 앱의 병합 전 브랜치에서 만든 판으로 **Windows 실기 설치·자동 업데이트는 아직 확인하지 않았습니다.** `stable`이라는 이름만으로 실기 검증 완료를 뜻하지 않습니다.

## 코드와 배포 관리

앱 코드는 비공개 [`iepon_desk`](https://github.com/iepon-edu/iepon_desk)에서 관리하고, 교실 판 화면·로그인·학생 자료는 v3에서 관리합니다. 이 공개 저장소에는 **코드·비밀·학생 자료를 두지 않습니다.** 저장소 파일은 이 안내와 필수 협업 어댑터·검증 도구로 한정합니다.

새 판은 **lee만** 집 맥의 비공개 코드 저장소에서 발행합니다. 절차는 `iepon_desk`의 `docs/UPDATE.md` §3을 따르며 명령은 `scripts/release.sh publish <판> <beta|stable> --upload`입니다. GitHub workflow로 빌드·서명·릴리스를 자동 발행하지 않습니다. 이 저장소의 workflow는 협업 문서와 어댑터의 일관성만 읽기 전용으로 검사합니다.

## 이 저장소를 수정할 때

<!-- iepon-collaboration-entrypoint: 2026-10-05.1 -->
작업자는 먼저 [AGENTS.md](./AGENTS.md)를 처음부터 끝까지 읽고 담당자·기준선·검증 절차를 확인합니다.
