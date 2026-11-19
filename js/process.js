/* ========== OKI WAY · "De la cerere la livrare": four isometric miniature worlds, one shared WebGL renderer ========== */
(function(){
'use strict';
var flow=document.getElementById('flow');
if(!flow) return;
if(!window.THREE){flow.classList.add('no3d');return}
var T=THREE, PI=Math.PI, TAU=PI*2;
var DBG=window.OKW_PROC_DEBUG||{};
var RM=!DBG.motion&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var HOVER=matchMedia('(hover: hover) and (pointer: fine)').matches;
var SMALL=Math.min(innerWidth,screen.width||innerWidth)<760;
var LOW=SMALL||(navigator.hardwareConcurrency||8)<=4;

/* ---------- timeline helpers ---------- */
function cl(x){return x<0?0:x>1?1:x}
function sg(t,a,b){return cl((t-a)/(b-a))}
function io(x){return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2}
function oc(x){return 1-Math.pow(1-x,3)}
function ob(x){var c=1.70158;return 1+(c+1)*Math.pow(x-1,3)+c*Math.pow(x-1,2)}
function hump(t,a,b){return Math.sin(sg(t,a,b)*PI)}
function lerp(a,b,x){return a+(b-a)*x}
function C(h){return new T.Color(h).convertSRGBToLinear()}

var R=null, ENV=null, MAT=null, BLOB=null, HALO=null;

/* ---------- geometry: unit primitives, rounded boxes, merging ---------- */
var UB=new T.BoxGeometry(1,1,1).translate(0,.5,0), UBT=new T.BoxGeometry(1,1,1).translate(0,-.5,0), UBL=new T.BoxGeometry(1,1,1).translate(.5,0,0);
var UCs={}, UCCs={}, USs={}, RBs={};
function UC(n){return UCs[n]||(UCs[n]=new T.CylinderGeometry(.5,.5,1,n,1).translate(0,.5,0))}
function UCC(n){return UCCs[n]||(UCCs[n]=new T.CylinderGeometry(.5,.5,1,n,1))}
function US(n){return USs[n]||(USs[n]=new T.SphereGeometry(.5,n,Math.max(6,Math.round(n*.6))))}
function RBG(w,h,d,r){
  var key=w+','+h+','+d+','+r; if(RBs[key]) return RBs[key];
  r=Math.max(.004,Math.min(r,w/2-.002,d/2-.002,h/2-.002));
  var b=r*.55, iw=w-2*b, id=d-2*b, rc=Math.max(.002,Math.min(r*.8,iw/2-.002,id/2-.002)), x0=-iw/2, y0=-id/2, s=new T.Shape();
  s.moveTo(x0+rc,y0); s.lineTo(x0+iw-rc,y0); s.quadraticCurveTo(x0+iw,y0,x0+iw,y0+rc); s.lineTo(x0+iw,y0+id-rc);
  s.quadraticCurveTo(x0+iw,y0+id,x0+iw-rc,y0+id); s.lineTo(x0+rc,y0+id); s.quadraticCurveTo(x0,y0+id,x0,y0+id-rc);
  s.lineTo(x0,y0+rc); s.quadraticCurveTo(x0,y0,x0+rc,y0);
  var g=new T.ExtrudeGeometry(s,{depth:Math.max(.002,h-2*b),bevelEnabled:true,bevelThickness:b,bevelSize:b,bevelSegments:2,curveSegments:3});
  g.rotateX(-PI/2); g.translate(0,b,0);
  return RBs[key]=g;
}
function merge(list){
  var arrs=list.map(function(g){var n=g.index?g.toNonIndexed():g;return [n.attributes.position.array,n.attributes.normal.array]});
  var len=arrs.reduce(function(s,a){return s+a[0].length},0), P=new Float32Array(len), N=new Float32Array(len), o=0;
  arrs.forEach(function(a){P.set(a[0],o);N.set(a[1],o);o+=a[0].length});
  var m=new T.BufferGeometry(); m.setAttribute('position',new T.BufferAttribute(P,3)); m.setAttribute('normal',new T.BufferAttribute(N,3));
  m.computeBoundingSphere(); return m;
}
var _m=new T.Matrix4(),_q=new T.Quaternion(),_e=new T.Euler(),_p=new T.Vector3(),_s=new T.Vector3();
function place(geo,x,y,z,sx,sy,sz,rx,ry,rz){
  var g=geo.clone(); _e.set(rx||0,ry||0,rz||0,'YXZ'); _q.setFromEuler(_e);
  _m.compose(_p.set(x,y,z),_q,_s.set(sx,sy,sz)); g.applyMatrix4(_m); return g;
}
/* Kit: collects parts per material, then merges them into one mesh per material (few draw calls, rich detail) */
function Kit(){this.p={}}
Kit.prototype={
  add:function(m,g){(this.p[m]||(this.p[m]=[])).push(g);return this},
  b:function(m,x,y,z,w,h,d,ry,rx,rz){return this.add(m,place(UB,x,y,z,w,h,d,rx,ry,rz))},
  r:function(m,x,y,z,w,h,d,rad,ry,rx,rz){return this.add(m,place(RBG(w,h,d,rad),x,y,z,1,1,1,rx,ry,rz))},
  c:function(m,x,y,z,rad,h,n,ry,rx,rz){return this.add(m,place(UC(n||16),x,y,z,rad*2,h,rad*2,rx,ry,rz))},
  ca:function(m,x,y,z,rad,len,ax,n,ry){return this.add(m,place(UCC(n||16),x,y,z,rad*2,len,rad*2,ax==='z'?PI/2:0,ry||0,ax==='x'?PI/2:0))},
  s:function(m,x,y,z,rx,ry,rz,n){return this.add(m,place(US(n||14),x,y,z,rx*2,ry*2,rz*2))},
  g:function(m,geo,x,y,z,ry,rx,rz,sx,sy,sz){return this.add(m,place(geo,x,y,z,sx||1,sy||1,sz||1,rx,ry,rz))},
  st:function(pr,x,y,z,ry,s,rx,rz){for(var m in pr) this.add(m,place(pr[m],x,y,z,s||1,s||1,s||1,rx||0,ry||0,rz||0));return this},
  rp:function(m,x,y,z,w,h,t,rad,ry){return this.r(m,x,y,z,w,t,h,rad,ry||0,PI/2)},
  to:function(parent,M,cast,recv){
    var out={};
    for(var k in this.p){var mat=(M&&M[k])||MAT[k], mesh=new T.Mesh(merge(this.p[k]),mat);
      mesh.castShadow=cast!==false&&!mat.transparent; mesh.receiveShadow=recv!==false&&!mat.transparent; parent.add(mesh); out[k]=mesh}
    this.p={}; return out;
  }
};
var PROTOS={};
function proto(key,fn){if(PROTOS[key])return PROTOS[key];var k=new Kit();fn(k);var o={};for(var m in k.p)o[m]=merge(k.p[m]);return PROTOS[key]=o}

/* ---------- textures ---------- */
function ctex(w,h,draw){var c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);
  var t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;t.anisotropy=4;return t}
function rr(x,X,Y,W,H,r){x.beginPath();x.moveTo(X+r,Y);x.arcTo(X+W,Y,X+W,Y+H,r);x.arcTo(X+W,Y+H,X,Y+H,r);x.arcTo(X,Y+H,X,Y,r);x.arcTo(X,Y,X+W,Y,r);x.closePath()}
function radial(stops){return ctex(128,128,function(x){var g=x.createRadialGradient(64,64,0,64,64,64);stops.forEach(function(s){g.addColorStop(s[0],s[1])});x.fillStyle=g;x.fillRect(0,0,128,128)})}

/* ---------- shared resources (created once the renderer exists) ---------- */
function makeShared(){
  /* studio environment: soft white sky, pale-blue floor bounce, two softboxes */
  var s=new T.Scene(), g=new T.SphereGeometry(10,32,16), p=g.attributes.position, col=[], top=C(0xFFFFFF).multiplyScalar(.62), bot=C(0x8FAED8).multiplyScalar(.5), tmp=new T.Color();
  for(var i=0;i<p.count;i++){var k=(p.getY(i)/10+1)/2;tmp.copy(bot).lerp(top,Math.pow(k,.8));col.push(tmp.r,tmp.g,tmp.b)}
  g.setAttribute('color',new T.Float32BufferAttribute(col,3));
  s.add(new T.Mesh(g,new T.MeshBasicMaterial({vertexColors:true,side:T.BackSide})));
  function box(w,h,x,y,z,k){var m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:new T.Color(k,k,k),side:T.DoubleSide}));m.position.set(x,y,z);m.lookAt(0,0,0);s.add(m)}
  box(9,6,-5,8,7,2.2); box(7,4,8,5,-3,1.0); box(12,3,0,9.6,0,1.1);
  var pm=new T.PMREMGenerator(R); ENV=pm.fromScene(s,.03).texture; pm.dispose();
  function std(hex,ro,me,o){var m=new T.MeshStandardMaterial({color:C(hex),roughness:ro,metalness:me||0,envMap:ENV,envMapIntensity:me>.5?1.0:.62});if(o)for(var q in o)m[q]=o[q];return m}
  MAT={
    white:std(0xFFFFFF,.52), snow:std(0xF3F7FB,.56), pale:std(0xDCE7F3,.55), light:std(0xAFC8E8,.46), mid:std(0x3E6F9E,.42,.04), navy:std(0x0C2D48,.38,.1),
    ink:std(0x1B3A57,.5,.05), metal:std(0xDDE5EE,.24,.85), steel:std(0x8EA2B7,.32,.8), rubber:std(0x23323F,.82),
    tint:std(0x5F88B6,.08,.25,{envMapIntensity:1.25}), floor:std(0xE9F0F7,.6), road:std(0xCAD8E7,.66), cardb:std(0xEEF3F9,.66),
    tape:std(0xAFC8E8,.4), wood:std(0xC6D7EB,.58), gold:std(0xD8AE36,.3,.6), goldS:std(0xE6C566,.4,.35),
    glass:std(0xAFC8E8,.04,.1,{transparent:true,opacity:.34,depthWrite:false,envMapIntensity:1.6}),
    std:std
  };
  BLOB=radial([[0,'rgba(12,45,72,.62)'],[.42,'rgba(12,45,72,.3)'],[1,'rgba(12,45,72,0)']]);
  HALO=radial([[0,'rgba(255,255,255,1)'],[.25,'rgba(255,255,255,.55)'],[1,'rgba(255,255,255,0)']]);
}
var BLOBG=new T.PlaneGeometry(1,1).rotateX(-PI/2);
function blob(parent,x,z,sx,sz,op,y){var m=new T.Mesh(BLOBG,new T.MeshBasicMaterial({map:BLOB,transparent:true,depthWrite:false,opacity:op==null?1:op}));
  m.position.set(x,y==null?.014:y,z);m.scale.set(sx,1,sz);m.renderOrder=1;parent.add(m);return m}
function halo(parent,x,y,z,size,hex,op){var m=new T.Sprite(new T.SpriteMaterial({map:HALO,color:C(hex),transparent:true,depthWrite:false,blending:T.AdditiveBlending,opacity:op==null?1:op}));
  m.position.set(x,y,z);m.scale.set(size,size,1);m.renderOrder=9;parent.add(m);return m}
function glow(hex){return new T.MeshBasicMaterial({color:C(hex),toneMapped:false})}
function sceneMats(){ /* per-scene copies of the materials a scene animates (hover highlights, colour changes) */
  var g=MAT.gold.clone(); g.emissive=C(0xD8AE36); g.emissiveIntensity=0;
  return {gold:g, glowG:glow(0xF0C84A), glowB:glow(0xAFC8E8), glowW:glow(0xFFFFFF)};
}

/* ---------- common stage: a rounded two-layer tile that floats on the card ---------- */
function stage(){
  var scene=new T.Scene(), root=new T.Group(); scene.add(root);
  var k=new Kit();
  k.r('light',0,-.8,0,12,.56,12,.34);
  k.r('white',0,-.3,0,11.82,.3,11.82,.16);
  k.to(root,null,false,true);
  blob(root,0,0,16.5,16.5,.42,-.86);
  var hemi=new T.HemisphereLight(C(0xFFFFFF),C(0x8FAED8),.34); scene.add(hemi);
  var key=new T.DirectionalLight(C(0xFFFBF2),1.08); key.position.set(-6.5,15,10);
  if(R.shadowMap.enabled){key.castShadow=true;var sc=key.shadow.camera;sc.left=-9.5;sc.right=9.5;sc.top=9.5;sc.bottom=-9.5;sc.near=2;sc.far=42;
    key.shadow.mapSize.set(1024,1024);key.shadow.bias=-.0005;key.shadow.normalBias=.025;key.shadow.radius=2.6}
  scene.add(key); scene.add(key.target);
  var fill=new T.DirectionalLight(C(0x9DBAE2),.42); fill.position.set(12,7,-5); scene.add(fill);
  var cam=new T.OrthographicCamera(-9,9,7,-7,.5,120); cam.position.set(40,40.9,40); cam.lookAt(0,.9,0);
  return {scene:scene,root:root,cam:cam,M:sceneMats()};
}

