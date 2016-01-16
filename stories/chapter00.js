/*
 * chapter00.js
 *
 * Tutorial
 */
(function () {
    var chapter = null;

    var getMap = (x,y) =>
`
<!-- Outline -->
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
</text>

<circle cx="${x}" cy="${y}" r="10" fill="#00BFFF" />
<text x="${x-11}" y="${y+19}" font-size="13">You</text>
`;

    function invCmd( cmd, game ) {
        game.tell(
`
Sorry, I don't understand **${game.sanitize(cmd)}**.
`);
    }

    var sections = [
        function ( args, game ) {
            game.map( getMap(140,140) );
            game.tell(
`
# Chapter 0
## Tutorial

MHSGame is a text adventure that takes place at Morristown
High School. Throughout the game you will enter commands
at the bottom of the screen to choose how you want to
proceed. To continue, enter the phrase **continue**.
`);
            return true;
        },
        function ( args, game ) {
            if ( args[0] == "continue" ) {
                game.tell(
`
Good! Now try entering the autrium. Type **enter atrium**.
`
);
                return true;
            } else {
                invCmd( args[0], game );
                return false;
            }
        },
        function ( args, game ) {
            if ( args[0] == "continue" ) {
                game.tell(
`
To continue to the next part, the **continue** command will
not work. Try entering **enter atrium**.
`);
                return false;
            }
            if ( args[0] != "enter" ) {
                invCmd( args[0], game );
                return false;
            }
            if ( args.length < 2 ) {
                game.tell(
`
Where would you like to go? Try \`enter [place]\`. If
you're having trouble fighting a place to enter, try the
atrium.
`);
                return false;
            }
            if ( args[1] == "cafeteria" || args[1] == "classroom" ) {
                game.tell(
`
You can't get to the **${args[1]}** from here!
`);
                return false;
            }
            if ( args[1] != "atrium" ) {
                game.tell(
`
I don't recognize **${game.sanitize(args[1])}** as a place!
`);
                return false;
            }
            game.map( getMap(100, 90) );
            game.tell(
`
Good job! You have succcessfully completed the tutorial.
Feel free to explore the school.
`);
            return true;
        }
    ];

    function Chapter00() {
        this.section = 0;
        this.room = 1;

        this.items = [0,0];
    }
    Chapter00.prototype.roam = function (args, game) {
        var rooms = ["outside", "atrium", "cafeteria", "classroom"];
        var access = [[0,1,0,0],[1,0,1,1],[0,1,0,0],[0,1,0,0]];
        if ( args[0] == "enter" ) {
            if ( args.length < 2 ) {
                game.tell(
`
Where would you like to go? Write in the form \`enter [place]\`.
`);
                return;
            }
            var roomi = rooms.indexOf(args[1]);
            if ( roomi < 0 ) {
                game.tell(
`
I don't recognize **${game.sanitize(args[1])}** as a place!
`);
                return;
            }
            if ( roomi == this.room ) {
                game.tell(
`
You're already in **${rooms[roomi]}**!
`);
                return;
            }
            if ( access[this.room][roomi] ) {
                this.room = roomi;
                var txt = 
`
You are now in the **${rooms[roomi]}**!
`;
                if ( roomi == 2 ) {
                    txt += " You've found a sandwich.";
                    this.find(1, game);
                } else if ( roomi == 3 ) {
                    txt += " You've found a pencil.";
                    this.find(2, game);
                }
                game.tell( txt );
                return;
            }
            game.tell(
`
You can't access the **${rooms[roomi]}** from the **${rooms[this.room]}**!
`
                    );
            return;
        }
        invCmd( args[0], game );
    }
    Chapter00.prototype.find = function (id, game) {
        if ( !this.items[id] ) {
            this.items[id] = game.addItem(id==1?"sandwich":"pencil",1);
            this.items[id+2] = 1;
        } else {
            this.items[id+2]++;
            game.updateItem(this.items[id],this.items[id+2]);
        }
    }
    Chapter00.prototype.respond = function (command, game) {
        var args = command.split(" ")
            .filter( a => a!="" ).map( a => a.toLowerCase() );

        if ( this.section >= 3 ) {
            this.roam(args, game);
            switch ( this.room ) {
                case 0:
                    game.map( getMap(100,160) );
                    break;
                case 1:
                    game.map( getMap(110,90) );
                    break;
                case 2:
                    game.map( getMap(30,50) );
                    break;
                case 3:
                    game.map( getMap(220,60) );
                    break;
            }
            return;
        }

        if ( sections[this.section]( args, game ) ) {
            this.section++;
        }
    }

    mhsgame.registerStory({
        name: "chapter00",
        description: "Tutorial on how to play.",
    }, function (command, game) {
        if ( command == "_start" ) {
            // Reset Chapter
            chapter = new Chapter00();
        }
        chapter.respond(command, game);
    });
})();
