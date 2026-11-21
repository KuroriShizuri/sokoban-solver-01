import f from"node:fs"
const E=process.env,I=E.MAKEFUN_INPUT_DIR??"/input",O=E.MAKEFUN_OUTPUT_DIR??"/output"
function P(t){
const e=t.split("\n").filter(x=>x),w=Math.max(...e.map(x=>x.length)),W=new Uint8Array(w*e.length).fill(1),G=[],X=[]
let p=-1
e.forEach((s,y)=>{[...s].forEach((ch,x)=>{const i=y*w+x;W[i]=ch==="#";if(".*+".includes(ch))G.push(i);if("$*".includes(ch))X.push(i);if("@+".includes(ch))p=i})})
return{w,W,G,X,p}}
function R(v){
const{w,W,G,X,p}=v,row=p/w|0,pt=new Int32Array(W.length).fill(-1),Rs=[]
for(let s=0;s<W.length;s++){
if(W[s]||(s/w|0)===row||pt[s]>=0)continue
let q=[s],o=0;pt[s]=Rs.length
for(let i=0;i<q.length;i++)for(const d of[-w,w,-1,1]){const n=q[i]+d
if(!W[n]){if((n/w|0)===row)o=n;else if(pt[n]<0){pt[n]=Rs.length;q.push(n)}}}
Rs.push({b:[],g:[],k:Rs.length,o})}
X.forEach(b=>Rs[pt[b]].b.push(b))
G.forEach(g=>Rs[pt[g]].g.push(g))
v.pt=pt
return Rs.filter(r=>r.b.length)}
function S(v,r,e,last){
const{w,W}=v,pt=v.pt,F=String.fromCharCode,E=[-w,w,-1,1]
const s0=F(...r.b,e),M=new Map([[s0,0]]),P=new Map()
let cur=[s0],c=0
while(cur.length){
const N=[]
for(const s of cur){
if(M.get(s)!==c)continue
const z=[...s].map(ch=>ch.charCodeAt(0)),pp=z.pop()
if(z.every(b=>r.g.includes(b))&&(last||pp===r.o)){
let m="",t=s
while(t!==s0){const q=P.get(t);m=q[1]+m;t=q[0]}
return{m,p:pp}}
for(let k=0;k<4;k++){
const d=E[k],np=pp+d
if(pt[np]!==r.k&&np!==r.o)continue
const bi=z.indexOf(np)
let nc=c,cc="udlr"[k],T=cur,ns
if(bi<0)ns=F(...z,np)
else{
const bp=np+d
if(pt[bp]!==r.k||z.includes(bp))continue
if((W[bp-w]||W[bp+w])&&(W[bp-1]||W[bp+1])&&!r.g.includes(bp))continue
const q=z.slice();q[bi]=bp;q.sort((a,b)=>a-b)
ns=F(...q,np);nc=c+1;cc="UDLR"[k];T=N}
if(!(M.get(ns)<=nc)){M.set(ns,nc);P.set(ns,[s,cc]);T.push(ns);if(M.size>5e5)return null}
}}
cur=N;c++}
return null}
function V(t){
const v=P(t),Rs=R(v)
let p=v.p,mv=""
for(const r of Rs){
const e=r.o
if(!e)return""
mv+=e>p?"r".repeat(e-p):"l".repeat(p-e);p=e
const s=S(v,r,p,r===Rs[Rs.length-1])
if(!s)return""
mv+=s.m;p=s.p}
return mv}
for(const id of f.readdirSync(I)){
let m=""
try{m=V(f.readFileSync(I+"/"+id+"/level.txt","utf8"))}catch{m=""}
f.mkdirSync(O+"/"+id,{recursive:true})
f.writeFileSync(O+"/"+id+"/solution.txt",m+"\n")}
