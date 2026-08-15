
const v=document.getElementById("ebookVideo"),
      box=document.getElementById("videoBox"),
      play=document.getElementById("play"),
      toggle=document.getElementById("toggle"),
      back=document.getElementById("back"),
      forward=document.getElementById("forward"),
      mute=document.getElementById("mute"),
      volume=document.getElementById("volume"),
      progress=document.getElementById("progress"),
      current=document.getElementById("current"),
      duration=document.getElementById("duration"),
      fullscreen=document.getElementById("fullscreen");

const time=s=>`${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,"0")}`;

function toggleVideo(){
  v.paused?v.play():v.pause();
}

function updatePlay(){
  const p=v.paused;
  box.classList.toggle("playing",!p);
  play.textContent=toggle.textContent=p?"▶":"❚❚";
}

play.onclick=e=>{e.stopPropagation();toggleVideo()};
toggle.onclick=e=>{e.stopPropagation();toggleVideo()};

v.onclick=toggleVideo;

v.onplay=()=>{
  updatePlay();
  box.classList.remove("show-controls");
};

v.onpause=()=>{
  updatePlay();
  box.classList.add("show-controls");
};

v.onloadedmetadata=()=>{
  duration.textContent=time(v.duration);
};

v.ontimeupdate=()=>{
  progress.value=v.duration?(v.currentTime/v.duration)*100:0;
  current.textContent=time(v.currentTime);
};

progress.oninput=()=>{
  v.currentTime=(progress.value/100)*v.duration;
};

back.onclick=e=>{
  e.stopPropagation();
  v.currentTime=Math.max(0,v.currentTime-5);
};

forward.onclick=e=>{
  e.stopPropagation();
  v.currentTime=Math.min(v.duration,v.currentTime+5);
};

volume.oninput=()=>{
  v.volume=volume.value;
  v.muted=!+volume.value;
  mute.textContent=v.muted?"🔇":"🔊";
};

mute.onclick=e=>{
  e.stopPropagation();
  v.muted=!v.muted;
  mute.textContent=v.muted?"🔇":"🔊";
};

fullscreen.onclick=e=>{
  e.stopPropagation();
  document.fullscreenElement
    ? document.exitFullscreen()
    : box.requestFullscreen();
};

box.onmousemove=()=>{
  if(v.paused)return;
  box.classList.add("show-controls");
};

box.onmouseleave=()=>{
  if(!v.paused)box.classList.remove("show-controls");
};

box.ontouchstart=()=>{
  box.classList.toggle("show-controls");
};

document.onkeydown=e=>{
  if(!box.matches(":hover"))return;

  if(e.code==="Space"){
    e.preventDefault();
    toggleVideo();
  }

  if(e.key==="ArrowLeft")
    v.currentTime=Math.max(0,v.currentTime-5);

  if(e.key==="ArrowRight")
    v.currentTime=Math.min(v.duration,v.currentTime+5);
};

v.onended=()=>{
  updatePlay();
  box.classList.add("show-controls");
};
