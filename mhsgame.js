/*
 * mhsgame.js
 *
 * Provides an interface for interacting with DOM.
 */

window.mhsgame = (function () {

    /********************
     * Global Variables *
     ********************/

    var mrender = null; // Set up on initialization

    var ls_commands = [];
    var ls_stories = [];

    var cur_story = null;

    var lastmessage = -1;

    /*************
     * Functions *
     *************/

    function registerStory(opt, run) {
        ls_stories.push({
            name: opt.name,
            description: opt.description,
            run: run,
        });
    }

    function registerCommand(opt, run) {
        for ( cmd of opt.cmd ) {
            if ( cmd.substr(0,1) != "_" ) {
                throw Error("Command does not start with _!");
            }
            if ( cmd.search(" ") > -1 ) {
                throw Error("Command contains a space!");
            }
        }
        ls_commands.push({
            cmd: opt.cmd,
            run: run,
        });
    }

    function addMessage( md ) {
        // Ensure md is a string (continueing without this check
        // will lead to weird and difficult to find errors)
        if ( typeof md != "string" ) {
            throw new Error(
                    "Message should be a markdown-formatted string. "+
                    "Instead got " + (typeof md) + "!"
                    );
        }
        // Calculate the message id
        var msgid = (++lastmessage);
        // First, we create a div to hold our message
        var holder = document.createElement("div");
        holder.classList.add("message");
        holder.setAttribute("msgid", msgid.toString(16));
        // Then we will parse the markdown to html
        var prehtml = marked(md, {
            renderer: mrender,
        });
        // Markdown allows raw html,so we need to make sure the html will
        // not mess with our formatting. This additional sanitization step
        // isn't as much about security, as preventing hard-to-catch errors.
        var pure = DOMPurify.sanitize(prehtml, {
            ALLOW_UNKNOWN_PROTOCOLS: true,
            RETURN_DOM_FRAGMENT: true,
            RETURN_DOM_IMPORT: true,
            KEEP_CONTENT: false,
        });
        // We need to add event handlers to all the links, to detect if we
        // need to send a command. See init for explanation.
        var links = Array.prototype.map.call(
                pure.querySelectorAll("a"), x => x
                )
        for ( link of links ) {
            link.addEventListener("click", function (e) {
                var cmd = this.getAttribute("data-cmd");
                var frommsg = parseInt(this.getAttribute("data-frommsg"),16);
                var msgdiff = lastmessage - frommsg;
                if ( cmd ) {
                    e.preventDefault();
                    execCommand(["_link",cmd,msgdiff.toString(16)].join(" "));
                }
            });
        }
        // Now add it to the document
        holder.appendChild( pure );
        $("#log").append(holder);
        // Reset the console
        resetConsole();
    }

    function sanitizeMd( text ) {
        var escaped = [];
        var esc = "";
        for ( c of text ) {
            esc = "&#" + c.charCodeAt().toString() + ";";
            escaped.push( esc );
        }
        if ( escaped.length < 1 ) {
            escaped.push("&nbsp;");
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
        // Build renderer
        mrender = new marked.Renderer();
        mrender.link = function (href, title, text) {
            // We override the link rendering so we can create custom links
            // that have the ability to send commands. These special commands
            // have the form of
            //     [Give $5](#GIVE5)
            // where GIVE5 can be any case-sensitive combination of letters and
            // numbers. When a user clicks on the link, the story will recieve
            // the command
            //     _link #GIVE5 0
            // where 0 indicates the link was clicked on the last sent message.
            var trim = href.trim();
            var link = document.createElement("a");
            var tnode = document.createTextNode(text);
            
            if ( title )
                link.setAttribute("title",title);
            if ( (/^#[A-Za-z0-9]*$/).test(trim) ) {
                link.setAttribute("href",trim);
                link.setAttribute("data-cmd", trim);
                link.setAttribute("data-frommsg", lastmessage.toString(16));
            } else {
                link.setAttribute("href",href);
            }
            
            link.appendChild(tnode);
            return link.outerHTML;
        }
        
        // Register Element Events
        $("#settings").on("click", handleOpenSettings);
        $("#cmdent").on("keydown", handleKeyPress);

        // Reset UI
        reset();

        // Start met game
        if ( !startStory("meta") ) {
            addMessage("Unable to find `meta` game!");
        }

        // Window events
        $( window ).on("hashchange", handleHashChange);
        handleHashChange();
    }

    function startStory( name ) {
        for ( story of ls_stories ) {
            if ( story.name == name ) {
                cur_story = story;
                execCommand( "_start" );
                return true;
            }
        }
        return false;
    }

    function execCommand( txt ) {
        var semis = txt.split(";");
        if ( semis.length > 1 ) {
            for ( semi of semis ) {
                execCommand( semi );
            }
            return;
        }

        var first = txt.split(" ")[0];
        for ( cmd of ls_commands ) {
            for ( alias of cmd.cmd ) {
                if ( alias == first ) {
                    cmd.run(txt);
                    return;
                }
            }
        }
        if ( cur_story ) {
            cur_story.run( txt, {
                tell: addMessage,
                map: changeMap,
                addItem,
                updateItem,
                removeItem,
                sanitize: sanitizeMd,
            });
            return;
        }
        addMessage("Unknown Command: **"+sanitizeMd(txt)+"**");
    }

    function getStories() {
        var ret = [];
        for ( story of ls_stories ) {
            ret.push({
                name: story.name,
                description: story.description,
            });
        }
        return ret;
    }

    function resetConsole() {
            $("#cmdent").val("");
            $("#log").scrollTop( $("#log").prop("scrollHeight") );
    }

    /**********
     * Events *
     **********/

    function handleOpenSettings( event ) {
        execCommand("_settings");
    }

    function handleKeyPress( event ) {
        var txt = $("#cmdent").val().trim();

        if ( event.keyCode == 13 && txt != "" ) {
            event.preventDefault();

            execCommand( txt );

            resetConsole();
        }
        if ( event.keyCode == 9 ) {
            event.preventDefault();

            execCommand("_suggest");

            resetConsole();
        }
    }

    function handleCompleteCommand( query, cb ) {
        cb(["move","attack"]);
    }

    function handleHashChange() {
        var hash = location.hash.substr(1);
        if ( hash.length > 0 )
            execCommand( location.hash.substr(1) );
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
        registerStory,
        registerCommand,
        getStories,
        sanitizeMd,
        startStory,
        tell: addMessage,
    };
})();
