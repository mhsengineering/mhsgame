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

    // The locale object contains all the text that will be printed. The object
    // is called "locale" because it can easily be replaced with other locales for
    // different languages. For instance, we could consider this locale "en_US"
    // and create another locale "es" for spanish. Ideally, each locale could be
    // stored in seperate files.
    // Make sure this variable only contains strings, or things that could easily
    // represented as strings. Although it may be tempting to do something like this:
    //    var locale = { count: (i) => `You have ${i} items!` }
    // The function, count, cannot be easily stored as a string. If you want to do
    // substitution, you're better off doing
    //    var locale = { count: "You have %items% items!" }
    // and replacing items.
    var locale = {
        unknown: "Unable to process command!",
        start: `# Chapter 1

                It's the first day of school, and you've just been dropped off outside the main atrium.`,
        principal: `Mr. Manning, the principal, is busy greeting everyone and telling them to go to the
                    auditorium for orientation.`,
        greet: `>Why hello there!  Welome to Morristown High School!  What's your name?`,
        reaponse: `Nice to meet you, %name%.  I hope you enjoy MHS.  Now why don't you head to the auditorium
                   for orientation?`,
        guessrange: "The number is between 1 and 10. Try again.",
        guesshigh: "You guessed high!",
        guesslow: "You guessed low!",
        guesscorrect: `
    You guessed the number correctly! It only took you %tries% tries!

    You have completed the sample story for mhsgame. It's now time for you to pave your own adventure. Copy sample.js to a new file
    and add it to index.html scripts. Remember to use the sample.js file because others might not be in the correct format. Good luck
    and have fun!
    `,
        // It's Okay to nest objects and arrays within locale.
        gameend: [
            "The game is over.",
            "I said the game is over",
            "Remember how I said the game is over earlier? Go home.",
            "I'm ignoring you.",
            "-",
            "-",
            "Seriosuly, go home."
        ],
    };

    /********************
     * Helper Functions *
     ********************/

    // When the user hits ENTER after typing a command your story will be passed
    // the raw value of the textbox, including spaces. This simply processes the
    // command into a more processable form.
    function procCmd(cmd) {
        return cmd.trim().split(" ");
    }

    /**************
     * Chapter01 *
     **************/

    // A Chapter01 instance is created when the user starts the game. ALL game
    // state should be stored in your game's class. DO NOT use cookies, localStorage
    // global variable, or other state that is persistent between games.
    function Chapter01(game) {
        this.game = game;
        this.section = 0;

        // Attach methods passed by game to the Chapter01 object for convienence.
        // This could also be done with prototypes.
        this.tell = game.tell.bind(null);
        this.sanitize = game.sanitize.bind(null);
        this.setMap = game.map.bind(null);

        // The story is split into sections for easier organization. Variables
        // specific for each section are put here.
        // SEC_GUESS
        this.guess_ans = 9;
        this.guess_tries = 1;
        // SEC_END
        this.end_reply = 0;
    }
    Chapter01.prototype.respond = function (command) {
        var cmd = procCmd(command);

        // Before we do anything make sure the command is valid.
        if ( cmd.length < 1 ) {
            // Note how we only call tell with strings defined in locale
            this.tell(locale.cantproc);
            return;
        }

        // Do section-specific actions

        if ( this.section == this.SEC_START ) {
            this.tell(locale.welc);
            this.section = this.SEC_RIDDLE;
            return; // If we don't return the if will fall through and another
                    // section will execute before we're ready.
        }

        if ( this.section == this.SEC_RIDDLE ) {
            if ( locale.ridans.test(cmd[0]) ) {
                this.tell(locale.ridcorrect);
                this.section = this.SEC_GUESS;
            } else {
                this.tell(locale.ridwrong);
            }
            return;
        }

        if ( this.section == this.SEC_GUESS ) {
            var g = parseInt(cmd[0],10);
            if (isNaN(g)) {
                this.tell(locale.cantproc);
                return;
            }

            if ( g < 0 || g > 10 ) {
                this.tell(locale.guessrange);
                return;
            }
            if ( g < this.guess_ans ) {
                this.tell(locale.guesslow);
                this.guess_tries++;
                return;
            }
            if ( g > this.guess_ans ) {
                this.tell(locale.guesshigh);
                this.guess_tries++;
                return;
            }

            this.tell(
                locale.guesscorrect.replace("%tries%",this.guess_tries.toString(10))
                );
            this.section = this.SEC_END;

            return;
        }

        if ( this.section == this.SEC_END ) {
            this.tell(locale.gameend[this.end_reply]);
            if ( this.end_reply < locale.gameend.length-1 ) {
                this.end_reply++;
            }
        }
    }
    // Each section has a number assosiated with it.
    Chapter01.prototype.SEC_START  = 0;
    Chapter01.prototype.SEC_RIDDLE = 1;
    Chapter01.prototype.SEC_GUESS  = 2;
    Chapter01.prototype.SEC_END    = 3;

    /* global mhsgame */
    mhsgame.registerStory({
        name: "chapter01", // Name should be short and lowercase
        description: "A template for creating your own games",
    }, function (command, game) {
        if ( command == "_start" ) {
            // Reset Game
            cGame = new Chapter01(game);
        }
        cGame.respond(command);
    });
})();
