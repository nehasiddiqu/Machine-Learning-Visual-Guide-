/* ===== scenes: A4.1 and A4.2 ===== */
/* Home hero: a slowly turning layered network with pulses */
SC.home=function(S){
  S.grp=new THREE.Group();S.sc.add(S.grp);const g=S.grp;S.view(15,.8,1.15,[0,0,0]);S.hint.textContent='Drag to rotate.';
  const L=[4,6,6,3],X=[-6,-2,2,6],nodes=[];
  L.forEach((n,i)=>{const col=[];for(let j=0;j<n;j++){const y=(j-(n-1)/2)*1.7,z=((j*7+i*3)%5-2)*.7;const m=S.ball(g,[X[i],y,z],.32,[C.sky,C.teal,C.violet,C.amber][i],{emi:.4});col.push(m);}nodes.push(col);});
  const edges=[];for(let i=0;i<3;i++)nodes[i].forEach(a=>nodes[i+1].forEach(b=>{if(((a.id+b.id)%3)!==0)edges.push([a.position,b.position,i]);}));
  S.segs(g,edges.map(e=>[[e[0].x,e[0].y,e[0].z],[e[1].x,e[1].y,e[1].z]]),0x35506b,.55);
  const pulses=[];for(let k=0;k<26;k++){const p=S.ball(g,[0,0,0],.12,C.white,{basic:true,lo:true});pulses.push({m:p,e:edges[(k*13)%edges.length],t:(k%10)/10});}
  S.tick((dt)=>{pulses.forEach(p=>{p.t+=dt*.55;if(p.t>1){p.t=0;p.e=edges[Math.floor(Math.random()*edges.length)];}const a=p.e[0],b=p.e[1];p.m.position.lerpVectors(a,b,p.t);});});
  S.label(g,'inputs',[-6,-4.8,0],{size:.6,color:'#9db2c7'});S.label(g,'hidden layers',[0,-5.4,0],{size:.6,color:'#9db2c7'});S.label(g,'output',[6,-3.4,0],{size:.6,color:'#9db2c7'});
};

