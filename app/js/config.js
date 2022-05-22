Element.prototype.remove=function(){this.parentElement.removeChild(this)},NodeList.prototype.remove=HTMLCollection.prototype.remove=function(){for(let e=this.length-1;e>=0;e--)this[e].parentElement.removeChild(this[e])};let Item=function(e,t=[],o=!1,n="/"+e,i,r,a,l,s,u=[],c={}){return{id:e,L:t,title:i,P:{B:r,content:a},ct:l,Xe:s,G:u,N:o,W:n,j:c,type:GLOBAL.item}},Resource=function(e,t,o=createHash(e),n={}){return{src:e,type:t,hash:o,Ft:n}},ResourceGroup=function(e=[],t){return{ge:e,selected:t}},ResourceDictionary=function(e=[]){return e},Group=function(e,t=[],o,n,i,r=[],a={},l=!1){return{id:e,L:t,j:a,title:o,G:r,F:l,ct:n,Xe:i,type:GLOBAL.group}},View=function(e,t,o={},n={},i=null,r=!1,a=ViewController.M.H){return{id:e,url:t,data:o,event:n,U:i,_:r,q:a}},HistoryItem=function(e,t,o){return{id:e,index:t,j:o}},ErrorClass=function(e,t,o,n=[],i=!0){return{id:e,title:t,message:o,ht:n,tt:i}};const createHash=function(e,t=0){let o=3735928559^t,n=1103547991^t;for(let t,i=0;i<e.length;i++)t=e.charCodeAt(i),o=Math.imul(o^t,2654435761),n=Math.imul(n^t,1597334677);return o=Math.imul(o^o>>>16,2246822507)^Math.imul(n^n>>>13,3266489909),n=Math.imul(n^n>>>16,2246822507)^Math.imul(o^o>>>13,3266489909),4294967296*(2097151&n)+(o>>>0)};let ViewController=function(){let e,t,o,n={},i=[],r=-1,a=-1;EventController.call(n,["navigateToView","navigationRequest","navigateFromView","navigateDefault","historyEdit"]);let l,s=[],u=[];n.nt=function(e){-1==s.findIndex((t=>e.id==t.id))&&s.push(e)},n.rt=function(e,o=!1){let n=s.find((t=>e==t.id||e.id==t.id)),r=!0;n.ht.forEach((e=>{u.includes(e)&&(r=!1)})),r&&(o?(i.forEach((e=>e.re?e.event?.lt.call(e,n):"")),l=n):t.event?.lt.call(t,n),u.push(n.id))};let c=function(e){"string"==typeof e.U&&(e.U=getById(e.U))},d=async function(e){e.J&&!e.X&&(e.J=!1,e.X=!0,await(e.event.K?.call(e)))};return n.navigate=async function(s,u={}){n.I("navigationRequest",[s,t]);let w=t?.ft?.oe||[];if(s==t?.id&&u.oe?.join("/")==w.join("/"))return;let h=(t=>i.find((e=>e.id==t))||e)(s);var m;t&&(d(t),(m=t).q==n.M.ee&&(m.X=!1),c(t),t.event.$?.call(t,u),n.I("navigateFromView",[t,u]),o=t),u.te||(r++,h==e&&(a=r),n.I("historyEdit",[Object.assign(new HistoryItem(h.id,r,{oe:u.oe}),{gt:a}),h])),t=h,t.ft=u,c(t),await function(e){e._&&!e.re&&(l&&e.event?.lt.call(e,l),e.event.ae?.call(e),e.re=!0)}(t),n.I("navigateToView",[t,o,u]),await(t.event.se?.call(t,u)),t.q!=n.M.le&&await async function(e,t){return e.J||e.X||(e.J=!0,await(e.event.Y?.call(e,t))),e}(t,u).then((e=>d(e)))},n.register=async function(t,o=!1){i.push(t),t._||t.event.ae?.call(t),o&&(e=t)},n.ce=function(o){t!=e&&n.I("navigateDefault",[o])},n.back=function(){0==history.state.index?n.ce():history.back()},n.M={H:"single",ee:"always",le:"never"},n.Mt=function(e){r=e.index,a=e.gt,n.navigate(e.id,Object.assign({te:!0},e.j))},n}(),ItemController=function(){let e,t=[],o=[],n=!1,i=[],r=!1,a={};EventController.call(a,["fetchGroup","fetchGroupFinish","fetchItem","fetchItemFinish"]),ViewController.nt(new ErrorClass("item_not_found","Item don't exist","We don't have what you're looking for",["item_outdated","item_load_error","group_not_found"])),ViewController.nt(new ErrorClass("group_not_found","Group don't exist","We don't have what you're looking for",["item_outdated","item_load_error"])),ViewController.nt(new ErrorClass("item_not_fetched","Item cannot be loaded","Check your internet connection"));let l=async function(e){if(e){if(!e.N&&!e.fe){let t=await async function(e){return new Promise(((t,o)=>{let n=window.XMLHttpRequest?new XMLHttpRequest:new ActiveXObject("Microsoft.XMLHTTP");n.onreadystatechange=function(){4==this.readyState&&(200==this.status?t(JSON.parse(this.responseText)):(ViewController.rt("item_not_fetched",!1),o("Error in AJAX request")))},n.open("GET",APP.l+e.W+APP.t+APP.i,!0),n.send()}))}(e,e.W);Object.assign(e,t,{ge:new ResourceDictionary([new ResourceGroup([new Resource(APP.i,"item",null)])])}),ItemBuilder(e),t?.version==APP.version&&(e.fe=!0)}return e}ViewController.rt("item_not_found")},s=e=>encodeURIComponent(e.toLowerCase().replaceAll(" ","-")),u=e=>i.find((t=>t.source==e))?.target,c=e=>t.find((t=>t.source==e))?.target;return a.Ae=async function(t){await Promise.all(t.map((async t=>{!function(e){e.content=[],e.id=e.id||s(e.title),i.push(new Route(e.id,e))}(t),o.push(t),t.L.forEach((e=>i.push(new Route(e,t)))),t.F&&(e=t),await a.I("fetchGroup",[t])}))),o.forEach((e=>e.G?.forEach((t=>u(t)?.content.push(e))))),await a.I("fetchGroupFinish"),r=!0},a.he=async function(o){await Promise.all(o.map((async o=>{o.id=o.id||s(o.title),t.push(new Route(o.id,o)),e.content.push(o),o.L.forEach((e=>t.push(new Route(e,o)))),o.G?.forEach((e=>u(e)?.content.push(o))),await a.I("fetchItem",[o])}))),await a.I("fetchItemFinish",[]),n=!0},a.Le={group:"group",item:"item",Pe:"allitems",all:"all"},Object.defineProperties(a,{storage:{get:()=>o},ve:{get:()=>n},Be:{get:()=>r},Ge:{value:u},Oe:{value:e=>c(e)},pe:{value:async e=>await l(c(e))},yt:{value:(e,t)=>function(e,t){let o,n=e.find((e=>(o=e.ge.find((e=>e.hash===t)),!!o)));return n.selected=o,n}(e,t)}}),a}();const landingView=new View(VIEW.o,APP.url.o,{scrollY:-1,Re:!1},{se:function(){this.data.scrollY>=0&&window.scroll(0,this.data.scrollY),document.title=APP.name,ItemController.ve||ViewController.rt("item_load_error")},ae:function(){let e=getById("profile-link-button");e.href=APP.url.profile,e.addEventListener("click",(()=>{event.preventDefault(),ViewController.navigate(VIEW.profile)})),this.data.Se=getById("main-list")},$:function(){this.data.scrollY=window.scrollY,this.U.classList.remove(GLOBAL.error)},K:function(){this.U.classList.remove(GLOBAL.loading),this.data.Se.getElementsByClassName(GLOBAL.A+" no-data").remove()},Y:async function(){this.U.classList.add(GLOBAL.loading),ItemController.ve&&ItemController.Be&&StorageResponseBuilder(await ItemController.Ge("landing"),this.data.Se,1,-1)},lt:function(e){this.U.classList.add(GLOBAL.error),createErrorMsg(e,getById("landing-error-node"))}},VIEW.o,!0,ViewController.M.H),profileView=new View(VIEW.profile,APP.url.profile,{},{se:()=>{window.scroll(0,0),document.title="About me - "+APP.name}},VIEW.profile,!1,ViewController.M.le),itemView=new View(VIEW.item,APP.url.item,{Te:null},{se:()=>window.scroll(0,0),$:function(){this.U.classList.remove(GLOBAL.error)},ae:function(){this.data.At=getById("item-title"),this.data.Lt=getById("item-content"),this.data.vt=getById("item-info")},Y:async function(e){if(this.U.classList.add(GLOBAL.loading),ItemController.ve){let t;try{t=await ItemController.pe(e.oe[0])}catch{return}if(!t||this.data.Te==t)return;if(t.N)return window.open(t.N,"_blank").focus(),void ViewController.ce();this.data.Te=t,document.title=t.title+" - "+APP.name,this.data.At.innerHTML=t.title,this.data.vt.innerHTML=t.ct.wt()+(t.Xe?" <u class='dotted-separator'></u> Updated "+t.Xe.wt():""),this.data.Lt.innerHTML="",t.content.forEach((async e=>this.data.Lt.append(await ItemComponentBuilder(e,t.W,t)))),incrementVisitors(APP.l+"/"+t.id,!0)}else ViewController.rt("item_load_error")},K:function(){this.U.classList.remove(GLOBAL.loading)},lt:function(e){this.U.classList.add(GLOBAL.error),createErrorMsg(e,getById("item-error-node"))}},VIEW.item,!0,ViewController.M.ee),groupView=new View(VIEW.group,APP.url.group,{scrollY:-1},{ae:function(){let e=this.data;e.Ct=getById("group-data"),e.Bt=getById("group-list"),e.Pt=getById("group-title"),e.Ot=getById("group-info")},se:()=>window.scroll(0,0),$:function(){Array.prototype.forEach.call(this.data.Bt.getElementsByClassName(GLOBAL.A),(e=>e.classList.add("loading","no-data"))),this.U.classList.remove(GLOBAL.error)},Y:async function(e){this.U.classList.add(GLOBAL.loading),this.data.Ct.classList.add(GLOBAL.loading),ItemController.ve||ViewController.rt("item_load_error");let t=await ItemController.Ge(e.oe[0]);t?(this.data.Fe=t,this.data.Pt.innerHTML=t.title,document.title=t.title+" - "+APP.name,this.data.Ot.innerHTML=t.ct.wt()+" <u class='dotted-separator'></u> "+t.content.length+"&nbsp;"+(1!=t.content.length?"items":"item"),this.data.Ct.classList.remove(GLOBAL.loading),await StorageResponseBuilder(t,this.data.Bt,1,-1)):ViewController.rt("group_not_found")},K:function(){this.U.classList.remove(GLOBAL.loading),this.data.Bt.getElementsByClassName("no-data").remove()},lt:function(e){this.U.classList.add(GLOBAL.error),createErrorMsg(e,getById("group-error-node"))}},VIEW.group,!0,ViewController.M.ee),resourceView=new View(VIEW.Ie,APP.url.Ie,{},{se:function(){document.title="Gallery - "+APP.name},ae:function(){ViewController.nt(new ErrorClass("image_not_found","Image not found","Try refresh page",["item_not_found","item_outdated","item_load_error"],!0));let e=this;this.data.Gt=new ResourceSlider;let t=this.data.bt=getById("image-viewer-list"),o=getById("image-viewer-prev"),n=getById("image-viewer-next");n.addEventListener("click",this.data.Gt.next),o.addEventListener("click",this.data.Gt.Tt),getById("image-viewer-close").addEventListener("click",ViewController.back);let i=function(e){n.classList.toggle(GLOBAL.hidden,e),o.classList.toggle(GLOBAL.hidden,e)};this.data.Gt.addEventListener("render",(function(o,n,i,r){t.children[n].classList.add(GLOBAL.u),t.children[r]?.classList.remove(GLOBAL.u),history.state.j.oe=[e.data.Te.id,o.hash],history.replaceState(history.state,"","/"+e.url+"/"+e.data.Te.id+"/"+o.hash)})),this.data.Gt.addEventListener("load",(async function(e){let o=document.createElement("IMG");o.src=e.src,t.appendChild(o),await ImageHelper(o)})),this.data.Gt.addEventListener("loadFinish",(e=>i(e.length<2))),this.data.Gt.addEventListener("close",(()=>{t.innerHTML="",i(!0)})),GestureBuilder(this.U,{right:this.data.Gt.next,left:this.data.Gt.Tt})},Y:async function(e){setTimeout((function(e){e.X||e.U.classList.add(GLOBAL.loading)}),300,this),this.data.Te=e.Te||await ItemController.pe(e.oe[0]);let t=ItemController.yt(this.data.Te.ge,e.oe[1]);t?await this.data.Gt.Et(t.ge,t.selected):ViewController.rt("image_not_found",!1)},K:function(){this.U.classList.remove(GLOBAL.loading)},$:function(){this.U.classList.remove(GLOBAL.error),this.data.Gt.close()},lt:function(e){this.U.classList.add(GLOBAL.error),createErrorMsg(e,getById("resources-error-node"))}},VIEW.Ie,!0,ViewController.M.ee);ViewController.register(landingView,!0),ViewController.register(profileView),ViewController.register(itemView),ViewController.register(groupView),ViewController.register(resourceView),ViewController.addEventListener("historyEdit",((e,t)=>{let o="/"+t.url+(e.j.oe?.length>0?"/"+(e.j.oe?.join("/")||""):"");0==e.index?history.replaceState(e,"",o):history.pushState(e,"",o)})),ViewController.addEventListener("navigationRequest",(()=>hideNavigation())),ViewController.addEventListener("navigateDefault",(e=>{let t=history.state.gt,o=t-history.state.index;-1!=t&&0!=o?history.go(o):ViewController.navigate(null,e)})),ViewController.addEventListener("navigateToView",((e,t)=>{e.U.classList.add(GLOBAL.u),APP_NODE.classList.replace(t?.id,e.id),document.body.classList.toggle("scroll-fix",!isScrollbarVisible()),setNavigationState(!1)})),ViewController.addEventListener("navigateFromView",(e=>e.U.classList.remove(GLOBAL.u))),window.addEventListener("load",(async function(){ViewController.nt(new ErrorClass("item_load_error","Items cannot be loaded","Try refreshing the page")),ViewController.nt(new ErrorClass("item_outdated","Items are outdated","Try refreshing the page")),getById("home-button").addEventListener("click",(e=>{e.preventDefault(),ViewController.ce()})),getById("main-header-about-button").addEventListener("click",(e=>{e.preventDefault(),ViewController.navigate(VIEW.profile)})),getById("main-header-work-button").addEventListener("click",(e=>{e.preventDefault(),ViewController.navigate(VIEW.group,{oe:["work"]})}));try{APP.version!=ITEM_VERSION?ViewController.rt("item_outdated",!0):(await ItemController.Ae(getGroups()).then((()=>ItemController.he(getItems().sort(itemsDefaultSort)))),incrementVisitors("beta"==ITEM_ENVIROMENT?config.beta:config.analitycs))}catch(e){ViewController.rt("item_load_error",!0),console.error(e)}history.state?ViewController.Mt(history.state):await ViewController.navigate(START_ROUTE.target,{oe:START_URL.slice(1,START_URL.length-1)})})),window.addEventListener("popstate",(e=>ViewController.Mt(e.state))),window.onresize=()=>document.body.classList.toggle("scroll-fix",!isScrollbarVisible());let isScrollbarVisible=(e=document.body)=>e.scrollHeight>e.clientHeight,itemsDefaultSort=function(e,t){let o=e.Xe||e.ct;return(t.Xe||t.ct).Xt(o)},createItemTile=async function(e,t){if("A"!=e.nodeName){let t=e;e=document.createElement("A"),t.parentElement.replaceChild(e,t)}let o=APP.l+t.W+t.P.B;e.className="item "+GLOBAL.A+" "+GLOBAL.loading+" index-"+t.Ut,e.innerHTML="";let n=document.createElement("DIV");n.classList.add("img");let i=document.createElement("IMG");i.src=o,i.alt=t.title,n.appendChild(i);let r=document.createElement("B");r.classList.add("font-subtitle"),r.innerHTML=t.title;let a=document.createElement("SPAN");a.classList.add("font-base"),a.innerHTML=t.P.content;let l=document.createElement("DIV");l.classList.add("labels");let s=createButton(t.N?"mi-OpenInNewWindow":"mi-BackMirrored",t.N?"Open link":"Read more","DIV",!0);l.appendChild(s);let u=t.Xe||t.ct,c=document.createElement("DIV");c.classList.add("label","font-caption");let d=document.createElement("I");return t.Xe&&d.classList.add("mi","mi-Update"),c.innerHTML=" &nbsp;&nbsp;"+u.wt(),c.insertBefore(d,c.firstChild),l.appendChild(c),e.appendChild(n),e.appendChild(r),e.appendChild(a),e.appendChild(l),await new ImageHelper(i,(()=>{i.style=t.j.We||""}),(()=>{t.xe=!0,removeResourceFromCache(o)})),e.classList.replace(GLOBAL.loading,GLOBAL.loaded),e.onclick=function(){event.preventDefault(),t.N?window.open(t.N,"_blank").focus():ViewController.navigate(VIEW.item,{oe:[t.id]})},e.href=t.N||APP.url.item+t.id,setTimeout((()=>e.classList.remove(GLOBAL.loaded)),300),e},createGroupTile=function(e,t){if("DIV"!=e.nodeName){let t=e;e=document.createElement("DIV"),t.parentElement.replaceChild(e,t)}e.innerHTML="",e.className="group "+GLOBAL.A;let o=document.createElement("SPAN");o.classList.add("font-title"),o.innerHTML=t.title;let n=createButton("mi-ShowAll","Show all");return e.appendChild(o),e.appendChild(n),e.children[1].onclick=function(){event.preventDefault(),ViewController.navigate(VIEW.group,{oe:[t.id]})},e.children[1].href=APP.url.group+t.id,e},ResourceSlider=function(){let e,t,o=[];EventController.call(this,["load","loadFinish","next","previous","render","remove","close"]);let n=this;window.addEventListener("keyup",(function(e){switch(e.keyCode){case 39:n.next();break;case 37:n.Tt()}}));let i=async function(i){t=e,e=i,await n.I("render",[o[e],e,o[t],t])};this.Et=async function(e,t){o=e,await Promise.all(o.map((async(e,t)=>await n.I("load",[e,t])))),i(t?o.findIndex((e=>e.hash==t.hash)):0),await this.I("loadFinish",[o])},this.close=async()=>{t=-1,e=-1,await n.I("close",[o[e],e])},this.next=async function(){let t=e+1;t>=o.length&&(t=0),e!=t&&(await i(t),await n.I("next",[o[e],t]))},this.Tt=async function(){let t=e-1;t<0&&(t=o.length-1),e!=t&&(await i(t),await n.I("previous",[o[e],t]))}},GestureBuilder=function(e,t={}){const o="up",n="down",i="left",r="right";let a={},l={};const s=100;e.addEventListener("touchstart",(e=>{a.x=e.touches[0].clientX,a.y=e.touches[0].clientY})),e.addEventListener("touchend",(u=>{l.x=u.changedTouches[0].clientX,l.y=u.changedTouches[0].clientY;let c=function(e,t,a,l){let u=Math.abs(a-e),c=Math.abs(l-t),d=u<c;return e<a&&!d&&u>=s?i:a<e&&!d&&u>=s?r:t<l&&d&&c>=s?o:l<t&&d&&c>=s?n:void 0}(a.x,a.y,l.x,l.y);t[c]?.call(e)}))},StorageResponseIndexer=function(e,t=1,o=3,n=0,i=3){let r=[],a=0,l=0,s=n,u=function(e){e.Ue=!0,r.push({index:s,kt:e,St:a}),a+=1,o>0&&(o-=1),s+=1};return 0==t&&e.j?.Jt?.forEach(((t,o)=>u(e.content[t]))),e.content?.forEach(((n,c)=>{n.type==GLOBAL.group?(a=0,l+=1,t>0&&(r.push({index:s,kt:n,xt:l}),r=r.concat(StorageResponseIndexer(n,t-1,i,s+1)),s=r[r.length-1].index+1)):(o>0&&(!n.Ue||e.content.length-c<=o)||-1==o)&&u(n)})),r},StorageResponseBuilder=async function(e,t=document.createElement("DIV"),o=1,n=3){let i=[...t.getElementsByClassName(GLOBAL.A)],r=StorageResponseIndexer(e,o,n,0);await Promise.all(r.map((async e=>{e.kt.Ue=!1,e.kt.Ut=null==e.St?e.xt:e.St,e.kt.type==GLOBAL.group?await createGroupTile(i[e.index]||t.appendChild(document.createElement("div")),e.kt):await createItemTile(i[e.index]||t.appendChild(document.createElement("a")),e.kt)})))},createErrorMsg=function(e,t,o){let n;t.innerHTML="",o?(n=document.createElement("IMG"),n.src=o):(n=document.createElement("i"),n.classList.add("mi","mi-Error","font-header"));let i=document.createElement("DIV");i.classList.add("font-title"),i.innerHTML=e.title;let r=document.createElement("SPAN");if(r.classList.add("font-base"),r.innerHTML=e.message,t.appendChild(n),t.appendChild(i),t.appendChild(r),e.tt){let e=createButton("mi-Refresh","Refresh page");e.addEventListener("click",(()=>window.location.reload(!0))),t.appendChild(e)}},createButton=function(e,t,o="A",n=!1){let i=document.createElement(o);i.classList.add("button");let r=document.createElement("I");r.classList.add("mi",e);let a=document.createElement("SPAN");return a.innerHTML=t,n||i.appendChild(r),i.appendChild(a),n&&i.appendChild(r),i},ImageHelper=function(e,t=(()=>{}),o=(()=>{})){return new Promise((n=>{e.onload=()=>n(t(e)),e.onerror=()=>n((e.src="/img/image_error.webp",e.onload=function(){},void o(e)))}))},ItemDate=function(e,t,o){this.wt=function(e=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]){return this.m+"&nbsp;"+e[this.h-1]+",&nbsp;"+this.C},this.toString=function(){return this.C.toString()+(this.h<10?"0"+this.h.toString():this.h.toString())+(this.m<10?"0"+this.m.toString():this.m.toString())},this.Xt=function(e){let t=parseInt(e);return t>parseInt(this.toString())?-1:t<parseInt(this.toString())?1:0};let n=new Date;this.m=e||n.getDate(),this.h=t||n.getMonth()+1,this.C=o||n.getFullYear()};