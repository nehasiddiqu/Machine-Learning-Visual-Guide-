/* ===== scenes: A4.3.6 to A4.3.10 ===== */
const runAnim=(S,ms,fn)=>new Promise(res=>S.anim(ms,fn,res));

/* ---------- A4.3.6 Reinforcement learning ---------- */
SC.a436=function(S){
 S.modes([
 {label:'Maze learner',view:[17,.62,1.0,[0,0,0]],hint:'Train, then send the robot.',tip:'Grey blocks are walls. The amber cell is the goal (+1), the coral cell is a pit (-1). Every step costs a little. Green arrows show the policy the agent has learned so far; taller tiles have a higher learned value.',
  build(g,u){
   const W=6,SZ=1.7,wall=new Set(['1,1','1,2','1,3','3,2','3,3','3,4']),pit='4,1',GOAL=5*W+5;
   const P=(cx,cy)=>[(cx-2.5)*SZ,0,(cy-2.5)*SZ];
   const tiles=[];const Q=new Array(W*W*4).fill(0);const rr=rng(5);
   for(let cy=0;cy<W;cy++)for(let cx=0;cx<W;cx++){const k=cx+','+cy,p=P(cx,cy);
     if(wall.has(k)){S.cube(g,[p[0],.7,p[2]],[SZ*.92,1.4,SZ*.92],0x4a6a8a);tiles.push(null);continue;}
     const col=(cy*W+cx)===GOAL?C.amber:k===pit?C.coral:0x24384c;
     tiles.push(S.cube(g,[p[0],.08,p[2]],[SZ*.92,.16,SZ*.92],col,{emi:col===0x24384c?0:.5}));}
   S.label(g,'Start',[P(0,0)[0],1.2,P(0,0)[2]],{size:.5,color:'#52da9f'});S.label(g,'Goal +1',[P(5,5)[0],1.4,P(5,5)[2]],{size:.5,color:'#ffb400'});S.label(g,'Pit -1',[P(4,1)[0],1.4,P(4,1)[2]],{size:.5,color:'#ff8093'});
   const robot=S.ball(g,[P(0,0)[0],.7,P(0,0)[2]],.4,C.white,{emi:.4});
   let gp=null,eps=.3,episodes=0,lastR=0,busy=false;
   const DX=[0,1,0,-1],DY=[-1,0,1,0];
   const step=(s,a)=>{const cx=s%W,cy=Math.floor(s/W),nx=cx+DX[a],ny=cy+DY[a];
     if(nx<0||ny<0||nx>=W||ny>=W||wall.has(nx+','+ny))return{ns:s,r:-.1,d:false};
     const ns=ny*W+nx;if(ns===GOAL)return{ns,r:1,d:true};if(nx+','+ny===pit)return{ns,r:-1,d:true};return{ns,r:-.04,d:false};};
   const best=s=>{let b=0;for(let a=1;a<4;a++)if(Q[s*4+a]>Q[s*4+b]+1e-9)b=a;return b;};
   const mx=s=>Math.max(Q[s*4],Q[s*4+1],Q[s*4+2],Q[s*4+3]);
   const episode=()=>{let s=0,tot=0;for(let t=0;t<80;t++){const a=rr()<eps?Math.floor(rr()*4):best(s);const o=step(s,a);
       Q[s*4+a]+=.5*(o.r+.95*(o.d?0:mx(o.ns))-Q[s*4+a]);s=o.ns;tot+=o.r;if(o.d)break;}episodes++;lastR=tot;};
   const greedy=()=>{let s=0;const path=[0];for(let t=0;t<40;t++){const o=step(s,best(s));s=o.ns;path.push(s);if(o.d)break;}return{path,ok:s===GOAL};};
   const draw=()=>{if(gp)g.remove(gp);gp=new THREE.Group();g.add(gp);
     for(let s=0;s<W*W;s++){const cx=s%W,cy=Math.floor(s/W);if(wall.has(cx+','+cy)||s===GOAL||(cx+','+cy)===pit)continue;
       const m=mx(s);const t=tiles[s];if(t){const hh=.16+Math.max(0,m)*.9;t.scale.y=hh;t.position.y=hh/2;}
       if(Math.abs(m)<1e-6&&Q[s*4]===0&&Q[s*4+1]===0&&Q[s*4+2]===0&&Q[s*4+3]===0)continue;
       const a=best(s),p=P(cx,cy),y=.16+Math.max(0,m)*.9+.2;
       S.arrow(gp,[p[0]-DX[a]*.4,y,p[2]-DY[a]*.4],[p[0]+DX[a]*.45,y,p[2]+DY[a]*.45],C.lime,.07,{emi:.5});}
     const gr=greedy();
     u.out(kv([['Episodes trained',episodes],['Exploration rate',Math.round(eps*100)+'%'],['Greedy route',gr.ok?gr.path.length-1+' steps':'not reaching goal',gr.ok?'g':'b'],['Last episode reward',fx(lastR,2),lastR>0?'g':'a']])+'<p>The agent was never told the route. It tried actions, received rewards and adjusted its policy (the arrows). Shortest possible route: 10 steps. '+(eps===0?'With no exploration the agent only repeats what looks best so far, so it can settle on a poor or even failing route.':eps>=.8?'With very high exploration the agent mostly acts randomly, so progress is slow.':'A moderate exploration rate lets it try alternatives while mostly using what it has learned.')+'</p>');};
   const train=n=>{for(let i=0;i<n;i++)episode();draw();};
   u.btn('Train (+25 episodes)',()=>train(25),{pri:true});u.btn('Train (+200)',()=>train(200));
   u.slider('Exploration rate',0,1,.05,eps,v=>{eps=v;draw();},v=>Math.round(v*100)+'%');
   u.btn('Send robot',async()=>{if(busy)return;busy=true;const gr=greedy();const pts=gr.path.map(s=>P(s%W,Math.floor(s/W)));
     await runAnim(S,Math.max(600,pts.length*260),t=>{const f=t*(pts.length-1),i=Math.min(pts.length-2,Math.floor(f)),q=f-i;const A=pts[i],B=pts[i+1];robot.position.set(lerp(A[0],B[0],q),.7,lerp(A[2],B[2],q));});busy=false;});
   u.btn('Reset learning',()=>{Q.fill(0);episodes=0;lastR=0;robot.position.set(P(0,0)[0],.7,P(0,0)[2]);draw();});
   draw();u.out(kv([['Episodes trained',0]])+'<p>Press <b>Train</b>. Each episode is one attempt at the maze.</p>');
  }},
 {label:'Explore or exploit',view:[16,.7,1.0,[0,2.5,0]],hint:'Pull, or let a strategy play.',tip:'Three restaurants with hidden average ratings. Tower height is what the agent currently believes. Reveal the truth to see whether its strategy found the best one.',
  build(g,u){
   const R=[{n:'Old favourite',mu:3.2,c:C.amber},{n:'New place',mu:4.4,c:C.teal},{n:'Fast food',mu:2.2,c:C.coral}];
   S.floor(g,18,18,0);
   let rr,est,cnt,total,pulls,reveal=false,eps=.15,auto=false;
   const tow=R.map((r,i)=>tw(S,g,(i-1)*5,0,.1,r.c,2.2));const ghost=R.map((r,i)=>S.cube(g,[(i-1)*5,r.mu*.7,0],[2.5,r.mu*1.4,2.5],0xffffff,{op:.12}));
   const nl=R.map((r,i)=>S.label(g,r.n,[(i-1)*5,-.9,3.2],{size:.55}));const vl=R.map((r,i)=>S.label(g,'',[(i-1)*5,6.4,0],{size:.5,color:'#ffffff'}));
   const reset=()=>{rr=rng(11);est=[0,0,0];cnt=[0,0,0];total=0;pulls=0;upd();};
   const pull=i=>{const rw=clamp(R[i].mu+nrm(rr)*.8,0,5);cnt[i]++;est[i]+=(rw-est[i])/cnt[i];total+=rw;pulls++;upd();};
   const pick=()=>{if(rr()<eps)return Math.floor(rr()*3);let b=0;for(let i=1;i<3;i++)if(est[i]>est[b])b=i;return b;};
   const upd=()=>{R.forEach((r,i)=>{setH(tow[i],est[i]*1.4);vl[i].position.set((i-1)*5,est[i]*1.4+1.2,0);vl[i].userData.setText(cnt[i]?fx(est[i],1)+'  ('+cnt[i]+' visits)':'unknown');ghost[i].visible=reveal;});
     u.out(kv([['Visits',pulls],['Total reward',fx(total,1)],['Average per visit',pulls?fx(total/pulls,2):'-',pulls&&total/pulls>3.7?'g':'a'],['Best true rating',fx(4.4,1)+' (New place)']])+'<p>'+(eps===0?'<b>Exploit only:</b> after the first lucky rating the agent keeps returning to one place and never learns whether another is better.':eps===1?'<b>Explore only:</b> it samples all three equally but never uses what it learned, so its average stays near the mean of all three.':'<b>Balanced:</b> mostly picks the best-known restaurant but sometimes tries others, so it can discover the best one and then keep using it.')+' Reward arrives after each choice. No labelled data exists.</p>');};
   R.forEach((r,i)=>u.btn('Visit '+r.n,()=>pull(i)));
   u.sel('Strategy',[['0','Exploit only'],['1','Explore only'],['.15','Balanced (explore 15%)']],'.15',v=>{eps=+v;upd();});
   const ab=u.btn('Auto play',()=>{auto=!auto;ab.textContent=auto?'Pause':'Auto play';},{pri:true});
   u.toggle('Reveal true ratings',false,v=>{reveal=v;upd();});u.btn('Reset',()=>{reset();});
   S.every(130,()=>{if(auto&&pulls<300)pull(pick());});
   reset();
  }}
 ]);
};

