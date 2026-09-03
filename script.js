const KEY="gardenupf-v2";

const seeds={
  sunflower:{name:"Sunflower",emoji:"🌻",img:"assets/sunflower.png",cost:15,time:28,reward:32,xp:18,desc:"bright & cheerful"},
  tulip:{name:"Tulip",emoji:"🌷",img:"assets/tulip.png",cost:18,time:35,reward:40,xp:22,desc:"soft spring bloom"},
  strawberry:{name:"Strawberry",emoji:"🍓",img:"assets/strawberry.png",cost:22,time:42,reward:50,xp:25,desc:"sweet little fruit"},
  carrot:{name:"Carrot",emoji:"🥕",img:"assets/carrot.png",cost:12,time:24,reward:27,xp:15,desc:"easy to grow"},
  lavender:{name:"Lavender",emoji:"💜",img:"assets/lavender.png",cost:25,time:48,reward:58,xp:30,desc:"calm & fragrant"},
  pumpkin:{name:"Pumpkin",emoji:"🎃",img:"assets/pumpkin.png",cost:30,time:55,reward:72,xp:36,desc:"big autumn harvest"}
};

const shop={
  soil:["Rich Soil","🪴",80,"Unlocks 4 extra garden plots.","plots"],
  water:["Tiny Watering Can","💧",110,"Plants grow 20% faster.","speed"],
  scarecrow:["Cozy Scarecrow","🧺",140,"Adds a cute garden friend.","decor"],
  lantern:["Garden Lantern","🏮",180,"Makes evening gardens glow.","decor"]
};

const decor=[
  ["flower","Flower Patch","🌼",45],
  ["tree","Little Tree","🌳",90],
  ["bench","Wooden Bench","🪵",120],
  ["pond","Mini Pond","💧",150]
];

function fresh(){
  return {
    coins:120,xp:0,level:1,day:1,selected:"sunflower",
    plots:Array(12).fill(null),
    journal:["Welcome to GardenUpf! Plant your first seed.","Your garden is ready for a new story."],
    up:{plots:12,speed:1,decor:[]}
  };
}

let state;
try{
  state=JSON.parse(localStorage.getItem(KEY)) || fresh();
}catch(e){
  state=fresh();
}

state.plots=Array.isArray(state.plots)?state.plots:[];
state.up=state.up || {plots:Math.max(12,state.plots.length),speed:1,decor:[]};
state.up.plots=Math.max(12,Math.min(16,state.up.plots||12));
state.up.decor=Array.isArray(state.up.decor)?state.up.decor:[];
if(!seeds[state.selected]) state.selected="sunflower";

let toastTimer;

function save(){
  localStorage.setItem(KEY,JSON.stringify(state));
}

function toast(t){
  const x=document.getElementById("toast");
  x.textContent=t;
  x.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>x.classList.remove("show"),2200);
}

function journal(t){
  state.journal.unshift(t);
  state.journal=state.journal.slice(0,6);
}

function addXP(n){
  state.xp+=n;
  while(state.xp>=100){
    state.xp-=100;
    state.level++;
    journal(`Level up! Kamu sekarang level ${state.level}. ✨`);
    toast(`LEVEL ${state.level}! ✨`);
  }
}

function selectSeed(id){
  if(!seeds[id]) return;
  state.selected=id;
  save();
  render();
  toast(`${seeds[id].name} dipilih! Sekarang klik petak Meadow Garden 🌱`);
}

function plant(i){
  const v=seeds[state.selected];
  if(!v) return;

  if(state.plots[i]){
    const a=state.plots[i];
    const existing=seeds[a.type];
    return toast(`${existing.name} masih ada di petak ini 🌱`);
  }

  if(state.coins<v.cost){
    return toast("Koinmu belum cukup 🪙");
  }

  state.coins-=v.cost;
  state.plots[i]={type:state.selected,at:Date.now()};
  journal(`Menanam ${v.name} di petak ${i+1}. 🌱`);
  save();
  render();
  toast(`${v.name} ditanam di Meadow Garden! 🌱`);
}

function harvest(i){
  const a=state.plots[i];
  if(!a) return;
  const v=seeds[a.type];
  if(!v) return;

  state.coins+=v.reward;
  state.plots[i]=null;
  addXP(v.xp);
  journal(`Panen ${v.name}! +${v.reward} koin & +${v.xp} XP. 🎉`);
  save();
  render();
  toast(`Harvest berhasil! +${v.reward} 🪙`);
}

function getProgress(a,v){
  const speed=state.up.speed===2 ? 0.8 : 1;
  return Math.min(1,(Date.now()-a.at)/1000/(v.time*speed));
}

