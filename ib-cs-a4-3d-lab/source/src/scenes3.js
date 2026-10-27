/* ===== scenes: A4.3.1 to A4.3.5 ===== */
SC.a431=function(S){
 const mkData=(kind)=>{const r=rng(kind?7:3);const d=[];for(let i=0;i<16;i++){const x=.4+i*.6+r()*.2;let y=kind?45+1.5*x+nrm(r)*20:10*x+2+nrm(r)*6;d.push([x,Math.max(2,Math.min(98,y))]);}return d;};
 const X=x=>(x-5)*1.4,Y=y=>y*.1;
 const bestFit=D=>{const n=D.length,mx=D.reduce((s,p)=>s+p[0],0)/n,my=D.reduce((s,p)=>s+p[1],0)/n;let a=0,b=0;D.forEach(p=>{a+=(p[0]-mx)*(p[1]-my);b+=(p[0]-mx)**2;});const m=a/b;return{m,c:my-m*mx,my};};
 S.modes([
 {label:'Fit a line',view:[19,.55,1.1,[0,4.5,0]],hint:'Move sliders; residual sticks show the error.',tip:'Teal spheres are data. The amber line is yours. Red sticks are residuals (the distance from each point to your line). The glass line is the line of best fit.',
  build(g,u){
   S.floor(g,16,16,0);S.axes(g,11,['x predictor','y response',''],{flat:true,min:0});
   let kind=0,D=mkData(0),m=3,c=30,showBest=false,pts=[],res=[],yl,bl,pm,pred=6;
   yl=S.bar(g,[0,0,0],[1,1,0],.07,C.amber,{emi:.5});bl=S.bar(g,[0,0,0],[1,1,0],.05,C.teal,{op:.5});
   const pk=S.ball(g,[0,0,0],.28,C.white,{basic:true}),pkl=S.label(g,'',[0,0,0],{size:.45,color:'#ffffff'});
   const build2=()=>{pts.forEach(o=>g.remove(o));res.forEach(o=>g.remove(o));pts=[];res=[];D=mkData(kind);D.forEach(p=>{pts.push(S.ball(g,[X(p[0]),Y(p[1]),0],.2,C.teal,{emi:.3}));res.push(S.bar(g,[X(p[0]),Y(p[1]),0],[X(p[0]),Y(p[1]),0],.025,C.coral));});};
   const upd=()=>{const bf=bestFit(D);const sse=(mm,cc)=>D.reduce((s,p)=>s+(p[1]-(mm*p[0]+cc))**2,0);const sst=D.reduce((s,p)=>s+(p[1]-bf.my)**2,0);
     const e=sse(m,c),eb=sse(bf.m,bf.c);const r2=1-eb/sst;
     S.setBar(yl,[X(0),Y(c),0],[X(10),Y(m*10+c),0]);
     S.setBar(bl,[X(0),Y(bf.c),0],[X(10),Y(bf.m*10+bf.c),0]);bl.visible=showBest;
     D.forEach((p,i)=>S.setBar(res[i],[X(p[0]),Y(p[1]),0],[X(p[0]),Y(m*p[0]+c),0]));
     const yp=m*pred+c;pk.position.set(X(pred),Y(yp),0);pkl.position.set(X(pred),Y(yp)+.9,0);pkl.userData.setText('x='+pred+' gives '+fx(yp,1));
     u.out(kv([['Your line','y = '+fx(m,1)+'x + '+fx(c,1)],['Your total error',fx(e,0),e<=eb*1.1?'g':'a'],['Best-fit error',fx(eb,0)],['r² of best fit',fx(r2,2),r2>.7?'g':'b']])+'<p><b>Slope</b> '+fx(m,1)+': y changes by about '+fx(m,1)+' for each extra unit of x. <b>Intercept</b> '+fx(c,1)+': the prediction when x = 0. The best-fit line minimises the overall distance to the points. r² = '+fx(r2,2)+' means the line explains about '+fx(r2*100,0)+'% of the variation in y.</p>');};
   build2();
   u.slider('Slope m',-5,20,.5,m,v=>{m=v;upd();},v=>fx(v,1));
   u.slider('Intercept c',0,70,1,c,v=>{c=v;upd();},v=>fx(v,0));
   u.slider('Predict at x',0,10,.5,pred,v=>{pred=v;upd();},v=>fx(v,1));
   u.toggle('Show line of best fit',false,v=>{showBest=v;upd();});
   u.btn('Snap to best fit',()=>{const bf=bestFit(D);m=Math.round(bf.m*2)/2;c=Math.round(bf.c);showBest=true;upd();},{pri:true});
   const gs=u.g('Dataset');
   gs.btn('Hours studied (strong)',()=>{kind=0;build2();upd();},{toggle:true,on:true});gs.btn('Attendance (weak)',()=>{kind=1;build2();upd();});
   upd();
  }},
 {label:'Weak vs strong fit (r²)',view:[24,.7,1.05,[0,4,0]],hint:'Two predictors of the same score.',tip:'Left: attendance, a weak predictor. Right: hours studied, a strong predictor. r² is the share of variation in the score that the line explains.',
  build(g,u){
   S.floor(g,26,26,0);
   const panel=(kind,ox,label)=>{const D=mkData(kind),bf=bestFit(D);const sst=D.reduce((s,p)=>s+(p[1]-bf.my)**2,0),sse=D.reduce((s,p)=>s+(p[1]-(bf.m*p[0]+bf.c))**2,0),r2=1-sse/sst;
     const gx=x=>(x-5)*.9+ox;S.bar(g,[gx(0),0,0],[gx(10),0,0],.03,0x6b8299);S.bar(g,[gx(0),0,0],[gx(0),8,0],.03,0x6b8299);
     D.forEach(p=>{const q=[gx(p[0]),p[1]*.08,0];S.ball(g,q,.17,C.teal,{emi:.3});S.bar(g,q,[q[0],(bf.m*p[0]+bf.c)*.08,0],.02,C.coral);});
     S.bar(g,[gx(0),bf.c*.08,0],[gx(10),(bf.m*10+bf.c)*.08,0],.06,C.amber,{emi:.5});
     S.label(g,label,[ox,9.6,0],{size:.65});S.label(g,'r² = '+fx(Math.max(r2,0),2),[ox,8.7,0],{size:.7,color:r2>.5?'#52da9f':'#ff8093'});return r2;};
   const a=panel(1,-7,'Attendance vs score'),b=panel(0,7,'Hours studied vs score');
   u.out(kv([['r², attendance',fx(Math.max(a,0),2),'b'],['r², hours studied',fx(b,2),'g']])+'<p>Red sticks are the gaps between points and the line. When they are short, the line explains most of the variation (r² near 1). When they are long, it explains little (r² near 0). A high r² does not prove the predictor causes the response.</p>');
  }}
 ]);
};