/* ---------- A4.3.7 Genetic algorithms ---------- */
SC.a437=function(S){
 const N=12;
 const cityPos=seed=>{const r=rng(seed);return Array.from({length:N},()=>[(r()*2-1)*7.5,0,(r()*2-1)*5.5]);};
 const tlen=(c,t)=>{let d=0;for(let i=0;i<t.length;i++){const a=c[t[i]],b=c[t[(i+1)%t.length]];d+=Math.hypot(a[0]-b[0],a[2]-b[2]);}return d;};
 const shuffle=(a,r)=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
 const ox=(p1,p2,i,j)=>{const ch=new Array(p1.length).fill(-1);for(let k=i;k<=j;k++)ch[k]=p1[k];let pos=(j+1)%p1.length;for(let k=0;k<p2.length;k++){const v=p2[(j+1+k)%p2.length];if(!ch.includes(v)){ch[pos]=v;pos=(pos+1)%p1.length;}}return ch;};
 S.modes([
 {label:'Evolve a route',view:[20,.62,1.0,[0,0,-2]],hint:'Run, then compare with mutation 0.',tip:'Spheres are cities (the green square is home). The amber tour is the best route found so far, raised above the board. Faint tours are other members of the population. The towers at the back show the best distance falling.',
  build(g,u){
   S.floor(g,20,20,0);
   let seed=4,cities,r,pop,gen,best0,bestD,hist,mut=.15,run=false,done=false,stale=0,lines,bestLine,towers=[],cityMeshes=[];
   const POP=40,GMAX=80;
   const cityObjs=new THREE.Group();g.add(cityObjs);
   const mkTowers=()=>{towers.forEach(t=>g.remove(t));towers=[];for(let i=0;i<40;i++)towers.push(tw(S,g,-7.8+i*.4,-9.5,.05,C.sky,.3,{emi:.3}));};
   const loop=t=>t.concat([t[0]]).map(i=>[cities[i][0],0,cities[i][2]]);
   const init=()=>{cities=cityPos(seed);r=rng(seed*7+1);pop=Array.from({length:POP},()=>shuffle([...Array(N).keys()],r));gen=0;stale=0;done=false;
     pop.sort((a,b)=>tlen(cities,a)-tlen(cities,b));bestD=tlen(cities,pop[0]);best0=bestD;hist=[bestD];
     g.remove(cityObjs);cityObjs.clear&&cityObjs.clear();while(cityObjs.children.length)cityObjs.remove(cityObjs.children[0]);g.add(cityObjs);
     cities.forEach((c,i)=>{if(i===0)S.cube(cityObjs,[c[0],.3,c[2]],.7,C.lime,{emi:.6});else S.ball(cityObjs,[c[0],.3,c[2]],.3,C.amber,{emi:.4});});
     if(lines)lines.forEach(l=>g.remove(l));if(bestLine)g.remove(bestLine);
     lines=[];for(let i=0;i<7;i++)lines.push(S.line(g,loop(pop[0]),0x8aa0b4,.28));
     bestLine=S.line(g,loop(pop[0]),C.amber,1);mkTowers();draw();};
   const draw=()=>{const bl=loop(pop[0]).map(p=>[p[0],1.4,p[2]]);S.setLine(bestLine,bl);
     lines.forEach((l,i)=>{const t=pop[6+i*5<POP?6+i*5:POP-1];S.setLine(l,loop(t).map(p=>[p[0],.15,p[2]]));});
     const mxd=hist[0];towers.forEach((t,i)=>{const d=hist[Math.min(hist.length-1,i*2)];setH(t,i*2<=gen?d/mxd*3.2:.05);});
     const imp=(1-bestD/best0)*100;
     u.out(kv([['Generation',gen+' / '+GMAX],['Best distance',fx(bestD*40,0)+' km','g'],['Random start',fx(best0*40,0)+' km'],['Improvement',fx(imp,0)+'%',imp>20?'g':'a'],['Mutation rate',Math.round(mut*100)+'%']])+'<p>'+(done?'<b>Termination:</b> the generation limit or lack of improvement stopped the run. The result is a near-optimal route, not a guaranteed best. Twelve cities have almost 20 million possible orders and the GA checked only a few thousand.':'Each generation: <b>selection</b> keeps short routes as parents, <b>crossover</b> mixes two parents, <b>mutation</b> swaps two cities in a child. Fitness = 1 / distance.')+'</p>');};
   const evolve=()=>{if(done)return;const next=[pop[0],pop[1]];
     const pickP=()=>{let b=null;for(let k=0;k<3;k++){const c=pop[Math.floor(r()*POP*.6)];if(!b||tlen(cities,c)<tlen(cities,b))b=c;}return b;};
     while(next.length<POP){const a=pickP(),b=pickP();const i=1+Math.floor(r()*(N-4)),j=i+1+Math.floor(r()*(N-i-2));let ch=ox(a,b,i,j);
       if(r()<mut*3){const x=Math.floor(r()*N),y=Math.floor(r()*N);[ch[x],ch[y]]=[ch[y],ch[x]];}next.push(ch);}
     pop=next.sort((a,b)=>tlen(cities,a)-tlen(cities,b));const nd=tlen(cities,pop[0]);if(nd<bestD-1e-6){stale=0;}else stale++;bestD=nd;gen++;hist.push(bestD);
     if(gen>=GMAX||stale>=35)done=true;draw();};
   const rb=u.btn('Run',()=>{run=!run;rb.textContent=run?'Pause':'Run';},{pri:true});
   u.btn('Step',()=>evolve());u.btn('New cities',()=>{seed=Math.floor(Math.random()*900)+1;run=false;rb.textContent='Run';init();});
   u.btn('Restart same cities',()=>{run=false;rb.textContent='Run';init();});
   u.slider('Mutation rate',0,.5,.05,mut,v=>{mut=v;draw();},v=>Math.round(v*100)+'%');
   S.every(140,()=>{if(run&&!done)evolve();});
   init();
  }},
 {label:'Crossover and mutation',view:[17,.7,1.0,[0,1.5,0]],hint:'Press the buttons in order.',tip:'Each row is one route; each cube is a city. Teal row: parent A. Violet row: parent B. The front row is the child. A route must visit each city exactly once.',
  build(g,u){
   const L=8,nm='ABCDEFGH',X=i=>(i-3.5)*2.2,Z=[-5,0,5.2];
   const rows=[0,1,2].map(ri=>{const cs=[],ls=[];for(let i=0;i<L;i++){cs.push(S.cube(g,[X(i),.6,Z[ri]],[1.7,1.2,1.7],0x24384c));ls.push(S.label(g,'',[X(i),1.9,Z[ri]],{size:.7,color:'#ffffff'}));}return{cs,ls};});
   S.label(g,'Parent A',[-11.5,.8,Z[0]],{size:.55,color:'#2ec4b6'});S.label(g,'Parent B',[-11.5,.8,Z[1]],{size:.55,color:'#8c7bff'});S.label(g,'Child',[-11.5,.8,Z[2]],{size:.55,color:'#ffb400'});
   let A,B,child=null,src=null,sw=null,seg=null,segBars=[];const r=Math.random;
   const sh=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
   const paint=(row,arr,cols)=>row.cs.forEach((c,i)=>{if(arr){c.material=S.mat(cols[i],{emi:.3});row.ls[i].userData.setText(nm[arr[i]],'#ffffff');}else{c.material=S.mat(0x24384c);row.ls[i].userData.setText('?','#6b8299');}});
   const str=a=>a?a.map(i=>nm[i]).join(' '):'-';
   const show=t=>u.out(kv([['Parent A',str(A)],['Parent B',str(B)],['Child',str(child)]])+'<p>'+t+'</p>');
   const newP=()=>{A=sh([...Array(L).keys()]);B=sh([...Array(L).keys()]);child=null;src=null;sw=null;segBars.forEach(b=>g.remove(b));segBars=[];paint(rows[0],A,A.map(()=>C.teal));paint(rows[1],B,B.map(()=>C.violet));paint(rows[2],null);show('Two parent routes (the selected fittest solutions). Press <b>Crossover</b>.');};
   const cross=()=>{const i=1+Math.floor(r()*2),j=i+2+Math.floor(r()*2);seg=[i,j];child=new Array(L).fill(-1);src=new Array(L).fill('b');for(let k=i;k<=j;k++){child[k]=A[k];src[k]='a';}
     let pos=(j+1)%L;for(let k=0;k<L;k++){const v=B[(j+1+k)%L];if(!child.includes(v)){child[pos]=v;pos=(pos+1)%L;}}
     paint(rows[2],child,child.map((_,k)=>src[k]==='a'?C.teal:C.violet));segBars.forEach(b=>g.remove(b));segBars=[S.bar(g,[X(i)-.8,2.6,Z[0]],[X(j)+.8,2.6,Z[0]],.06,C.teal),S.bar(g,[X(i)-.8,2.6,Z[2]],[X(j)+.8,2.6,Z[2]],.06,C.teal)];
     show('<b>Crossover:</b> the child copies the teal stretch from parent A, then fills the remaining positions with the other cities in the order they appear in parent B (violet). It inherits from <b>both</b> parents and still visits every city once.');};
   const mutate=()=>{if(!child){show('Do <b>Crossover</b> first so there is a child to mutate.');return;}const p=Math.floor(r()*L);let q=Math.floor(r()*L);if(q===p)q=(p+1)%L;[child[p],child[q]]=[child[q],child[p]];
     paint(rows[2],child,child.map((_,k)=>(k===p||k===q)?C.coral:(src[k]==='a'?C.teal:C.violet)));const a=rows[2].cs[p],b=rows[2].cs[q];S.anim(450,t=>{a.position.y=.6+Math.sin(t*Math.PI)*1.2;b.position.y=.6+Math.sin(t*Math.PI)*1.2;});
     show('<b>Mutation:</b> two cities in <b>this one child</b> swapped places (coral). It is a small random change that keeps variety in the population. Crossover mixes two solutions; mutation alters one.');};
   u.btn('New parents',newP);u.btn('Crossover',cross,{pri:true});u.btn('Mutate the child',mutate);
   newP();
  }},
 {label:'The seven stages',view:[25,.8,1.0,[3,0,0]],hint:'Click a stage, or run one generation.',tip:'Six stages form the loop. Termination sits beside Evaluation because it is the check made after each evaluation. Click any block to read what happens and how it maps onto the travelling salesperson problem.',
  build(g,u){
   const ST=[['Population','A set of candidate solutions, generated at random. Each member is one complete possible answer.','About 100 random orders of visiting the cities.',C.sky],
    ['Fitness function','The rule that scores a solution; a better solution scores higher.','Fitness = 1 / total route distance.',C.teal],
    ['Evaluation','Apply the fitness function to every member of the population.','Score every route in the population.',C.lime],
    ['Selection','Choose the fittest members as parents ("survival of the fittest").','Pick the shortest routes as parents.',C.amber],
    ['Crossover','Combine parts of two parents to create a child that inherits from both.','Take part of one route and part of another.',C.violet],
    ['Mutation','A small random change to a child; keeps variety and avoids settling too early.','Swap the order of two cities.',C.coral],
    ['Termination','The stopping rule: a fixed number of generations or no further improvement. The best solution found is the answer.','Stop when the best route stops improving or a generation limit is reached.',0xe8f1f8]];
   const R=7.2,pos=i=>{const a=-Math.PI/2+i*2*Math.PI/6;return[Math.cos(a)*R,.7,Math.sin(a)*R];};
   const cs=[];ST.forEach((s,i)=>{const p=i<6?pos(i):(q=>[q[0]*1.6,.7,q[2]*1.6])(pos(2));const c=S.cube(g,p,[2.7,1.3,2.7],s[3],{emi:.25});c.userData={i,c:s[3]};cs.push(c);S.label(g,(i+1)+'. '+s[0],[p[0],2.2,p[2]],{size:.6});});
   S.floor(g,22,22,0);
   for(let i=0;i<5;i++){const a=pos(i),b=pos(i+1),d=[b[0]-a[0],0,b[2]-a[2]],L=Math.hypot(d[0],d[2]);const n=[d[0]/L,d[2]/L];S.arrow(g,[a[0]+n[0]*1.9,.7,a[2]+n[1]*1.9],[b[0]-n[0]*1.9,.7,b[2]-n[1]*1.9],0x6b8299,.08);}
   {const a=pos(5),b=pos(2),d=[b[0]-a[0],b[2]-a[2]],L=Math.hypot(d[0],d[1]);S.arrow(g,[a[0]+d[0]/L*1.9,1.6,a[2]+d[1]/L*1.9],[b[0]-d[0]/L*1.9,1.6,b[2]-d[1]/L*1.9],C.coral,.09);S.label(g,'new generation: repeat',[0,2.6,R*.15],{size:.5,color:'#ff8093'});}
   {const a=pos(2);S.arrow(g,[a[0]*1.22,.7,a[2]*1.22],[a[0]*1.36,.7,a[2]*1.36],C.lime,.08);S.label(g,'stop?',[a[0]*1.3,1.6,a[2]*1.3],{size:.45,color:'#a6e22e'});}
   const hl=i=>cs.forEach((c,j)=>c.material=S.mat(c.userData.c,{emi:j===i?.95:.25}));
   const info=i=>{hl(i);const s=ST[i];u.out('<p><b>'+(i+1)+'. '+s[0]+'.</b> '+s[1]+'</p><p><b>Travelling salesperson:</b> '+s[2]+'</p>');};
   S.onPick(cs,o=>info(o.userData.i));
   let busy=false;const mk=S.ball(g,pos(0),.38,C.white,{basic:true});mk.position.y=2;
   u.btn('Run one generation',async()=>{if(busy)return;busy=true;const path=[0,1,2,3,4,5,2];for(let k=0;k<path.length;k++){info(path[k]);const a=k?pos(path[k-1]):pos(0),b=pos(path[k]);await runAnim(S,650,t=>mk.position.set(lerp(a[0],b[0],ease(t)),2.2,lerp(a[2],b[2],ease(t))));}
     info(6);busy=false;},{pri:true});
   u.out('<p>Click any block to read its job.</p>');
  }}
 ]);
};

