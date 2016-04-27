/*
 * zombies.js
 *
 * The school has become overrun with zombies, and it's
 * your job to stop them.
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
(rpath /*roompath*/) =>
`
<path d="${rpath}" stroke="#000" stroke-width="3" stroke-linecap="square"
stroke-linejoin="miter" fill="none" />
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
    }
    RoomManager.prototype.getMap = function () {
        return maptemplate(roompath);
    }

    /************
     * Monsters *
     ************/

    var monsters = {
    };

    // Manage the state for a particular monster
    function Monster() {
    }

    /**********
     * Locale *
     **********/

    var locale = {
    }

    /********************
     * Helper Functions *
     ********************/

    function procCmd(cmd) {
        return cmd.trim().split(" ");
    }

    /**************
     * ZombieGame *
     **************/

    function ZombieGame(game) {
        this.game = game;
        this.tell = game.tell.bind(null);
        this.setMap = game.map.bind(null);

        this.rooms = new RoomManager();
    }
    ZombieGame.prototype.respond = function (txt) {
        var cmd = procCmd( txt );

        // Update the map
        this.setMap( this.rooms.getMap() );
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
