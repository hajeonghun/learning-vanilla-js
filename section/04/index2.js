
export let router = {};

function createBrowserRouter(routes) {
    window.addEventListener('popstate', (event) => {
        console.log('location:', location.pathname)
        router.push(location.pathname)
    })

    const routesObject = routes.reduce((acc, { path, element }) => {
        acc[path] = element;
        return acc;
    }, {});

    return new Proxy(routesObject, {
        get(target, prop){
            if (prop === 'push' ){
                return (path) => {
                    document.querySelector('#root').innerHTML = target[path]();
                    history.pushState({},'', path)
                }
            }
        },
        set(target, prop, value){
            return false
        }
    })
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
    console.log('router:',router, router['/'])
    router.push(location.pathname)
    setTimeout(() => router.push('/login'), 3000)
}

window.onload = function(){
    render();
}


//var express = require('express');
//var app = express();
//
//var path = __dirname + '/public';
//var port = 8080;
//
//app.use(express.static(path));
//app.get('*', function(req, res) {
//res.sendFile(path + '/index.html');
//});
//app.listen(port);
