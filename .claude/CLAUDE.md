# Manitto SGB Project - Development Guide

## 프로젝트 개요

- **Framework**: Remix (React SSR/SPA 하이브리드)
- **UI**: TailwindCSS + React Components
- **상태관리**: Zustand
- **Backend**: Supabase
- **언어**: TypeScript

## 아키텍처 패턴

### Clean Architecture 기반 계층 구조

```
app/
├── core/                # 핵심 도메인 로직
│   ├── data/           # 데이터 계층 인터페이스
│   └── domain/         # 도메인 엔티티 및 비즈니스 로직
├── data/               # 데이터 소스 구현
├── domain/             # 도메인 모델 및 유스케이스
├── ui/                 # 프레젠테이션 계층
├── services/           # 외부 서비스 연동
└── routes/             # Remix 라우터
```

### MVVM 패턴 구현

**View**: React 컴포넌트 (CommunityView.tsx)
**ViewModel**: Zustand Store (communityViewModel.ts) 
**Model**: Domain Models (communityPostModel.ts)

## 핵심 구조 및 컨벤션

### 1. 상태 관리 패턴

```typescript
// State Interface (communityState.ts)
export interface CommunityState {
  // 상태
  getCommunityListLoadingStatus: LoadingStatus;
  communityList: CommunityPostModel[];
  communityErrorMessage?: string | null;
  
  // 액션/함수
  fetchCommunityPosts: () => Promise<void>;
  onPostDeleted: (postId: string) => void;
  onCommentCreated: (postId: string) => void;
  onCommentDeleted: (postId: string) => void;
}

// ViewModel Implementation (communityViewModel.ts)
export const useCommunityStore = create<CommunityState>((set, get) => ({
  // 초기 상태
  getCommunityListLoadingStatus: LoadingStatus.None,
  communityList: [],
  communityErrorMessage: null,

  // 비동기 액션
  fetchCommunityPosts: async () => {
    set({ getCommunityListLoadingStatus: LoadingStatus.Loading });
    try {
      const communityList = await getCommunityPosts({ pageSize: 3 });
      set({
        getCommunityListLoadingStatus: LoadingStatus.Success,
        communityList,
        communityErrorMessage: null,
      });
    } catch (e) {
      set({
        getCommunityListLoadingStatus: LoadingStatus.Error,
        communityErrorMessage: "불러오기 실패",
      });
    }
  }
}));
```

### 2. 로딩 상태 관리

```typescript
export enum LoadingStatus {
  None = "none",
  Loading = "loading", 
  Success = "success",
  Error = "error",
}
```

### 3. 도메인 모델 정의

```typescript
export interface CommunityPostModel {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  commentCount: number;
}
```

### 4. Repository 패턴

```typescript
export const communityRepository = {
  getPosts: async ({ pageSize = 10 }) => {
    try {
      const data = await fetchCommunityPosts({ pageSize });
      return { success: true, data };
    } catch {
      return { success: false, message: "Failed to fetch posts" };
    }
  },
};
```

### 5. React 컴포넌트 구조

