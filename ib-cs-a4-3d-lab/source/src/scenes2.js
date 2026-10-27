/* ===== scenes: A4.1.2 hardware, A4.2.1 cleaning, A4.2.2 feature selection, A4.2.3 dimensionality ===== */
SC.a412=function(S){
 S.modes([
 {label:'Training vs inference',view:[19,.8,1.0,[0,3,0]],hint:'Move the sliders to change the workload.',tip:'Four towers per phase. Training towers grow with data size. Inference towers depend on how many users call the model.',
  build(g,u){
   S.floor(g,22,22,0);
   const names=['Processing','Storage','Scalability'],cols=[C.teal,C.amber,C.violet,C.coral];
   const T1=[],T2=[];
   [0,1,2,3].forEach(i=>{T1.push(tw(S,g,-9+i*1.9-0,0,1,cols[i],1.2));T2.push(tw(S,g,2+i*1.9,0,1,cols[i],1.2));});
   const nm=['Processing','Storage','Scalability','Time if one CPU'],nm2=['Processing','Storage','Scalability','Latency / power limit'];
   [0,1,2,3].forEach(i=>{S.label(g,nm[i],[-9+i*1.9,-.9,2.2],{size:.42});S.label(g,nm2[i],[2+i*1.9,-.9,2.2],{size:.42});});
   S.label(g,'TRAINING',[-6,11.6,0],{size:.9,color:'#ffffff',bg:'#2ec4b6aa'});S.label(g,'INFERENCE',[5,11.6,0],{size:.9,color:'#ffffff',bg:'#8c7bffaa'});
   let d=8,q=3;
   const upd=()=>{const a=[2+.9*d,1+.9*d,2+.8*d,.9*d+.5],b=[1+.3*q+.8,1.3,.6+.9*q,2+.55*q];
    a.forEach((v,i)=>setH(T1[i],Math.min(v,11)));b.forEach((v,i)=>setH(T2[i],Math.min(v,11)));
    u.out(kv([['Training data size',d+' / 10'],['Inference users',q+' / 10']])+'<p><b>Training:</b> processing, storage and scalability all rise with data size. <b>Inference:</b> one forward pass, so processing and storage stay modest. What grows is <b>scalability</b> (more simultaneous requests) and the need for <b>low latency or low power</b>.</p>');};
   u.slider('Training dataset size',1,10,1,d,v=>{d=v;upd();});
   u.slider('Inference users (requests)',1,10,1,q,v=>{q=v;upd();});upd();
  }},
 {label:'CPU vs GPU',view:[20,.9,.95,[0,0,0]],hint:'Press Run job and compare progress.',tip:'Left: a CPU with a few powerful cores, each doing complex work one after another. Right: a GPU with thousands of simple cores doing the same small operation in parallel (256 shown).',
  build(g,u){
   S.floor(g,30,30,-.6);
   const cpu=[],gpu=[];
   for(let i=0;i<8;i++)cpu.push(S.cube(g,[-11+(i%4)*2.3,.2,-1.2+Math.floor(i/4)*2.6],[2,.8,2],C.sky,{emi:.2}));
   S.label(g,'CPU: 8 powerful cores',[-8,3,0],{size:.65,color:'#4cc9f0'});
   const gi=S.inst(g,256,.34);const gp=[];
   for(let i=0;i<256;i++){const x=3+(i%16)*.75,z=-5.6+Math.floor(i/16)*.75;gp.push([x,.3,z]);gi.set(i,[x,.3,z],0x2f4863);}gi.done();
   S.label(g,'GPU: thousands of simple cores',[8.5,3,0],{size:.65,color:'#ffb400'});
   const bc=tw(S,g,-8,6,.3,C.sky,1.6),bg=tw(S,g,9,6,.3,C.amber,1.6);
   S.label(g,'CPU progress',[-8,-.4,6],{size:.4});S.label(g,'GPU progress',[9,-.4,6],{size:.4});
   let N=3000,dc=0,dg=0,run=false,tc=0,tg=0,tick=0;
   const upd=(msg)=>u.out(kv([['Tasks',N],['CPU done',Math.round(dc),'a'],['GPU done',Math.round(dg),'g'],['CPU time',tc+' ticks'],['GPU time',tg+' ticks']])+'<p>'+(msg||'Each tick a CPU core finishes 3 tasks (it is faster per core) but only 8 cores exist, so 24 tasks per tick. The GPU does 1 task per core on 256 cores shown (thousands in real hardware), so 256 per tick or more. Matrix multiplication is one huge pile of identical small tasks.')+'</p>');
   S.every(80,()=>{if(!run)return;tick++;
     if(dc<N){dc=Math.min(N,dc+24);tc=tick;}if(dg<N){dg=Math.min(N,dg+256);tg=tick;}
     setH(bc,.3+dc/N*8);setH(bg,.3+dg/N*8);
     cpu.forEach((m,i)=>m.material=S.mat(dc<N&&tick%2?C.amber:C.sky,{emi:.3}));
     for(let i=0;i<256;i++)gi.set(i,gp[i],dg<N?(((i+tick*7)%5)<2?C.amber:0x4a6a8a):0x2ec4b6);gi.done();
     if(dc>=N&&dg>=N)run=false;upd(dg>=N&&dc<N?'The GPU finished first because it works in parallel, not because each core is faster.':null);});
   u.btn('Run job',()=>{dc=0;dg=0;tc=0;tg=0;tick=0;run=true;},{pri:true});
   u.slider('Job size (tasks)',500,6000,250,N,v=>{N=v;});
   upd();
  }},
 {label:'Hardware spectrum',view:[24,.75,1.0,[0,2.5,0]],hint:'Click a tower, or press a scenario.',tip:'Illustrative scores from 0 to 10 based on the notes. Teal processing, amber storage, violet scalability, sky flexibility.',
  build(g,u){
   S.floor(g,30,30,0);
   const H=[['CPU',[2,3,1,10],'General-purpose processor with 4 to 32 powerful sequential cores. Good for logic, poor at parallel matrix maths. Fine for small data and simple models.'],
    ['GPU',[8,6,7,7],'Thousands of simple parallel cores and fast VRAM (16 to 80 GB). The main hardware for deep-learning training and high-throughput inference.'],
    ['TPU',[9,8,10,2],'Google ASIC for tensor operations with high-bandwidth memory and TPU Pods. Excellent for very large models on Google Cloud.'],
    ['ASIC',[10,2,2,0],'Fixed-function chip. Best possible speed and efficiency for one task and cheap per unit at scale, but zero flexibility and very high upfront cost.'],
    ['FPGA',[6,4,4,9],'Reconfigurable after manufacture. Very low latency and flexible while the design is changing; costlier per unit than an ASIC at scale.'],
    ['Edge',[3,1,1,2],'Small low-power inference device. Works offline, low latency, keeps data private. Cannot train.'],
    ['Cloud/HPC',[10,10,10,8],'Rented clusters of GPUs and TPUs with petabyte storage. Effectively unlimited, scales up and down, no capital cost.']];
   const fc=[C.teal,C.amber,C.violet,C.sky];const meshes=[];const all=[];
   H.forEach((h,i)=>{const x=(i-3)*3.6;const row=[];h[1].forEach((v,k)=>{const m=tw(S,g,x+(k-1.5)*.8,0,Math.max(v,.2),fc[k],.7);m.userData={i,k,v,col:fc[k]};row.push(m);all.push(m);});meshes.push(row);
    S.label(g,h[0],[x,-1,2.2],{size:.7});});
   const dim=(w)=>all.forEach(m=>{const on=w==null||m.userData.i===w;m.material=S.mat(m.userData.col,on?{emi:.25}:{op:.16});});
   const show=(i,extra)=>{dim(i);u.out('<p><b>'+H[i][0]+'.</b> '+H[i][2]+'</p>'+(extra?'<p><b>Why here:</b> '+extra+'</p>':''));};
   S.onPick(all,o=>show(o.userData.i));
   const SC2=[['Student: decision tree, 1,000 rows',0,'Dataset is small and the model simple, so no parallel computation is needed.'],
    ['Train a CNN on 10 million images',6,'Massive parallel training; one GPU is not enough, so a cloud or HPC GPU cluster is standard.'],
    ['Google trains a new language model',2,'The scale needs purpose-built tensor hardware with huge memory bandwidth, which TPU pods give.'],
    ['1 million smart doorbells, offline faces',5,'Inference must run locally with no network. A custom ASIC edge chip gives efficiency and low power at manufacturing scale.'],
    ['Prototype low-latency trading model',4,'The architecture is not final, so reprogrammability matters, and microsecond latency is required: FPGA.'],
    ['Hospital tablet skin-cancer classifier',5,'Inference runs locally for patient privacy and poor connectivity, with low power and fast response: an edge device.'],
    ['Small firm, no GPU servers, training',6,'The cloud removes upfront cost: pay only for GPU hours, then run inference on cheaper hardware.']];
   const gp=u.g('Scenarios');SC2.forEach(s=>gp.btn(s[0],()=>show(s[1],s[2])));
   gp.btn('Show all',()=>{dim(null);u.out('<p>Click a tower or press a scenario.</p>');});
   dim(null);u.out('<p>Click a tower to read about that hardware, or press a scenario to see which one fits.</p>');
  }}
 ]);
};

