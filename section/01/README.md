# create-my-custom-react

## 학습 목표
- CLI 란?
- node index.js / npm install package 가 실행되는 이유
- npx create-react-app <project-directory> vs npm install -g create-react-app
  - yarn create react-app <project-directory>
- 원하는 기능을 가진 CLI 만들기
- 스스로 활용방안 생각해보기

## 원하는 기능
- Node 14 버전 이상만 허용
- Yarn 사용중인지 체크
- 최신 버전의 create-my-custom-react 만 실행되도록 허용
- -v, --v 옵션 > CLI 버전 조회
- --info 옵션 > Environment Info 조회
- -h, --help 옵션 > 도움말 정보 추가
- create-my-custom-react <project-directory> 입력시, project-directory 명으로 현재위치에 생성
  - project-directory 미입력시, 안내문구 출력 및 CLI 종료
- JavaScript, TypesScript 중에 선택가능
- eslint, prettier 설정 선택가능
- template 파일 추가 

--------------------------

## Requirements
```text
- Node 14 버전 이상(Node > 14) 이 필요합니다.
- 최신버전(create-my-custom-react)으로 실행을 지원합니다.
```

## View Info
```shell
npx create-my-custom-react --info
yarn create my-custom-react --info
```

## View Help
```shell
npx create-my-custom-react --help
yarn my-custom-react --help
```

## Quick Start
```shell
yarn my-custom-react my-app
cd my-app
yarn start
```
