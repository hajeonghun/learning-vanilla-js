# CSR(Client Side Rendering) 구현

## 학습 목표
- CSR 이란?
- 동작방식, 장/단점 알아보기
- CSR === SPA ?
- Module Script VS Script
  - 빌드툴이 하는 일
- CSR 방식으로 간단한 페이지 구현해보기
  - 링크 이동 => history
  - router 등록 => proxy
  
## CSR 이란?
- 브라우저 렌더링이 클라이언트(=브라우저) 측에서 이루어 짐
    
## CSR 동작 방식
1. 사용자가 웹페이지 방문
2. 웹 페이지에서 서버에 리소스 요청
3. 서버에서 빈 HTML 제공
4. 브라우저는 서버에서 응답받은 HTML 에 연결된 JS를 다운
5. 다운받은 JS를 실행하며 렌더링
  
## CSR 장/단점
- 장점
  - 서버측의 부하가 적음
  - 초기 로딩 이후, 페이지 변경 시 빠른 인터랙션 제공 가능
- 단점
  - SEO(검색엔진 최적화) 취약
  - 초기 로딩 속도가 느림
  - JS 파일을 다운 후 실행전까지 흰화면 노출 

## CSR === SPA ?
> <span style="color:red">CSR 과 SPA 는 비교 대상이 아님</span>
- CSR 은 렌더링이 어느 사이드에서 일어나냐의 관점에서의 용어
- SPA 는 페이지 개수의 관점
  
## Module Script VS Script
- Module Script
  - 엄격모드(strict mode)에서 실행
    - 최상위 this 객체 undefined
    - 선언하지 않은 변수는 사용 불가 등
  - defer 처럼 지연실행
  - DOM 조작 가능
  - import / export 사용 가능
- Script
  - 최상위 this 객체에 전역객체(window) 바인딩
  - 선언하지 않은 변수 사용 가능
  - 선언 위치에 따라 DOM 접근 가능/불가능
  - import / export 사용 불가능