/* ---------- A4.1.1 ---------- */
SC.a411=function(S){
  const cents=[[-2.4,1.2,0],[2.4,1.8,1],[0,3.2,-2.4]];
  const data=()=>{const r=rng(11),pts=[];cents.forEach((c,k)=>{for(let i=0;i<15;i++)pts.push({k,p:[c[0]+nrm(r)*.7,Math.max(.3,c[1]+nrm(r)*.55),c[2]+nrm(r)*.7]});});return pts;};
  const nameOf=['Class A','Class B','Class C'];
  S.modes([
  {label:'Labelled vs unlabelled',view:[19,.75,1.0,[0,1.6,0]],hint:'Left: supervised. Right: unsupervised.',tip:'Left island: every training point carries a label (colour). Right island: the same points with no labels. The ring of translucent spheres on the left shows where the model learned each class lives.',
   build(g,u){
    const Lg=new THREE.Group(),Rg=new THREE.Group();Lg.position.x=-6.5;Rg.position.x=6.5;g.add(Lg,Rg);
    S.floor(Lg,10,10,0);S.floor(Rg,10,10,0);
    S.label(g,'Supervised: labelled',[-6.5,6.2,0],{size:.7,color:'#2ec4b6'});S.label(g,'Unsupervised: no labels',[6.5,6.2,0],{size:.7,color:'#ffb400'});
    const pts=data();
    pts.forEach(o=>{S.ball(Lg,o.p,.22,CLS[o.k],{emi:.3});});
    cents.forEach((c,k)=>{S.ball(Lg,c,2.0,CLS[k],{op:.1});});
    const rpts=pts.map(o=>S.ball(Rg,o.p,.22,0x8aa0b4,{emi:.2}));
    let supCount=0,found=false,hasModel=false;const hulls=[],qmarks=[];let newR=[];
    const r2=rng(77);
    const readL=()=>u.out(kv([['Mode','supervised'],['New points predicted',supCount,'g'],['Labelled training points',pts.length]])+'<p>The model learned from labelled examples, so any new point gets a class at once.</p>');
    const g1=u.g('Supervised (left)');
    g1.btn('Predict new point',()=>{const k=Math.floor(r2()*3),c=cents[k];const p=[c[0]+nrm(r2)*1.1,c[1]+Math.abs(nrm(r2))*.5+.2,c[2]+nrm(r2)*1.1];
      const m=S.ball(Lg,[p[0],p[1]+4,p[2]],.3,0xffffff,{emi:.6});S.anim(500,t=>{m.position.y=lerp(p[1]+4,p[1],ease(t));},()=>{let b=0,bd=1e9;cents.forEach((c2,j)=>{const d=dist(p,c2);if(d<bd){bd=d;b=j;}});
        m.material=S.mat(CLS[b],{emi:.6});const lb=S.label(Lg,nameOf[b],[p[0],p[1]+.8,p[2]],{size:.4});supCount++;
        u.out(kv([['Mode','supervised'],['New points predicted',supCount,'g'],['Last prediction',nameOf[b],'a']])+'<p>The model saw labels during training, so it can assign a label to a point it has never seen.</p>');});},{pri:true});
    const g2=u.g('Unsupervised (right)');
    g2.btn('Find the groups',()=>{if(found)return;found=true;const r=rng(5);let cent=kmInit(pts.map(o=>o.p),3,r);let res;for(let i=0;i<8;i++)res=kmStep(pts.map(o=>o.p),cent),cent=res.cent;
      rpts.forEach((m,i)=>{S.anim(600,t=>{},()=>{m.material=S.mat(CLS[res.assign[i]],{emi:.3});});});
      cent.forEach((c,j)=>{hulls.push(S.ball(Rg,c,2.0,CLS[j],{op:.1}));qmarks.push(S.label(Rg,'?',[c[0],c[1]+2.4,c[2]],{size:.8,color:'#ffffff'}));});
      u.out(kv([['Groups found',3,'g'],['Group names','none','b']])+'<p>The algorithm found three groups but it cannot name them. A human has to decide what each cluster means.</p>');});
    g2.btn('Add new point',()=>{const p=[(r2()-.5)*4,1+r2()*2,(r2()-.5)*4];const m=S.ball(Rg,p,.3,0xffffff,{emi:.7});const q=S.label(Rg,'?',[p[0],p[1]+.8,p[2]],{size:.5});newR.push({m,p,q});
      if(hasModel){let b=0,bd=1e9;hullC.forEach((c2,j)=>{const d=dist(p,c2);if(d<bd){bd=d;b=j;}});m.material=S.mat(CLS[b],{emi:.7});q.userData.setText('Cluster '+(b+1));}
      u.out('<p>'+(hasModel?'A <b>supervised</b> model trained on the clusters now assigns this point to a group.':'No label exists for this point and unsupervised learning does not predict. The point stays unassigned until a supervised model is trained on the discovered clusters.')+'</p>');});
    let hullC=[];
    g2.btn('Train a supervised model on the clusters',()=>{if(!found){u.out('<p>Find the groups first. The supervised step needs the cluster labels as its training labels.</p>');return;}hasModel=true;
      hullC=hulls.map(m=>[m.position.x,m.position.y,m.position.z]);u.out('<p>Now cluster numbers act as labels. New points can be classified, but that is a <b>supervised</b> step on top of the unsupervised one.</p>');});
    readL();
   }},
  {label:'Reinforcement',view:[16,.5,1.0,[0,0.5,0]],hint:'Press Train, then watch the policy arrows form.',tip:'Top: the core loop. Bottom: a corridor of 7 states. The left end is a trap (-10), the right end is the goal (+10), every step costs -1. The agent learns by trial and error. No dataset is given.',
   build(g,u){
    const ag=S.cube(g,[-5,5,0],[2.6,1.2,1.2],C.teal,{emi:.3}),en=S.cube(g,[5,5,0],[3,1.2,1.2],C.violet,{emi:.3});
    S.label(g,'AGENT',[-5,5,0],{size:.5,color:'#04211E',bg:'#2ec4b6'});S.label(g,'ENVIRONMENT',[5,5,0],{size:.5,color:'#0b1520',bg:'#8c7bff'});
    S.arrow(g,[-3.5,5.7,0],[3.4,5.7,0],C.amber,.05);S.label(g,'action',[0,6.3,0],{size:.45,color:'#ffb400'});
    S.arrow(g,[3.4,4.3,0],[-3.5,4.3,0],C.coral,.05);S.label(g,'new state + reward',[0,3.7,0],{size:.45,color:'#ff5d73'});
    const pk=S.ball(g,[0,5.7,0],.18,C.amber,{basic:true}),pk2=S.ball(g,[0,4.3,0],.18,C.coral,{basic:true});
    S.tick((dt,t)=>{const a=(t*.5)%1;pk.position.x=lerp(-3.5,3.4,a);pk2.position.x=lerp(3.4,-3.5,(a+.5)%1);});
    const N=7,xs=i=>(i-3)*2.1,Q=[],ar=[];for(let i=0;i<N;i++)Q.push([0,0]);
    const tiles=[];for(let i=0;i<N;i++){const c=i===0?C.coral:i===N-1?C.amber:0x24384c;tiles.push(S.cube(g,[xs(i),-1.1,0],[1.9,.2,1.9],c,{emi:i===0||i===N-1?.4:0}));}
    S.label(g,'trap -10',[xs(0),.2,0],{size:.42,color:'#ff5d73'});S.label(g,'goal +10',[xs(N-1),.2,0],{size:.42,color:'#ffb400'});
    for(let i=1;i<N-1;i++){const c=new THREE.Mesh(S.G.cone,S.mat(C.sky,{op:.9}));c.scale.set(.35,.7,.35);c.position.set(xs(i),-.6,0);c.rotation.z=-Math.PI/2;c.visible=false;g.add(c);ar.push(c);}
    const bot=S.ball(g,[xs(3),-.2,0],.55,C.teal,{emi:.5});let s=3,ep=0,steps=0,ret=0,run=false,eps=.35,last=0,rr=rng(3);const hist=[];
    const act=()=>{if(rr()<eps)return rr()<.5?0:1;return Q[s][0]===Q[s][1]?(rr()<.5?0:1):(Q[s][0]>Q[s][1]?0:1);};
    const step=()=>{const a=act(),ns=s+(a?1:-1);const done=ns===0||ns===N-1;const rw=ns===0?-10:ns===N-1?10:-1;const best=done?0:Math.max(Q[ns][0],Q[ns][1]);
      Q[s][a]+=.5*(rw+.9*best-Q[s][a]);ret+=rw;steps++;s=ns;if(done){ep++;hist.push(ret);last=ret;ret=0;s=3;steps=0;}
      bot.position.x=xs(s);ar.forEach((c,k)=>{const i=k+1;const q=Q[i];const mx=Math.max(q[0],q[1]);c.visible=ep>0||mx!==0;c.rotation.z=q[1]>=q[0]?-Math.PI/2:Math.PI/2;});};
    const tm=S.every(130,()=>{if(run)step();});
    const upd=()=>u.out(kv([['Episodes',ep],['Last return',fx(last,0),last>0?'g':'b'],['Exploration (epsilon)',fx(eps,2)]])+'<p>Arrows show the learned <b>policy</b>: the best action in each state. The policy emerges from rewards, not from labelled examples.</p>');
    const pb=u.btn('Train',()=>{run=!run;pb.textContent=run?'Pause':'Train';},{pri:true});
    u.btn('Reset',()=>{for(let i=0;i<N;i++)Q[i]=[0,0];ep=0;last=0;s=3;ret=0;ar.forEach(c=>c.visible=false);bot.position.x=xs(3);});
    u.slider('Exploration (epsilon)',0,1,.05,eps,v=>eps=v,v=>fx(v,2));
    S.every(300,upd);upd();
   }},
  {label:'Technique and strategy',view:[17,.4,1.05,[0,1,0]],hint:'Switch paradigm, then compare transfer learning.',tip:'A deep network is a technique: the same stack of layers can serve any paradigm. With transfer learning the early layers (teal) are reused and only the head (amber) is fine-tuned.',
   build(g,u){
    const layers=[3,5,6,5,3],Xs=[-7,-3.5,0,3.5,7];const cols=[];const nodes=[];
    layers.forEach((n,i)=>{const arr=[];for(let j=0;j<n;j++){arr.push(S.ball(g,[Xs[i],(j-(n-1)/2)*1.4+1.5,0],.3,C.sky,{emi:.3}));}nodes.push(arr);});
    for(let i=0;i<4;i++){const pairs=[];nodes[i].forEach(a=>nodes[i+1].forEach(b=>pairs.push([[a.position.x,a.position.y,0],[b.position.x,b.position.y,0]])));S.segs(g,pairs,0x35506b,.5);}
    const paint=(tl)=>nodes.forEach((arr,i)=>arr.forEach(m=>{m.material=S.mat(tl?(i<3?C.teal:C.amber):C.sky,{emi:.35});}));
    const plab=S.label(g,'',[0,6.6,0],{size:.65,color:'#ffffff'});const io=S.label(g,'',[0,-2.9,0],{size:.5,color:'#9db2c7'});
    const par={SL:['Supervised: inputs and labels, predict the label','input + label'],UL:['Unsupervised: no labels, find structure','input only'],RL:['Reinforcement: state in, action values out, reward trains it','state + reward']};
    let tl=false,n=100;
    const setP=k=>{plab.userData.setText(par[k][0]);io.userData.setText('Training signal: '+par[k][1]);u.press(bS,k==='SL');u.press(bU,k==='UL');u.press(bR,k==='RL');};
    const gp=u.g('Same deep network, different paradigm');
    const bS=gp.btn('Supervised',()=>setP('SL'),{toggle:true,on:true}),bU=gp.btn('Unsupervised',()=>setP('UL'),{toggle:true}),bR=gp.btn('Reinforcement',()=>setP('RL'),{toggle:true});
    const gt=u.g('Transfer learning');
    gt.toggle('Reuse a pre-trained model (freeze early layers)',false,v=>{tl=v;paint(v);rd();});
    gt.slider('Labelled examples for the new task',10,2000,10,n,v=>{n=v;rd();});
    const acc=(k,t)=>0.5+0.45*(1-Math.exp(-k/t));
    const bars=[S.cube(g,[-3,-5.2,0],[1.2,1,1.2],C.sky),S.cube(g,[3,-5.2,0],[1.2,1,1.2],C.teal)];
    S.label(g,'from scratch',[-3,-6.4,0],{size:.45});S.label(g,'with transfer',[3,-6.4,0],{size:.45});
    const rd=()=>{const a=acc(n,420),b=acc(n,45);bars[0].scale.y=a*5;bars[0].position.y=-7.6+a*2.5+.0;bars[1].scale.y=b*5;bars[1].position.y=-7.6+b*2.5;
      u.out(kv([['Examples',n],['From scratch',fx(a*100,0)+'%','a'],['With transfer',fx(b*100,0)+'%','g']])+'<p>Illustrative curves: a pre-trained model has already learned general features (edges, textures, shapes), so it needs far fewer labelled examples. Transfer learning is a <b>strategy</b>, not a fourth paradigm.</p>');};
    paint(false);setP('SL');rd();
   }}
  ]);
};
