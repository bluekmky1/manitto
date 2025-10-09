# 마니또 SGB (Secret Gift Buddy)

AI 기반 메시지 톤 변환 기능이 있는 마니또 웹 애플리케이션입니다.

## 기능

- 💌 익명 메시지 전송
- 🤖 AI 자동 말투 변환 (GPT-3.5 Turbo)

## 기술 스택

- **Frontend**: Remix.js, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Edge Functions)
- **AI**: OpenAI GPT-4-mini
- **Deployment**: Vercel

## Vercel 배포 가이드

### 1. GitHub에 코드 푸시

```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 2. Vercel에 프로젝트 연결

1. [Vercel Dashboard](https://vercel.com/dashboard)에 로그인
2. "New Project" 클릭
3. GitHub 저장소 연결
4. Framework Preset: "Remix" 선택
5. Deploy 클릭

### 3. 환경 변수 설정

Vercel Dashboard > Project Settings > Environment Variables에서 다음 변수들을 설정:

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SESSION_SECRET=your_random_session_secret
OPENAI_API_KEY=your_openai_api_key
```

### 4. 재배포

환경 변수 설정 후 "Redeploy" 클릭

## 로컬 개발

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

## 환경 변수

`.env` 파일을 생성하고 다음 내용을 추가:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SESSION_SECRET=your_session_secret
OPENAI_API_KEY=your_openai_api_key
```

## 데이터베이스 스키마

Supabase SQL Editor에서 `migration.sql` 파일을 실행하여 데이터베이스를 설정하세요.

## AI 말투 변환

메시지 전송 시 자동으로 GPT-3.5 Turbo를 사용하여 친근하고 자연스러운 말투로 변환됩니다. 원본 메시지와 변환된 메시지 모두 데이터베이스에 저장됩니다.
