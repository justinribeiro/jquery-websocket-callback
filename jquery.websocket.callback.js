/*
 * jQuery.WebSocket Plugin v0.0.1
 *
 * Copyright (c) 2014 Justin Ribeiro.
 *
 * This document is licensed as free software under the terms of the
 * MIT License: http://www.opensource.org/licenses/mit-license.php
 *
 */
(function( jQuery, global ) {

    jQuery.websocket = function( options ) {

        var ws = {
            defaults: {
                url: null,
                protocals: null,
                heartbeat: false,
                debug: false,
            },

            // Holds the raw WebSocket connection
            connection: null,

            // Used for the heardbeat setInterval if needed
            interval: null,
            
            close: function( label ) {
                // stop the heartbeat if it exists
                if ( ws.heartbeat ) {
                    clearInterval(ws.interval);
                }
                
                // close the socket
                ws.connection.close();
            },
            
            // From the API documentation
            // http://api.jquery.com/jQuery.Callbacks/
            // Basic pub/sub implementation
            topic: function( id ) {
              var callbacks, method, topic = id && ws.topics[ id ];
             
              if ( !topic ) {
                callbacks = jQuery.Callbacks();
                topic = {
                  publish: callbacks.fire,
                  subscribe: callbacks.add,
                  unsubscribe: callbacks.remove
                };
                if ( id ) {
                  ws.topics[ id ] = topic;
                }
              }
              return topic;
            },
            topics: {},
            options: null
        },
        _private = {

            // Send is private because we can use
            // topic("websocket.send").publish()
            send: function( data ) {
                ws.connection.send( data );
            },

            // 
            //
            connect: function( options ) {

                // 
                if ( options.protocols ) {
                    ws.connection = new WebSocket(options.url, options.protocols);
                } else {
                    ws.connection = new WebSocket(options.url);
                }

                // Sometimes, you need to keep that connection open
                // by pinging it
                if (options.heartbeat) {
                    ws.interval = setInterval(function() { ws.connection.send('heartbeat'); }, 60000);
                }

                ws.connection.onopen = function(event){
                    ws.topic( "websocket.onOpen" ).publish( event.data );
                };

                ws.connection.onclose = function(event){
                    if (options.heartbeat) {
                        clearInterval(ws.interval);
                    }
                    ws.topic( "websocket.onClose" ).publish( event.data );
                };

                ws.connection.onmessage = function(event){
                    
                    // We don't need the cruft
                    var data = [];
                    data.push(event.data);

                    // add the raw MessageEvent response
                    if (options.debug) {
                        data.push = event;
                    }

                    ws.topic( "websocket.onMessage" ).publish( data );
                };

                ws.connection.onerror = function(event){
                    ws.topic( "websocket.onError" ).publish( event.data );
                };

                // this wires the ability to use 
                // topic("websocket.send").publish()
                ws.topic( "websocket.send" ).subscribe( this.send );

            }
        };

        // If params were passed in as an object, normalize to a query string
        options.data = options.data && jQuery.isPlainObject( options.data ) ?
                                        jQuery.param( options.data ) :
                                        options.data;

        // If we don't have a URL, then we stop
        if ( !options.url || typeof options.url !== "string" ) {
            throw new SyntaxError("WebSocket Connection Error: Must provide a url.");
        }

        // Save us the trouble, debug must a be a bool
        if (typeof options.debug !== 'undefined' && typeof options.debug !== "boolean") {
            throw new SyntaxError("WebSocket Connection Error: Debug must be a boolean value.");
        }

        // Create new options object
        options = jQuery.extend({}, ws.defaults, options);

        // run the connect
        _private.connect(options);

        // return our instance
        return ws;

    };

})(jQuery, window);