/* ---------- shared props (built once, stamped many times) ---------- */
function boxP(w,h,d,lab){return proto('box'+[w,h,d,lab],function(k){
  k.r('cardb',0,0,0,w,h,d,Math.min(.05,w*.06));
  var tw=Math.min(.18,w*.2);
  k.b('tape',0,h-.004,0,tw,.014,d+.008);
  k.b('tape',0,h*.6,d/2-.002,tw,h*.4+.004,.014);
  if(lab!=='none'){k.b(lab||'goldS',w*.25,h*.36,d/2+.003,Math.min(.26,w*.3),Math.min(.18,h*.24),.012);
    k.b('navy',-w*.24,h*.42,d/2+.003,Math.min(.22,w*.26),.045,.012); k.b('navy',-w*.24,h*.34,d/2+.003,Math.min(.16,w*.2),.03,.012)}
})}
function palletP(w,d){return proto('pal'+[w,d],function(k){
  for(var i=0;i<5;i++) k.b('wood',0,.125,-d/2+.08+i*(d-.16)/4,w,.035,.15);
  [-1,0,1].forEach(function(s){k.b('wood',s*(w/2-.08),.025,0,.16,.1,d)});
  [-1,0,1].forEach(function(s){k.b('wood',0,0,s*(d/2-.07),w,.025,.14)});
})}
function docP(w,h,seal){return proto('doc'+[w,h,seal],function(k){
  k.b('white',0,-h/2,0,w,h,.016);
  k.b('navy',-w*.17,h*.34,.009,w*.52,h*.055,.004);
  k.b('light',w*.3,h*.355,.009,w*.18,h*.035,.004);
  for(var i=0;i<6;i++){var s=i%3===2; k.b('light',-w*.05-(s?w*.12:0),h*.19-i*h*.095,.009,s?w*.5:w*.74,h*.026,.004)}
  if(seal) k.ca('gold',w*.27,-h*.36,.013,h*.075,.008,'z',20);
  k.b('ink',-w*.2,-h*.39,.009,w*.32,h*.012,.004);
})}
/* stacked pallet load: boxes on a pallet, labels facing the camera */
function loadP(){return proto('load',function(k){
  k.st(palletP(1.2,1.0),0,0,0);
  var B=[[.56,.48,.47],[.56,.48,.47]];
  [[-.29,-.25],[.29,-.25],[-.29,.25],[.29,.25]].forEach(function(p,i){k.st(boxP(.56,.48,.47,i===3?'goldS':i===1?'light':'none'),p[0],.16,p[1])});
  [[-.15,-.12,.62,.42,.66],[.32,.18,.48,.36,.52]].forEach(function(b,i){k.st(boxP(b[2],b[3],b[4],i?'none':'goldS'),b[0],.64,b[1],i?.12:-.05)});
})}
/* glass-and-metal chevron of the brand plane, used on tags and screens */
function planeIcon(k,m,x,y,z,s,ry){k.b(m,x,y,z,.08*s,.5*s,.05*s,ry,0,0); k.b(m,x,y+.24*s,z,.5*s,.07*s,.05*s,ry); k.b(m,x,y+.02*s,z,.24*s,.05*s,.05*s,ry)}

