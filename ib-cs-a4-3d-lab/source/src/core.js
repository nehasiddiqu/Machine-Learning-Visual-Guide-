'use strict';
/* ---------- tiny helpers ---------- */
const T=[];            // topics
const SC={};           // scene factories by topic id
const $=(s,r)=>(r||document).querySelector(s);
const $$=(s,r)=>[...(r||document).querySelectorAll(s)];
function h(tag,attrs,...kids){
  const e=document.createElement(tag);
  if(attrs)for(const k in attrs){const v=attrs[k];
    if(k==='class')e.className=v; else if(k==='html')e.innerHTML=v;
    else if(k.slice(0,2)==='on')e.addEventListener(k.slice(2),v);
    else if(v===true)e.setAttribute(k,''); else if(v!==false&&v!=null)e.setAttribute(k,v);}
  for(const c of kids.flat(9)){if(c==null||c===false)continue;e.append(c.nodeType?c:document.createTextNode(c));}
  return e;}
const C={teal:0x2ec4b6,amber:0xffb400,coral:0xff5d73,violet:0x8c7bff,sky:0x4cc9f0,white:0xe8f1f8,mut:0x6b8299,dim:0x24384c,ink:0x0b1520,lime:0xa6e22e};
const HEX=n=>'#'+n.toString(16).padStart(6,'0');
const CLS=[C.teal,C.amber,C.coral,C.violet,C.sky,C.lime];
function rng(seed){let s=seed>>>0;return function(){s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
function nrm(r){let u=0,v=0;while(!u)u=r();while(!v)v=r();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);}
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const lerp=(a,b,t)=>a+(b-a)*t;
const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
const fx=(v,n=2)=>(+v).toFixed(n);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const store={m:{},get(k,d){try{const v=localStorage.getItem('mllab3d.'+k);return v==null?(k in this.m?this.m[k]:d):JSON.parse(v);}catch(e){return k in this.m?this.m[k]:d;}},
  set(k,v){this.m[k]=v;try{localStorage.setItem('mllab3d.'+k,JSON.stringify(v));}catch(e){}}};
/* readout builder: kv([[label,value,cls]...]) */
const kv=a=>'<div class="row">'+a.map(x=>'<div><span class="k">'+x[0]+'</span><span class="v '+(x[2]||'')+'">'+x[1]+'</span></div>').join('')+'</div>';

/* ---------- Stage: renderer + orbit + helpers ---------- */
class Stage{
  constructor(vp,tabsEl,ctrlEl,outEl,tipEl,opt){
    opt=opt||{};this.vp=vp;this.tabsEl=tabsEl;this.dead=false;this.vis=true;this.time=0;
    this.anims=[];this.timers=[];this.ticks=[];this.picks=[];this.matc={};this.mi=-1;this.spinRate=.12;
    try{this.r=new THREE.WebGLRenderer({antialias:true});}catch(e){this.r=null;}
    if(!this.r){vp.append(h('div',{class:'fail'},'3D graphics could not start on this device. The notes below this panel still cover the whole topic.'));this.dead=true;return;}
    this.r.setPixelRatio(Math.min(window.devicePixelRatio||1,2));this.r.setClearColor(0x0b1520,1);
    vp.prepend(this.r.domElement);
    this.sc=new THREE.Scene();this.sc.fog=new THREE.Fog(0x0b1520,34,110);
    this.camera=new THREE.PerspectiveCamera(45,1,.1,400);
    this.tg=new THREE.Vector3();this.sp={r:14,th:.7,ph:1.1};this.def={r:14,th:.7,ph:1.1,tg:[0,0,0]};
    this.auto=opt.auto!==false;this.userMoved=false;
    this.sc.add(new THREE.AmbientLight(0xffffff,.62));
    const d=new THREE.DirectionalLight(0xffffff,.75);d.position.set(6,10,8);this.sc.add(d);
    const d2=new THREE.DirectionalLight(0x8fb8ff,.3);d2.position.set(-8,-4,-6);this.sc.add(d2);
    const gm=THREE.BufferGeometry;
    this.G={sph:new THREE.SphereGeometry(1,18,12),sph8:new THREE.SphereGeometry(1,10,8),box:new THREE.BoxGeometry(1,1,1),cyl:new THREE.CylinderGeometry(1,1,1,10,1),cone:new THREE.ConeGeometry(1,1,12),pln:new THREE.PlaneGeometry(1,1),tor:new THREE.TorusGeometry(1,.08,8,40)};
    this.shared=new Set(Object.values(this.G));
    this.ray=new THREE.Raycaster();this.ndc=new THREE.Vector2();
    this._bind();
    this.ro=new ResizeObserver(()=>this._size());this.ro.observe(vp);this._size();
    this.io=new IntersectionObserver(es=>{this.vis=es[0].isIntersecting;this.clock=performance.now();},{threshold:0});this.io.observe(vp);
    this.clock=performance.now();this._loop=this._loop.bind(this);requestAnimationFrame(this._loop);
    this.hint=h('div',{class:'hint'},'');vp.append(this.hint);
    const zm=h('div',{class:'zm'},
      h('button',{title:'Zoom in','aria-label':'Zoom in',onclick:()=>this.zoom(.85)},'+'),
      h('button',{title:'Zoom out','aria-label':'Zoom out',onclick:()=>this.zoom(1.18)},'−'),
      h('button',{title:'Change tilt','aria-label':'Change tilt',onclick:()=>this.tilt()},'T'),
      h('button',{title:'Reset view','aria-label':'Reset view',onclick:()=>this.resetView()},'R'));
    vp.append(zm);
    this.ui=this._ui(ctrlEl,outEl,tipEl);
  }
  _size(){if(this.dead)return;const w=this.vp.clientWidth||300,hh=this.vp.clientHeight||300;this.r.setSize(w,hh,false);this.camera.aspect=w/hh;this.camera.updateProjectionMatrix();}
  _bind(){
    const cv=this.r.domElement;let dr=null;
    cv.addEventListener('pointerdown',e=>{dr={x:e.clientX,y:e.clientY,m:0};this.userMoved=true;this.auto=false;try{cv.setPointerCapture(e.pointerId);}catch(_){}});
    cv.addEventListener('pointermove',e=>{if(!dr)return;const dx=e.clientX-dr.x,dy=e.clientY-dr.y;dr.x=e.clientX;dr.y=e.clientY;dr.m+=Math.abs(dx)+Math.abs(dy);
      this.sp.th-=dx*.008;this.sp.ph=clamp(this.sp.ph-dy*.008,.12,3.0);});
    cv.addEventListener('pointerup',e=>{if(dr&&dr.m<7)this._click(e);dr=null;});
    cv.addEventListener('pointercancel',()=>{dr=null;});
    cv.addEventListener('wheel',e=>{if(e.ctrlKey||e.metaKey){e.preventDefault();this.zoom(e.deltaY>0?1.1:.9);}},{passive:false});
  }
  _click(e){if(!this.picks.length)return;const b=this.r.domElement.getBoundingClientRect();
    this.ndc.set(((e.clientX-b.left)/b.width)*2-1,-((e.clientY-b.top)/b.height)*2+1);this.ray.setFromCamera(this.ndc,this.camera);
    for(const p of this.picks){const hit=this.ray.intersectObjects(p.objs,false);if(hit.length){p.fn(hit[0].object,hit[0]);return;}}}
  onPick(objs,fn){this.picks.push({objs:Array.isArray(objs)?objs:[objs],fn});}
  zoom(f){this.sp.r=clamp(this.sp.r*f,3,60);}
  tilt(){const o=[.35,1.0,1.55,2.2];const i=o.findIndex(v=>Math.abs(v-this.sp.ph)<.2);this.sp.ph=o[(i+1)%o.length];this.auto=false;}
  view(r,th,ph,tg){this.def={r,th,ph,tg:tg||[0,0,0]};this.resetView();}
  resetView(){const d=this.def;this.sp.r=d.r;this.sp.th=d.th;this.sp.ph=d.ph;this.tg.set(d.tg[0],d.tg[1],d.tg[2]);this.auto=true;}
  _loop(){
    if(this.dead)return;requestAnimationFrame(this._loop);if(!this.vis)return;
    const now=performance.now();const dt=Math.min(.05,(now-this.clock)/1000);this.clock=now;this.time+=dt;
    if(this.auto&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches)this.sp.th+=dt*this.spinRate;
    const s=this.sp;this.camera.position.set(this.tg.x+s.r*Math.sin(s.ph)*Math.cos(s.th),this.tg.y+s.r*Math.cos(s.ph),this.tg.z+s.r*Math.sin(s.ph)*Math.sin(s.th));
    this.camera.lookAt(this.tg);
    for(const a of this.anims){a.t+=dt*1000;const p=Math.min(1,a.t/a.ms);a.fn(p);if(p>=1){a.done=true;if(a.end)a.end();}}
    if(this.anims.some(a=>a.done))this.anims=this.anims.filter(a=>!a.done);
    for(const t of this.timers){if(t.off)continue;t.acc+=dt*1000;while(t.acc>=t.ms){t.acc-=t.ms;t.fn();if(t.off)break;}}
    for(const f of this.ticks)f(dt,this.time);
    this.r.render(this.sc,this.camera);
  }
  anim(ms,fn,end){const a={t:0,ms,fn,end};this.anims.push(a);return a;}
  every(ms,fn){const t={ms,acc:0,fn,off:false,stop(){this.off=true;}};this.timers.push(t);return t;}
  tick(fn){this.ticks.push(fn);}
  /* ----- materials & meshes ----- */
  mat(c,o){o=o||{};const k=c+'|'+(o.op==null?1:o.op)+'|'+(o.emi||0)+'|'+(o.basic?1:0);
    if(this.matc[k])return this.matc[k];
    const p={color:c,transparent:o.op!=null&&o.op<1,opacity:o.op==null?1:o.op};
    let m;if(o.basic)m=new THREE.MeshBasicMaterial(p);else{m=new THREE.MeshLambertMaterial(p);if(o.emi)m.emissive=new THREE.Color(c).multiplyScalar(o.emi);}
    if(o.op!=null&&o.op<1)m.depthWrite=false;
    return this.matc[k]=m;}
  ball(g,p,r,c,o){const m=new THREE.Mesh(o&&o.lo?this.G.sph8:this.G.sph,this.mat(c,o));m.position.set(p[0],p[1],p[2]);m.scale.setScalar(r);g.add(m);return m;}
  cube(g,p,s,c,o){const m=new THREE.Mesh(this.G.box,this.mat(c,o));m.position.set(p[0],p[1],p[2]);if(typeof s==='number')m.scale.setScalar(s);else m.scale.set(s[0],s[1],s[2]);g.add(m);return m;}
  plane(g,p,w,hh,c,o){const m=new THREE.Mesh(this.G.pln,this.mat(c,Object.assign({basic:true},o||{})));m.position.set(p[0],p[1],p[2]);m.scale.set(w,hh,1);if(!o||!o.vertical)m.rotation.x=-Math.PI/2;g.add(m);return m;}
  bar(g,a,b,r,c,o){const A=new THREE.Vector3(a[0],a[1],a[2]),B=new THREE.Vector3(b[0],b[1],b[2]);const d=B.clone().sub(A);const L=d.length()||1e-6;
    const m=new THREE.Mesh(this.G.cyl,this.mat(c,o));m.position.copy(A).addScaledVector(d,.5);m.scale.set(r,L,r);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());g.add(m);return m;}
  setBar(m,a,b){const A=new THREE.Vector3(a[0],a[1],a[2]),B=new THREE.Vector3(b[0],b[1],b[2]);const d=B.clone().sub(A);const L=d.length()||1e-6;
    m.position.copy(A).addScaledVector(d,.5);m.scale.y=L;m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());}
  arrow(g,a,b,c,r,o){r=r||.05;const A=new THREE.Vector3(a[0],a[1],a[2]),B=new THREE.Vector3(b[0],b[1],b[2]);const d=B.clone().sub(A);const L=d.length();const hl=Math.min(L*.4,r*6);
    const dn=d.clone().normalize();const S=B.clone().addScaledVector(dn,-hl);const grp=new THREE.Group();
    this.bar(grp,a,[S.x,S.y,S.z],r,c,o);const cn=new THREE.Mesh(this.G.cone,this.mat(c,o));cn.scale.set(r*2.6,hl,r*2.6);cn.position.copy(B).addScaledVector(dn,-hl/2);cn.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dn);grp.add(cn);g.add(grp);return grp;}
  line(g,pts,c,op){const geo=new THREE.BufferGeometry().setFromPoints(pts.map(p=>new THREE.Vector3(p[0],p[1],p[2])));
    const l=new THREE.Line(geo,new THREE.LineBasicMaterial({color:c,transparent:op!=null,opacity:op==null?1:op}));g.add(l);return l;}
  setLine(l,pts){const a=l.geometry.attributes.position;if(a.count!==pts.length){l.geometry.dispose();l.geometry=new THREE.BufferGeometry().setFromPoints(pts.map(p=>new THREE.Vector3(p[0],p[1],p[2])));}
    else{pts.forEach((p,i)=>a.setXYZ(i,p[0],p[1],p[2]));a.needsUpdate=true;}l.geometry.computeBoundingSphere();}
  segs(g,pairs,c,op){const arr=[];pairs.forEach(p=>{arr.push(new THREE.Vector3(p[0][0],p[0][1],p[0][2]),new THREE.Vector3(p[1][0],p[1][1],p[1][2]));});
    const l=new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(arr),new THREE.LineBasicMaterial({color:c,transparent:op!=null,opacity:op==null?1:op}));g.add(l);return l;}
  floor(g,size,div,y,c){const gr=new THREE.GridHelper(size,div,c||0x2f4863,c||0x1c2e42);gr.position.y=y||0;g.add(gr);return gr;}
  axes(g,len,lab,o){o=o||{};const L=len;const lx=o.min==null?0:o.min;
    this.bar(g,[lx,lx,lx],[L,lx,lx],.025,0x6b8299);this.bar(g,[lx,lx,lx],[lx,L,lx],.025,0x6b8299);if(!o.flat)this.bar(g,[lx,lx,lx],[lx,lx,L],.025,0x6b8299);
    if(lab){this.label(g,lab[0],[L+.6,lx,lx],{size:.55});this.label(g,lab[1],[lx,L+.6,lx],{size:.55});if(lab[2]&&!o.flat)this.label(g,lab[2],[lx,lx,L+.6],{size:.55});}}
  inst(g,n,r,o){o=o||{};const m=new THREE.InstancedMesh(this.G.sph8,new THREE.MeshLambertMaterial({color:0xffffff,transparent:o.op!=null,opacity:o.op==null?1:o.op}),n);
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);m.frustumCulled=false;const d=new THREE.Object3D(),col=new THREE.Color();
    const api={mesh:m,n,set(i,p,c,s){d.position.set(p[0],p[1],p[2]);d.scale.setScalar(r*(s==null?1:s));d.updateMatrix();m.setMatrixAt(i,d.matrix);if(c!=null){col.setHex(c);m.setColorAt(i,col);}},
      done(){m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;}};
    for(let i=0;i<n;i++){api.set(i,[0,-999,0],0xffffff);}api.done();g.add(m);return api;}
  label(g,text,p,o){o=o||{};const sz=o.size||.6;const fs=64;const cv=document.createElement('canvas');const ctx=cv.getContext('2d');
    const tex=new THREE.CanvasTexture(cv);tex.minFilter=THREE.LinearFilter;tex.generateMipmaps=false;
    const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:o.depth?true:false,depthWrite:false}));
    sp.renderOrder=20;sp.position.set(p[0],p[1],p[2]);
    const draw=(t,col,bg)=>{const f='600 '+fs+'px system-ui,Segoe UI,Helvetica,Arial,sans-serif';ctx.font=f;const w=Math.ceil(ctx.measureText(t).width)+28;cv.width=w;cv.height=fs+28;ctx.font=f;
      ctx.clearRect(0,0,w,cv.height);if(bg){ctx.fillStyle=bg;const r=18,x=2,y=2,ww=w-4,hh=cv.height-4;ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+ww,y,x+ww,y+hh,r);ctx.arcTo(x+ww,y+hh,x,y+hh,r);ctx.arcTo(x,y+hh,x,y,r);ctx.arcTo(x,y,x+ww,y,r);ctx.fill();}
      ctx.fillStyle=col;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(t,w/2,cv.height/2+3);tex.needsUpdate=true;sp.scale.set(sz*w/cv.height,sz,1);};
    sp.userData.setText=(t,col,bg)=>draw(t,col||o.color||'#e8f1f8',bg===undefined?o.bg:bg);
    draw(text,o.color||'#e8f1f8',o.bg);g.add(sp);return sp;}
  /* ----- modes ----- */
  modes(list){this.ml=list;this.tabsEl.innerHTML='';this.tabsEl.hidden=list.length<2;
    list.forEach((m,i)=>{this.tabsEl.append(h('button',{class:'tab',role:'tab','aria-selected':'false',onclick:()=>this.setMode(i)},m.label));});this.setMode(0);}
  clearGroup(){if(!this.grp)return;this.grp.traverse(o=>{if(o.geometry&&!this.shared.has(o.geometry))o.geometry.dispose();if(o.material){const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>{if(m.map)m.map.dispose();if(!Object.values(this.matc).includes(m))m.dispose();});}
    if(o.dispose&&o.isInstancedMesh)o.dispose();});this.sc.remove(this.grp);this.grp=null;}
  setMode(i){if(this.dead)return;this.anims=[];this.timers=[];this.ticks=[];this.picks=[];this.clearGroup();
    Object.values(this.matc).forEach(m=>m.dispose());this.matc={};this.ui.reset();this.mi=i;
    $$('.tab',this.tabsEl).forEach((b,j)=>b.setAttribute('aria-selected',j===i?'true':'false'));
    const m=this.ml[i];const v=m.view||[14,.7,1.1,[0,0,0]];this.view(v[0],v[1],v[2],v[3]);this.spinRate=m.spin==null?.12:m.spin;
    this.grp=new THREE.Group();this.sc.add(this.grp);this.hint.textContent='Drag to rotate. '+(m.hint||'');
    try{m.build(this.grp,this.ui,this);}catch(e){console.error('mode build',this.ml[i].label,e);this.ui.out('<p>This view hit a problem: '+e.message+'</p>');}
    this.ui.tip(m.tip||'');}
  dispose(){if(this.dead)return;this.dead=true;try{this.ro.disconnect();this.io.disconnect();}catch(e){}
    this.clearGroup();Object.values(this.matc).forEach(m=>m.dispose());Object.values(this.G).forEach(g=>g.dispose());
    try{this.r.dispose();this.r.forceContextLoss();}catch(e){}this.r.domElement.remove();}
  /* ----- control panel builder ----- */
  _ui(ctrl,out,tipEl){
    const mk=root=>{const o={
      g(title){const gr=h('div',{class:'grp'},title?h('div',{class:'lg'},title):null);root.append(gr);return mk(gr);},
      btn(label,fn,opt){opt=opt||{};const b=h('button',{class:'btn'+(opt.pri?' pri':''),onclick:e=>fn(e,b)},label);if(opt.toggle)b.setAttribute('aria-pressed',opt.on?'true':'false');root.append(b);return b;},
      slider(label,min,max,step,val,fn,fmt){fmt=fmt||(v=>v);const rd=h('b',null,fmt(val));const inp=h('input',{type:'range',min,max,step,value:val,'aria-label':label});
        inp.addEventListener('input',()=>{rd.textContent=fmt(+inp.value);fn(+inp.value);});const w=h('label',{class:'sl'},h('span',null,label,rd),inp);root.append(w);
        return{el:w,get:()=>+inp.value,set:v=>{inp.value=v;rd.textContent=fmt(v);}};},
      toggle(label,val,fn){const inp=h('input',{type:'checkbox'});inp.checked=!!val;inp.addEventListener('change',()=>fn(inp.checked));root.append(h('label',{class:'ck'},inp,label));return inp;},
      sel(label,opts,val,fn){const s=h('select',{class:'btn','aria-label':label},opts.map(([v,t])=>h('option',{value:v},t)));s.value=val;s.addEventListener('change',()=>fn(s.value));root.append(s);return s;}
    };return o;};
    const u=mk(ctrl);u.out=html=>{out.innerHTML=html;};u.tip=t=>{tipEl.textContent=t;tipEl.hidden=!t;};u.reset=()=>{ctrl.innerHTML='';out.innerHTML='';};
    u.press=(b,on)=>b.setAttribute('aria-pressed',on?'true':'false');return u;}
}
/* build the standard stage panel for a topic and attach its scene */
function mountStage(host,id,title,sub){
  const vp=h('div',{class:'vp'});const tabs=h('div',{class:'tabs',role:'tablist'});const ctrl=h('div',{class:'ctrl'});
  const out=h('div',{class:'readout','aria-live':'polite'});const tip=h('div',{class:'tip'});
  host.append(h('div',{class:'stage-h'},h('h2',null,title||'3D lab'),h('span',null,sub||'')),tabs,vp,ctrl,out,tip);
  const S=new Stage(vp,tabs,ctrl,out,tip);
  if(S.dead)return S;
  try{SC[id](S,S.ui);}catch(e){console.error('scene',id,e);S.ui.out('<p>This 3D lab hit a problem: '+e.message+'</p>');}
  return S;}
