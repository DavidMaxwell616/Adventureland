// Scott Adams Javascript interpreter
//
// these are the variables used by the game
//
var gamename = "";
var NumItems;
var NumActions;
var NumWords;
var NumRooms;
var MaxCarry;
var PlayerRoom;
var Treasures;
var WordLength;
var LightTime;
var LightRefill;
var NumMessages;
var TreasureRoom;
var CurrentCounter = 0;
var Actions = new Array();
var SavedRoom = 0;
var Counters = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
var lastword = "";

var ExitNames = new Array("North", "South", "East", "West", "Up", "Down");

var verb = "";
var noun = "";
var NounText = "";
var currentImage = 0;
var disable_sysfunc = 0; // recursion block
var images = [];
var DARKBIT = 15;
var LIGHTOUTBIT = 16;
var LIGHT_SOURCE = 9;
var CARRIED = 255;
var DESTROYED = 0;
var RoomSaved = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
const debug = true;