var ExitNames=new Array("North","South","East","West","Up","Down");

var verb="";
var noun="";
var NounText="";

var disable_sysfunc=0; // recursion block
var images = [];
var DARKBIT=15;
var LIGHTOUTBIT=16;
var LIGHT_SOURCE=9;
var CARRIED=255;
var DESTROYED=0;
var RoomSaved=new Array(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);
const debug = false;
function MainLine() {
    ClearScreen();
// this is the inside of the main loop. This should get punched when the user hits enter
GetInput(); // GetInput reads the command line
// this used to be in GetImput, but lack of pointers caused me to move it back here
    // if (verb.toUpperCase()=="DEBUG") {
	//      debugflag=true;
	// 	 console.log("Current room="+PlayerRoom);
	// 	 console.log("BitFlags[DARKBIT]="+BitFlags[DARKBIT]);
	// 	 return;
	// } 
	if(noun.length==0 && verb.length==1) {
		switch( verb.toLowerCase() ) {
			case 'n':verb="NORTH";break;
			case 'e':verb="EAST";break;
			case 's':verb="SOUTH";break;
			case 'w':verb="WEST";break;
			case 'u':verb="UP";break;
			case 'd':verb="DOWN";break;
			case 'i':verb="INVENTORY";break;
		}
	}
	var vnum=0; nnum=0;
	var hacknum=WhichWord(verb,Nouns);
	if (hacknum>=1 && hacknum<=6) {
		vnum=1;
		nnum=hacknum;
	} else {
		vnum=WhichWord(verb,Verbs);
		nnum=WhichWord(noun,Nouns);
	} 
	if(debug) console.log("Verb="+verb+", noun="+noun+", vnum="+vnum+", nnmu="+nnum);
	if (vnum<=0) {
	     OutputMessage("You use word(s) I don't know! ");
		 return 0;
	}
	
	NounText=noun;
	if (NounText==null) NounText="";
	var pa=PerformActions(vnum,nnum);
	switch(pa) {
		case -1: OutputMessage("I don't understand your command. ");
			break;
		case -2: OutputMessage("I can't do that yet. ");
			break;
	}
	
	if(Items[LIGHT_SOURCE].Location!=DESTROYED && LightTime!= -1) {
		LightTime--;
		if(LightTime<1) {
			BitFlags[LIGHTOUTBIT]=true;
			if(Items[LIGHT_SOURCE].Location==CARRIED ||
				Items[LIGHT_SOURCE].Location==PlayerRoom) {
				OutputMessage("Light has run out! ");
			}
		} else if(LightTime<25) {
			if(Items[LIGHT_SOURCE].Location==CARRIED ||
				Items[LIGHT_SOURCE].Location==PlayerRoom) {
					OutputMessage("Light runs out in ");
					OutputMessage(LightTime);
					OutputMessage(" turns. ");
			}
		}
	}
	ShowStuff();
}

function LoadImages()
{
	for (let index = 1; index < 12; index++) {
	image = new Image();
	image.src = "assets/images/scene 0"+zfill(index)+".png";
	image.onload = function() {
	// Image has loaded, now hide it
	image.style.display = "none";
	};
	images.push(image);
	}
}

function zfill(num, len) {return (Array(len).join("0") + num).slice(-len);}

