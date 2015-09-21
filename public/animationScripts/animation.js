var elem; //elem is the photo of kakashi to be edited
var arr; //contains all the photos
var left; //The position of the photo in the window


var index = 0;
var attacking = false;
var running = false;

var avatar = "public/img/kakashi/"

//The normal position of the character
function stanceImg(){
  index++;
  if (index >= stance.length) index = 0;
  left = 0;
  elem.style.left = 0;
  elem.src = avatar + arr[index];
  
}

//The special attack animation executed during semi colons
function specialImg(){
  index++;
  if (index >= special.length) switchy(stanceImg, false);
  elem.src = avatar + special[index];
}

//Kakashi teleports infront of the enemy, so this still needs some adjusting
//The attack animation of Kakashi that gets executed when the user wins
function specialWinImg(){
  if (index >= 51 && index < 52) {
    index += 0.10000000;
    left += 40;
    elem.style.left = left + "px";
    if (document.getElementById('help')){
      document.body.removeChild(elem)
    }
  }
  else { 
    index++; 
    if (index >= specialWin.length) switchy(stanceImg, false);
    else {
      if (index >= 47 ) left += 20;
      if (index === 50) left -= 20;
      if (index >= 54) left -= 20;
      if (index % 1 !== 0) index = Math.floor(index);
      elem.style.left = left + "px";
      elem.src = avatar + specialWin[index];
      //Needs to add image again once it gets removed.
    }
  }
}

function attackImg(){
  index++;
  if (index >= attack.length) switchy(makeImg, false);
  else {
    elem.src = avatar + arr2[index];
  }
}

function runningAttackImg(){
  index++;
  if (index >= runningAttack.length) switchy(stanceImg, false);
  elem.src = avatar + runningAttack[index];
}

function runImg(){
  index++;
  if (index >= run.length) index = 0;
  elem.style.left = left + "px";
  elem.src = avatar + run[index];
  left += 10;
}

function victoryImg(){
  index++;
  if (index >= victory.length) index = 3;
  elem.src = avatar + victory[index];
}

function defeatImg(){
  index++;
  if (index >= defeat.length) index--;
  elem.src = avatar + defeat[index];
}

function switchImg(img, duration, attacking, running){
  duration = duration || 100;
  index = -1;
  attacking = set;
  running = optional || false;
  clearInterval(thread);
  thread = setInterval(img, duration);
}