SC.a432=function(S){
 S.modes([
 {label:'K-NN',view:[17,.6,1.0,[0,2,0]],hint:'Click the floor to drop a new point.',tip:'Teal and amber spheres are labelled training points described by three features (x, z and height). Click the floor to place a new unlabelled point. The slider sets its height.',
  build(g,u){
   const r=rng(12);const P=[];for(let i=0;i<14;i++)P.push({p:[-3+nrm(r)*1.5,1.2+r()*2.2,-2+nrm(r)*1.5],c:0});for(let i=0;i<14;i++)P.push({p:[3+nrm(r)*1.5,1.5+r()*2.4,2+nrm(r)*1.5],c:1});P.push({p:[-2.4,2.2,-1.6],c:1});P.push({p:[2.4,2.2,1.4],c:0});
   const fl=S.plane(g,[0,0,0],16,16,0x15283a,{op:.9});S.floor(g,16,16,.01);
   const cl=[C.teal,C.amber],nm=['Class A','Class B'];
   P.forEach(o=>{o.m=S.ball(g,o.p,.28,cl[o.c],{emi:.35});S.bar(g,[o.p[0],0,o.p[2]],o.p,.012,0x35506b);});
   let k=3,np=null,gp=null,hgt=2;
   const run=()=>{if(gp)g.remove(gp);gp=new THREE.Group();g.add(gp);if(!np)return;
     const ds=P.map(o=>({o,d:dist(o.p,np)})).sort((a,b)=>a.d-b.d);const nn=ds.slice(0,k);const votes=[0,0];nn.forEach(x=>votes[x.o.c]++);const win=votes[0]===votes[1]?(nn[0].o.c):(votes[0]>votes[1]?0:1);
     nn.forEach(x=>S.bar(gp,np,x.o.p,.04,cl[x.o.c],{op:.9}));S.ball(gp,np,.38,cl[win],{emi:.7});const ring=S.ball(gp,np,nn[nn.length-1].d,0xffffff,{op:.08});
     S.label(gp,nm[win]+'?',[np[0],np[1]+1,np[2]],{size:.5,color:'#ffffff'});
     u.out(kv([['k',k],['Class A votes',votes[0],win===0?'g':''],['Class B votes',votes[1],win===1?'g':''],['Prediction',nm[win],'a']])+'<p>The '+k+' nearest labelled points (joined by lines) vote. The translucent sphere reaches the furthest of them. '+(k===1?'With k = 1 a single odd or mislabelled point decides the answer, so the model is sensitive to noise.':k>=9?'A large k smooths noise but starts to blur genuine boundaries between the classes.':'The majority class becomes the prediction. K-NN builds no model beforehand.')+'</p>');};
   S.onPick([fl],(o,hit)=>{np=[hit.point.x,hgt,hit.point.z];run();});
   u.slider('k (neighbours that vote)',1,11,2,k,v=>{k=v;run();});
   u.slider('New point height (feature 3)',.5,4,.1,hgt,v=>{hgt=v;if(np){np[1]=v;run();}},v=>fx(v,1));
   u.btn('Drop a random point',()=>{np=[(Math.random()-.5)*9,hgt,(Math.random()-.5)*9];run();},{pri:true});
   u.out('<p>Click on the floor to place a new point. K-NN will classify it by majority vote of its k nearest labelled neighbours.</p>');
  }},
 {label:'Decision tree',view:[17,.5,1.15,[0,3,0]],hint:'Toggle the symptoms, then walk the path.',tip:'Root node (violet), decision nodes (sky) and leaf nodes (amber). Every root-to-leaf path is one rule.',
  build(g,u){
   const N={root:[0,10,0],f1:[-5,6,0],f2:[5,6,0],l1:[-7.5,2,0],l2:[-2.5,2,0],l3:[2.5,2,0],l4:[7.5,2,0]};
   const nodes={};const mk=(k,txt,col,leaf)=>{const m=leaf?S.cube(g,N[k],[2.6,1.2,1],col,{emi:.3}):S.ball(g,N[k],.9,col,{emi:.4});nodes[k]=m;S.label(g,txt,[N[k][0],N[k][1]+(leaf?.0:1.7),N[k][2]],{size:leaf?.42:.5,color:leaf?'#0b1520':'#ffffff',bg:leaf?'#ffb400':null});};
   mk('root','Fever?',C.violet);mk('f1','Cough?',C.sky);mk('f2','Cough?',C.sky);mk('l1','Likely flu',C.amber,true);mk('l2','Check other symptoms',C.amber,true);mk('l3','Likely cold',C.amber,true);mk('l4','Check other symptoms',C.amber,true);
   const E=[['root','f1','Yes'],['root','f2','No'],['f1','l1','Yes'],['f1','l2','No'],['f2','l3','Yes'],['f2','l4','No']];const eb={};
   E.forEach(e=>{eb[e[0]+e[1]]=S.bar(g,N[e[0]],N[e[1]],.05,0x4a6a8a);S.label(g,e[2],[(N[e[0]][0]+N[e[1]][0])/2+(e[1].startsWith('l')?(N[e[1]][0]<N[e[0]][0]?-.7:.7):(N[e[1]][0]<0?-.7:.7)),(N[e[0]][1]+N[e[1]][1])/2,0],{size:.4,color:'#ffb400'});});
   S.label(g,'ROOT NODE',[-6.5,10,0],{size:.45,color:'#8c7bff'});S.label(g,'DECISION NODES',[-9,6,0],{size:.45,color:'#4cc9f0'});S.label(g,'LEAF NODES',[-10.6,2,0],{size:.45,color:'#ffb400'});
   let fev=true,cou=true;const marker=S.ball(g,N.root,.35,C.white,{basic:true});marker.visible=false;
   const walk=()=>{Object.values(eb).forEach(b=>b.material=S.mat(0x4a6a8a));const a=fev?'f1':'f2',leaf=a==='f1'?(cou?'l1':'l2'):(cou?'l3':'l4');
     const path=[N.root,N[a],N[leaf]];eb['root'+a].material=S.mat(C.lime,{emi:.6});eb[a+leaf].material=S.mat(C.lime,{emi:.6});marker.visible=true;
     S.anim(1600,t=>{const s=t*2;const i=Math.min(1,Math.floor(s));const f=s-i;const A=path[i],B=path[i+1>2?2:i+1];marker.position.set(lerp(A[0],B[0],f),lerp(A[1],B[1],f),0);});
     const res={l1:'Likely flu',l2:'Check other symptoms',l3:'Likely cold',l4:'Check other symptoms'}[leaf];
     u.out('<p>Root: fever? <b>'+(fev?'Yes':'No')+'</b>. Decision node: cough? <b>'+(cou?'Yes':'No')+'</b>. Leaf node: <b>'+res+'</b>.</p><p>This path is one complete rule: IF fever = '+(fev?'yes':'no')+' AND cough = '+(cou?'yes':'no')+' THEN '+res+'. You can read it, so you can see why the model answered as it did. That interpretability is why a hospital might prefer a tree.</p>');};
   u.toggle('Patient has a fever',true,v=>{fev=v;});u.toggle('Patient has a cough',true,v=>{cou=v;});
   u.btn('Walk the path',walk,{pri:true});
   u.out('<p>Set the symptoms and press <b>Walk the path</b>.</p>');
  }}
 ]);
};