function PerformLine(ct) {
  	var continuation=0;
	var param=new Array(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);
	var pptr=0;
	var act=new Array(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);
	var cc=0;
	if(debug) console.log("perform line ct="+ct);
	for (cc=0;cc<5;cc++) {
		var cv,dv;
		cv=Actions[ct].Condition[cc];
		dv=Math.floor(cv/20);
		cv=cv%20;
		switch(cv) {
			case 0:
				param[pptr++]=dv;
				break;
			case 1:
				if(Items[dv].Location!=CARRIED)
					return 0;
				break;
			case 2:
				if(Items[dv].Location!=PlayerRoom)
					return 0;
				break;
			case 3:
				if(Items[dv].Location!=CARRIED&&
					Items[dv].Location!=PlayerRoom)
					return 0;
				break;
			case 4:
				if(PlayerRoom!=dv)
					return 0;
				break;
			case 5:
				if(Items[dv].Location==PlayerRoom)
					return 0;
				break;
			case 6:
				if(Items[dv].Location==CARRIED)
					return 0;
				break;
			case 7:
				if(PlayerRoom==dv)
					return 0;
				break;
			case 8:
				if(!BitFlags[dv])
					return 0;
				break;
			case 9:
				if(BitFlags[dv])
					return 0;
				break;
			case 10:
				if(CountCarried()==0)
					return 0;
				break;
			case 11:
				if(CountCarried())
					return 0;
				break;
			case 12:
				if(Items[dv].Location==CARRIED||Items[dv].Location==PlayerRoom)
					return 0;
				break;
			case 13:
				if(Items[dv].Location==0)
					return 0;
				break;
			case 14:
				if(Items[dv].Location)
					return 0;
				break;
			case 15:
				if(CurrentCounter>dv)
					return 0;
				break;
			case 16:
				if(CurrentCounter<=dv)
					return 0;
				break;
			case 17:
				if(Items[dv].Location!=Items[dv].InitialLoc)
					return 0;
				break;
			case 18:
				if(Items[dv].Location==Items[dv].InitialLoc)
					return 0;
				break;
			case 19:/* Only seen in Brian Howarth games so far */
				if(CurrentCounter!=dv)
					return 0;
				break;
		}
	}
	/* Actions */
	act[0]=Actions[ct].Action[0];
	act[2]=Actions[ct].Action[1];
	act[1]=act[0]%150;
	act[3]=act[2]%150;
	act[0]=Math.floor(act[0]/150);
	act[2]=Math.floor(act[2]/150);
	cc=0;
	pptr=0;
	if(debug) console.log("Actions act[0]="+act[0]+", act[1]="+act[1]+", act[2]="+act[2]+", act[3]="+act[3]);  
	for (cc=0;cc<4;cc++) {
		if(act[cc]>=1 && act[cc]<52) {
			OutputMessage(Messages[act[cc]]);
		} else if(act[cc]>101) {
			OutputMessage(Messages[act[cc]-50]);
		} else switch(act[cc]) {
			case 0:/* NOP */
				break;
			case 52:
				if(CountCarried()==MaxCarry) {
						OutputMessage("You are carrying too much. ");
					break;
				}
				Items[param[pptr++]].Location= CARRIED;
				break;
			case 53:
				Items[param[pptr++]].Location=PlayerRoom;
				break;
			case 54:
				PlayerRoom=param[pptr++];
				break;
			case 55:
				Items[param[pptr++]].Location=0;
				break;
			case 56:
                                // buggy?????
				BitFlags[DARKBIT]=true; 
				break;
			case 57:
				BitFlags[DARKBIT]=false;
				break;
			case 58:
				BitFlags[param[pptr++]]=true;
				break;
			case 59:
				Items[param[pptr++]].Location=0;
				break;
			case 60:
				BitFlags[param[pptr++]]=false;
				break;
			case 61:
				OutputMessage("You are dead.<br>");
				BitFlags[DARKBIT]=false;
				PlayerRoom=NumRooms;/* It seems to be what the code says! */
				Look();
				break;
			case 62: {
				/* Bug fix for some systems - before it could get parameters wrong */
				var i=param[pptr++];
				Items[i].Location=param[pptr++];
				break;
			}
			case 63:
				OutputMessage("The game is now over.<br>");
			case 64:
				Look();
				break;
			case 65: {
				var ct=0;
				var n=0;
				while(ct<NumItems) {
					if(Items[ct].Location==TreasureRoom &&
					  Items[ct].Text.substring(0,1)=="*")
					  	n++;
					ct++;
				}
				OutputMessage("You have stored ");
				OutputMessage(n);
				OutputMessage(" treasures.  On a scale of 0 to 100, that rates ");
				OutputMessage((n*100)/Treasures);
				OutputMessage(".<br>");
				if(n==Treasures){
					OutputMessage("Well done.<br>");
					OutputMessage("The game is now over.<br>");
				}
				break;
			}
			case 66:
			{
				var ct=0;
				var f=0;
					OutputMessage("You are carrying:<br>");
				for(ct=0;ct<Items.length;ct++) {
					if(Items[ct].Location==CARRIED) {
						f=1;
						OutputMessage(Items[ct].Text);
					}
				}
				if(f==0) {
					OutputMessage("Nothing");
				}
				break;
			}
			case 67:
				BitFlags[0]=true;
				break;
			case 68:
				BitFlags[0]=false;
				break;
			case 69:
				LightTime=LightRefill;
				Items[LIGHT_SOURCE].Location=CARRIED;
				BitFlags[LIGHTOUTBIT]=false;
				break;
			case 70:
				//ClearScreen(); 
				break;
			case 71:
				SaveGame();
				OutputMessage("Saving game");
				break;
			case 72:
			{
				var i1=param[pptr++];
				var i2=param[pptr++];
				var t=Items[i1].Location;
				Items[i1].Location=Items[i2].Location;
				Items[i2].Location=t;
				break;
			}
			case 73:
				continuation=1;
				break;
			case 74:
				Items[param[pptr++]].Location= CARRIED;
				break;
			case 75:
			{
				var i1=param[pptr++];
				var i2=param[pptr++];
				Items[i1].Location=Items[i2].Location;
				break;
			}
			case 76:	/* Looking at adventure .. */
				Look();
				break;
			case 77:
				if(CurrentCounter>=0)
					CurrentCounter--;
				break;
			case 78:
				OutputMessage(CurrentCounter);
				break;
			case 79:
				CurrentCounter=param[pptr++];
				break;
			case 80:
			{
				var t=PlayerRoom;
				PlayerRoom=SavedRoom;
				SavedRoom=t;
				break;
			}
			case 81:
			{
				/* This is somewhat guessed. Claymorgue always
				   seems to do select counter n, thing, select counter n,
				   but uses one value that always seems to exist. Trying
				   a few options I found this gave sane results on ageing */
				var t=param[pptr++];
				var c1=CurrentCounter;
				CurrentCounter=Counters[t];
				Counters[t]=c1;
				break;
			}
			case 82:
				CurrentCounter+=param[pptr++];
				break;
			case 83:
				CurrentCounter-=param[pptr++];
				if(CurrentCounter< -1)
					CurrentCounter= -1;
				/* Note: This seems to be needed. I don't yet
				   know if there is a maximum value to limit too */
				break;
			case 84:
				OutputMessage(NounText);
				break;
			case 85:
				OutputMessage(NounText);
				OutputMessage("<br>");
				break;
			case 86:
				OutputMessage("<br>");
				break;
			case 87:  {
				/* Changed this to swap location<->roomflag[x]
				   not roomflag 0 and x */
				var p=param[pptr++];
				var sr=PlayerRoom;
				PlayerRoom=RoomSaved[p];
				RoomSaved[p]=sr;
				break; }
			case 88:
				//wrefresh(Top);
				//wrefresh(Bottom);
				//sleep(2);	/* DOC's say 2 seconds. Spectrum times at 1.5 */
				break;
			case 89:
				pptr++;
				/* SAGA draw picture n */
				/* Spectrum Seas of Blood - start combat ? */
				/* Poking this into older spectrum games causes a crash */
				break;
			default:
				OutputMessage("Unknown action "+act[cc]+ "[Param begins "+param[pptr]+" "+param[pptr+1]+"]");
				break;
		}
	}
	return(1+continuation);		
}
function ClearScreen() {
    // var room=document.getElementById("header");
    // room.innerHTML="<br>";

}
function OutputMessage(t) {
	var room=document.getElementById("message");
	var s=room.innerHTML;
	s+=t;
    room.innerHTML=s;
}
function OutputAt(at,t) {
    var cell=document.getElementById(at);
    cell.innerHTML=t;
}


