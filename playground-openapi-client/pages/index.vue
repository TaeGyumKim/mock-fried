<template>
  <div class="container">
    <h1>Mock-Fried Client Package Mode</h1>
    <p>
      이 플레이그라운드는 <strong>openapi-generator</strong>로 생성된 TypeScript 클라이언트를 사용하여
      Mock API를 테스트합니다.
    </p>

    <div class="links">
      <NuxtLink
        to="/api-test"
        class="btn"
      >
        API Tester
      </NuxtLink>
    </div>

    <section class="info">
      <h2>Client Package Mode</h2>
      <p>
        mock-fried 모듈이 <code>@mock-fried/openapi-client</code> 패키지를 파싱하여
        자동으로 Mock 엔드포인트를 생성합니다.
      </p>
      <ul>
        <li>패키지의 API 클래스에서 경로와 반환 타입 추출</li>
        <li>모델 정의에서 스키마 정보 파싱</li>
        <li>타입 안전한 Mock 데이터 생성</li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

h1 {
  color: #00dc82;
  margin-bottom: 0.5rem;
}

.links {
  margin: 2rem 0;
}

.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: #00dc82;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: background 0.2s;
}

.btn:hover {
  background: #00b368;
}

.info {
  margin-top: 2rem;
  padding: 1.5rem;
  background: #f8f8f8;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
}

.info h2 {
  margin-top: 0;
  color: #333;
}

.info ul {
  padding-left: 1.5rem;
}

.info li {
  margin: 0.5rem 0;
}

code {
  background: #e8fff4;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: 0.9rem;
}
</style>
