/* ---------- app shell ---------- */
const GROUPS=[['A4.1','Foundations'],['A4.2','Preparing data'],['A4.3','Techniques and models'],['A4.4','Ethics']];
const total=()=>T.length;
const doneMap=()=>store.get('done',{});
let cur=null;
function setDone(id,score,max){const d=doneMap();d[id]={s:score,m:max};store.set('done',d);paintProgress();}
function paintProgress(){
  const d=doneMap();const n=T.filter(t=>d[t.id]).length;
  const pr=$('#prog');if(pr){$('b',pr).style.width=(100*n/total())+'%';$('span',pr).textContent=n+' / '+total()+' done';}
  $$('.side a[data-id]').forEach(a=>{const dn=d[a.dataset.id];const s=$('.d',a);if(s)s.textContent=dn?(dn.s+'/'+dn.m):'';});
}
function buildSide(){
  const s=$('#side');s.innerHTML='';
  s.append(h('h4',null,'Start'),h('a',{href:'#home','data-home':1},h('span',{class:'c'},'Home'),'All 17 topics'));
  GROUPS.forEach(([p,name])=>{
    const items=T.filter(t=>t.code.indexOf(p)===0);
    s.append(h('h4',null,p+'  '+name));
    items.forEach(t=>s.append(h('a',{href:'#'+t.id,'data-id':t.id},h('span',{class:'c'},t.code.replace('A4.','')),t.short,h('span',{class:'d'}))));});
}
function markNav(id){$$('.side a').forEach(a=>{const on=(id==='home'&&a.dataset.home)||a.dataset.id===id;if(on)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});}
function shuffle(arr,seed){const r=rng(seed);const a=arr.map((v,i)=>[v,i]);for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function hashSeed(s){let x=2166136261;for(let i=0;i<s.length;i++){x^=s.charCodeAt(i);x=Math.imul(x,16777619);}return x>>>0;}

/* ----- quiz ----- */
function renderQuiz(t,host){
  const items=t.quiz||[];let answered=0,correct=0;const done=new Array(items.length).fill(false);
  const sc=h('div',{class:'score'});const list=h('div');
  const paint=()=>{sc.innerHTML='';sc.append(h('span',{class:'n'},correct+' / '+items.length),h('span',null,answered<items.length?('Answered '+answered+' of '+items.length+'. Pick an answer to see why it is right or wrong.'):(correct===items.length?'Perfect. You can move to the next topic.':'Quiz complete. Read the explanations for the ones you missed, then retry.')),
      answered?h('button',{class:'btn',onclick:()=>{host.innerHTML='';renderQuiz(t,host);}},'Retry'):null);};
  const fin=(i,ok)=>{if(done[i])return;done[i]=true;answered++;if(ok)correct++;paint();if(answered===items.length)setDone(t.id,correct,items.length);};
  items.forEach((it,i)=>{
    const box=h('div',{class:'q'},h('span',{class:'qn'},'Question '+(i+1)+' of '+items.length+'  ·  '+({one:'choose one',multi:'choose all that apply',tf:'true or false',order:'put in order'}[it.t])),h('div',{class:'qt',html:it.q}));
    const why=h('div',{class:'why',hidden:true,html:'<b>Why: </b>'+it.why});
    const reveal=ok=>{why.hidden=false;why.prepend(h('b',{style:'color:var(--'+(ok?'good':'bad')+')'},ok?'Correct. ':'Not quite. '));};
    if(it.t==='one'||it.t==='tf'){
      const opts=it.t==='tf'?['True','False']:it.o;const corr=it.t==='tf'?(it.a?0:1):it.a;
      const perm=it.t==='tf'?opts.map((_,k)=>[opts[k],k]):shuffle(opts,hashSeed(t.id+i));
      const wrap=h('div',{class:'opts'});const btns=[];
      perm.forEach(([txt,orig],k)=>{const b=h('button',{class:'opt'},h('span',{class:'l'},String.fromCharCode(65+k)),h('span',{html:txt}));b.dataset.o=orig;btns.push(b);
        b.addEventListener('click',()=>{if(done[i])return;btns.forEach(x=>{x.disabled=true;if(+x.dataset.o===corr)x.classList.add('ok');});const ok=orig===corr;if(!ok)b.classList.add('no');reveal(ok);fin(i,ok);});wrap.append(b);});
      box.append(wrap);
    }else if(it.t==='multi'){
      const perm=shuffle(it.o,hashSeed(t.id+i));const wrap=h('div',{class:'opts'});const btns=[];
      perm.forEach(([txt,orig],k)=>{const b=h('button',{class:'opt','aria-pressed':'false'},h('span',{class:'l'},String.fromCharCode(65+k)),h('span',{html:txt}));b.dataset.o=orig;btns.push(b);
        b.addEventListener('click',()=>{if(done[i])return;b.setAttribute('aria-pressed',b.getAttribute('aria-pressed')==='true'?'false':'true');});wrap.append(b);});
      const chk=h('button',{class:'btn pri',style:'margin-top:10px',onclick:()=>{if(done[i])return;let ok=true;btns.forEach(x=>{const sel=x.getAttribute('aria-pressed')==='true';const should=it.a.includes(+x.dataset.o);if(sel!==should)ok=false;x.disabled=true;x.classList.remove('ok','no');if(should)x.classList.add('ok');else if(sel)x.classList.add('no');});chk.hidden=true;reveal(ok);fin(i,ok);}},'Check answer');
      box.append(wrap,chk);
    }else if(it.t==='order'){
      const perm=shuffle(it.o,hashSeed(t.id+'o'+i));const pool=h('div',{class:'pool'});const ans=h('div',{class:'ans'});const picked=[];
      const mkb=(txt,orig)=>{const b=h('button',{class:'opt',html:txt});b.dataset.o=orig;return b;};
      perm.forEach(([txt,orig])=>{const b=mkb(txt,orig);b.addEventListener('click',()=>{if(done[i])return;if(b.parentNode===pool){ans.append(b);}else{pool.append(b);}});pool.append(b);});
      const chk=h('button',{class:'btn pri',onclick:()=>{if(done[i])return;const got=[...ans.children].map(x=>+x.dataset.o);const ok=got.length===it.o.length&&got.every((v,k)=>v===k);
        [...ans.children].forEach((x,k)=>{x.classList.add(+x.dataset.o===k?'ok':'no');x.disabled=true;});[...pool.children].forEach(x=>x.disabled=true);chk.hidden=true;
        if(!ok){why.append(h('div',{html:'<br><b>Correct order:</b><ol>'+it.o.map(s=>'<li>'+s+'</li>').join('')+'</ol>'}));}reveal(ok);fin(i,ok);}},'Check order');
      box.append(h('div',{class:'ord'},h('span',{class:'qn'},'Tap items to build the sequence (tap again to remove). First step at the top-left.'),ans,pool,chk));
    }
    box.append(why);list.append(box);});
  host.append(sc,list);paint();
}
/* ----- paper practice ----- */
function renderPaper(t,host){
  const dr=store.get('draft.'+t.id,{});
  (t.paper||[]).forEach((p,i)=>{
    const ta=h('textarea',{placeholder:'Write your answer here, as you would in the exam. Aim for one clear point per mark.','aria-label':'Your answer to question '+(i+1)});ta.value=dr[i]||'';
    ta.addEventListener('input',()=>{const d=store.get('draft.'+t.id,{});d[i]=ta.value;store.set('draft.'+t.id,d);});
    const pts=h('div',{class:'pts',hidden:true});const res=h('div',{class:'m'});
    const upd=()=>{const n=$$('input:checked',pts).length;res.textContent='Self-marked: '+Math.min(n,p.m)+' / '+p.m+' marks';};
    p.pts.forEach(s=>{const c=h('input',{type:'checkbox'});c.addEventListener('change',upd);pts.append(h('label',{class:'ck'},c,h('span',{html:s})));});
    pts.append(res);
    const b=h('button',{class:'btn',onclick:()=>{pts.hidden=!pts.hidden;b.textContent=pts.hidden?'Show marking points':'Hide marking points';}},'Show marking points');
    host.append(h('div',{class:'paper'},h('span',{class:'m'},'Question '+(i+1)+'  ·  ['+p.m+' marks]'),h('div',{class:'qt',style:'font-weight:600',html:p.q}),ta,b,h('p',{class:'tip',style:'padding:8px 0 0'},'Write first, then reveal the points and tick each one your answer made. Each point is worth one mark.'),pts));});
}
/* ----- topic page ----- */
function ul(list,tag){return h(tag||'ul',null,list.map(x=>h('li',{html:x})));}
function renderTopic(t){
  const idx=T.indexOf(t);const pg=h('div',{class:'page'});
  pg.append(h('header',null,h('div',{class:'crumb'},t.code+'  ·  '+t.group),h('h1',null,t.title),h('p',{class:'ls',html:t.ls}),
    h('div',{class:'cmdrow'},h('div',{class:'cmd'},h('b',null,t.verb),h('span',{html:t.cmd})))));
  if(t.lead)pg.append(h('p',{class:'lead',html:t.lead}));
  if(t.hook)pg.append(h('div',{class:'think'},h('b',null,'Think first'),h('span',{html:t.hook})));
  const stage=h('section',{class:'stage','aria-label':'3D lab'});pg.append(stage);
  if(t.lab)pg.append(h('div',{class:'grid'},
    h('div',{class:'card'},h('h3',null,'Try this in the lab'),ul(t.lab.how,'ol')),
    h('div',{class:'card'},h('h3',null,'What to notice'),ul(t.lab.see))));
  const notes=h('section',{class:'sec'},h('h2',null,'The full notes'));
  const grid=h('div',{class:'grid'});
  (t.sections||[]).forEach(s=>{const c=h('div',{class:'card'+(s.eg?' eg':'')},s.tag?h('h3',null,h('span',{class:'tag'},s.tag),s.h):h('h3',null,s.h));
    if(s.p)c.append(h('p',{html:s.p}));if(s.ul)c.append(ul(s.ul));if(s.ol)c.append(ul(s.ol,'ol'));if(s.p2)c.append(h('p',{html:s.p2}));grid.append(c);});
  notes.append(grid);pg.append(notes);
  (t.keys||[]).forEach(k=>pg.append(h('div',{class:'key'},h('b',{class:'t'},k.t||'Key idea'),h('div',{html:k.html}))));
  (t.tables||[]).forEach(tb=>pg.append(h('section',{class:'sec'},h('h2',null,tb.h),h('div',{class:'tw'},h('table',null,h('thead',null,h('tr',null,tb.head.map(x=>h('th',null,x)))),h('tbody',null,tb.rows.map(r=>h('tr',null,r.map(c=>h('td',{html:c}))))))))));
  if(t.traps&&t.traps.length)pg.append(h('section',{class:'sec'},h('h2',null,'Common exam mistakes'),h('div',{class:'grid'},t.traps.map(x=>h('div',{class:'trap'},h('b',{class:'t'},'Avoid this'),h('div',{html:x}))))));
  if(t.gloss&&t.gloss.length)pg.append(h('section',{class:'sec'},h('h2',null,'Key terms'),h('div',{class:'tw'},h('table',null,h('thead',null,h('tr',null,h('th',null,'Term'),h('th',null,'Meaning'))),h('tbody',null,t.gloss.map(g=>h('tr',null,h('td',null,g[0]),h('td',{html:g[1]}))))))));
  const qz=h('div');pg.append(h('section',{class:'sec'},h('h2',null,'Quiz ',h('small',null,(t.quiz||[]).length+' questions')),qz));
  const pp=h('div');pg.append(h('section',{class:'sec'},h('h2',null,'Try it on paper ',h('small',null,'written answers, '+(t.verb||'')+' style')),pp));
  const prev=T[idx-1],next=T[idx+1];
  pg.append(h('nav',{class:'nav2'},prev?h('a',{href:'#'+prev.id},h('small',null,'Previous'),prev.code+'  '+prev.short):h('a',{href:'#home'},h('small',null,'Back'),'All topics'),next?h('a',{href:'#'+next.id},h('small',null,'Next'),next.code+'  '+next.short):h('a',{href:'#home'},h('small',null,'Finished'),'Back to all topics')));
  return{pg,stage,qz,pp};
}
function renderHome(){
  const pg=h('div',{class:'page'});
  const vp=h('div',{class:'stage',style:'border:0;background:transparent'});
  const hero=h('div',{class:'home-hero'},h('div',null,h('div',{class:'crumb'},'IB Diploma Computer Science  ·  Option A4'),h('h1',null,'Machine learning, in 3D you can turn around.'),
    h('p',{class:'lead'},'Every topic in A4 has a lab you can rotate, poke and break. Watch k-means settle, drive a neural network forward, tune a model until it overfits, then lock the idea in with the notes, quiz and written practice below it.'),
    h('p',{class:'ls'},'Drag a lab to orbit it. On a phone, swipe sideways on a lab to rotate; swiping up or down scrolls the page.')),h('div',null,vp));
  pg.append(hero);
  const hv=h('div',{class:'vp'});vp.append(hv);
  GROUPS.forEach(([p,name])=>{const items=T.filter(t=>t.code.indexOf(p)===0);
    pg.append(h('section',{class:'sec'},h('h2',null,p+'  '+name),h('div',{class:'tiles'},items.map(t=>h('a',{class:'tile',href:'#'+t.id},h('span',{class:'c'},t.code),h('b',null,t.title),h('span',null,t.blurb||''),h('span',{class:'d','data-tile':t.id}))))));});
  return{pg,hv};
}
function route(){
  const id=(location.hash||'#home').slice(1)||'home';
  if(cur){cur.dispose();cur=null;}
  const main=$('#main');main.innerHTML='';$('#side').classList.remove('open');$('#scrim').classList.remove('on');
  if(id==='home'||!T.some(t=>t.id===id)){
    const r=renderHome();main.append(r.pg);markNav('home');document.title='ML Lab 3D';
    const S=new Stage(r.hv,h('div'),h('div'),h('div'),h('div'));cur=S;if(!S.dead){S.ui.reset=()=>{};try{SC.home(S,S.ui);}catch(e){console.error(e);}}
    const d=doneMap();$$('[data-tile]',main).forEach(s=>{const x=d[s.dataset.tile];if(x)s.textContent='Quiz '+x.s+'/'+x.m;});
  }else{
    const t=T.find(x=>x.id===id);const r=renderTopic(t);main.append(r.pg);markNav(id);
    renderQuiz(t,r.qz);renderPaper(t,r.pp);
    cur=mountStage(r.stage,id,t.stageTitle||'3D lab: '+t.short,t.stageSub||'Rotate, pick, and change the controls');
  }
  window.scrollTo(0,0);paintProgress();
}
function boot(){
  const theme=store.get('theme','system');applyTheme(theme);
  buildSide();
  $('#menu').addEventListener('click',()=>{$('#side').classList.toggle('open');$('#scrim').classList.toggle('on');});
  $('#scrim').addEventListener('click',()=>{$('#side').classList.remove('open');$('#scrim').classList.remove('on');});
  $('#theme').addEventListener('click',()=>{const o=['system','light','dark'];const n=o[(o.indexOf(store.get('theme','system'))+1)%3];store.set('theme',n);applyTheme(n);});
  window.addEventListener('hashchange',route);route();
}
function applyTheme(t){const r=document.documentElement;if(t==='system')r.removeAttribute('data-theme');else r.setAttribute('data-theme',t);const b=$('#theme');if(b)b.textContent='Theme: '+t;}
