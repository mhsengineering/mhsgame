/*
 * mhsgame.js
 *
 * Provides an interface for interacting with DOM.
 */

window.mhsgame = (function () {

    /*************
     * Functions *
     *************/

    function addMessage(text) {
        var para = document.createElement("p");
        var lines = text.split("\n");
        var text = lines.map( line => document.createTextNode(line) );

        for ( var i=0;i<text.length;i++ ) {
            para.appendChild( text[i] );
            if ( i+1 !== text.length )
                para.appendChild( document.createElement("br") );
        }

        $("#console>pre").append(para);
    }

    function init() {
        // Register Element Events
        $("#settings").on("click", handleOpenSettings);
        $("#cmdent").on("keypress", handleKeyPress);

        // Clear Console
        $("#console>pre").html("");

        // Greet User
        addMessage("Page Loaded.");
        addMessage("Nothing to show yet. Check back Soon.");

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
    return {};
})();