function PerformActions(vb,no) {
	if(debug) console.log("performactions vb="+vb+", no="+no);
    var doagain=false;
	var s="";
// in command
    var d=BitFlags[DARKBIT];
	if (vb==1 && no<=0) {
	   OutputMessage("Enter a direction, too.");
	   return 0;
	}
	if((vb==1) && no>0 && (no<7)) {
	  // navigation command
		var nl;
		if(Items[LIGHT_SOURCE].Location==PlayerRoom ||
		   Items[LIGHT_SOURCE].Location==CARRIED) {
		   	d=false;
		}
		if(d) {
			OutputMessage("Dangerous to move in the dark! ");
		}
	    //OutputMessage("moving "+no+" PlayerRoom="+PlayerRoom);
		nl=Rooms[PlayerRoom].Exit[no-1];
		if(nl!=0) {
			PlayerRoom=nl;
			Look();
			return 0;
		}
		if(d) {
			OutputMessage("You fell down and broke your neck.");
			return 0;
		}
		OutputMessage("You can't go in that direction. ");
		return 0 ;
	}
	var fl= -1;
	var ct=0;
	if(debug) console.log("checking actions: vb="+vb+", no="+no);
	for(ct=0;ct<Actions.length;ct++){
		var vv; var nv;
		vv=Actions[ct].Vocab;
		/* Think this is now right. If a line we run has an action73
		   run all following lines with vocab of 0,0 */
		if(vb!=0 && (doagain&&(vv!=0)))
			break;
		/* Oops.. added this minor cockup fix 1.11 */
		if(vb!=0 && (!doagain) && fl==0)
			break;
		nv=vv%150;
		vv=Math.floor(vv/150);
		if((vv==vb)||(doagain&&Actions[ct].Vocab==0)) {
			if((vv==0 && RandomPercent(nv))||doagain||
				(vv!=0 && (nv==no||nv==0))) {
					if(debug) console.log("nv="+nv+", vv="+vv+",vb="+vb+", doagain="+doagain+", ct="+ct+",Actions[ct].Vocab="+Actions[ct].Vocab  );
				var f2=0;
				if(fl== -1) fl= -2;
				if((f2=PerformLine(ct))>0) {
					/* ahah finally figured it out ! */
					fl=0;
					if(f2==2)
						doagain=true;
					if(vb!=0 && (!doagain) ) return;
				}
			}
		}
		if(Actions[ct].Vocab!=0)
			doagain=false;
	}
	if(fl!=0 && disable_sysfunc==0) {
		var i;
		if(Items[LIGHT_SOURCE].Location==PlayerRoom ||
		   Items[LIGHT_SOURCE].Location==CARRIED)
		   	d=0;
		if(vb==10 || vb==18) {
			/* Yes they really _are_ hardcoded values */
			if(vb==10) {
				if(NounText.toUpperCase()=="ALL") {
					var ct=0;
					var f=0;
					
					if(d) {
						OutputMessage("It is dark.<br>");
						return 0;
					}
					for(ct=0;ct<Items.length;ct++){
					    if (Items[ct].AutoGet==null) Items[ct].AutoGet="";
						if(Items[ct].Location==PlayerRoom && Items[ct].AutoGet!="" && Items[ct].AutoGet[0]!='*') {
							no2=WhichWord(Items[ct].AutoGet,Nouns);
							disable_sysfunc=1;	/* Don't recurse into auto get ! */
							PerformActions(vb,no2);	/* Recursively check each items table code */
							disable_sysfunc=0;
							if(CountCarried()>=MaxCarry) {
								OutputMessage("You are carrying too much. ");
							}
						 	Items[ct].Location= CARRIED;
						 	OutputMessage(": O.K.<br>");
						 	f=1;
						 }
					}
					if(f==0)
						OutputMessage("Nothing taken.");
					return 0;
				}
				if(no<=0){
					OutputMessage("What ? ");
					return 0;
				}
				if( CountCarried() >= MaxCarry){
					OutputMessage("You are carrying too much. ");
					return 0;
				}
				i=MatchUpItem(NounText,PlayerRoom);
				if(i<=0) {
					OutputMessage("It is beyond your power to do that. ");
					return 0;
				}
				Items[i].Location= CARRIED;
				OutputMessage("O.K. ");
				return 0;
			}
			if(vb==18) {
				if(NounText.toUpperCase()=="ALL") {
					var ct=0;
					var f=0;
					for(ct=0;ct<Items.length;ct++){
						if(Items[ct].Location==CARRIED && Items[ct].AutoGet && Items[ct].AutoGet[0]!='*'){
							no2=WhichWord(Items[ct].AutoGet,Nouns);
							disable_sysfunc=1;
							PerformActions(vb,no2);
							disable_sysfunc=0;
							Items[ct].Location=PlayerRoom;
							OutputMessage(Items[ct].Text);
							OutputMessage(": O.K.<br>");
							f=1;
						}
					}
					if(f==0)
						OutputMessage("Nothing dropped.<br>");
					return 0;
				}
				if(no==-1) {
					OutputMessage("What ? ");
					return 0;
				}
				i=MatchUpItem(NounText,CARRIED);
				if(i==-1) {
					OutputMessage("It's beyond your power to do that.<br>");
					return 0;
				}
				Items[i].Location=PlayerRoom;
				OutputMessage("O.K. ");
				return 0;
			}
		}
	}
	return(fl);

}
function ShowStuff() {
// first show the location
//     var ct=0;
// 	var r = Rooms[PlayerRoom];
// 	var s="You are in a " + r.Text;
// 	if( (BitFlags[DARKBIT]) && (Items[LIGHT_SOURCE].Location!=CARRIED)
// 			&& (Items[LIGHT_SOURCE].Location!= PlayerRoom) ) {
// 		s="You can't see. It is too dark!";
// 	    OutputAt("room",s);
// 		return;		
// 	}
// // add the see also
//     s+="<br>";
//     for (ct=0;ct<Items.length;ct++) {
// 		if (Items[ct].Location==PlayerRoom) {
// 			s+=Items[ct].Text+"<br>";
// 		}
// 	}
//     OutputAt("room",s);
// // exits
//     s="Exits: "; 
// 	for (ct=0;ct<6;ct++) {
// 		if(r.Exit[ct]!=0) {
// 			s+=ExitNames[ct]+",";
// 		}
// 	}
// 	OutputAt("exits",s);
// // inventory
// 	s="";
// 	for( ct=0;ct<Items.length;ct++) {
// 		if(Items[ct].Location==CARRIED) {
// 			s+=Items[ct].Text+"<br>";
// 		}
// 	}
// 	OutputAt("inventory",s);

}