/* ---------- A4.3.8 Artificial neural networks ---------- */
SC.a438=function(S){
 S.modes([
 {label:'Perceptron',view:[18,.55,1.15,[0,2.5,0]],hint:'Change inputs, weights and bias.',tip:'Left spheres: inputs (size shows value). Bar thickness shows weight size: teal is positive, coral is negative. The big sphere sums the weighted inputs and bias; the activation function turns the sum into the output on the right.',
  build(g,u){
   let x=[.8,.3,.6],w=[1.2,-.8,.5],b=-.2,act='sigmoid';
   const iy=[5,2.5,0];const ins=[],bars=[],wl=[],il=[];
   for(let i=0;i<3;i++){ins.push(S.ball(g,[-8,iy[i],0],.6,C.sky,{emi:.4}));il.push(S.label(g,'',[-9.8,iy[i],0],{size:.55}));bars.push(S.bar(g,[-8,iy[i],0],[-.4,2.5,0],.06,C.teal));wl.push(S.label(g,'',[-4.2,(iy[i]+2.5)/2+.9-(i===1?.2:0),0],{size:.5,color:'#ffb400'}));}
   const neu=S.ball(g,[0,2.5,0],1.3,C.violet,{emi:.4});S.label(g,'Sum + activation',[0,4.6,0],{size:.5});
   const bs=S.ball(g,[0,7,0],.5,C.amber,{emi:.5});const bb=S.bar(g,[0,7,0],[0,3.8,0],.05,C.amber);const bl=S.label(g,'',[1.9,7,0],{size:.5,color:'#ffb400'});
   const outB=S.bar(g,[1.4,2.5,0],[7,2.5,0],.05,0x6b8299);const out=S.cube(g,[8,.1,0],[1.4,.2,1.4],C.lime,{emi:.4});const ol=S.label(g,'',[8,6,0],{size:.6});S.label(g,'Output',[8,-.9,0],{size:.5});
   S.floor(g,22,22,0);
   const A={sigmoid:v=>1/(1+Math.exp(-v)),step:v=>v>0?1:0,relu:v=>Math.max(0,v)};
   const upd=()=>{let sum=b;for(let i=0;i<3;i++)sum+=x[i]*w[i];const o=A[act](sum);
     for(let i=0;i<3;i++){ins[i].scale.setScalar(.3+x[i]*.6);il[i].userData.setText('x'+(i+1)+' = '+fx(x[i],1));S.setBar(bars[i],[-8,iy[i],0],[-1.2,2.5,0]);const th=.03+Math.abs(w[i])*.09;bars[i].scale.x=th;bars[i].scale.z=th;bars[i].material=S.mat(w[i]>=0?C.teal:C.coral,{emi:.4});wl[i].userData.setText('w'+(i+1)+' = '+fx(w[i],1));}
     bl.userData.setText('bias b = '+fx(b,1));bs.scale.setScalar(.25+Math.abs(b)*.3);bs.material=S.mat(b>=0?C.amber:C.coral,{emi:.5});
     const hh=clamp(o,0,1.6)*4+.1;out.scale.y=hh;out.position.y=hh/2;ol.position.y=hh+.9;ol.userData.setText('output = '+fx(o,2));
     neu.material=S.mat(C.violet,{emi:Math.round(clamp(o,0,1)*5)/5*.9});
     u.out(kv([['Weighted sum',fx(sum,2)],['Activation',act],['Output',fx(o,2),o>.5?'g':'a']])+'<p><b>sum</b> = x1·w1 + x2·w2 + x3·w3 + b = '+x.map((v,i)=>fx(v,1)+'×'+fx(w[i],1)).join(' + ')+' + ('+fx(b,1)+') = <b>'+fx(sum,2)+'</b>. Then output = '+act+'(sum) = <b>'+fx(o,2)+'</b>. A weight scales <b>one input</b>; the bias shifts the whole sum.</p>');};
   [0,1,2].forEach(i=>{u.slider('Input x'+(i+1),0,1,.05,x[i],v=>{x[i]=v;upd();},v=>fx(v,2));});
   [0,1,2].forEach(i=>{u.slider('Weight w'+(i+1),-2,2,.1,w[i],v=>{w[i]=v;upd();},v=>fx(v,1));});
   u.slider('Bias b',-2,2,.1,b,v=>{b=v;upd();},v=>fx(v,1));
   u.sel('Activation function',[['sigmoid','Sigmoid (smooth)'],['step','Step (on or off)'],['relu','ReLU']],act,v=>{act=v;upd();});
   upd();
  }},
 {label:'Multi-layer perceptron',view:[26,.6,1.05,[0,3.2,0]],hint:'Move inputs, then press Send signal.',tip:'Input layer, two hidden layers and an output layer. Teal connections are positive weights, coral are negative. Neurons glow with their activation. Press Send signal to watch the layers fire in turn.',
  build(g,u){
   const sizes=[3,5,4,2],XS=[-10,-3.5,3.5,10],rr=rng(31);
   const pos=sizes.map((n,l)=>Array.from({length:n},(_,i)=>[XS[l],(i-(n-1)/2)*2.3+3.2,(i%2?1:-1)*.9]));
   const Wt=[];for(let l=0;l<3;l++){Wt.push(Array.from({length:sizes[l+1]},()=>Array.from({length:sizes[l]},()=>(rr()*2-1)*1.8)));}
   const Bi=[0,1,2].map(l=>Array.from({length:sizes[l+1]},()=>(rr()*2-1)*.5));
   const posP=[],negP=[];for(let l=0;l<3;l++)for(let j=0;j<sizes[l+1];j++)for(let i=0;i<sizes[l];i++){(Wt[l][j][i]>=0?posP:negP).push([pos[l][i],pos[l+1][j]]);}
   S.segs(g,posP,C.teal,.55);S.segs(g,negP,C.coral,.55);
   const cols=[C.sky,C.violet,C.violet,C.amber];const meshes=pos.map((arr,l)=>arr.map(p=>S.ball(g,p,.6,cols[l],{emi:.1})));
   ['Input layer','Hidden layer 1','Hidden layer 2','Output layer'].forEach((t,l)=>S.label(g,t,[XS[l],-1.4,0],{size:.55}));
   const ol=[0,1].map(i=>S.label(g,'',[XS[3]+2.8,pos[3][i][1],pos[3][i][2]],{size:.5,color:'#ffffff'}));
   S.floor(g,30,30,0);
   let x=[.9,.2,.6],acts=null,lit=[1,1,1,1],busy=false;
   const sg=v=>1/(1+Math.exp(-v));
   const fwd=()=>{const a=[x.slice()];for(let l=0;l<3;l++){const prev=a[l];const z=Wt[l].map((row,j)=>row.reduce((s,wv,i)=>s+wv*prev[i],Bi[l][j]));a.push(l<2?z.map(sg):(()=>{const e=z.map(Math.exp),s=e[0]+e[1];return e.map(v=>v/s);})());}acts=a;};
   const paint=()=>{meshes.forEach((layer,l)=>layer.forEach((m,i)=>{const v=lit[l]?acts[l][i]:0;m.scale.setScalar(.35+v*.5);m.material=S.mat(cols[l],{emi:Math.round(v*5)/5*.9});}));
     const pr=acts[3];ol.forEach((lb,i)=>lb.userData.setText(lit[3]?(i?'Class B ':'Class A ')+Math.round(pr[i]*100)+'%':(i?'Class B':'Class A'),pr[i]>.5&&lit[3]?'#ffb400':'#ffffff'));};
   const upd=()=>{fwd();paint();const pr=acts[3];u.out(kv([['Input',x.map(v=>fx(v,1)).join(', ')],['Class A',Math.round(pr[0]*100)+'%',pr[0]>.5?'g':''],['Class B',Math.round(pr[1]*100)+'%',pr[1]>.5?'g':''],['Prediction',pr[0]>pr[1]?'Class A':'Class B','a']])+'<p>The input layer receives the raw features (one neuron per feature). Each hidden layer combines the signals before it into more complex ones. The output layer gives the result. The weights here are random, so the network is untrained; training would adjust them. Straight-line splits from many neurons combine into <b>non-linear</b> decisions.</p>');};
   const pulses=[];for(let k=0;k<45;k++){const p=S.ball(g,[0,-99,0],.17,C.white,{basic:true});pulses.push(p);}
   const send=async()=>{if(busy)return;busy=true;lit=[0,0,0,0];fwd();pulses.forEach(p=>p.position.y=-99);lit[0]=1;paint();
     for(let l=0;l<3;l++){const cons=[];for(let j=0;j<sizes[l+1];j++)for(let i=0;i<sizes[l];i++)cons.push([pos[l][i],pos[l+1][j]]);
       await runAnim(S,650,t=>{cons.forEach((c,k)=>pulses[k].position.set(lerp(c[0][0],c[1][0],t),lerp(c[0][1],c[1][1],t),lerp(c[0][2],c[1][2],t)));});
       pulses.forEach(p=>p.position.y=-99);lit[l+1]=1;paint();}
     busy=false;};
   ['Input 1','Input 2','Input 3'].forEach((t,i)=>u.slider(t,0,1,.05,x[i],v=>{x[i]=v;if(!busy){lit=[1,1,1,1];upd();}},v=>fx(v,2)));
   u.btn('Send signal',send,{pri:true});
   upd();
  }},
 {label:'XOR challenge',view:[17,.9,1.0,[0,0,0]],hint:'Try to separate teal from coral.',tip:'Four inputs (x1, x2). Teal spheres should output 1, coral spheres 0 (XOR: 1 only when exactly one input is 1). The floor shows what the model predicts everywhere: teal tiles = 1, coral tiles = 0.',
  build(g,u){
   const M=7,px=v=>(v-.5)*M,tiles=[];const G=12;
   const mTeal=S.mat(C.teal,{op:.4}),mCor=S.mat(C.coral,{op:.4});
   for(let i=0;i<G;i++)for(let j=0;j<G;j++){const xv=-.5+(i+.5)*2/G,yv=-.5+(j+.5)*2/G;const t=S.cube(g,[px(xv),.05,px(yv)],[M*2/G*.96,.1,M*2/G*.96],C.coral,{op:.4});t.userData={x:xv,y:yv};tiles.push(t);}
   const pts=[[0,0,0],[1,0,1],[0,1,1],[1,1,0]];const pm=pts.map(p=>S.ball(g,[px(p[0]),.9,px(p[1])],.45,p[2]?C.teal:C.coral,{emi:.6}));
   const pl=pts.map(p=>S.label(g,'('+p[0]+','+p[1]+') = '+p[2],[px(p[0]),1.9,px(p[1])],{size:.5}));const mk=pts.map(p=>S.label(g,'',[px(p[0]),2.7,px(p[1])],{size:.6}));
   const l1=S.bar(g,[0,.3,0],[1,.3,1],.06,C.amber,{emi:.6}),l2=S.bar(g,[0,.3,0],[1,.3,1],.06,C.sky,{emi:.6});
   let model='one',w1=1,w2=1,b=-.5;
   const st=v=>v>0?1:0;
   const bestOne=(()=>{let bst=0,n=0;for(let a=-3;a<=3;a+=.25)for(let c=-3;c<=3;c+=.25)for(let d=-3;d<=3;d+=.25){n++;let k=0;pts.forEach(p=>{if(st(a*p[0]+c*p[1]+d)===p[2])k++;});if(k>bst)bst=k;}return{bst,n};})();
   const ends=(a,c,d)=>{const out=[];const add=(x,y)=>{if(x>=-.5-1e-6&&x<=1.5+1e-6&&y>=-.5-1e-6&&y<=1.5+1e-6&&!out.some(q=>Math.hypot(q[0]-x,q[1]-y)<1e-4))out.push([x,y]);};
     if(Math.abs(c)>1e-6){[-.5,1.5].forEach(x=>add(x,-(a*x+d)/c));}if(Math.abs(a)>1e-6){[-.5,1.5].forEach(y=>add(-(c*y+d)/a,y));}return out;};
   const predict=(x,y)=>model==='one'?st(w1*x+w2*y+b):st(st(x+y-.5)-st(x+y-1.5)-.5);
   const setLn=(bar,e)=>{if(e.length<2){bar.visible=false;return;}bar.visible=true;S.setBar(bar,[px(e[0][0]),.3,px(e[0][1])],[px(e[1][0]),.3,px(e[1][1])]);};
   const upd=()=>{tiles.forEach(t=>t.material=predict(t.userData.x,t.userData.y)?mTeal:mCor);
     if(model==='one'){setLn(l1,ends(w1,w2,b));l2.visible=false;}else{setLn(l1,ends(1,1,-.5));setLn(l2,ends(1,1,-1.5));}
     let ok=0;pts.forEach((p,i)=>{const good=predict(p[0],p[1])===p[2];if(good)ok++;mk[i].userData.setText(good?'correct':'wrong',good?'#52da9f':'#ff8093');});
     u.out(kv([['Model',model==='one'?'Single neuron':'Two-layer network'],['Correct',ok+' of 4',ok===4?'g':'b']])+(model==='one'?'<p>A single neuron draws <b>one straight line</b>. I tested '+bestOne.n+' combinations of weights and bias: the best any single line manages is <b>'+bestOne.bst+' of 4</b>. XOR is not separable by one line.</p>':'<p>Two hidden neurons each draw a line (amber and sky). The output neuron answers 1 only for points <b>between</b> the lines. Combining straight-line decisions in a hidden layer gives a non-linear boundary, so all 4 are correct.</p>'));};
   const gm=u.g('Model');
   gm.sel('Model',[['one','Single neuron (perceptron)'],['two','Two-layer network (MLP)']],'one',v=>{model=v;upd();});
   u.slider('Weight w1',-3,3,.25,w1,v=>{w1=v;upd();},v=>fx(v,2));u.slider('Weight w2',-3,3,.25,w2,v=>{w2=v;upd();},v=>fx(v,2));u.slider('Bias b',-3,3,.25,b,v=>{b=v;upd();},v=>fx(v,2));
   upd();
  }}
 ]);
};

