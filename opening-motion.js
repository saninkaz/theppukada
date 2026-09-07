/* Approved dot-to-thread opening; all motion shares one scroll coordinate. */
window.createTheppuOpening = (hero, iron, svg) => {
 const clamp=x=>Math.max(0,Math.min(1,x)),mix=(a,b,t)=>a+(b-a)*t;
 const ease=x=>{x=clamp(x);return x*x*(3-2*x)};
 const trail=svg.querySelector('.wire-path'),head=svg.querySelector('.wire-head'),dot=svg.querySelector('.wire-dot');
 let route=[],cache='',W=0,H=0,travel=0;
 function cubic(a,b,c,d){const points=[];for(let i=0;i<=36;i++){const t=i/36,u=1-t;points.push([W*(u*u*u*a[0]+3*u*u*t*b[0]+3*u*t*t*c[0]+t*t*t*d[0]),H*(u*u*u*a[1]+3*u*u*t*b[1]+3*u*t*t*c[1]+t*t*t*d[1])]);}return points;}
 function uniform(points){const distances=[0];for(let i=1;i<points.length;i++)distances.push(distances[i-1]+Math.hypot(points[i][0]-points[i-1][0],points[i][1]-points[i-1][1]));let k=1;const result=[];for(let i=0;i<=180;i++){const d=distances.at(-1)*i/180;while(k<points.length-1&&distances[k]<d)k++;const t=(d-distances[k-1])/Math.max(.001,distances[k]-distances[k-1]);result.push([mix(points[k-1][0],points[k][0],t),mix(points[k-1][1],points[k][1],t)]);}return result;}
 function build(){W=hero.clientWidth;H=svg.clientHeight;const key=[W,H,iron.offsetWidth,iron.offsetLeft].join(':');if(key===cache)return;cache=key;svg.setAttribute('viewBox',`0 0 ${W} ${H}`);const from=(iron.offsetLeft+iron.offsetWidth/2)/W+.035,to=1-(iron.offsetLeft+iron.offsetWidth/2)/W+.035;travel=W-2*iron.offsetLeft-iron.offsetWidth;
 const approach=uniform([...cubic([.5,.89],[.45,.89],[.4,.9],[.38,.85]),...cubic([.38,.85],[.33,.76],[.49,.76],[.46,.85]).slice(1),...cubic([.46,.85],[.43,.92],[from+.03,.9],[from,.82]).slice(1)]);
 const guide=uniform(cubic([from,.82],[from+.20,.89],[to-.20,.76],[to,.82]));
 const end=uniform([...cubic([to,.82],[.95,.83],[.94,.66],[.925,.57]),...cubic([.925,.57],[.91,.47],[.92,.39],[.925,.31]).slice(1)]);
 route=[...approach,...guide.slice(1),...end.slice(1)];
 }
 function point(t){const z=clamp(t)*(route.length-1),i=Math.min(route.length-2,Math.floor(z)),f=z-i;return [mix(route[i][0],route[i+1][0],f),mix(route[i][1],route[i+1][1],f)];}
 function path(start,end){const pts=[point(start)],a=Math.ceil(start*(route.length-1)),b=Math.floor(end*(route.length-1));for(let i=a;i<=b;i++)pts.push(route[i]);pts.push(point(end));return pts.map((xy,i)=>(i?'L':'M')+xy.map(n=>n.toFixed(2)).join(',')).join(' ');}
 return {render(p,reduced){build();const out=ease((p-.265)/.055),mlIn=ease((p-.325)/.06),mlOut=ease((p-.60)/.07),final=ease((p-.705)/.08),frameOut=ease((p-.625)/.06),turn=ease((p-.075)/.055),glide=ease((p-.13)/.185);const set=(key,v)=>hero.style.setProperty(key,v);
 set('--opening-opacity',1-out);set('--opening-y',`${-out*8}px`);set('--opening-scale',1);set('--signature-opacity',mlIn*(1-mlOut));set('--signature-y',`${(1-mlIn)*8-mlOut*8}px`);set('--final-opacity',final);set('--final-y',`${(1-final)*12}px`);set('--iron-facing',`${turn*180}deg`);set('--iron-x',`${glide*travel}px`);set('--iron-y','0px');set('--iron-turn',`${mix(-4,4,turn)}deg`);set('--iron-opacity',1-frameOut);
 let growth=p<.13?ease(p/.13)/3:p<.315?(1+glide)/3:(2+ease((p-.315)/.225))/3;growth=clamp(growth);const start=Math.min(growth,ease((p-.55)/.135)),tip=point(growth);
 trail.setAttribute('d',path(start,growth));head.setAttribute('d',path(Math.max(start,growth-.035),growth));dot.setAttribute('cx',tip[0]);dot.setAttribute('cy',tip[1]);dot.setAttribute('r',mix(3.3,2,ease(p/.1))*(1-ease((p-.68)/.025)));set('--thread-opacity',reduced?0:1-ease((p-.685)/.015));
 hero.querySelector('.hero-opening').setAttribute('aria-hidden',String(out>.5));hero.querySelector('.hero-signature').setAttribute('aria-hidden',String(mlIn*(1-mlOut)<.5));hero.querySelector('.hero-finale').setAttribute('aria-hidden',String(final<.5));
 }};
};
