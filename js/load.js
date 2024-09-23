// Scott Adams Javascript interpreter
//
// these are the variables used by the game
//
var gamename="";
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
var CurrentCounter=0;
var Actions=new Array();
var SavedRoom=0;
var Counters=new Array(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);
function Action() {
    this.Vocab="";
	this.Condition=new Array();
	this.Action=new Array();
}
function Room() {
    this.Text="";
    this.Exit=new Array();
}
function Item() {
    this.Text="";
    this.Location="";
    this.InitialLocation="";
    this.AutoGet="";
}
var Items=new Array();
var Nouns=new Array();
var Verbs=new Array();
var Rooms=new Array();
var Messages=new Array();
var BitFlags=new Array(false,false,false,false,false,false,false,false,
false,false,false,false,false,false,false,false,
false,false,false,false,false,false,false,false,
false,false,false,false,false,false,false,false,
false,false,false,false,false,false,false,false); 


// the games are retrieved via the XMLHttpRequest object and then the xml is  parsed into arrays via DOM
var req; // used by ajax

var gnum=""; // used in reloading
function RestoreGame() {
	if (gnum==null||gnum=="") return 0;
	var cookie=document.cookie;
        debug(cookie);
	// parse it to find the game
	var ss=""+gnum+"=";
	var j=cookie.indexOf(ss);
	if (j<0) {
	   alert("Can't find game");
	   return;
	}
	cookie=cookie.substring(j+ss.length);
        cookie+="|;"
	j=cookie.indexOf(";");
	if (j<0) {
	   alert("Can't find formatted game");
           debug(cookie);
           j=cookie.length;
	}
	cookie=cookie.substring(0,j);
	cookie=cookie.replace("~~",";");
	// now parse through them the way we sent them out
	j=cookie.indexOf("|");
	gamename=cookie.substring(0,j);
	cookie=cookie.substring(j+1);
	var ct=0;
	for (ct=0;ct<16;ct++) {
	     j=cookie.indexOf("|");
		 Counters[ct]=cookie.substring(0,j)*1;
		 cookie=cookie.substring(j+1);
	     j=cookie.indexOf("|");
		 RoomSaved[ct]=cookie.substring(0,j)*1;
		 cookie=cookie.substring(j+1);
	     j=cookie.indexOf("|");
		 BitFlags[ct]=cookie.substring(0,j)*1;
		 cookie=cookie.substring(j+1);
	}
	// now some constants
	j=cookie.indexOf("|");
	PlayerRoom=cookie.substring(0,j)*1;
	cookie=cookie.substring(j+1);
	j=cookie.indexOf("|");
	CurrentCounter=cookie.substring(0,j)*1;
	cookie=cookie.substring(j+1);
	j=cookie.indexOf("|");
	SavedRoom=cookie.substring(0,j)*1;
	cookie=cookie.substring(j+1);
	j=cookie.indexOf("|");
	LightTime=cookie.substring(0,j)*1;
	cookie=cookie.substring(j+1);
	for(ct=0;ct<Items.length;ct++) {
		j=cookie.indexOf("|");
		Items[ct].Location=cookie.substring(0,j)*1;
		cookie=cookie.substring(j+1);
	}
}
function SaveGame() {
	// save game to cookie
	// ask for game number
	var gnum=prompt("Enter a name for saving this game","Game1");
	if (gnum==null||gnum=="") return 0;
	// create the cookie
	
	var cookie=gnum+"="+gamename;
	var ct=0;
	for(ct=0;ct<16;ct++) {
		cookie+="|"+Counters[ct]+"|"+RoomSaved[ct]+"|"+BitFlags[ct];
	}
	cookie+="|"+PlayerRoom+"|"+CurrentCounter+"|"+SavedRoom+"|"+LightTime;
	for(ct=0;ct<Items.length;ct++) {
		cookie+="|"+Items[ct].Location;
	}
	cookie+="|";
	// now we have to do a replacement of an semicolons in the file to not confuse things
	cookie=cookie.replace(";","~~");

        var expdate = new Date();
        expdate.setTime(expdate.getTime() + (200*24*60*60*1000));

	cookie = cookie + ";expires=" + expdate.toGMTString(); 


	document.cookie=cookie;
	Output("Saved.<br>");

}