/* ---------- A4.3.9 Convolutional neural networks ---------- */
SC.a439=function(S){
 const KER={
  v:{n:'Vertical edge',k:[[1,0,-1],[1,0,-1],[1,0,-1]]},
  h:{n:'Horizontal edge',k:[[1,1,1],[0,0,0],[-1,-1,-1]]},
  b:{n:'Blur (average)',k:[[1/9,1/9,1/9],[1/9,1/9,1/9],[1/9,1/9,1/9]]}};
 S.modes([
 {label:'Convolution',view:[22,.8,1.0,[-2,0,0]],hint:'Slide the kernel over the image.',tip:'Left: an 8×8 image (taller = brighter). The amber box is the kernel window. Middle: the feature map it builds, one value per window position (teal = strong match, coral = negative). Right: after max pooling.',
  build(g,u){
   const n=8,m=6;const IMG=[];for(let r=0;r<n;r++){IMG.push([]);for(let c=0;c<n;c++)IMG[r].push((r>=2&&r<=5&&c>=2&&c<=5)?1:0);}
   const ipx=c=>-13+c,ipz=r=>r-3.5,fxp=c=>-3+c*1.05,fzp=r=>(r-2.5)*1.05,ppx=c=>6.5+c*1.2,ppz=r=>(r-1)*1.2;
   S.floor(g,32,32,0);
   for(let r=0;r<n;r++)for(let c=0;c<n;c++){const v=IMG[r][c];const hh=.12+v*1.1;S.cube(g,[ipx(c),hh/2,ipz(r)],[.92,hh,.92],v?0xe8f1f8:0x35506b);}
   S.label(g,'Input image 8×8',[-9.5,0,5.6],{size:.55});S.label(g,'Feature map 6×6',[-.5,0,4.6],{size:.55});S.label(g,'Max pooled 3×3',[7.2,0,3.4],{size:.55});
   S.arrow(g,[-6.3,.6,0],[-4.2,.6,0],0x6b8299,.07);S.arrow(g,[2.6,.6,0],[5.4,.6,0],0x6b8299,.07);
   const kc=[],kl=[];for(let i=0;i<3;i++)for(let j=0;j<3;j++){kc.push(S.cube(g,[-9.5+(j-1)*1.0,.2,-7.5+(i-1)*1.0],[.9,.4,.9],C.teal));kl.push(S.label(g,'',[-9.5+(j-1)*1.0,.9,-7.5+(i-1)*1.0],{size:.4,color:'#ffffff'}));}
   S.label(g,'Kernel (learned weights)',[-9.5,.2,-9.6],{size:.5,color:'#ffb400'});
   const win=S.cube(g,[0,.9,0],[3.05,1.7,3.05],C.amber,{op:.25});const mark=S.ball(g,[0,1,0],.28,C.amber,{emi:.8});
   const fm=[],pm=[];for(let p=0;p<m*m;p++)fm.push(S.cube(g,[fxp(p%m),.05,fzp(Math.floor(p/m))],[.95,.1,.95],C.teal));
   for(let p=0;p<9;p++)pm.push(S.cube(g,[ppx(p%3),.05,ppz(Math.floor(p/3))],[1.1,.1,1.1],C.sky));
   let ker='v',pos=0,relu=false,pool=false,run=false;const vals=[];
   const conv=(r,c)=>{let s=0;const K=KER[ker].k;for(let i=0;i<3;i++)for(let j=0;j<3;j++)s+=IMG[r+i][c+j]*K[i][j];return s;};
   const upd=()=>{const K=KER[ker].k;
     for(let i=0;i<3;i++)for(let j=0;j<3;j++){const v=K[i][j],kk=i*3+j;const hh=.15+Math.abs(v)*.9;kc[kk].scale.y=hh;kc[kk].position.y=hh/2;kc[kk].material=S.mat(v>=0?C.teal:C.coral,{emi:.3});kl[kk].position.y=hh+.5;kl[kk].userData.setText(fx(v,Math.abs(v)<1&&v!==0?2:0));}
     const r0=Math.floor(pos/m),c0=pos%m;win.position.set(ipx(c0+1),.9,ipz(r0+1));
     for(let p=0;p<m*m;p++){let v=conv(Math.floor(p/m),p%m);if(relu)v=Math.max(0,v);vals[p]=p<=pos?v:0;const hh=.1+Math.abs(vals[p])*.9;fm[p].scale.y=hh;fm[p].position.y=hh/2;fm[p].material=S.mat(vals[p]>=0?C.teal:C.coral,{emi:p===pos?.9:.3,op:p<=pos?1:.25});}
     mark.position.set(fxp(c0),.1+Math.abs(vals[pos])*.9+.5,fzp(r0));
     for(let p=0;p<9;p++){let v=0,vis=pool;if(pool){const pr=Math.floor(p/3)*2,pc=(p%3)*2;const a=[vals[pr*m+pc],vals[pr*m+pc+1],vals[(pr+1)*m+pc],vals[(pr+1)*m+pc+1]];v=Math.max(...a);}const hh=vis?.1+Math.abs(v)*.9:.02;pm[p].scale.y=hh;pm[p].position.y=hh/2;pm[p].visible=vis;pm[p].material=S.mat(v>=0?C.sky:C.coral,{emi:.4});}
     let patch='';for(let i=0;i<3;i++){patch+=IMG[r0+i].slice(c0,c0+3).join(' ')+(i<2?' / ':'');}
     const raw=conv(r0,c0);
     u.out(kv([['Kernel',KER[ker].n],['Window',pos+1+' of 36 (row '+(r0+1)+', col '+(c0+1)+')'],['Patch × kernel',fx(raw,1),Math.abs(raw)>1?'g':''],['ReLU',relu?'on':'off'],['Pooling',pool?'2×2 max':'off']])+'<p>The kernel multiplies the 3×3 patch of pixels it covers (<b>'+patch+'</b>) by its weights and adds the results to get one number for the feature map. '+(ker==='v'?'This kernel responds where brightness changes left to right: positive on the right edge of the block, negative on the left.':ker==='h'?'This kernel responds to horizontal edges: top and bottom of the block.':'This kernel averages neighbours, smoothing the image.')+' <b>Convolution detects features; pooling only shrinks the map.</b></p>');};
   u.sel('Kernel',[['v','Vertical edge'],['h','Horizontal edge'],['b','Blur']],ker,v=>{ker=v;upd();});
   const sl=u.slider('Kernel position',0,35,1,pos,v=>{pos=v;upd();},v=>v+1+'/36');
   const rb=u.btn('Slide',()=>{if(pos>=35)pos=0;sl.set(pos);run=!run;rb.textContent=run?'Pause':'Slide';},{pri:true});
   u.toggle('ReLU (adds non-linearity)',false,v=>{relu=v;upd();});u.toggle('Max pooling',false,v=>{pool=v;upd();});
   S.every(260,()=>{if(run){if(pos<35){pos++;sl.set(pos);upd();}else{run=false;rb.textContent='Slide';}}});
   upd();
  }},
 {label:'Parameters',view:[24,.75,1.0,[-1,2,0]],hint:'Change kernel size, stride and layers.',tip:'Left: a 12×12 input with the kernel windows along its first row (they overlap when stride is smaller than kernel size). Middle: the feature map size that results. Right: stacked layers, each learning more complex features.',
  build(g,u){
   const I=12,sp=.55;let k=3,s=1,L=3;S.floor(g,34,34,0);
   const ix=c=>-15+c*sp,iz=r=>(r-5.5)*sp;
   for(let r=0;r<I;r++)for(let c=0;c<I;c++)S.cube(g,[ix(c),.05,iz(r)],[sp*.9,.1,sp*.9],((r+c)%2)?0x2c455d:0x24384c);
   S.label(g,'Input 12×12',[-12,0,4.4],{size:.5});S.label(g,'Feature map',[-1,0,5.6],{size:.5});
   let gp=null,gl=null;
   const names=['Edges and lines','Corners and textures','Parts (eye, wheel)','Whole objects (a face)'];
   const upd=()=>{if(gp)g.remove(gp);gp=new THREE.Group();g.add(gp);if(gl)g.remove(gl);gl=new THREE.Group();g.add(gl);
     const n=Math.floor((I-k)/s)+1;
     for(let i=0;i<n;i++){const cx=ix(i*s+(k-1)/2),w=k*sp;const b=S.cube(gp,[cx,.45+(i%2)*.3,iz(5.5)],[w,.3,w],i%2?C.sky:C.amber,{op:.35});}
     const cell=.95;for(let r=0;r<n;r++)for(let c=0;c<n;c++){const hh=.2+(Math.sin(r*1.3)+Math.cos(c*1.1)+2)*.35;S.cube(gp,[-6+(c-(n-1)/2)*cell*1.0+5,hh/2,(r-(n-1)/2)*cell],[cell*.9,hh,cell*.9],C.teal,{emi:.25});}
     for(let l=0;l<L;l++){const sz=5.2*Math.pow(.72,l),x=7+l*2.6;S.cube(gl,[x,3,0],[.35,sz,sz],[C.sky,C.teal,C.violet,C.amber][l],{emi:.35+l*.12,op:.9});S.label(gl,'Layer '+(l+1),[x,3-sz/2-.8,0],{size:.45});S.label(gl,names[l],[x,3+sz/2+.7,0],{size:.4,color:'#ffb400'});}
     u.out(kv([['Kernel size',k+'×'+k],['Stride',s],['Feature map',n+'×'+n+' = '+n*n+' values'],['Layers',L]])+'<p>Output size = ⌊(12 − '+k+') ÷ '+s+'⌋ + 1 = <b>'+n+'</b> per side. A <b>smaller kernel</b> picks up fine local detail; a <b>larger</b> one responds to broader patterns. A <b>larger stride</b> skips positions: a smaller map, faster, but less detail. <b>More layers</b> let the network build a deeper hierarchy: '+names.slice(0,L).join(' → ')+'.</p>');};
   u.slider('Kernel size',2,5,1,k,v=>{k=v;upd();},v=>v+'×'+v);u.slider('Stride',1,3,1,s,v=>{s=v;upd();});u.slider('Number of layers',1,4,1,L,v=>{L=v;upd();});
   upd();
  }},
 {label:'Whole pipeline',view:[24,.62,1.05,[-2,2.5,0]],hint:'Choose an image and press Send an image.',tip:'Follow one image through every layer type: input, convolution and ReLU, pooling, flatten, fully connected, output. The class probabilities are illustrative, to show how the result appears.',
  build(g,u){
   S.floor(g,36,36,0);const cs=[];const add=(i,m,c)=>{m.userData.c=c;(cs[i]=cs[i]||[]).push(m);return m;};
   add(0,S.cube(g,[-14,2.5,0],[.3,3.4,3.4],0xe8f1f8,{emi:.25}),0xe8f1f8);
   for(let k=0;k<3;k++)add(1,S.cube(g,[-10.5+k*.8,2.5,0],[.3,3,3],C.teal,{emi:.25}),C.teal);
   for(let k=0;k<3;k++)add(2,S.cube(g,[-5.5+k*.8,2.5,0],[.3,1.7,1.7],C.sky,{emi:.25}),C.sky);
   for(let k=0;k<10;k++)add(3,S.cube(g,[-.5,.4+k*.55,0],[.4,.4,.4],C.amber,{emi:.25}),C.amber);
   const fc=[];for(let k=0;k<5;k++)fc.push(add(4,S.ball(g,[4,1+k*1.1,0],.45,C.violet,{emi:.25}),C.violet));
   const outs=[];['Cat','Dog','Car'].forEach((t,k)=>{outs.push(add(5,S.ball(g,[9,1.5+k*1.5,0],.55,C.lime,{emi:.25}),C.lime));S.label(g,t,[10.9,1.5+k*1.5,0],{size:.5});});
   const pairs=[];for(let a=0;a<10;a++)for(let b=0;b<5;b+=2)pairs.push([[-.5,.4+a*.55,0],[4,1+b*1.1,0]]);S.segs(g,pairs,0x4a6a8a,.5);
   const p2=[];fc.forEach((f,a)=>outs.forEach(o=>p2.push([f.position.toArray(),o.position.toArray()])));S.segs(g,p2,0x4a6a8a,.5);
   const LB=['Input image','Convolution + ReLU','Pooling','Flatten','Fully connected','Output'];const LX=[-14,-9.3,-4.3,-.5,4,9];LB.forEach((t,i)=>S.label(g,t,[LX[i],-.9,0],{size:.5}));
   const DESC=['The image arrives as a grid of pixel values.','Kernels slide over the image and produce feature maps; ReLU adds non-linearity. Early layers find edges and colour patches.','Pooling down-samples each feature map, keeping the strongest values. Smaller, faster, less position-sensitive.','The final feature maps are flattened into one line of numbers.','Fully connected layers weigh up the high-level features, like an MLP.','The output layer gives one probability per class; the highest is the answer.'];
   const hl=i=>cs.forEach((arr,j)=>arr.forEach(m=>m.material=S.mat(m.userData.c,{emi:j===i?.95:.25})));
   const PR={Cat:[.86,.1,.04],Dog:[.12,.83,.05],Car:[.03,.04,.93]};let img='Cat',busy=false;
   const pulse=S.ball(g,[-15,2.5,0],.35,C.white,{basic:true});pulse.visible=false;
   const send=async()=>{if(busy)return;busy=true;pulse.visible=true;let cur=-1;const pr=PR[img];outs.forEach(o=>o.scale.setScalar(.55));
     await runAnim(S,5200,t=>{const x=lerp(-15,9,t);pulse.position.set(x,2.5,0);const idx=x<-12?0:x<-7?1:x<-2.5?2:x<1.5?3:x<6?4:5;if(idx!==cur){cur=idx;hl(idx);u.out('<p><b>'+LB[idx]+'.</b> '+DESC[idx]+'</p>');}});
     pulse.visible=false;const w=pr.indexOf(Math.max(...pr));outs.forEach((o,i)=>{o.scale.setScalar(.35+pr[i]*.8);o.material=S.mat(i===w?C.amber:C.lime,{emi:i===w?.9:.25});});
     u.out(kv([['Image',img],['Cat',Math.round(pr[0]*100)+'%',w===0?'g':''],['Dog',Math.round(pr[1]*100)+'%',w===1?'g':''],['Car',Math.round(pr[2]*100)+'%',w===2?'g':''],['Answer',['Cat','Dog','Car'][w],'a']])+'<p>The class with the highest probability is the answer. (Probabilities here are illustrative.)</p>');busy=false;};
   u.sel('Image',[['Cat','Cat photo'],['Dog','Dog photo'],['Car','Car photo']],img,v=>{img=v;});
   u.btn('Send an image',send,{pri:true});
   hl(-1);u.out('<p>Press <b>Send an image</b>.</p>');
  }}
 ]);
};