function render(){
  document.getElementById("coins").textContent=state.coins;
  document.getElementById("level").textContent=state.level;
  document.getElementById("xpText").textContent=`${state.xp} / 100`;
  document.getElementById("xpBar").style.width=state.xp+"%";
  document.getElementById("day").textContent=`Day ${state.day}`;

  const h=new Date().getHours();
  document.getElementById("period").textContent=h<11?"Morning":h<17?"Afternoon":h<20?"Golden hour":"Evening";

  const selected=seeds[state.selected];
  const selectedBox=document.getElementById("selectedSeed");
  if(selectedBox){
    selectedBox.innerHTML=`<img src="${selected.img}" alt="${selected.name}">
      <div><small>SELECTED SEED</small><strong>${selected.name}</strong></div>
      <span>✓</span>`;
  }

  const seedBox=document.getElementById("seeds");
  seedBox.innerHTML="";
  Object.entries(seeds).forEach(([id,v])=>{
    const b=document.createElement("button");
    b.type="button";
    b.className="seed "+(state.selected===id?"selected":"");
    b.setAttribute("aria-pressed",state.selected===id?"true":"false");
    b.innerHTML=`
      <img class="seed-photo" src="${v.img}" alt="${v.name}">
      <span class="info">
        <strong>${v.name}</strong>
        <span>${v.desc}</span>
      </span>
      <span class="price">🪙 ${v.cost}</span>`;
    b.addEventListener("click",()=>selectSeed(id));
    seedBox.appendChild(b);
  });

  const garden=document.getElementById("garden");
  garden.innerHTML="";

  for(let i=0;i<state.up.plots;i++){
    const p=document.createElement("button");
    p.type="button";
    p.className="plot";
    const a=state.plots[i];

    if(!a){
      p.classList.add("empty");
      p.innerHTML=`<span class="plot-plus">＋</span><small>Plant</small>`;
      p.title=`Tanam ${selected.name}`;
      p.addEventListener("click",()=>plant(i));
    }else{
      const v=seeds[a.type];
      const prog=getProgress(a,v);
      const ready=prog>=1;
      p.classList.add(ready?"ready-plot":"growing-plot");
      p.innerHTML=`
        <img class="garden-plant" src="${v.img}" alt="${v.name}">
        <div class="bar"><b style="width:${prog*100}%"></b></div>
        <span class="plot-name">${v.name}</span>
        ${ready?'<span class="harvest">HARVEST</span>':`<span class="grow-time">${Math.ceil(v.time*(1-(prog)))}s</span>`}`;
      p.title=ready?`Panen ${v.name}`:`${v.name} sedang tumbuh`;
      p.addEventListener("click",()=>ready?harvest(i):toast(`${v.name} sedang tumbuh 🌱`));
    }
    garden.appendChild(p);
  }

  const j=document.getElementById("journal");
  j.innerHTML=state.journal.map(x=>`<div class="journal-item"><i class="dot"></i><span>${x}</span></div>`).join("");

  const sh=document.getElementById("shop");
  sh.innerHTML="";
  Object.entries(shop).forEach(([id,v])=>{
    const owned=(id==="soil"&&state.up.plots>=16)||(id==="water"&&state.up.speed===2)||state.up.decor.includes(id);
    const d=document.createElement("div");
    d.className="item";
    d.innerHTML=`<div class="ico">${v[1]}</div><h4>${v[0]}</h4><p>${v[3]}</p>
      <button class="buy" ${owned||state.coins<v[2]?"disabled":""}>${owned?"Owned ✓":"Buy · 🪙 "+v[2]}</button>`;
    d.querySelector("button").addEventListener("click",()=>buy(id));
    sh.appendChild(d);
  });
}

function buy(id){
  const v=shop[id];
  if(state.coins<v[2]) return toast("Koinmu belum cukup 🪙");
  state.coins-=v[2];
  if(v[4]==="plots") state.up.plots=16;
  if(v[4]==="speed") state.up.speed=2;
  if(v[4]==="decor") state.up.decor.push(id);
  journal(`${v[0]} berhasil dibeli. ${v[1]}`);
  save();
  render();
  toast(`${v[0]} unlocked! ✨`);
}

function openDecor(){
  const box=document.getElementById("decorList");
  box.innerHTML=decor.map(d=>{
    const own=state.up.decor.includes(d[0]);
    return `<button class="decor" data-id="${d[0]}" ${own?"disabled":""}>
      <b>${d[2]} ${d[1]} · 🪙 ${d[3]}</b>
      <span>${own?"Already in your garden":"Add it to your garden"}</span>
    </button>`;
  }).join("");

  box.querySelectorAll(".decor").forEach(b=>{
    b.addEventListener("click",()=>{
      const d=decor.find(x=>x[0]===b.dataset.id);
      if(state.coins<d[3]) return toast("Koinmu belum cukup 🪙");
      state.coins-=d[3];
      state.up.decor.push(d[0]);
      journal(`${d[1]} ditambahkan ke taman. ${d[2]}`);
      save();
      render();
      openDecor();
      toast(`${d[1]} siap menghiasi taman!`);
    });
  });
  document.getElementById("modal").classList.remove("hidden");
}

document.getElementById("decorate").addEventListener("click",openDecor);
document.getElementById("close").addEventListener("click",()=>document.getElementById("modal").classList.add("hidden"));
document.getElementById("modal").addEventListener("click",e=>{
  if(e.target.id==="modal") e.currentTarget.classList.add("hidden");
});

document.getElementById("reset").addEventListener("click",()=>{
  if(confirm("Reset GardenUpf dan mulai dari awal?")){
    state=fresh();
    save();
    render();
    toast("Garden di-reset 🌱");
  }
});

render();

setInterval(()=>render(),1000);

setInterval(()=>{
  state.day++;
  journal(`Day ${state.day} dimulai. Selamat berkebun! ☀️`);
  save();
  render();
},60000);