function Look() {
    //room.innerHTML="Thinking";
	var elem = document.getElementById('picture');
	elem.appendChild(images[0]);
    var s="";
	if( (BitFlags[DARKBIT]) && (Items[LIGHT_SOURCE].Location!=CARRIED)
	            && (Items[LIGHT_SOURCE].Location!= PlayerRoom) ) {
		OutputMessage("You can't see. It is too dark!");
		return;
	}
    //alert(Rooms[PlayerRoom]);
	var r = Rooms[PlayerRoom];
	if(r.Text.substring(0,1)=='*') {
		s=r.Text.substring(1);
	} else {
		s="You are in a " + r.Text;
	}
	var ct=0;
	var f=0;
	s+="<br>Obvious exits: ";
	for (ct=0;ct<6;ct++) {
		if(r.Exit[ct]!=0) {
			f++;
			s+=ExitNames[ct]+", ";
		}
	}
	if(f==0) {
		s+="none";
	} else {
    	s=s.substring(0,s.length-2);
	}
	s+="<br>";
	ct=0;
	f=0;
    for (ct=0;ct<Items.length;ct++) {
		if (Items[ct].Location==PlayerRoom) {
			if (f==0) {
				s+="<br>You can see: ";
				f++;
			}
			s+=Items[ct].Text+", ";;
		}
	}
	if(f!=0) {
    	s=s.substring(0,s.length-2);
	}
	s+="<br>"; 
    OutputAt('room',s);
}