```typescript
export function CommunityView() {
  const { getCommunityListLoadingStatus, communityList, fetchCommunityPosts } =
    useCommunityStore();

  useEffect(() => {
    fetchCommunityPosts();
  }, [fetchCommunityPosts]);

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">커뮤니티</h2>
      {getCommunityListLoadingStatus === "loading" ? (
        <div className="text-center text-gray-500 py-8">Loading...</div>
      ) : communityList.length === 0 ? (
        <div className="text-center text-gray-400 py-8">게시글이 없습니다.</div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {communityList.map((post) => (
            <li key={post.id} className="py-4 px-2 hover:bg-gray-50 transition">
              <CommunityListItem post={post} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## 개발 가이드라인

### 새 기능 추가 시

1. **도메인 모델 정의**: `domain/[feature]/models/`
2. **상태 인터페이스 작성**: `ui/[feature]/[feature]State.ts`
3. **ViewModel 구현**: `ui/[feature]/[feature]ViewModel.ts`
4. **Repository 작성**: `data/[feature]/repository.ts`
5. **UseCase 구현**: `domain/[feature]/usecases/`
6. **View 컴포넌트 작성**: `ui/[feature]/[Feature]View.tsx`

### 네이밍 컨벤션

- **파일명**: camelCase (communityViewModel.ts)
- **컴포넌트**: PascalCase (CommunityView)
- **인터페이스**: PascalCase + 접미사 (CommunityState, CommunityPostModel)
- **Store**: use + 도메인 + Store (useCommunityStore)
- **상수**: UPPER_SNAKE_CASE
- **함수**: camelCase

### UI 스타일 가이드

- **Primary Color**: Blue-700
- **Container**: `max-w-xl mx-auto bg-white rounded-lg shadow p-6`
- **Loading**: `text-center text-gray-500 py-8`
- **Empty State**: `text-center text-gray-400 py-8`
- **List**: `divide-y divide-gray-200`
- **Hover Effects**: `hover:bg-gray-50 transition`

## 스크립트 명령어

```bash
npm run dev       # 개발 서버 실행
npm run build     # 프로덕션 빌드
npm run lint      # ESLint 검사
npm run typecheck # TypeScript 타입 검사
```

## 환경 설정

### 필수 환경 변수
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 개발 도구
- **ESLint**: 코드 품질 검사
- **TypeScript**: 정적 타입 검사
- **TailwindCSS**: 유틸리티 CSS 프레임워크
- **Vite**: 빌드 도구

## 공통 컴포넌트 시스템

### 컴포넌트 구조
```
app/ui/common/components/
├── index.ts                 # 컴포넌트 export
├── examples.tsx             # 사용 예제 (개발용)
├── Button.tsx               # 버튼 컴포넌트
├── Input.tsx                # 입력 필드 컴포넌트
├── Card.tsx                 # 카드 컨테이너 컴포넌트
├── LoadingSpinner.tsx       # 로딩 스피너 컴포넌트
└── Modal.tsx                # 모달/다이얼로그 컴포넌트
```

### 컴포넌트 임포트
```typescript
import { 
  Button, 
  Input, 
  Card, 
  CardHeader, 
  CardContent, 
  CardFooter,
  LoadingSpinner,
  LoadingOverlay,
  Modal,
  ModalHeader,
  ModalContent,
  ModalFooter
} from '~/ui/common/components';
```

### 주요 컴포넌트 사용법

#### 1. Button 컴포넌트
```typescript
<Button variant="primary" size="md" fullWidth loading>
  로그인
</Button>

// 변형: primary, secondary, ghost, danger
// 크기: sm, md, lg
// 속성: fullWidth, loading, disabled
```

#### 2. Input 컴포넌트
```typescript
<Input
  label="이메일"
  type="email"
  placeholder="이메일을 입력하세요"
  error="올바른 이메일 형식이 아닙니다"
  leftIcon={<EmailIcon />}
/>

// 상태: error, success, helper 메시지
// 아이콘: leftIcon, rightIcon 지원
```

#### 3. Card 컴포넌트
```typescript
<Card shadow="md" hover>
  <CardHeader action={<Button>액션</Button>}>
    제목
  </CardHeader>
  <CardContent>
    내용
  </CardContent>
  <CardFooter>
    <Button variant="ghost">취소</Button>
    <Button>확인</Button>
  </CardFooter>
</Card>

// 그림자: none, sm, md, lg
// 패딩: none, sm, md, lg
// 속성: border, hover
```

#### 4. LoadingSpinner 컴포넌트
```typescript
<LoadingSpinner size="md" text="로딩 중..." />

<LoadingOverlay loading={isLoading}>
  <YourContent />
</LoadingOverlay>

// 크기: xs, sm, md, lg, xl
// 변형: primary, white, gray
```

#### 5. Modal 컴포넌트
```typescript
<Modal 
  isOpen={isOpen} 
  onClose={() => setIsOpen(false)}
  size="md"
  closeOnBackdropClick
>
  <ModalHeader onClose={() => setIsOpen(false)}>
    제목
  </ModalHeader>
  <ModalContent>
    내용
  </ModalContent>
  <ModalFooter>
    <Button variant="ghost">취소</Button>
    <Button>확인</Button>
  </ModalFooter>
</Modal>

// 크기: sm, md, lg, xl, full
// 기능: 키보드 ESC, 백드롭 클릭으로 닫기
```

### 컴포넌트 개발 가이드라인

1. **재사용성**: 모든 컴포넌트는 props를 통해 다양한 상황에서 재사용 가능해야 함
2. **접근성**: ARIA 속성과 키보드 네비게이션을 기본으로 구현
3. **타입 안정성**: TypeScript 인터페이스로 모든 props 타입 정의
4. **스타일 일관성**: TailwindCSS 클래스를 사용하여 디자인 시스템 일관성 유지
5. **성능**: forwardRef, memo 등을 적절히 활용하여 렌더링 최적화

### 새 컴포넌트 추가 시

1. `app/ui/common/components/`에 컴포넌트 파일 생성
2. TypeScript 인터페이스로 Props 타입 정의
3. Tailwind 클래스로 스타일링
4. `index.ts`에 export 추가
5. `examples.tsx`에 사용 예제 추가

---

이 가이드를 따라 새로운 기능을 추가하거나 기존 코드를 수정할 때 일관성을 유지하세요.