/**
 * TODO
 *  1. 라우터 등록
 *  2. 컴포넌트 작성 (Home, Board)
 *  3. #root에 현재 페이지에 대한 화면 그리기 (render 함수)
 *  4. 페이지 이동 이벤트 등록하기 (History API)
 *  5. 게시물 추가/삭제 버튼 추가 및 이벤트 등록
 */
let router = [];

const boardList = [
    { id: 1, title: '첫번째 게시물입니다.' },
    { id: 2, title: '두번째 게시물입니다.' },
    { id: 3, title: '세번째 게시물입니다.' },
    { id: 4, title: '네번째 게시물입니다.' },
    { id: 5, title: '다섯번째 게시물입니다.' },
];
const addBoard = () => {
    boardList.push({ id: boardList[boardList.length - 1]?.id + 1, title: '신규 게시물입니다.' });
}
const removeBoard = () => {
    boardList.pop();
}

function render() {
    const routesObject = router.reduce((acc, { path, element }) => {
        acc[path] = element;
        return acc;
    }, {});

    const elementHTML = routesObject[location.pathname]();
    document.querySelector('#root').innerHTML = elementHTML;

    document.querySelectorAll('.menu').forEach(node => node.addEventListener('click', (e) => {
        e.preventDefault();

        history.pushState({},'', e.target.dataset.path)
        render()
    }))

    document.querySelector('.addBoard')?.addEventListener('click', () => {
        addBoard();
        render()
    })

    document.querySelector('.removeBoard')?.addEventListener('click', () => {
        removeBoard();
        render()
    })
}
function createBrowserRouter(routes) {
    window.addEventListener('popstate', (event) => {
        console.log('location:', location.pathname)
        render()
    })

    return routes;
}

function Home() {
    return `
        <div class="wrapper">
            <div class="header">
                <button class="menu" data-path="/">Home</a>
                <button class="menu" data-path="/board">Board</a>
            </div>
            <div class="content">
                <h1>Home</h1>
                <p>안녕하세요.</p>
                <p>하정훈의 개인 페이지입니다.</p>
            </div>
        </div>
    `
}
function Board() {
    return `
        <div class="wrapper">
            <div class="header">
                <button class="menu" data-path="/">Home</a>
                <button class="menu" data-path="/board">Board</a>
            </div>
            <div class="content">
                <h1>Board</h1>
                <button class="addBoard">게시물 추가</button>
                <button class="removeBoard">게시물 삭제</button>
                <ul>
                ${boardList.map(( board ) => `<li>${board.title}</li>`).join('')}
                </ul>
            </div>
        </div>
    `
}
function main() {
    router = createBrowserRouter([
        {
            path: '/',
            element: Home
        },
        {
            path: '/board',
            element: Board
        },
    ])
    render();
}

main();
