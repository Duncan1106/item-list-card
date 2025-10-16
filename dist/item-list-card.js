var Tt=Object.defineProperty;var Lt=(o,e,t)=>e in o?Tt(o,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):o[e]=t;var S=(o,e,t)=>(Lt(o,typeof e!="symbol"?e+"":e,t),t);var F=window,R=F.ShadowRoot&&(F.ShadyCSS===void 0||F.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,V=Symbol(),ht=new WeakMap,T=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==V)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,t=this.t;if(R&&e===void 0){let i=t!==void 0&&t.length===1;i&&(e=ht.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&ht.set(t,e))}return e}toString(){return this.cssText}},ct=o=>new T(typeof o=="string"?o:o+"",void 0,V),q=(o,...e)=>{let t=o.length===1?o[0]:e.reduce((i,s,n)=>i+(r=>{if(r._$cssResult$===!0)return r.cssText;if(typeof r=="number")return r;throw Error("Value passed to 'css' function must be a 'css' function result: "+r+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+o[n+1],o[0]);return new T(t,o,V)},W=(o,e)=>{R?o.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet):e.forEach(t=>{let i=document.createElement("style"),s=F.litNonce;s!==void 0&&i.setAttribute("nonce",s),i.textContent=t.cssText,o.appendChild(i)})},z=R?o=>o:o=>o instanceof CSSStyleSheet?(e=>{let t="";for(let i of e.cssRules)t+=i.cssText;return ct(t)})(o):o;var J,j=window,dt=j.trustedTypes,Mt=dt?dt.emptyScript:"",ut=j.reactiveElementPolyfillSupport,X={toAttribute(o,e){switch(e){case Boolean:o=o?Mt:null;break;case Object:case Array:o=o==null?o:JSON.stringify(o)}return o},fromAttribute(o,e){let t=o;switch(e){case Boolean:t=o!==null;break;case Number:t=o===null?null:Number(o);break;case Object:case Array:try{t=JSON.parse(o)}catch{t=null}}return t}},pt=(o,e)=>e!==o&&(e==e||o==o),K={attribute:!0,type:String,converter:X,reflect:!1,hasChanged:pt},Y="finalized",g=class extends HTMLElement{constructor(){super(),this._$Ei=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$El=null,this._$Eu()}static addInitializer(e){var t;this.finalize(),((t=this.h)!==null&&t!==void 0?t:this.h=[]).push(e)}static get observedAttributes(){this.finalize();let e=[];return this.elementProperties.forEach((t,i)=>{let s=this._$Ep(i,t);s!==void 0&&(this._$Ev.set(s,i),e.push(s))}),e}static createProperty(e,t=K){if(t.state&&(t.attribute=!1),this.finalize(),this.elementProperties.set(e,t),!t.noAccessor&&!this.prototype.hasOwnProperty(e)){let i=typeof e=="symbol"?Symbol():"__"+e,s=this.getPropertyDescriptor(e,i,t);s!==void 0&&Object.defineProperty(this.prototype,e,s)}}static getPropertyDescriptor(e,t,i){return{get(){return this[t]},set(s){let n=this[e];this[t]=s,this.requestUpdate(e,n,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)||K}static finalize(){if(this.hasOwnProperty(Y))return!1;this[Y]=!0;let e=Object.getPrototypeOf(this);if(e.finalize(),e.h!==void 0&&(this.h=[...e.h]),this.elementProperties=new Map(e.elementProperties),this._$Ev=new Map,this.hasOwnProperty("properties")){let t=this.properties,i=[...Object.getOwnPropertyNames(t),...Object.getOwnPropertySymbols(t)];for(let s of i)this.createProperty(s,t[s])}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let i=new Set(e.flat(1/0).reverse());for(let s of i)t.unshift(z(s))}else e!==void 0&&t.push(z(e));return t}static _$Ep(e,t){let i=t.attribute;return i===!1?void 0:typeof i=="string"?i:typeof e=="string"?e.toLowerCase():void 0}_$Eu(){var e;this._$E_=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$Eg(),this.requestUpdate(),(e=this.constructor.h)===null||e===void 0||e.forEach(t=>t(this))}addController(e){var t,i;((t=this._$ES)!==null&&t!==void 0?t:this._$ES=[]).push(e),this.renderRoot!==void 0&&this.isConnected&&((i=e.hostConnected)===null||i===void 0||i.call(e))}removeController(e){var t;(t=this._$ES)===null||t===void 0||t.splice(this._$ES.indexOf(e)>>>0,1)}_$Eg(){this.constructor.elementProperties.forEach((e,t)=>{this.hasOwnProperty(t)&&(this._$Ei.set(t,this[t]),delete this[t])})}createRenderRoot(){var e;let t=(e=this.shadowRoot)!==null&&e!==void 0?e:this.attachShadow(this.constructor.shadowRootOptions);return W(t,this.constructor.elementStyles),t}connectedCallback(){var e;this.renderRoot===void 0&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),(e=this._$ES)===null||e===void 0||e.forEach(t=>{var i;return(i=t.hostConnected)===null||i===void 0?void 0:i.call(t)})}enableUpdating(e){}disconnectedCallback(){var e;(e=this._$ES)===null||e===void 0||e.forEach(t=>{var i;return(i=t.hostDisconnected)===null||i===void 0?void 0:i.call(t)})}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$EO(e,t,i=K){var s;let n=this.constructor._$Ep(e,i);if(n!==void 0&&i.reflect===!0){let r=(((s=i.converter)===null||s===void 0?void 0:s.toAttribute)!==void 0?i.converter:X).toAttribute(t,i.type);this._$El=e,r==null?this.removeAttribute(n):this.setAttribute(n,r),this._$El=null}}_$AK(e,t){var i;let s=this.constructor,n=s._$Ev.get(e);if(n!==void 0&&this._$El!==n){let r=s.getPropertyOptions(n),d=typeof r.converter=="function"?{fromAttribute:r.converter}:((i=r.converter)===null||i===void 0?void 0:i.fromAttribute)!==void 0?r.converter:X;this._$El=n,this[n]=d.fromAttribute(t,r.type),this._$El=null}}requestUpdate(e,t,i){let s=!0;e!==void 0&&(((i=i||this.constructor.getPropertyOptions(e)).hasChanged||pt)(this[e],t)?(this._$AL.has(e)||this._$AL.set(e,t),i.reflect===!0&&this._$El!==e&&(this._$EC===void 0&&(this._$EC=new Map),this._$EC.set(e,i))):s=!1),!this.isUpdatePending&&s&&(this._$E_=this._$Ej())}async _$Ej(){this.isUpdatePending=!0;try{await this._$E_}catch(t){Promise.reject(t)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var e;if(!this.isUpdatePending)return;this.hasUpdated,this._$Ei&&(this._$Ei.forEach((s,n)=>this[n]=s),this._$Ei=void 0);let t=!1,i=this._$AL;try{t=this.shouldUpdate(i),t?(this.willUpdate(i),(e=this._$ES)===null||e===void 0||e.forEach(s=>{var n;return(n=s.hostUpdate)===null||n===void 0?void 0:n.call(s)}),this.update(i)):this._$Ek()}catch(s){throw t=!1,this._$Ek(),s}t&&this._$AE(i)}willUpdate(e){}_$AE(e){var t;(t=this._$ES)===null||t===void 0||t.forEach(i=>{var s;return(s=i.hostUpdated)===null||s===void 0?void 0:s.call(i)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$Ek(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$E_}shouldUpdate(e){return!0}update(e){this._$EC!==void 0&&(this._$EC.forEach((t,i)=>this._$EO(i,this[i],t)),this._$EC=void 0),this._$Ek()}updated(e){}firstUpdated(e){}};g[Y]=!0,g.elementProperties=new Map,g.elementStyles=[],g.shadowRootOptions={mode:"open"},ut?.({ReactiveElement:g}),((J=j.reactiveElementVersions)!==null&&J!==void 0?J:j.reactiveElementVersions=[]).push("1.6.3");var Z,D=window,E=D.trustedTypes,ft=E?E.createPolicy("lit-html",{createHTML:o=>o}):void 0,G="$lit$",v=`lit$${(Math.random()+"").slice(9)}$`,$t="?"+v,Pt=`<${$t}>`,A=document,M=()=>A.createComment(""),P=o=>o===null||typeof o!="object"&&typeof o!="function",xt=Array.isArray,Ht=o=>xt(o)||typeof o?.[Symbol.iterator]=="function",Q=`[ 	
\f\r]`,L=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,mt=/-->/g,_t=/>/g,$=RegExp(`>|${Q}(?:([^\\s"'>=/]+)(${Q}*=${Q}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),gt=/'/g,yt=/"/g,At=/^(?:script|style|textarea|title)$/i,wt=o=>(e,...t)=>({_$litType$:o,strings:e,values:t}),p=wt(1),Wt=wt(2),w=Symbol.for("lit-noChange"),m=Symbol.for("lit-nothing"),vt=new WeakMap,x=A.createTreeWalker(A,129,null,!1);function St(o,e){if(!Array.isArray(o)||!o.hasOwnProperty("raw"))throw Error("invalid template strings array");return ft!==void 0?ft.createHTML(e):e}var Nt=(o,e)=>{let t=o.length-1,i=[],s,n=e===2?"<svg>":"",r=L;for(let d=0;d<t;d++){let h=o[d],l,c,a=-1,u=0;for(;u<h.length&&(r.lastIndex=u,c=r.exec(h),c!==null);)u=r.lastIndex,r===L?c[1]==="!--"?r=mt:c[1]!==void 0?r=_t:c[2]!==void 0?(At.test(c[2])&&(s=RegExp("</"+c[2],"g")),r=$):c[3]!==void 0&&(r=$):r===$?c[0]===">"?(r=s??L,a=-1):c[1]===void 0?a=-2:(a=r.lastIndex-c[2].length,l=c[1],r=c[3]===void 0?$:c[3]==='"'?yt:gt):r===yt||r===gt?r=$:r===mt||r===_t?r=L:(r=$,s=void 0);let f=r===$&&o[d+1].startsWith("/>")?" ":"";n+=r===L?h+Pt:a>=0?(i.push(l),h.slice(0,a)+G+h.slice(a)+v+f):h+v+(a===-2?(i.push(void 0),d):f)}return[St(o,n+(o[t]||"<?>")+(e===2?"</svg>":"")),i]},H=class o{constructor({strings:e,_$litType$:t},i){let s;this.parts=[];let n=0,r=0,d=e.length-1,h=this.parts,[l,c]=Nt(e,t);if(this.el=o.createElement(l,i),x.currentNode=this.el.content,t===2){let a=this.el.content,u=a.firstChild;u.remove(),a.append(...u.childNodes)}for(;(s=x.nextNode())!==null&&h.length<d;){if(s.nodeType===1){if(s.hasAttributes()){let a=[];for(let u of s.getAttributeNames())if(u.endsWith(G)||u.startsWith(v)){let f=c[r++];if(a.push(u),f!==void 0){let y=s.getAttribute(f.toLowerCase()+G).split(v),_=/([.?@])?(.*)/.exec(f);h.push({type:1,index:n,name:_[2],strings:y,ctor:_[1]==="."?et:_[1]==="?"?it:_[1]==="@"?st:C})}else h.push({type:6,index:n})}for(let u of a)s.removeAttribute(u)}if(At.test(s.tagName)){let a=s.textContent.split(v),u=a.length-1;if(u>0){s.textContent=E?E.emptyScript:"";for(let f=0;f<u;f++)s.append(a[f],M()),x.nextNode(),h.push({type:2,index:++n});s.append(a[u],M())}}}else if(s.nodeType===8)if(s.data===$t)h.push({type:2,index:n});else{let a=-1;for(;(a=s.data.indexOf(v,a+1))!==-1;)h.push({type:7,index:n}),a+=v.length-1}n++}}static createElement(e,t){let i=A.createElement("template");return i.innerHTML=e,i}};function k(o,e,t=o,i){var s,n,r,d;if(e===w)return e;let h=i!==void 0?(s=t._$Co)===null||s===void 0?void 0:s[i]:t._$Cl,l=P(e)?void 0:e._$litDirective$;return h?.constructor!==l&&((n=h?._$AO)===null||n===void 0||n.call(h,!1),l===void 0?h=void 0:(h=new l(o),h._$AT(o,t,i)),i!==void 0?((r=(d=t)._$Co)!==null&&r!==void 0?r:d._$Co=[])[i]=h:t._$Cl=h),h!==void 0&&(e=k(o,h._$AS(o,e.values),h,i)),e}var tt=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){var t;let{el:{content:i},parts:s}=this._$AD,n=((t=e?.creationScope)!==null&&t!==void 0?t:A).importNode(i,!0);x.currentNode=n;let r=x.nextNode(),d=0,h=0,l=s[0];for(;l!==void 0;){if(d===l.index){let c;l.type===2?c=new N(r,r.nextSibling,this,e):l.type===1?c=new l.ctor(r,l.name,l.strings,this,e):l.type===6&&(c=new nt(r,this,e)),this._$AV.push(c),l=s[++h]}d!==l?.index&&(r=x.nextNode(),d++)}return x.currentNode=A,n}v(e){let t=0;for(let i of this._$AV)i!==void 0&&(i.strings!==void 0?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}},N=class o{constructor(e,t,i,s){var n;this.type=2,this._$AH=m,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=s,this._$Cp=(n=s?.isConnected)===null||n===void 0||n}get _$AU(){var e,t;return(t=(e=this._$AM)===null||e===void 0?void 0:e._$AU)!==null&&t!==void 0?t:this._$Cp}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=k(this,e,t),P(e)?e===m||e==null||e===""?(this._$AH!==m&&this._$AR(),this._$AH=m):e!==this._$AH&&e!==w&&this._(e):e._$litType$!==void 0?this.g(e):e.nodeType!==void 0?this.$(e):Ht(e)?this.T(e):this._(e)}k(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}$(e){this._$AH!==e&&(this._$AR(),this._$AH=this.k(e))}_(e){this._$AH!==m&&P(this._$AH)?this._$AA.nextSibling.data=e:this.$(A.createTextNode(e)),this._$AH=e}g(e){var t;let{values:i,_$litType$:s}=e,n=typeof s=="number"?this._$AC(e):(s.el===void 0&&(s.el=H.createElement(St(s.h,s.h[0]),this.options)),s);if(((t=this._$AH)===null||t===void 0?void 0:t._$AD)===n)this._$AH.v(i);else{let r=new tt(n,this),d=r.u(this.options);r.v(i),this.$(d),this._$AH=r}}_$AC(e){let t=vt.get(e.strings);return t===void 0&&vt.set(e.strings,t=new H(e)),t}T(e){xt(this._$AH)||(this._$AH=[],this._$AR());let t=this._$AH,i,s=0;for(let n of e)s===t.length?t.push(i=new o(this.k(M()),this.k(M()),this,this.options)):i=t[s],i._$AI(n),s++;s<t.length&&(this._$AR(i&&i._$AB.nextSibling,s),t.length=s)}_$AR(e=this._$AA.nextSibling,t){var i;for((i=this._$AP)===null||i===void 0||i.call(this,!1,!0,t);e&&e!==this._$AB;){let s=e.nextSibling;e.remove(),e=s}}setConnected(e){var t;this._$AM===void 0&&(this._$Cp=e,(t=this._$AP)===null||t===void 0||t.call(this,e))}},C=class{constructor(e,t,i,s,n){this.type=1,this._$AH=m,this._$AN=void 0,this.element=e,this.name=t,this._$AM=s,this.options=n,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=m}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(e,t=this,i,s){let n=this.strings,r=!1;if(n===void 0)e=k(this,e,t,0),r=!P(e)||e!==this._$AH&&e!==w,r&&(this._$AH=e);else{let d=e,h,l;for(e=n[0],h=0;h<n.length-1;h++)l=k(this,d[i+h],t,h),l===w&&(l=this._$AH[h]),r||(r=!P(l)||l!==this._$AH[h]),l===m?e=m:e!==m&&(e+=(l??"")+n[h+1]),this._$AH[h]=l}r&&!s&&this.j(e)}j(e){e===m?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}},et=class extends C{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===m?void 0:e}},Ut=E?E.emptyScript:"",it=class extends C{constructor(){super(...arguments),this.type=4}j(e){e&&e!==m?this.element.setAttribute(this.name,Ut):this.element.removeAttribute(this.name)}},st=class extends C{constructor(e,t,i,s,n){super(e,t,i,s,n),this.type=5}_$AI(e,t=this){var i;if((e=(i=k(this,e,t,0))!==null&&i!==void 0?i:m)===w)return;let s=this._$AH,n=e===m&&s!==m||e.capture!==s.capture||e.once!==s.once||e.passive!==s.passive,r=e!==m&&(s===m||n);n&&this.element.removeEventListener(this.name,this,s),r&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){var t,i;typeof this._$AH=="function"?this._$AH.call((i=(t=this.options)===null||t===void 0?void 0:t.host)!==null&&i!==void 0?i:this.element,e):this._$AH.handleEvent(e)}},nt=class{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){k(this,e)}};var bt=D.litHtmlPolyfillSupport;bt?.(H,N),((Z=D.litHtmlVersions)!==null&&Z!==void 0?Z:D.litHtmlVersions=[]).push("2.8.0");var Et=(o,e,t)=>{var i,s;let n=(i=t?.renderBefore)!==null&&i!==void 0?i:e,r=n._$litPart$;if(r===void 0){let d=(s=t?.renderBefore)!==null&&s!==void 0?s:null;n._$litPart$=r=new N(e.insertBefore(M(),d),d,void 0,t??{})}return r._$AI(o),r};var rt,ot;var b=class extends g{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var e,t;let i=super.createRenderRoot();return(e=(t=this.renderOptions).renderBefore)!==null&&e!==void 0||(t.renderBefore=i.firstChild),i}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Et(t,this.renderRoot,this.renderOptions)}connectedCallback(){var e;super.connectedCallback(),(e=this._$Do)===null||e===void 0||e.setConnected(!0)}disconnectedCallback(){var e;super.disconnectedCallback(),(e=this._$Do)===null||e===void 0||e.setConnected(!1)}render(){return w}};b.finalized=!0,b._$litElement$=!0,(rt=globalThis.litElementHydrateSupport)===null||rt===void 0||rt.call(globalThis,{LitElement:b});var kt=globalThis.litElementPolyfillSupport;kt?.({LitElement:b});((ot=globalThis.litElementVersions)!==null&&ot!==void 0?ot:globalThis.litElementVersions=[]).push("3.3.3");var Ct=q`
    :host {
        display: block;
        font-family: var(--primary-font-family, 'Helvetica Neue', Arial, sans-serif);
        --card-padding: 12px;
    }
    ha-card {
        padding: var(--card-padding);
        border-radius: 10px;
        box-shadow: 0 1px 0 rgba(0,0,0,0.06);
    }
    .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 8px;
    }
    .card-title {
        margin: 0;
        font-size: 1.15rem;
        font-weight: 600;
        color: var(--primary-text-color);
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .count-badge {
        background: var(--accent-color, #03a9f4);
        color: var(--count-badge-text-color, #fff);
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 999px;
        font-size: 1.2rem;
    }
    .input-row {
        display: flex;
        gap: 8px;
        margin-bottom: 10px;
        height: 40px;
        align-items: center;
    }
    .input-row input {
        flex: 1;
        padding: 8px 10px;
        font-size: 14px;
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 8px;
        color: var(--primary-text-color);
        background: var(--card-background-color);
        transition: box-shadow 0.12s ease, border-color 0.12s ease;
    }
    .input-row input:focus {
        outline: none;
        border-color: var(--accent-color, #03a9f4);
        box-shadow: 0 0 0 4px rgba(3,169,244,0.06);
    }
    /* keyboard-only focus */
    .input-row input:focus-visible {
        outline: none;
        border-color: var(--accent-color, #03a9f4);
        box-shadow: 0 0 0 4px rgba(3,169,244,0.06);
    }
    .input-row .btn {
        width: 36px;
        height: 36px;
        background: none;
        border: 1px solid transparent;
        cursor: pointer;
        padding: 0;
        color: var(--primary-text-color, #555);
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        transition: background 0.12s ease, color 0.12s ease;
    }
    .input-row .btn:hover,
    .btn:hover {
        background: rgba(0,0,0,0.04);
        color: var(--accent-color, #03a9f4);
        transform: translateY(-1px);
    }
    .item-row {
        display: flex;
        align-items: center;
        padding: 10px 0;
        border-bottom: 1px solid var(--divider-color, #f0f0f0);
        gap: 8px;
    }
    .item-summary {
        flex: 1 1 70%;
        font-size: 14px;
        color: var(--primary-text-color, #333);
        white-space: normal;
        overflow: visible;
        user-select: text;
    }
    .item-controls {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 6px;
    }
    .btn {
        width: 32px;
        height: 32px;
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
        color: var(--primary-text-color, #555);
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
    }
    .btn[title] {
        position: relative;
    }
    .hidden {
        display: none !important;
    }
    .quantity {
        min-width: 26px;
        text-align: center;
        font-weight: 600;
        font-size: 14px;
        color: var(--primary-text-color, #333);
        padding: 2px 6px;
        border-radius: 6px;
        background: rgba(0,0,0,0.03);
    }
    .empty-state {
        padding: 14px 0;
        font-size: 14px;
        color: var(--secondary-text-color, #888);
        text-align: center;
    }
    .item-sublabel {
        font-size: 12px;
        color: var(--secondary-text-color, #9a9a9a);
        margin-top: 4px;
    }
    .highlight {
        background-color: rgba(255, 235, 59, 0.35);
        /* padding: 0 3px; */
        border-radius: 3px;
    }

    /* small screens adjustments */
    @media (max-width: 420px) {
        .input-row { height: 44px; gap: 6px; }
        .btn, .input-row .btn { width: 40px; height: 40px; }
        .quantity { min-width: 28px; }
    }

    /* fixed-size centered spinner wrapper to avoid layout shift */
    .loading-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 1.2em;
        height: 1.2em;
        vertical-align: middle;
        pointer-events: none;
    }

    /* animate the inner ha-icon and svg explicitly */
    .loading-icon ha-icon,
    .loading-icon ha-icon svg,
    .loading-icon ha-icon * {
        display: block;
        width: 100%;
        height: 100%;
        transform-origin: 50% 50%;
        transform-box: fill-box;
        -webkit-backface-visibility: hidden;
        backface-visibility: hidden;
        will-change: transform;
        animation: spin 1s linear infinite;
    }

    /* fallback: animate svg children directly if present */
    .loading-icon svg {
        animation: spin 1s linear infinite;
        transform-origin: 50% 50%;
        transform-box: fill-box;
    }

    /* smooth rotation */
    @keyframes spin {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
    }

    /* make disabled buttons clearly non-interactive and remove focus ring */
    .btn[disabled] {
        opacity: 0.5;
        cursor: default;
        transform: none;
        pointer-events: none;
    }
    .btn[disabled]:focus-visible {
        outline: none;
        box-shadow: none;
    }
    /* key button can reuse .btn but override to be wider and centered */
    /* key buttons: single row that fills full width (no wrap) */
    .key-buttons {
        display: flex;
        gap: 8px;
        align-items: center;
        margin: 8px 0 12px;
        flex-wrap: nowrap;      /* force single row */
        width: 100%;
        overflow: visible;       /* avoid scrollbar if something goes slightly over */
    }

    /* make each button share available space equally */
    .key-buttons .key-btn,
    .key-buttons button {
        flex: 1 1 0;            /* grow & shrink equally, no base width forcing wrap */
        padding: 8px 12px;
        height: 40px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        border-radius: 8px;
        background: rgba(0,0,0,0.03);
        border: 1px solid transparent;
        cursor: pointer;
        transition: background 0.12s ease, transform 0.08s ease, color 0.12s ease;
        box-sizing: border-box;
        min-width: 0;           /* allow shrinking below default content width */
    }

    /* hover / focus */
    .key-buttons .key-btn:hover,
    .key-buttons .key-btn:focus,
    .key-buttons button:hover,
    .key-buttons button:focus {
        background: rgba(0,0,0,0.06);
        transform: translateY(-1px);
        color: var(--accent-color, #03a9f4);
        outline: none;
        box-shadow: 0 0 0 4px rgba(3,169,244,0.06);
        border-color: var(--accent-color, #03a9f4);
    }

    /* icon centering & sizing */
    .key-buttons .key-btn ha-icon,
    .btn ha-icon {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        width: 18px !important;
        height: 18px !important;
        line-height: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
    }

    /* For icon-only buttons (if any), keep a minimum tap target without stretching */
    .key-buttons .key-btn.icon-only {
        flex: 0 0 auto;
        min-width: 44px;
        padding: 8px;
    }

    .show-more {
        text-align: center;
        justify-content:center;
        display:flex; 
        margin-top:8px;
    }
    /* ensure .info acts as a row so we can place the button to the right */

    .info {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: var(--secondary-text-color, #888);
        margin-bottom: 8px;
    }

    /* keep the left text from shrinking */
    .info .info-text {
        flex: 0 0 auto;
    }

    /* wrapper to push button to the right */
    .info .show-all-wrap {
        margin-left: auto;
        display: flex;
        align-items: center;
    }
    `;var Ot=(o,e=200)=>{let t,i=function(...s){clearTimeout(t),t=setTimeout(()=>o.call(this,...s),e)};return i.cancel=()=>clearTimeout(t),i},Ft=(o,e)=>{o&&o.dispatchEvent(new CustomEvent("hass-notification",{detail:{message:e},bubbles:!0,composed:!0}))},at=async(o,e)=>typeof window.confirm=="function"?window.confirm(e):!1,B=async(o,e,t,i,s,n="Fehler")=>{try{await o.callService(e,t,i)}catch(r){throw console.error(`Error calling ${e}.${t}:`,r),Ft(s,n),r}},Rt=(o,e)=>{let t=String(o??""),i=String(e??"").trim();if(!i)return[t];let s=i.split(/\s+/).map(a=>a.trim()).filter(Boolean);if(!s.length)return[t];let n=t.toLowerCase(),r=Array.from(new Set(s.map(a=>a.toLowerCase()))).sort((a,u)=>u.length-a.length),d=a=>{for(let u of r)if(n.startsWith(u,a))return u.length;return 0},h=[],l=0,c=t.length;for(;l<c;){let a=-1;for(let y of r){let _=n.indexOf(y,l);if(_!==-1){if(_===l){a=l;break}(a===-1||_<a)&&(a=_)}}if(a===-1){h.push(t.slice(l));break}let u=d(a);a>l&&h.push(t.slice(l,a));let f=t.slice(a,a+u);h.push(p`<span class="highlight">${f}</span>`),l=a+u}return h.length?h:[t]},U=class extends b{constructor(){super();S(this,"_onInputKeydown",t=>{if(t.key==="Enter"){let i=(t.currentTarget?.value||"").trim();if(!i||this.config.hide_add_button)return;i.length>3&&this._addFilterTextToShoppingList()}else t.key==="Escape"&&this._updateFilterTextActual("")});S(this,"_addFilterTextToShoppingList",async()=>{let t=this.hass.states[this.config.filter_entity]?.state||"",i=this._normalizeTodoText(t);!i||!await at(this,`M\xF6chtest du "${i}" zur Einkaufsliste hinzuf\xFCgen?`)||await B(this.hass,"todo","add_item",{entity_id:this.config.shopping_list_entity,item:i,description:""},this,"Konnte '"+i+"' **nicht** zur Einkaufsliste hinzuf\xFCgen")});S(this,"_confirmAndComplete",async(t,i)=>{await at(this,`M\xF6chtest du "${t.s}" wirklich als erledigt markieren?`)&&this._updateOrCompleteItem(t.u,{status:"completed"},t.c,i)});this._cachedItems=[],this._cachedSourceMap={},this._filterValue="",this._lastItemsHash="",this._debouncedUpdateFilterText=Ot(this._updateFilterTextActual,250),this._pendingUpdates=new Set,this._displayLimit=void 0}get MAX_DISPLAY(){return this.config?.max_items_without_filter??20}get MAX_WITH_FILTER(){return this.config?.max_items_with_filter??50}disconnectedCallback(){super.disconnectedCallback(),this._debouncedUpdateFilterText?.cancel?.()}setConfig(t){if(!t)throw new Error("Missing config");let s=["filter_items_entity","shopping_list_entity","filter_entity","hash_entity"].filter(n=>!t[n]);if(s.length)throw new Error(`Missing required config: ${s.join(", ")}`);this.config={title:"ToDo List",show_origin:!1,hide_add_button:!1,highlight_matches:!1,max_items_without_filter:20,max_items_with_filter:50,show_more_buttons:"",filter_key_buttons:[],...t}}getCardSize(){return 4+Math.min(this._cachedItems?.length||0,6)}_addPending(t){this._pendingUpdates=new Set(this._pendingUpdates),this._pendingUpdates.add(t)}_removePending(t){let i=new Set(this._pendingUpdates);i.delete(t),this._pendingUpdates=i}shouldUpdate(t){if(!t.has("hass"))return t.size>0;let i=this.hass;if(!i||!this.config)return!0;let s=i.states?.[this.config.filter_entity],n=i.states?.[this.config.filter_items_entity],r=i.states?.[this.config.hash_entity],d=s?.state??"";if(d!==this._filterValue)return this._filterValue=d,this._displayLimit=void 0,!0;let h=String(r?.state??""),l=h.toLowerCase();(!h||l==="unknown"||l==="unavailable")&&(h="");let a=(h?null:this._computeItemsFingerprint(n))??h,u=a!==(this._lastItemsHash||"");if(u){this._displayLimit=void 0;let O=n?.attributes?.filtered_items,lt=typeof O=="string"?this._safeParseJSON(O,[]):Array.isArray(O)?O:[],I=n?.attributes?.source_map,It=typeof I=="string"?this._safeParseJSON(I,{}):I&&typeof I=="object"?I:{};this._cachedItems=d.trim()?lt.slice(0,this.MAX_WITH_FILTER):lt.slice(0,this.MAX_DISPLAY),this._cachedSourceMap=It,this._lastItemsHash=a}let f=t.get("hass"),y=parseInt(f?.states?.[this.config.filter_items_entity]?.state,10)||0,_=parseInt(n?.state,10)||0;return u||y!==_}_safeParseJSON(t,i){try{return JSON.parse(t)}catch{return i}}_computeItemsFingerprint(t){if(!t)return null;let i=t.attributes?.filtered_items,s=typeof i=="string"?i:JSON.stringify(i??[]),n=t.attributes?.source_map,r=typeof n=="string"?n:JSON.stringify(n??{});return`${t.state}|${s}|${r}`}_isNumeric(t){return typeof t=="string"&&/^\d+$/.test(t)}_onFilterKeyButtonClick(t){if(!t)return;let i=`todo:${String(t)} `;this._updateFilterTextActual(i)}_updateFilterTextActual(t){try{let i=this.config?.filter_entity;if(!i||!this.hass)return;let s=this.hass.states?.[i]?.state??"",n=String(s),r=String(t??"");if(n===r)return;B(this.hass,"input_text","set_value",{entity_id:i,value:t??""},this,"Fehler beim Aktualisieren des Suchfeldes")}catch(i){console.error("Error in _updateFilterTextActual:",i)}}_clearFilterPreservingTodoKey(){try{let t=this.config?.filter_entity,i=this.hass?.states?.[t]?.state??"",s=String(i).trim();if(!s){this._updateFilterTextActual("");return}let n=s.split(/\s+/).filter(Boolean),r=n.findIndex(h=>/^todo:[^\s]+$/.test(h));if(r===-1){this._updateFilterTextActual("");return}if(n.length===1){this._updateFilterTextActual("");return}let d=n[r];this._updateFilterTextActual(d+" ")}catch(t){console.error("Error while clearing filter:",t),this._updateFilterTextActual("")}}_handleFilterInputChange(t){this._debouncedUpdateFilterText(t.target.value)}_normalizeTodoText(t){let i=(t||"").trim();if(!i)return"";if(i.startsWith("todo:")){let s=i.split(" ");if(s.length>1)s.shift(),i=s.join(" ");else return""}return i}async _updateOrCompleteItem(t,i,s,n){let r=n?.[String(s)]?.entity_id;if(!r){console.error("No valid todo entity id for source:",s);return}let d={entity_id:r,item:t,...i},h;if(i.description!==void 0){let c=parseInt(i.description,10);(isNaN(c)||c<0)&&(c=0),d.description=String(c),h=String(c)}let l=null;if(h!==void 0&&Array.isArray(this._cachedItems)){let c=this._cachedItems.findIndex(a=>String(a.u)===String(t));if(c>=0){let a=this._cachedItems.slice();l=a[c].d,a[c]={...a[c],d:h},this._cachedItems=a}}this._addPending(t);try{await B(this.hass,"todo","update_item",d,this,"Fehler beim Aktualisieren des Eintrags"),this._removePending(t)}catch(c){if(console.error("todo/update_item:",c),l!==null&&Array.isArray(this._cachedItems)){let a=this._cachedItems.findIndex(u=>String(u.u)===String(t));if(a>=0){let u=this._cachedItems.slice();u[a]={...u[a],d:l},this._cachedItems=u}}this._removePending(t)}}_addToShoppingList(t){let i=this.config.shopping_list_entity;if(!i){console.error("No valid shopping list entity id configured");return}(async()=>await at(this,`M\xF6chtest du "${t.s}" zur Einkaufsliste hinzuf\xFCgen?`)&&await B(this.hass,"todo","add_item",{entity_id:i,item:t.s,description:""},this,"Einkaufsliste aktualisieren fehlgeschlagen"))()}_renderQuantityControls(t,i){let s=String(t.d??"");if(s===""&&(s="1"),!this._isNumeric(s))return p`<div class="quantity" title="Menge">${s}</div>`;let n=parseInt(s,10),r=this._pendingUpdates.has(t.u),d=()=>{r||this._updateOrCompleteItem(t.u,{description:Math.max(n-1,0)},t.c,i)},h=()=>{r||this._updateOrCompleteItem(t.u,{description:n+1},t.c,i)};return p`
      ${n>1?p`<button class="btn" type="button" title="Verringern" aria-label="Verringern"
                      ?disabled=${r}
                      @click=${d}><ha-icon icon="mdi:minus-circle-outline"></ha-icon></button>`:""}
      <div class="quantity" title="Menge">
        ${r?p`<span class="loading-icon" aria-hidden="true"><ha-icon icon="mdi:loading"></ha-icon></span>`:n}
      </div>
      <button class="btn" type="button" title="Erhöhen" aria-label="Erhöhen"
              ?disabled=${r}
              @click=${h}><ha-icon icon="mdi:plus-circle-outline"></ha-icon></button>
    `}_renderItemRow(t,i){let n=!!this.config?.show_origin?i?.[String(t.c)]?.friendly_name:null,r=this._normalizeTodoText(this._filterValue),h=!!(r&&this.config.highlight_matches)?Rt(t.s,r):[String(t.s??"")];return p`
        <div class="item-row" role="listitem">
          <div class="item-summary" title=${t.s}>
            ${h}
            ${n?p`<div class="item-sublabel">${n}</div>`:""}
          </div>
          <div class="item-controls">
            ${this._renderQuantityControls(t,i)}
            <button class="btn" type="button" title="Zur Einkaufsliste" aria-label="Zur Einkaufsliste" @click=${()=>this._addToShoppingList(t)}>
              <ha-icon icon="mdi:cart-outline"></ha-icon>
            </button>
            <button class="btn" type="button" title="Erledigt" aria-label="Erledigt" @click=${()=>this._confirmAndComplete(t,this._cachedSourceMap)}>
              <ha-icon icon="mdi:delete-outline"></ha-icon>
            </button>
          </div>
        </div>
      `}_showMore(t){let i=this._fullItemsList||this._cachedItems||[];(this._displayLimit===void 0||this._displayLimit===null)&&(this._displayLimit=this._filterValue?.trim()?this.MAX_WITH_FILTER:this.MAX_DISPLAY);let s=this._displayLimit;if(typeof t=="string"){let n=t.toLowerCase().trim();if(n==="all"||n==="rest")s=i.length;else{let r=Number(t);Number.isFinite(r)&&r>0?s=Math.min(this._displayLimit+Math.floor(r),i.length):s=Math.min(this._displayLimit+10,i.length)}}else typeof t=="number"?Number.isFinite(t)&&t>0?s=Math.min(this._displayLimit+Math.floor(t),i.length):s=Math.min(this._displayLimit+10,i.length):typeof t>"u"?s=Math.min(this._displayLimit+10,i.length):s=Math.min(this._displayLimit+10,i.length);this._displayLimit=s,this._cachedItems=i.slice(0,this._displayLimit)}_parseShowMoreButtons(){let t=String(this.config?.show_more_buttons??"").trim();if(!t)return[];let s=t.split(",").map(n=>n.trim()).filter(Boolean).map(n=>{let r=Number(n);return Number.isFinite(r)&&r>0?Math.floor(r):null}).filter(n=>n!==null);return Array.from(new Set(s)).sort((n,r)=>n-r)}render(){if(!this.hass)return p`<ha-card><div class="empty-state">Home Assistant context not available</div></ha-card>`;let t=this.hass.states[this.config.filter_items_entity];if(!t)return p`<ha-card><div class="empty-state">Entity '${this.config.filter_items_entity}' not found</div></ha-card>`;let i=this._filterValue??"",s=i.trim().length>3&&!this.config.hide_add_button;if(!this._lastItemsHash){let l=t.attributes.filtered_items,c=typeof l=="string"?this._safeParseJSON(l,[]):Array.isArray(l)?l:[];this._fullItemsList=c,(this._displayLimit===void 0||this._displayLimit===null)&&(this._displayLimit=i.trim()?this.MAX_WITH_FILTER:this.MAX_DISPLAY),this._cachedItems=c.slice(0,this._displayLimit);let a=t.attributes.source_map;this._cachedSourceMap=typeof a=="string"?this._safeParseJSON(a,{}):a&&typeof a=="object"?a:{};let u=this.hass.states?.[this.config.hash_entity],f=String(u?.state??""),y=f.toLowerCase();(!f||y==="unknown"||y==="unavailable")&&(f="");let _="";f||(_=this._computeItemsFingerprint(t)||""),this._lastItemsHash=f||_}{let l=t.attributes.filtered_items,c=typeof l=="string"?this._safeParseJSON(l,[]):Array.isArray(l)?l:[];this._fullItemsList=c,i.trim()?((this._displayLimit===void 0||this._displayLimit===null)&&(this._displayLimit=this.MAX_WITH_FILTER),this._cachedItems=c.slice(0,this._displayLimit)):((this._displayLimit===void 0||this._displayLimit===null)&&(this._displayLimit=this.MAX_DISPLAY),this._cachedItems=c.slice(0,this._displayLimit))}let n=parseInt(t?.state,10)||0,r=this._cachedItems||[],d=r.length,h=Math.max(0,n-d);return p`
      <ha-card>
        <div class="card-header">
          <div class="card-title">${this.config.title||"ToDo List"}</div>
          <div class="count-badge" title="Gesamtanzahl Einträge">${n}</div>
        </div>
        <div class="input-row">
          <input
            type="text"
            .value=${i}
            placeholder="Tippe einen Suchfilter ein"
            @input=${this._handleFilterInputChange}
            @keydown=${this._onInputKeydown}
            aria-label="Filter"
          />
          <button
            class="btn ${i?"":"hidden"}"
            type="button"
            @click=${()=>this._clearFilterPreservingTodoKey()}
            title="Eingabe leeren"
            aria-label="Eingabe leeren"
          >
            <ha-icon icon="mdi:close-circle-outline"></ha-icon>
          </button>
          <button
            class="btn ${s?"":"hidden"}"
            type="button"
            @click=${this._addFilterTextToShoppingList}
            title="Zur Einkaufsliste hinzufügen"
            aria-label="Zur Einkaufsliste hinzufügen"
          >
            <ha-icon icon="mdi:cart-plus"></ha-icon>
          </button>
        </div>
        
        ${Array.isArray(this.config.filter_key_buttons)&&this.config.filter_key_buttons.length?p`<div class="key-buttons" role="toolbar" aria-label="Schnellfilter">
              ${this.config.filter_key_buttons.map(l=>{let c=l.name||l.filter_key||"",a=l.icon,u=l.filter_key||"";return p`
                  <button
                    class="key-btn"
                    type="button"
                    title=${c}
                    aria-label=${c}
                    @click=${()=>this._onFilterKeyButtonClick(u)}
                  >
                    ${a?p`<ha-icon .icon=${a}></ha-icon>`:p`${c}`}
                  </button>
                `})}
            </div>`:""}


        ${i.trim()?p`<div class="info" aria-live="polite">Filter: "${i.trim()}" → ${(this._fullItemsList||[]).length} Treffer</div>`:n>(this.config.max_items_without_filter??20)?p`<div class="info" aria-live="polite">${d} von ${n} Einträgen</div>`:""}

        ${d===0?p`<div class="empty-state" aria-live="polite">Keine Ergebnisse gefunden</div>`:p`<div role="list" aria-label="Trefferliste">${r.map(l=>this._renderItemRow(l,this._cachedSourceMap))}</div>`}

        ${this._fullItemsList&&this._fullItemsList.length>(r?.length||0)?(()=>{let l=Math.max(0,this._fullItemsList.length-r.length),c=this._parseShowMoreButtons();return p`
                <div class="key-buttons" role="group" aria-label="Mehr anzeigen Optionen">
                  ${c.length?c.map(a=>p`
                          <button
                            class="key-btn"
                            type="button"
                            title="Mehr anzeigen ${a}"
                            ?disabled=${a>l}
                            @click=${()=>this._showMore(a)}
                          >
                            +${a}
                          </button>
                        `):""}
        
                  <button
                    class="key-btn"
                    type="button"
                    title="Alles anzeigen"
                    @click=${()=>this._showMore("all")}
                  >
                    Alle (${l})
                  </button>
                </div>
              `})():""}
      
          </ha-card>
    `}static getConfigElement(){return null}static getStubConfig(){return{title:"ToDo List",filter_items_entity:"sensor.todo_filtered_items",hash_entity:"sensor.todo_hash",shopping_list_entity:"todo.shopping_list",filter_entity:"input_text.todo_filter"}}};S(U,"properties",{hass:{},config:{},_cachedItems:{state:!0},_cachedSourceMap:{state:!0},_displayLimit:{state:!0},_filterValue:{state:!0},_pendingUpdates:{state:!0},_lastItemsHash:{state:!1}}),S(U,"styles",Ct);customElements.get("item-list-card")||customElements.define("item-list-card",U);
/*! Bundled license information:

@lit/reactive-element/css-tag.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/reactive-element.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/lit-html.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-element/lit-element.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/is-server.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
//# sourceMappingURL=item-list-card.js.map