SC.a421=function(S){
 S.modes([
 {label:'Garbage in, garbage out',view:[18,.7,1.1,[0,4,0]],hint:'Add problems and watch the line move.',tip:'Same model (a straight-line fit of score against hours studied), different data quality. Teal points are clean. Coral points are errors.',
  build(g,u){
   S.floor(g,16,16,0);S.axes(g,11,['hours','score',''],{flat:true,min:0});
   const X=x=>(x-5)*1.0,Y=s=>s*.09;
   const r=rng(21);const base=[];for(let i=0;i<14;i++){const x=.7+i*.65+r()*.3;base.push([x,8*x+6+nrm(r)*5]);}
   const pts=[];let mk=[];const lineM=S.bar(g,[0,0,0],[1,1,0],.06,C.amber,{emi:.4});const truth=S.bar(g,[X(0),Y(6),0],[X(10),Y(86),0],.035,C.white,{op:.5});
   S.label(g,'true pattern',[X(10.4),Y(88),0],{size:.4,color:'#9db2c7'});
   let dirty=[];const fit=()=>{const P=base.concat(dirty);const n=P.length;const mx=P.reduce((s,p)=>s+p[0],0)/n,my=P.reduce((s,p)=>s+p[1],0)/n;
     let sxy=0,sxx=0;P.forEach(p=>{sxy+=(p[0]-mx)*(p[1]-my);sxx+=(p[0]-mx)**2;});const m=sxy/sxx,c=my-m*mx;return{m,c,n};};
   const draw=()=>{mk.forEach(x=>g.remove(x));mk=[];base.forEach(p=>mk.push(S.ball(g,[X(p[0]),Y(p[1]),0],.2,C.teal,{emi:.3})));dirty.forEach(p=>mk.push(S.ball(g,[X(p[0]),Y(Math.max(p[1],-3)),0],.24,C.coral,{emi:.5})));
     const f=fit();S.setBar(lineM,[X(0),Y(f.c),0],[X(10),Y(f.m*10+f.c),0]);const pred=f.m*6+f.c;
     u.out(kv([['Points',f.n],['Fitted slope',fx(f.m,1)+' marks/hour',Math.abs(f.m-8)<1.5?'g':'b'],['Predicted score at 6 h',fx(pred,0),Math.abs(pred-54)<6?'g':'b'],['True pattern at 6 h',54]])+'<p>'+(dirty.length?'The dirty records pull the line away from the true pattern, so predictions for ordinary students get worse. The model has no way to know the data is wrong.':'Clean data: the fitted line sits on the true pattern.')+'</p>');};
   const add=(p)=>{dirty.push(p);draw();};
   u.btn('Add an outlier (age-210 style)',()=>add([9.2,260]),{pri:true});
   u.btn('Add a wrong label',()=>add([8.8,3]));
   u.btn('Add 5 duplicates of one point',()=>{for(let i=0;i<5;i++)dirty.push([1.0,60]);draw();});
   u.btn('Clean everything',()=>{dirty=[];draw();});
   draw();
  }},
 {label:'Six problems',view:[17,.6,1.05,[0,3,0]],hint:'Pick a problem, then apply a technique.',tip:'Pick one of the six problem types, then press the technique buttons to see what each does.',
  build(g,u){
   S.floor(g,18,18,0);
   const sub=new THREE.Group();g.add(sub);let cur=0,state={};
   const probs=['Missing data','Outliers','Incorrect data','Duplicate data','Irrelevant data','Improperly formatted'];
   const names=[['Delete rows','Impute mean','Impute median'],['Remove','Cap at 100','Log transform'],['Validation rules','Cross-check','Correct or remove'],['Remove exact copies','Consolidate near-duplicates',''],['Feature selection','Drop near-zero variance',''],['Standardise format','','']];
   const clear=()=>{while(sub.children.length){const c=sub.children.pop();sub.remove(c);}};
   const bars=(vals,cols,x0,sp,w)=>vals.map((v,i)=>v==null?null:tw(S,sub,x0+i*sp,0,v*.08,cols?cols[i]:C.teal,w||.8));
   const text=(t)=>u.out('<p>'+t+'</p>');
   const rebuild=()=>{clear();state={};
    if(cur===0){const vals=[55,62,null,48,70,null,66,59,null,64];const x0=-7.2,sp=1.6;state.vals=vals;state.b=[];
      vals.forEach((v,i)=>{if(v==null){const m=S.cube(sub,[x0+i*sp,2,0],[.8,4,.8],C.coral,{op:.25});state.b.push(m);}else state.b.push(tw(S,sub,x0+i*sp,0,v*.08,C.teal,.8));});
      S.label(sub,'3 of 10 values missing (ghost columns)',[0,8.5,0],{size:.6,color:'#ff5d73'});
      text('Three values are absent. Many algorithms cannot process nulls. Choose a technique.');}
    if(cur===1){const vals=[52,60,58,64,55,61,57,63,59,230];state.vals=vals;state.b=bars(vals,vals.map(v=>v>150?C.coral:C.teal),-7.2,1.6);state.cap=S.plane(sub,[0,100*.08,0],18,3,C.amber,{op:.0});
      S.label(sub,'one extreme value',[7.2,19.2,0],{size:.5,color:'#ff5d73'});text('One value (230) towers over the rest. It drags a regression line and the mean towards itself. Investigate before acting.');}
    if(cur===2){const vals=[42000,55000,-50000,61000,48000,52000,300];state.vals=vals;
      state.b=vals.map((v,i)=>{const h=Math.abs(v)/6000;const bad=v<0||v<1000;const m=tw(S,sub,-6+i*2,0,Math.max(h,.15),bad?C.coral:C.teal,.9);if(v<0)m.position.y=-h/2;return m;});
      state.band=S.plane(sub,[0,0,0],16,3,C.teal,{op:.15});S.label(sub,'salary (valid: positive, plausible)',[0,10.5,0],{size:.55});text('A negative salary (below the floor) and an impossible tiny one are factually wrong. They are not just unusual, so outlier detection may miss them. Use rules.');}
    if(cur===3){const r=rng(9);state.pts=[];for(let i=0;i<12;i++){const p=[(r()-.5)*11,1+r()*4,(r()-.5)*6];state.pts.push(S.ball(sub,p,.3,C.teal,{emi:.3}));if(i<4){for(let k=0;k<2;k++)state.pts.push(S.ball(sub,[p[0]+.03*k,p[1],p[2]],.3,C.coral,{emi:.4}));}}
      S.label(sub,'record A appears 3 times: over-weighted',[0,7.5,0],{size:.55,color:'#ff5d73'});text('Coral spheres sit exactly on top of originals. The model sees these four records three times each and over-weights them.');}
    if(cur===4){const F=[['income',.8],['credit score',.7],['age',.4],['phone no.',.02],['unique ID',.0],['entry time',.03]];state.b=F.map((f,i)=>{const m=tw(S,sub,-6+i*2.4,0,Math.max(f[1]*8,.15),f[1]>.1?C.teal:C.coral,.9);S.label(sub,f[0],[-6+i*2.4,-.8,1.6],{size:.4});return m;});
      S.label(sub,'relevance to the target (loan repaid?)',[0,9.5,0],{size:.55});text('Phone number, unique ID and entry time have almost no link to the target. They add noise and slow training.');}
    if(cur===5){const F=[['USA',4],['U.S.A.',3],['United States',3],['america',2]];state.b=F.map((f,i)=>{const m=tw(S,sub,-6+i*3.2,0,f[1]*.9,[C.teal,C.amber,C.violet,C.sky][i],1.3);S.label(sub,f[0],[-6+i*3.2,-.8,1.8],{size:.5});return m;});state.F=F;
      S.label(sub,'one country, four categories',[0,6.4,0],{size:.6,color:'#ff5d73'});text('The model sees four different categories, so a pattern for US customers is split into weak fragments.');}
    [0,1,2].forEach((k,i)=>{acts[i].textContent=names[cur][i]||'(not used)';acts[i].disabled=!names[cur][i];});};
   const act=i=>{const b=state.b;
    if(cur===0){if(i===0){b.forEach((m,k)=>{if(state.vals[k]==null)S.anim(500,t=>{m.scale.y=Math.max(.01,4*(1-t));m.position.y=m.scale.y/2;});});text('<b>Deletion:</b> the rows with gaps are removed. Simple, but you lose 30% of the data and may introduce bias if the gaps were not random.');}
      else{const v=state.vals.filter(x=>x!=null);const mean=v.reduce((a,c)=>a+c,0)/v.length,med=v.slice().sort((a,c)=>a-c)[Math.floor(v.length/2)];const val=i===1?mean:med;
        b.forEach((m,k)=>{if(state.vals[k]==null){sub.remove(m);tw(S,sub,-7.2+k*1.6,0,val*.08,C.amber,.8);}});text('<b>Imputation with the '+(i===1?'mean = '+fx(mean,1):'median = '+med)+':</b> every row is kept, but the filled values (amber) are artificial.');}}
    if(cur===1){const o=b[9];
      if(i===0){S.anim(500,t=>{o.scale.y=Math.max(.01,18.4*(1-t));o.position.y=o.scale.y/2;});text('<b>Remove:</b> allowed only for a confirmed error with no correct replacement. A genuine extreme should be documented before removal.');}
      if(i===1){state.cap.material=S.mat(C.amber,{op:.3,basic:true});S.anim(500,t=>{const h=lerp(18.4,8,ease(t));o.scale.y=h;o.position.y=h/2;});text('<b>Cap (Winsorise):</b> values beyond 100 are replaced by 100, so the row stays but its pull is limited.');}
      if(i===2){b.forEach((m,k)=>{const h=Math.log10(state.vals[k])*3;S.anim(600,t=>{const c=m.scale.y;m.scale.y=lerp(c,h,ease(t));m.position.y=m.scale.y/2;});});text('<b>Log transform:</b> compresses the range of a heavily skewed feature so the largest value no longer dominates.');}}
    if(cur===2){const bad=[2,6];if(i===0){state.band.material=S.mat(C.teal,{op:.35,basic:true});bad.forEach(k=>b[k].material=S.mat(C.amber,{emi:.8}));text('<b>Validation rules</b> (salary must be positive and plausible) flag the rule-breakers in amber.');}
      if(i===1){bad.forEach(k=>b[k].material=S.mat(C.violet,{emi:.8}));text('<b>Cross-checking</b> against a related field (job title, pay band) shows these values cannot be right.');}
      if(i===2){bad.forEach(k=>{S.anim(500,t=>{b[k].scale.y=Math.max(.01,b[k].scale.y*(1-t*.2));});sub.remove(b[k]);});text('<b>Correct or remove:</b> correct if the true value can be found. Otherwise treat the field as missing and apply a missing-data technique.');}}
    if(cur===3){const pts=state.pts;pts.forEach(m=>{if(m.material===S.mat(C.coral,{emi:.4}))sub.remove(m);});text(i===0?'<b>Remove exact copies:</b> keep one of each identical row.':'<b>Consolidate near-duplicates:</b> matching on names and addresses merges "J. Smith" and "John Smith" into one canonical record.');}
    if(cur===4){state.b.forEach((m,k)=>{if(m.material===S.mat(C.coral,{emi:.2})||k>=3)S.anim(500,t=>{m.scale.y=Math.max(.01,m.scale.y*(1-t*.3));m.position.y=m.scale.y/2;});});text(i===0?'<b>Feature selection:</b> columns with no relationship to the target are dropped.':'<b>Near-zero variance:</b> a column that is almost constant carries no signal.');}
    if(cur===5){const F=state.F;state.b.forEach((m,k)=>{if(k>0){S.anim(600,t=>{m.position.x=lerp(-6+k*3.2,-6,ease(t));m.position.y=lerp(m.position.y,0,0);});sub.remove(m);}});setTimeout(()=>{},0);state.b[0].scale.y=12*.9;state.b[0].position.y=6*.9;text('<b>Format standardisation:</b> all four spellings become the ISO code USA, so one strong category replaces four weak ones.');}
   };
   const gp=u.g('Problem');probs.forEach((p,i)=>gp.btn(p,()=>{cur=i;rebuild();}));
   const ga=u.g('Technique');const acts=[0,1,2].map(i=>ga.btn('',()=>act(i),{pri:i===0}));
   ga.btn('Reset',rebuild);
   rebuild();
  }},
 {label:'Scaling',view:[18,.7,1.0,[0,2,0]],hint:'Switch scale to compare features fairly.',tip:'Each sphere is a person. Axes: age (x), salary (z), credit score (y). In the raw view all axes use the same unit, so salary stretches the cloud into a line.',
  build(g,u){
   S.floor(g,18,18,0);
   const r=rng(14);const P=[];for(let i=0;i<28;i++){P.push([18+r()*72,20000+r()*380000,300+r()*550]);}
   let outl=false;const stat=(arr,k)=>{const v=arr.map(p=>p[k]);const n=v.length,mn=Math.min(...v),mx=Math.max(...v),m=v.reduce((a,c)=>a+c,0)/n,sd=Math.sqrt(v.reduce((a,c)=>a+(c-m)**2,0)/n);return{mn,mx,m,sd};};
   const balls=[];let mode='raw',cur=null;
   const pos=(p,all,md)=>{const st=[0,1,2].map(k=>stat(all,k));
     if(md==='raw')return[p[0]/40000*10-3,(p[2])/40000*10,(p[1])/40000*10-6];
     if(md==='mm')return[(p[0]-st[0].mn)/(st[0].mx-st[0].mn)*10-5,(p[2]-st[2].mn)/(st[2].mx-st[2].mn)*10,(p[1]-st[1].mn)/(st[1].mx-st[1].mn)*10-5];
     return[(p[0]-st[0].m)/st[0].sd*2.2,(p[2]-st[2].m)/st[2].sd*2.2+4,(p[1]-st[1].m)/st[1].sd*2.2];};
   const build=()=>{balls.forEach(b=>g.remove(b));balls.length=0;const all=outl?P.concat([[55,2000000,600]]):P;
     all.forEach((p,i)=>{const b=S.ball(g,pos(p,all,mode),.28,i===28?C.coral:(i<2?C.amber:C.sky),{emi:.3});balls.push(b);});};
   const move=(md)=>{const all=outl?P.concat([[55,2000000,600]]):P;const from=balls.map(b=>b.position.clone());const to=all.map(p=>pos(p,all,md));mode=md;S.anim(900,t=>{balls.forEach((b,i)=>b.position.lerpVectors(from[i],new THREE.Vector3(to[i][0],to[i][1],to[i][2]),ease(t)));});read();};
   const read=()=>{const a=P[0],b=P[1];const all=outl?P.concat([[55,2000000,600]]):P;const st=[0,1,2].map(k=>stat(all,k));
     const f=md=>[0,1,2].map(k=>{const d=a[k]-b[k];return md==='raw'?d:md==='mm'?d/(st[k].mx-st[k].mn):d/st[k].sd;});
     const dd=f(mode).map(x=>x*x),tot=dd.reduce((s,c)=>s+c,0);const sh=k=>fx(100*dd[k]/tot,1)+'%';
     u.out(kv([['Scale',mode==='raw'?'raw':mode==='mm'?'min-max':'z-score'],['Salary share of distance',sh(1),mode==='raw'?'b':'g'],['Age share',sh(0)],['Credit score share',sh(2)]])+'<p>Share of the squared distance between the two amber people that each feature contributes. '+(mode==='raw'?'Salary is in the tens of thousands, so it decides almost everything.':mode==='mm'?'Min-max puts every feature in 0 to 1: <code>(x - min) / (max - min)</code>. Outliers squash everyone else into a small corner.':'Z-score gives every feature mean 0 and SD 1: <code>(x - mean) / SD</code>. It is less squashed by an outlier.')+'</p>');};
   const g1=u.g('Scale');const bR=g1.btn('Raw',()=>move('raw'),{pri:true}),bM=g1.btn('Normalise (min-max)',()=>move('mm')),bZ=g1.btn('Standardise (z-score)',()=>move('z'));
   const g2=u.g('Outlier');g2.toggle('Add a salary outlier (2,000,000)',false,v=>{outl=v;build();read();});
   S.label(g,'age →',[8,0,-7],{size:.5});S.label(g,'salary →',[-6.5,0,6],{size:.5});
   build();read();
  }}
 ]);
};

