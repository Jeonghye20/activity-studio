# 학급 관리 — 최종 구현 기준

최초 설계: 2026-10-27 · 1차 구현 완료: 2026-10-28

---

## 이번 범위 (완료)

**한 것**: 교사 화면 `/class-roster` 전체 구현  
**다음 범위로 미룬 것**:
- 학생 입장 화면 (`/s/[code]`) 수정
- 배포 기록에 classId 연결
- '수업 코드' → '활동 코드' 전면 교체
- 입장 대기·반 코드·입장 요청·승인·거절 등 입장 관련 기능
- 실제 제출·점수 데이터 연결 (현재 더미)

---

## 공통 규칙

- PC 전용 (기준 1440px, 최소 1280px). 모바일 대응 안 함
- 레이아웃: **앱 공통 `.p-main` 클래스** 사용 (`max-width: 1040px; margin: 0 auto; padding: 28px 40px 64px`)
- 데이터: localStorage. 키 이름은 `classRoster.` 로 시작
- 저장·읽기 함수는 `src/lib/classRosterStore.ts` 한 파일에 집중
- 기존 디자인 토큰(색·글꼴·버튼) 그대로 사용

---

## 1. 데이터 구조

### ClassRoom (`src/types/classRoster.ts`)
```ts
{
  id: string;
  name: string;       // 화면 표시 이름. 예: "2학년 3반" / "새싹반"
  chalk: string;      // 칠판 짧은 글씨. 예: "2-3"
  kind: 'num' | 'free';
  grade?: number;     // kind === 'num'일 때
  room?: number;      // kind === 'num'일 때
  wallIndex: number;  // 벽 색 인덱스 (0~5 순환)
  students: Student[];
}
```

### Student
```ts
{
  id: string;
  no: number;   // 번호
  name: string;
}
```

### 출결 (`AttendanceRecord`)
```ts
// localStorage 키: classRoster.attendance
attendance[classId][YYYY-MM-DD] = { [studentId]: 'absent' }
// 기록 없으면 출석. 결석만 저장
```

### localStorage 키
| 키 | 내용 |
|---|---|
| `classRoster.classes` | 반 목록 JSON |
| `classRoster.attendance` | 출결 기록 JSON |
| `classRoster.lastClassId` | 마지막 선택 반 id |

---

## 2. 더미 데이터 · 성취 계산 (`src/lib/classRosterDummy.ts`)

- 실제 제출·점수 기록 미연결. `getStudentProgress(classId, student)` 함수가 더미 반환
- **새로고침해도 같은 값**: 반 id + 학생 번호로 고정 시드 (FNV-1a 해시 + LCG)
- `TOTAL_ACTIVITIES = 20`, `COMPLETION_RATE = 0.6`, `ACHIEVEMENT_THRESHOLD = 6`

### 성취 변화 계산
```
최근 3개 평균 − 그 전 3개 평균 (기록 6개 이상일 때만)
  +6 이상  → rising   (↗ 향상)
  -6 이하  → falling  (↘ 하락)
  그 사이  → steady   (→ 유지)
  기록 1~5개 → insufficient ('기록 쌓는 중')
  기록 0개   → new          ('첫 활동 전')
```

### 초기 데모 데이터 (4개 반)

- **2학년 1·2·3반**: 각 24명 명단, 오늘 2학년 3반 결석 권나은(15)·고은호(22)
- **2학년 4반**: 명단 없음 상태
- 2학년 3반 기본 선택 (첫 진입, `cls_2_3`)
- '처음 상태로 보기' → `classRoster.*` 전부 삭제 후 재주입

---

## 3. 화면 구성

### 3-1. 반 카드 줄 (`ClassCard.tsx`)

- 교실 앞면 SVG(벽·바닥·시계·칠판) + 칠판에 chalk 글씨 + 아래 이름줄
- 벽 색 6가지 (wallIndex 0~5): 연파랑·민트·연노랑·연보라·연분홍·연청록
- 선택한 반: 남색 테두리 + 아래줄 남색 배경·흰 글씨 + 노란 하단 밑줄
- border-radius 0. 반이 많으면 가로 스크롤 + 오른쪽 끝 그라데이션
- 줄 맨 뒤: 점선 사각형 '+ 반 만들기'

### 3-2. 도구 줄

높이 38px, 글씨 13.5px
- 왼쪽: 검색(이름·번호) · 카드형/목록형 전환 토글(기본 카드형) · 번호순/이름순
- 오른쪽: '붙여 넣기로 추가'(테두리 버튼) · **'+ 학생 추가'(남색 채움 버튼)**

### 3-3. 요약 띠 (`SummaryBand.tsx`)

남색 테두리 박스, 3칸 구성. 명단 빈 반에서는 숨김.

**오늘 출결**
- 날짜 ‹ date › 이동 (주말 건너뜀), 오늘이 아닐 때만 '오늘' 버튼(pill 형태) 표시
- 오늘 이후 › 비활성
- 큰 숫자(38px 900) '22 출석 / 2 결석'
- 결석 학생 이름 나열

**활동 완료**
- 반 평균 완료 수 · 오른쪽 위 '배포한 활동 20개'
- 진행 막대 · '60% 미만 n명'

**성취 변화**
- 향상·유지·하락·기타 비율 막대
- 필터 버튼 3개 (높이 32px, 13px, 숫자 굵게)
  - 누르면 해당 학생만 표시 / 다시 누르거나 '전체 보기'로 해제

