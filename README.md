# jquery-websocket-callback
A jQuery plugin that implements WebSockets with $.callbacks!

## Example
Let's say we want to listen for messages. We can do so quickly by creating our $.websocket and then subscribing to a set of particular topics:

```javascript
var myBrokerEcho = $.websocket({ 
                        url: "ws://echo.websocket.org/"
                    });

myBrokerEcho.topic( "websocket.onOpen" ).subscribe( onOpen );

myBrokerEcho.topic( "websocket.onMessage" ).subscribe( onMessage );

function onOpen( value ) {
  console.log("Connection Open!", value);
}

function onMessage( value ) {
  console.log("Incoming Message!", value);
}
```
## Why a WebSocket with a $.callback is cool
In short, the power of a pub/sub model with support for $.Deferreds. Let's rewrite our basic connect example and use a $.Deferred to send a message once we know we're connected:

```javascript
var myBrokerEcho = $.websocket({ 
    url: "ws://echo.websocket.org/"
});

myBrokerEcho.topic( "websocket.onOpen" ).subscribe( onOpen );

myBrokerEcho.topic( "websocket.onMessage" ).subscribe( onMessage );

var dfd = $.Deferred();
var topic = myBrokerEcho.topic( "websocket.send" );
dfd.done( topic.publish );

function onOpen( value ) {
  console.log("Connection Open!", value);
  dfd.resolve( "I'm resolved and sending a message that should echo back" );
}

function onMessage( value ) {
  console.log("Incoming Message!", value);
}
```
Oh so sweet.

## Settings
The avaliable options are sparse at the moment.

```javascript
var instance = $.websocket({ 
                        url: "ws://somewhere"
                        protocals: null,
                        debug: false,
                        heartbeat: false
                    });
```
## Topics
Default topics you can subscribe/publish/unsubscribe to are as follow:

```
instance.topic( "websocket.onOpen" )...
instance.topic( "websocket.onMessage" )...
instance.topic( "websocket.onClose" )...
instance.topic( "websocket.onError" )...
instance.topic( "websocket.send" )
```

## A work in progress
The base functionality works pretty well, but consider this version 0.0.1. I expect revisions and bug fixing. :-)
