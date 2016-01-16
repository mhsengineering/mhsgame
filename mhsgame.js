/*
 * mhsgame.js
 *
 * Provides an interface for interacting with DOM.
 */

window.mhsgame = (function () {

    /********************
     * Global Variables *
     ********************/

    var cm_writer = new commonmark.HtmlRenderer();
    var cm_reader = new commonmark.Parser();

    /*************
     * Functions *
     *************/

    function addMessage( md ) {
        var para = document.createElement("div");
        var parsed = cm_reader.parse( md );
        var render = cm_writer.render( parsed );
        para.classList.add("message");
        para.innerHTML = render;
        $("#log").append(para);
    }

    function sanitizeMd( text ) {
        var escaped = [];
        var esc = "";
        for ( c of text ) {
            esc = "&#" + c.charCodeAt().toString() + ";";
            escaped.push( esc );
        }
        return escaped.join("");
    }

    function changeMap( svg ) {
        $("#map svg").html( svg );
    }

    function nextItemId() {
        var lis = $("#inventory .item").toArray();
        var id = 1;
        var liid;
        for ( li of lis ) {
            liid = parseInt( li.getAttribute("data-id"), 16 );
            if ( liid >= id ) {
                id = liid+1;
            }
        }
        return id;
    }

    function addItem(name, quantity) {
        var li = document.createElement("li");
        var title = document.createTextNode(name);
        var quant = document.createElement("span");
        var qtext = document.createTextNode( "x"+quantity.toString(10) );
        var id = nextItemId();

        removeItem( 0 );

        li.classList.add("item");
        quant.classList.add("quantity");

        li.setAttribute("data-id", id.toString(16));
        li.setAttribute("data-quant", quantity.toString(10));

        quant.appendChild( qtext );
        li.appendChild( title );
        li.appendChild( quant );

        $("#inventory ul").append( li );

        return id;
    }

    function removeItem( id ) {
        var lis = $("#inventory .item").toArray();
        var liid;
        for ( li of lis ) {
            liid = parseInt( $(li).attr("data-id"), 16 );
            if ( liid == id ) {
                $(li).remove();
                if ( lis.length <= 1 && id != 0 )
                    clearItems();
                return true;
            }
        }
        return false;
    }

    function updateItem( id, quant ) {
        var lis = $("#inventory .item").toArray();
        var liid;
        for ( li of lis ) {
            liid = parseInt( $(li).attr("data-id"), 16 );
            if ( liid == id ) {
                $(li).attr("data-quant", quant.toString(10));
                $(li).find(".quantity").html("x" + quant.toString(10));
            }
        }
    }

    function clearItems() {
        $("#inventory ul").html(
                "<li class='item' data-id='0' data-quant='0'>"+
                "(No Items) <span class='quantity'>x0</span></li>");
    }

    function reset() {
        // Reset Items
        clearItems();

        // Reset Map
        changeMap("<text x=\"10\" y=\"10\">Map Here</text>");
    }

    function init() {
        // Register Element Events
        $("#settings").on("click", handleOpenSettings);
        $("#cmdent").on("keypress", handleKeyPress);

        // Reset UI
        reset();

        // Greet User
        addMessage("Page Loaded.");
        addMessage(
`
# MHS Game

## Introduction

A simple text adventure game.
`                 );

        // Start Typeahead
        /*
        $("#cmdent").typeahead({
            hint: true,
            highlight: true,
        },
        {
            name: "Command",
            source: handleCompleteCommand,
        });
        */
    }

    /**********
     * Events *
     **********/

    function handleOpenSettings( event ) {
        addMessage("Try typing `help`.");
    }

    function handleKeyPress( event ) {
        var txt = $("#cmdent").val().trim();

        if ( event.keyCode == 13 && txt != "" ) {
            event.preventDefault();
            if ( txt == "help" )
                addMessage(`
Available Commands:
    help - display this message
                        `);
            else
                addMessage("Unknown Command: " + txt );
            $("#cmdent").val("");
            $("#console>pre").scrollTop( $("#console>pre").prop("scrollHeight") );
        }
    }

    function handleCompleteCommand( query, cb ) {
        cb(["move","attack"]);
    }

    /**************
     * Initialize *
     **************/
    
    // Register Load Event
    $(window).on("load", init);

    /**********
     * Return *
     **********/
    return {
        sm: sanitizeMd,
        ai: addItem,
        re: removeItem,
        ui: updateItem,
    };
})();