/* ===================== WORLD 1 · Solicită oferta: logistics quotation workstation ===================== */
function S1(){
  var st=stage(), root=st.root, M=st.M, k=new Kit();
  /* room: floor plate, two low walls, rug */
  k.r('floor',-2.2,0,-2.2,7.4,.035,7.4,.02);
  k.r('pale',-1.25,.035,-3.35,5.4,.025,3.5,.02);
  k.r('white',-2.05,0,-5.72,7.7,3.2,.3,.05); k.r('white',-5.72,0,-2.25,.3,3.2,7.3,.05);
  k.b('light',-2.05,0,-5.555,7.7,.14,.03); k.b('light',-5.555,0,-2.25,.03,.14,7.3);
  k.b('light',-2.05,3.2,-5.72,7.7,.05,.3); k.b('light',-5.72,3.2,-2.25,.3,.05,7.3);
  /* window on the side wall */
  k.b('white',-5.53,.95,-3.3,.08,1.85,2.8); k.b('tint',-5.49,1.05,-3.3,.04,1.65,2.6);
  k.b('white',-5.46,1.05,-3.3,.04,1.65,.07); k.b('white',-5.46,1.84,-3.3,.04,.06,2.6); k.b('white',-5.44,.88,-3.3,.22,.07,3.0);
  /* pinboard with notes, clock, floating shelf */
  k.b('pale',-4.2,1.7,-5.555,1.9,1.12,.035);
  [[-4.75,2.36,'white'],[-4.25,2.42,'goldS'],[-3.7,2.33,'white'],[-4.55,1.92,'light'],[-3.95,1.95,'white'],[-3.5,1.86,'light']].forEach(function(n){
    k.b(n[2],n[0],n[1]-.2,-5.53,.36,.36,.012); k.s('navy',n[0],n[1]+.12,-5.52,.025,.025,.02,8)});
  k.ca('navy',1.05,2.72,-5.545,.33,.03,'z',28); k.ca('white',1.05,2.72,-5.525,.3,.035,'z',28);
  k.b('navy',1.05,2.72,-5.5,.03,.18,.012); k.b('navy',1.05,2.72,-5.5,.025,.25,.012,0,0,-2.1); k.s('gold',1.05,2.72,-5.495,.03,.03,.02,8);
  k.b('white',.95,1.72,-5.42,1.25,.06,.3); [['navy',.45],['mid',.58],['light',.71]].forEach(function(b){k.b(b[0],b[1],1.78,-5.42,.11,.48,.26)});
  k.c('light',1.3,1.78,-5.42,.12,.2,14); k.s('mid',1.3,2.1,-5.42,.15,.2,.15,10);
  /* desk with drawer pedestal */
  k.r('white',-1.1,1.2,-4.75,5,.12,1.7,.04);
  k.r('pale',-3.48,0,-4.75,.12,1.2,1.55,.03); k.r('pale',1.28,0,-4.75,.12,1.2,1.55,.03);
  k.b('mid',-1.1,.45,-5.42,4.6,.7,.04);
  k.r('white',.55,0,-4.72,1.1,1.08,1.36,.03);
  for(var i=0;i<3;i++){k.b('snow',.55,.06+i*.34,-4.03,1.0,.3,.02); k.b('steel',.55,.27+i*.34,-4.015,.36,.03,.03)}
  /* monitor, keyboard, mouse */
  k.r('metal',-1.25,1.32,-5.05,.7,.045,.42,.02); k.b('metal',-1.25,1.36,-5.2,.12,.55,.07);
  k.r('navy',-1.25,1.72,-5.18,2.6,1.5,.09,.04);
  k.r('white',-1.25,1.32,-4.3,1.5,.045,.46,.02);
  for(var r0=0;r0<3;r0++) for(var c0=0;c0<11;c0++) k.b('pale',-1.86+c0*.122,1.365,-4.44+r0*.13,.1,.018,.1);
  k.s('white',-.22,1.345,-4.3,.085,.042,.13);
  /* mug, lamp, pen holder */
  k.c('mid',-2.3,1.32,-5.1,.11,.24,16); k.c('ink',-2.3,1.545,-5.1,.092,.01,16); k.b('mid',-2.16,1.39,-5.1,.07,.12,.035);
  k.c('navy',-3.1,1.32,-5.2,.18,.05,20); k.b('steel',-3.1,1.37,-5.2,.04,.75,.04,0,.5); k.b('steel',-3.1,2.03,-4.84,.04,.55,.04,0,2.0);
  k.r('navy',-3.1,1.66,-4.32,.3,.14,.24,.05);
  k.c('light',.1,1.32,-5.32,.1,.22,14); k.b('navy',.08,1.5,-5.32,.02,.18,.02,0,.2); k.b('gold',.12,1.5,-5.3,.02,.16,.02,0,-.2,.2);
  /* clipboard with a quotation form */
  k.st(proto('clip',function(q){q.r('navy',0,0,0,.62,.03,.82,.02);q.b('white',0,.03,.03,.54,.012,.68);
    for(var j=0;j<5;j++) q.b('light',-.04+(j%2)*.04,.043,-.2+j*.1,.38-(j%2)*.08,.004,.03); q.b('metal',0,.03,-.38,.22,.05,.09)}),-2.95,1.32,-4.3,.25);
  /* document tray */
  k.r('light',.75,1.32,-4.45,1.1,.07,.86,.02); k.b('white',.73,1.39,-4.47,.94,.012,.72,.04); k.b('snow',.77,1.402,-4.44,.94,.012,.72,-.03);
  /* office chair */
  k.st(proto('chair',function(q){
    for(var a=0;a<5;a++){var an=a/5*TAU; q.b('steel',Math.sin(an)*.27,.1,Math.cos(an)*.27,.08,.05,.56,an); q.s('rubber',Math.sin(an)*.52,.055,Math.cos(an)*.52,.065,.055,.065,8)}
    q.c('metal',0,.14,0,.055,.45,12); q.r('navy',0,.56,0,1.0,.18,1.0,.08); q.r('navy',0,.78,.42,.95,1.0,.14,.07); q.b('steel',0,.6,.47,.12,.36,.06);
    [-1,1].forEach(function(s){q.b('steel',s*.5,.62,.0,.05,.3,.05); q.r('ink',s*.5,.92,-.02,.12,.05,.48,.02)});
  }),-1.25,0,-2.9,.12);
  /* plant in the corner */
  k.c('white',-5.0,0,-5.0,.4,.75,20); k.c('pale',-5.0,.7,-5.0,.43,.07,20); k.c('ink',-5.0,.74,-5.0,.37,.02,20);
  for(var l=0;l<11;l++){var an2=l*2.4; k.g(l%2?'mid':'light',US(10),-5.0+Math.sin(an2)*.2,1.05+(l%3)*.16,-5.0+Math.cos(an2)*.2,an2,.55+(l%3)*.12,0,.26,.78,.11)}
  /* open shelf against the side wall */
  k.b('pale',-5.53,0,.3,.06,2.4,1.8); k.b('white',-5.26,0,-.57,.6,2.4,.06); k.b('white',-5.26,0,1.17,.6,2.4,.06); k.b('white',-5.26,2.34,.3,.6,.06,1.8);
  [0,.78,1.56].forEach(function(y){k.b('white',-5.26,y,.3,.6,.05,1.74)});
  ['navy','mid','light','navy','goldS','mid','light'].forEach(function(m,j){k.b(m,-5.3,.83,-.4+j*.15,.42,.62,.12)});
  k.r('snow',-5.28,1.61,-.1,.45,.42,.62,.03); k.r('pale',-5.28,1.61,.66,.45,.42,.62,.03); k.b('light',-5.05,1.75,-.1,.02,.1,.3); k.b('light',-5.05,1.75,.66,.02,.1,.3);
  k.c('steel',-5.3,2.4,.3,.04,.12,8); k.s('light',-5.3,2.67,.3,.21,.21,.21,16); k.ca('steel',-5.3,2.67,.3,.25,.02,'x',20);
  /* platform scale with a parcel, and a pallet of boxes */
  k.r('navy',-3.3,0,2.6,1.7,.16,1.5,.05); k.r('metal',-3.3,.16,2.6,1.56,.05,1.36,.03);
  k.b('steel',-4.25,0,1.95,.1,1.24,.1); k.r('white',-4.25,1.2,1.95,.62,.46,.2,.05);
  k.st(boxP(1.0,.8,.9),-3.3,.21,2.6,.1);
  k.st(palletP(1.2,1.0),.2,0,3.9);
  k.st(boxP(1.1,.8,.95),.2,.16,3.9,-.04); k.st(boxP(.9,.7,.8,'light'),.14,.96,3.88,.16);
  /* hologram projector puck under the floating form */
  k.c('navy',2.6,0,.9,.58,.14,28); k.c('light',2.6,.14,.9,.44,.03,28); k.c('white',2.6,.17,.9,.2,.02,20);
  k.to(root);

  /* screens (unlit canvas textures) */
  var dash=ctex(512,284,function(x,w,h){
    x.fillStyle='#0C2D48';x.fillRect(0,0,w,h); x.fillStyle='#0F3557';x.fillRect(0,0,58,h);
    for(var i=0;i<5;i++){x.fillStyle=i?'rgba(175,200,232,.35)':'#D8AE36';rr(x,17,22+i*40,24,24,6);x.fill()}
    x.fillStyle='rgba(255,255,255,.9)';rr(x,74,18,130,11,5);x.fill(); x.fillStyle='rgba(175,200,232,.5)';rr(x,74,36,80,7,3);x.fill();
    x.fillStyle='#D8AE36';rr(x,436,16,60,20,10);x.fill();
    for(i=0;i<3;i++){x.fillStyle='#14416A';rr(x,74+i*144,56,132,62,10);x.fill();x.fillStyle='rgba(175,200,232,.7)';rr(x,88+i*144,70,54,7,3);x.fill();
      x.fillStyle='#fff';rr(x,88+i*144,86,[86,66,98][i],15,5);x.fill();x.fillStyle=i===1?'#D8AE36':'#7FA7D2';rr(x,166+i*144,96,28,8,4);x.fill()}
    x.fillStyle='#113A5E';rr(x,74,130,268,140,12);x.fill();
    x.strokeStyle='rgba(175,200,232,.14)';x.lineWidth=1;for(i=0;i<5;i++){x.beginPath();x.moveTo(88,152+i*24);x.lineTo(330,152+i*24);x.stroke()}
    var pts=[[90,238],[124,222],[158,228],[192,198],[226,206],[260,172],[294,180],[326,152]];
    var gr=x.createLinearGradient(0,150,0,262);gr.addColorStop(0,'rgba(175,200,232,.45)');gr.addColorStop(1,'rgba(175,200,232,0)');
    x.beginPath();x.moveTo(90,262);pts.forEach(function(p){x.lineTo(p[0],p[1])});x.lineTo(326,262);x.closePath();x.fillStyle=gr;x.fill();
    x.beginPath();pts.forEach(function(p,j){j?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1])});x.strokeStyle='#AFC8E8';x.lineWidth=3;x.stroke();
    x.fillStyle='#D8AE36';x.beginPath();x.arc(260,172,5,0,TAU);x.fill();
    x.fillStyle='#113A5E';rr(x,354,130,142,140,12);x.fill();
    for(i=0;i<4;i++){x.fillStyle='rgba(175,200,232,.25)';rr(x,368,146+i*30,114,20,6);x.fill();x.fillStyle=i===0?'#D8AE36':'rgba(255,255,255,.75)';rr(x,376,153+i*30,[60,48,70,40][i],6,3);x.fill()}
  });
  var scrM=new T.MeshBasicMaterial({map:dash,toneMapped:false});
  var scr=new T.Mesh(new T.PlaneGeometry(2.46,1.36),scrM); scr.position.set(-1.25,2.47,-5.13); root.add(scr);
  var kg=ctex(160,84,function(x,w,h){x.fillStyle='#0C2D48';x.fillRect(0,0,w,h);x.fillStyle='#D8AE36';x.font='600 46px "Inter Tight",system-ui,sans-serif';
    x.textBaseline='middle';x.fillText('480',14,46);x.fillStyle='#AFC8E8';x.font='500 24px "Inter Tight",system-ui,sans-serif';x.fillText('kg',106,50)});
  var kd=new T.Mesh(new T.PlaneGeometry(.5,.27),new T.MeshBasicMaterial({map:kg,toneMapped:false})); kd.position.set(-4.25,1.43,2.054); root.add(kd);
  halo(root,-1.25,2.45,-4.9,4.2,0xAFC8E8,.16);
  var lampH=halo(root,-3.1,1.55,-4.3,1.2,0xF0C84A,.35);

  /* notification: gold dot + pulse ring on the monitor */
  var nDot=new T.Mesh(US(14),M.glowG); nDot.scale.setScalar(.15); nDot.position.set(-.08,3.18,-5.1); root.add(nDot);
  var ringM=new T.MeshBasicMaterial({color:C(0xF0C84A),transparent:true,depthWrite:false,toneMapped:false});
  var ring=new T.Mesh(new T.TorusGeometry(.13,.014,8,36),ringM); ring.position.copy(nDot.position); root.add(ring);

  /* floating quotation form */
  var panel=new T.Group(); panel.position.set(2.6,2.55,.9); panel.rotation.y=PI/4; root.add(panel);
  var pk=new Kit();
  pk.rp('glass',0,0,-.1,2.95,3.44,.05,.16);
  pk.rp('white',0,0,-.05,2.7,3.2,.1,.14);
  pk.b('navy',-.52,1.1,.05,1.25,.14,.02); pk.b('light',-.8,.88,.05,.68,.07,.02); pk.ca('gold',1.0,1.17,.07,.075,.03,'z',18);
  planeIcon(pk,'navy',.62,1.08,.06,.42,0);
  var FY=[.42,-.1,-.62,-1.14].map(function(v){return v+.22});
  FY.forEach(function(y,i){pk.b('light',-.82,y+.1,.05,.52+i%2*.18,.06,.02); pk.rp('pale',0,y-.05,.05,2.2,.3,.03,.07)});
  pk.to(panel,M);
  var fillM=MAT.std(0x3E6F9E,.45,.05), FW=[1.55,1.15,1.72,.86], fills=FY.map(function(y){var m=new T.Mesh(UBL,fillM);m.position.set(-.98,y-.05,.083);m.scale.set(.001,.09,.02);panel.add(m);return m});
  var caret=new T.Mesh(UB,M.glowG); caret.scale.set(.025,.15,.02); panel.add(caret);
  var btnM=MAT.navy.clone(), NAV=C(0x0C2D48), GLD=C(0xD8AE36);
  var btn=new T.Mesh(RBG(1.3,.06,.38,.08),btnM); btn.position.set(0,-1.5,.05); btn.rotation.x=PI/2; panel.add(btn);
  var btnTx=new T.Mesh(UB,MAT.white); btnTx.scale.set(.56,.06,.02); btnTx.position.set(0,-1.53,.112); panel.add(btnTx);
  var hDot=new T.Mesh(US(12),M.glowG); hDot.scale.setScalar(.11); panel.add(hDot);
  var hHalo=halo(panel,0,0,.1,.7,0xF0C84A,.9);
  var beamM=new T.MeshBasicMaterial({color:C(0xAFC8E8),transparent:true,opacity:.16,depthWrite:false,side:T.DoubleSide});
  var beam=new T.Mesh(new T.CylinderGeometry(1.25,.44,.72,32,1,true),beamM); beam.position.set(2.6,.53,.9); root.add(beam);

  /* quote document: rests on the tray, rises, gets approved, settles back */
  var doc=new T.Group(), dk=new Kit(); dk.st(docP(.9,1.16,true),0,0,0); dk.to(doc); root.add(doc);
  var badge=new T.Group(), bk=new Kit();
  bk.ca('gold',0,0,0,.27,.07,'z',30); bk.b('white',-.04,-.1,.04,.06,.17,.02,0,0,.733); bk.b('white',-.04,-.1,.04,.06,.3,.02,0,0,-.711);
  bk.to(badge,M); badge.position.set(.46,.52,.08); doc.add(badge);
  var pRest=new T.Vector3(.75,1.42,-4.45), pRise=new T.Vector3(1.05,3.75,-3.3), qRest=new T.Quaternion().setFromEuler(new T.Euler(-PI/2,0,0)),
      qRise=new T.Quaternion().setFromEuler(new T.Euler(-.1,PI/4,0,'YXZ'));
  var dShadow=blob(root,.85,-4.2,1.2,1.0,0,1.405);
  var part=new T.Mesh(US(12),M.glowG); part.scale.setScalar(.12); root.add(part); var pHalo=halo(root,0,0,0,.8,0xF0C84A,1);

  /* contact shadows */
  blob(root,-1.1,-4.75,6.4,2.6,.5); blob(root,-1.25,-2.9,1.9,1.9,.55); blob(root,-5.26,.3,1.3,2.4,.4); blob(root,-5,-5,1.3,1.3,.5);
  blob(root,-3.4,2.55,2.4,2.2,.42); blob(root,.2,3.9,2.0,1.8,.5); blob(root,2.6,.9,1.6,1.6,.5);

  var tmp=new T.Vector3(), a0=new T.Vector3(), a1=new T.Vector3(), a2=new T.Vector3(), PER=6.4;
  function update(t,h,intro){
    var tt=t%PER;
    var act=oc(sg(tt,0,.55))*(1-sg(tt,5.9,6.4));
    panel.position.y=2.55+Math.sin(t*1.25)*.05; panel.scale.setScalar(.95+.05*act+.02*h);
    beamM.opacity=.08+.12*act;
    var fi=-1;
    fills.forEach(function(m,i){var p=io(sg(tt,.6+i*.48,1.02+i*.48))*(1-sg(tt,5.75,6.15)); m.scale.x=Math.max(.001,p*FW[i]); if(p>0&&p<1)fi=i});
    caret.visible=fi>=0&&Math.sin(t*18)>-.2;
    if(fi>=0){var f=fills[fi]; caret.position.set(-.98+f.scale.x+.03,f.position.y-.075,.09)}
    var hd=io(sg(tt,2.55,3.0)); hDot.visible=hHalo.visible=tt>2.5&&tt<3.12;
    var fl=fills[3]; tmp.set(-.98+FW[3]+.08,fl.position.y,.13).lerp(a0.set(0,-1.5,.14),hd); hDot.position.copy(tmp); hHalo.position.copy(tmp);
    var bc=sg(tt,2.9,3.12)*(1-sg(tt,5.75,6.2)); btnM.color.copy(NAV).lerp(GLD,bc); btnM.emissive=btnM.emissive||new T.Color(); btnM.emissive.copy(GLD).multiplyScalar(bc*(.12+.25*h));
    /* gold particle: from the submit button to the document tray */
    var pa=io(sg(tt,3.1,3.65)); part.visible=pHalo.visible=tt>3.08&&tt<3.68;
    panel.localToWorld(a0.set(0,-1.5,.14)); root.worldToLocal(a0); a2.set(.75,1.6,-4.4); a1.copy(a0).add(a2).multiplyScalar(.5); a1.y+=1.6;
    tmp.set(0,0,0).addScaledVector(a0,(1-pa)*(1-pa)).addScaledVector(a1,2*pa*(1-pa)).addScaledVector(a2,pa*pa); part.position.copy(tmp); pHalo.position.copy(tmp);
    /* quote document rise -> approval -> settle */
    var up=io(sg(tt,3.55,4.25))*(1-io(sg(tt,5.0,5.85)));
    doc.position.lerpVectors(pRest,pRise,up); doc.position.y+=up*Math.sin(t*2.1)*.045; doc.quaternion.copy(qRest).slerp(qRise,up); doc.scale.setScalar(1+.3*up);
    dShadow.material.opacity=.35*up; dShadow.scale.set(1.2+up*.6,1,1.0+up*.5);
    var bp=ob(sg(tt,4.15,4.6))*(1-io(sg(tt,5.0,5.3))); badge.scale.setScalar(Math.max(.001,bp*(1+.06*h)));
    /* secondary motion */
    var np=(t%2.2)/2.2; ring.scale.setScalar(1+np*1.6); ringM.opacity=(1-np)*.85; nDot.scale.setScalar(.15*(1+.12*Math.sin(t*4)));
    scrM.color.setScalar(.9+.07*Math.sin(t*1.6)+.05*h);
    lampH.material.opacity=.3+.06*Math.sin(t*2.3);
    M.gold.emissiveIntensity=.22*h;
    root.position.y=-.55*(1-intro)+.12*h; root.rotation.y=h*.045;
  }
  return {scene:st.scene,cam:st.cam,update:update,still:4.5};
}

/* ---------- aircraft: the hero's procedural freighter, as a stampable prop ---------- */
function plateG(x0,le0,te0,x1,le1,te1,th,s){var sh=new T.Shape();sh.moveTo(s*x0,le0);sh.lineTo(s*x1,le1);sh.lineTo(s*x1,te1);sh.lineTo(s*x0,te0);sh.lineTo(s*x0,le0);
  var ge=new T.ExtrudeGeometry(sh,{depth:th,bevelEnabled:false});ge.rotateX(PI/2);ge.translate(0,th/2,0);return ge}
function airframeP(){return proto('airframe',function(k){
  var prof=[[0,.5],[.018,.49],[.034,.47],[.046,.44],[.053,.39],[.055,.32],[.055,-.2],[.05,-.31],[.04,-.4],[.024,-.47],[.008,-.505],[0,-.51]].map(function(p){return new T.Vector2(p[0],p[1])});
  var fus=new T.LatheGeometry(prof,22); fus.rotateX(PI/2); k.add('white',fus);
  var hp=new T.SphereGeometry(1,14,10); hp.scale(.034,.03,.17); hp.translate(0,.035,.29); k.add('white',hp);
  [1,-1].forEach(function(s){
    k.add('light',plateG(.05,.13,-.1,.5,-.17,-.245,.016,s)); k.add('light',plateG(.03,-.335,-.43,.18,-.425,-.47,.008,s));
    [[.165,-.045,.07,.022],[.3,-.032,-.03,.021]].forEach(function(e){
      var c=new T.CylinderGeometry(e[3]*.92,e[3],e[3]*4.6,12); c.rotateX(PI/2); c.translate(s*e[0],e[1],e[2]); k.add('mid',c);
      var inl=new T.CircleGeometry(e[3]*.82,12); inl.translate(s*e[0],e[1],e[2]+e[3]*2.31); k.add('navy',inl);
    });
  });
  var fs=new T.Shape(); fs.moveTo(-.3,.04);fs.lineTo(-.43,.24);fs.lineTo(-.51,.24);fs.lineTo(-.48,.04);fs.lineTo(-.3,.04);
  var fin=new T.ExtrudeGeometry(fs,{depth:.012,bevelEnabled:false}); fin.rotateY(-PI/2); fin.translate(.006,0,0); k.add('navy',fin);
  var ck=new T.SphereGeometry(.03,10,6); ck.scale(1.25,.45,1); ck.translate(0,.036,.452); k.add('navy',ck);
})}

