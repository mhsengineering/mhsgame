/*
 * meta.js
 */

mhsgame.registerStory({
    name: "meta",
    description: "Manages other stories",
}, function (command, game) {
    if ( command == "_start" ) {
        game.map(
`
<rect x="0" y="0" width="255" height="120" fill="#000">
</rect>

<text x="65" y="55" font-family="Verdana" font-size="55" fill="#FFF">
MHS
</text>
<text x="40" y="100" font-family="Verdana" font-size="55" fill="#FFF">
Game
</text>
`);
        game.tell(
`
# MHS Game

Welcome to MHS Game, a text adventure game. To view
available stories enter \`_list\`. To load a story enter
\`_load [story name]\`.
`);
    } else {
        game.tell(
`
You have entered the command **${game.sanitize(command)}**
but you are not in a game. To enter a game type \`_load
[name]\`. To list available games type \`_list\`.
`);
    }
});

mhsgame.registerCommand({
    cmd: ["_list","_ls"],
}, function (command) {
    var stories = mhsgame.getStories();
    var txt = ["Stories:\n\n"];
    for ( story of stories ) {
        txt.push( "* **" + mhsgame.sanitizeMd(story.name) + "** - ");
        txt.push( mhsgame.sanitizeMd(story.description) + "\n\n" );
    }
    mhsgame.tell( txt.join("") );
});

mhsgame.registerCommand({
    cmd: ["_load", "_l"],
}, function (command) {
    var parts = command.split(" ").filter( p => p!="" );
    if ( parts.length != 2 ) {
        var scmd = mhsgame.sanitizeMd(command);
        mhsgame.tell("Unable to parse: **"+scmd+"**");
        return;
    }
    if ( !mhsgame.startStory(parts[1]) ) {
        mhsgame.tell("Unable to find story with name: "
                   + "**"+mhsgame.sanitizeMd(parts[1])+"**");
    }
});