SC.a422=function(S){
 const F=[['square_footage',.87],['num_bedrooms',.74],['age_of_property',.61],['postcode',.09],['listing_ref',.02],['prev_owner_name',.0]];
 S.modes([
 {label:'Filter',view:[16,.6,1.1,[0,3,0]],hint:'Drag the threshold. Keep what pokes above it.',tip:'Each tower is the Pearson correlation of a feature with sale price (house-price example). The glass plane is your threshold.',
  build(g,u){
   S.floor(g,16,16,0);let thr=.5;const bars=[];
   F.forEach((f,i)=>{const x=(i-2.5)*2.4;bars.push(tw(S,g,x,0,Math.max(f[1]*9,.15),C.teal,1.2));S.label(g,f[0],[x,-1,2],{size:.45});S.label(g,fx(f[1],2),[x,f[1]*9+.8,0],{size:.5,color:'#ffb400'});});
   const pl=S.plane(g,[0,thr*9,0],16,6,C.amber,{op:.25});
   const upd=()=>{pl.position.y=thr*9;const kept=F.filter(f=>f[1]>=thr);bars.forEach((b,i)=>b.material=S.mat(F[i][1]>=thr?C.teal:C.coral,F[i][1]>=thr?{emi:.3}:{op:.45}));
     u.out(kv([['Threshold',fx(thr,2)],['Kept',kept.length,'g'],['Removed',F.length-kept.length,'b']])+'<p>Kept: '+(kept.map(k=>k[0]).join(', ')||'none')+'.</p><p>No model was trained: every feature was scored on its own. That is why filters are fast, and why they cannot see two features that duplicate each other or help only in combination.</p>');};
   u.slider('Correlation threshold',0,1,.01,thr,v=>{thr=v;upd();},v=>fx(v,2));upd();
  }},
 {label:'Wrapper',view:[17,.7,1.0,[0,3,0]],hint:'Press Step to run one round of the search.',tip:'Five feature spheres at the front. Towers behind show the model score after each round. Every candidate subset needs a model trained, which is the cost.',
  build(g,u){
   S.floor(g,18,18,0);
   const names=['size','bedrooms','age','postcode','owner'],gain=[.25,.08,.06,.02,-.01];
   const score=sel=>{let a=.5;sel.forEach(i=>{let gg=gain[i];if(i===1&&sel.includes(0))gg*=.5;a+=gg;});return a;};
   const orbs=names.map((n,i)=>{const m=S.ball(g,[(i-2)*2.6,.6,5],.7,0x4a6a8a,{emi:.3});S.label(g,n,[(i-2)*2.6,-.9,5],{size:.45});return m;});
   let method='fwd',sel=[],models=0,hist=[],hb=[],done=false,rfeN=0;
   const paint=()=>orbs.forEach((m,i)=>m.material=S.mat(sel.includes(i)?C.teal:0x4a6a8a,{emi:.4}));
   const reset=()=>{hb.forEach(b=>g.remove(b));hb=[];hist=[];models=0;done=false;sel=method==='fwd'?[]:[0,1,2,3,4];paint();log('Start: '+(method==='fwd'?'no features':'all five features')+'. Press Step.');};
   const log=(t)=>u.out(kv([['Method',method==='fwd'?'forward selection':method==='bwd'?'backward elimination':'RFE'],['Models trained',models,models>8?'b':'a'],['All possible subsets',31],['Features kept',sel.length],['Score',fx(score(sel),2),'g']])+'<p>'+t+'</p>');
   const addBar=()=>{const s=score(sel);const m=tw(S,g,-6+hist.length*1.6,-3,(s-.4)*20,C.amber,1.0);hb.push(m);hist.push(s);};
   const step=()=>{if(done){log('Search finished. The result is tuned to this one model and may not carry to another.');return;}
    if(method==='fwd'){const rem=[0,1,2,3,4].filter(i=>!sel.includes(i));let best=-1,bs=-9;rem.forEach(i=>{const s=score(sel.concat(i));if(s>bs){bs=s;best=i;}});models+=rem.length;
      if(best<0||bs-score(sel)<.01){done=true;log('Adding any other feature gains less than 0.01, so selection stops. '+rem.length+' models were trained this round.');return;}
      sel.push(best);paint();addBar();log('Tried '+rem.length+' models, each adding one feature. Best addition: <b>'+names[best]+'</b>.');}
    else if(method==='bwd'){let best=-1,bs=-9;sel.forEach(i=>{const s=score(sel.filter(x=>x!==i));if(s>bs){bs=s;best=i;}});models+=sel.length;
      if(best<0||score(sel)-bs>.01){done=true;log('Removing any feature now costs more than 0.01, so elimination stops.');return;}
      sel=sel.filter(x=>x!==best);paint();addBar();log('Tried '+(sel.length+1)+' models, each dropping one feature. Dropped: <b>'+names[best]+'</b>, whose loss hurts least.');}
    else{models+=1;if(sel.length<=3){done=true;log('The target of 3 features remains.');return;}
      const imp=sel.map(i=>[i,Math.abs(gain[i])]);imp.sort((a,b)=>a[1]-b[1]);const drop=imp[0][0];sel=sel.filter(x=>x!==drop);paint();addBar();log('Trained on all current features, ranked by importance, removed the least important: <b>'+names[drop]+'</b>. Retrain and repeat.');}};
   const gm=u.g('Method');const bf=gm.btn('Forward selection',()=>{method='fwd';reset();},{toggle:true,on:true}),bb=gm.btn('Backward elimination',()=>{method='bwd';reset();},{toggle:true}),br=gm.btn('RFE',()=>{method='rfe';reset();},{toggle:true});
   [bf,bb,br].forEach(b=>b.addEventListener('click',()=>{u.press(bf,method==='fwd');u.press(bb,method==='bwd');u.press(br,method==='rfe');}));
   u.btn('Step',step,{pri:true});u.btn('Reset',reset);reset();
  }},
 {label:'Embedded (Lasso)',view:[16,.65,1.0,[0,3,0]],hint:'Raise the penalty and watch coefficients hit zero.',tip:'Bars are regression coefficients. The Lasso (L1) penalty shrinks each one by lambda and clips at zero. A coefficient of exactly zero means the feature is removed.',
  build(g,u){
   S.floor(g,16,16,0);const C0=[8,5,3,.8,.3,.1];const bars=[];let lam=0;
   F.forEach((f,i)=>{const x=(i-2.5)*2.4;bars.push(tw(S,g,x,0,C0[i],C.teal,1.2));S.label(g,f[0],[x,-1,2],{size:.45});});
   const bt=F.map((f,i)=>{const x=(i-2.5)*2.4;return tw(S,g,x,-3.4,[.55,.2,.12,.06,.04,.03][i]*14,C.violet,.9);});
   S.label(g,'Lasso coefficients (front)',[-8.5,.6,2.5],{size:.5,color:'#2ec4b6'});S.label(g,'tree importance (back)',[-8.5,.6,-3.4],{size:.5,color:'#8c7bff'});
   const upd=()=>{let kept=[];bars.forEach((b,i)=>{const v=Math.max(C0[i]-lam,0);setH(b,v);b.material=S.mat(v>0?C.teal:C.coral,{emi:.3});if(v>0)kept.push(F[i][0]);});
     u.out(kv([['Lambda (penalty)',fx(lam,1)],['Non-zero coefficients',kept.length,'g'],['Removed',6-kept.length,'b']])+'<p>Selected features: '+(kept.join(', ')||'none')+'.</p><p>This happened inside one training run, so there is no extra cost. Decision trees give a similar score for free: how often and how usefully a feature is used to split. Rarely used features (short violet bars) are the ones to drop.</p>');};
   u.slider('Penalty strength',0,9,.1,lam,v=>{lam=v;upd();},v=>fx(v,1));upd();
  }},
 {label:'Timing',view:[18,.55,.95,[0,0,0]],hint:'Press Play to run the three timelines.',tip:'Time runs left to right. Amber blocks are selection work, teal blocks are model training.',
  build(g,u){
   S.floor(g,24,12,-.2);const rows=[['Filter',3],['Wrapper',-0.5],['Embedded',-4]];
   rows.forEach(r=>S.label(g,r[0],[-12.5,0.8,r[1]],{size:.7}));
   S.cube(g,[-9,.4,3],[2.6,.8,1.6],C.amber);S.cube(g,[-6,.4,3],[3.6,.8,1.6],C.teal);S.label(g,'score',[-9,1.4,3],{size:.4});S.label(g,'train',[-6,1.4,3],{size:.4});
   for(let i=0;i<5;i++){S.cube(g,[-9+i*2.6,.4,-.5],[1.2,.8,1.6],C.teal);S.cube(g,[-8+i*2.6,.4,-.5],[.5,.8,1.6],C.amber);}
   S.label(g,'subset 1',[-9,1.4,-.5],{size:.35});S.label(g,'subset 2',[-6.4,1.4,-.5],{size:.35});S.label(g,'... many models',[1.6,1.4,-.5],{size:.4});
   S.cube(g,[-6,.4,-4],[7,.8,1.6],C.teal);S.cube(g,[-6,.9,-4],[7,.18,1.62],C.amber);S.label(g,'train + select together',[-6,1.7,-4],{size:.4});
   const ph=S.cube(g,[-12,1.6,0],[.15,3.2,10],C.white,{basic:true});let t=0,run=false;
   u.btn('Play',()=>{t=0;run=true;},{pri:true});
   S.tick(dt=>{if(!run)return;t+=dt*.25;ph.position.x=-12+t*21;if(t>1){run=false;}});
   u.out('<p><b>Filter</b> selects before training. <b>Wrapper</b> repeats train-and-score around many subsets, which is long. <b>Embedded</b> selects while it trains, in one run. Cost rises as the model gets more involved in the selection, and so does fit to that particular model.</p>');
  }}
 ]);
};