/* ---------- navigation map texture: Eurasia from the Natural Earth land mask ---------- */
var MAPR={l:-12,r:128,t:62,b:-4};
function mapTex(){
  var W=768,H=362, c=document.createElement('canvas'); c.width=W;c.height=H; var x=c.getContext('2d');
  function base(){x.fillStyle='#A8C2E3';x.fillRect(0,0,W,H)}
  function grid(){x.strokeStyle='rgba(12,45,72,.16)';x.lineWidth=1;
    for(var lo=-10;lo<=120;lo+=10){var px=(lo-MAPR.l)/(MAPR.r-MAPR.l)*W;x.beginPath();x.moveTo(px,0);x.lineTo(px,H);x.stroke()}
    for(var la=0;la<=60;la+=10){var py=(MAPR.t-la)/(MAPR.t-MAPR.b)*H;x.beginPath();x.moveTo(0,py);x.lineTo(W,py);x.stroke()}}
  base(); grid();
  var t=new T.CanvasTexture(c); t.encoding=T.sRGBEncoding; t.anisotropy=8;
  var src=window.OKW_MASK; if(!src) return t;
  var im=new Image(); im.onload=function(){
    var m=document.createElement('canvas'); m.width=W; m.height=H; var mx=m.getContext('2d');
    mx.drawImage(im,(MAPR.l+180)/360*im.width,(90-MAPR.t)/180*im.height,(MAPR.r-MAPR.l)/360*im.width,(MAPR.t-MAPR.b)/180*im.height,0,0,W,H);
    var d=mx.getImageData(0,0,W,H).data; base(); var out=x.getImageData(0,0,W,H), o=out.data;
    function L(xx,yy){return xx<0||yy<0||xx>=W||yy>=H?false:d[(yy*W+xx)*4]>110}
    for(var yy=0;yy<H;yy++) for(var xx=0;xx<W;xx++){ if(!L(xx,yy)) continue; var j=(yy*W+xx)*4;
      var coast=!L(xx-2,yy)||!L(xx+2,yy)||!L(xx,yy-2)||!L(xx,yy+2);
      if(coast){o[j]=226;o[j+1]=236;o[j+2]=247} else {o[j]=250;o[j+1]=252;o[j+2]=255} }
    x.putImageData(out,0,0); grid();
    x.fillStyle='rgba(62,111,158,.22)'; for(var gy=6;gy<H;gy+=9) for(var gx=6;gx<W;gx+=9) if(L(gx,gy)&&L(gx-3,gy)&&L(gx+3,gy)&&L(gx,gy-3)&&L(gx,gy+3)) x.fillRect(gx-1,gy-1,2,2);
    t.needsUpdate=true;
  }; im.src=src;
  return t;
}

