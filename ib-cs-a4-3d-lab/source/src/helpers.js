/* ---------- math helpers shared by scenes ---------- */
const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
function kmInit(pts,k,r){const c=[];const used=new Set();while(c.length<k){const i=Math.floor(r()*pts.length);if(!used.has(i)){used.add(i);c.push(pts[i].slice());}}return c;}
function kmStep(pts,cent){const assign=pts.map(p=>{let b=0,bd=1e18;cent.forEach((c,j)=>{const d=dist(p,c);if(d<bd){bd=d;b=j;}});return b;});
  const nc=cent.map((c,j)=>{const m=pts.filter((_,i)=>assign[i]===j);if(!m.length)return c.slice();return[0,1,2].map(a=>m.reduce((s,p)=>s+p[a],0)/m.length);});
  const moved=nc.reduce((s,c,j)=>s+dist(c,cent[j]),0);return{assign,cent:nc,moved};}
/* least-squares polynomial fit: returns coefficient array c0..cd */
function polyfit(xs,ys,d){const n=d+1;const A=[];for(let i=0;i<n;i++){A.push(new Array(n+1).fill(0));}
  for(let i=0;i<n;i++){for(let j=0;j<n;j++){let s=0;for(const x of xs)s+=Math.pow(x,i+j);A[i][j]=s;}let s=0;xs.forEach((x,k)=>s+=ys[k]*Math.pow(x,i));A[i][n]=s;A[i][i]+=1e-9;}
  for(let i=0;i<n;i++){let p=i;for(let r=i+1;r<n;r++)if(Math.abs(A[r][i])>Math.abs(A[p][i]))p=r;[A[i],A[p]]=[A[p],A[i]];
    for(let r=i+1;r<n;r++){const f=A[r][i]/A[i][i];for(let c=i;c<=n;c++)A[r][c]-=f*A[i][c];}}
  const c=new Array(n).fill(0);for(let i=n-1;i>=0;i--){let s=A[i][n];for(let j=i+1;j<n;j++)s-=A[i][j]*c[j];c[i]=s/A[i][i];}return c;}
const polyval=(c,x)=>c.reduce((s,a,i)=>s+a*Math.pow(x,i),0);
const sigmoid=x=>1/(1+Math.exp(-x));
/* tower helpers */
function tw(S,g,x,z,h,c,w,o){h=Math.max(h,.02);const m=S.cube(g,[x,h/2,z],[w||.8,h,w||.8],c,o||{emi:.2});return m;}
function setH(m,h){h=Math.max(h,.02);m.scale.y=h;m.position.y=h/2;}
const pal=C;
