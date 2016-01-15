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

    function init() {
        // Register Element Events
        $("#settings").on("click", handleOpenSettings);
        $("#cmdent").on("keypress", handleKeyPress);

        // Clear Console
        $("#console>pre").html("");

        // Greet User
        addMessage("Page Loaded.");
        addMessage(
`
# MHS Game

## Introduction

A simple text adventure game.
`                 );

        changeMap(
`
<text x="10" y="10">Map Here</text>
`
                );

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
    };
})();