SC.a433=function(S){
 S.modes([
 {label:'Confusion matrix',view:[18,.7,1.0,[2,2,0]],hint:'Change the counts and read the metrics.',tip:'Teal towers are correct predictions (TP and TN). Coral towers are errors: FP is a false alarm, FN is a dangerous miss. Height uses a square-root scale so small counts stay visible.',
  build(g,u){
   S.floor(g,20,20,0);let v={tp:40,fp:10,fn:30,tn:920};
   const pos={tp:[-2.5,-2.5],fn:[2.5,-2.5],fp:[-2.5,2.5],tn:[2.5,2.5]};const T={},cl={tp:C.teal,tn:C.teal,fp:C.coral,fn:C.coral};
   Object.keys(pos).forEach(k=>{T[k]=tw(S,g,pos[k][0],pos[k][1],1,cl[k],4);});
   S.label(g,'TP true positive',[-2.5,-.6,-5.2],{size:.5});S.label(g,'FN false negative (miss)',[2.5,-.6,-5.2],{size:.5});S.label(g,'FP false positive (alarm)',[-2.5,-.6,5.2],{size:.5});S.label(g,'TN true negative',[2.5,-.6,5.2],{size:.5});
   S.label(g,'Predicted positive',[-2.5,-.6,-7],{size:.5,color:'#9db2c7'});S.label(g,'Predicted negative',[2.5,-.6,-7],{size:.5,color:'#9db2c7'});
   const M=['Accuracy','Precision','Recall','F1'].map((n,i)=>{const m=tw(S,g,9.5,-3+i*2.2,1,[C.sky,C.amber,C.violet,C.lime][i],1.4);S.label(g,n,[11.4,.9,-3+i*2.2],{size:.45});return m;});
   const lbl=[0,1,2,3].map(i=>S.label(g,'',[9.5,9,-3+i*2.2],{size:.45,color:'#ffffff'}));
   const upd=()=>{Object.keys(T).forEach(k=>setH(T[k],Math.sqrt(v[k])*.28));
     const tot=v.tp+v.fp+v.fn+v.tn||1,acc=(v.tp+v.tn)/tot,pr=v.tp+v.fp?v.tp/(v.tp+v.fp):0,rc=v.tp+v.fn?v.tp/(v.tp+v.fn):0,f1=pr+rc?2*pr*rc/(pr+rc):0;
     [acc,pr,rc,f1].forEach((x,i)=>{setH(M[i],x*8);lbl[i].position.y=x*8+1;lbl[i].userData.setText(fx(x*100,0)+'%');});
     u.out(kv([['Accuracy',fx(acc*100,1)+'%',acc>.9&&rc<.5?'a':'g'],['Precision',fx(pr*100,1)+'%'],['Recall',fx(rc*100,1)+'%',rc<.5?'b':'g'],['F1',fx(f1,2)]])+'<p>'+(acc>.9&&rc<.6?'<b>Accuracy paradox:</b> accuracy looks excellent but the model misses a large share of real positives. Recall shows it.':'Precision = TP / (TP + FP). Recall = TP / (TP + FN). F1 is the harmonic mean, so it is high only when both are high.')+'</p>');};
   const sl={};[['tp','TP (true positives)',100,5],['fp','FP (false alarms)',100,5],['fn','FN (misses)',100,5],['tn','TN (true negatives)',1000,10]].forEach(a=>{sl[a[0]]=u.slider(a[1],0,a[2],a[3],v[a[0]],x=>{v[a[0]]=x;upd();});});
   const set=o=>{Object.assign(v,o);Object.keys(sl).forEach(k=>sl[k].set(v[k]));upd();};
   const gp=u.g('Presets');gp.btn('Textbook example',()=>set({tp:40,fp:10,fn:30,tn:920}),{pri:true});gp.btn('Lazy model (says "no disease" for all)',()=>set({tp:0,fp:0,fn:10,tn:990}));gp.btn('Cautious model (high recall)',()=>set({tp:9,fp:60,fn:1,tn:930}));
   upd();
  }},
 {label:'Over and underfitting',view:[23,.5,1.05,[2,3.5,0]],hint:'Raise model complexity and watch the two error towers.',tip:'Teal spheres are training data, coral spheres are unseen test data from the same pattern. The line is the model. Towers: training error (teal) and test error (coral).',
  build(g,u){
   S.floor(g,18,12,0);const f=x=>Math.sin(x*Math.PI*2)*.5+.5;const r=rng(8);
   const mkS=(n,seed)=>{const rr=rng(seed);const a=[];for(let i=0;i<n;i++){const x=(i+.5)/n+(rr()-.5)*.03;a.push([x,f(x)+nrm(rr)*.12]);}return a;};
   const tr=mkS(14,5),te=mkS(14,99);const X=x=>x*14-7,Y=y=>y*6+.5;
   tr.forEach(p=>S.ball(g,[X(p[0]),Y(p[1]),0],.2,C.teal,{emi:.35}));te.forEach(p=>S.ball(g,[X(p[0]),Y(p[1]),1],.16,C.coral,{emi:.35}));
   S.line(g,Array.from({length:60},(_,i)=>[X(i/59),Y(f(i/59)),-.4]),0x6b8299,.6);
   let deg=1,curve=null;const eT=tw(S,g,9,-4,1,C.teal,1.1),eV=tw(S,g,11,-4,1,C.coral,1.1);S.label(g,'train error',[9,-.6,-2.6],{size:.4});S.label(g,'test error',[11,-.6,-2.6],{size:.4});
   const upd=()=>{const xs=tr.map(p=>p[0]*2-1),c=polyfit(xs,tr.map(p=>p[1]),deg);const pr=x=>polyval(c,x*2-1);
     if(curve)g.remove(curve);const pts=[];for(let i=0;i<=80;i++){const x=i/80;pts.push([X(x),Math.max(-1,Math.min(9,Y(pr(x)))),0]);}curve=S.line(g,pts,C.amber);
     const mse=a=>a.reduce((s,p)=>s+(p[1]-pr(p[0]))**2,0)/a.length;const a=mse(tr),b=mse(te);setH(eT,Math.min(a*80,7));setH(eV,Math.min(b*80,7));
     const verdict=deg<=1?'Underfitting: too simple. Poor on both.':deg<=5?'Good fit: follows the trend and generalises.':'Overfitting: chases the noise. Training error is tiny but test error climbs.';
     u.out(kv([['Complexity (polynomial degree)',deg],['Training error',fx(a,4),'g'],['Test error',fx(b,4),b>a*3&&deg>5?'b':'a']])+'<p><b>'+verdict+'</b> Only performance on unseen data shows whether the model learned the general pattern.</p>');};
   u.slider('Model complexity',1,11,1,deg,x=>{deg=x;upd();});upd();
  }},
 {label:'Tuning sweep (k in K-NN)',view:[19,.7,1.05,[0,3,0]],hint:'Press Run tuning.',tip:'For each k, a K-NN model is trained and scored on the training set (teal) and on unseen validation data (coral). The amber ring marks the k that generalises best.',
  build(g,u){
   S.floor(g,22,12,0);const r=rng(41);const mk=n=>{const a=[];for(let i=0;i<n;i++){const c=r()<.5?0:1;a.push({p:[(c?1:-1)*1.0+nrm(r)*1.3,nrm(r)*1.3],c});}return a;};
   const TR=mk(60),VA=mk(60);const KS=Array.from({length:13},(_,i)=>i*2+1);
   const pred=(p,k,D)=>{const ds=D.map(o=>({c:o.c,d:Math.hypot(o.p[0]-p[0],o.p[1]-p[1])})).sort((a,b)=>a.d-b.d).slice(0,k);const s=ds.reduce((a,o)=>a+o.c,0);return s*2>k?1:0;};
   const sc=k=>({tr:TR.filter(o=>pred(o.p,k,TR)===o.c).length/TR.length,va:VA.filter(o=>pred(o.p,k,TR)===o.c).length/VA.length});
   const R=KS.map(sc);const bt=[],bv=[];
   KS.forEach((k,i)=>{const x=-9+i*1.5;bt.push(tw(S,g,x,-.5,.05,C.teal,.6));bv.push(tw(S,g,x,.5,.05,C.coral,.6));S.label(g,String(k),[x,-.7,2],{size:.45});});
   S.label(g,'k (the hyperparameter)',[0,-1.7,3.5],{size:.5,color:'#9db2c7'});S.label(g,'score (taller is better)',[-11,8.5,0],{size:.45,color:'#9db2c7'});
   let i=0,run=false,best=-1,ring=null;
   const hs=a=>Math.max(.05,(a-.5)*16);
   S.every(350,()=>{if(!run)return;if(i<KS.length){setH(bt[i],hs(R[i].tr));setH(bv[i],hs(R[i].va));i++;
     u.out(kv([['Trying k',KS[i-1]],['Train accuracy',fx(R[i-1].tr*100,0)+'%','g'],['Unseen accuracy',fx(R[i-1].va*100,0)+'%','a'],['Models trained',i]])+'<p>Train a model for each value, score it on unseen data, compare. Training accuracy always looks good for small k (k = 1 memorises). Only the unseen score is trusted.</p>');}
     else{run=false;best=0;R.forEach((x,j)=>{if(x.va>R[best].va)best=j;});if(ring)g.remove(ring);ring=S.ball(g,[-9+best*1.5,hs(R[best].va)+1,.5],.5,C.amber,{emi:.8});
       u.out(kv([['Best k',KS[best],'g'],['Unseen accuracy',fx(R[best].va*100,0)+'%','g'],['Train accuracy at best k',fx(R[best].tr*100,0)+'%']])+'<p>Tuning keeps the value of k with the best score on <b>unseen</b> data. A metric such as F1 can be used instead of accuracy. Tuning changes a setting, not the algorithm or the data.</p>');}});
   u.btn('Run tuning',()=>{i=0;bt.forEach(b=>setH(b,.05));bv.forEach(b=>setH(b,.05));if(ring){g.remove(ring);ring=null;}run=true;},{pri:true});
   u.out('<p>Press <b>Run tuning</b> to sweep k from 1 to 25.</p>');
  }}
 ]);
};

