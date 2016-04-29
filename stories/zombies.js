/*
 * zombies.js
 *
 * The school has become overrun with zombies, and it's
 * your job to stop them.
 *
 * WARNING! This file contains spoilers for the game.
 */

(function () {
    "use strict";

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
    var EVENT_NONE       = 0;
    var EVENT_START      = 1;
    var EVENT_END        = 2;
    var EVENT_CLOSESTART = 3;
    var EVENT_DOORZOMBIE = 4;
    // Doors
    var ROOM_DEAST  = 1;
    var ROOM_DNORTH = 2;
    var ROOM_DSOUTH = 4;
    var ROOM_DWEST  = 8;
    var rooms = [
        // Properies shortened for terseness
        // d (danger), f (flags), e (event), w (walk/doors)

        /* y = 0 */
        {d: 0, f: ROOM_FSTART, e:EVENT_START, w: 0b0001 },
        {d: 0, f: 0, e: EVENT_CLOSESTART, w: 0b1001 },
        {d: 0, f: 0, e: EVENT_DOORZOMBIE, w: 0b1001 },
        {d: 0, f: 0, e: 0, w: 0b1001 },
        {d: 0, f: 0, e: 0, w: 0b1100 },
        /* y = 1 */
        {d: 0, f: ROOM_FEND, e: EVENT_END, w: 0b0001 },
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
        var x, y, r, i;
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
        this.overlays = [""];
        this.restrictions = [];
        this.usedevents = [];

        this.startclosed = 0;
    }
    RoomManager.prototype.addRestriction = function(x,y,dir) {
        this.restrictions.push({x,y,dir});
    }
    RoomManager.prototype.removeRestriction = function (x,y,dir) {
        for ( var i in this.restrictions ) {
            if ( this.restrictions[i].x == x && this.restrictions[i].y == y
                    && this.restrictions[i].dir == dir ) {
                this.restrictions[i] == {x: -1, y: -1, dir: -1};
            }
        }
    }
    RoomManager.prototype.isRestricted = function (x,y,dir) {
        for ( var r of this.restrictions ) {
            if ( r.x == x && r.y == y && r.dir == dir ) {
                return true;
            }
        }
        return false;
    }
    RoomManager.prototype.dirName = function (dir) {
        switch (dir) {
            case DIR_NORTH:
                return "North";
            case DIR_SOUTH:
                return "South";
            case DIR_EAST:
                return "East";
            case DIR_WEST:
                return "West";
        }
        throw new Error("Bad Direction");
    }
    RoomManager.prototype.getMap = function (x,y) {
        return maptemplate({
            roompath,x,y
        }) + this.overlays.join("\n");
    }
    RoomManager.prototype.getRoom = function (x,y) {
        if ( x > 4 || x < 0 || y > 4 || y < 0 ||
                Math.floor(x) != x || Math.floor(y) != y)
            throw new Error("Bad Coords");
        return rooms[ y*5 + x ];
    }
    RoomManager.prototype.doorExists = function (x, y, dir) {
        var room = this.getRoom(x,y);
        var rdir = 0;
        switch ( dir ) {
            case DIR_NORTH:
                rdir = ROOM_DNORTH;
                break;
            case DIR_SOUTH:
                rdir = ROOM_DSOUTH;
                break;
            case DIR_EAST:
                rdir = ROOM_DEAST;
                break;
            case DIR_WEST:
                rdir = ROOM_DWEST;
                break;
            default:
                throw new Error("Bad Direction");
        }

        return !!( room.w & rdir );
    }
    RoomManager.prototype.move = function (dir) {
        switch ( dir ) {
            case DIR_NORTH:
                return [0,-1];
            case DIR_SOUTH:
                return [0,1];
            case DIR_EAST:
                return [1,0];
            case DIR_WEST:
                return [-1,0];
        }
        throw new Error("Bad Direction");
    }
    RoomManager.prototype.travel = function (x, y, dir) {
        var [dx, dy] = this.move(dir);
        var reason = 0;
        if ( !this.doorExists(x,y,dir) ) {
            reason = 1;
        } else if ( this.isRestricted(x,y,dir) ) {
            reason = 2;
        }
        return [x+dx,y+dy,reason];
    }

    RoomManager.prototype.getEvent = function (x,y) {
        var room = this.getRoom(x,y);
        for ( var e of this.usedevents ) {
            if ( e == room.e ) {
                return 0;
            }
        }
        this.usedevents.push( room.e );
        return room.e;
    }
    RoomManager.prototype.eClosestart = function () {
        this.addRestriction(1,0,DIR_WEST);
        this.startclosed = this.overlays.push(
            `<rect width="10" height="10" x="45" y="20" />`
        ) - 1;
    }

    // Map Directions (note these are different than the ones used
    // to build the map)
    var DIR_NONE  = 0;
    var DIR_NORTH = 1;
    var DIR_SOUTH = 2;
    var DIR_EAST  = 3;
    var DIR_WEST  = 4;

    /************
     * Monsters *
     ************/

    var ZOMBIE_NONE  = 0;
    var ZOMBIE_PLAIN = 1;
    var ZOMBIE_DOOR  = 2;

    function MonsterManager() {
        this.monsters = [];
    }
    MonsterManager.prototype.isZombieBlocking = function (x,y,dir) {
        for ( var m of this.monsters ) {
            if ( m.type == ZOMBIE_DOOR && m.dir == dir &&
                    m.x == x && m.y == y ) {
                return true;
            }
        }
        return false;
    }
    MonsterManager.prototype.addZombie = function (x,y) {
        throw new Error("NYI");
    }
    MonsterManager.prototype.addDoorZombie = function (x,y,dir) {
        this.monsters.push({
            x,y,dir,
            type: ZOMBIE_DOOR,
        });
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

## How To Play

Control your player by entering commands. There are many different commands that
can be used. For a full list use the \`help\` command.

There is not enough supplies to survive in The Underground City, so you must
find an exit.
`,
    /*
     * Misc
     */
    nosettings: "This story does not make use of the settings button",
    suggest: "*help*, *attack*, *go*, *shop*, *stats*, *notes*, *inventory*. Use *help* for usage.",
    /*
     * Help
     */
    help_header:
`
## Help

Use the below commands to control your character. Each command has different usage options that
change how your player behaves.
`,
    help_help:
`
**Help** (*no alias*) - Print help and usage information about the various commands. \`help\` will
provide usage information for every command. \`help [cmd]\` will provide usage information for a
particular command.
`,
    help_attack:
`
**Attack** (*no alias*) - Attack a zombie. Attacking a zombie will deal damage to the zombie,
although may cause the zombie to attack you back. If there is only one zombie in the room and
only one weapon in your inventory, \`attack\` will attack the zombie with your weapon. Otherwise
\`attack [zombie]\`, \`attack with [weapon]\` and \`attack [zombie] with [weapon]\` can be used
to specify.
`,
    help_go:
`
**Go** (*alias **move***) - Move to another room. Use \`move [direction]\`. Valid directions are
*North*, *South*, *East*, *West* and their respective equivelents *Up*, *Down*, *Right*, *Left*.
`,
    help_shoop:
`
**Shop** (*alias **store***) - While inside a store, buy items. Use \`shop list\` to list items, \`shop buy [item]\` to buy an item, and \`shop info [item]\` to view an item's information.
`,
    help_stat:
`
**Stat** (*alias **stats***) - View player status, nearby enemies, current position and other
useful information. By default, \`stat\` displays all information. Alternatively \`stat health\`,
\`stat zombies\`, \`stat position\`.
`,
    help_notes:
`
**Notes** (*alias **notes***) - View collected notes. Notes do not appear in inventory and do
not affect gameplay, although they may contain useful tips and secrets. \`notes\` and \`notes list\`
will list all notes, indicating which you have collected. \`notes read [note]\` allows you to read
a note you've found earlier.
`,
    help_inventory:
`
**Inventory** (*alias **inv***) - View and manage your inventory. Use \`inventory\` and \`inventory list\`
to view items in your inventory. For special items \`inventory use [item]\` will allow you to perform
a special action with an item, such as drink a potion. There is no limit on the number of items
you may have in your inventory at once.
`,
    //
    // Attack
    //
    /* TODO */

    //
    // Go
    //
    go_where: "Where would you like to go?",
    go_baddir: "Sorry, I don't know where **%dir%** is.",
    go_travel: "You move **%dir%**.",
    go_notravel: "You can't travel **%dir%**! Something is blocking your way.",
    go_notraveldoor: "You can't travel **%dir%**! There's no door that way.",

    // Events
    go_startclosed:
`
The door caves in behind you, closing off your way back. You hear zombies ahead.
`,
    go_zombiedoor:
`
You see a zombie ahead. He does not seem to notice you, but you will not be able to
proceed without killing him.
`,
    go_zombieblock:
`
You can't go **%dir%**! There's a zombie blocking your way. Have you tried killing
it?
`,

    //
    // Shop
    //
    /* TODO */

    //
    // Stat
    //
playerstats:
`
You have **%health%** / **%maxheal%** health. You have **%gold%** gold.
`

    //
    // Notes
    //
    /* TODO */

    //
    // Inventory
    //
    /* TODO */
    }

    // By using a special function we prevent passing undefined
    // variables from locale
    function ltxt(name, fill) {
        var g = locale[name];
        var f = fill || {};
        if ( typeof g != "string" ) {
            return "["+name+" "+JSON.stringify(f)+"]\n\n";
        }

        for (var k in fill) {
            g = g.replace(k, fill[k]);
        }
        return g;
    }

    /*************************
     * Additional Management *
     *************************/

    function NotesManager() {
    }

    // Notes List
    var NOTES_NONE       = 0;
    var NOTES_START      = 1;
    var NOTES_LOVESTORY  = 2;
    var NOTES_WHATISLIFE = 3;
    var NOTES_THRIFTSHOP = 4;
    var NOTES_SECRET1    = 5;
    var NOTES_SECRET2    = 6;
    var NOTES_SECRET3    = 7;
    var NOTES_ORIGINS    = 8;

    function InventoryManager() {
        this.items = {};
    }
    InventoryManager.prototype.init = function () {
        this.add();
    }

    // Item List

    var ITEM_NONE   = 0;
    var ITEM_AX     = 1;
    var ITEM_GUN    = 2;
    var ITEM_POTION = 3;

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
        this.setMap = game.map.bind(null);
        this.sanitize = game.sanitize.bind(null);

        this.tellTxt = "";

        this.rooms = new RoomManager();
        this.monsters = new MonsterManager();

        // Current Room
        this.roomx = null;
        this.roomy = null;
    }
    ZombieGame.prototype.tell = function (txt) {
        this.tellTxt = this.tellTxt + "\n\n" + txt;
    }
    ZombieGame.prototype.respond = function (txt) {
        var cmd = procCmd( txt );

        if ( cmd.length < 1 ) {
            this.tell( ltxt("cmderror") );
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
            case "move":
                this.rGo( rem );
                break;
            case "shop":
            case "store":
                this.rShop( rem );
                break;
            case "stat":
            case "stats":
                this.rStats( rem );
                break;
            case "notes":
            case "note":
                this.rNotes( rem );
                break;
            case "inventory":
            case "inv":
                this.rInv( rem );
                break;
            default:
                this.tell( ltxt("nounderstand",{
                    "%cmd%": this.game.sanitize(txt)
                }) );
        }

        // Update the map
        this.setMap( this.rooms.getMap(this.roomx, this.roomy) );
        // Tell message to user
        this.game.tell( this.tellTxt );
        this.tellTxt = "";
    }

    //
    // Command Responses
    //

    // Game Start

    ZombieGame.prototype.start = function () {
        this.roomx = 0;
        this.roomy = 0;

        this.tell( ltxt("intro") );

        // init Player Stats
        this.pHealth    = 100;
        this.pMaxHealth = 100;
        this.pGold      = 50;
    }

    // Settings

    ZombieGame.prototype.rSettings = function () {
        this.tell( ltxt("nosettings") );
    }

    // Command Suggestions

    ZombieGame.prototype.rSuggest = function () {
        this.tell( ltxt("suggest") );
    }

    // Help

    ZombieGame.prototype.rHelp = function ( args ) {
        if ( args.length < 1 ) {
            this.tell(
                ltxt("help_header") +
                ltxt("help_help") +
                ltxt("help_attack") +
                ltxt("help_go") +
                ltxt("help_shop") +
                ltxt("help_stat") +
                ltxt("help_notes") +
                ltxt("help_inventory")
                );
        } else {
            switch ( args[0] ) {
                case "help":
                    this.tell( ltxt("help_help") );
                    return;
                case "attack":
                    this.tell( ltxt("help_attack") );
                    return;
                case "go":
                case "move":
                    this.tell( ltxt("help_go") );
                    return;
                case "shop":
                case "store":
                    this.tell( ltxt("help_shop") );
                    return;
                case "stat":
                case "stats":
                    this.tell( ltxt("help_stat") );
                    return;
                case "notes":
                case "note":
                    this.tell( ltxt("help_notes") );
                    return;
                case "inventory":
                case "inv":
                    this.tell( ltxt("help_inventory") );
                    return;
            }
            this.rHelp([]);
        }
    }

    // Combat (attack)

    ZombieGame.prototype.rAttack = function ( args ) {
        this.tell( ltxt("nyi") );
    }

    // Movement

    ZombieGame.prototype.rGo = function ( args ) {
        if ( args.length < 1 ) {
            this.tell( ltxt("go_where") );
            return;
        }
        if ( args.length > 1) {
            this.tell( ltxt("nounderstand", {
                "%cmd%": this.sanitize( "Go " + args.join(" ") )
            }) );
            return;
        }

        var dir = DIR_NONE;
        switch ( args[0] ) {
            case "north":
            case "up":
                dir = DIR_NORTH;
                break;
            case "south":
            case "down":
                dir = DIR_SOUTH;
                break;
            case "east":
            case "right":
                dir = DIR_EAST;
                break;
            case "west":
            case "left":
                dir = DIR_WEST;
                break;
        }
        if ( dir == DIR_NONE ) {
            this.tell( ltxt("go_baddir", {
                "%dir%": this.sanitize( args[0] )
            }) );
            return;
        }

        var [newx, newy, noable] = this.rooms.travel(this.roomx, this.roomy, dir);
        if ( noable == 1 ) {
            this.tell( ltxt("go_notraveldoor", {
                "%dir%": this.rooms.dirName( dir ),
            }) );
            return;
        }
        if ( noable ) {
            this.tell( ltxt("go_notravel", {
                "%dir%": this.rooms.dirName( dir )
            }) );
            return;
        }

        if ( this.monsters.isZombieBlocking(this.roomx, this.roomy, dir) ) {
            this.tell( ltxt("go_zombieblock",{
                "%dir%": this.rooms.dirName( dir ),
            }) );
            return;
        }

        this.roomx = newx;
        this.roomy = newy;

        this.tell( ltxt("go_travel",{
            "%dir%": this.rooms.dirName( dir ),
        }) );

        var ev = this.rooms.getEvent(this.roomx, this.roomy);
        switch (ev) {
            case EVENT_NONE:
            case EVENT_START:
            case EVENT_END:
                break;
            case EVENT_CLOSESTART:
                this.tell( ltxt("go_startclosed") );
                this.rooms.eClosestart();
                break;
            case EVENT_DOORZOMBIE:
                this.tell( ltxt("go_zombiedoor") );
                this.monsters.addDoorZombie(2,0,DIR_EAST);
                break;
            default:
                throw new Error("Bad Event");
        }
    }

    // Shopping (store)

    ZombieGame.prototype.rShop = function ( args ) {
        this.tell( ltxt("nyi") );
    }

    // Player Stats

    ZombieGame.prototype.rStats = function ( args ) {
        this.tell( this.statsMessage() );
    }
    ZombieGame.prototype.statsMessage = function () {
        return ltxt("playerstats", {
            "%health%": this.pHealth.toString(10),
            "%maxheal%": this.pMaxHealth.toString(10),
            "%gold%": this.pGold.toString(10),
        });
    }

    // Notes

    ZombieGame.prototype.rNotes = function ( args ) {
        this.tell( locale.nyi );
    }

    // Inventory Management

    ZombieGame.prototype.rInv = function ( args ) {
        this.tell( ltxt("nyi") );
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
