/*
 * zombies.js
 *
 * The school has become overrun with zombies, and it's
 * your job to stop them.
 *
 * WARNING! This file contains spoilers for the game.
 */

(function () {
    /*****************
     * Game instance *
     *****************/

    var cGame = null;

    /*******
     * Map *
     *******/

    // The world is made up of a 5x5 grid of rooms, each
    // with special items. This is hardcoded, but it may
    // be possible to randomly generate for future versions.

    // General Flags
    var ROOM_F0     = 0;
    var ROOM_FNONE  = 1<<0; // No room at this point
    var ROOM_FSTART = 1<<1; // Starting room
    var ROOM_FEND   = 1<<2; // End room (upon entry, game ends)
    var ROOM_FCHEST = 1<<3; // Room contains chest with useful supplies
    var ROOM_FSTORE = 1<<4; // This room is part of the store
    // Special Events
    var ROOM_ENONE   = 0;
    var ROOM_ESTART  = 1;
    var ROOM_EEND    = 2;
    var ROOM_EHELP   = 3;
    var ROOM_EPIT    = 4;
    var ROOM_ETRAP   = 5;
    var ROOM_ETRIVIA = 6;
    var ROOM_ELOVE   = 7;
    // Doors
    var ROOM_DEAST  = 1;
    var ROOM_DNORTH = 2;
    var ROOM_DSOUTH = 4;
    var ROOM_DWEST  = 8;
    var rooms = [
        // Properies shortened for terseness
        // d (danger), f (flags), e (event), w (walk/doors)

        /* y = 0 */
        {d: 0, f: ROOM_FSTART, e:ROOM_ESTART, w: 0b0001 },
        {d: 0, f: 0, e: 0, w: 0b1001 },
        {d: 0, f: 0, e: 0, w: 0b1001 },
        {d: 0, f: 0, e: 0, w: 0b1001 },
        {d: 0, f: 0, e: 0, w: 0b1100 },
        /* y = 1 */
        {d: 0, f: ROOM_FEND, e: ROOM_EEND, w: 0b0001 },
        {d: 0, f: 0, e: 0, w: 0b1100 },
        {d: 0, f: ROOM_FSTORE, e: 0, w: 0b0101 },
        {d: 0, f: ROOM_FSTORE, e: 0, w: 0b1100 },
        {d: 0, f: 0, e: 0, w: 0b0110 },
        /* y = 2 */
        {d: 0, f: 0, e: 0, w: 0b0101 },
        {d: 0, f: 0, e: 0, w: 0b1010 },
        {d: 0, f: 0, e: 0, w: 0b0111 }, // Store Entry
        {d: 0, f: ROOM_FSTORE, e: 0, w: 0b1010 },
        {d: 0, f: 0, e: 0, w: 0b0110 },
        /* y = 3 */
        {d: 0, f: 0, e: 0, w: 0b0011 },
        {d: 0, f: 0, e: 0, w: 0b1101 },
        {d: 0, f: 0, e: 0, w: 0b1011 },
        {d: 0, f: 0, e: 0, w: 0b1100 },
        {d: 0, f: 0, e: 0, w: 0b0110 },
        /* y = 4 */
        {d: 0, f: 0, e: 0, w: 0b0001 }, // Dead End
        {d: 0, f: 0, e: 0, w: 0b1011 },
        {d: 0, f: 0, e: 0, w: 0b1001 },
        {d: 0, f: 0, e: 0, w: 0b1011 },
        {d: 0, f: 0, e: 0, w: 0b1010 },
    ];

    var maptemplate =
({roompath, x, y}) =>
`
<path d="${roompath}" stroke="#000" stroke-width="3" stroke-linecap="square"
stroke-linejoin="miter" fill="none" />
<circle cx="${x*50+25}" cy="${y*50+25}" r="10" fill="#00BFFF" />
`;

    //
    // Generated Content
    //

    var roompath = (function () {
        var path = [];
        var m = (x,y) => path.push(`M${x} ${y}`); // Move to
        var l = (x,y) => path.push(`L${x} ${y}`); // Draw line to

        // Draw a border around the rooms. The SVG will be about 270 pixels
        // wide, with the height determined by the users browser window.
        // Rooms will be 50 pixels wide, centered on the screen (offsets
        // determined by m and l functions).
        m(0,0);l(0,250);l(250,250);l(250,0);l(0,0);

        // Each room (except the store) will have a border around it. This
        // border will have a 5 pixel margin withing its 50x50 block of pixels.
        // Hallways are drawn when drawing doors on the southern and western
        // rooms.
        var x, y, r;
        for ( i in rooms ) {
            x = i%5; y = Math.floor(i/5);
            r = rooms[i];
            if ( r.f & ROOM_FSTORE ) {
                // The code in this if block is designed specifically for the map
                // above. If the map is changed above, this will not work.
                if ( !(r.w & ROOM_DNORTH) ) {
                    m( x*50, y*50 );
                    l( x*50 + 50, y*50 );
                }
                if ( !(r.w & ROOM_DEAST) ) {
                    m( x*50+50, y*50 );
                    l( x*50+50, y*50+50 );
                }
                if ( !(r.w & ROOM_DSOUTH) ) {
                    m( x*50+50, y*50+50 );
                    l( x*50+5, y*50+50 );
                    l( x*50+5, y*50+30 );
                }
                if ( !(r.w & ROOM_DWEST) ) {
                    m( x*50, y*50 );
                    l( x*50, y*50+45 );
                    l( x*50+20, y*50+45 );
                    m( x*50+30, y*50+45 );
                    l( x*50+55, y*50+45 );
                    l( x*50+55, y*50+70 );
                }
            } else {
                m( x*50 +  5, y*50 +  5 );
                if ( r.w & ROOM_DNORTH ) {
                    l( x*50 + 20, y*50 +  5 );
                    l( x*50 + 20, y*50 -  5 );
                    m( x*50 + 30, y*50 -  5 );
                    l( x*50 + 30, y*50 +  5 );
                    l( x*50 + 45, y*50 +  5 );
                } else {
                    l( x*50 + 45, y*50 +  5 );
                }
                if ( r.w & ROOM_DEAST ) {
                    l( x*50 + 45, y*50 + 20 );
                    l( x*50 + 52, y*50 + 20 );
                    m( x*50 + 53, y*50 + 30 );
                    l( x*50 + 45, y*50 + 30 );
                    l( x*50 + 45, y*50 + 45 );
                } else {
                    l( x*50 + 45, y*50 + 45 );
                }
                if ( r.w & ROOM_DSOUTH ) {
                    l( x*50 + 30, y*50 + 45 );
                    m( x*50 + 20, y*50 + 45 );
                    l( x*50 +  5, y*50 + 45 );
                } else {
                    l( x*50 +  5, y*50 + 45 );
                }
                if ( r.w & ROOM_DWEST ) {
                    l( x*50 +  5, y*50 + 30 );
                    m( x*50 +  5, y*50 + 20 );
                    l( x*50 +  5, y*50 +  5 );
                } else {
                    l( x*50 +  5, y*50 +  5 );
                }
            }
        }

        return path.join("");
    })();

    //
    // Manager
    //

    function RoomManager() {
        this.overlays = [];

        this.startclosed = false;
    }
    RoomManager.prototype.getMap = function (x,y) {
        return maptemplate({
            roompath,x,y
        }) + this.overlays.join("\n");
    }
    RoomManager.prototype.closeStart = function () {
        this.startclosed = true;
        this.overlays.push(
            `<rect width="10" height="10" x="50" y="20" />`
        );
    }

    /************
     * Monsters *
     ************/

    var monsters = {
    };

    function MonsterManager() {
    }

    /**********
     * Locale *
     **********/

    var locale = {
        // Development ( these should never appear in production )
        nyi: "NOT YET IMPLEMENTED",
        cmderror: "ERROR PROCESSING COMMAND",
        // General
        nounderstand: "Sorry, I don't understand **%cmd%**!",
        // Introduction
        intro:
`
# Zombies

You have just escaped the outside, where zombies have been roaming free for
nearly ten years now. The society you've helped build crumbled last night as
zombies over took it. In a chaotic free-for-all you've managed to escape and
decided to go to The Underground City.

The Underground City was started eighty years ago to provide a place to escape
global warming while we improved space travel enough to leave the planet for
good. As time went on it became clear that zombies were the more pertinent
issue facing society. After twenty years of repurposing the old structures,
the head architect got bored and quit leaving a web of half-finished
underground rooms.

Sometimes you feel guilty about leaving all your past friends behind, but then
you realize you really didn't like those people anyway. You move on without
guilt.

## How To Win

The purpose of the game is simple: reach the exit without dying. During your
journey you will find notes, buy items, kill zombies and score points.

If you need help with using commands, use the \`help\` command. If you need
help with a particular command, use \`help [command]\`. If you need a list
of commands to try, hit tab while typing in the command box.

## Tips

- You're the blue dot.
- Notes give you insight into the world, and may provide hints to secrets on
  the map
- It may not be necessary to kill every zombie
- Score is primarily determined by the money you're holding when you finish.
- There is a finite amount of money on the map.
- Zombification is contagious.
- I haven't spellchecked this game yet, so cut me a break
- It may be necessary to backtrack
- If you're in the first room, besides looking at your supplies and status,
  you're only option is to \`go east\`
`,
    }

    /*************************
     * Additional Management *
     *************************/

    function NotesManager() {
    }

    function InventoryManager() {
    }

    /********************
     * Helper Functions *
     ********************/

    function procCmd(cmd) {
        return cmd.trim().toLowerCase().split(" ");
    }

    /**************
     * ZombieGame *
     **************/

    function ZombieGame(game) {
        this.game = game;
        this.tell = game.tell.bind(null);
        this.setMap = game.map.bind(null);

        this.rooms = new RoomManager();
        this.monsters = new MonsterManager();

        // Current Room
        this.roomx = null;
        this.roomy = null;
    }
    ZombieGame.prototype.respond = function (txt) {
        var cmd = procCmd( txt );

        if ( cmd.length < 1 ) {
            this.tell(locale.cmderror);
        }

        // Send command to appropriate response
        var rem = cmd.slice(1);
        switch ( cmd[0] ) {
            case "_start":
                this.start();
                break;
            case "_settings":
                this.rSettings();
                break;
            case "_suggest":
                this.rSuggest();
                break;
            case "help":
                this.rHelp( rem );
                break;
            case "attack":
                this.rAttack( rem );
                break;
            case "go":
                this.rGo( rem );
                break;
            case "shop":
                this.rShop( rem );
                break;
            default:
                this.tell( locale.nounderstand.replace("%cmd%",this.game.sanitize(txt)) );
        }

        // Update the map
        this.setMap( this.rooms.getMap(this.roomx, this.roomy) );
    }

    //
    // Command Responses
    //

    ZombieGame.prototype.start = function () {
        this.roomx = 0;
        this.roomy = 0;

        this.tell( locale.intro );
    }

    ZombieGame.prototype.rSettings = function () {
        this.tell( locale.nyi );
    }

    ZombieGame.prototype.rSuggest = function () {
        this.tell( locale.nyi );
    }

    ZombieGame.prototype.rHelp = function ( args ) {
        this.tell( locale.nyi );
    }

    ZombieGame.prototype.rAttack = function ( args ) {
        this.tell( locale.nyi );
    }

    ZombieGame.prototype.rGo = function ( args ) {
        this.tell( locale.nyi );
    }

    ZombieGame.prototype.rShop = function ( args ) {
        this.tell( locale.nyi );
    }

    /****************
     * Registration *
     ****************/

    mhsgame.registerStory({
        name: "zombies",
        description: "Try to survive the Zombie Apocalypse!",
    }, function (command, game) {
        if ( command == "_start" ) {
            cGame = new ZombieGame(game);
        }
        cGame.respond(command);
    });
})();