SC.a434=function(S){
 const blobs=(seed,n,spec)=>{const r=rng(seed);const P=[];spec.forEach(s=>{for(let i=0;i<n;i++)P.push([s[0]+nrm(r)*s[3],Math.max(.3,s[1]+nrm(r)*s[3]),s[2]+nrm(r)*s[3]]);});return P;};
 S.modes([
 {label:'k-means step by step',view:[18,.7,1.1,[0,3,0]],hint:'Step: assign, then move. Repeat until still.',tip:'Small spheres are data points. Cubes are centroids. Press Step to alternate assign and move.',
  build(g,u){
   S.floor(g,16,16,0);let k=3,seed=4;let P=blobs(seed,30,[[-4,2,-3,1.3],[4,3,-2,1.3],[0,2.5,4,1.3]]);
   const cols=CLS;let inst=null,cent=[],cm=[],trail=[],phase=0,iter=0,assign=null,moved=1,run=false,rr=rng(1),conv=false;
   const draw=()=>{if(inst)g.remove(inst.mesh);inst=S.inst(g,P.length,.22);P.forEach((p,i)=>inst.set(i,p,assign?cols[assign[i]%6]:0x8aa0b4));inst.done();};
   const drawC=()=>{cm.forEach(m=>g.remove(m));trail.forEach(m=>g.remove(m));cm=cent.map((c,j)=>S.cube(g,c,.8,cols[j%6],{emi:.8}));trail=[];};
   const init=()=>{cent=kmInit(P,k,rr);assign=null;phase=0;iter=0;moved=1;conv=false;draw();drawC();info('Random centroids placed. Press Step to assign points.');};
   const inertia=()=>assign?P.reduce((s,p,i)=>s+dist(p,cent[assign[i]])**2,0):0;
   const info=(t)=>u.out(kv([['k',k],['Iteration',iter],['Next action',conv?'done':(phase===0?'assign':'move')],['Centroid movement',fx(moved,2),conv?'g':'a'],['Converged',conv?'yes':'no',conv?'g':'']])+'<p>'+t+'</p>');
   const step=()=>{if(conv){info('The centroids stopped moving, so the clusters are stable.');return;}
     if(phase===0){const r=kmStep(P,cent);assign=r.assign;draw();phase=1;info('<b>Assign:</b> every point joined its nearest centroid, giving '+k+' rough groups.');}
     else{const r=kmStep(P,cent);const old=cent;cent=r.cent;moved=r.moved;iter++;old.forEach((o,j)=>trail.push(S.bar(g,o,cent[j],.03,cols[j%6],{op:.7})));cm.forEach((m,j)=>S.anim(500,t=>m.position.set(lerp(old[j][0],cent[j][0],ease(t)),lerp(old[j][1],cent[j][1],ease(t)),lerp(old[j][2],cent[j][2],ease(t)))));
       phase=0;if(moved<1e-3){conv=true;info('<b>Move:</b> centroids stayed put. The algorithm has <b>converged</b>.');}else info('<b>Move:</b> each centroid went to the mean of its points. Then assign again with the new centroids.');}};
   S.every(900,()=>{if(run)step();});
   u.btn('Step',step,{pri:true});const rb=u.btn('Run',()=>{run=!run;rb.textContent=run?'Pause':'Run';});u.btn('New centroids',()=>{rr=rng(Math.floor(Math.random()*9999));init();});
   u.slider('k (clusters)',1,6,1,k,v=>{k=v;init();});
   u.btn('New data',()=>{seed=Math.floor(Math.random()*999);P=blobs(seed,30,[[-4,2,-3,1.3],[4,3,-2,1.3],[0,2.5,4,1.3]]);init();});
   init();
  }},
 {label:'Customer segments',view:[18,.75,1.05,[0,4,0]],hint:'Run k-means, then interpret the clusters.',tip:'Each sphere is a customer. Axes: average spend (x), purchase frequency (height), share of purchases on sale (z). The algorithm finds groups; people name them.',
  build(g,u){
   S.floor(g,16,16,0);S.axes(g,9,['avg spend','frequency','% on sale'],{min:-6});
   const P=blobs(17,40,[[4,5.5,-3,1.0],[-1,3,4,1.0],[-4,1,-2,1.0]]);
   const m=P.map(p=>S.ball(g,p,.22,0x8aa0b4,{emi:.2}));let res=null;const labels=[];
   const run=()=>{const r=rng(2);let cent=kmInit(P,3,r),a;for(let i=0;i<20;i++){const q=kmStep(P,cent);cent=q.cent;a=q.assign;}res={cent,a};m.forEach((s,i)=>s.material=S.mat(CLS[a[i]],{emi:.35}));
     cent.forEach((c,j)=>S.cube(g,c,.6,CLS[j],{emi:.9}));
     u.out('<p>k-means found <b>3 clusters</b> from the numbers alone. It cannot say what they mean. Press <b>Interpret clusters</b> to play the human analyst.</p>');};
   const interp=()=>{if(!res){u.out('<p>Run k-means first.</p>');return;}labels.forEach(l=>g.remove(l));const c=res.cent;const hi=c.reduce((b,x,j)=>x[0]>c[b][0]?j:b,0),sale=c.reduce((b,x,j)=>x[2]>c[b][2]?j:b,0);const lo=[0,1,2].find(j=>j!==hi&&j!==sale);
     const names={};names[hi]='High-value spenders';names[sale]='Bargain hunters';names[lo]='One-time buyers';c.forEach((x,j)=>labels.push(S.label(g,names[j],[x[0],x[1]+1.5,x[2]],{size:.6,color:'#0b1520',bg:'#ffb400'})));
     u.out('<p>A person looks at each centroid and names the group: <b>high-value spenders</b> (high spend, high frequency), <b>bargain hunters</b> (buy mostly on sale), <b>one-time buyers</b> (low frequency). The business can now send exclusive offers to the first group and win-back discounts to the last. The algorithm found the groups; people gave them meaning.</p>');};
   u.btn('Run k-means (k = 3)',run,{pri:true});u.btn('Interpret clusters',interp);
   u.out('<p>Unlabelled customers. Press <b>Run k-means</b> to find segments.</p>');
  }}
 ]);
};

