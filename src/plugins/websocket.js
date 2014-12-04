game.module(
    'plugins.websocket'
)
.body(function() {

game.WebSocket = game.Class.extend({
    connection: null,

    init: function() {
        game.websocket = this;
    },

    connect: function(host) {
        host = host || game.WebSocket.host;
        if(!host) throw('WebSocket host not defined');
        if(!window.WebSocket) throw('WebSocket not supported');

        this.connection = new WebSocket(host);
        this.connection.binaryType = game.WebSocket.binaryType;
        this.connection.onopen = this.open.bind(this);
        this.connection.onclose = this.close.bind(this);
        this.connection.onmessage = this.message.bind(this);
        this.connection.onerror = this.error.bind(this);
    },

    connected: function() {
        return (this.connection.readyState === this.connection.OPEN);
    },

    send: function(data) {
        if(this.connected()) this.connection.send(data);
    },

    open: function() {
    },

    close: function() {
    },

    message: function() {
    },

    error: function() {
    }
});

game.WebSocket.host = '';
game.WebSocket.binaryType = 'arraybuffer';

game.plugins.websocket = game.WebSocket;

});