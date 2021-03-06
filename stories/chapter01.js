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
    var command = null;

    var getMap = (x,y) => `
    <path d="` +
      /* Auditorium */
      `M 100 100 L 0 100 L 0 0 L 100 0 L 100 50 M 100 80 L 100 101.5`+
      /* Hallway */
      `M 126.5 50 L 98.5 50 M 126.5 80 L 98.5 80`+
      /* Main Atrium */
      `M 175 120 L 125 120 L 125 80 M 125 50 L 125 20
      L 245 20 L 245 120 L 205 120
    " stroke="#000" stroke-width="3" fill="none" />

    <text x="5" y="70" font-size="20">
    Auditorium
    </text>
    <text x="133" y="70" font-size="20">
    Main Atrium
    </text>

    <circle cx="${x}" cy="${y}" r="10" fill="#00BFFF" />
    <text x="${x-11}" y="${y+20}" font-size="13">You</text>`;

    /**********
     * Locale *
     **********/
    var locale = {
        unknown: `Unable to process command!`,
        noaccess: `You can't get to the auditorium from here!`,
        continue: `Enter anything to continue`,
        start: `# Chapter 1\n\nIt's the first day of school, and you've just been dropped off outside the main atrium.`,
        noescape1: `You attempt to leave but the police officer makes you turn back around.`,
        atrium: `Mr. Manning, the principal, is busy greeting everyone and telling them to go to the ` +
                `auditorium for orientation.`,
        noescape2: `You attempt to go back outside but there's simply too many people streaming through the entrance.`,
        greet: `>Why hello there!  Welome to Morristown High School!  What's your name?`,
        response: `>Nice to meet you, %name%.  I hope you enjoy MHS.  Now why don't you head to the auditorium ` +
                  `for orientation?  It'll be starting soon.`,
        introduced: `You've already introduced yourself to Mr. Manning.  There's no point doing so again.`,
        auditorium: `You enter the auditorium, where everyone is busy chatting with their old friends as well ` +
                    `as making new acquaintances.`,
        noescape3: `You attempt to leave but the security guards intimidate you into sitting back down.`,
        wait1: `You wait around awkwardly for orientation to start.  Ten minutes pass but it shows no sign of starting.`,
        wait2: `You resolutely refuse to make eye contact with anyone.  Finally, you hear Mr. Manning telling everyone ` +
               `to quiet down, and you anxiously await to hear what he has to tell you.`,
        chat: `You manage to find one of your friends from the middle school and discuss each other's vacations.`,
        friends1: `You decide to try your luck with making new friends.  Before long, you're talking to someone as if ` +
                  `you two have been friends for life.`,
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
        this.setMap = game.map.bind(null);

        // SECTION_GREET
        this.introduced = false;
    }

    Chapter01.prototype.respond = function (command) {
        // Before we do anything make sure the command is valid.
        if ( command.trim().split(" ").length < 1 ) {
            this.tell(locale.unknown);
            return;
        }

        // Suggest some commands
        if ( command == "_suggest" ) {
            switch ( this.section ) {
                case this.SECTION_ATRIUM: {
                    this.tell("*enter, go to*");
                    break;
                }
                case this.SECTION_GREET: {
                    this.tell("*enter, go to, talk to, chat with, greet*");
                    break;
                }
                case this.SECTION_AUDITORIUM: {
                    this.tell("*wait, make friends, chat*");
                    break;
                }
                case this.SECTION_WAIT: {
                    this.tell("*wait, keep waiting, make friends, stop waiting*");
                    break;
                }
                default: {
                    this.tell("No commands available");
                    break;
                }
            }
            return;
        }

        // Settings
        if ( command == "_settings" ) {
            this.tell("No settings available");
            return;
        }

        if ( this.section == this.SECTION_START ) {
            this.tell(locale.start);
            this.section = this.SECTION_ATRIUM;
            this.setMap(getMap(190,180));
            return;
        }

        if ( this.section == this.SECTION_ATRIUM ) {
            if ( startsWith("enter") || startsWith("go to") ) {
                if ( endsWith("atrium") ) {
                    this.tell(locale.atrium);
                    this.section = this.SECTION_GREET;
                    this.setMap(getMap(190, 90));
                } else if (endsWith("auditorium")) {
                    this.tell(locale.noaccess);
                } else {
                    this.tell(locale.unknown);
                }
            } else if (startsWith("leave") ) {
                this.tell(locale.noescape1);
            } else {
                this.tell(locale.unknown);
            }
            return;
        }

        if ( this.section == this.SECTION_GREET ) {
            if ( startsWith("enter") || startsWith("go to") ) {
                if ( endsWith("auditorium") || endsWith("orientation")) {
                    this.tell(locale.auditorium);
                    this.section = this.SECTION_AUDITORIUM;
                    this.setMap(getMap(50, 30));
                }
            } else if ( startsWith("talk to") || startsWith("chat with") || startsWith("greet") ) {
                if ( this.introduced ) {
                    this.tell(locale.introduced);
                } else if ( endsWith("mr. manning") || endsWith("mr manning") || endsWith("manning") || endsWith("principal") ) {
                    this.tell(locale.greet);
                    this.section = this.SECTION_RESPONSE;
                }
            } else if (startsWith("leave") || startsWith("go outside") ) {
                this.tell(locale.noescape2);
            } else {
                this.tell(locale.unknown);
            }
            return;
        }

        if ( this.section == this.SECTION_RESPONSE ) {
            this.tell(locale.response.replace("%name%",command.trim()));
            this.section = this.SECTION_GREET;
            this.introduced = true;
            return;
        }

        if ( this.section == this.SECTION_AUDITORIUM ) {
            if ( startsWith("wait") ) {
                this.tell(locale.wait1);
                this.section = this.SECTION_WAIT;
            } else if ( startsWith("make friends") ) {
                this.tell(locale.friends1);
                this.section = this.SECTION_FRIENDS;
            } else if ( startsWith("chat") ) {
                this.tell(locale.chat);
                this.section = this.SECTION_FRIENDS;
            } else if ( startsWith("leave") || startsWith("go to") ) {
                this.tell(locale.noaccess3);
            } else {
                this.tell(locale.unknown);
            }
            return;
        }

        if (this.section == this.SECTION_WAIT ) {
            if ( startsWith("wait") || startsWith("keep waiting") ) {
                this.tell(locale.wait2);
                this.tell(locale.continue);
                this.section = this.SECTION_END;
            } else if ( startsWith("make friends") || startsWith("stop waiting") ) {
                this.tell(locale.friends1);
                this.tell(locale.continue);
                this.section = this.SECTION_FRIENDS;
            } else {
                this.tell(locale.unknown);
            }
            return;
        }

        if (this.section == this.SECTION_FRIENDS ) {
            this.tell(locale.friends2);
            this.tell(locale.continue);
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
    Chapter01.prototype.SECTION_WAIT       = 5;
    Chapter01.prototype.SECTION_FRIENDS    = 6;
    Chapter01.prototype.SECTION_END        = 7;

    /* global mhsgame */
    mhsgame.registerStory({
        name: "chapter01",
        description: "Your adventure starts here.",
    }, function (cmd, game) {
        command = cmd;  //Globalize for helper functions
        if ( cmd == "_start" ) {
            // Reset Game
            cGame = new Chapter01(game);
        }
        cGame.respond(command);
    });
})();
