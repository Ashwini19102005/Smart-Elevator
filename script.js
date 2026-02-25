const video=document.getElementById("video");
const canvas=document.getElementById("canvas");
const ctx=canvas.getContext("2d");

let model;
let latestPredictions=[];
let autoMode=true;
let floors=[1,1,1,1];

function log(msg){
const logs=document.getElementById("logs");
logs.innerHTML+="<div>"+msg+"</div>";
logs.scrollTop=logs.scrollHeight;
}

function toggleMode(){
autoMode=!autoMode;
log("Mode switched to "+(autoMode?"AUTO":"MANUAL"));
}

async function startCamera(){

const stream=await navigator.mediaDevices.getUserMedia({video:true});
video.srcObject=stream;

video.onloadeddata=async()=>{

model=await cocoSsd.load();
log("AI Model Loaded Successfully");
runDetection();
drawLoop();

}

}

async function runDetection(){

while(true){
latestPredictions=await model.detect(video);
await new Promise(r=>setTimeout(r,80));
}

}

function drawLoop(){

ctx.clearRect(0,0,canvas.width,canvas.height);

let peopleCount=0;

latestPredictions.forEach(p=>{

if(p.class==="person" && p.score>0.75){

peopleCount++;

ctx.strokeStyle="lime";
ctx.lineWidth=3;
ctx.strokeRect(...p.bbox);

}

});

document.getElementById("people").innerText="People: "+peopleCount;

let elevators=Math.ceil(peopleCount/2);
if(elevators<1) elevators=1;
if(elevators>4) elevators=4;

if(autoMode){

document.querySelectorAll(".lift").forEach((el,index)=>{

const statusText = el.querySelector(".liftStatus");

if(index<elevators){
el.classList.add("active");
el.classList.remove("standby");
statusText.innerText="ACTIVE";
}else{
el.classList.add("standby");
el.classList.remove("active");
statusText.innerText="STANDBY";
}

});

}

let waitTime=Math.max(5-elevators,1)*3;
document.getElementById("wait").innerText="Estimated Wait: "+waitTime+" sec";

let energy="NORMAL";
if(elevators==1) energy="POWER SAVE";
if(elevators==4) energy="HIGH LOAD";

document.getElementById("mode").innerText="Energy Mode: "+energy;

let loadPercent=Math.min((peopleCount/10)*100,100);
document.getElementById("loadBar").style.width=loadPercent+"%";
document.getElementById("energySave").innerText="Energy Saved: "+(100-loadPercent).toFixed(0)+"%";

document.querySelectorAll(".floorIndicator").forEach((f,i)=>{

if(Math.random()<0.02){
floors[i]=Math.floor(Math.random()*5)+1;
}

f.innerText="F"+floors[i];

});

requestAnimationFrame(drawLoop);

}

startCamera();