function setName() {
  return;
  //var gamename=document.getElementById("gamename");
  //gamename.innerHTML="Scott Adams Adventure<br>" + Messages[65];
}
function listVerbs() {
	var s=""; var j=0;
	var verblist=document.getElementById("verblist");
	for (j=0;j<Nouns.length;j++) {
		if (Verbs[j].substring(0,1)!="*" && Verbs[j].substring(0,1)!=".") {
			s+=Verbs[j]+"<br>";
		}
	}
	s=s.substring(0,s.length-2);
	verblist.innerHTML=s;

}

function listNouns() {
	var s=""; var j=0;
	var nounlist=document.getElementById("nounlist");
	for (j=0;j<Nouns.length;j++) {
		if (Nouns[j].substring(0,1)!="*" && Nouns[j].substring(0,1)!=".") {
			s+=Nouns[j]+"<br>";
		}
	}
	s=s.substring(0,s.length-2);
	nounlist.innerHTML=s;

}

function playGame() {
	LoadImages();
	setName();
	listVerbs();
	listNouns();
	Look();
	PerformActions(0,0);
	ShowStuff();
}

function WhichWord(word, list) {
	var n=1;
	var ne=1;
	var tp="";
	for (ne=1;ne<list.length;ne++) {
		tp=list[ne];
		if(tp.substring(0,1)=='*') {
			tp=tp.substring(1);
		} else {
			n=ne;
		}
		var w1=word.toUpperCase();
		var w2=tp.toUpperCase();
		if (w1.length>WordLength) w1=w1.substring(0,WordLength);
		if (w2.length>WordLength) w2=w2.substring(0,WordLength);
		if(w1==w2) {
			return(n);
		}
	}
	return(-1);
}




