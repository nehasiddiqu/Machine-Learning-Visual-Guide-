/* ===== scenes: A4.4.1 and A4.4.2 ===== */
SC.a441=function(S){
 S.modes([
 {label:'Nine issues',view:[19,.8,1.0,[0,0,0]],hint:'Click a block, or use Next issue.',tip:'Each block is one ethical issue. Click it to read what it means, why it matters and a real example. A real system usually touches several at once.',
  build(g,u){
   const IS=[
    ['Accountability','Who is responsible when an ML system causes harm.','Responsibility is shared between developer, company and user, and the law has not settled it, so people harmed may have no one answerable.','A self-driving car causes a fatal crash and there is no agreed answer on who is at fault.',C.coral],
    ['Algorithmic fairness','Outcomes should be equitable across groups.','"Fair" can be defined in competing ways, and a model tuned for overall accuracy may still treat some groups worse.','A reoffending-risk model giving harsher scores to one ethnic group for the same behaviour.',C.amber],
    ['Bias','Systematically unfair results, usually learned from the data.','Training data reflects an unequal world, so the model learns and can amplify the unfairness. Nobody needs to intend it.','A recruiting tool marks down CVs mentioning "women\'s" because past hires were mostly men.',C.violet],
    ['Consent','Whether people genuinely agreed to their data being used.','Clicking "accept" on a long agreement is not understanding, so informed consent is often missing.','An old photo used to train a face-recognition system its subject has never heard of.',C.sky],
    ['Environmental impact','The energy and carbon cost of training and running models.','Data centres use a great deal of electricity and the cost grows as models get larger.','Training one large model can release significant carbon dioxide.',C.lime],
    ['Privacy','Protecting personal data that models collect and use.','Pattern-finding can reveal things people never meant to share.','Inferring a health condition or beliefs from purchases or liked posts.',C.teal],
    ['Security','Models can be attacked or tricked.','Adversarial inputs change things too little for a person to notice but enough to fool a model, with dangerous results.','Stickers on a stop sign make a self-driving car read a speed-limit sign.',C.coral],
    ['Societal impact','Broad effects of widespread ML on society.','Jobs lost to automation, widening inequality and changes to how people find information can affect whole groups at once.','Automated systems replacing customer-service or transport roles.',C.amber],
    ['Transparency','Whether a decision can be explained.','The most accurate models are often black boxes, so affected people cannot see why a decision was made or challenge it.','A person refused a loan by a deep-learning model cannot learn why, so cannot appeal.',C.violet]];
   S.floor(g,24,24,0);const R=7;const cs=[];
   IS.forEach((s,i)=>{const a=-Math.PI/2+i*2*Math.PI/9,p=[Math.cos(a)*R,.8,Math.sin(a)*R];const c=S.cube(g,p,[2.5,1.6,2.5],s[4],{emi:.25});c.userData={i,c:s[4]};cs.push(c);S.label(g,s[0],[p[0],2.5,p[2]],{size:.55});});
   S.ball(g,[0,1,0],1.3,0x35506b,{emi:.2});S.label(g,'An ML system',[0,2.9,0],{size:.6});
   let cur=-1;
   const show=i=>{cur=i;cs.forEach((c,j)=>{c.material=S.mat(c.userData.c,{emi:j===i?.95:.25});c.scale.y=j===i?2.2:1.6;c.position.y=j===i?1.1:.8;});const s=IS[i];
     u.out('<p><b>'+s[0]+':</b> '+s[1]+'</p><p><b>Why it matters:</b> '+s[2]+'</p><p><b>Example:</b> '+s[3]+'</p>');};
   S.onPick(cs,o=>show(o.userData.i));
   u.btn('Next issue',()=>show((cur+1)%9),{pri:true});
   const gt=u.g('Tensions to weigh');gt.btn('Privacy vs accuracy',()=>{u.out('<p>More personal data can mean better predictions, but at a cost to <b>privacy</b> and <b>consent</b>. A good discussion weighs both.</p>');});gt.btn('Accuracy vs transparency',()=>{u.out('<p>The most accurate models are often black boxes. Gaining predictive power can mean losing <b>transparency</b>, which also weakens <b>accountability</b>.</p>');});
   u.out('<p>Click a block to read about that issue.</p>');
  }},
 {label:'Bias feedback loop',view:[22,.75,1.0,[0,3,0]],hint:'Run cycles and watch the bias grow.',tip:'Two districts have exactly the same real crime (ghost outlines). A model trained on last cycle\'s recorded arrests sends patrols where more arrests were recorded. More patrols there produce more recorded arrests next cycle.',
  build(g,u){
   S.floor(g,26,26,0);
   const nodes=[['Biased data',[-7,6,-7],C.coral],['Model learns the bias',[0,9.5,-7],C.violet],['Patrols sent there',[7,6,-7],C.amber]];
   nodes.forEach(n=>{S.ball(g,n[1],.9,n[2],{emi:.5});S.label(g,n[0],[n[1][0],n[1][1]+1.6,n[1][2]],{size:.55});});
   S.arrow(g,[-6,6.5,-7],[-1,9,-7],0x6b8299,.07);S.arrow(g,[1,9,-7],[6,6.5,-7],0x6b8299,.07);S.arrow(g,[6,5.5,-7],[-6,5.5,-7],C.coral,.08);S.label(g,'more arrests recorded: confirms the model',[0,4.4,-7],{size:.5,color:'#ff8093'});
   const A=tw(S,g,-4,0,.1,C.coral,3.2),B=tw(S,g,4,0,.1,C.sky,3.2);
   const gA=S.cube(g,[-4,2,0],[3.6,4,3.6],0xffffff,{op:.1}),gB=S.cube(g,[4,2,0],[3.6,4,3.6],0xffffff,{op:.1});
   S.label(g,'District A',[-4,-.9,2.4],{size:.55});S.label(g,'District B',[4,-.9,2.4],{size:.55});S.label(g,'Real crime is equal (outline)',[0,4.8,1.5],{size:.45,color:'#e8f1f8'});
   const al=S.label(g,'',[-4,0,0],{size:.5,color:'#ffffff'}),bl=S.label(g,'',[4,0,0],{size:.5,color:'#ffffff'});
   let p0=.55,ps=.55,cyc=0,hist=[.55];const GAM=1.6;
   const draw=()=>{setH(A,ps*8);setH(B,(1-ps)*8);al.position.set(-4,ps*8+.9,0);bl.position.set(4,(1-ps)*8+.9,0);al.userData.setText(Math.round(ps*100)+'% of patrols');bl.userData.setText(Math.round((1-ps)*100)+'% of patrols');
     u.out(kv([['Cycle',cyc],['Patrols to A',Math.round(ps*100)+'%',ps>.7?'b':'a'],['Patrols to B',Math.round((1-ps)*100)+'%'],['True crime','50% / 50%','g']])+'<p>History of A\'s share: '+hist.map(v=>Math.round(v*100)+'%').join(' → ')+'</p><p>The starting gap was small, but each cycle the model trusts its own recorded data more. <b>The bias is not just repeated but amplified.</b> "Garbage in, garbage out": the fault is in the data, not an algorithm written to be unfair.</p>');};
   const cycle=()=>{ps=Math.pow(ps,GAM)/(Math.pow(ps,GAM)+Math.pow(1-ps,GAM));cyc++;hist.push(ps);if(hist.length>9)hist.shift();draw();};
   const reset=()=>{ps=p0;cyc=0;hist=[p0];draw();};
   u.btn('Run one cycle',cycle,{pri:true});u.btn('Run 5 cycles',()=>{for(let i=0;i<5;i++)cycle();});u.btn('Reset',reset);
   u.slider('Starting patrol share to A',50,70,1,55,v=>{p0=v/100;reset();},v=>v+'%');
   draw();
  }},
 {label:'Engagement feed',view:[19,.8,1.0,[0,1,0]],hint:'Click the top post a few times.',tip:'Each block is a post. Colour is its viewpoint (four viewpoints); height is how sensational it is. The eight raised posts with a glowing base are the ones the algorithm shows. Score = sensationalism plus similarity to what the user clicked before.',
  build(g,u){
   S.floor(g,24,24,0);const VC=[C.teal,C.amber,C.coral,C.violet],VN=['Viewpoint A','Viewpoint B','Viewpoint C','Viewpoint D'];
   const rr=rng(21);const P=[];for(let i=0;i<24;i++)P.push({v:i%4,s:.15+rr()*.85});
   VN.forEach((n,i)=>S.label(g,n,[-10.6,0,-3+i*2],{size:.45,color:'#'+VC[i].toString(16).padStart(6,'0')}));
   P.forEach((p,i)=>{p.x=((i%6)-2.5)*2.3;p.z=(Math.floor(i/6)-1.5)*2.3;p.pad=S.cube(g,[p.x,.05,p.z],[2,.1,2],0x24384c);p.m=S.cube(g,[p.x,.5,p.z],[1.5,1,1.5],VC[p.v],{emi:.2});p.m.userData={i};});
   let hist=[0,0,0,0],bal=false,shown=[];
   const aff=v=>{const t=hist.reduce((a,b)=>a+b,0);return t?hist[v]/t:.25;};
   const rank=()=>{const sc=P.map((p,i)=>({i,sc:.6*p.s+.4*aff(p.v)}));sc.sort((a,b)=>b.sc-a.sc);
     if(!bal)return sc.slice(0,8).map(x=>x.i);const out=[];for(let v=0;v<4;v++)out.push(...sc.filter(x=>P[x.i].v===v).slice(0,2).map(x=>x.i));return out.sort((a,b)=>sc.findIndex(x=>x.i===a)-sc.findIndex(x=>x.i===b));};
   const upd=()=>{shown=rank();P.forEach((p,i)=>{const on=shown.includes(i);const hh=.5+p.s*2.4;p.m.scale.y=hh;p.m.position.y=.2+hh/2;p.m.material=S.mat(VC[p.v],{emi:on?.6:0,op:on?1:.28});p.pad.material=S.mat(on?C.lime:0x24384c,{emi:on?.8:0});});
     const mix=[0,0,0,0];shown.forEach(i=>mix[P[i].v]++);const avg=shown.reduce((s,i)=>s+P[i].s,0)/shown.length;const distinct=mix.filter(x=>x>0).length;
     u.out(kv([['Viewpoints in feed',distinct+' of 4',distinct<=1?'b':distinct<4?'a':'g'],['Mix (A/B/C/D)',mix.join(' / ')],['Average sensationalism',fx(avg*100,0)+'%',avg>.7?'b':'a'],['Clicks so far',hist.reduce((a,b)=>a+b,0)]])+'<p>'+(bal?'<b>Balanced feed:</b> two posts per viewpoint are guaranteed, so the user keeps seeing other views even after many clicks. Sensational posts are still ranked first within each viewpoint.':'<b>Engagement only:</b> sensational posts rank highest, and after clicks the algorithm favours the same viewpoint. Click several times and the feed collapses to one viewpoint: a <b>filter bubble</b>, which can deepen polarisation and speed the spread of misinformation.')+'</p>');};
   u.btn('Click the top post',()=>{hist[P[shown[0]].v]++;upd();},{pri:true});
   u.toggle('Balanced feed (guarantee variety)',false,v=>{bal=v;upd();});u.btn('Reset user history',()=>{hist=[0,0,0,0];upd();});
   S.onPick(P.map(p=>p.m),o=>{hist[P[o.userData.i].v]++;upd();});
   upd();
  }}
 ]);
};

