/* OKI WAY · hero globe (Three.js r128): real Earth data, cargo routes to Bucharest.
   Two looks from one code path: <html data-globe="blue"> or data-globe="white" (energocom palette). */
(function(){
"use strict";
var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var $=function(s,r){return (r||document).querySelector(s)};

/* ================= PLANET HERO (optimised): real Earth data, baked detail, cargo network ================= */
(function(){
  var cv=$('#planet'), hero=$('#hero');
  if(!cv||!hero) return;
  if(!window.THREE){hero.classList.add('no-webgl');return}
  var MOB=matchMedia('(max-width: 760px)').matches, SYS_DPR=window.devicePixelRatio||1;
  var WHITE=document.documentElement.getAttribute('data-globe')==='white', BLEND=WHITE?THREE.NormalBlending:THREE.AdditiveBlending, RSIDE=WHITE?THREE.DoubleSide:THREE.FrontSide;   /* ribbons wind clockwise; the white globe shows them all */   /* variant 2: white globe, dark topo lines */
  var DPR0=Math.min(SYS_DPR,MOB?1.3:1.5), DPR=DPR0, DPR_MIN=MOB?.75:.9;
  var rnd;
  try{rnd=new THREE.WebGLRenderer({canvas:cv,antialias:SYS_DPR<1.5,alpha:true,stencil:false,powerPreference:'high-performance'})}
  catch(err){hero.classList.add('no-webgl');return}
  rnd.setClearColor(0x000000,0);
  var D2R=Math.PI/180, Y=new THREE.Vector3(0,1,0), Z=new THREE.Vector3(0,0,1);
  var scene=new THREE.Scene();
  var cam=new THREE.PerspectiveCamera(34,1,.003,30);
  var earth=new THREE.Group(); scene.add(earth);
  var res=new THREE.Vector2(1,1);

  function geo(lat,lon,r){var p=(90-lat)*D2R,t=(lon+180)*D2R;
    return new THREE.Vector3(-Math.sin(p)*Math.cos(t),Math.cos(p),Math.sin(p)*Math.sin(t)).multiplyScalar(r||1)}
  var KIV=[44.57,26.09], kivN=geo(KIV[0],KIV[1],1); /* landing point: Bucharest Henri Coandă (OTP) */
  var HUBS=[['PVG','Shanghai',31.14,121.81,1],['HKG','Hong Kong',22.31,113.91,1],['SIN','Singapore',1.36,103.99,1],
    ['DXB','Dubai',25.25,55.36,0],['IST','Istanbul',41.26,28.74,0],['FRA','Frankfurt',50.03,8.57,0],['AMS','Amsterdam',52.31,4.76,0]];
  var AIRPORTS=[[51.47,-.45],[49.01,2.55],[40.47,-3.56],[41.8,12.25],[48.35,11.79],[48.11,16.57],[52.17,20.97],[50.1,14.26],
    [47.44,19.26],[44.57,26.09],[42.7,23.41],[37.94,23.94],[50.34,30.89],[53.88,28.03],[56.92,23.97],[60.32,24.96],[59.65,17.92],
    [55.62,12.66],[60.19,11.1],[38.77,-9.13],[41.3,2.08],[47.46,8.55],[45.63,8.72],[32.01,34.89],[30.12,31.41],[25.27,51.61],
    [24.96,46.7],[29.24,47.97],[33.26,44.23],[41.67,44.95],[40.47,50.05],[40.15,44.4],[43.35,77.04],[41.26,69.28],[43.06,74.48],
    [37.99,58.36],[28.56,77.1],[19.09,72.87],[24.91,67.16],[13.69,100.75],[2.75,101.71],[23.39,113.3],[40.08,116.58],[37.46,126.44],
    [35.77,140.39],[30.58,103.95],[35.42,51.15],[8.98,38.8],[-1.32,36.93],[21.68,39.16],[23.59,58.28],[26.27,50.63],[55.97,37.41],
    [59.8,30.26],[55.61,49.28],[56.74,60.8],[46.48,30.66],[45.81,15.98],[44.82,20.29],[39.6,19.91],[36.9,30.8],[38.29,27.16]];

  /* light: fixed direction (relief shading is baked for it), a very small drift on the global term only */
  var LB=new THREE.Vector3(-.38,.88,.3).normalize(), L=LB.clone();
  var sun=new THREE.DirectionalLight(0xffffff,1.25); sun.position.copy(L).multiplyScalar(10); scene.add(sun); scene.add(sun.target);
  scene.add(new THREE.HemisphereLight(0xEAF6FF,WHITE?0xD5DDEA:0x0A3352,WHITE?1.05:.8));   /* on the white globe the ground bounce is white too */

  /* ---------- composition: full-width horizon solved from the screen shape ---------- */
  var V={fov:34,dist:1.7,apex:.5,below:13,yaw:-2,roll:14,look:1,a:30};
  function compose(w,h,apex){
    var asp=w/h, k=Math.min(1,Math.max(0,(asp-.5)/1.1));
    V.fov=54-20*k; V.dist=2.55-.83*k; V.apex=apex||(.6-.1*k); V.below=15+8*k;
    var lam=Math.asin(1/V.dist), half=V.fov*D2R/2, beta=Math.atan((.5-V.apex)*2*Math.tan(half));
    V.look=V.dist*Math.tan(lam-beta); V.a=Math.acos(1/V.dist)/D2R-V.below;
    cam.fov=V.fov; cam.aspect=asp; cam.updateProjectionMatrix();
  }
  var ng=kivN.clone(), eg=Y.clone().cross(ng).normalize(), tg=ng.clone().cross(eg);
  var Gt=new THREE.Matrix4().makeBasis(eg,tg,ng).transpose();
  var M4=new THREE.Matrix4(), nw=new THREE.Vector3(), tw=new THREE.Vector3(), ew=new THREE.Vector3();
  function orient(da,dy){
    var a=(V.a+da)*D2R, yaw=(V.yaw+dy)*D2R, roll=V.roll*D2R;
    nw.set(0,Math.sin(a),Math.cos(a)).applyAxisAngle(Y,yaw);
    tw.set(0,Math.cos(a),-Math.sin(a)).applyAxisAngle(Y,yaw).applyAxisAngle(nw,roll);
    ew.copy(tw).cross(nw); M4.makeBasis(ew,tw,nw).multiply(Gt); earth.quaternion.setFromRotationMatrix(M4);
  }

  var NOISE='float h3(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}'+
    'float n3(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);'+
    'return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),'+
    'mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z);}';
  var LINE='float ln(float v,float w){float fw=max(fwidth(v),1e-5);float d=abs(fract(v-.5)-.5)/fw;return 1.-smoothstep(w*.5,w*.5+1.,d);}';

  /* ---------- one-time GPU bake: clouds (r), drifting light pattern (g), relief shading (b) ---------- */
  function bake(geoTex,Lgeo){
    var w=MOB?1024:2048, rt=new THREE.WebGLRenderTarget(w,w/2,{minFilter:THREE.LinearMipmapLinearFilter,magFilter:THREE.LinearFilter,
      generateMipmaps:true,wrapS:THREE.RepeatWrapping,wrapT:THREE.ClampToEdgeWrapping,depthBuffer:false,stencilBuffer:false});
    var m=new THREE.ShaderMaterial({uniforms:{uGeo:{value:geoTex},uL:{value:Lgeo},uTx:{value:new THREE.Vector2(1/2048,1/1024)}},
      depthTest:false,depthWrite:false,
      vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
      fragmentShader:'uniform sampler2D uGeo;uniform vec3 uL;uniform vec2 uTx;varying vec2 vUv;'+NOISE+
        'float fbm(vec3 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*n3(p);p=p*2.03+vec3(3.1,1.7,7.3);a*=.5;}return s;}'+
        'void main(){float lat=(vUv.y-.5)*3.1415927,th=vUv.x*6.2831853;vec3 d=vec3(-cos(lat)*cos(th),sin(lat),cos(lat)*sin(th));'+
        'vec3 p=d*3.1;vec3 w=vec3(fbm(p),fbm(p+vec3(5.2,1.3,2.7)),0.);float c=fbm(p*1.7+w*1.5);'+
        'float cov=smoothstep(.56,.8,c)*(.65+.35*sin(d.y*9.));'+
        'float f=0.;'+
        'float eL=texture2D(uGeo,vUv-vec2(uTx.x,0.)).r,eR=texture2D(uGeo,vUv+vec2(uTx.x,0.)).r;'+
        'float eD=texture2D(uGeo,vUv-vec2(0.,uTx.y)).r,eU=texture2D(uGeo,vUv+vec2(0.,uTx.y)).r;'+
        'vec3 ea=normalize(cross(vec3(0.,1.,0.),d));vec3 no=cross(d,ea);float cl=max(.25,cos(lat));'+
        'vec3 Nb=normalize(d-((eR-eL)/cl)*9.5*ea-(eU-eD)*9.5*no);'+
        'gl_FragColor=vec4(cov,f,clamp(dot(Nb,normalize(uL))*.5+.5,0.,1.),1.);}'});
    var q=new THREE.Mesh(new THREE.PlaneGeometry(2,2),m), s=new THREE.Scene(); s.add(q);
    rnd.setRenderTarget(rt); rnd.render(s,new THREE.OrthographicCamera(-1,1,1,-1,0,1)); rnd.setRenderTarget(null);
    m.dispose(); q.geometry.dispose();
    return rt.texture;
  }

  /* ---------- planet surface: one pass (relief, contours, coasts, depth lines, grid, clouds, landing light) ---------- */
  var U={uGeo:{value:null},uMask:{value:null},uDet:{value:null},uHasMask:{value:0},uLight:{value:L},uCam:{value:new THREE.Vector3()},
    uKiv:{value:kivN},uTime:{value:0},uRings:{value:new THREE.Vector4(9,9,9,9)},uRingsI:{value:new THREE.Vector4()},uDisp:{value:.008}};
  /* variant 2 surface: white paper, azure/navy contours, navy coasts, gold landing (energocom palette) */
  var FRAG_W='uniform sampler2D uGeo;uniform sampler2D uMask;uniform sampler2D uDet;uniform float uHasMask;uniform float uTime;'+
    'uniform vec3 uLight;uniform vec3 uCam;uniform vec3 uKiv;uniform vec4 uRings;uniform vec4 uRingsI;'+
    'varying vec2 vUv;varying vec3 vN;varying vec3 vPos;varying vec3 vObj;'+LINE+
    'float ring(float a,float r,float i){float x=(a-r)*95.;return i*exp(-x*x);}'+
    'void main(){'+
    ' vec3 g0=texture2D(uGeo,vUv).rgb;float e=g0.r,px=g0.g;'+
    ' float land=uHasMask>.5?texture2D(uMask,vUv).r:g0.b;float fwL=max(fwidth(land),1e-4);float la=smoothstep(.5-fwL,.5+fwL,land);'+
    ' vec3 dt=texture2D(uDet,vUv).rgb;'+
    ' vec3 N=normalize(vN);vec3 L=normalize(uLight);vec3 V=normalize(uCam-vPos);'+
    ' float glb=clamp(dot(N,L)*.5+.5,0.,1.);float ndv=clamp(dot(N,V),0.,1.);float fade=smoothstep(.06,.34,ndv);'+
    ' vec3 AZ=vec3(.255,.404,.686),DEEP=vec3(.082,.141,.22),TINT=vec3(.851,.878,.933),MIST=vec3(.949,.953,.961),AUR=vec3(.843,.686,.341);'+
    ' vec3 col=mix(MIST,vec3(1.),la);col*=.93+.07*glb;col*=1.-la*(1.-dt.b)*.1;'+
    ' float ch=length(vObj-uKiv);'+
    ' float rg=ring(ch,uRings.x,uRingsI.x)+ring(ch,uRings.y,uRingsI.y)+ring(ch,uRings.z,uRingsI.z)+ring(ch,uRings.w,uRingsI.w);'+
    ' float h=e*46.;float on=smoothstep(.025,.065,e)*la;float dn=1.-smoothstep(.22,.55,fwidth(h));'+
    ' float cf=ln(h,.8)*on*dn;float cm=ln(h*.2,1.15)*on;'+
    ' col=mix(col,AZ,cf*.2*fade);col=mix(col,AZ,cm*.3*fade);'+
    ' float cst=1.-smoothstep(0.,1.3,abs(land-.5)/fwL*.5);col=mix(col,mix(AZ,DEEP,.35),cst*.42*(.35+.65*fade));'+
    ' float bt=ln(px*8.,.7)*(1.-la)*smoothstep(.03,.18,px)*(1.-smoothstep(.86,.98,px));col=mix(col,AZ,bt*.1*fade);'+
    ' float lat=(vUv.y-.5)*180.,lon=vUv.x*360.-180.;'+
    ' float g10=max(ln(lat*.1,.7),ln(lon*.1,.7));float g30=max(ln(lat/30.,1.),ln(lon/30.,1.));col=mix(col,AZ,(g10*.035+g30*.06)*fade);'+
    ' float nr=exp(-ch*ch*240.);'+
    ' float kl=(1.-smoothstep(0.,1.2*fwidth(lat),abs(lat-'+KIV[0].toFixed(3)+')))+(1.-smoothstep(0.,1.2*fwidth(lon),abs(lon-'+KIV[1].toFixed(3)+')));'+
    ' col=mix(col,AUR,clamp(kl*nr*step(.5,fract(ch*300.))*.75+exp(-ch*ch*9000.)*.45+rg*.7,0.,1.));'+
    ' float fr=pow(1.-ndv,2.6);col=mix(col,TINT,fr*.65);col=mix(col,AZ,pow(1.-ndv,9.)*.35);'+
    ' gl_FragColor=vec4(col,1.);}';
  var ATMO_W='varying vec3 vNv;void main(){float k=clamp(-vNv.z,0.,1.);float t=smoothstep(0.,.37,k);float i=t*t*t;'+
    'vec3 c=mix(vec3(.851,.878,.933),vec3(.255,.404,.686),pow(t,2.)*.45);gl_FragColor=vec4(c,i*.5);}';
  var ROUTE_W='uniform float uWidth;uniform float uTime;uniform float uProg;uniform float uSeed;uniform float uN;varying float vT;varying float vS;'+
    'void main(){float px=abs(vS)*uWidth*.5;float core=1.-smoothstep(.35,1.05,px);'+
    'vec3 OR=vec3(.949,.6,.29),AZ=vec3(.255,.404,.686),AU=vec3(.843,.686,.341);'+
    'vec3 c=mix(AZ,OR,smoothstep(.08,.6,vT));c=mix(c,AU,smoothstep(.82,1.,vT)*.8);'+
    'float f=fract(vT*uN-uTime*.35+uSeed);float dd=1.-smoothstep(.2,.34,abs(f-.5));'+
    'float d=uProg-vT;float tr=(uProg>0.&&d>0.)?exp(-d*7.5):0.;'+
    'float a=(dd*.8+tr*.9)*core*smoothstep(0.,.02,vT);if(a<.01)discard;'+
    'gl_FragColor=vec4(mix(c,OR*.9,tr*.7),min(a,1.));}';
  var surfMat=new THREE.ShaderMaterial({uniforms:U,extensions:{derivatives:true},defines:MOB?{}:{DISP:1},
    vertexShader:
      'uniform sampler2D uGeo;uniform float uDisp;varying vec2 vUv;varying vec3 vN;varying vec3 vPos;varying vec3 vObj;'+
      'void main(){vUv=uv;vec3 p=position;\n'+
      '#ifdef DISP\n vec3 g=texture2D(uGeo,uv).rgb;p*=1.+uDisp*g.r*g.b;\n#endif\n'+
      'vObj=normalize(position);vec4 w=modelMatrix*vec4(p,1.);vPos=w.xyz;vN=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*w;}',
    fragmentShader:WHITE?FRAG_W:
      'uniform sampler2D uGeo;uniform sampler2D uMask;uniform sampler2D uDet;uniform float uHasMask;uniform float uTime;'+
      'uniform vec3 uLight;uniform vec3 uCam;uniform vec3 uKiv;uniform vec4 uRings;uniform vec4 uRingsI;'+
      'varying vec2 vUv;varying vec3 vN;varying vec3 vPos;varying vec3 vObj;'+LINE+
      'float ring(float a,float r,float i){float x=(a-r)*95.;return i*exp(-x*x);}'+
      'void main(){'+
      ' vec3 g0=texture2D(uGeo,vUv).rgb;float e=g0.r,px=g0.g;'+
      ' float land=uHasMask>.5?texture2D(uMask,vUv).r:g0.b;float fwL=max(fwidth(land),1e-4);float la=smoothstep(.5-fwL,.5+fwL,land);'+
      ' vec3 dt=texture2D(uDet,vUv).rgb;'+
      ' float cA=texture2D(uDet,vUv+vec2(uTime*.0011,0.)).r;'+
      ' vec3 N=normalize(vN);vec3 L=normalize(uLight);vec3 V=normalize(uCam-vPos);'+
      ' float glb=clamp(dot(N,L)*.5+.5,0.,1.);float ndv=clamp(dot(N,V),0.,1.);float fade=smoothstep(.06,.34,ndv);'+
      ' vec3 NAVY=vec3(.035,.169,.263),DARK=vec3(.027,.239,.376),OCEAN=vec3(.031,.475,.659),CYAN=vec3(.212,.71,.835),GOLD=vec3(.843,.663,.184),ICE=vec3(.82,.94,.98);'+
      ' vec3 sea=mix(NAVY*.62,DARK*.82,smoothstep(0.,.55,px));sea=mix(sea,OCEAN*.58,smoothstep(.5,.97,px)*.5);'+
      ' vec3 ter=mix(DARK*1.02+vec3(0.,.025,.03),OCEAN*.78,smoothstep(.06,.62,e));ter=mix(ter,ICE,smoothstep(.74,.98,e)*.42);ter*=.4+.9*mix(.62,dt.b,la);'+
      ' vec3 col=mix(sea,ter,la);col*=.5+.52*glb;'+
      ' float ch=length(vObj-uKiv);'+
      ' float rg=ring(ch,uRings.x,uRingsI.x)+ring(ch,uRings.y,uRingsI.y)+ring(ch,uRings.z,uRingsI.z)+ring(ch,uRings.w,uRingsI.w);'+
      ' float h=e*46.;float on=smoothstep(.025,.065,e)*la;float cf=ln(h,.85)*on;float cm=ln(h*.2,1.35)*on;'+
      ' col+=mix(CYAN,vec3(.78,.96,1.),.3)*(cf*.088+cm*.23)*fade;'+
      ' float cst=1.-smoothstep(0.,1.3,abs(land-.5)/fwL*.5);col+=mix(CYAN,vec3(.85,.97,1.),.25)*cst*.55*(.4+.6*fade);'+
      ' float bt=ln(px*8.,.75)*(1.-la)*smoothstep(.03,.18,px)*(1.-smoothstep(.86,.98,px));col+=CYAN*bt*.06*fade;'+
      ' float lat=(vUv.y-.5)*180.,lon=vUv.x*360.-180.;'+
      ' float g10=max(ln(lat*.1,.7),ln(lon*.1,.7));float g30=max(ln(lat/30.,1.),ln(lon/30.,1.));'+
      ' col+=vec3(.55,.86,1.)*(g10*.035+g30*.05)*(1.-.45*la)*fade;col+=vec3(.85,.98,1.)*cm*g10*.55*fade;'+
      ' float nr=exp(-ch*ch*240.);'+
      ' float kl=(1.-smoothstep(0.,1.2*fwidth(lat),abs(lat-'+KIV[0].toFixed(3)+')))+(1.-smoothstep(0.,1.2*fwidth(lon),abs(lon-'+KIV[1].toFixed(3)+')));'+
      ' col+=GOLD*kl*nr*step(.5,fract(ch*300.))*.5;col+=GOLD*(exp(-ch*ch*9000.)*.28+rg*.22);'+
      ' vec3 H=normalize(L+V);col+=vec3(.7,.9,1.)*pow(max(dot(N,H),0.),80.)*.35*(1.-la);'+
      ' float cloud=clamp(cA*.65+dt.r*.4-.08,0.,1.);col=mix(col,mix(vec3(.6,.8,.9),vec3(1.),glb),cloud*.3*smoothstep(0.,.3,ndv));'+
      ' float fr=pow(1.-ndv,3.4);col=mix(col,vec3(.5,.8,.93),fr*.5);col+=vec3(.2,.55,.72)*pow(1.-ndv,8.)*.4;'+
      ' gl_FragColor=vec4(col,1.);}'
  });
  var surface=new THREE.Mesh(new THREE.SphereGeometry(1,MOB?160:288,MOB?80:144),surfMat); earth.add(surface);

  /* ---------- atmosphere halo melting into the white sky ---------- */
  var atmo=new THREE.Mesh(new THREE.SphereGeometry(1.07,72,48),new THREE.ShaderMaterial({
    side:THREE.BackSide,transparent:true,depthWrite:false,
    vertexShader:'varying vec3 vNv;void main(){vNv=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:WHITE?ATMO_W:'varying vec3 vNv;void main(){float k=clamp(-vNv.z,0.,1.);float t=smoothstep(0.,.37,k);float i=t*t*t;'+
      'vec3 c=mix(vec3(.78,.93,.98),vec3(.21,.71,.84),pow(t,1.6));gl_FragColor=vec4(c,i*.78);}'
  })); atmo.renderOrder=7; scene.add(atmo);

  /* ---------- screen-space ribbons: crisp constant-width luminous lines ---------- */
  function ribbonGeo(pts,closed){
    var n=pts.length, pos=[],prv=[],nxt=[],side=[],tt=[],idx=[];
    for(var i=0;i<n;i++){
      var p=pts[i], a=pts[i>0?i-1:(closed?n-1:0)], b=pts[i<n-1?i+1:(closed?0:n-1)];
      for(var s=-1;s<=1;s+=2){pos.push(p.x,p.y,p.z);prv.push(a.x,a.y,a.z);nxt.push(b.x,b.y,b.z);side.push(s);tt.push(i/(n-1))}
      if(i<n-1){var k=i*2;idx.push(k,k+1,k+2,k+1,k+3,k+2)}
    }
    if(closed){var k2=(n-1)*2;idx.push(k2,k2+1,0,k2+1,1,0)}
    var g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('aPrev',new THREE.Float32BufferAttribute(prv,3));
    g.setAttribute('aNext',new THREE.Float32BufferAttribute(nxt,3));g.setAttribute('aSide',new THREE.Float32BufferAttribute(side,1));
    g.setAttribute('aT',new THREE.Float32BufferAttribute(tt,1));g.setIndex(idx);return g;
  }
  var RIB_V='attribute vec3 aPrev;attribute vec3 aNext;attribute float aSide;attribute float aT;uniform vec2 uRes;uniform float uWidth;varying float vT;varying float vS;'+
    'void main(){vT=aT;vS=aSide;mat4 m=projectionMatrix*modelViewMatrix;vec4 c=m*vec4(position,1.);vec4 p=m*vec4(aPrev,1.);vec4 n=m*vec4(aNext,1.);'+
    'vec2 h=uRes*.5;vec2 d=n.xy/n.w*h-p.xy/p.w*h;float l=length(d);d=l>1e-4?d/l:vec2(1.,0.);'+
    'c.xy+=vec2(-d.y,d.x)*aSide*uWidth*.5/h*c.w;gl_Position=c;}';

  /* ---------- glow points ---------- */
  function ptsGeo(n){var g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(n*3),3));g.setAttribute('aSize',new THREE.Float32BufferAttribute(new Float32Array(n),1));
    g.setAttribute('aCol',new THREE.Float32BufferAttribute(new Float32Array(n*3),3));g.setAttribute('aAlpha',new THREE.Float32BufferAttribute(new Float32Array(n),1));return g}
  var PU={uPR:{value:1}};
  function ptsMat(){return new THREE.ShaderMaterial({uniforms:PU,transparent:true,depthWrite:false,blending:BLEND,
    vertexShader:'attribute float aSize;attribute vec3 aCol;attribute float aAlpha;uniform float uPR;varying vec3 vC;varying float vA;'+
      'void main(){vC=aCol;vA=aAlpha;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_PointSize=aSize*uPR;}',
    fragmentShader:'varying vec3 vC;varying float vA;void main(){float r=length(gl_PointCoord-.5)*2.;float a=max(0.,1.-r);a*=a*sqrt(a);if(a<.004)discard;gl_FragColor=vec4(vC,a*vA);}'})}
  function setPt(g,i,p,size,c,a){var P=g.attributes.position,S=g.attributes.aSize,C=g.attributes.aCol,A=g.attributes.aAlpha;
    P.setXYZ(i,p.x,p.y,p.z);S.setX(i,size);C.setXYZ(i,c.r,c.g,c.b);A.setX(i,a)}
  function dirty(g){g.attributes.position.needsUpdate=g.attributes.aSize.needsUpdate=g.attributes.aCol.needsUpdate=g.attributes.aAlpha.needsUpdate=true}
  var COL={cyan:new THREE.Color(0x36B5D5),ice:new THREE.Color(0xBFEAF6),gold:new THREE.Color(0xD7A92F),warm:new THREE.Color(0xFFE6A8),white:new THREE.Color(0xFFFFFF),
    red:new THREE.Color(0xFF4B4B),green:new THREE.Color(0x3BF0A0)}, HC=new THREE.Color();
  if(WHITE){COL.cyan.set(0x4167AF);COL.ice.set(0x4167AF);COL.gold.set(0xD7AF57);COL.warm.set(0xF2994A);COL.white.set(0xB8892E)}

  /* static layers: wider airport network + atmospheric particles (uploaded once) */
  var apG=ptsGeo(AIRPORTS.length);
  AIRPORTS.forEach(function(a,i){setPt(apG,i,geo(a[0],a[1],1.0098),MOB?3:3.6,COL.ice,.55)});
  var apP=new THREE.Points(apG,ptsMat()); apP.renderOrder=6; earth.add(apP);
  var NA=MOB?90:180, atG=ptsGeo(NA), seed=7;
  function rnd01(){seed=(seed*16807)%2147483647;return seed/2147483647}
  for(var i=0;i<NA;i++) setPt(atG,i,geo(KIV[0]-38+rnd01()*62,KIV[1]-48+rnd01()*96,1.02+rnd01()*.11),1+rnd01()*2.2,COL.ice,.12+rnd01()*.32);
  var atP=new THREE.Points(atG,ptsMat()); atP.renderOrder=6; earth.add(atP);

  /* ---------- Romania: gold territory, outline, beam, landing rings, core light ---------- */
  var MD=[[28.212,45.451],[28.316,45.347],[28.453,45.293],[28.762,45.234],[28.788,45.241],[28.791,45.251],[28.77,45.267],[28.766,45.286],[28.78,45.31],[28.824,45.31],[28.896,45.289],[29.029,45.321],[29.223,45.402],[29.403,45.42],[29.569,45.371],[29.652,45.314],[29.706,45.26],[29.688,45.194],[29.677,45.152],[29.634,44.98],[29.605,44.916],[29.558,44.843],[29.047,44.758],[29.079,44.798],[29.069,44.871],[29.047,44.925],[29.094,44.975],[28.982,44.993],[28.932,44.967],[28.892,44.918],[28.924,44.81],[28.87,44.75],[28.849,44.717],[28.845,44.637],[28.813,44.602],[28.806,44.566],[28.889,44.574],[28.852,44.507],[28.698,44.375],[28.644,44.297],[28.658,43.984],[28.59,43.798],[28.586,43.743],[28.424,43.741],[28.374,43.744],[28.223,43.772],[28.05,43.823],[27.949,43.918],[27.884,43.987],[27.74,43.956],[27.711,43.965],[27.672,43.998],[27.56,44.02],[27.427,44.02],[27.121,44.145],[27.088,44.168],[26.847,44.145],[26.491,44.085],[26.217,44.007],[25.933,43.871],[25.818,43.767],[25.684,43.712],[25.497,43.672],[25.159,43.687],[24.81,43.739],[24.432,43.795],[24.226,43.764],[23.949,43.786],[23.535,43.854],[23.226,43.875],[22.92,43.835],[22.869,43.864],[22.855,43.899],[22.869,43.948],[22.912,43.987],[22.984,44.017],[23.024,44.047],[23.028,44.078],[22.945,44.128],[22.776,44.196],[22.704,44.237],[22.689,44.248],[22.682,44.286],[22.65,44.316],[22.581,44.338],[22.531,44.378],[22.495,44.435],[22.502,44.489],[22.552,44.539],[22.621,44.562],[22.7,44.555],[22.736,44.571],[22.722,44.605],[22.642,44.651],[22.498,44.706],[22.351,44.677],[22.2,44.56],[22.092,44.541],[22.027,44.619],[21.908,44.666],[21.739,44.68],[21.634,44.71],[21.598,44.755],[21.523,44.789],[21.361,44.826],[21.357,44.862],[21.386,44.869],[21.444,44.873],[21.519,44.882],[21.534,44.901],[21.534,44.918],[21.472,44.942],[21.411,44.958],[21.379,44.974],[21.357,44.991],[21.354,45.008],[21.372,45.022],[21.397,45.022],[21.422,45.033],[21.433,45.076],[21.469,45.111],[21.49,45.123],[21.49,45.147],[21.465,45.171],[21.433,45.192],[21.382,45.204],[21.228,45.241],[21.148,45.291],[21.102,45.293],[21.022,45.321],[20.943,45.366],[20.871,45.428],[20.796,45.468],[20.774,45.484],[20.774,45.499],[20.785,45.517],[20.785,45.536],[20.767,45.597],[20.778,45.663],[20.774,45.722],[20.774,45.749],[20.76,45.758],[20.745,45.749],[20.727,45.737],[20.709,45.736],[20.652,45.779],[20.58,45.869],[20.533,45.899],[20.439,45.941],[20.36,45.975],[20.302,46.05],[20.241,46.109],[20.281,46.133],[20.508,46.166],[20.612,46.133],[20.662,46.145],[20.709,46.173],[20.734,46.194],[20.738,46.218],[20.76,46.246],[20.839,46.26],[21.04,46.243],[21.123,46.282],[21.152,46.305],[21.17,46.352],[21.192,46.392],[21.264,46.413],[21.264,46.447],[21.253,46.486],[21.296,46.572],[21.321,46.607],[21.361,46.621],[21.411,46.647],[21.498,46.704],[21.476,46.753],[21.494,46.789],[21.584,46.878],[21.652,46.963],[21.652,47.006],[21.663,47.045],[21.721,47.084],[21.786,47.138],[21.868,47.305],[21.901,47.333],[21.955,47.364],[21.994,47.395],[21.998,47.505],[22.038,47.536],[22.113,47.572],[22.185,47.63],[22.246,47.696],[22.29,47.729],[22.351,47.736],[22.419,47.763],[22.491,47.772],[22.563,47.76],[22.61,47.767],[22.678,47.8],[22.851,47.923],[22.876,47.947],[22.912,47.965],[23.056,48.006],[23.092,48.05],[23.139,48.088],[23.204,48.084],[23.409,47.991],[23.629,47.996],[23.668,47.992],[23.683,47.991],[23.708,47.982],[24.003,47.935],[24.046,47.94],[24.061,47.946],[24.176,47.906],[24.28,47.911],[24.381,47.939],[24.486,47.947],[24.579,47.932],[24.651,47.876],[24.838,47.762],[24.892,47.718],[24.979,47.723],[25.073,47.746],[25.17,47.822],[25.465,47.911],[25.688,47.932],[25.908,47.968],[26.163,47.992],[26.235,48.064],[26.279,48.114],[26.307,48.204],[26.444,48.23],[26.574,48.248],[26.62,48.26],[26.714,48.263],[26.786,48.256],[26.901,48.211],[26.98,48.156],[27.013,48.111],[27.081,48.048],[27.153,47.959],[27.233,47.841],[27.247,47.782],[27.279,47.718],[27.337,47.64],[27.448,47.553],[27.466,47.536],[27.517,47.475],[27.614,47.34],[27.697,47.286],[27.769,47.227],[27.801,47.168],[27.855,47.114],[27.974,47.043],[28.071,46.979],[28.151,46.793],[28.204,46.706],[28.241,46.64],[28.223,46.508],[28.244,46.451],[28.201,46.347],[28.118,46.138],[28.1,45.974],[28.114,45.883],[28.114,45.826],[28.136,45.789],[28.158,45.713],[28.161,45.647],[28.133,45.628],[28.089,45.612],[28.075,45.599],[28.111,45.569],[28.161,45.513]];
  var mdPts=MD.map(function(p){return geo(p[1],p[0],1.0046)});
  /* triangulate in lon/lat, then split long edges so the fill follows the curved, displaced surface (Carpathians) */
  var mdV=MD.map(function(p){return [p[0],p[1]]}), mdT=THREE.ShapeUtils.triangulateShape(MD.map(function(p){return new THREE.Vector2(p[0],p[1])}),[]), fp=[];
  for(var it=0;it<8;it++){
    var cut={}, nt=[], more=false;
    var mid=function(i,j){var k=i<j?i+','+j:j+','+i;
      if(!(k in cut)){var a=mdV[i],b=mdV[j];
        if(Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1])>.8){cut[k]=mdV.length;mdV.push([(a[0]+b[0])/2,(a[1]+b[1])/2]);more=true}else cut[k]=-1}
      return cut[k]};
    mdT.forEach(function(t){var a=t[0],b=t[1],c=t[2],x=mid(a,b),y=mid(b,c),z=mid(c,a);
      if(x<0&&y<0&&z<0) nt.push([a,b,c]);
      else if(x>=0&&y>=0&&z>=0) nt.push([a,x,z],[x,b,y],[z,y,c],[x,y,z]);
      else if(x>=0&&y>=0) nt.push([x,b,y],[a,x,y],[a,y,c]);
      else if(y>=0&&z>=0) nt.push([y,c,z],[a,b,y],[a,y,z]);
      else if(z>=0&&x>=0) nt.push([z,a,x],[x,b,c],[x,c,z]);
      else if(x>=0) nt.push([a,x,c],[x,b,c]);
      else if(y>=0) nt.push([a,b,y],[a,y,c]);
      else nt.push([a,b,z],[z,b,c]);
    });
    mdT=nt; if(!more) break;
  }
  mdV.forEach(function(p){var v=geo(p[1],p[0],1.0045);fp.push(v.x,v.y,v.z)});
  var fg=new THREE.BufferGeometry(); fg.setAttribute('position',new THREE.Float32BufferAttribute(fp,3)); fg.setIndex([].concat.apply([],mdT));
  var mdFill=new THREE.Mesh(fg,new THREE.MeshBasicMaterial({color:WHITE?0xD7AF57:0xD7A92F,transparent:true,opacity:WHITE?.34:.26,depthWrite:false,side:THREE.DoubleSide}));
  mdFill.renderOrder=2; earth.add(mdFill);
  var RU={uRes:{value:res},uWidth:{value:7},uTime:U.uTime};
  var mdLine=new THREE.Mesh(ribbonGeo(mdPts,true),new THREE.ShaderMaterial({uniforms:RU,transparent:true,depthWrite:false,side:RSIDE,blending:BLEND,
    vertexShader:RIB_V,fragmentShader:'uniform float uWidth;uniform float uTime;varying float vT;varying float vS;'+
      'void main(){float px=abs(vS)*uWidth*.5;float a=(1.-smoothstep(.5,1.3,px))*.95+exp(-px*px/6.)*.35;'+
      (WHITE?'gl_FragColor=vec4(vec3(.843,.686,.341),a*.95);}':'gl_FragColor=vec4(vec3(.95,.76,.3)*(1.+.12*sin(vT*40.-uTime*1.6)),a);}')}));
  mdLine.renderOrder=4; earth.add(mdLine);
  var beamPts=[kivN.clone().multiplyScalar(1.004),kivN.clone().multiplyScalar(1.04),kivN.clone().multiplyScalar(1.078)];
  var beam=new THREE.Mesh(ribbonGeo(beamPts,false),new THREE.ShaderMaterial({uniforms:{uRes:{value:res},uWidth:{value:5}},transparent:true,depthWrite:false,side:RSIDE,blending:BLEND,
    vertexShader:RIB_V,fragmentShader:'uniform float uWidth;varying float vT;varying float vS;void main(){float px=abs(vS)*uWidth*.5;'+
      'float a=((1.-smoothstep(.4,1.1,px))*.9+exp(-px*px/4.)*.3)*(1.-vT*.85);gl_FragColor=vec4('+(WHITE?'vec3(.843,.686,.341),a*.9':'vec3(1.,.82,.4),a')+');}'}));
  beam.renderOrder=4; earth.add(beam);
  var ringGeo=new THREE.PlaneGeometry(1,1), RINGS=[];
  for(var r0=0;r0<4;r0++){
    var rm=new THREE.Mesh(ringGeo,new THREE.ShaderMaterial({uniforms:{uA:{value:0}},transparent:true,depthWrite:false,blending:BLEND,
      vertexShader:'varying vec2 vU;void main(){vU=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader:'uniform float uA;varying vec2 vU;void main(){float r=length(vU-.5)*2.;float x=(r-.92)*22.;gl_FragColor=vec4('+(WHITE?'vec3(.843,.686,.341),exp(-x*x)*.8*uA':'vec3(1.,.8,.35),exp(-x*x)*.5*uA')+');}'}));
    rm.position.copy(kivN).multiplyScalar(1.006); rm.quaternion.setFromUnitVectors(Z,kivN); rm.visible=false; rm.renderOrder=5; earth.add(rm);
    RINGS.push({m:rm,t0:-99});
  }
  var kG=ptsGeo(3), kP=new THREE.Points(kG,ptsMat()); kP.renderOrder=8; earth.add(kP);
  var kPos=kivN.clone().multiplyScalar(1.0065);

  /* ---------- aircraft: geometry merged per material and shared, 5 draw calls per plane ---------- */
  function merge(list){
    var arrs=list.map(function(g){var n=g.index?g.toNonIndexed():g;return [n.attributes.position.array,n.attributes.normal.array]});
    var len=arrs.reduce(function(s,a){return s+a[0].length},0), P=new Float32Array(len), N=new Float32Array(len), o=0;
    arrs.forEach(function(a){P.set(a[0],o);N.set(a[1],o);o+=a[0].length});
    var m=new THREE.BufferGeometry(); m.setAttribute('position',new THREE.BufferAttribute(P,3)); m.setAttribute('normal',new THREE.BufferAttribute(N,3)); return m;
  }
  function plate(x0,le0,te0,x1,le1,te1,th,k){var s=new THREE.Shape();
    s.moveTo(k*x0,le0);s.lineTo(k*x1,le1);s.lineTo(k*x1,te1);s.lineTo(k*x0,te0);s.lineTo(k*x0,le0);
    var ge=new THREE.ExtrudeGeometry(s,{depth:th,bevelEnabled:false});ge.rotateX(Math.PI/2);ge.translate(0,th/2,0);return ge}
  function airframe(big){
    var P={w:[],g:[],b:[],d:[],s:[],k:[],e:[]};
    var prof=[[0,.5],[.018,.49],[.034,.47],[.046,.44],[.053,.39],[.055,.32],[.055,-.2],[.05,-.31],[.04,-.4],[.024,-.47],[.008,-.505],[0,-.51]]
      .map(function(p){return new THREE.Vector2(p[0],p[1])});
    if(WHITE){   /* Silk Way West livery: white crown, royal-blue belly split a little below the midline */
      var dl=.3, top=new THREE.LatheGeometry(prof,MOB?10:14,Math.PI/2-dl,Math.PI+2*dl), bel=new THREE.LatheGeometry(prof,MOB?6:8,1.5*Math.PI+dl,Math.PI-2*dl);
      top.rotateX(Math.PI/2); bel.rotateX(Math.PI/2); P.w.push(top); P.k.push(bel); P.s.push(top); P.s.push(bel);
    } else { var fus=new THREE.LatheGeometry(prof,MOB?14:20); fus.rotateX(Math.PI/2); P.w.push(fus); P.s.push(fus); }
    if(big){var hp=new THREE.SphereGeometry(1,14,10);hp.scale(.034,.03,.17);hp.translate(0,.035,.29);P.w.push(hp)}
    [1,-1].forEach(function(k){
      var wing=big?plate(.05,.13,-.1,.5,-.17,-.245,.016,k):plate(.05,.12,-.1,.47,-.15,-.215,.016,k); P.g.push(wing); P.s.push(wing);
      var st=plate(.03,-.335,-.43,.18,-.425,-.47,.008,k); P.g.push(st); P.s.push(st);
      (big?[[.165,-.045,.07,.022],[.3,-.032,-.03,.021]]:[[.2,-.05,.05,.034]]).forEach(function(e){
        var c=new THREE.CylinderGeometry(e[3]*.92,e[3],e[3]*4.6,12);c.rotateX(Math.PI/2);c.translate(k*e[0],e[1],e[2]);(WHITE?P.e:P.g).push(c);
        var inl=new THREE.CircleGeometry(e[3]*.82,12);inl.translate(k*e[0],e[1],e[2]+e[3]*2.31);P.d.push(inl)});
    });
    var fs=new THREE.Shape();fs.moveTo(-.3,.04);fs.lineTo(-.43,big?.24:.22);fs.lineTo(-.51,big?.24:.22);fs.lineTo(-.48,.04);fs.lineTo(-.3,.04);
    var fin=new THREE.ExtrudeGeometry(fs,{depth:.01,bevelEnabled:false});fin.rotateY(-Math.PI/2);fin.translate(.005,0,0);P.b.push(fin);
    var nose=new THREE.SphereGeometry(.012,8,6);nose.translate(0,0,.5);(WHITE?P.w:P.d).push(nose);
    var o={}; for(var q in P) if(P[q].length) o[q]=merge(P[q]); return o;
  }
  var AF={big:airframe(true),twin:airframe(false)};
  var MAT={w:new THREE.MeshStandardMaterial({color:WHITE?0xF7F9FB:0xF4F8FB,emissive:WHITE?0x30353C:0x000000,metalness:WHITE?.08:.28,roughness:WHITE?.45:.36}),g:new THREE.MeshStandardMaterial({color:WHITE?0xC9D1DB:0xC7D3DE,emissive:WHITE?0x24282E:0x000000,metalness:WHITE?.18:.38,roughness:WHITE?.5:.42}),
    b:new THREE.MeshStandardMaterial({color:WHITE?0x1A5CC4:0x0879A8,metalness:.25,roughness:.38}),d:new THREE.MeshStandardMaterial({color:WHITE?0x1A2230:0x14283A,metalness:.15,roughness:.6}),
    k:new THREE.MeshStandardMaterial({color:0x0B4DAA,metalness:.2,roughness:.4})};   /* white globe: Silk Way West livery (k = belly and engines) */
  MAT.e=MAT.k;
  var shadowMat=new THREE.MeshBasicMaterial({color:WHITE?0x152438:0x021320,transparent:true,opacity:WHITE?.14:.32,depthWrite:false});
  function aircraft(big){var t=big?AF.big:AF.twin, g=new THREE.Group();
    ['w','g','b','d','k','e'].forEach(function(k){if(t[k]) g.add(new THREE.Mesh(t[k],MAT[k]))});
    var sh=new THREE.Mesh(t.s,shadowMat); g.matrixAutoUpdate=false; sh.matrixAutoUpdate=false; return {g:g,sh:sh}}

  /* ---------- routes into Chisinau ---------- */
  var ROUTES=[], trailN=8;
  var tG=ptsGeo(HUBS.length*trailN), tP=new THREE.Points(tG,ptsMat()); tP.renderOrder=6; earth.add(tP);
  var hubG=ptsGeo(HUBS.length*2), hubP=new THREE.Points(hubG,ptsMat()); hubP.renderOrder=6; earth.add(hubP);
  var navG=ptsGeo(HUBS.length*3), navP=new THREE.Points(navG,ptsMat()); navP.renderOrder=9; earth.add(navP);
  HUBS.forEach(function(h,i){
    var A=geo(h[2],h[3],1), B=kivN.clone(), ang=A.angleTo(B), s=Math.sin(ang), hMax=.006+.038*Math.min(1,ang/1.25), pts=[];
    for(var j=0;j<=160;j++){var t=j/160,a=Math.sin((1-t)*ang)/s,b=Math.sin(t*ang)/s;
      pts.push(new THREE.Vector3(A.x*a+B.x*b,A.y*a+B.y*b,A.z*a+B.z*b).normalize().multiplyScalar(1.0095+hMax*Math.pow(Math.sin(Math.PI*t),.85)))}
    var curve=new THREE.CatmullRomCurve3(pts); curve.arcLengthDivisions=320;
    var mu={uRes:{value:res},uWidth:{value:12},uTime:U.uTime,uProg:{value:-1},uSeed:{value:i*.37},uN:{value:Math.max(24,ang*110)}};
    var mesh=new THREE.Mesh(ribbonGeo(curve.getSpacedPoints(200),false),new THREE.ShaderMaterial({uniforms:mu,transparent:true,depthWrite:false,side:RSIDE,blending:BLEND,
      vertexShader:RIB_V,fragmentShader:WHITE?ROUTE_W:'uniform float uWidth;uniform float uTime;uniform float uProg;uniform float uSeed;varying float vT;varying float vS;'+
      'void main(){float px=abs(vS)*uWidth*.5;float core=1.-smoothstep(.45,1.25,px);float glow=exp(-px*px/14.)*.3;'+
      'vec3 c=mix(vec3(.212,.71,.835),vec3(.62,.9,.98),smoothstep(.15,.8,vT));c=mix(c,vec3(.843,.663,.184),smoothstep(.78,1.,vT)*.9);'+
      'float base=.4+.22*smoothstep(.5,1.,vT);float dash=smoothstep(.62,1.,fract(vT*36.-uTime*.55+uSeed));'+
      'float d=uProg-vT;float tr=(uProg>0.&&d>0.)?exp(-d*7.5):0.;'+
      'c=mix(c,vec3(.97,.87,.58),tr*.6);'+
      'float a=(base+dash*.3+tr*.95)*(core+glow)*smoothstep(0.,.02,vT);if(a<.003)discard;'+
      'gl_FragColor=vec4(c*(1.+tr*.5),a);}'}));
    mesh.renderOrder=3; earth.add(mesh);
    var ac=aircraft(h[4]===1); earth.add(ac.g); earth.add(ac.sh);
    var period=13+11*Math.min(1,ang/1.25), pause=1.6+(i*1.37)%2.4;
    ROUTES.push({h:h,A:A.clone().multiplyScalar(1.0098),curve:curve,mu:mu,ac:ac,period:period,pause:pause,off:(i*.61%1)*(period+pause),
      last:0,prev:undefined,flash:-99,P0:new THREE.Vector3()});
  });

  /* ---------- runtime (allocation-free per frame) ---------- */
  function sstep(a,b,x){var t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t)}
  var mouse={x:0,y:0,tx:0,ty:0};
  addEventListener('pointermove',function(e){mouse.tx=(e.clientX/innerWidth-.5)*2;mouse.ty=(e.clientY/innerHeight-.5)*2},{passive:true});
  var W=0,H=0,S=.03,kW=new THREE.Vector3();
  var tmp=new THREE.Vector3(),tmp2=new THREE.Vector3(),cd=new THREE.Vector3(),up=new THREE.Vector3(),fw=new THREE.Vector3(),rx=new THREE.Vector3(),SP=new THREE.Vector3(),SV=new THREE.Vector3();
  var MB=new THREE.Matrix4(), Q=new THREE.Quaternion(), qInv=new THREE.Quaternion(), Lloc=new THREE.Vector3();
  function rest(){orient(0,0);cam.position.set(0,0,V.dist);cam.lookAt(0,V.look,0);cam.updateMatrixWorld();earth.updateMatrixWorld()}
  function resize(){
    W=hero.clientWidth;H=hero.clientHeight;
    var pr=Math.min(DPR,Math.sqrt((MOB?2.2e6:4.2e6)/Math.max(1,W*H)));   /* pixel budget: big monitors never exceed ~4.2 MP */
    rnd.setPixelRatio(pr); rnd.setSize(W,H,false); res.set(W,H); PU.uPR.value=pr;
    var hi=$('.hero-in'), apex=hi?Math.min(.74,Math.max(.4,(hi.offsetTop+hi.offsetHeight+(W<760?40:78))/H)):0;
    compose(W,H,apex); rest();
    kW.copy(kivN).applyQuaternion(earth.quaternion);
    S=(W<760?30:Math.min(54,Math.max(40,W*.03)))/(H/(2*Math.tan(V.fov*D2R/2)*cam.position.distanceTo(kW)));
  }
  function triggerRing(t){var q=RINGS[0];RINGS.forEach(function(x){if(x.t0<q.t0)q=x});q.t0=t}

  function update(t){
    orient(RM?0:Math.sin(t*.041)*.8, RM?0:Math.sin(t*.029)*2.2);
    mouse.x+=(mouse.tx-mouse.x)*.05; mouse.y+=(mouse.ty-mouse.y)*.05;
    cam.position.set(mouse.x*.03,-mouse.y*.018,V.dist); cam.lookAt(mouse.x*.01,V.look-mouse.y*.006,0); cam.updateMatrixWorld();
    L.copy(LB).applyAxisAngle(Y,RM?0:Math.sin(t*.025)*.12); sun.position.copy(L).multiplyScalar(10);
    atP.rotation.y=t*.0025; earth.updateMatrixWorld();
    U.uTime.value=t; U.uCam.value.copy(cam.position);
    qInv.copy(earth.quaternion).invert(); Lloc.copy(L).applyQuaternion(qInv);
    var dC=cam.position.length(), aR=Math.asin(1.004/dC);
    for(var i=0;i<ROUTES.length;i++){
      var r=ROUTES[i], cyc=r.period+r.pause, loc=(t+r.off)%cyc, u=loc/r.period, P=r.ac.g, SH=r.ac.sh, c=r.curve, grow=0;
      if(r.prev!==undefined&&loc<r.prev) r.flash=t; r.prev=loc;
      var fly=u<=1; r.mu.uProg.value=fly?u:-1;
      if(fly){
        grow=sstep(0,.05,u)*(1-sstep(.955,1,u));
        c.getPointAt(u,r.P0); c.getPointAt(Math.min(1,u+.003),fw); c.getPointAt(Math.max(0,u-.003),tmp2); fw.sub(tmp2).normalize();
        tmp.copy(r.P0).applyMatrix4(earth.matrixWorld).sub(cam.position);
        grow*=sstep(aR+.002,aR-.016,Math.acos(Math.max(-1,Math.min(1,-tmp.dot(cam.position)/(tmp.length()*dC)))));
        var sc=S*(.25+.75*grow);
        up.copy(r.P0).normalize(); rx.crossVectors(up,fw).normalize(); tmp.crossVectors(fw,rx);
        MB.makeBasis(rx,tmp,fw); P.matrix.compose(r.P0,Q.setFromRotationMatrix(MB),SV.setScalar(sc));
        var alt=r.P0.length()-1; tmp.copy(r.P0).addScaledVector(Lloc,-alt*1.5).normalize(); SP.copy(tmp).multiplyScalar(1.0099);
        up.copy(tmp); tmp2.copy(fw).addScaledVector(up,-fw.dot(up)).normalize(); rx.crossVectors(up,tmp2);
        MB.makeBasis(rx,up,tmp2); SH.matrix.compose(SP,Q.setFromRotationMatrix(MB),SV.set(sc,sc*.02,sc));
        if(r.last<.985&&u>=.985) triggerRing(t);
        var strobe=((t*1.15+i*.23)%1)>.9?1:0;
        setPt(navG,i*3,tmp.set(.5,0,-.2).applyMatrix4(P.matrix),5,COL.red,.95*grow);
        setPt(navG,i*3+1,tmp.set(-.5,0,-.2).applyMatrix4(P.matrix),5,COL.green,.95*grow);
        setPt(navG,i*3+2,tmp.set(0,.24,-.5).applyMatrix4(P.matrix),7,COL.white,strobe*grow);
      } else { navG.attributes.aAlpha.setX(i*3,0);navG.attributes.aAlpha.setX(i*3+1,0);navG.attributes.aAlpha.setX(i*3+2,0); }
      P.visible=SH.visible=grow>.02; r.last=fly?u:0;
      for(var k=0;k<trailN;k++){var uk=u-(k+1)*.0045, fa=1-k/trailN, ok=fly&&uk>0&&grow>.02;
        if(ok) c.getPointAt(uk,tmp); setPt(tG,i*trailN+k,ok?tmp:r.A,(MOB?4.5:6)*fa+1.2,k<3?COL.warm:COL.ice,ok?.85*Math.pow(fa,1.4)*grow:0)}
      var fl=Math.exp(-(t-r.flash)*2.2); HC.copy(COL.cyan).lerp(COL.gold,Math.min(1,fl*1.4));
      setPt(hubG,i*2,r.A,(MOB?6:7)+fl*5,HC,.95);
      setPt(hubG,i*2+1,r.A,(MOB?18:24)+Math.sin(t*1.6+i)*5+fl*22,HC,.28+fl*.45);
    }
    dirty(tG); dirty(hubG); dirty(navG);
    var pulse=0;
    for(var q=0;q<RINGS.length;q++){var R=RINGS[q], age=t-R.t0, on=age>=0&&age<2.6, kq=on?age/2.6:1;
      R.m.visible=on; if(on){var s=.012+age*.085;R.m.scale.set(s,s,s);R.m.material.uniforms.uA.value=Math.pow(1-kq,1.6);pulse=Math.max(pulse,Math.exp(-age*1.6))}
      U.uRings.value.setComponent(q,on?age*.078:9); U.uRingsI.value.setComponent(q,on?(1-kq)*(1-kq):0)}
    setPt(kG,0,kPos,(MOB?52:70)+pulse*70,COL.gold,(.17+pulse*.33)*(WHITE?.5:1));
    setPt(kG,1,kPos,(MOB?15:19)+pulse*10,COL.warm,.62);
    setPt(kG,2,kPos,MOB?6:7,COL.white,.95); dirty(kG);
  }

  /* ---------- loop: ~60 fps cap, adaptive resolution, pause when hidden ---------- */
  var onScreen=true, lastR=0, acc=0, n=0, t0=performance.now(), needResize=true;
  new IntersectionObserver(function(e){onScreen=e[0].isIntersecting},{threshold:0}).observe(hero);
  function draw(t){update(t);rnd.render(scene,cam)}
  function frame(now){
    requestAnimationFrame(frame);
    if(!onScreen||document.hidden){lastR=now;return}
    if(now-lastR<13) return;
    var dt=now-lastR; lastR=now;
    if(needResize){needResize=false;resize()}
    draw((now-t0)/1000);
    if(++n>30){acc+=dt; if(n===90){if(acc/60>21&&DPR>DPR_MIN){DPR=Math.max(DPR_MIN,DPR-.2);needResize=true} n=0;acc=0}}
  }
  function start(){
    resize();
    var Lgeo=LB.clone().applyQuaternion(earth.quaternion.clone().invert());
    U.uDet.value=bake(geoTex,Lgeo); U.uGeo.value=geoTex;
    if(maskTex){U.uMask.value=maskTex;U.uHasMask.value=1}else{U.uMask.value=geoTex}
    function relayout(){if(RM){resize();draw(14)}else needResize=true}
    new ResizeObserver(relayout).observe(hero);
    if(RM) draw(14); else requestAnimationFrame(frame);
    requestAnimationFrame(function(){cv.classList.add('ready')});
  }
  var loader=new THREE.TextureLoader(), pending=MOB?1:2;
  function done(){if(--pending===0)start()}
  function tex(src){var x=loader.load(src,done);x.wrapS=THREE.RepeatWrapping;x.wrapT=THREE.ClampToEdgeWrapping;
    x.anisotropy=Math.min(4,rnd.capabilities.getMaxAnisotropy());return x}
  var geoTex=tex(window.OKW_GEO), maskTex=MOB?null:tex(window.OKW_MASK);
})();
})();
