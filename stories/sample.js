/*
 * sample.js
 *
 * This story is a sample for how to write your own stories in mhsgame. Feel
 * free to copy this file when making your own story.
 */

(function () {
    var cGame = null;
    
    var getMap =
(i) => `
<text x="5" y="5" font-size="80">${i}</text>
`;
    
    var locale = {
        cantproc: "Unable to process command!",
        welc: `
# Sample Story

Welcome to the sample mhsgame! This story acts as a sample for people who want to write
stories for mhsgame in the future. This is formatted as [Markdown](https://en.wikipedia.org/wiki/Markdown)
and stored with the code to the game. Markdown supports ruch editing features such as **bold**, *italics*,
[links](https://en.wikipedia.org/wiki/Lead-cooled_fast_reactor), and even images!

All these rich text features are important because mhsgame is a [text adventure game](https://en.wikipedia.org/wiki/Interactive_fiction)
(AKA interactive fiction). Unlike more modern video games which may tell stories through movie-esque moving pictures and quick
interaction, text adventure games rely on the power of language to convey messages.

To continue to the next section please answer the following riddle. To answer, type in your answer in the text box below and hit enter.

> What walks on four legs in the morning, two legs in the afternoon, and three legs in the evening?
`,
    ridans: /(person)|(human)/,
    ridcorrect: `
You correctly answered the riddle! See, you're getting the hang of this! For the next challenge
I'm thinking of a number between 1 and 10. After you guess, I'll tell you if you're guess was higher or
lower than the correct answer.
`,
    ridwrong: "You didn't answer the riddle correctly. Try again and don't cheat!",
    guessrange: "The number is between 1 and 10. Try again.",
    guesshigh: "You guessed high!",
    guesslow: "You guessed low!",
    guesscorrect: `
You guessed the number correctly! It only took you %tries% tries!

You have completed the sample story for mhsgame. It's now time for you to pave your own adventure. Copy sample.js to a new file
and add it to index.html scripts. Remember to use the sample.js file because others might not be in the correct format. Good luck
and have fun!
`,
    gameend: [
        "The game is over.",
        "I said the game is over",
        "Remember how I said the game is over earlier? Go home.",
        "I'm ignoring you.",
        "-",
        "-",
        "Seriosuly, go home."
    ]
    };

    function procCmd(cmd) {
        return cmd.trim().split(" ");
    }

    function SampleGame(game) {
        this.game = game;
        this.section = 0;
        
        this.tell = game.tell.bind(null);
        this.sanitize = game.sanitize.bind(null);
        this.setMap = game.map.bind(null);
        
        // SEC_GUESS
        this.guess_ans = 9;
        this.guess_tries = 1;
        
        // SEC_END
        this.end_reply = 0;
    }
    SampleGame.prototype.respond = function (command) {
        var cmd = procCmd(command);
        
        if ( cmd.length < 1 ) {
            this.tell(locale.cantproc);
            return;
        }
        
        if ( this.section == this.SEC_START ) {
            this.tell(locale.welc);
            this.section = this.SEC_RIDDLE;
            return;
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
    SampleGame.prototype.SEC_START  = 0;
    SampleGame.prototype.SEC_RIDDLE = 1;
    SampleGame.prototype.SEC_GUESS  = 2;
    SampleGame.prototype.SEC_END    = 3;
    
    /* global mhsgame */
    mhsgame.registerStory({
        name: "sample",
        description: "A template for creating your own games",
    }, function (command, game) {
        if ( command == "_start" ) {
            // Reset Game
            cGame = new SampleGame(game);
        }
        cGame.respond(command);
    });
})();
