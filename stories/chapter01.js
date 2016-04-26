/*
 * chapter01.js
 *
 * The first chapter?  Oh mhy!
 */

(function () {
    /*****************
     * Game instance *
     *****************/
    var cGame = null;

    var getMap = (i) => `
    <path d="` +
      /* Cafeteria */
      `M 50 100 L 0 100 L 0 0 L 80 0 L 80 20`+
      /* Atrium */
      `M 100 120 L 50 120 L 50 80 M 50 70 L 50 20
      L 170 20 L 170 50 M 170 60 L 170 120 L 135 120`+
      /* Classroom */
      `M 160 20 L 160 0 L 240 0 L 240 100 L 170 100
    " stroke="#000" stroke-width="3" fill="none" />

    <text x="18" y="80" font-size="20" transform="rotate(270 18 80)">
    Cafeteria
    </text>
    <text x="70" y="70" font-size="20">
    Atrium
    </text>
    <text x="190" y="10" font-size="20" transform="rotate(90 190 10)">
    Classroom
    </text>`;

    /**********
     * Locale *
     **********/
    var locale = {
        unknown: "Unable to process command!",
        start: `# Chapter 1\n\nIt's the first day of school, and you've just been dropped off outside the main atrium.`,
        atrium: `Mr. Manning, the principal, is busy greeting everyone and telling them to go to the ` +
                `auditorium for orientation.`,
        greet: `>Why hello there!  Welome to Morristown High School!  What's your name?`,
        response: `Nice to meet you, %name%.  I hope you enjoy MHS.  Now why don't you head to the auditorium` +
                  `for orientation?  It'll be starting soon.`,
        introduced: `You've already introduced yourself to Mr. Manning.  There's no point doing so again.`,
        auditorium: `You enter the auditorium, where everyone is busy chatting with their old friends as well ` +
                    `as making new acquaintances.`,
        wait1: `You wait around awkwardly for orientation to start.  Ten minutes pass but it shows no sign of starting.`,
        wait2: `You resolutely refuse to make eye contact with anyone.  Finally, you hear Mr. Manning telling everyone ` +
               `to quiet down, and you anxiously await to hear what he has to tell you.`,
        friends1: `You decide to try your luck with making new friends.  Before long, you meet %friend%, and soon it's ` +
                  `like you two have been friends for life.`,
        friends2: `Before you know it, Mr. Manning is telling everyone to quiet down, and you anxiously await to ` +
                  `hear what he has to tell you.`,
        end: `Thanks for playing, and stay tuned for Chapter 2!`,
    };

    /********************
     * Helper Functions *
     ********************/
    function startsWith(text) {
        return command.trim().toLocaleLowerCase().startsWith(text);
    }

    function endsWith(text) {
        return command.trim().toLocaleLowerCase().endsWith(text);
    }

    /**************
     * Chapter01 *
     **************/
    function Chapter01(game) {
        this.game = game;
        this.section = 0;

        this.tell = game.tell.bind(null);
        this.sanitize = game.sanitize.bind(null);
        this.setMap = game.map.bind(null);

        // SECTION_GREET
        this.introduced = false;
    }

    Chapter01.prototype.respond = function (command) {
        // Before we do anything make sure the command is valid.
        if ( command.trim.split(" ").length < 1 ) {
            this.tell(locale.unknown);
            return;
        }

        if ( this.section == this.SECTION_START ) {
            this.tell(locale.start);
            this.section = this.SECTION_ATRIUM;
            return;
        }

        if ( this.section == this.SECTION_ATRIUM ) {
            if ( startsWith("enter") || startsWith("go to") ) {
                if ( endsWith("atrium") ) {
                    this.tell(locale.atrium);
                    this.section = this.SECTION_GREET;
                }
                /* TODO: Handle other places */
            } else {
                this.tell(locale.unknown);
            }
            return;
        }

        if ( this.section == this.SECTION_GREET ) {
            if ( startsWith("enter") || startsWith("go to") ) {
                if ( endsWith("auditorium") ) {
                    this.tell(locale.auditorium);
                    this.section = this.SECTION_AUDITORIUM;
                }
            } else if ( startsWith("talk to") || startsWith("greet") ) {
                if ( this.introduced ) {
                    this.tell(locale.introduced);
                } else if ( endsWith("mr. manning") ) {
                    this.tell(locale.greet);
                    this.section = this.SECTION_RESPONSE;
                }
            } else {
                this.tell(locale.unknown);
            }
            return;
        }

        if ( this.section == this.SECTION_RESPONSE ) {
            this.tell(locale.response.replace("%name%",cmd[0]));
            this.section = this.SECTION_GREET;
            this.introduced = true;
            return;
        }

        if ( this.section == this.SECTION_AUDITORIUM ) {
            this.tell(locale.auditorium);
            this.section = this.SECTION_DECISION;
            return;
        }

        if ( this.section == this.SECTION_DECISION ) {
            if ( startsWith("wait") ) {
                this.tell(locale.wait1);
                this.section = this.SECTION_WAIT;
            } else if ( startsWith("make friends") ) {
                this.tell(locale.friends1);
                this.section = this.SECTION_FRIENDS;
            }
            else {
                this.tell(locale.unknown);
            }
            return;
        }

        if (this.section == this.SECTION_WAIT ) {
            if ( startsWith("wait") || startsWith("keep waiting") ) {
                this.tell(locale.wait2);
                this.section = this.SECTION_END;
            } else if ( startsWith("make friends") || startsWith("stop waiting") ) {
                this.tell(locale.friends1);
                this.section = this.SECTION_FRIENDS;
            } else {
                this.tell(locale.unknown);
            }
            return;
        }

        if (this.section == this.SECTION_FRIENDS ) {
            this.tell(locale.friends2);
            this.section = this.SECTION_END;
            return;
        }

        if ( this.section == this.SECTION_END ) {
            this.tell(locale.end);
            return;
        }
    };

    Chapter01.prototype.SECTION_START      = 0;
    Chapter01.prototype.SECTION_ATRIUM     = 1;
    Chapter01.prototype.SECTION_GREET      = 2;
    Chapter01.prototype.SECTION_RESPONSE   = 3;
    Chapter01.prototype.SECTION_AUDITORIUM = 4;
    Chapter01.prototype.SECTION_DECISION   = 5;
    Chapter01.prototype.SECTION_WAIT       = 6;
    Chapter01.prototype.SECTION_FRIENDS    = 7;
    Chapter01.prototype.SECTION_END        = 8;

    /* global mhsgame */
    mhsgame.registerStory({
        name: "chapter01",
        description: "Your adventure starts here.",
    }, function (command, game) {
        if ( command == "_start" ) {
            // Reset Game
            cGame = new Chapter01(game);
        }
        cGame.respond(command);
    });
})();