SC.a423=function(S){
 S.modes([
 {label:'Sparsity',view:[17,.8,1.05,[0,2.5,0]],hint:'Press 1D, 2D, 3D. Same 27 points each time.',tip:'The same 27 points on a line, a square and a cube. The grid has 3 divisions per axis, so 3, 9 and 27 cells. Count how many cells hold a point.',
  build(g,u){
   const r=rng(33);const pts=[];for(let i=0;i<27;i++)pts.push([r(),r(),r()]);
   const balls=pts.map(()=>S.ball(g,[0,0,0],.3,C.amber,{emi:.4}));
   let frame=null;let dim=1;
   const posOf=(p,d)=>[(p[0]*8-4),d>=3?p[2]*8:(d>=2?0:0)+.5,d>=2?(p[1]*8-4):0].map((v,i)=>v);
   const place=(d)=>{const to=pts.map(p=>[p[0]*8-4,d>=3?p[2]*8:.4,d>=2?p[1]*8-4:0]);const from=balls.map(b=>b.position.clone());
    S.anim(800,t=>balls.forEach((b,i)=>b.position.set(lerp(from[i].x,to[i][0],ease(t)),lerp(from[i].y,to[i][1],ease(t)),lerp(from[i].z,to[i][2],ease(t)))));
    if(frame)g.remove(frame);const e=[];const A=-4,B=4;
    if(d===1)e.push([[A,.4,0],[B,.4,0]]);
    if(d===2){e.push([[A,.4,A],[B,.4,A]],[[B,.4,A],[B,.4,B]],[[B,.4,B],[A,.4,B]],[[A,.4,B],[A,.4,A]]);}
    if(d===3){const c=[[A,0,A],[B,0,A],[B,0,B],[A,0,B],[A,8,A],[B,8,A],[B,8,B],[A,8,B]];[[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]].forEach(k=>e.push([c[k[0]],c[k[1]]]));}
    frame=S.segs(g,e,0x6b8299,.9);
    const cells=Math.pow(3,d);const occ=new Set(pts.map(p=>[0,1,2].slice(0,d).map(k=>Math.min(2,Math.floor(p[k]*3))).join(',')));
    const dd=d===3?pts.map(p=>p):pts;
    u.out(kv([['Dimensions',d],['Cells',cells],['Cells holding a point',occ.size,occ.size/cells<.5?'b':'g'],['Empty',fx(100*(1-occ.size/cells),0)+'%',occ.size/cells<.5?'b':'g']])+'<p>The volume grows far faster than the points can fill it. In high dimensions almost every region is empty, so there are no meaningful neighbourhoods for an algorithm to learn from.</p>');};
   const gp=u.g('Dimensions');gp.btn('1D line',()=>place(1),{pri:true});gp.btn('2D square',()=>place(2));gp.btn('3D cube',()=>place(3));
   place(1);
  }},
 {label:'Distances',view:[17,.6,1.05,[0,3,0]],hint:'Slide the dimension count from 1 to 200.',tip:'60 random points in the unit hypercube. Bars show how many points sit at each distance from one query point. Watch the spread collapse.',
  build(g,u){
   S.floor(g,18,12,0);let d=2;const bins=[];const NB=24;for(let i=0;i<NB;i++)bins.push(tw(S,g,-8.6+i*.75,0,.1,C.teal,.6));
   const nb=tw(S,g,-3,5,1,C.amber,1.4),fb=tw(S,g,3,5,1,C.coral,1.4);S.label(g,'nearest',[-3,-.8,5],{size:.5});S.label(g,'furthest',[3,-.8,5],{size:.5});
   S.label(g,'distance from query point →',[0,-1,2.6],{size:.5,color:'#9db2c7'});
   const gen=()=>{const r=rng(5);const P=[];for(let i=0;i<60;i++){const v=[];for(let k=0;k<d;k++)v.push(r());P.push(v);}const q=P[0];const ds=P.slice(1).map(p=>Math.sqrt(p.reduce((s,x,k)=>s+(x-q[k])**2,0)));return ds;};
   const upd=()=>{const ds=gen();const mx=Math.sqrt(d),mn=Math.min(...ds),fr=Math.max(...ds);const cnt=new Array(NB).fill(0);ds.forEach(x=>cnt[Math.min(NB-1,Math.floor(x/mx*NB))]++);
    bins.forEach((b,i)=>setH(b,cnt[i]*.45));setH(nb,mn/mx*10+.1);setH(fb,fr/mx*10+.1);
    u.out(kv([['Dimensions',d],['Nearest',fx(mn,2),'a'],['Furthest',fx(fr,2),'b'],['Nearest / furthest',fx(mn/fr,2),mn/fr>.6?'b':'g']])+'<p>'+(d<4?'In few dimensions the nearest point is much closer than the furthest, so "nearest neighbour" means something.':'The ratio is heading towards 1: every point looks about equally far away. A k-NN or k-means algorithm can no longer tell similar from dissimilar. The only fix is fewer dimensions.')+'</p>');};
   u.slider('Number of dimensions',1,200,1,d,v=>{d=v;upd();});upd();
  }},
 {label:'Seven considerations',view:[21,.95,1.0,[0,3.5,0]],hint:'Click an orb to read it. A curve shows how it grows with dimensions.',tip:'Seven orbs, one per consideration in the syllabus. The glowing curve is an illustrative picture of how the problem grows as dimensions increase.',
  build(g,u){
   const D=[['Data sparsity','Points spread further apart as dimensions increase and most space holds no data.','No meaningful local neighbourhoods.',d=>1-Math.exp(-d/18)],
    ['Overfitting','Many features give the model excess flexibility, so it memorises coincidences.','High training accuracy, poor on new data.',d=>1-Math.exp(-d/25)],
    ['Computational complexity','Every feature adds calculations to each training step.','Training time rises sharply: seconds, then hours, then days.',d=>Math.min(1,d*d/2500)],
    ['Effectiveness of distance metrics','Nearest and furthest distances converge, so all points look equidistant.','k-NN, k-means and SVMs cannot tell near from far.',d=>1-1/(1+d/12)],
    ['Data visualisation','Data beyond three dimensions cannot be plotted directly.','Exploration and debugging get harder; patterns stay hidden.',d=>d<=3?0.05:1],
    ['Sample size increases','The examples needed for density grow exponentially.','Real datasets cannot grow to match, so models run on too little data.',d=>Math.min(1,Math.pow(2,d/4)/256)],
    ['Memory usage','Memory scales with examples times features, and operations need working memory too.','Data may exceed RAM, forcing slow disk or limiting model choice.',d=>Math.min(1,d/50)]];
   const orbs=[];const cc=[C.teal,C.amber,C.coral,C.violet,C.sky,C.lime,0xffffff];
   D.forEach((x,i)=>{const a=i/7*Math.PI*2;const o=S.ball(g,[Math.cos(a)*6,0,Math.sin(a)*6],.9,cc[i],{emi:.4});o.userData.i=i;orbs.push(o);S.label(g,x[0],[Math.cos(a)*6,1.6,Math.sin(a)*6],{size:.5});});
   S.ball(g,[0,0,0],1.2,0x24384c,{emi:.3});S.label(g,'high-dimensional data',[0,0,0],{size:.45});
   let curve=null,sel=-1;
   const show=i=>{sel=i;orbs.forEach((o,k)=>o.scale.setScalar(k===i?1.4:.9));if(curve)g.remove(curve);const pts=[];for(let d=1;d<=50;d++)pts.push([-3+d*.12,3.6+D[i][3](d)*5,0]);curve=new THREE.Group();g.add(curve);
     S.line(curve,pts,cc[i]);S.bar(curve,[-3,3.6,0],[3.2,3.6,0],.03,0x6b8299);S.bar(curve,[-3,3.6,0],[-3,8.8,0],.03,0x6b8299);S.label(curve,'dimensions →',[0,3,0],{size:.4});S.label(curve,'problem size',[-3.2,9.4,0],{size:.4});
     u.out('<p><b>'+D[i][0]+'.</b> '+D[i][1]+'</p><p><b>Impact:</b> '+D[i][2]+'</p>');};
   S.onPick(orbs,o=>show(o.userData.i));show(0);
  }},
 {label:'Selection vs reduction',view:[20,.7,1.0,[0,3,0]],hint:'Press each button, then reset.',tip:'Left: feature selection keeps original columns. Right: dimensionality reduction merges four correlated columns into one new composite column.',
  build(g,u){
   S.floor(g,24,14,0);
   const A=[['size',6,C.teal,1],['bedrooms',5,C.sky,1],['age',3,C.lime,1],['listing_ref',.5,C.coral,0],['prev_owner',.4,C.coral,0]];
   const L=A.map((a,i)=>{const m=tw(S,g,-10+i*1.8,0,a[1],a[2],1.1);S.label(g,a[0],[-10+i*1.8,-.8,1.8],{size:.38});return m;});
   S.label(g,'5 original features',[-6,9,0],{size:.55});
   const B=[['height',7],['weight',6],['arm span',6.5],['leg length',5.5]];const R=B.map((a,i)=>{const m=tw(S,g,3+i*1.8,0,a[1],C.violet,1.1);S.label(g,a[0],[3+i*1.8,-.8,1.8],{size:.38});return m;});
   S.label(g,'4 correlated features',[6,9,0],{size:.55});
   let comp=null;
   const sel=()=>{L.forEach((m,i)=>{if(!A[i][3])S.anim(600,t=>{m.position.y=lerp(m.scale.y/2,-3,ease(t));m.material=S.mat(C.coral,{op:1-t*.8});});});u.out('<p><b>Feature selection:</b> three original columns are kept unchanged and keep their meaning. Two are discarded.</p>');};
   const red=()=>{R.forEach((m,i)=>S.anim(900,t=>{m.position.x=lerp(3+i*1.8,7.4,ease(t));m.material=S.mat(C.violet,{op:1-t*.85});}));
     setTimeout(()=>{if(!comp)comp=tw(S,g,7.4,0,.1,C.amber,1.5);S.anim(700,t=>setH(comp,lerp(.1,8,ease(t))));S.label(g,'body_size (new composite)',[7.4,9,0],{size:.5,color:'#ffb400'});},900);
     u.out('<p><b>Dimensionality reduction:</b> the four original columns no longer exist. They are combined into one new composite feature that holds most of the information. It may not have an intuitive real-world meaning.</p>');};
   u.btn('Feature selection',sel,{pri:true});u.btn('Dimensionality reduction',red,{pri:true});
   u.btn('Reset',()=>{setMode_(S);});
   function setMode_(S){S.setMode(S.mi);}
   u.out('<p>Press a button to compare the two approaches.</p>');
  }}
 ]);
};