### 3-4. 카드형 (`StudentCardGrid.tsx`)

**4열** CSS grid, gap 12px
- 번호(22px 300, 연하게) + 출결 토글 버튼 + 이름(19px 850) + ⋯(hover 시)
- 점선 구분선 아래 성취 영역:
  - 왼쪽 '성취'(11.5px 회색) + 오른쪽 상태 텍스트 (예: '↗ 향상 +12')
  - 최근 8개 막대그래프(BAR_W=22, MAX_H=40): 최근 3개 상태 색, 나머지 연회색
  - 그 전 3개 평균에 점선 기준선
- 맨 아래: 'n/20 활동' + 진행 막대(navy, 60% 미만 빨강)
- 결석: 연빨강 빗금 배경 + 성취·활동 영역 grayscale(1) opacity(0.45)

### 3-5. 목록형 (`StudentList.tsx`)

**1열 표**, 행 높이 52px

| 열 | 폭 | 내용 |
|---|---|---|
| 번호 | 56px | 우측 정렬, 14px 300, 연하게 |
| 이름 | 180px | 15.5px 700 |
| 출결 | 90px | 토글 버튼 (28px 높이) |
| 성취 변화 | 남는 폭 전부 | '↗ 향상 +7' + 미니 막대(BAR_W=14, 120px, 최근 3개 색) |
| 활동 | 160px | 'n/20' + 진행 막대 |
| 관리 | 44px | ⋯ 버튼 (hover 시 표시) |

- 머리글 '번호▲' / '이름▲' 클릭 정렬 (white-space: nowrap)
- 결석 행: 연빨강 배경 + 성취·활동 열 grayscale

---

## 4. 반 만들기 (`CreateClassModal.tsx`)

탭 2개:
- **학년·반 번호**: 학년(1~6)·반(1~30) ±버튼. 중복 시 빨간 안내 + 비활성. 안내에 기존 반 목록 표시
- **이름 직접 쓰기**: 10자 제한, 예시 버튼 4개. 중복 이름 비활성

오른쪽 미리보기: 반 카드 모양 그대로  
완료 → 해당 반 선택 + 토스트

---

## 5. 학생 관리

### 학생 추가 (인라인)

- '+ 학생 추가' 클릭 → 목록 맨 위에 번호·이름 입력 행 펼침
- 번호 입력칸 56px (다음 번호 자동 제안)
- Enter 추가 / Esc 취소 / 완료 후 토스트
- 카드형에서 클릭하면 목록형으로 자동 전환 후 행 표시

### 붙여 넣기로 추가 (`PasteModal.tsx`)

- 엑셀 '번호 이름' 복사 → textarea 붙여넣기
- 미리보기 목록:
  - 유효 신규: 정상 표시
  - 유효 + 번호 중복: **'기존이름 → 새이름'** 표시 + '이름을 바꿔요' 배지
  - 읽을 수 없는 줄: 빨강 + '읽을 수 없어요'
- 미리보기 위 안내: "읽을 수 없는 N줄은 건너뜁니다."
- 버튼 문구: `N명 추가` / `N명 이름 바꾸기` / `N명 추가 · N명 이름 바꾸기`
- 실제 동작: 신규 → addStudent / 중복 번호 → updateStudent(이름만 변경)

### ⋯ 메뉴

hover 시 표시. 클릭 외부(mousedown)로 닫힘

1. **번호·이름 고치기**: 행 인라인 편집 → 저장/취소
2. **다른 반으로 옮기기**: 반 선택 버튼 → 대상 반 `maxNo + 1` 번호로 자동 배정
3. **명단에서 제거**: 인라인 확인 창("명단에서 제거할까요?") + 빨간 제거 버튼

모든 변경 후 토스트 표시.

### 빈 반 상태

'○○ 명단이 비어 있어요' + '명단 붙여 넣기' 버튼(남색 채움, PasteModal 열기)

---

## 6. 파일 목록 (`src/app/(teacher)/class-roster/`)

| 파일 | 역할 |
|---|---|
| `page.tsx` | Next.js 라우트 진입점 |
| `ClassRosterPage.tsx` | 전체 페이지, ClassDetail, AddStudentPanel |
| `ClassCard.tsx` | 반 카드 + ClassroomSVG |
| `CreateClassModal.tsx` | 반 만들기 모달 |
| `SummaryBand.tsx` | 요약 띠 (출결·완료·성취) |
| `StudentCardGrid.tsx` | 카드형 4열 그리드 |
| `StudentList.tsx` | 목록형 1열 표 + 학생 관리 |
| `PasteModal.tsx` | 붙여 넣기 추가 모달 |

지원 파일:
- `src/types/classRoster.ts` — 타입 정의
- `src/lib/classRosterStore.ts` — localStorage CRUD
- `src/lib/classRosterDummy.ts` — 더미 데이터·성취 계산

---

## 7. 다음 범위 (미구현)

- 실제 활동·점수 데이터 연결 (`getStudentProgress` 더미 → 실제 제출 기록)
- 학생 입장 흐름 (`/s/[code]`) — 명단 있는 반은 이름 선택, 없으면 직접 입력
- 배포 기록에 classId 연결 (어느 반에 배포했는지)
- '수업 코드' → '활동 코드' 전면 교체
- 입장 대기·승인·거절 기능
