# 디자인 구조 결정 사항

## 유형 아이콘

유형 아이콘은 픽셀 그림이 아니라 일러스트 아이콘을 쓴다.
시안 HTML(`reference/v27.html`)의 픽셀 그림보다 이 결정이 우선한다.

| 유형 | 아이콘 |
|---|---|
| 개념 확인 (concept) | 빛나는 전구 |
| 탈출 게임 (escape) | 자물쇠 |
| 추리 게임 (mystery) | 물음표 돋보기 |
| 실습 기록 (practice) | 코드 창 `</>` |
| 자료 분석 (analysis) | 막대그래프 + 꺾은선 |
| 토론·의견 (discussion) | 말풍선 두 개 |

아이콘 SVG 경로: `src/components/TypeCover.tsx` → `TypeIconPaths` (named export).
`TypeCover` 컴포넌트가 이 아이콘을 사용하므로 아이콘이 보이는 모든 곳(카드, 사이드바, 랜딩)이 자동으로 바뀐다.

결정일: 2026-10-25
