
export let router = [];

function navigateTo(url) {
    console.log('router.find(route => route.path === url):',router.find(route => route.path === url))
    router.find(route => route.path === url).render();
}
function createBrowserRouter(routes) {
    window.addEventListener('popstate', (event) => {
        console.log('location:', location.pathname)
        navigateTo(location.pathname)
    })

    return routes.map(route => ({
        ...route,
        render: () => {
            document.querySelector('#root').innerHTML = route.element();
            history.pushState({},'', route.path)
        }
    }))
}

function Home() {
    return `
        <h1>Home</h1>
    `
}
function Login() {
    return `
        <h1>로그인</h1>
    `
}
function render() {
    router = createBrowserRouter([
        {
            path: '/',
            element: Home
        },
        {
            path: '/login',
            element: Login
        },
    ])
    navigateTo(location.pathname)
    // setTimeout(() => navigateTo('/login'), 3000)


}

window.onload = function(){
    render();
}
