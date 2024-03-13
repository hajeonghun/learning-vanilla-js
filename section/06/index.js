let router = [];

const boardList = [
    { id: 1, title: '기존 게시물입니다.' },
    { id: 2, title: '기존 게시물입니다.' },
    { id: 3, title: '기존 게시물입니다.' },
    { id: 4, title: '기존 게시물입니다.' },
    { id: 5, title: '기존 게시물입니다.' },
    { id: 6, title: '기존 게시물입니다.' },
];

const addBoard = () => {
    boardList.push({ id: boardList[boardList.length - 1]?.id + 1, title: '추가 게시물입니다.' });
};

const removeBoard = () => {
    boardList.pop();
};

export function Home() {
    return `
    <div class="wrapper">
        <div class="header">
            <button class="menu" data-path="/">Home</button>
            <button class="menu" data-path="/board">Board</button>
        </div>
        <div class="content">
            <h1>Home</h1>
            <p>안녕하세요.</p>
            <p>하정훈의 개인 페이지입니다.</p>
        </div>
    </div>
    `;
}
export function Board() {
    return `
    <div class="wrapper">
        <div class="header">
            <button class="menu" data-path="/">Home</button>
            <button class="menu" data-path="/board">Board</button>
        </div>
        <div class="content">
            <h1>Board</h1>
            <button class="addBoard">게시물 추가</button>
            <button class="removeBoard">게시물 삭제</button>
            <ul>
                ${boardList.map((board) => `<li>${board.title}</li>`).join('')}
            </ul>
        </div>
    </div>
    `;
}

function render() {
    const elementHTML = router[location.pathname]();
    document.querySelector('#root').innerHTML = elementHTML;
    document.querySelectorAll('.menu').forEach((menuButtonElement) => {
        menuButtonElement.addEventListener('click', (e) => {
            e.preventDefault();
            history.pushState({}, '', e.target.dataset.path);
            render();
        });
    });
    document.querySelector('.addBoard')?.addEventListener('click', () => {
        addBoard();
        render();
    });
    document.querySelector('.removeBoard')?.addEventListener('click', () => {
        removeBoard();
        render();
    });
}

function createBrowserRouter(routes) {
    window.addEventListener('popstate', () => {
        render();
    });

    const routesObject = routes.reduce((acc, { path, element }) => {
        acc[path] = element;
        return acc;
    }, {});

    return new Proxy(routesObject, {
        get(target, prop) {
            if (prop === 'push') {
                return (message) => console.log(message);
            }
            console.log({ target, prop });
            return target[prop];
        },
        set() {
            return false;
        },
    });
}

function main() {
    router = createBrowserRouter([
        {
            path: '/',
            element: Home,
        },
        {
            path: '/board',
            element: Board,
        },
    ]);
    router.push('hello');
    render();
}

if (typeof window !== 'undefined') {
    main();
}
