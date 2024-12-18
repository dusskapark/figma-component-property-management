# Figma Component Property Management Plugin

Figma 컴포넌트의 프로퍼티를 효율적으로 관리하기 위한 플러그인입니다. 특히 Boolean 프로퍼티의 빠른 추가와 관리 기능을 제공합니다.

## 주요 기능

### 컴포넌트 프로퍼티 조회
- 컴포넌트/컴포넌트셋 선택 시 모든 프로퍼티 목록 표시
  - 프로퍼티 이름
  - 프로퍼티 타입
  - 기본값

### Boolean 프로퍼티 자동 추가
- 자동 이름 생성
  - 단일 노드: `isVisible_노드이름`
  - 다중 노드: `isVisible_Group`
- 중복 이름 방지 (자동 넘버링)
- 선택된 노드들의 visible 속성 자동 바인딩
- 바인딩 성공/실패 결과 표시

## 사용 방법

### 선택 모드별 기능
1. 선택 없음
   - "No nodes selected" 메시지 표시
   - Add Boolean Property 버튼 비활성화
2. 컴포넌트/컴포넌트셋 선택
   - 컴포넌트 이름 표시
   - 프로퍼티 테이블 표시
3. 일반 노드 선택
   - 선택된 노드 수 표시
   - Add Boolean Property 버튼 활성화

### Boolean 프로퍼티 추가하기
1. 컴포넌트 내의 레이어(들) 선택
2. Add Boolean Property 버튼 클릭
3. 자동으로 프로퍼티가 생성되고 바인딩됨

## 기술 스택
1. Typescript
2. React
3. Tailwindcss
4. Webpack
5. Yarn

## 개발 환경 설정
1. [Node.js](https://nodejs.org/en/) 및 [Yarn 1](https://classic.yarnpkg.com/en/docs/install) 설치
2. 저장소 루트 디렉토리에서 `yarn install` 실행
3. `yarn run dev` 실행하여 빌드 시작
4. Figma에서 플러그인 import:
   - 우클릭 -> "Plugins" -> "Development" -> "Import plugin from manifest..."
   - ```./dist/manifest.json``` 파일 선택
5. "Run" 클릭하여 개발 모드에서 플러그인 실행

## 향후 개선 계획
- 프로퍼티 이름 커스터마이징 UI
- 프로퍼티 기본값 설정 옵션
- 다른 타입의 프로퍼티 지원
- 프로퍼티 일괄 관리 기능
- 프로퍼티 템플릿 기능
