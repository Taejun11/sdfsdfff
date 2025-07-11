# AI Academy 웹사이트

AI 강의 사이트의 메인페이지와 수강신청 시스템입니다.

## 기능

- 🎨 현대적이고 반응형 디자인
- 📝 수강신청 폼 (이름, 이메일, 휴대폰, 신청동기)
- 🔥 Firebase Firestore 연동
- 👨‍💼 관리자 대시보드
- 📊 실시간 통계 및 데이터 관리
- 📄 CSV 내보내기 기능

## Firebase 설정

### 1. Firebase 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com/)에 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름 입력 (예: "ai-academy")
4. Google Analytics 설정 (선택사항)
5. 프로젝트 생성 완료

### 2. Firestore 데이터베이스 설정

1. Firebase Console에서 "Firestore Database" 선택
2. "데이터베이스 만들기" 클릭
3. 보안 규칙 선택:
   - **테스트 모드** (개발용): 모든 사용자가 읽기/쓰기 가능
   - **프로덕션 모드** (운영용): 인증된 사용자만 접근 가능
4. 데이터베이스 위치 선택 (가까운 지역 선택)

### 3. 웹 앱 등록

1. Firebase Console에서 "웹 앱 추가" 클릭
2. 앱 닉네임 입력 (예: "ai-academy-web")
3. "Firebase 호스팅 설정" 체크 해제
4. "앱 등록" 클릭
5. Firebase 설정 객체 복사

### 4. 설정 파일 업데이트

`firebase-config.js` 파일의 설정을 실제 Firebase 프로젝트 설정으로 교체:

```javascript
const firebaseConfig = {
    apiKey: "실제_API_키",
    authDomain: "실제_프로젝트_ID.firebaseapp.com",
    projectId: "실제_프로젝트_ID",
    storageBucket: "실제_프로젝트_ID.appspot.com",
    messagingSenderId: "실제_SENDER_ID",
    appId: "실제_APP_ID"
};
```

### 5. Firestore 보안 규칙 설정 (선택사항)

운영 환경에서는 적절한 보안 규칙을 설정하세요:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /applications/{document} {
      allow read, write: if true; // 테스트용 - 운영시 변경 필요
    }
  }
}
```

## 파일 구조

```
├── index.html          # 메인 웹페이지
├── firebase-config.js  # Firebase 설정
├── app.js             # 애플리케이션 로직
└── README.md          # 프로젝트 설명서
```

## 사용법

### 1. 로컬 실행

1. 모든 파일을 웹 서버에 업로드
2. `firebase-config.js` 파일의 설정을 실제 Firebase 프로젝트 설정으로 교체
3. 웹 브라우저에서 `index.html` 접속

### 2. 관리자 기능

- 오른쪽 상단의 "👨‍💼 관리자" 버튼 클릭
- 전체 화면 대시보드에서 신청 데이터 확인
- 신청자 상태 관리 (신청완료, 상담중, 수강확정, 취소)
- CSV 파일로 데이터 내보내기

### 3. 수강신청 프로세스

1. 사용자가 "신청하기" 버튼 클릭
2. 수강신청 폼 작성 (이름, 이메일, 휴대폰, 신청동기)
3. 폼 제출 시 Firebase Firestore에 데이터 저장
4. 성공 메시지 표시

## 주요 기능

### 📊 관리자 대시보드
- 총 신청자 수
- 오늘 신청자 수
- 이번 주 신청자 수
- 실시간 신청 데이터 테이블
- 신청자 상태 관리
- CSV 내보내기

### 🔒 데이터 보안
- Firebase Firestore의 보안 규칙 활용
- 실시간 데이터 동기화
- 자동 백업 및 복구

### 📱 반응형 디자인
- 모바일, 태블릿, 데스크톱 최적화
- 터치 친화적 인터페이스
- 빠른 로딩 속도

## 문제 해결

### Firebase 연결 오류
1. `firebase-config.js` 파일의 설정 확인
2. Firebase 프로젝트가 활성화되어 있는지 확인
3. Firestore 데이터베이스가 생성되어 있는지 확인

### 데이터가 표시되지 않는 경우
1. 브라우저 개발자 도구에서 콘솔 오류 확인
2. Firebase 보안 규칙 설정 확인
3. 네트워크 연결 상태 확인

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 지원

문제가 발생하거나 질문이 있으시면 이슈를 등록해주세요. 