/* ---------- A4.3.10 Model selection ---------- */
SC.a4310=function(S){
 S.modes([
 {label:'No single best model',view:[20,.62,1.05,[0,3,0]],hint:'Click a problem to compare the models.',tip:'Illustrative scores (not measured) for how well three model types might do on four problems. Teal: linear regression. Amber: decision tree. Violet: neural network. The best choice changes with the problem.',
  build(g,u){
   S.floor(g,26,26,0);
   const P=['House prices','Image recognition','Loan decisions','Weather patterns'],M=['Linear regression','Decision tree','Neural network'],MC=[C.teal,C.amber,C.violet];
   const SCR=[[88,74,79],[31,52,95],[76,80,85],[45,68,84]];const PICK=[0,2,1,2];
   const WHY=['Prices rise roughly in a straight line with size and the dataset is small. <b>Linear regression</b> captures it well and is easy to explain. A neural network adds complexity without gain.','Pixels form spatial patterns no straight line or short rule list can capture. A deep network (a CNN) learns the feature hierarchy, given plenty of data. <b>Neural network.</b>','The neural network scores highest, but the dataset is small and each refusal must be explained to the customer. The <b>decision tree</b> is almost as accurate and is a white box. Interpretability outweighs a little accuracy.','Weather depends on many interacting non-linear factors and there is lots of data. The flexible <b>neural network</b> wins; a straight line cannot capture it.'];
   const tw2=[];P.forEach((pn,pi)=>{S.label(g,pn,[(pi-1.5)*5.4,-.9,2.8],{size:.55});SCR[pi].forEach((s,mi)=>{const m=tw(S,g,(pi-1.5)*5.4+(mi-1)*1.35,0,s/100*7,MC[mi],1.15);m.userData={pi,mi,c:MC[mi]};tw2.push(m);S.label(g,String(s),[(pi-1.5)*5.4+(mi-1)*1.35,s/100*7+.7,0],{size:.45,color:'#ffffff'});});});
   const star=S.label(g,'★ best choice',[0,-99,0],{size:.55,color:'#ffb400'});
   const sel=pi=>{tw2.forEach(m=>m.material=S.mat(m.userData.c,{emi:pi==null||m.userData.pi===pi?.35:0,op:pi==null||m.userData.pi===pi?1:.3}));
     if(pi==null){star.position.y=-99;u.out('<p>Choose a problem. The towers show illustrative scores for three models. No model is highest everywhere, which is the "No Free Lunch" idea.</p>');return;}
     const pk=PICK[pi];star.position.set((pi-1.5)*5.4+(pk-1)*1.35,SCR[pi][pk]/100*7+1.6,0);
     const top=SCR[pi].indexOf(Math.max(...SCR[pi]));
     u.out(kv([['Problem',P[pi]],['Highest score',M[top]+' ('+SCR[pi][top]+')'],['Best choice',M[pk],'g']])+'<p>'+WHY[pi]+'</p>');};
   P.forEach((p,i)=>u.btn(p,()=>sel(i)));u.btn('Show all',()=>sel(null),{pri:true});
   S.onPick(tw2,o=>sel(o.userData.pi));
   sel(null);
  }},
 {label:'Small data overfits',view:[26,.7,1.0,[4,2.5,0]],hint:'Slide the number of training points.',tip:'Dots are training data from a curved pattern plus noise. Sky line: too simple (degree 1). Teal line: balanced (degree 3). Coral line: very flexible (degree 8). Towers at right: error on the training data (dim) and on unseen test data (bright).',
  build(g,u){
   const rr=rng(8),f=x=>Math.sin(2.2*x);const ALL=[],TEST=[];for(let i=0;i<80;i++){const x=rr()*2-1;ALL.push([x,f(x)+nrm(rr)*.28]);}const rt=rng(99);for(let i=0;i<80;i++){const x=rt()*2-1;TEST.push([x,f(x)+nrm(rt)*.28]);}
   const X=x=>x*7-3,Y=y=>y*2.2+3.5;S.floor(g,22,22,0);
   S.bar(g,[-10,0,0],[4,0,0],.03,0x6b8299);S.bar(g,[-3,0,0],[-3,7.5,0],.03,0x6b8299);
   S.label(g,'x',[4.6,0,0],{size:.5});S.label(g,'y',[-3,8,0],{size:.5});
   const tl=[];for(let i=0;i<=60;i++){const x=-1+i/30;tl.push([X(x),clamp(Y(f(x)),.1,7.2),0]);}S.line(g,tl,0xffffff,.35);
   const DEG=[1,3,8],CC=[C.sky,C.teal,C.coral],NM=['Too simple (deg 1)','Balanced (deg 3)','Very flexible (deg 8)'];
   const curves=DEG.map((d,i)=>S.line(g,tl,CC[i],1));
   const towers=[];DEG.forEach((d,i)=>{towers.push([tw(S,g,8+i*3,0,.1,CC[i],.9,{emi:.1,op:.55}),tw(S,g,9+i*3,0,.1,CC[i],.9,{emi:.5})]);S.label(g,NM[i].split(' (')[0],[8.5+i*3,-.9,0],{size:.42,color:'#'+CC[i].toString(16).padStart(6,'0')});});
   S.label(g,'dim = training error   bright = test error',[11.5,8,0],{size:.45});
   let dots=[];let n=10;
   const mse=(c,D)=>D.reduce((s,p)=>s+(polyval(c,p[0])-p[1])**2,0)/D.length;
   const upd=()=>{dots.forEach(d=>g.remove(d));dots=[];const D=ALL.slice(0,n);D.forEach(p=>dots.push(S.ball(g,[X(p[0]),clamp(Y(p[1]),.2,7.2),0],.16,C.white,{emi:.4})));
     const res=DEG.map((d,i)=>{const c=polyfit(D.map(p=>p[0]),D.map(p=>p[1]),d);const pts=[];for(let k=0;k<=60;k++){const x=-1+k/30;pts.push([X(x),clamp(Y(polyval(c,x)),.1,7.2),0]);}S.setLine(curves[i],pts);
       const tr=mse(c,D),te=mse(c,TEST);setH(towers[i][0],Math.min(5,tr*4));setH(towers[i][1],Math.min(5,te*4));return{tr,te};});
     const over=res[2].te>res[1].te*1.15;
     u.out(kv([['Training points',n],['Deg 1: train / test',fx(res[0].tr,2)+' / '+fx(res[0].te,2)],['Deg 3: train / test',fx(res[1].tr,2)+' / '+fx(res[1].te,2)],['Deg 8: train / test',fx(res[2].tr,2)+' / '+fx(res[2].te,2),over?'b':'g']])+'<p>'+(over?'<b>Overfitting:</b> the very flexible model bends to chase the noise, so its training error is tiny but its error on unseen data is larger. With so little data a simpler model is the safer choice.':'With this many examples the flexible model has enough data to settle down, so the gap closes. <b>More data lets complex models work without overfitting.</b>')+' The too-simple model has high error on both: it cannot capture the curve.</p>');};
   u.slider('Training points',9,80,1,n,v=>{n=v;upd();});
   upd();
  }},
 {label:'Interpretability vs power',view:[19,.6,1.0,[5,4.5,0]],hint:'Set how much the decision must be explainable.',tip:'Each sphere is a model, placed by how interpretable it is (right = easier to explain) and how much predictive power it often has (higher = more accurate). Positions are illustrative. The violet wall is your interpretability requirement: models behind it are ruled out.',
  build(g,u){
   S.floor(g,24,24,0);S.axes(g,10,['interpretability','predictive power',''],{flat:true,min:0});
   const MD=[['Linear regression',.95,.42,C.teal],['Decision tree',.85,.62,C.amber],['K-NN',.5,.7,C.sky],['Neural network',.2,.88,C.violet],['CNN (images)',.08,.97,C.coral]];
   const ms=MD.map(m=>{const s=S.ball(g,[m[1]*10,m[2]*10,0],.6,m[3],{emi:.4});S.label(g,m[0],[m[1]*10,m[2]*10+1.2,0],{size:.5});return s;});
   S.label(g,'BLACK BOX',[1.5,-.9,0],{size:.5,color:'#ff8093'});S.label(g,'WHITE BOX',[8.5,-.9,0],{size:.5,color:'#52da9f'});
   const wall=S.plane(g,[0,5,0],10,10,C.violet,{op:.2,vertical:true});wall.rotation.y=Math.PI/2;
   const ring=S.ball(g,[0,-99,0],1.0,0xffffff,{op:.25});
   let req=.5;
   const upd=()=>{wall.position.set(req*10,5,0);let b=-1;MD.forEach((m,i)=>{const ok=m[1]>=req-1e-9;ms[i].material=S.mat(m[3],{emi:ok?.5:0,op:ok?1:.25});if(ok&&(b<0||m[2]>MD[b][2]))b=i;});
     ring.position.set(MD[b][1]*10,MD[b][2]*10,0);ring.material=S.mat(C.amber,{op:.35});
     u.out(kv([['Interpretability required',Math.round(req*100)+'%'],['Models still allowed',MD.filter(m=>m[1]>=req-1e-9).length+' of 5'],['Most powerful allowed',MD[b][0],'g']])+'<p>Among the models that satisfy the explainability requirement, choose the one with the most predictive power: <b>'+MD[b][0]+'</b>. '+(req>=.8?'When a decision must be explained (a refused loan, a medical prediction) a white-box model wins, even at some cost in accuracy.':req<=.1?'When only the accuracy of the result matters (an image competition) a black-box model is the right choice.':'A middle requirement allows models that are somewhat explainable and fairly accurate.')+'</p>');};
   const sl=u.slider('Interpretability required',0,1,.05,req,v=>{req=v;upd();},v=>Math.round(v*100)+'%');
   const gs=u.g('Scenarios');
   gs.btn('Bank must explain a refusal',()=>{sl.set(.8);req=.8;upd();});gs.btn('Hospital must justify each prediction',()=>{sl.set(.7);req=.7;upd();});gs.btn('Image-recognition contest',()=>{sl.set(0);req=0;upd();});
   upd();
  }}
 ]);
};