SC.a442=function(S){
 const TECH=['Pervasive AI','Augmented reality','Virtual reality','Quantum computing'],AREA=['Society','Individual rights','Privacy','Equity'];
 const TXT=[
  ['Job displacement','Mass surveillance','Always-on monitoring','Unequal access to beneficial AI'],
  ['Digital divide','Recording others without consent','Who owns the data','Advantage to those who can afford it'],
  ['Social isolation','Immersive persuasion','Gaze and emotion data','Cost of access'],
  ['Little direct concern here','Little direct concern here','Breaks the encryption that protects data','Power concentrated in a few governments and firms']];
 const LV=[[3,3,3,2],[1.6,3,2.4,2],[2.6,2,3,2],[0,0,3,3]];
 const BEN=['More efficient city systems and personalised services','Useful information overlaid on the world (surgery, navigation, education)','Safe training, therapy for phobias and connection across distance','Simulating molecules for new medicines; training stronger AI'];
 S.modes([
 {label:'Four technologies',view:[20,.85,1.0,[0,1.5,0]],hint:'Click a tower to read the concern.',tip:'Rows are technologies, columns are the four impact areas. Tower height shows how strong the concern is; the grey stub means little direct concern. This is a starting point for discussion, not a verdict.',
  build(g,u){
   S.floor(g,22,22,0);const cs=[];const AC=[C.sky,C.amber,C.violet,C.teal];
   TECH.forEach((t,ti)=>{S.label(g,t,[-9.6,.2,(ti-1.5)*3.6],{size:.5});AREA.forEach((a,ai)=>{const lv=LV[ti][ai];const h=lv?lv*1.3:.2;const m=tw(S,g,(ai-1.5)*3.6,(ti-1.5)*3.6,h,lv?AC[ai]:0x4a6a8a,2.4);m.userData={ti,ai};cs.push(m);});});
   AREA.forEach((a,ai)=>S.label(g,a,[(ai-1.5)*3.6,.2,7.4],{size:.5,color:'#'+AC[ai].toString(16).padStart(6,'0')}));
   const show=(ti,ai)=>{cs.forEach(m=>{const on=m.userData.ti===ti&&m.userData.ai===ai;m.material=S.mat(LV[m.userData.ti][m.userData.ai]?AC[m.userData.ai]:0x4a6a8a,{emi:on?.9:.15,op:on||ti==null?1:.55});});
     u.out('<p><b>'+TECH[ti]+' and '+AREA[ai].toLowerCase()+':</b> '+TXT[ti][ai]+'.</p><p><b>Key benefit to weigh against it:</b> '+BEN[ti]+'.</p>');};
   S.onPick(cs,o=>show(o.userData.ti,o.userData.ai));
   TECH.forEach((t,i)=>u.btn(t,()=>{const row=cs.filter(m=>m.userData.ti===i);cs.forEach(m=>{const on=m.userData.ti===i;m.material=S.mat(LV[m.userData.ti][m.userData.ai]?AC[m.userData.ai]:0x4a6a8a,{emi:on?.6:0,op:on?1:.3});});
     u.out('<p><b>'+t+'.</b> Benefit: '+BEN[i]+'.</p><p>Concerns: '+AREA.map((a,k)=>'<b>'+a+'</b> ('+TXT[i][k].toLowerCase()+')').join('; ')+'.</p>');}));
   u.out('<p>Click a tower, or choose a technology.</p>');
  }},
 {label:'Weigh it up',view:[20,.45,1.1,[0,3,0]],hint:'Click a block to change its weight.',tip:'Benefits sit on the left pan and risks on the right. Click any block to cycle its weight from 1 to 3 and watch the balance. The tilt is your judgement, not a fixed fact.',
  build(g,u){
   const ITEMS=[
    [['Efficient cities','Personalised services','Smarter homes'],['Job displacement','Mass surveillance','Unequal access']],
    [['Info where needed','Better navigation','Education'],['Recording consent','Data ownership','Digital divide']],
    [['Safe training','Therapy','Presence'],['Social isolation','Gaze/emotion data','Cost of access']],
    [['New medicines','Stronger AI','Simulation'],['Breaks encryption','Power concentrated','Unequal capability']]];
   S.floor(g,22,22,0);S.cube(g,[0,2,0],[.6,4,.6],0x4a6a8a);S.cube(g,[0,.15,0],[4,.3,2.4],0x4a6a8a);
   const beam=new THREE.Group();beam.position.set(0,4.2,0);g.add(beam);S.bar(beam,[-6.5,0,0],[6.5,0,0],.12,0x8aa0b4);S.ball(g,[0,4.2,0],.35,C.amber,{emi:.4});
   const mkPan=(x,col)=>{const p=new THREE.Group();p.position.set(x,0,0);beam.add(p);S.bar(p,[-2,-3.4,0],[0,0,0],.04,0x6b8299);S.bar(p,[2,-3.4,0],[0,0,0],.04,0x6b8299);S.cube(p,[0,-3.5,0],[4.8,.2,2.2],col,{emi:.2});return p;};
   const pL=mkPan(-6,C.teal),pR=mkPan(6,C.coral);S.label(g,'BENEFITS',[-6,-1,2.2],{size:.55,color:'#2ec4b6'});S.label(g,'RISKS',[6,-1,2.2],{size:.55,color:'#ff8093'});
   let ti=0,W,cubes,labs,cur=0,tgt=0;
   const build=()=>{cubes&&cubes.forEach(c=>c.parent&&c.parent.remove(c));labs&&labs.forEach(l=>l.parent&&l.parent.remove(l));W=[[1,1,1],[1,1,1]];cubes=[];labs=[];
     [0,1].forEach(sd=>[0,1,2].forEach(k=>{const pan=sd?pR:pL;const c=S.cube(pan,[(k-1)*1.55,-3.4,0],[1.3,1,1.3],sd?C.coral:C.teal,{emi:.3});c.userData={sd,k};cubes.push(c);const l=S.label(pan,ITEMS[ti][sd][k],[(k-1)*1.55,-2,0],{size:.38,color:'#ffffff'});labs.push(l);}));upd();};
   const upd=()=>{cubes.forEach(c=>{const w=W[c.userData.sd][c.userData.k],hh=.4+w*.55;c.scale.y=hh;c.position.y=-3.4+hh/2;});labs.forEach((l,i)=>{const c=cubes[i],w=W[c.userData.sd][c.userData.k];l.position.y=-3.4+(.4+w*.55)+.5;});
     const sb=W[0].reduce((a,b)=>a+b,0),sr=W[1].reduce((a,b)=>a+b,0);tgt=-clamp((sr-sb)/6,-1,1)*.38;
     u.out(kv([['Technology',TECH[ti]],['Benefit weight',sb,'g'],['Risk weight',sr,'b'],['Balance',sr>sb?'tips to risks':sr<sb?'tips to benefits':'level','a']])+'<p>'+(sr>sb?'On these weights the risks outweigh the benefits, so you might argue for strict limits or governance before wide use.':sr<sb?'On these weights the benefits outweigh the risks, but a good answer still names the risks and how they could be managed.':'The two sides balance. A discuss answer would now have to justify why one side matters more.')+' Different people weigh these differently; the skill is to <b>give a supported view</b>.</p>');};
   S.tick(dt=>{cur+=(tgt-cur)*Math.min(1,dt*4);beam.rotation.z=cur;pL.rotation.z=-cur;pR.rotation.z=-cur;});
   u.sel('Technology',TECH.map((t,i)=>[i,t]),0,v=>{ti=+v;build();});
   u.btn('Reset weights',()=>{W=[[1,1,1],[1,1,1]];upd();});
   build();
   S.picks.push({get objs(){return cubes;},fn:o=>{const d=o.userData;W[d.sd][d.k]=W[d.sd][d.k]%3+1;upd();}});
  }},
 {label:'Guidelines fall behind',view:[22,.7,1.0,[0,3,0]],hint:'Change how often guidelines are reviewed.',tip:'Sky towers: what the technology can do over time. Amber towers: what the guidelines cover. Coral on top: the gap, where situations arise that no rule anticipated. Each step is a few years.',
  build(g,u){
   S.floor(g,26,26,0);const NS=20,X=t=>(t-9.5)*1.05;
   const cap=t=>.25*Math.pow(1.18,t);
   const cT=[],gT=[],gapT=[];for(let t=0;t<NS;t++){cT.push(tw(S,g,X(t),-.6,cap(t),C.sky,.8));gT.push(tw(S,g,X(t),.6,.1,C.amber,.8));gapT.push(S.cube(g,[X(t),0,.6],[.8,.1,.8],C.coral,{op:.6,emi:.5}));}
   S.label(g,'Time →',[0,-.9,3],{size:.55});S.label(g,'Technology capability',[-7,7.8,-.6],{size:.5,color:'#4cc9f0'});S.label(g,'Guidelines',[7,7.8,.6],{size:.5,color:'#ffb400'});
   let iv=6,never=false;
   const upd=()=>{let tot=0,fin=0;for(let t=0;t<NS;t++){const rv=never?0:Math.floor(t/iv)*iv;const gd=cap(rv);const gap=cap(t)-gd;setH(gT[t],gd);gapT[t].scale.y=Math.max(.02,gap);gapT[t].position.y=gd+Math.max(.02,gap)/2;tot+=gap;if(t===NS-1)fin=gap;}
     const pct=fin/cap(NS-1)*100;
     u.out(kv([['Review interval',never?'never':'every '+iv+' steps'],['Gap at the end',fx(fin,1),pct>50?'b':pct>20?'a':'g'],['Share of capability uncovered',Math.round(pct)+'%',pct>50?'b':'g'],['Average gap',fx(tot/NS,2)]])+'<p>Technology keeps growing but guidelines only change when they are reviewed. '+(never?'With <b>no review</b> the rules from the start stay fixed while capability races ahead, so most of what the technology can do is covered by no rule.':iv<=3?'Frequent review keeps the gap small, so society can shape the technology instead of only reacting to harm.':'The gap opens between reviews and is largest just before each one. Being <b>proactive</b> (reviewing sooner) keeps the rules in step.')+' The aim is not to halt progress but to keep rules in step with what the technology can now do.</p>');};
   u.slider('Review guidelines every N steps',1,20,1,iv,v=>{iv=v;upd();});u.toggle('Never review',false,v=>{never=v;upd();});
   upd();
  }}
 ]);
};