SC.a435=function(S){
 const ITEMS=['Bread','Butter','Milk','Eggs','Beer','Nappies','Jam'],IC=[C.amber,C.sky,C.white,C.lime,C.coral,C.violet,C.teal];
 const mk=()=>{const r=rng(24);const B=[];for(let i=0;i<48;i++){const s=new Set();if(r()<.6){s.add(0);if(r()<.7){s.add(1);if(r()<.8)s.add(2);if(r()<.45)s.add(6);}else if(r()<.3)s.add(2);}else{if(r()<.3)s.add(2);if(r()<.2)s.add(1);}
   if(r()<.35)s.add(3);if(r()<.15){s.add(5);if(r()<.65)s.add(4);}else if(r()<.2)s.add(4);B.push(s);}return B;};
 const B=mk();
 const sup=(set)=>B.filter(b=>[...set].every(x=>b.has(x))).length;
 S.modes([
 {label:'Baskets and rules',view:[19,.8,1.0,[0,1,0]],hint:'Choose the if-items and the then-item.',tip:'Each pad is one shopping basket and each small cube is an item. Pads containing the antecedent rise. Pads containing the whole rule rise highest and glow amber.',
  build(g,u){
   S.floor(g,22,22,0);const pads=[],gr=new THREE.Group();g.add(gr);
   B.forEach((b,i)=>{const x=((i%8)-3.5)*2.3,z=(Math.floor(i/8)-2.5)*2.3;const pad=S.cube(g,[x,.1,z],[2,.2,2],0x24384c);pads.push({pad,x,z,b});
     let n=0;ITEMS.forEach((it,k)=>{if(b.has(k)){S.cube(g,[x+((n%3)-1)*.55,1.7,z+(Math.floor(n/3)-.5)*.55],.38,IC[k],{emi:.3});n++;}});});
   const ante=new Set([0]);let cons=2;
   const upd=()=>{const N=B.length,both=new Set([...ante,cons]);const sa=sup(ante),sb=sup(both);
     pads.forEach(o=>{const ha=[...ante].every(x=>o.b.has(x)),hb=ha&&o.b.has(cons);o.pad.material=S.mat(hb?C.amber:ha?0x4a7a8a:0x24384c,{emi:hb?.7:0});const h=hb?1.0:ha?.55:.2;o.pad.scale.y=h;o.pad.position.y=h/2;});
     const support=sb/N,conf=sa?sb/sa:0;const rule='{'+[...ante].map(i=>ITEMS[i]).join(', ')+'} then {'+ITEMS[cons]+'}';
     u.out(kv([['Rule',rule],['Support',fx(support*100,0)+'%  ('+sb+' of '+N+')',support>.2?'g':'a'],['Confidence',fx(conf*100,0)+'%  ('+sb+' of '+sa+')',conf>.6?'g':'a']])+'<p><b>Support</b> is the share of <b>all</b> baskets containing every item in the rule. <b>Confidence</b> is the share of baskets that contain the antecedent which also contain the consequent. '+(support>.2&&conf>.6?'Both are high, so this rule is worth acting on.':support<=.2?'Support is low: it applies to too few baskets to matter much.':'Confidence is low: the "if" does not reliably lead to the "then".')+' Remember: this shows items occur together, not that one causes the other.</p>');};
   const gi=u.g('If (antecedent): tick items');ITEMS.forEach((it,k)=>gi.toggle(it,k===0,v=>{if(v)ante.add(k);else ante.delete(k);if(!ante.size)ante.add(k);upd();}));
   u.sel('Then (consequent)',ITEMS.map((x,i)=>[i,x]),2,v=>{cons=+v;upd();});
   const gp=u.g('Presets');gp.btn('{Bread, Butter} then {Milk}',()=>{ante.clear();ante.add(0);ante.add(1);cons=2;upd();},{pri:true});gp.btn('{Nappies} then {Beer}',()=>{ante.clear();ante.add(5);cons=4;upd();});
   upd();
  }},
 {label:'Rule explorer',view:[17,.75,1.0,[0,2,0]],hint:'Each sphere is a rule. Raise the filters.',tip:'Every one-item rule is a sphere placed by support (x) and confidence (z). Only rules above both thresholds (the green zone) are worth acting on. Click a sphere to read the rule.',
  build(g,u){
   S.floor(g,16,16,0);S.bar(g,[-7,0,7],[7,0,7],.03,0x6b8299);S.bar(g,[-7,0,7],[-7,0,-7],.03,0x6b8299);S.label(g,'support →',[0,0,8.2],{size:.5});S.label(g,'confidence →',[-8.4,0,0],{size:.5});
   const rules=[];ITEMS.forEach((a,i)=>ITEMS.forEach((b,j)=>{if(i===j)return;const sa=sup(new Set([i])),sb=sup(new Set([i,j]));if(!sb)return;rules.push({i,j,s:sb/B.length,c:sb/sa});}));
   const sph=rules.map(r=>{const m=S.ball(g,[-7+r.s*14/0.6,.4+r.c*3,7-r.c*14],.3,0x8aa0b4,{emi:.3});m.userData=r;return m;});
   let ms=.2,mc=.6;const zone=S.plane(g,[0,.05,0],1,1,C.good||0x2ec4b6,{op:.18});
   const upd=()=>{const x0=-7+ms*14/.6,z0=7-mc*14;zone.scale.set(Math.max(.01,7-x0+7),Math.max(.01,z0+7),1);zone.position.set((x0+7)/2,.05,(z0-7)/2);
     let n=0;sph.forEach(m=>{const ok=m.userData.s>=ms&&m.userData.c>=mc;if(ok)n++;m.material=S.mat(ok?C.teal:0x4a6a8a,{emi:ok?.6:.1});});
     u.out(kv([['Min support',fx(ms*100,0)+'%'],['Min confidence',fx(mc*100,0)+'%'],['Rules that survive',n,n?'g':'b']])+'<p>Mining produces many rules and most are obvious or useless. Filtering by <b>support</b> (common enough to matter) and <b>confidence</b> (reliable) leaves the rules worth acting on.</p>');};
   S.onPick(sph,o=>{const r=o.userData;u.out('<p><b>{'+ITEMS[r.i]+'} then {'+ITEMS[r.j]+'}</b><br>Support '+fx(r.s*100,0)+'%, confidence '+fx(r.c*100,0)+'%.</p><p>'+(r.s>=ms&&r.c>=mc?'It passes both filters.':'It fails at least one filter.')+'</p>');});
   u.slider('Minimum support',0,.6,.01,ms,v=>{ms=v;upd();},v=>fx(v*100,0)+'%');u.slider('Minimum confidence',0,1,.01,mc,v=>{mc=v;upd();},v=>fx(v*100,0)+'%');upd();
  }}
 ]);
};