/* ===================== WORLD 2 · Planificăm ruta: international air-cargo route planning ===================== */
function S2(){
  var st=stage(), root=st.root, M=st.M, k=new Kit();
  var MX0=-5.2, MZ0=-4.0, MW=9.8, MD=4.6, MY=.965;
  function mp(lon,lat){return [MX0+(lon-MAPR.l)/(MAPR.r-MAPR.l)*MW, MZ0+(MAPR.t-lat)/(MAPR.t-MAPR.b)*MD]}
  /* navigation table: pale plinth, white top with overhang, navy bezel, glowing edge strips */
  k.r('light',-.3,0,-1.7,9.9,.62,4.7,.1); k.r('white',-.3,.62,-1.7,10.4,.28,5.2,.1); k.r('navy',-.3,.9,-1.7,10.1,.06,4.9,.05);
  k.b('glowB',-.3,.35,.656,9.6,.05,.02); k.b('glowB',4.556,.35,-1.7,.02,.05,4.4);
  for(var i=0;i<6;i++){k.b('light',-4.6+i*1.75,.05,.62,.5,.04,.03)}
  /* terminal + control tower at the back */
  k.r('white',-1.5,0,-5.15,6.6,1.25,1.3,.06); k.b('tint',-1.5,.18,-4.49,6.2,.78,.03);
  for(var m0=0;m0<13;m0++) k.b('white',-4.6+m0*.516,.18,-4.47,.05,.78,.03);
  k.b('white',-1.5,.96,-4.47,6.2,.05,.03); k.b('light',-1.5,1.25,-5.15,6.64,.06,1.34);
  k.r('pale',-3.4,1.31,-5.2,.8,.3,.6,.04); k.r('pale',.4,1.31,-5.3,1.0,.24,.5,.04); k.c('steel',-3.4,1.61,-5.2,.2,.03,16);
  k.c('white',3.9,0,-5.05,.36,2.5,24); k.c('light',3.9,.8,-5.05,.365,.05,24); k.c('light',3.9,1.6,-5.05,.365,.05,24);
  k.c('pale',3.9,2.5,-5.05,.56,.12,24); k.c('tint',3.9,2.62,-5.05,.6,.42,24); k.c('navy',3.9,2.62,-5.05,.62,.04,24); k.c('navy',3.9,3.0,-5.05,.62,.04,24);
  k.c('white',3.9,3.04,-5.05,.68,.1,24); k.c('steel',3.9,3.14,-5.05,.03,.62,8);
  /* customs desk with document stacks and a stamp */
  k.r('white',-3.5,.92,3.05,2.3,.1,1.25,.04);
  [[-1.0,-.5],[1.0,-.5],[-1.0,.5],[1.0,.5]].forEach(function(p){k.b('navy',-3.5+p[0],0,3.05+p[1],.08,.92,.08)});
  k.b('navy',-3.5,.3,3.05,2.0,.05,1.0);
  k.r('light',-4.05,1.02,3.0,.95,.04,1.2,.02);
  [0,1,2,3].forEach(function(j){k.st(docP(.82,1.06,j===3),-4.05+j*.02,1.065+j*.016,3.0+j*.01,(j-1.5)*.05,1,-PI/2)});
  k.c('navy',-2.55,1.02,2.8,.12,.08,16); k.c('gold',-2.55,1.1,2.8,.09,.04,16); k.c('navy',-2.55,1.14,2.8,.035,.22,10); k.s('navy',-2.55,1.38,2.8,.07,.07,.07,10);
  /* route-planning kiosk */
  k.c('navy',3.4,0,3.0,.42,.08,24); k.b('steel',3.4,.08,3.0,.12,1.15,.12);
  /* bollards with light caps, planters */
  [[-5.2,1.6],[4.7,1.6],[-5.2,-4.3],[0,1.7]].forEach(function(p){k.c('white',p[0],0,p[1],.09,.55,14); k.c('glowB',p[0],.55,p[1],.095,.06,14)});
  [[-5.0,5.0],[5.0,5.0]].forEach(function(p){k.r('white',p[0],0,p[1],.9,.5,.9,.08); k.s('light',p[0],.95,p[1],.42,.42,.42,14); k.s('mid',p[0]+.1,1.25,p[1]-.08,.28,.28,.28,12)});
  /* floor guide lines */
  k.b('light',0,.003,3.3,.05,.01,3.6); k.b('light',-1.6,.003,1.5,3.2,.01,.05); k.b('light',1.6,.003,1.5,3.2,.01,.05);
  k.to(root,M);

  /* the map surface */
  var map=new T.Mesh(new T.PlaneGeometry(MW,MD).rotateX(-PI/2),new T.MeshStandardMaterial({map:mapTex(),roughness:.6,metalness:0,envMap:ENV,envMapIntensity:.45}));
  map.position.set(MX0+MW/2,MY,MZ0+MD/2); map.receiveShadow=true; root.add(map);
  /* raised glass layer over Europe (map layers at different heights) */
  var eu=mp(-10,58), eu2=mp(42,36);
  var lay=new T.Mesh(RBG(eu2[0]-eu[0],.035,eu2[1]-eu[1],.08),MAT.glass); lay.position.set((eu[0]+eu2[0])/2,MY+.32,(eu[1]+eu2[1])/2); root.add(lay);
  var lk=new Kit(); [[eu[0]+.1,eu[1]+.1],[eu2[0]-.1,eu[1]+.1],[eu[0]+.1,eu2[1]-.1],[eu2[0]-.1,eu2[1]-.1]].forEach(function(p){lk.c('steel',p[0],MY,p[1],.025,.32,8)}); lk.to(root);

  /* airports: pads at different heights with beacons that light up in sequence */
  var HUBS=[[121.47,31.23,.22],[114.17,22.32,.16],[103.82,1.35,.12],[55.27,25.2,.2],[28.98,41.0,.1],[8.68,50.11,.14],[4.9,52.37,.18]];
  var KIV=mp(28.86,47.0);
  var bk=new Kit(), beacons=[];
  HUBS.forEach(function(hb,i){var p=mp(hb[0],hb[1]); hb.p=p;
    bk.c('white',p[0],MY,p[1],.2,hb[2],20); bk.c('light',p[0],MY+hb[2],p[1],.15,.02,20);
    var bm=new T.MeshBasicMaterial({color:C(0xAFC8E8),toneMapped:false}), b=new T.Mesh(US(12),bm); b.scale.setScalar(.13); b.position.set(p[0],MY+hb[2]+.08,p[1]); root.add(b);
    var hl=halo(root,p[0],MY+hb[2]+.1,p[1],.9,0xF0C84A,0); beacons.push({m:bm,h:hl});
  });
  bk.to(root);
  /* Moldova: gold destination pin with pulse rings */
  var pin=new T.Group(), pk2=new Kit(); pin.position.set(KIV[0],MY,KIV[1]); root.add(pin);
  pk2.c('gold',0,0,0,.22,.04,24); pk2.g('gold',new T.ConeGeometry(.15,.62,20).rotateX(PI),0,.6,0); pk2.s('gold',0,.95,0,.2,.2,.2,18); pk2.s('white',.0,.98,.15,.07,.07,.05,10);
  pk2.to(pin,M);
  var pinH=halo(pin,0,.95,0,1.3,0xF0C84A,.5);
  var RINGS=[0,1].map(function(){var m=new T.Mesh(new T.RingGeometry(.3,.36,48).rotateX(-PI/2),new T.MeshBasicMaterial({color:C(0xD8AE36),transparent:true,depthWrite:false,toneMapped:false}));
    m.position.set(KIV[0],MY+.012,KIV[1]); root.add(m); return m});

  /* routes: quiet blue arcs from every hub, one gold optimized route that draws itself */
  function arc(a,b,hgt){var A=new T.Vector3(a[0],MY+.18,a[1]),B=new T.Vector3(b[0],MY+.12,b[1]),Cc=A.clone().add(B).multiplyScalar(.5);Cc.y+=hgt;return new T.QuadraticBezierCurve3(A,Cc,B)}
  var quietM=new T.MeshBasicMaterial({color:C(0x7FA3C8),transparent:true,opacity:.55,depthWrite:false});
  HUBS.slice(1).forEach(function(hb){var d=Math.hypot(hb.p[0]-KIV[0],hb.p[1]-KIV[1]); if(d<.6)return;
    root.add(new T.Mesh(new T.TubeGeometry(arc(hb.p,KIV,.35+d*.16),40,.016,6),quietM))});
  var S0=HUBS[0].p, A0=new T.Vector3(S0[0],MY+.3,S0[1]), B0=new T.Vector3(KIV[0],MY+1.0,KIV[1]), dv=B0.clone().sub(A0);
  var route=new T.CubicBezierCurve3(A0,A0.clone().addScaledVector(dv,.3).add(new T.Vector3(0,1.55,.95)),A0.clone().addScaledVector(dv,.72).add(new T.Vector3(0,1.4,-.55)),B0);
  var NSEG=140, RAD=8, gold=new T.Mesh(new T.TubeGeometry(route,NSEG,.032,RAD),new T.MeshBasicMaterial({color:C(0xD8AE36),transparent:true,toneMapped:false}));
  root.add(gold); var GIDX=gold.geometry.index.count;
  var pulses=[0,1,2].map(function(){var m=new T.Mesh(US(10),M.glowG);m.scale.setScalar(.09);root.add(m);return m});

  /* the freighter: white/blue airframe, fades in at take-off and out at landing */
  var pmat={}; ['white','pale','light','navy','mid'].forEach(function(q){pmat[q]=MAT[q].clone();pmat[q].transparent=true});
  var plane=new T.Group(), pl=new Kit(); pl.st(airframeP(),0,0,0); pl.to(plane,pmat); plane.scale.setScalar(1.8); root.add(plane);
  var pShadow=blob(root,0,0,.9,.9,0,MY+.006);
  /* customs approval: check badge pops on the top document */
  var appr=new T.Group(), ak=new Kit(); ak.ca('gold',0,0,0,.24,.06,'z',28); ak.b('white',-.035,-.09,.035,.055,.15,.02,0,0,.733); ak.b('white',-.035,-.09,.035,.055,.27,.02,0,0,-.711);
  ak.to(appr,M); appr.position.set(-4.0,1.45,3.05); appr.rotation.set(-PI/2,0,0); root.add(appr);
  var apprH=halo(root,-4.0,1.5,3.05,1.1,0xF0C84A,0);
  /* kiosk screen with the route list */
  var kt=ctex(256,176,function(x,w,h){x.fillStyle='#0C2D48';x.fillRect(0,0,w,h);x.fillStyle='#fff';rr(x,14,12,92,10,5);x.fill();
    for(var i=0;i<4;i++){x.fillStyle=i===0?'rgba(216,174,54,.22)':'rgba(175,200,232,.14)';rr(x,12,34+i*34,232,28,8);x.fill();
      x.fillStyle=i===0?'#D8AE36':'#AFC8E8';x.beginPath();x.arc(28,48+i*34,5,0,TAU);x.fill();x.fillStyle='rgba(255,255,255,.85)';rr(x,42,44+i*34,[96,74,110,64][i],7,3);x.fill();
      x.fillStyle=i===0?'#D8AE36':'rgba(175,200,232,.7)';rr(x,190,44+i*34,40,7,3);x.fill()}});
  var ks=new T.Group(); ks.position.set(3.4,1.3,3.0); ks.rotation.set(0,PI/4,0); root.add(ks);
  var kk=new Kit(); kk.rp('navy',0,0,-.05,1.3,.92,.07,.06); kk.b('steel',0,-.62,-.1,.14,.2,.08); kk.to(ks);
  var kscr=new T.Mesh(new T.PlaneGeometry(1.18,.8),new T.MeshBasicMaterial({map:kt,toneMapped:false})); kscr.position.set(0,0,.025); ks.add(kscr); ks.rotation.x=-.28;
  /* tower beacon + scan band */
  var tb=new T.Mesh(US(10),M.glowG); tb.scale.setScalar(.12); tb.position.set(3.9,3.8,-5.05); root.add(tb); var tbH=halo(root,3.9,3.8,-5.05,.9,0xF0C84A,.5);
  var scanM=new T.MeshBasicMaterial({map:ctex(64,8,function(x,w,h){var g=x.createLinearGradient(0,0,w,0);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.5,'rgba(255,255,255,.9)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,w,h)}),
    color:C(0xAFC8E8),transparent:true,depthWrite:false,blending:T.AdditiveBlending,opacity:0});
  var scan=new T.Mesh(new T.PlaneGeometry(1.2,MD).rotateX(-PI/2),scanM); scan.position.set(0,MY+.008,MZ0+MD/2); root.add(scan);

  blob(root,-.3,-1.7,11.4,6.2,.42); blob(root,-1.5,-5.1,7.2,1.9,.4); blob(root,3.9,-5.05,1.4,1.4,.5); blob(root,-3.5,3.05,2.8,1.8,.42); blob(root,3.4,3.0,1.2,1.2,.45);

  var P=new T.Vector3(), Tg=new T.Vector3(), Tg2=new T.Vector3(), LK=new T.Vector3(), PER=7.2;
  function update(t,h,intro){
    var tt=t%PER, fadeAll=1-sg(tt,6.55,7.15);
    beacons.forEach(function(b,i){var on=io(sg(tt,.15+i*.17,.45+i*.17))*fadeAll; b.m.color.copy(C(0xAFC8E8)).lerp(C(0xF0C84A),on); b.h.material.opacity=on*(.55+.25*Math.sin(t*3+i));});
    var dr=io(sg(tt,.9,2.7)); gold.geometry.setDrawRange(0,Math.floor(dr*NSEG)*RAD*6); gold.material.opacity=fadeAll;
    pulses.forEach(function(m,i){var u=((t*.32+i/3)%1)*dr; m.visible=dr>.05&&fadeAll>.5; route.getPointAt(Math.min(.999,u),P); m.position.copy(P); m.scale.setScalar(.07+.03*Math.sin(t*6+i))});
    /* flight */
    var u=io(sg(tt,2.35,5.95)), vis=sg(tt,2.35,2.65)*(1-sg(tt,5.65,5.95));
    plane.visible=vis>.01; for(var q in pmat) pmat[q].opacity=vis;
    route.getPointAt(Math.max(.001,Math.min(.999,u)),P); route.getTangentAt(Math.max(.001,Math.min(.999,u)),Tg); route.getTangentAt(Math.min(.999,u+.02),Tg2);
    plane.position.copy(P); LK.copy(P).add(Tg); root.localToWorld(LK); plane.lookAt(LK);
    var turn=Math.atan2(Tg2.x,Tg2.z)-Math.atan2(Tg.x,Tg.z); plane.rotateZ(Math.max(-.5,Math.min(.5,-turn*9)));
    plane.scale.setScalar(1.8*(.75+.25*vis));
    pShadow.position.set(P.x+.25,MY+.006,P.z-.12); var hgt=P.y-MY; pShadow.material.opacity=.5*vis*(1-Math.min(.6,hgt*.22)); pShadow.scale.set(1.4+hgt*.3,1,1.4+hgt*.3);
    /* destination pulse + approval */
    var arr=sg(tt,5.55,6.9);
    RINGS.forEach(function(r,i){var p=(arr*1.6-i*.35); var a=p>0&&p<1?1-p:0; r.scale.setScalar(1+Math.max(0,p)*3.2); r.material.opacity=a*.75});
    pin.position.y=MY+.04*Math.sin(t*2.2); pinH.material.opacity=.4+.35*hump(tt,5.5,6.8)+.15*h;
    var ap=ob(sg(tt,5.95,6.4))*(1-io(sg(tt,6.7,7.1))); appr.scale.setScalar(Math.max(.001,ap)); apprH.material.opacity=ap*.6;
    /* ambient */
    tbH.material.opacity=.3+.25*(.5+.5*Math.sin(t*2.4)); tb.scale.setScalar(.11+.02*Math.sin(t*2.4));
    var sp=sg(tt,3.0,4.8); scanM.opacity=hump(tt,3.0,4.8)*.55; scan.position.x=lerp(MX0,MX0+MW,sp);
    M.gold.emissiveIntensity=.25*h;
    root.position.y=-.55*(1-intro)+.12*h; root.rotation.y=h*.045;
  }
  return {scene:st.scene,cam:st.cam,update:update,still:4.4,dbg:{plane:plane,route:route,pmat:pmat}};
}

/* ---------- wheels (separate groups so they can roll) ---------- */
function wheelP(r,w){return proto('wheel'+[r,w],function(k){
  k.ca('rubber',0,0,0,r,w,'x',22); k.ca('metal',0,0,0,r*.58,w+.012,'x',16); k.ca('navy',0,0,0,r*.24,w+.03,'x',10);
  for(var i=0;i<5;i++){var a=i/5*TAU; k.s('steel',0,Math.cos(a)*r*.38,Math.sin(a)*r*.38,(w+.04)/2,r*.07,r*.07,6)}
  for(var j=0;j<12;j++){var b=j/12*TAU, rr0=r*.97-.012; k.b('ink',0,Math.cos(b)*rr0,Math.sin(b)*rr0,w*.92,.024,r*.16,0,b)}
})}
function wheel(parent,x,y,z,r,w){var g=new T.Group(), k=new Kit(); k.st(wheelP(r,w),0,0,0); k.to(g); g.position.set(x,y,z); parent.add(g); return g}

/* ---------- forklift (local forward = +Z, forks in front) ---------- */
function forklift(M){
  var fk=new T.Group(), k=new Kit();
  k.r('navy',0,.1,-.25,1.0,.16,1.5,.04);
  k.r('white',0,.2,-.25,1.1,.56,1.42,.1);
  k.r('mid',0,.2,-.98,1.12,.8,.44,.12);
  k.r('snow',0,.76,-.56,.92,.12,.68,.05);
  k.b('gold',.556,.5,-.3,.02,.06,1.0); k.b('gold',-.556,.5,-.3,.02,.06,1.0);
  k.r('white',.58,.42,.32,.14,.1,.62,.03); k.r('white',-.58,.42,.32,.14,.1,.62,.03);
  k.b('rubber',0,.76,.14,.82,.02,.5); k.r('navy',0,.76,.38,.7,.3,.16,.04);
  k.r('navy',0,.88,-.45,.5,.12,.44,.05); k.r('navy',0,1.0,-.66,.5,.4,.1,.04);
  k.b('steel',0,.95,.3,.05,.34,.05,0,-.5); k.g('ink',new T.TorusGeometry(.13,.024,6,18),0,1.25,.2,0,-1.0);
  [[.48,.4],[-.48,.4]].forEach(function(p){k.b('steel',p[0],.76,p[1],.06,1.12,.06)});
  [[.48,-.74],[-.48,-.74]].forEach(function(p){k.b('steel',p[0],.98,p[1],.06,.9,.06)});
  k.b('steel',.48,1.84,-.17,.06,.06,1.2); k.b('steel',-.48,1.84,-.17,.06,.06,1.2); k.b('steel',0,1.84,.4,1.02,.06,.06); k.b('steel',0,1.84,-.74,1.02,.06,.06);
  [-.45,-.17,.11].forEach(function(z){k.b('steel',0,1.85,z,1.0,.03,.08)});
  k.c('navy',.3,1.9,-.6,.07,.06,12); k.b('glowW',.44,1.62,.44,.1,.07,.04); k.b('glowW',-.44,1.62,.44,.1,.07,.04);
  k.b('steel',.33,.08,.62,.09,1.72,.1); k.b('steel',-.33,.08,.62,.09,1.72,.1); k.b('steel',0,1.7,.62,.76,.08,.1); k.b('steel',0,.1,.62,.76,.06,.1);
  k.c('metal',0,.12,.55,.05,1.36,12); k.b('ink',.15,.3,.68,.025,1.36,.02); k.b('ink',-.15,.3,.68,.025,1.36,.02);
  k.to(fk,M);
  var bcn=new T.Mesh(US(10),M.glowG); bcn.scale.set(.12,.1,.12); bcn.position.set(.3,2.0,-.6); fk.add(bcn);
  var carr=new T.Group(), ck=new Kit();
  ck.b('navy',0,.06,.72,.84,.48,.06); ck.b('steel',0,.54,.72,.84,.05,.05); ck.b('steel',0,.98,.72,.84,.05,.05);
  [-.36,-.12,.12,.36].forEach(function(x){ck.b('steel',x,.54,.72,.04,.46,.04)});
  [.22,-.22].forEach(function(x){ck.b('steel',x,.04,.765,.1,.5,.05); ck.b('steel',x,.04,1.335,.1,.05,1.15); ck.b('steel',x,.04,1.9,.1,.03,.04)});
  ck.to(carr); fk.add(carr);
  var W=[wheel(fk,.5,.26,.32,.26,.2),wheel(fk,-.5,.26,.32,.26,.2),wheel(fk,.45,.2,-.82,.2,.16),wheel(fk,-.45,.2,-.82,.2,.16)];
  var sh=blob(fk,0,-.1,1.7,3.0,.45,.012);
  return {g:fk,carr:carr,W:W,bcn:bcn};
}

/* ===================== WORLD 3 · Preluăm și încărcăm: animated miniature cargo warehouse ===================== */
function S3(){
  var st=stage(), root=st.root, M=st.M, k=new Kit(), i, x, z;
  /* ---- warehouse building ---- */
  k.r('white',-4.15,0,-4.05,3.2,3.0,3.4,.05); k.r('white',-1.55,0,-4.475,2.0,3.0,2.55,.05);
  k.b('white',-5.6,0,-1.95,.3,3.0,.8); k.b('white',-4.05,0,-1.95,.2,3.0,.8); k.b('white',-2.65,0,-1.95,.2,3.0,.8); k.b('white',-.7,0,-2.375,.3,3.0,1.65);
  [[-5.45,-4.15],[-3.95,-2.75]].forEach(function(b){var cx=(b[0]+b[1])/2, w=b[1]-b[0];
    k.b('white',cx,0,-1.95,w,.9,.8); k.b('white',cx,2.6,-1.95,w,.4,.8); k.b('pale',cx,.9,-2.33,w,1.7,.04);
    k.b('navy',b[0]+.1,.9,-2.12,.04,1.7,.04); k.b('navy',b[1]-.1,.9,-2.12,.04,1.7,.04);
    [1.36,1.96].forEach(function(y){k.b('steel',cx,y,-2.1,w-.12,.03,.42)});
    k.st(boxP(.34,.28,.3,'none'),cx-.3,.9,-2.1,.1); k.st(boxP(.4,.32,.34,'goldS'),cx+.22,.9,-2.1,-.05);
    k.st(boxP(.3,.26,.3,'none'),cx-.25,1.39,-2.1); k.st(boxP(.36,.3,.32,'light'),cx+.2,1.39,-2.1,.08); k.st(boxP(.32,.24,.3,'none'),cx,1.99,-2.1);
    k.b('white',cx,.9,-1.565,.04,1.7,.03); k.b('white',cx,1.72,-1.565,w,.04,.03); k.b('white',cx,.88,-1.5,w+.04,.04,.14);
  });
  k.b('white',-1.7,2.2,-2.375,1.7,.8,1.65);
  k.b('ink',-1.7,0,-2.375,1.7,.012,1.65); k.b('ink',-1.7,0,-3.17,1.7,2.2,.03); k.b('ink',-2.54,0,-2.375,.02,2.2,1.6); k.b('ink',-.86,0,-2.375,.02,2.2,1.6);
  k.b('steel',-2.25,0,-3.05,.05,1.9,.05); k.b('steel',-1.15,0,-3.05,.05,1.9,.05); k.b('steel',-1.7,1.1,-3.05,1.15,.04,.2);
  k.b('pale',-1.7,2.12,-1.62,1.8,.3,.16); k.b('navy',-2.5,.06,-1.47,.16,.42,.12); k.b('navy',-.9,.06,-1.47,.16,.42,.12);
  k.r('white',-1.7,2.5,-1.12,2.3,.1,1.0,.03); k.b('steel',-2.7,2.18,-1.4,.05,.45,.05,0,-.75); k.b('steel',-.7,2.18,-1.4,.05,.45,.05,0,-.75);
  k.b('light',-3.15,2.9,-1.53,5.2,.1,.04); k.b('light',-.53,2.9,-3.65,.04,.1,4.2);
  k.b('light',-3.15,3.0,-1.6,5.2,.12,.1); k.b('light',-.6,3.0,-3.65,.1,.12,4.2); k.b('white',-3.15,3.0,-5.7,5.2,.12,.1); k.b('white',-5.7,3.0,-3.65,.1,.12,4.2);
  k.b('navy',-4.8,2.64,-1.54,1.1,.24,.02); planeIcon(k,'gold',-5.15,2.66,-1.525,.3,0); k.b('white',-4.6,2.73,-1.525,.55,.05,.012);
  k.r('pale',-4.6,3.0,-4.4,1.0,.42,.8,.05); k.c('steel',-4.6,3.42,-4.4,.28,.03,18); k.c('navy',-4.6,3.44,-4.4,.2,.02,18);
  k.r('pale',-2.9,3.0,-4.9,.7,.32,.6,.04); k.r('tint',-3.25,3.0,-3.1,1.2,.14,.8,.04); k.r('tint',-1.55,3.0,-2.75,.9,.14,.7,.04);
  for(z=-5.55;z<-1.6;z+=.26){ if(z>-4.92&&z<-3.68) continue; k.b('pale',-.53,0,z,.05,2.6,.07) }
  k.b('ink',-.56,.62,-4.3,.03,.98,1.02); k.b('white',-.51,1.6,-4.3,.08,.08,1.14); k.b('white',-.51,.55,-4.3,.08,.07,1.14);
  for(i=0;i<6;i++) k.b('light',-.5,.64,-4.725+i*.17,.03,.92,.15);
  /* ---- conveyor with an X-ray scanner feeding it ---- */
  k.b('steel',1.7,.84,-4.72,4.5,.1,.05); k.b('steel',1.7,.84,-3.88,4.5,.1,.05);
  for(x=3.75;x>-.5;x-=.18) k.ca('metal',x,.9,-4.3,.05,.8,'z',10);
  [3.6,2.4,1.2,0].forEach(function(x){k.b('steel',x,0,-4.68,.07,.84,.07); k.b('steel',x,0,-3.92,.07,.84,.07); k.b('steel',x,.34,-4.3,.05,.05,.76)});
  k.r('white',4.75,0,-4.3,1.6,1.85,1.25,.1); k.r('light',4.75,.62,-4.3,1.64,.08,1.29,.03);
  k.b('ink',5.56,.88,-4.3,.02,.7,.88); for(i=0;i<5;i++) k.b('mid',5.575,.9,-4.66+i*.18,.02,.66,.16);
  k.b('navy',4.35,1.2,-3.665,.6,.36,.02); k.b('glowB',4.35,1.24,-3.65,.48,.24,.01);
  /* ---- cargo container (ULD) with roll door; opening faces the forklift ---- */
  k.r('steel',-3.75,0,3.6,2.62,.1,2.32,.03); k.b('pale',-3.75,.1,3.6,2.4,.01,2.1);
  k.b('light',-4.95,.1,3.6,.1,2.0,2.3); k.b('light',-3.75,.1,2.55,2.5,2.0,.1); k.b('light',-3.75,.1,4.65,2.5,2.0,.1); k.r('light',-3.75,2.1,3.6,2.62,.1,2.32,.03);
  for(x=-4.8;x<-2.6;x+=.36) k.b('pale',x,.1,4.715,.06,2.0,.035);
  [[-5.0,2.5],[-5.0,4.7],[-2.5,2.5],[-2.5,4.7]].forEach(function(p){k.b('white',p[0],.1,p[1],.12,2.0,.12)});
  k.b('white',-2.55,1.98,3.6,.14,.22,2.3);
  k.b('navy',-3.75,1.45,4.74,1.3,.3,.02); k.b('gold',-3.75,1.36,4.745,1.3,.05,.02); planeIcon(k,'white',-4.25,1.5,4.752,.22,0);
  /* ---- airside tug with a dolly, empty pallets, bollards, floor markings ---- */
  k.r('white',3.85,.18,2.25,1.15,.46,.85,.08); k.r('navy',3.85,.12,2.25,1.05,.14,.8,.04); k.r('navy',3.6,.64,2.25,.42,.3,.5,.05);
  [[3.42,1.92],[3.42,2.58],[4.2,1.92],[4.2,2.58]].forEach(function(p){k.b('steel',p[0],.64,p[1],.04,.9,.04)}); k.r('pale',3.8,1.52,2.25,.95,.06,.85,.03);
  k.b('steel',4.6,.32,2.25,.5,.04,.06); k.r('steel',5.35,.28,2.25,1.1,.08,1.1,.02); k.r('light',5.35,.36,2.25,.95,.75,.95,.05); k.b('pale',5.35,.4,2.71,.8,.6,.02);
  k.c('navy',3.85,1.58,2.4,.06,.05,10);
  for(i=0;i<4;i++) k.st(palletP(1.2,1.0),.55,i*.16,-2.4,.04*(i%2));
  [[-2.8,-1.3],[-.6,-1.3],[-2.6,2.45],[1.05,-1.0]].forEach(function(p){k.c('goldS',p[0],0,p[1],.07,.62,12); k.c('navy',p[0],.5,p[1],.075,.05,12)});
  k.b('light',-.72,.003,1.0,.05,.008,4.6); k.b('light',-2.68,.003,-.2,.05,.008,2.4); k.b('light',.9,.003,3.6,3.2,.008,.05);
  for(i=0;i<5;i++) k.b('white',2.3,.003,-3.3+i*.32,1.1,.008,.16);
  k.to(root,M);
  var tw=[wheel(root,3.45,.17,1.9,.17,.14),wheel(root,3.45,.17,2.6,.17,.14),wheel(root,4.25,.17,1.9,.17,.14),wheel(root,4.25,.17,2.6,.17,.14),
          wheel(root,4.95,.14,1.78,.14,.1),wheel(root,4.95,.14,2.72,.14,.1),wheel(root,5.75,.14,1.78,.14,.1),wheel(root,5.75,.14,2.72,.14,.1)];
  blob(root,-3.15,-3.6,6.6,5.4,.5); blob(root,1.7,-4.3,5.6,1.5,.42); blob(root,-3.75,3.6,3.2,2.9,.5); blob(root,4.55,2.25,3.4,1.6,.45); blob(root,.55,-2.4,1.7,1.5,.45);

  /* animated parts */
  var tugB=new T.Mesh(US(10),M.glowG); tugB.scale.setScalar(.12); tugB.position.set(3.85,1.68,2.4); root.add(tugB); var tugH=halo(root,3.85,1.7,2.4,.8,0xF0C84A,.4);
  var lampM=new T.MeshBasicMaterial({color:C(0x0C2D48),toneMapped:false}), lamp=new T.Mesh(US(12),lampM); lamp.scale.set(.16,.1,.1); lamp.position.set(-1.7,2.36,-1.52); root.add(lamp);
  var lampH=halo(root,-1.7,2.36,-1.45,1.0,0xF0C84A,0);
  var scanH=halo(root,4.35,1.38,-3.6,.7,0xAFC8E8,.4);
  var dockDoor=new T.Mesh(UBT,MAT.snow); dockDoor.position.set(-1.7,2.12,-1.62); dockDoor.scale.set(1.68,2.12,.05); root.add(dockDoor); dockDoor.castShadow=true;
  var ddRail=new T.Mesh(UB,MAT.navy); ddRail.scale.set(1.7,.06,.07); root.add(ddRail);
  var ctDoor=new T.Mesh(UBT,MAT.snow); ctDoor.position.set(-2.53,1.98,3.6); ctDoor.scale.set(.05,1.88,1.96); root.add(ctDoor); ctDoor.castShadow=true;
  var ctRail=new T.Mesh(UB,M.gold); ctRail.scale.set(.07,.05,1.9); root.add(ctRail);
  var okM=new T.MeshBasicMaterial({color:C(0x0C2D48),toneMapped:false}), ok=new T.Mesh(US(12),okM); ok.scale.setScalar(.16); ok.position.set(-2.62,2.3,4.45); root.add(ok);
  var okH=halo(root,-2.62,2.32,4.45,1.15,0xF0C84A,0);
  var zoneM=new T.MeshBasicMaterial({color:C(0xAFC8E8),toneMapped:false}), zk=new Kit();
  for(x=-2.35;x<-.2;x+=.32){zk.b('z',x,.004,2.62,.18,.01,.05); zk.b('z',x,.004,4.58,.18,.01,.05)}
  for(z=2.75;z<4.5;z+=.32){zk.b('z',-.12,.004,z,.05,.01,.18)}
  zk.to(root,{z:zoneM},false,false);
  /* conveyor boxes */
  var cb=[0,1].map(function(i){var g=new T.Group(),q=new Kit();q.st(boxP(.62,.42,.56,i?'light':'goldS'),0,0,0);q.to(g);g.position.set(0,.955,-4.3);root.add(g);return g});
  /* pallet load + forklift */
  var pal=new T.Group(), plk=new Kit(); plk.st(loadP(),0,0,0); plk.to(pal); root.add(pal); var palSh=blob(pal,0,0,1.6,1.4,.5,.012);
  var F=forklift(M); root.add(F.g);
  function V(x,z){return new T.Vector3(x,0,z)}
  var SEG=[
    {a:2.0,b:3.55,c:new T.LineCurve3(V(-1.7,2.6),V(-1.7,.78))},
    {a:4.3,b:6.1,c:new T.CubicBezierCurve3(V(-1.7,.78),V(-1.7,2.3),V(-.5,3.6),V(.7,3.6)),rev:1},
    {a:6.1,b:7.3,c:new T.LineCurve3(V(.7,3.6),V(-2.07,3.6))},
    {a:7.9,b:8.85,c:new T.LineCurve3(V(-2.07,3.6),V(.7,3.6)),rev:1},
    {a:8.85,b:9.85,c:new T.CubicBezierCurve3(V(.7,3.6),V(-.3,3.6),V(-1.7,3.5),V(-1.7,2.6))}
  ];
  SEG.forEach(function(s){s.len=s.c.getLength()});
  var ODO=SEG.reduce(function(a,s){return a+(s.rev?-s.len:s.len)},0), PER=10;
  var tp=new T.Vector3(), tg=new T.Vector3(), POSE={x:-1.7,z:2.6,psi:PI,odo:0,mv:0};
  function pose(tt){
    var x=-1.7,z=2.6,psi=PI,odo=0,mv=0;
    for(var i=0;i<SEG.length;i++){var s=SEG[i];
      if(tt<s.a) break;
      var u=tt>=s.b?1:io(sg(tt,s.a,s.b)); s.c.getPoint(u,tp); s.c.getTangent(Math.min(.999,Math.max(.001,u)),tg); if(s.rev) tg.negate();
      x=tp.x; z=tp.z; psi=Math.atan2(tg.x,tg.z); odo+=(s.rev?-1:1)*s.len*u; if(tt<s.b) mv=1;
    }
    POSE.x=x;POSE.z=z;POSE.psi=psi;POSE.odo=odo;POSE.mv=mv; return POSE;
  }
  var NAV=C(0x0C2D48), GLD=C(0xF0C84A), LBL=C(0xAFC8E8), ZG=C(0xD8AE36);
  function update(t,h,intro){
    var tt=t%PER, loop=Math.floor(t/PER), p=pose(tt);
    F.g.position.set(p.x,p.mv?.004*Math.sin(t*38):0,p.z); F.g.rotation.y=p.psi;
    var ang=(p.odo+ODO*loop); F.W[0].rotation.x=F.W[1].rotation.x=ang/.26; F.W[2].rotation.x=F.W[3].rotation.x=ang/.2;
    var L=.45*io(sg(tt,3.7,4.25))-.31*io(sg(tt,7.3,7.7))-.06*io(sg(tt,7.7,7.88))-.08*io(sg(tt,8.9,9.5));
    F.carr.position.y=L; F.bcn.scale.set(.12,.1,.12).multiplyScalar(p.mv?1+.15*Math.sin(t*9):1);
    /* pallet: rolls out of the dock, rides the forks, is set down inside the container */
    if(tt<3.7){var oz=tt<.9?-2.6:lerp(-2.6,-.55,io(sg(tt,.9,1.9))); pal.position.set(-1.7,0,oz); pal.rotation.y=0}
    else if(tt<7.9){var c=Math.cos(p.psi),s=Math.sin(p.psi); pal.position.set(p.x+1.33*s,Math.max(tt<5?0:.1,L-.04),p.z+1.33*c); pal.rotation.y=p.psi-PI}
    else {pal.position.set(-3.4,.1,3.6); pal.rotation.y=-1.5*PI}
    palSh.material.opacity=.5*(1-Math.min(1,pal.position.y*2));
    /* doors */
    var od=io(sg(tt,.3,.85))*(1-io(sg(tt,2.0,2.6))), dh=Math.max(.02,2.12*(1-od)); dockDoor.scale.y=dh; ddRail.position.set(-1.7,2.12-dh-.03,-1.62);
    var cd=tt<1.2?1-io(sg(tt,.2,1.0)):io(sg(tt,8.5,9.2)), chh=Math.max(.02,1.88*cd); ctDoor.scale.y=chh; ctRail.position.set(-2.53,1.98-chh-.03,3.6);
    /* lights */
    var la=sg(tt,.25,.4)*(1-sg(tt,2.5,2.7)); lampM.color.copy(NAV).lerp(GLD,la); lampH.material.opacity=la*(.55+.2*Math.sin(t*7));
    var g=io(sg(tt,7.75,8.05))*(1-io(sg(tt,9.55,9.95))); okM.color.copy(NAV).lerp(GLD,g); okH.material.opacity=g*(.5+.12*Math.sin(t*3))+.08*h; zoneM.color.copy(LBL).lerp(ZG,Math.max(g,.25*h));
    tugH.material.opacity=.25+.2*Math.sin(t*2.2);
    cb.forEach(function(g2,i){var x=4.35-((t/5+i/2)%1)*5.45; g2.position.x=x; g2.visible=x>-1.02&&x<4.3});
    var nearScan=0; cb.forEach(function(g2){nearScan=Math.max(nearScan,1-Math.abs(g2.position.x-3.9)*1.6)}); scanH.material.opacity=.25+.45*nearScan;
    M.gold.emissiveIntensity=.25*h;
    root.position.y=-.55*(1-intro)+.12*h; root.rotation.y=h*.045;
  }
  return {scene:st.scene,cam:st.cam,update:update,still:5.4,dbg:{ok:ok,okM:okM,zoneM:zoneM,okH:okH}};
}

/* ---------- delivery truck (local forward = +Z): cab, flatbed with a drop-side, rolling wheels ---------- */
function truck(M){
  var g=new T.Group(), body=new T.Group(); g.add(body);
  var k=new Kit();
  k.b('navy',0,.32,-.05,.92,.16,2.7);
  k.r('white',0,.42,.86,1.28,1.3,1.08,.12); k.r('light',0,.42,.86,1.31,.3,1.11,.05);
  k.b('tint',0,.98,1.39,1.08,.56,.03,0,-.12); k.b('tint',.645,1.02,.9,.02,.42,.66); k.b('tint',-.645,1.02,.9,.02,.42,.66);
  k.b('glowW',.42,.6,1.405,.22,.1,.03); k.b('glowW',-.42,.6,1.405,.22,.1,.03); k.b('navy',0,.54,1.405,.5,.14,.03); k.b('steel',0,.4,1.43,1.22,.1,.08);
  k.b('navy',.74,1.12,1.22,.05,.2,.1); k.b('navy',-.74,1.12,1.22,.05,.2,.1); k.b('steel',.69,1.2,1.25,.12,.03,.03); k.b('steel',-.69,1.2,1.25,.12,.03,.03);
  k.b('goldS',0,1.72,.88,.5,.05,.1); k.b('gold',.646,.78,.86,.02,.06,1.0); k.b('gold',-.646,.78,.86,.02,.06,1.0);
  k.r('pale',0,.48,-.62,1.3,.24,1.52,.03); k.b('steel',0,.72,.12,1.3,.72,.06);
  k.b('white',.62,.72,-.62,.06,.3,1.5); for(var i=0;i<4;i++) k.b('light',.655,.74,-1.22+i*.4,.012,.26,.06);
  k.b('white',0,.72,-1.35,1.3,.3,.06); k.b('goldS',.5,.46,-1.405,.16,.08,.03); k.b('goldS',-.5,.46,-1.405,.16,.08,.03);
  [.85,-.85].forEach(function(z){k.r('white',.62,.56,z,.26,.08,.72,.03); k.r('white',-.62,.56,z,.26,.08,.72,.03)});
  k.to(body,M);
  var drop=new T.Group(), dk=new Kit(); dk.b('white',-.03,0,0,.06,.3,1.5); for(i=0;i<4;i++) dk.b('light',-.065,.02,-.6+i*.4,.012,.26,.06); dk.to(drop);
  drop.position.set(-.62,.72,-.62); body.add(drop);
  var W=[wheel(g,.62,.3,.85,.3,.2),wheel(g,-.62,.3,.85,.3,.2),wheel(g,.62,.3,-.85,.3,.2),wheel(g,-.62,.3,-.85,.3,.2)];
  blob(g,0,0,1.8,3.3,.5,.012);
  return {g:g,body:body,drop:drop,W:W};
}

/* ===================== WORLD 4 · Livrăm și confirmăm: final delivery and confirmation ===================== */
function S4(){
  var st=stage(), root=st.root, M=st.M, k=new Kit(), i, x;
  /* road with curbs, lane dashes and a gold loading bay */
  k.r('road',-1.35,0,.75,8.8,.03,2.2,.02); for(x=-5.3;x<2.8;x+=.9) k.b('white',x,.032,.75,.45,.006,.06);
  k.b('white',-1.35,0,-.42,8.8,.08,.12); k.b('white',-1.35,0,1.92,8.8,.08,.12);
  for(x=-2.85;x<.1;x+=.3){k.b('goldS',x,.034,.08,.16,.006,.05); k.b('goldS',x,.034,1.42,.16,.006,.05)}
  /* destination building: glass office block + dock hall */
  k.r('white',-4.375,0,-4.175,2.75,3.4,3.15,.05);
  k.b('tint',-4.375,.15,-2.585,2.45,3.05,.03); for(i=0;i<6;i++) k.b('white',-5.5+i*.45+.05,.15,-2.565,.04,3.05,.03);
  [1.2,2.25].forEach(function(y){k.b('white',-4.375,y,-2.565,2.45,.04,.03)});
  k.b('tint',-2.985,2.68,-4.175,.03,.6,2.9);
  k.b('steel',-4.375,0,-2.55,1.0,1.12,.05); k.b('glass',-4.375,.04,-2.52,.9,1.04,.02);
  k.r('white',-4.375,1.3,-2.15,1.7,.08,.95,.03); k.b('steel',-5.1,0,-1.78,.05,1.3,.05); k.b('steel',-3.65,0,-1.78,.05,1.3,.05);
  k.b('navy',-4.375,3.4,-2.72,1.6,.4,.06); planeIcon(k,'gold',-4.85,3.45,-2.685,.3,0); k.b('white',-4.15,3.6,-2.685,.7,.07,.012); k.b('light',-4.2,3.48,-2.685,.55,.05,.012);
  k.b('light',-4.375,3.4,-2.65,2.75,.1,.1); k.b('light',-3.05,3.4,-4.175,.1,.1,3.15);
  k.r('white',-.7,0,-4.725,4.6,2.6,2.05,.05);
  k.b('white',-2.275,0,-3.15,1.45,2.6,1.1); k.b('white',.775,0,-3.15,1.65,2.6,1.1); k.b('white',-.8,0,-3.15,1.5,.8,1.1); k.b('white',-.8,2.25,-3.15,1.5,.35,1.1);
  k.b('ink',-.8,.8,-3.15,1.5,.01,1.1); k.b('ink',-.8,.8,-3.68,1.5,1.45,.03); k.b('ink',-1.54,.8,-3.15,.02,1.45,1.08); k.b('ink',-.06,.8,-3.15,.02,1.45,1.08);
  k.b('tint',-2.275,1.62,-2.585,1.25,.45,.03); k.b('tint',.775,1.62,-2.585,1.45,.45,.03); k.b('tint',1.615,1.55,-4.2,.03,.5,2.2);
  k.b('light',-.7,2.6,-2.65,4.6,.08,.1); k.b('light',1.55,2.6,-4.175,.1,.08,3.15);
  k.r('pale',.5,2.6,-4.6,1.0,.35,.8,.05); k.c('steel',.5,2.95,-4.6,.26,.03,16); k.r('pale',-1.9,2.6,-4.9,.8,.28,.6,.04);
  k.b('pale',-.8,2.06,-2.57,1.62,.2,.12);
  /* dock platform with bumpers, steps and rail */
  k.r('pale',-.8,0,-1.65,3.2,.8,1.9,.04); for(x=-2.25;x<.75;x+=.3) k.b('goldS',x,.8,-.78,.15,.008,.06);
  k.b('navy',-2.0,.18,-.67,.26,.44,.08); k.b('navy',.42,.18,-.67,.26,.44,.08);
  k.b('snow',.95,0,-1.9,.3,.6,.9); k.b('snow',1.25,0,-1.9,.3,.4,.9); k.b('snow',1.55,0,-1.9,.3,.2,.9);
  k.b('steel',-2.35,.8,-2.2,.04,.5,.04); k.b('steel',-2.35,.8,-1.0,.04,.5,.04); k.b('steel',-2.35,1.28,-1.6,.04,.04,1.24);
  /* depot garage on the right: the truck waits inside, the opening faces away from the viewer */
  k.b('white',4.375,0,2.12,2.95,2.3,.16); k.b('white',5.77,0,.775,.16,2.3,2.85); k.b('white',4.375,0,-.57,2.95,2.3,.16); k.b('white',2.98,1.92,.775,.16,.38,2.85);
  k.r('pale',4.375,2.3,.775,3.15,.14,3.05,.04); k.b('light',4.375,2.2,2.21,2.95,.1,.02); k.b('light',5.86,2.2,.775,.02,.1,2.85);
  k.b('tint',3.9,1.15,2.205,1.4,.55,.02); k.b('white',3.9,1.4,2.215,1.4,.04,.02); k.b('snow',5.1,.02,2.205,.9,1.6,.02);
  for(i=0;i<6;i++) k.b('pale',5.1,.2+i*.25,2.218,.9,.03,.012);
  k.b('tint',5.86,1.15,.4,.02,.55,1.3); k.b('navy',4.4,1.85,2.215,.9,.22,.02); k.b('gold',4.4,1.79,2.22,.9,.04,.02);
  /* street furniture: lamps, planters with trees, a bench */
  [[-3.4,2.3],[1.6,2.3]].forEach(function(p){k.c('steel',p[0],0,p[1],.05,2.25,10); k.b('steel',p[0],2.2,p[1]-.3,.05,.05,.6); k.r('white',p[0],2.1,p[1]-.62,.22,.1,.36,.03); k.b('glowW',p[0],2.08,p[1]-.62,.16,.02,.28)});
  [[-5.0,4.6],[-3.4,5.1]].forEach(function(p,j){k.r('white',p[0],0,p[1],.9,.45,.9,.08); k.c('steel',p[0],.45,p[1],.05,.45,8); k.s('light',p[0],1.15,p[1],.5,.5,.5,14); k.s('mid',p[0]+.12,1.42,p[1]-.1,.3,.3,.3,12)});
  k.r('white',-1.4,0,3.0,1.6,.38,.5,.04); k.r('pale',-1.4,.38,3.0,1.6,.08,.5,.03);
  k.st(palletP(1.2,1.0),1.9,0,3.9); k.st(boxP(.7,.6,.6),1.65,.16,3.75,.1); k.st(boxP(.6,.5,.55,'light'),2.2,.16,4.05,-.15);
  k.to(root,M);
  blob(root,-2.2,-4.1,8.6,4.2,.5); blob(root,-.8,-1.6,3.8,2.4,.4); blob(root,4.4,.8,3.4,3.4,.5); blob(root,-4.2,4.8,2.8,1.6,.42); blob(root,-1.4,3.0,2.0,1.0,.35); blob(root,1.9,3.9,1.9,1.7,.45);

  /* animated parts */
  var TR=truck(M); root.add(TR.g); TR.g.rotation.y=-PI/2;
  var pkg=new T.Group(), pq=new Kit(); pq.st(boxP(.95,.75,.95,'goldS'),0,0,0); pq.to(pkg); root.add(pkg); var pkgSh=blob(pkg,0,0,1.3,1.3,.45,.012);
  var lip=new T.Group(), lk=new Kit(); lk.b('steel',0,-.03,.45,1.36,.03,.9); lk.b('goldS',0,-.02,.86,1.36,.012,.06); lk.to(lip); lip.position.set(-.78,.8,-.7); root.add(lip);
  var door=new T.Mesh(UBT,MAT.snow); door.position.set(-.8,2.25,-2.62); door.scale.set(1.48,1.45,.05); root.add(door); door.castShadow=true;
  var dRail=new T.Mesh(UB,MAT.navy); dRail.scale.set(1.5,.05,.07); root.add(dRail);
  var stM=new T.MeshBasicMaterial({color:C(0x0C2D48),toneMapped:false}), stl=new T.Mesh(US(12),stM); stl.scale.set(.14,.09,.09); stl.position.set(-.8,2.36,-2.5); root.add(stl);
  var stH=halo(root,-.8,2.36,-2.42,.9,0xF0C84A,0);
  /* signature tablet */
  var tab=new T.Group(), tk=new Kit(); tab.position.set(.42,1.3,-1.25); tab.rotation.set(-.4,PI/4,0,'YXZ'); root.add(tab);
  tk.rp('navy',0,0,-.04,.62,.46,.04,.05); tk.rp('white',0,0,0,.54,.38,.012,.03); tk.b('light',-.12,.11,.012,.24,.03,.004); tk.to(tab);
  var sk=new Kit(); sk.b('steel',.42,.8,-1.25,.05,.36,.05); sk.c('navy',.42,.8,-1.25,.14,.03,14); sk.to(root);
  var sig=new T.CatmullRomCurve3([[-.2,-.04],[-.15,.05],[-.1,-.06],[-.04,.06],[.02,-.07],[.08,.05],[.13,-.03],[.2,.02]].map(function(p){return new T.Vector3(p[0],p[1],.016)}));
  var sigM=new T.Mesh(new T.TubeGeometry(sig,64,.009,5),new T.MeshBasicMaterial({color:C(0x0C2D48),toneMapped:false})); tab.add(sigM); var SIGN=sigM.geometry.index.count;
  /* floating confirmation document with a self-drawing gold check */
  var cf=new T.Group(); cf.position.set(-.7,2.75,-1.15); cf.rotation.y=PI/4; root.add(cf);
  var ck=new Kit(); ck.st(docP(.95,1.22,true),0,0,0); ck.rp('glass',0,0,-.03,1.12,1.4,.02,.06); ck.to(cf);
  var chk=new T.Group(); chk.position.set(.62,.5,.06); cf.add(chk);
  var cc=new Kit(); cc.ca('white',0,0,0,.27,.04,'z',30); cc.to(chk);
  var ringT=new T.Mesh(new T.TorusGeometry(.28,.025,8,40),M.gold); chk.add(ringT);
  var cpath=new T.CurvePath(); cpath.add(new T.LineCurve3(new T.Vector3(-.13,0,.03),new T.Vector3(-.04,-.1,.03))); cpath.add(new T.LineCurve3(new T.Vector3(-.04,-.1,.03),new T.Vector3(.15,.12,.03)));
  var chkM=new T.Mesh(new T.TubeGeometry(cpath,40,.03,6),new T.MeshBasicMaterial({color:C(0xD8AE36),toneMapped:false})); chk.add(chkM); var CHN=chkM.geometry.index.count;
  var cfH=halo(cf,.62,.5,.1,1.4,0xF0C84A,0);
  /* destination pin over the dock hall, success ring, sparkles */
  var pin=new T.Group(), pk=new Kit(); pin.position.set(-.8,3.15,-3.6); root.add(pin);
  pk.g('gold',new T.ConeGeometry(.2,.75,22).rotateX(PI),0,.38,0); pk.s('gold',0,.85,0,.3,.3,.3,20); pk.s('white',0,.88,.24,.11,.11,.06,12); pk.to(pin,M);
  var pinH=halo(pin,0,.85,0,1.6,0xF0C84A,.35);
  var succ=new T.Mesh(new T.RingGeometry(.9,1.0,64).rotateX(-PI/2),new T.MeshBasicMaterial({color:C(0xD8AE36),transparent:true,depthWrite:false,toneMapped:false}));
  succ.position.set(-.8,.815,-1.6); root.add(succ);
  var SP=[]; for(i=0;i<8;i++) SP.push({s:halo(root,0,0,0,.35,0xF0C84A,0),a:i/8*TAU,r:.35+(i%3)*.12,d:(i%4)*.08});
  var NAV=C(0x0C2D48), GLD=C(0xF0C84A), ps=new T.Vector3(), PER=8;
  function update(t,h,intro){
    var tt=t%PER;
    /* drive in, stop, reverse home */
    var x=tt<3?lerp(4.4,-1.4,io(sg(tt,.2,2.6))):lerp(-1.4,4.4,io(sg(tt,6.2,7.8)));
    TR.g.position.set(x,0,.75);
    var ang=(4.4-x)/.3; TR.W.forEach(function(w){w.rotation.x=ang});
    var mv=(tt>.2&&tt<2.6)||(tt>6.2&&tt<7.8);
    TR.body.rotation.x=-.035*hump(tt,.2,.75)+.045*hump(tt,2.2,2.85)-.018*hump(tt,2.8,3.3)+.03*hump(tt,6.2,6.7)-.035*hump(tt,7.3,7.85);
    TR.body.position.y=mv?.008*Math.sin(t*16):0;
    var fold=io(sg(tt,2.62,2.95))*(1-io(sg(tt,5.95,6.2))); TR.drop.rotation.z=fold*PI/2;
    lip.rotation.x=lerp(PI/2,.09,io(sg(tt,2.65,2.95))*(1-io(sg(tt,5.9,6.15))));
    /* package: on the bed -> across the lip -> into the hall */
    var bedX=x+.62;
    pkg.rotation.z=0;
    if(tt<3||tt>=7.9){TR.body.localToWorld(ps.set(0,.72,-.62)); root.worldToLocal(ps); pkg.position.copy(ps); pkg.rotation.z=TR.body.rotation.x; pkg.visible=true}
    else if(tt<5.5){var u=io(sg(tt,3.0,3.9)); pkg.position.set(lerp(bedX,-.78,u),.72+.08*sg(u,.25,.6),lerp(.75,-1.45,u)); pkg.visible=true}
    else {var u2=io(sg(tt,5.5,6.1)); pkg.position.set(-.78,.8,lerp(-1.45,-3.15,u2)); pkg.visible=tt<6.7}
    pkgSh.material.opacity=pkg.position.z<-2.6?0:.45;
    var od=io(sg(tt,5.15,5.5))*(1-io(sg(tt,6.1,6.6))), dh=Math.max(.02,1.45*(1-od)); door.scale.y=dh; dRail.position.set(-.8,2.25-dh-.025,-2.62);
    /* signature, confirmation, check, success */
    var sgP=sg(tt,4.0,4.65)*(1-sg(tt,6.6,6.9)); sigM.geometry.setDrawRange(0,Math.floor(sgP*64)*5*6);
    var ap=ob(sg(tt,3.9,4.3))*(1-io(sg(tt,6.4,6.85))); cf.scale.setScalar(Math.max(.001,ap)); cf.position.y=2.75+.05*Math.sin(t*1.8);
    var ch=io(sg(tt,4.6,5.1))*(1-sg(tt,6.4,6.85)); chkM.geometry.setDrawRange(0,Math.floor(ch*40)*6*6); cfH.material.opacity=ch*.5+.15*h*ch;
    var sc=sg(tt,5.0,6.3); succ.scale.setScalar(1+sc*3.2); succ.material.opacity=(sc>0&&sc<1?(1-sc):0)*.7;
    var dl=io(sg(tt,4.6,4.9))*(1-io(sg(tt,7.0,7.6))); stM.color.copy(NAV).lerp(GLD,dl); stH.material.opacity=dl*(.6+.15*Math.sin(t*3));
    pin.position.y=3.15+.07*Math.sin(t*1.7); pinH.material.opacity=.3+.4*hump(tt,4.8,6.6)+.15*h;
    SP.forEach(function(p){var q=sg(tt,4.95+p.d,6.1+p.d); p.s.visible=q>0&&q<1; cf.localToWorld(ps.set(.62+Math.cos(p.a)*p.r,.5+Math.sin(p.a)*p.r+q*.5,.12)); root.worldToLocal(ps);
      p.s.position.copy(ps); p.s.material.opacity=Math.sin(q*PI)*.8});
    M.gold.emissiveIntensity=.25*h;
    root.position.y=-.55*(1-intro)+.12*h; root.rotation.y=h*.045;
  }
  return {scene:st.scene,cam:st.cam,update:update,still:5.2};
}

/* ===================== controller: lazy start, one renderer, per-card canvases, hover, reveal, fallbacks ===================== */
var BUILD=[S1,S2,S3,S4];
function views(){return [].slice.call(flow.querySelectorAll('.st')).map(function(c){return {card:c,pv:c.querySelector('.pv')}}).filter(function(v){return v.pv&&v.pv.querySelector('canvas')})}
function boot(){
  var V=views(); if(V.length!==4) return;
  try{R=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'})}catch(e){R=null}
  if(!R||!R.getContext()){flow.classList.add('no3d');return}
  R.setClearColor(0x000000,0); R.outputEncoding=T.sRGBEncoding; R.toneMapping=T.NoToneMapping;
  R.shadowMap.enabled=!LOW; R.shadowMap.type=T.PCFShadowMap;
  try{
    makeShared();
    V.forEach(function(v,i){v.S=BUILD[i](); v.cv=v.pv.querySelector('canvas'); v.ctx=v.cv.getContext('2d'); v.t=(DBG.t0||0)+i*.9; v.h=0; v.hT=0; v.vis=false; v.intro=RM?1:0; v.seen=false});
  }catch(err){ if(window.console)console.warn('[okw] process dioramas disabled:',err); flow.classList.add('no3d'); return }
  var W=0,H=0,DPR=0,CAP=LOW?1.5:2,cost=0,slow=0;
  function fitCam(cam,asp){var hw=8.75,hh=hw/asp; if(hh<6.9){hh=6.9;hw=hh*asp} cam.left=-hw;cam.right=hw;cam.top=hh;cam.bottom=-hh;cam.updateProjectionMatrix()}
  function size(){
    var r={width:0,height:0}; V.some(function(v){var q=v.pv.getBoundingClientRect(); if(q.width>4){r=q;return true}});
    var w=Math.max(2,Math.round(r.width)), h=Math.max(2,Math.round(r.height)), d=Math.min(window.devicePixelRatio||1,CAP);
    if(w===W&&h===H&&d===DPR) return false; W=w;H=h;DPR=d;
    var pw=Math.round(w*d), ph=Math.round(h*d); R.setPixelRatio(1); R.setSize(pw,ph,false);
    V.forEach(function(v){v.cv.width=pw;v.cv.height=ph;fitCam(v.S.cam,w/h)}); return true;
  }
  function draw(v,t){
    v.S.update(DBG.t!=null?DBG.t:t,v.h,io(v.intro));
    R.render(v.S.scene,v.S.cam);
    v.ctx.clearRect(0,0,v.cv.width,v.cv.height); v.ctx.drawImage(R.domElement,0,0);
    if(!v.on){v.on=true;v.pv.classList.add('on')}
  }
  var raf=0,last=0;
  function kick(){if(!raf&&!RM&&!document.hidden){last=0;raf=requestAnimationFrame(tick)}}
  function tick(now){
    raf=0; var dt=last?Math.min(.05,(now-last)/1000):1/60; last=now; var any=false, t0=performance.now();
    V.forEach(function(v){ if(!v.vis) return; any=true;
      v.h+=(v.hT-v.h)*Math.min(1,dt*5); v.intro=Math.min(1,v.intro+dt/1.5); v.t+=dt*(1+.35*v.h); draw(v,v.t)});
    /* adaptive pixel ratio: step down if the dioramas keep costing too much on this device */
    if(any){cost=cost*.94+(performance.now()-t0)*.06; if(cost>10&&CAP>1.01){ if(++slow>40){CAP=Math.max(1,CAP-.25);slow=0;cost=0;size()} } else slow=0}
    if(any) raf=requestAnimationFrame(tick); else last=0;
  }
  function still(v){v.h=0;v.intro=1;draw(v,v.S.still)}
  size();
  var vio=new IntersectionObserver(function(es){es.forEach(function(e){var v=e.target.__okw; v.vis=e.isIntersecting;
    if(v.vis){ if(RM) still(v); else kick() } })},{rootMargin:'60px 0px'});
  V.forEach(function(v){v.pv.__okw=v; vio.observe(v.pv);
    if(HOVER){v.card.addEventListener('pointerenter',function(){v.hT=1;kick()}); v.card.addEventListener('pointerleave',function(){v.hT=0;kick()})}});
  if(window.ResizeObserver){var ro=new ResizeObserver(function(){ if(size()) V.forEach(function(v){ if(v.vis){ if(RM) still(v); else draw(v,v.t) } }) }); V.forEach(function(v){ro.observe(v.pv)})}
  document.addEventListener('visibilitychange',function(){ if(!document.hidden) kick() });
  if(DBG.now) window.__okwProc={V:V,R:R,draw:draw,size:size};
}
if(DBG.now||!('IntersectionObserver' in window)) boot();
else { var io0=new IntersectionObserver(function(es){ if(es.some(function(e){return e.isIntersecting})){ io0.disconnect(); boot() } },{rootMargin:'700px 0px'}); io0.observe(flow) }
})();