function GetInput() {
	var s=document.SA.cmd.value;
	document.SA.cmd.value="";
	verb="";
	noun="";
	
	if (s.length==0) { return false; }
	
	while (s.substring(0,1)==" ") { 
	   s=s.substring(1);
	}
	while (s.substring(s.length-1,1)==" ") { 
		s=s.substring(0,s.length-1); 
	}
	if (s.length==0) {
		 return false; 
	}
	var k=s.indexOf(" ");
	
	if (k<0) {
		verb=s;
		return false;
	}
	verb=s.substring(0,k);
	noun=s.substring(k+1);
	return false;
}

function RandomPercent(n) {
    var rv=Math.random()*100;
	//unsigned int rv=rand()<<6;
	rv%=100;
	if(rv<n)
		return(true);
	return(false);
}
function MatchUpItem(text, loc) {
	var word=MapSynonym(text);
	var ct=0;
	if(word=="")
		word=text;
	for(ct=0;ct<Items.length;ct++) {
		if(Items[ct].AutoGet && Items[ct].Location==loc &&
			Items[ct].AutoGet.toUpperCase()==word.toUpperCase())
			return(ct);
	}
	return(-1);
}
var lastword="";
function MapSynonym(word) {
	var n=1;
	var tp="";
	for(n=0;n<Nouns.length;n++){
		tp=Nouns[n];
		if(tp.substring(0,1)=='*')
			tp=tp.substring(1);
		else
			lastword=tp;
		var w1=word.toUpperCase();
		var w2=tp.toUpperCase();
		if (w1.length>WordLength) w1=w1.substring(0,WordLength);
		if (w2.length>WordLength) w2=w2.substring(0,WordLength);
		if(w1==w2) {
			return(lastword);
		}
	}
	return("");
}
function CountCarried() {
	var ct=0;
	var n=0;
	for(ct=0;ct<Items.length;ct++)	{
		if(Items[ct].Location==CARRIED)
			n++;
	}
	return(n);
}

