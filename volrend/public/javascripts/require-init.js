requirejs.config({
    baseUrl: 'scripts',
    paths: {
        THREE: "lib/three.min",
        MersenneTwister: "lib/mersenne-twister",
        SocketIO: "../socket.io/socket.io",
        JQuery: "lib/jquery-2.1.4.min"
    },
    shim: {
        THREE: {
            exports: "THREE"
        },
        MersenneTwister: {
            exports: "MersenneTwister"
        },
        SocketIO: {
            exports: "io"
        }
    }
});

requirejs(['main']);