function initVars() {
Actions=new Array();
Items=new Array();
Nouns=new Array();
Verbs=new Array();
Rooms=new Array();
Messages=new Array();
BitFlags=new Array(false,false,false,false,false,false,false,false,
false,false,false,false,false,false,false,false,
false,false,false,false,false,false,false,false,
false,false,false,false,false,false,false,false,
false,false,false,false,false,false,false,false); 
CurrentCounter=0;
Counters=new Array(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);
}
var reloading=false;
function reloadgame() {
   // get the url from cookie
 
	gnum=prompt("Enter a name of the saved game","Game1");
	if (gnum==null||gnum=="") return 0;
	var cookie=document.cookie;
        debug(cookie);
	// parse it to find the game
	var ss=""+gnum+"=";
	var j=cookie.indexOf(ss);
	if (j<0) {
	   alert("Can't find game");
	   return;
	}
	cookie=cookie.substring(j+ss.length);
        cookie+="|;"
	j=cookie.indexOf(";");
	if (j<0) {
	   alert("Can't find formatted game");
           debug(cookie);
           j=cookie.length;
	}
	cookie=cookie.substring(0,j);
	cookie=cookie.replace("~~",";");
	// now parse through them the way we sent them out
	j=cookie.indexOf("|");
	gamename=cookie.substring(0,j);
        Output("Loading "+gamename+".....");
	reloading=true;
        loadGame(gamename);
}
function loadGame(url) {
    // branch for native XMLHttpRequest object
	gamename=url;
    initVars();
	ClearScreen();
    if (window.XMLHttpRequest) {
        req = new XMLHttpRequest();
         req.onreadystatechange = processReqChange;

        req.open("GET", url, true);
        req.send(null);
		
    // branch for IE/Windows ActiveX version
    } else if (window.ActiveXObject) {
        isIE = true;
        req = new ActiveXObject("Microsoft.XMLHTTP");
        if (req) {
            req.onreadystatechange = processReqChange;
            req.open("GET", url, true);
            req.send();
        }
    }
}
// handle onreadystatechange event of req object
function processReqChange() {
    // only if req shows "loaded"
    if (req.readyState == 4) {
        // only if "OK"		
        if (req.status == 200||req.status==0) {
            parseData(req.responseXML);
         } else {
            alert("There was a problem retrieving the XML data:\n" +
                req.statusText);
         }
    }
}
function getFieldText(xml,field) {
  var ni;
  try {
  	ni=xml.getElementsByTagName(field);
  } catch (error) {
     alert("Error "+ error+ ", while trying to read: "+field);
  }
  try {
  	return ni[0].firstChild.data;
  } catch (error) {
     alert("Error "+ error + ", while trying to read: "+field);
	 return " ";
  }
}
function parseData(xml) {
// this walks through the xml data to fill up the javascript data
NumItems=getFieldText(xml,"NumItems");
NumWords=getFieldText(xml,"NumWords");
NumActions=getFieldText(xml,"NumActions");
NumRooms=getFieldText(xml,"NumRooms");
MaxCarry=getFieldText(xml,"MaxCarry");
PlayerRoom=getFieldText(xml,"PlayerRoom");
Treasures=getFieldText(xml,"Treasures");
WordLength=getFieldText(xml,"WordLength");
LightTime=getFieldText(xml,"LightTime");
LightRefill=LightTime;

NumMessages=getFieldText(xml,"NumMessages");
TreasureRoom=getFieldText(xml,"TreasureRoom");
// fill up the actions array
var ni=xml.getElementsByTagName("Actions");
var j; var k;
var x=-1; 
var y=0;
var z=0;
for (j=0;j<ni.length;j++) {
	if ( ni[j].nodeType == 1) {
		x++;
        y=0;
        z=0;
		Actions[x]=new Action();
		var fc=ni[j].childNodes;
		for (k=0;k<fc.length;k++) {
			if (fc[k].nodeType == 1) {
				var nn=fc[k].nodeName;
				switch (nn) {
					case "Vocab":
						Actions[x].Vocab=fc[k].firstChild.data;
						break;
					case "Condition":
						Actions[x].Condition[y]=fc[k].firstChild.data;
						y++;
						break;
					case "Action":
						Actions[x].Action[z]=fc[k].firstChild.data;
						z++;
						break;
				}
			}
		}
	}
}
	// the next arrays are Nouns and verbs
	ni=xml.getElementsByTagName("Noun");
	x=0;
	for (j=0;j<ni.length;j++) {
		if ( ni[j].nodeType == 1) {
			try {
			   Nouns[x]=ni[j].firstChild.data;
			} catch (error) {
				Nouns[x]="";
			}
			x++;
		}
	}
	ni=xml.getElementsByTagName("Verb");
	x=0;
	for (j=0;j<ni.length;j++) {
		if ( ni[j].nodeType == 1) {
			try {
			   Verbs[x]=ni[j].firstChild.data;
			} catch (error) {
				Verbs[x]="";
			}
			x++;
		}
	}
	
	// now the rooms
	ni=xml.getElementsByTagName("Room");
	x=-1;
	for (j=0;j<ni.length;j++) {
		if ( ni[j].nodeType == 1) {
			x++;
			y=0;
			Rooms[x]=new Room();
			var fc=ni[j].childNodes;
			for (k=0;k<fc.length;k++) {
				if (fc[k].nodeType == 1) {
					var nn=fc[k].nodeName;
					switch (y) {
					   case 0:
					      if (fc[k].firstChild!=null) {
						  	Rooms[x].Text=fc[k].firstChild.data;
						  } else {
						  	Rooms[x].Text="";
						  }
						  break;
					   case 1: 
					   case 2: 
					   case 3: 
					   case 4: 
					   case 5: 
					   case 6: 
						  Rooms[x].Exit[y-1]=fc[k].firstChild.data;
						  break;
					}
					y++;
				}
			}
		}
	}
// messages	
	ni=xml.getElementsByTagName("Message");
	//alert(ni.length);
	x=-1;
	for (j=0;j<ni.length;j++) {
		if ( ni[j].nodeType == 1) {
			x++;
			if (ni[j].firstChild!=null) {
			  Messages[x]=ni[j].firstChild.data;
			} else {
			  Messages[x]="";
			}
		}
	}
// Items - this gets Text/Location/InitialLocation and Autoget from an Item
	ni=xml.getElementsByTagName("Item");
	x=-1;
	for (j=0;j<ni.length;j++) {
		if ( ni[j].nodeType == 1) {
			x++;
			y=0;
			Items[x]=new Item();
			var fc=ni[j].childNodes;
			for (k=0;k<fc.length;k++) {
				if (fc[k].nodeType == 1) {
					var nn=fc[k].nodeName;
					switch (y) {
					   case 0:
					      if (fc[k].firstChild!=null) {
						  	Items[x].Text=fc[k].firstChild.data;
						  } else {
						  	Items[x].Text="";
						  }
						  break;
					   case 1: 
					      if (fc[k].firstChild!=null) {
						  	Items[x].Location=fc[k].firstChild.data;
						  } else {
						  	Items[x].Location="";
						  }
						  break;
					   case 2: 
					      if (fc[k].firstChild!=null) {
						  	Items[x].InitialLocation=fc[k].firstChild.data;
						  } else {
						  	Items[x].InitialLocation="";
						  }
						  break;
					   case 3: 
					      if (fc[k].firstChild!=null) {
						  	Items[x].AutoGet=fc[k].firstChild.data;
						  } else {
						  	Items[x].AutoGet="";
						  }
						  break;
					}
					y++;
				}
			}
		}
	}


// done entering data - play the game

	playGame();
	if (reloading) {
		RestoreGame();
		ShowStuff();
		ClearScreen()
	}
	reloading=false;
        

}

