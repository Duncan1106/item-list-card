var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// node_modules/@lit/reactive-element/css-tag.js
var t = window;
var e = t.ShadowRoot && (void 0 === t.ShadyCSS || t.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype;
var s = Symbol();
var n = /* @__PURE__ */ new WeakMap();
var o = class {
  constructor(t3, e4, n5) {
    if (this._$cssResult$ = true, n5 !== s) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t3, this.t = e4;
  }
  get styleSheet() {
    let t3 = this.o;
    const s5 = this.t;
    if (e && void 0 === t3) {
      const e4 = void 0 !== s5 && 1 === s5.length;
      e4 && (t3 = n.get(s5)), void 0 === t3 && ((this.o = t3 = new CSSStyleSheet()).replaceSync(this.cssText), e4 && n.set(s5, t3));
    }
    return t3;
  }
  toString() {
    return this.cssText;
  }
};
var r = (t3) => new o("string" == typeof t3 ? t3 : t3 + "", void 0, s);
var i = (t3, ...e4) => {
  const n5 = 1 === t3.length ? t3[0] : e4.reduce(((e5, s5, n6) => e5 + ((t4) => {
    if (true === t4._$cssResult$) return t4.cssText;
    if ("number" == typeof t4) return t4;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + t4 + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s5) + t3[n6 + 1]), t3[0]);
  return new o(n5, t3, s);
};
var S = (s5, n5) => {
  e ? s5.adoptedStyleSheets = n5.map(((t3) => t3 instanceof CSSStyleSheet ? t3 : t3.styleSheet)) : n5.forEach(((e4) => {
    const n6 = document.createElement("style"), o5 = t.litNonce;
    void 0 !== o5 && n6.setAttribute("nonce", o5), n6.textContent = e4.cssText, s5.appendChild(n6);
  }));
};
var c = e ? (t3) => t3 : (t3) => t3 instanceof CSSStyleSheet ? ((t4) => {
  let e4 = "";
  for (const s5 of t4.cssRules) e4 += s5.cssText;
  return r(e4);
})(t3) : t3;

// node_modules/@lit/reactive-element/reactive-element.js
var s2;
var e2 = window;
var r2 = e2.trustedTypes;
var h = r2 ? r2.emptyScript : "";
var o2 = e2.reactiveElementPolyfillSupport;
var n2 = { toAttribute(t3, i3) {
  switch (i3) {
    case Boolean:
      t3 = t3 ? h : null;
      break;
    case Object:
    case Array:
      t3 = null == t3 ? t3 : JSON.stringify(t3);
  }
  return t3;
}, fromAttribute(t3, i3) {
  let s5 = t3;
  switch (i3) {
    case Boolean:
      s5 = null !== t3;
      break;
    case Number:
      s5 = null === t3 ? null : Number(t3);
      break;
    case Object:
    case Array:
      try {
        s5 = JSON.parse(t3);
      } catch (t4) {
        s5 = null;
      }
  }
  return s5;
} };
var a = (t3, i3) => i3 !== t3 && (i3 == i3 || t3 == t3);
var l = { attribute: true, type: String, converter: n2, reflect: false, hasChanged: a };
var d = "finalized";
var u = class extends HTMLElement {
  constructor() {
    super(), this._$Ei = /* @__PURE__ */ new Map(), this.isUpdatePending = false, this.hasUpdated = false, this._$El = null, this._$Eu();
  }
  static addInitializer(t3) {
    var i3;
    this.finalize(), (null !== (i3 = this.h) && void 0 !== i3 ? i3 : this.h = []).push(t3);
  }
  static get observedAttributes() {
    this.finalize();
    const t3 = [];
    return this.elementProperties.forEach(((i3, s5) => {
      const e4 = this._$Ep(s5, i3);
      void 0 !== e4 && (this._$Ev.set(e4, s5), t3.push(e4));
    })), t3;
  }
  static createProperty(t3, i3 = l) {
    if (i3.state && (i3.attribute = false), this.finalize(), this.elementProperties.set(t3, i3), !i3.noAccessor && !this.prototype.hasOwnProperty(t3)) {
      const s5 = "symbol" == typeof t3 ? Symbol() : "__" + t3, e4 = this.getPropertyDescriptor(t3, s5, i3);
      void 0 !== e4 && Object.defineProperty(this.prototype, t3, e4);
    }
  }
  static getPropertyDescriptor(t3, i3, s5) {
    return { get() {
      return this[i3];
    }, set(e4) {
      const r4 = this[t3];
      this[i3] = e4, this.requestUpdate(t3, r4, s5);
    }, configurable: true, enumerable: true };
  }
  static getPropertyOptions(t3) {
    return this.elementProperties.get(t3) || l;
  }
  static finalize() {
    if (this.hasOwnProperty(d)) return false;
    this[d] = true;
    const t3 = Object.getPrototypeOf(this);
    if (t3.finalize(), void 0 !== t3.h && (this.h = [...t3.h]), this.elementProperties = new Map(t3.elementProperties), this._$Ev = /* @__PURE__ */ new Map(), this.hasOwnProperty("properties")) {
      const t4 = this.properties, i3 = [...Object.getOwnPropertyNames(t4), ...Object.getOwnPropertySymbols(t4)];
      for (const s5 of i3) this.createProperty(s5, t4[s5]);
    }
    return this.elementStyles = this.finalizeStyles(this.styles), true;
  }
  static finalizeStyles(i3) {
    const s5 = [];
    if (Array.isArray(i3)) {
      const e4 = new Set(i3.flat(1 / 0).reverse());
      for (const i4 of e4) s5.unshift(c(i4));
    } else void 0 !== i3 && s5.push(c(i3));
    return s5;
  }
  static _$Ep(t3, i3) {
    const s5 = i3.attribute;
    return false === s5 ? void 0 : "string" == typeof s5 ? s5 : "string" == typeof t3 ? t3.toLowerCase() : void 0;
  }
  _$Eu() {
    var t3;
    this._$E_ = new Promise(((t4) => this.enableUpdating = t4)), this._$AL = /* @__PURE__ */ new Map(), this._$Eg(), this.requestUpdate(), null === (t3 = this.constructor.h) || void 0 === t3 || t3.forEach(((t4) => t4(this)));
  }
  addController(t3) {
    var i3, s5;
    (null !== (i3 = this._$ES) && void 0 !== i3 ? i3 : this._$ES = []).push(t3), void 0 !== this.renderRoot && this.isConnected && (null === (s5 = t3.hostConnected) || void 0 === s5 || s5.call(t3));
  }
  removeController(t3) {
    var i3;
    null === (i3 = this._$ES) || void 0 === i3 || i3.splice(this._$ES.indexOf(t3) >>> 0, 1);
  }
  _$Eg() {
    this.constructor.elementProperties.forEach(((t3, i3) => {
      this.hasOwnProperty(i3) && (this._$Ei.set(i3, this[i3]), delete this[i3]);
    }));
  }
  createRenderRoot() {
    var t3;
    const s5 = null !== (t3 = this.shadowRoot) && void 0 !== t3 ? t3 : this.attachShadow(this.constructor.shadowRootOptions);
    return S(s5, this.constructor.elementStyles), s5;
  }
  connectedCallback() {
    var t3;
    void 0 === this.renderRoot && (this.renderRoot = this.createRenderRoot()), this.enableUpdating(true), null === (t3 = this._$ES) || void 0 === t3 || t3.forEach(((t4) => {
      var i3;
      return null === (i3 = t4.hostConnected) || void 0 === i3 ? void 0 : i3.call(t4);
    }));
  }
  enableUpdating(t3) {
  }
  disconnectedCallback() {
    var t3;
    null === (t3 = this._$ES) || void 0 === t3 || t3.forEach(((t4) => {
      var i3;
      return null === (i3 = t4.hostDisconnected) || void 0 === i3 ? void 0 : i3.call(t4);
    }));
  }
  attributeChangedCallback(t3, i3, s5) {
    this._$AK(t3, s5);
  }
  _$EO(t3, i3, s5 = l) {
    var e4;
    const r4 = this.constructor._$Ep(t3, s5);
    if (void 0 !== r4 && true === s5.reflect) {
      const h3 = (void 0 !== (null === (e4 = s5.converter) || void 0 === e4 ? void 0 : e4.toAttribute) ? s5.converter : n2).toAttribute(i3, s5.type);
      this._$El = t3, null == h3 ? this.removeAttribute(r4) : this.setAttribute(r4, h3), this._$El = null;
    }
  }
  _$AK(t3, i3) {
    var s5;
    const e4 = this.constructor, r4 = e4._$Ev.get(t3);
    if (void 0 !== r4 && this._$El !== r4) {
      const t4 = e4.getPropertyOptions(r4), h3 = "function" == typeof t4.converter ? { fromAttribute: t4.converter } : void 0 !== (null === (s5 = t4.converter) || void 0 === s5 ? void 0 : s5.fromAttribute) ? t4.converter : n2;
      this._$El = r4, this[r4] = h3.fromAttribute(i3, t4.type), this._$El = null;
    }
  }
  requestUpdate(t3, i3, s5) {
    let e4 = true;
    void 0 !== t3 && (((s5 = s5 || this.constructor.getPropertyOptions(t3)).hasChanged || a)(this[t3], i3) ? (this._$AL.has(t3) || this._$AL.set(t3, i3), true === s5.reflect && this._$El !== t3 && (void 0 === this._$EC && (this._$EC = /* @__PURE__ */ new Map()), this._$EC.set(t3, s5))) : e4 = false), !this.isUpdatePending && e4 && (this._$E_ = this._$Ej());
  }
  async _$Ej() {
    this.isUpdatePending = true;
    try {
      await this._$E_;
    } catch (t4) {
      Promise.reject(t4);
    }
    const t3 = this.scheduleUpdate();
    return null != t3 && await t3, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    var t3;
    if (!this.isUpdatePending) return;
    this.hasUpdated, this._$Ei && (this._$Ei.forEach(((t4, i4) => this[i4] = t4)), this._$Ei = void 0);
    let i3 = false;
    const s5 = this._$AL;
    try {
      i3 = this.shouldUpdate(s5), i3 ? (this.willUpdate(s5), null === (t3 = this._$ES) || void 0 === t3 || t3.forEach(((t4) => {
        var i4;
        return null === (i4 = t4.hostUpdate) || void 0 === i4 ? void 0 : i4.call(t4);
      })), this.update(s5)) : this._$Ek();
    } catch (t4) {
      throw i3 = false, this._$Ek(), t4;
    }
    i3 && this._$AE(s5);
  }
  willUpdate(t3) {
  }
  _$AE(t3) {
    var i3;
    null === (i3 = this._$ES) || void 0 === i3 || i3.forEach(((t4) => {
      var i4;
      return null === (i4 = t4.hostUpdated) || void 0 === i4 ? void 0 : i4.call(t4);
    })), this.hasUpdated || (this.hasUpdated = true, this.firstUpdated(t3)), this.updated(t3);
  }
  _$Ek() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = false;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$E_;
  }
  shouldUpdate(t3) {
    return true;
  }
  update(t3) {
    void 0 !== this._$EC && (this._$EC.forEach(((t4, i3) => this._$EO(i3, this[i3], t4))), this._$EC = void 0), this._$Ek();
  }
  updated(t3) {
  }
  firstUpdated(t3) {
  }
};
u[d] = true, u.elementProperties = /* @__PURE__ */ new Map(), u.elementStyles = [], u.shadowRootOptions = { mode: "open" }, null == o2 || o2({ ReactiveElement: u }), (null !== (s2 = e2.reactiveElementVersions) && void 0 !== s2 ? s2 : e2.reactiveElementVersions = []).push("1.6.3");

// node_modules/lit-html/lit-html.js
var t2;
var i2 = window;
var s3 = i2.trustedTypes;
var e3 = s3 ? s3.createPolicy("lit-html", { createHTML: (t3) => t3 }) : void 0;
var o3 = "$lit$";
var n3 = `lit$${(Math.random() + "").slice(9)}$`;
var l2 = "?" + n3;
var h2 = `<${l2}>`;
var r3 = document;
var u2 = () => r3.createComment("");
var d2 = (t3) => null === t3 || "object" != typeof t3 && "function" != typeof t3;
var c2 = Array.isArray;
var v = (t3) => c2(t3) || "function" == typeof (null == t3 ? void 0 : t3[Symbol.iterator]);
var a2 = "[ 	\n\f\r]";
var f = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
var _ = /-->/g;
var m = />/g;
var p = RegExp(`>|${a2}(?:([^\\s"'>=/]+)(${a2}*=${a2}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g");
var g = /'/g;
var $ = /"/g;
var y = /^(?:script|style|textarea|title)$/i;
var w = (t3) => (i3, ...s5) => ({ _$litType$: t3, strings: i3, values: s5 });
var x = w(1);
var b = w(2);
var T = Symbol.for("lit-noChange");
var A = Symbol.for("lit-nothing");
var E = /* @__PURE__ */ new WeakMap();
var C = r3.createTreeWalker(r3, 129, null, false);
function P(t3, i3) {
  if (!Array.isArray(t3) || !t3.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return void 0 !== e3 ? e3.createHTML(i3) : i3;
}
var V = (t3, i3) => {
  const s5 = t3.length - 1, e4 = [];
  let l4, r4 = 2 === i3 ? "<svg>" : "", u3 = f;
  for (let i4 = 0; i4 < s5; i4++) {
    const s6 = t3[i4];
    let d3, c3, v2 = -1, a3 = 0;
    for (; a3 < s6.length && (u3.lastIndex = a3, c3 = u3.exec(s6), null !== c3); ) a3 = u3.lastIndex, u3 === f ? "!--" === c3[1] ? u3 = _ : void 0 !== c3[1] ? u3 = m : void 0 !== c3[2] ? (y.test(c3[2]) && (l4 = RegExp("</" + c3[2], "g")), u3 = p) : void 0 !== c3[3] && (u3 = p) : u3 === p ? ">" === c3[0] ? (u3 = null != l4 ? l4 : f, v2 = -1) : void 0 === c3[1] ? v2 = -2 : (v2 = u3.lastIndex - c3[2].length, d3 = c3[1], u3 = void 0 === c3[3] ? p : '"' === c3[3] ? $ : g) : u3 === $ || u3 === g ? u3 = p : u3 === _ || u3 === m ? u3 = f : (u3 = p, l4 = void 0);
    const w2 = u3 === p && t3[i4 + 1].startsWith("/>") ? " " : "";
    r4 += u3 === f ? s6 + h2 : v2 >= 0 ? (e4.push(d3), s6.slice(0, v2) + o3 + s6.slice(v2) + n3 + w2) : s6 + n3 + (-2 === v2 ? (e4.push(void 0), i4) : w2);
  }
  return [P(t3, r4 + (t3[s5] || "<?>") + (2 === i3 ? "</svg>" : "")), e4];
};
var N = class _N {
  constructor({ strings: t3, _$litType$: i3 }, e4) {
    let h3;
    this.parts = [];
    let r4 = 0, d3 = 0;
    const c3 = t3.length - 1, v2 = this.parts, [a3, f2] = V(t3, i3);
    if (this.el = _N.createElement(a3, e4), C.currentNode = this.el.content, 2 === i3) {
      const t4 = this.el.content, i4 = t4.firstChild;
      i4.remove(), t4.append(...i4.childNodes);
    }
    for (; null !== (h3 = C.nextNode()) && v2.length < c3; ) {
      if (1 === h3.nodeType) {
        if (h3.hasAttributes()) {
          const t4 = [];
          for (const i4 of h3.getAttributeNames()) if (i4.endsWith(o3) || i4.startsWith(n3)) {
            const s5 = f2[d3++];
            if (t4.push(i4), void 0 !== s5) {
              const t5 = h3.getAttribute(s5.toLowerCase() + o3).split(n3), i5 = /([.?@])?(.*)/.exec(s5);
              v2.push({ type: 1, index: r4, name: i5[2], strings: t5, ctor: "." === i5[1] ? H : "?" === i5[1] ? L : "@" === i5[1] ? z : k });
            } else v2.push({ type: 6, index: r4 });
          }
          for (const i4 of t4) h3.removeAttribute(i4);
        }
        if (y.test(h3.tagName)) {
          const t4 = h3.textContent.split(n3), i4 = t4.length - 1;
          if (i4 > 0) {
            h3.textContent = s3 ? s3.emptyScript : "";
            for (let s5 = 0; s5 < i4; s5++) h3.append(t4[s5], u2()), C.nextNode(), v2.push({ type: 2, index: ++r4 });
            h3.append(t4[i4], u2());
          }
        }
      } else if (8 === h3.nodeType) if (h3.data === l2) v2.push({ type: 2, index: r4 });
      else {
        let t4 = -1;
        for (; -1 !== (t4 = h3.data.indexOf(n3, t4 + 1)); ) v2.push({ type: 7, index: r4 }), t4 += n3.length - 1;
      }
      r4++;
    }
  }
  static createElement(t3, i3) {
    const s5 = r3.createElement("template");
    return s5.innerHTML = t3, s5;
  }
};
function S2(t3, i3, s5 = t3, e4) {
  var o5, n5, l4, h3;
  if (i3 === T) return i3;
  let r4 = void 0 !== e4 ? null === (o5 = s5._$Co) || void 0 === o5 ? void 0 : o5[e4] : s5._$Cl;
  const u3 = d2(i3) ? void 0 : i3._$litDirective$;
  return (null == r4 ? void 0 : r4.constructor) !== u3 && (null === (n5 = null == r4 ? void 0 : r4._$AO) || void 0 === n5 || n5.call(r4, false), void 0 === u3 ? r4 = void 0 : (r4 = new u3(t3), r4._$AT(t3, s5, e4)), void 0 !== e4 ? (null !== (l4 = (h3 = s5)._$Co) && void 0 !== l4 ? l4 : h3._$Co = [])[e4] = r4 : s5._$Cl = r4), void 0 !== r4 && (i3 = S2(t3, r4._$AS(t3, i3.values), r4, e4)), i3;
}
var M = class {
  constructor(t3, i3) {
    this._$AV = [], this._$AN = void 0, this._$AD = t3, this._$AM = i3;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t3) {
    var i3;
    const { el: { content: s5 }, parts: e4 } = this._$AD, o5 = (null !== (i3 = null == t3 ? void 0 : t3.creationScope) && void 0 !== i3 ? i3 : r3).importNode(s5, true);
    C.currentNode = o5;
    let n5 = C.nextNode(), l4 = 0, h3 = 0, u3 = e4[0];
    for (; void 0 !== u3; ) {
      if (l4 === u3.index) {
        let i4;
        2 === u3.type ? i4 = new R(n5, n5.nextSibling, this, t3) : 1 === u3.type ? i4 = new u3.ctor(n5, u3.name, u3.strings, this, t3) : 6 === u3.type && (i4 = new Z(n5, this, t3)), this._$AV.push(i4), u3 = e4[++h3];
      }
      l4 !== (null == u3 ? void 0 : u3.index) && (n5 = C.nextNode(), l4++);
    }
    return C.currentNode = r3, o5;
  }
  v(t3) {
    let i3 = 0;
    for (const s5 of this._$AV) void 0 !== s5 && (void 0 !== s5.strings ? (s5._$AI(t3, s5, i3), i3 += s5.strings.length - 2) : s5._$AI(t3[i3])), i3++;
  }
};
var R = class _R {
  constructor(t3, i3, s5, e4) {
    var o5;
    this.type = 2, this._$AH = A, this._$AN = void 0, this._$AA = t3, this._$AB = i3, this._$AM = s5, this.options = e4, this._$Cp = null === (o5 = null == e4 ? void 0 : e4.isConnected) || void 0 === o5 || o5;
  }
  get _$AU() {
    var t3, i3;
    return null !== (i3 = null === (t3 = this._$AM) || void 0 === t3 ? void 0 : t3._$AU) && void 0 !== i3 ? i3 : this._$Cp;
  }
  get parentNode() {
    let t3 = this._$AA.parentNode;
    const i3 = this._$AM;
    return void 0 !== i3 && 11 === (null == t3 ? void 0 : t3.nodeType) && (t3 = i3.parentNode), t3;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t3, i3 = this) {
    t3 = S2(this, t3, i3), d2(t3) ? t3 === A || null == t3 || "" === t3 ? (this._$AH !== A && this._$AR(), this._$AH = A) : t3 !== this._$AH && t3 !== T && this._(t3) : void 0 !== t3._$litType$ ? this.g(t3) : void 0 !== t3.nodeType ? this.$(t3) : v(t3) ? this.T(t3) : this._(t3);
  }
  k(t3) {
    return this._$AA.parentNode.insertBefore(t3, this._$AB);
  }
  $(t3) {
    this._$AH !== t3 && (this._$AR(), this._$AH = this.k(t3));
  }
  _(t3) {
    this._$AH !== A && d2(this._$AH) ? this._$AA.nextSibling.data = t3 : this.$(r3.createTextNode(t3)), this._$AH = t3;
  }
  g(t3) {
    var i3;
    const { values: s5, _$litType$: e4 } = t3, o5 = "number" == typeof e4 ? this._$AC(t3) : (void 0 === e4.el && (e4.el = N.createElement(P(e4.h, e4.h[0]), this.options)), e4);
    if ((null === (i3 = this._$AH) || void 0 === i3 ? void 0 : i3._$AD) === o5) this._$AH.v(s5);
    else {
      const t4 = new M(o5, this), i4 = t4.u(this.options);
      t4.v(s5), this.$(i4), this._$AH = t4;
    }
  }
  _$AC(t3) {
    let i3 = E.get(t3.strings);
    return void 0 === i3 && E.set(t3.strings, i3 = new N(t3)), i3;
  }
  T(t3) {
    c2(this._$AH) || (this._$AH = [], this._$AR());
    const i3 = this._$AH;
    let s5, e4 = 0;
    for (const o5 of t3) e4 === i3.length ? i3.push(s5 = new _R(this.k(u2()), this.k(u2()), this, this.options)) : s5 = i3[e4], s5._$AI(o5), e4++;
    e4 < i3.length && (this._$AR(s5 && s5._$AB.nextSibling, e4), i3.length = e4);
  }
  _$AR(t3 = this._$AA.nextSibling, i3) {
    var s5;
    for (null === (s5 = this._$AP) || void 0 === s5 || s5.call(this, false, true, i3); t3 && t3 !== this._$AB; ) {
      const i4 = t3.nextSibling;
      t3.remove(), t3 = i4;
    }
  }
  setConnected(t3) {
    var i3;
    void 0 === this._$AM && (this._$Cp = t3, null === (i3 = this._$AP) || void 0 === i3 || i3.call(this, t3));
  }
};
var k = class {
  constructor(t3, i3, s5, e4, o5) {
    this.type = 1, this._$AH = A, this._$AN = void 0, this.element = t3, this.name = i3, this._$AM = e4, this.options = o5, s5.length > 2 || "" !== s5[0] || "" !== s5[1] ? (this._$AH = Array(s5.length - 1).fill(new String()), this.strings = s5) : this._$AH = A;
  }
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t3, i3 = this, s5, e4) {
    const o5 = this.strings;
    let n5 = false;
    if (void 0 === o5) t3 = S2(this, t3, i3, 0), n5 = !d2(t3) || t3 !== this._$AH && t3 !== T, n5 && (this._$AH = t3);
    else {
      const e5 = t3;
      let l4, h3;
      for (t3 = o5[0], l4 = 0; l4 < o5.length - 1; l4++) h3 = S2(this, e5[s5 + l4], i3, l4), h3 === T && (h3 = this._$AH[l4]), n5 || (n5 = !d2(h3) || h3 !== this._$AH[l4]), h3 === A ? t3 = A : t3 !== A && (t3 += (null != h3 ? h3 : "") + o5[l4 + 1]), this._$AH[l4] = h3;
    }
    n5 && !e4 && this.j(t3);
  }
  j(t3) {
    t3 === A ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, null != t3 ? t3 : "");
  }
};
var H = class extends k {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t3) {
    this.element[this.name] = t3 === A ? void 0 : t3;
  }
};
var I = s3 ? s3.emptyScript : "";
var L = class extends k {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t3) {
    t3 && t3 !== A ? this.element.setAttribute(this.name, I) : this.element.removeAttribute(this.name);
  }
};
var z = class extends k {
  constructor(t3, i3, s5, e4, o5) {
    super(t3, i3, s5, e4, o5), this.type = 5;
  }
  _$AI(t3, i3 = this) {
    var s5;
    if ((t3 = null !== (s5 = S2(this, t3, i3, 0)) && void 0 !== s5 ? s5 : A) === T) return;
    const e4 = this._$AH, o5 = t3 === A && e4 !== A || t3.capture !== e4.capture || t3.once !== e4.once || t3.passive !== e4.passive, n5 = t3 !== A && (e4 === A || o5);
    o5 && this.element.removeEventListener(this.name, this, e4), n5 && this.element.addEventListener(this.name, this, t3), this._$AH = t3;
  }
  handleEvent(t3) {
    var i3, s5;
    "function" == typeof this._$AH ? this._$AH.call(null !== (s5 = null === (i3 = this.options) || void 0 === i3 ? void 0 : i3.host) && void 0 !== s5 ? s5 : this.element, t3) : this._$AH.handleEvent(t3);
  }
};
var Z = class {
  constructor(t3, i3, s5) {
    this.element = t3, this.type = 6, this._$AN = void 0, this._$AM = i3, this.options = s5;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t3) {
    S2(this, t3);
  }
};
var B = i2.litHtmlPolyfillSupport;
null == B || B(N, R), (null !== (t2 = i2.litHtmlVersions) && void 0 !== t2 ? t2 : i2.litHtmlVersions = []).push("2.8.0");
var D = (t3, i3, s5) => {
  var e4, o5;
  const n5 = null !== (e4 = null == s5 ? void 0 : s5.renderBefore) && void 0 !== e4 ? e4 : i3;
  let l4 = n5._$litPart$;
  if (void 0 === l4) {
    const t4 = null !== (o5 = null == s5 ? void 0 : s5.renderBefore) && void 0 !== o5 ? o5 : null;
    n5._$litPart$ = l4 = new R(i3.insertBefore(u2(), t4), t4, void 0, null != s5 ? s5 : {});
  }
  return l4._$AI(t3), l4;
};

// node_modules/lit-element/lit-element.js
var l3;
var o4;
var s4 = class extends u {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var t3, e4;
    const i3 = super.createRenderRoot();
    return null !== (t3 = (e4 = this.renderOptions).renderBefore) && void 0 !== t3 || (e4.renderBefore = i3.firstChild), i3;
  }
  update(t3) {
    const i3 = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t3), this._$Do = D(i3, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    var t3;
    super.connectedCallback(), null === (t3 = this._$Do) || void 0 === t3 || t3.setConnected(true);
  }
  disconnectedCallback() {
    var t3;
    super.disconnectedCallback(), null === (t3 = this._$Do) || void 0 === t3 || t3.setConnected(false);
  }
  render() {
    return T;
  }
};
s4.finalized = true, s4._$litElement$ = true, null === (l3 = globalThis.litElementHydrateSupport) || void 0 === l3 || l3.call(globalThis, { LitElement: s4 });
var n4 = globalThis.litElementPolyfillSupport;
null == n4 || n4({ LitElement: s4 });
(null !== (o4 = globalThis.litElementVersions) && void 0 !== o4 ? o4 : globalThis.litElementVersions = []).push("3.3.3");

// src/styles.js
var styles = i`
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
    `;

// src/item-list-card.js
var debounce = (fn, delay = 200) => {
  let timer;
  const debounced = function(...a3) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.call(this, ...a3), delay);
  };
  debounced.cancel = () => clearTimeout(timer);
  return debounced;
};
var showToast = (el, message) => {
  if (!el) return;
  el.dispatchEvent(new CustomEvent("hass-notification", {
    detail: { message },
    bubbles: true,
    composed: true
  }));
};
var confirmDialog = async (_el, text) => typeof window.confirm === "function" ? window.confirm(text) : false;
var callService = async (hass, domain, service, data, toastEl, fallbackMsg = "Fehler") => {
  try {
    await hass.callService(domain, service, data);
  } catch (err) {
    console.error(`Error calling ${domain}.${service}:`, err);
    showToast(toastEl, fallbackMsg);
    throw err;
  }
};
var highlightParts = (text, term) => {
  const src = String(text ?? "");
  const needle = String(term ?? "").trim();
  if (!needle) return [src];
  const tokens = needle.split(/\s+/).map((w2) => w2.trim()).filter(Boolean);
  if (!tokens.length) return [src];
  const lowSrc = src.toLowerCase();
  const sortedWords = Array.from(new Set(tokens.map((w2) => w2.toLowerCase()))).sort((a3, b2) => b2.length - a3.length);
  const getLongestAtIndex = (index) => {
    for (const low of sortedWords) {
      if (lowSrc.startsWith(low, index)) return low.length;
    }
    return 0;
  };
  const parts = [];
  let pos = 0;
  const N2 = src.length;
  while (pos < N2) {
    let minIndex = -1;
    for (const low of sortedWords) {
      const found = lowSrc.indexOf(low, pos);
      if (found === -1) continue;
      if (found === pos) {
        minIndex = pos;
        break;
      }
      if (minIndex === -1 || found < minIndex) {
        minIndex = found;
      }
    }
    if (minIndex === -1) {
      parts.push(src.slice(pos));
      break;
    }
    const matchLen = getLongestAtIndex(minIndex);
    if (minIndex > pos) {
      parts.push(src.slice(pos, minIndex));
    }
    const matchedText = src.slice(minIndex, minIndex + matchLen);
    parts.push(x`<span class="highlight">${matchedText}</span>`);
    pos = minIndex + matchLen;
  }
  return parts.length ? parts : [src];
};
var ItemListCard = class extends s4 {
  constructor() {
    super();
    __publicField(this, "_onInputKeydown", (e4) => {
      if (e4.key === "Enter") {
        const val = (e4.currentTarget?.value || "").trim();
        if (!val) return;
        if (this.config.hide_add_button) return;
        if (val.length > 3) this._addFilterTextToShoppingList();
      } else if (e4.key === "Escape") {
        const previous = this._filterValue;
        const value = "";
        this._filterValue = value;
        this.requestUpdate();
        this._setFilterService(previous, value);
      }
    });
    __publicField(this, "_addFilterTextToShoppingList", async () => {
      const raw = this._filterValue || "";
      const value = this._normalizeTodoText(raw);
      if (!value) return;
      const ok = await confirmDialog(this, `M\xF6chtest du "${value}" zur Einkaufsliste hinzuf\xFCgen?`);
      if (!ok) return;
      await callService(
        this.hass,
        "todo",
        "add_item",
        { entity_id: this.config.shopping_list_entity, item: value, description: "" },
        this,
        "Konnte '" + value + "' **nicht** zur Einkaufsliste hinzuf\xFCgen"
      );
    });
    __publicField(this, "_confirmAndComplete", async (item, sourceMap) => {
      const ok = await confirmDialog(this, `M\xF6chtest du "${item.s}" wirklich als erledigt markieren?`);
      if (!ok) return;
      this._updateOrCompleteItem(item.u, { status: "completed" }, item.c, sourceMap);
    });
    this._cachedItems = [];
    this._cachedSourceMap = {};
    this._filterValue = "";
    this._lastItemsHash = "";
    this._debouncedSetFilter = debounce((prev, val) => this._setFilterService(prev, val), 250);
    this._pendingUpdates = /* @__PURE__ */ new Set();
    this._displayLimit = void 0;
  }
  /**
   * Returns the maximum number of items to display when there is no filter
   * active. If not set in the config, defaults to 20.
   * @type {number}
   */
  get MAX_DISPLAY() {
    return this.config?.max_items_without_filter ?? 20;
  }
  /**
   * Returns the default maximum number of items to show when a filter is
   * active (initial display limit). Defaults to 50.
   */
  get MAX_WITH_FILTER() {
    return this.config?.max_items_with_filter ?? 50;
  }
  /**
   * Clean up debounced filter text update when this element is no longer in the DOM.
   * This ensures that any pending updates are cancelled and do not trigger after
   * the element is gone.
   */
  disconnectedCallback() {
    super.disconnectedCallback();
    this._debouncedSetFilter?.cancel?.();
  }
  /**
   * Sets the configuration for this element. Throws an error if the required
   * properties are not present in the config object.
   * @param {Object} config - The configuration object
   * @param {string} config.filter_items_entity - The entity ID of the Todo list
   *     to filter
   * @param {string} config.shopping_list_entity - The entity ID of the Todo list
   *     to add items to
   * @param {string} config.filter_entity - The entity ID of the input_text
   *     controlling the filter
   * @param {string} config.hash_entity - Entity providing a backend hash of items/source map (required).
   * @param {string} [config.title='ToDo List'] - The title to display in the
   *     card header
   * @param {boolean} [config.show_origin=false] - If true, show the origin of
   *     each item in the list
   * @param {boolean} [config.hide_add_button=false] - If true, hide the "Add"
   *     button at the bottom of the list
   * @param {number} [config.max_items_without_filter=20] - The maximum number of
   *     items to display when there is no filter active
   * @param {boolean} [config.highlight_matches=false] - If true, highlight the
   *     matches in the filter text
   * @param {Array<Object>} [config.filter_key_buttons=[]] - A list of key button
   *     definitions with the following properties:
   *     - `name`: The text to display in the button (fallback to `filter_key` if missing)
   *     - `filter_key`: The key to send to the filter input when the button is clicked
   *     - `icon`: The icon to display in the button (optional)
   */
  setConfig(config) {
    if (!config) throw new Error("Missing config");
    const required = ["filter_items_entity", "shopping_list_entity", "filter_entity", "hash_entity"];
    const missing = required.filter((k2) => !config[k2]);
    if (missing.length) {
      throw new Error(`Missing required config: ${missing.join(", ")}`);
    }
    this.config = {
      title: "ToDo List",
      show_origin: false,
      hide_add_button: false,
      highlight_matches: false,
      max_items_without_filter: 20,
      max_items_with_filter: 50,
      show_more_buttons: "",
      filter_key_buttons: [],
      disable_debounce: false,
      // Default to false (standard behavior)
      update_button_entity: "input_button.update_kellervorrate",
      ...config
    };
    this._debouncedSetFilter?.cancel?.();
    if (this.config.disable_debounce) {
      this._debouncedSetFilter = (prev, val) => this._setFilterService(prev, val);
      this._debouncedSetFilter.cancel = () => {
      };
    } else {
      this._debouncedSetFilter = debounce((prev, val) => this._setFilterService(prev, val), 250);
    }
  }
  /**
   * Returns the size of the card in "rows". The size is calculated as a base
   * size of 4 plus the minimum of the number of items in the list and 6.
   * @returns {number} The size of the card in "rows"
   */
  getCardSize() {
    const base = 4;
    return base + Math.min(this._cachedItems?.length || 0, 6);
  }
  /**
   * Adds a pending update to the list. This will cause the item with the given
   * `uid` to be re-rendered on the next update.
   * @param {string} uid The uid of the item to add to the pending updates
   * @private
   */
  _addPending(uid) {
    this._pendingUpdates = new Set(this._pendingUpdates);
    this._pendingUpdates.add(uid);
  }
  /**
   * Removes a pending update from the list. This will prevent the item with the
   * given `uid` from being re-rendered on the next update.
   * @param {string} uid The uid of the item to remove from the pending updates
   * @private
   */
  _removePending(uid) {
    const s5 = new Set(this._pendingUpdates);
    s5.delete(uid);
    this._pendingUpdates = s5;
  }
  /**
   * Decides whether or not to re-render the card based on changed properties.
   * @param {Map<string, unknown>} changedProps The changed properties
   * @returns {boolean} Whether the card should be re-rendered
   */
  shouldUpdate(changedProps) {
    if (!changedProps.has("hass")) return changedProps.size > 0;
    const hass = this.hass;
    if (!hass || !this.config) return true;
    const filterEntity = hass.states?.[this.config.filter_entity];
    const filterItemsEntity = hass.states?.[this.config.filter_items_entity];
    const hashEntity = hass.states?.[this.config.hash_entity];
    const oldHass = changedProps.get("hass");
    const prevRemote = oldHass?.states?.[this.config.filter_entity]?.state ?? "";
    const nextFilter = filterEntity?.state ?? "";
    if (nextFilter !== prevRemote && nextFilter !== this._filterValue) {
      this._filterValue = nextFilter;
      this._displayLimit = void 0;
      return true;
    }
    let itemsHash = String(hashEntity?.state ?? "");
    const lower = itemsHash.toLowerCase();
    if (!itemsHash || lower === "unknown" || lower === "unavailable") {
      itemsHash = "";
    }
    const fallbackHash = !itemsHash ? this._computeItemsFingerprint(filterItemsEntity) : null;
    const effectiveHash = fallbackHash ?? itemsHash;
    const changed = effectiveHash !== (this._lastItemsHash || "");
    if (changed) {
      this._displayLimit = void 0;
      const itemsAttr = filterItemsEntity?.attributes?.filtered_items;
      const nextItems = typeof itemsAttr === "string" ? this._safeParseJSON(itemsAttr, []) : Array.isArray(itemsAttr) ? itemsAttr : [];
      const mapAttr = filterItemsEntity?.attributes?.source_map;
      const nextMap = typeof mapAttr === "string" ? this._safeParseJSON(mapAttr, {}) : mapAttr && typeof mapAttr === "object" ? mapAttr : {};
      this._cachedItems = nextFilter.trim() ? nextItems.slice(0, this.MAX_WITH_FILTER) : nextItems.slice(0, this.MAX_DISPLAY);
      this._cachedSourceMap = nextMap;
      this._lastItemsHash = effectiveHash;
    }
    const oldCount = parseInt(oldHass?.states?.[this.config.filter_items_entity]?.state, 10) || 0;
    const newCount = parseInt(filterItemsEntity?.state, 10) || 0;
    const countChanged = oldCount !== newCount;
    return changed || countChanged;
  }
  /**
   * Tries to parse the given string as JSON and returns the result. If the
   * parsing fails, it returns the given fallback value instead.
   * @param {string} s The string to parse
   * @param {*} fallback The value to return if the parsing fails
   * @returns {*} The parsed JSON or the fallback value
   * @private
   */
  _safeParseJSON(s5, fallback) {
    try {
      return JSON.parse(s5);
    } catch {
      return fallback;
    }
  }
  /**
   * Computes a fingerprint (string) from the given entity that represents the
   * current state of the items (filtered_items) and their source map.
   * This fingerprint is used to detect changes in the items or source map.
   * @param {Object} entity The entity to compute the fingerprint for.
   * @returns {string|null} The computed fingerprint or null if the entity is null.
   * @private
   */
  _computeItemsFingerprint(entity) {
    if (!entity) return null;
    const itemsAttr = entity.attributes?.filtered_items;
    const itemsPart = typeof itemsAttr === "string" ? itemsAttr : JSON.stringify(itemsAttr ?? []);
    const mapAttr = entity.attributes?.source_map;
    const mapPart = typeof mapAttr === "string" ? mapAttr : JSON.stringify(mapAttr ?? {});
    return `${entity.state}|${itemsPart}|${mapPart}`;
  }
  /**
   * Returns true if the given string consists only of digits.
   * @param {string} str The string to check
   * @returns {boolean} Whether the string consists only of digits
   * @private
   */
  _isNumeric(str) {
    return typeof str === "string" && /^\d+$/.test(str);
  }
  /**
   * Handles a click on one of the filter key buttons. The value in the
   * input_text entity is updated immediately to the corresponding
   * "todo:<filterKey>" string. If the filterKey is falsy, nothing is done.
   * @param {string} [filterKey] The key to filter by
   * @private
   */
  _onFilterKeyButtonClick(filterKey) {
    if (!filterKey) return;
    const value = `todo:${String(filterKey)} `;
    const previous = this._filterValue;
    this._filterValue = value;
    this.requestUpdate();
    this._setFilterService(previous, value);
  }
  /**
   * Updates the value of the input_text entity specified in the config
   * (filter_entity) to the given value. If the value is falsy, the
   * filter text is cleared. If the value is the same as the current
   * value, nothing is done. If there is an error, it is logged to the
   * console.
   * @param {string} [value] The value to set the filter text to
   * @private
   */
  async _setFilterService(previous, value) {
    const entityId = this.config?.filter_entity;
    if (!entityId || !this.hass) {
      return;
    }
    const current = this.hass.states?.[entityId]?.state ?? "";
    const curRaw = String(current);
    const valRaw = String(value ?? "");
    if (curRaw === valRaw) return;
    try {
      await callService(
        this.hass,
        "input_text",
        "set_value",
        { entity_id: entityId, value: value ?? "" },
        this,
        "Fehler beim Aktualisieren des Suchfeldes"
      );
    } catch (err) {
      console.error("Error in _setFilterService:", err);
      this._filterValue = previous;
      this.requestUpdate();
    }
  }
  /**
   * Clears the filter text completely if there is no token in the current filter text
   * that matches the pattern "todo:<filterKey>" or if the only token is exactly
   * "todo:<filterKey>". If there is a token like "todo:<filterKey>" present, only
   * this token is preserved and the rest of the text is cleared. This is useful
   * when the user clicks on the "clear filter" button and we want to keep the
   * currently selected filter key.
   * @private
   */
  _clearFilterPreservingTodoKey() {
    try {
      const entityId = this.config?.filter_entity;
      const current = this.hass?.states?.[entityId]?.state ?? "";
      const trimmed = String(current).trim();
      if (!trimmed) {
        const previous2 = this._filterValue;
        const value2 = "";
        this._filterValue = value2;
        this.requestUpdate();
        this._setFilterService(previous2, value2);
        return;
      }
      const tokens = trimmed.split(/\s+/).filter(Boolean);
      const todoTokenIndex = tokens.findIndex((t3) => /^todo:[^\s]+$/.test(t3));
      if (todoTokenIndex === -1) {
        const previous2 = this._filterValue;
        const value2 = "";
        this._filterValue = value2;
        this.requestUpdate();
        this._setFilterService(previous2, value2);
        return;
      }
      if (tokens.length === 1) {
        const previous2 = this._filterValue;
        const value2 = "";
        this._filterValue = value2;
        this.requestUpdate();
        this._setFilterService(previous2, value2);
        return;
      }
      const preserved = tokens[todoTokenIndex];
      const previous = this._filterValue;
      const value = preserved + " ";
      this._filterValue = value;
      this.requestUpdate();
      this._setFilterService(previous, value);
    } catch (err) {
      console.error("Error while clearing filter:", err);
      const prev = this._filterValue;
      const val = "";
      this._filterValue = val;
      this.requestUpdate();
      this._setFilterService(prev, val);
    }
  }
  /**
   * Handles the input event of the filter input field by calling the
   * debounced version of `_updateFilterTextActual` with the current value
   * of the input field. This is necessary because the input event is
   * triggered on every key press, but we don't want to update the filter
   * on every key press, but only after the user has stopped typing for
   * a short period of time.
   * @private
   * @param {Event} e - The input event.
   */
  _handleFilterInputChange(e4) {
    const newValue = e4.target.value;
    if (newValue !== this._filterValue) {
      const previous = this._filterValue;
      this._filterValue = newValue;
      this.requestUpdate();
      this._debouncedSetFilter(previous, newValue);
    }
  }
  /**
   * Normalize the given text by removing any leading "todo:" prefix and
   * trimming the resulting string. If the text does not start with "todo:"
   * or if it is empty, it is returned as-is.
   * @param {string} raw - The text to normalize.
   * @returns {string} The normalized text.
   * @private
   */
  _normalizeTodoText(raw) {
    let value = (raw || "").trim();
    if (!value) return "";
    if (value.startsWith("todo:")) {
      const parts = value.split(" ");
      if (parts.length > 1) {
        parts.shift();
        value = parts.join(" ");
      } else {
        return "";
      }
    }
    return value;
  }
  /**
   * Updates an item in the given todo list, identified by the given `uid`.
   * The `updates` object contains the new values for the item, such as a new
   * description or a new completed state.
   * If the item is updated successfully, the cached item description is
   * updated immediately to reflect the new state.
   * If the update fails, the cached item description is reverted to its
   * previous value.
   * @param {string} uid - The unique id of the item to update.
   * @param {Object} updates - The new values for the item.
   * @param {number} source - The source of the item to update.
   * @param {Object} sourceMap - A map of source numbers to the
   * corresponding todo list entity ids.
   * @returns {Promise<void>} A promise that resolves when the update is
   * done, or rejects if the update fails.
   * @private
   */
  async _updateOrCompleteItem(uid, updates, source, sourceMap) {
    const entityId = sourceMap?.[String(source)]?.entity_id;
    if (!entityId) {
      console.error("No valid todo entity id for source:", source);
      return;
    }
    const data = {
      entity_id: entityId,
      item: uid,
      ...updates
    };
    let newDesc;
    if (updates.description !== void 0) {
      let desc = parseInt(updates.description, 10);
      if (isNaN(desc) || desc < 0) desc = 0;
      data.description = String(desc);
      newDesc = String(desc);
    }
    let previousDesc = null;
    if (newDesc !== void 0 && Array.isArray(this._cachedItems)) {
      const idx = this._cachedItems.findIndex((it) => String(it.u) === String(uid));
      if (idx >= 0) {
        const newItems = this._cachedItems.slice();
        previousDesc = newItems[idx].d;
        newItems[idx] = { ...newItems[idx], d: newDesc };
        this._cachedItems = newItems;
      }
    }
    this._addPending(uid);
    try {
      await callService(
        this.hass,
        "todo",
        "update_item",
        data,
        this,
        "Fehler beim Aktualisieren des Eintrags"
      );
      console.error("update_button_entity:", this.config.update_button_entity);
      console.error("updates.description:", updates.description);
      console.error("Update button pressed");
      await callService(
        this.hass,
        "input_button",
        "press",
        { entity_id: this.config.update_button_entity },
        this,
        "Fehler beim Aktualisieren des Backend-Sensors"
      );
    } catch (err) {
      console.error("todo/update_item:", err);
      if (previousDesc !== null && Array.isArray(this._cachedItems)) {
        const idx = this._cachedItems.findIndex((it) => String(it.u) === String(uid));
        if (idx >= 0) {
          const newItems = this._cachedItems.slice();
          newItems[idx] = { ...newItems[idx], d: previousDesc };
          this._cachedItems = newItems;
        }
      }
    } finally {
      this._removePending(uid);
    }
  }
  /**
   * Adds an item to the shopping list if the user confirms the dialog
   * @param {Object} item The todo item to add
   * @private
   */
  _addToShoppingList(item) {
    const entityId = this.config.shopping_list_entity;
    if (!entityId) {
      console.error("No valid shopping list entity id configured");
      return;
    }
    (async () => {
      const ok = await confirmDialog(this, `M\xF6chtest du "${item.s}" zur Einkaufsliste hinzuf\xFCgen?`);
      if (!ok) return;
      await callService(
        this.hass,
        "todo",
        "add_item",
        { entity_id: entityId, item: item.s, description: "" },
        this,
        "Einkaufsliste aktualisieren fehlgeschlagen"
      );
    })();
  }
  /**
   * Renders the quantity controls for a given todo item, which can be an
   * increment/decrement button pair if the item's description is a numeric
   * string, or just a plain text display if it's not.
   * @param {Object} item The todo item to render.
   * @param {Object} sourceMap A map of source numbers to the corresponding
   * todo list entity ids.
   * @returns {TemplateResult} The rendered quantity controls.
   * @private
   */
  _renderQuantityControls(item, sourceMap) {
    let qStr = String(item.d.trim() ?? "");
    if (qStr === "") qStr = "1";
    if (!this._isNumeric(qStr)) {
      return x`<div class="quantity" title="Menge">${qStr}</div>`;
    }
    const quantity = parseInt(qStr, 10);
    const pending = this._pendingUpdates.has(item.u);
    const dec = () => {
      if (pending) return;
      this._updateOrCompleteItem(item.u, { description: Math.max(quantity - 1, 0) }, item.c, sourceMap);
    };
    const inc = () => {
      if (pending) return;
      this._updateOrCompleteItem(item.u, { description: quantity + 1 }, item.c, sourceMap);
    };
    return x`
      ${quantity > 1 ? x`<button class="btn" type="button" title="Verringern" aria-label="Verringern"
                      ?disabled=${pending}
                      @click=${dec}><ha-icon icon="mdi:minus-circle-outline"></ha-icon></button>` : ""}
      <div class="quantity" title="Menge">
        ${pending ? x`<span class="loading-icon" aria-hidden="true"><ha-icon icon="mdi:loading"></ha-icon></span>` : quantity}
      </div>
      <button class="btn" type="button" title="Erhöhen" aria-label="Erhöhen"
              ?disabled=${pending}
              @click=${inc}><ha-icon icon="mdi:plus-circle-outline"></ha-icon></button>
    `;
  }
  /**
   * Renders a single todo item row with quantity controls and a button to add
   * the item to the shopping list. If the item is part of a list that has an
   * origin (i.e. a sourceMap), it will also display the origin's friendly name
   * as a sub-label below the item summary. If the item's description is a
   * numeric string, it will be rendered as a quantity control. If the item's
   * description is not numeric, it will be rendered as plain text.
   * @param {Object} item The todo item to render.
   * @param {Object} sourceMap A map of source numbers to the corresponding
   * todo list entity ids.
   * @returns {TemplateResult} The rendered item row.
   * @private
   */
  _renderItemRow(item, sourceMap) {
    const showOrigin = !!this.config?.show_origin;
    const friendlyName = showOrigin ? sourceMap?.[String(item.c)]?.friendly_name : null;
    const search = this._normalizeTodoText(this._filterValue);
    const showHighlight = Boolean(search && this.config.highlight_matches);
    const contentParts = showHighlight ? highlightParts(item.s, search) : [String(item.s ?? "")];
    return x`
        <div class="item-row" role="listitem">
          <div class="item-summary" title=${item.s}>
            ${contentParts}
            ${friendlyName ? x`<div class="item-sublabel">${friendlyName}</div>` : ""}
          </div>
          <div class="item-controls">
            ${this._renderQuantityControls(item, sourceMap)}
            <button class="btn" type="button" title="Zur Einkaufsliste" aria-label="Zur Einkaufsliste" @click=${() => this._addToShoppingList(item)}>
              <ha-icon icon="mdi:cart-outline"></ha-icon>
            </button>
            <button class="btn" type="button" title="Erledigt" aria-label="Erledigt" @click=${() => this._confirmAndComplete(item, this._cachedSourceMap)}>
              <ha-icon icon="mdi:delete-outline"></ha-icon>
            </button>
          </div>
        </div>
      `;
  }
  /**
   * Increases the display limit of the list by the given amount.
   * @param {number|string|undefined} option - Number of items to add to the
   *   display limit, or a string that can be parsed as a number. If `'all'` or
   *   `'rest'`, the list will show all items. If `undefined`, the default is
   *   10. If any other value, the default is 10.
   * @private
   */
  _showMore(option) {
    const items = this._fullItemsList || this._cachedItems || [];
    if (this._displayLimit === void 0 || this._displayLimit === null) {
      this._displayLimit = this._filterValue?.trim() ? this.MAX_WITH_FILTER : this.MAX_DISPLAY;
    }
    let newLimit = this._displayLimit;
    if (typeof option === "string") {
      const lower = option.toLowerCase().trim();
      if (lower === "all" || lower === "rest") {
        newLimit = items.length;
      } else {
        const parsed = Number(option);
        if (Number.isFinite(parsed) && parsed > 0) {
          newLimit = Math.min(this._displayLimit + Math.floor(parsed), items.length);
        } else {
          newLimit = Math.min(this._displayLimit + 10, items.length);
        }
      }
    } else if (typeof option === "number") {
      if (Number.isFinite(option) && option > 0) {
        newLimit = Math.min(this._displayLimit + Math.floor(option), items.length);
      } else {
        newLimit = Math.min(this._displayLimit + 10, items.length);
      }
    } else if (typeof option === "undefined") {
      newLimit = Math.min(this._displayLimit + 10, items.length);
    } else {
      newLimit = Math.min(this._displayLimit + 10, items.length);
    }
    this._displayLimit = newLimit;
    this._cachedItems = items.slice(0, this._displayLimit);
  }
  /**
   * Parse the comma separated config string this.config.show_more_buttons
   * into an array of positive integers (deduplicated and sorted ascending).
   * Returns [] when none available.
   * @returns {number[]}
   * @private
   */
  _parseShowMoreButtons() {
    const raw = String(this.config?.show_more_buttons ?? "").trim();
    if (!raw) return [];
    const parts = raw.split(",").map((s5) => s5.trim()).filter(Boolean);
    const nums = parts.map((p2) => {
      const n5 = Number(p2);
      return Number.isFinite(n5) && n5 > 0 ? Math.floor(n5) : null;
    }).filter((n5) => n5 !== null);
    return Array.from(new Set(nums)).sort((a3, b2) => a3 - b2);
  }
  /**
   * Renders the card content.
   * @returns {TemplateResult} The rendered content.
   * @private
   */
  render() {
    if (!this.hass) {
      return x`<ha-card><div class="empty-state">Home Assistant context not available</div></ha-card>`;
    }
    const itemsEntity = this.hass.states[this.config.filter_items_entity];
    if (!itemsEntity) {
      return x`<ha-card><div class="empty-state">Entity '${this.config.filter_items_entity}' not found</div></ha-card>`;
    }
    const filterValue = this._filterValue ?? "";
    const showAddButton = filterValue.trim().length > 3 && !this.config.hide_add_button;
    if (!this._lastItemsHash) {
      const attr = itemsEntity.attributes.filtered_items;
      const items = typeof attr === "string" ? this._safeParseJSON(attr, []) : Array.isArray(attr) ? attr : [];
      this._fullItemsList = items;
      if (this._displayLimit === void 0 || this._displayLimit === null) {
        this._displayLimit = filterValue.trim() ? this.MAX_WITH_FILTER : this.MAX_DISPLAY;
      }
      this._cachedItems = items.slice(0, this._displayLimit);
      const mapAttr = itemsEntity.attributes.source_map;
      this._cachedSourceMap = typeof mapAttr === "string" ? this._safeParseJSON(mapAttr, {}) : mapAttr && typeof mapAttr === "object" ? mapAttr : {};
      const hashEntity = this.hass.states?.[this.config.hash_entity];
      let extHash = String(hashEntity?.state ?? "");
      const low = extHash.toLowerCase();
      if (!extHash || low === "unknown" || low === "unavailable") extHash = "";
      let localFp = "";
      if (!extHash) {
        localFp = this._computeItemsFingerprint(itemsEntity) || "";
      }
      this._lastItemsHash = extHash || localFp;
    }
    {
      const attr = itemsEntity.attributes.filtered_items;
      const items = typeof attr === "string" ? this._safeParseJSON(attr, []) : Array.isArray(attr) ? attr : [];
      this._fullItemsList = items;
      if (filterValue.trim()) {
        if (this._displayLimit === void 0 || this._displayLimit === null) {
          this._displayLimit = this.MAX_WITH_FILTER;
        }
        this._cachedItems = items.slice(0, this._displayLimit);
      } else {
        if (this._displayLimit === void 0 || this._displayLimit === null) {
          this._displayLimit = this.MAX_DISPLAY;
        }
        this._cachedItems = items.slice(0, this._displayLimit);
      }
    }
    const totalItemsCount = parseInt(itemsEntity?.state, 10) || 0;
    const displayedItems = this._cachedItems || [];
    const displayedCount = displayedItems.length;
    const remaining = Math.max(0, totalItemsCount - displayedCount);
    return x`
      <ha-card>
        <div class="card-header">
          <div class="card-title">${this.config.title || "ToDo List"}</div>
          <div class="count-badge" title="Gesamtanzahl Einträge">${totalItemsCount}</div>
        </div>
        <div class="input-row">
          <input
            type="text"
            .value=${filterValue}
            placeholder="Tippe einen Suchfilter ein"
            @input=${this._handleFilterInputChange}
            @keydown=${this._onInputKeydown}
            aria-label="Filter"
          />
          <button
            class="btn ${!filterValue ? "hidden" : ""}"
            type="button"
            @click=${() => this._clearFilterPreservingTodoKey()}
            title="Eingabe leeren"
            aria-label="Eingabe leeren"
          >
            <ha-icon icon="mdi:close-circle-outline"></ha-icon>
          </button>
          <button
            class="btn ${!showAddButton ? "hidden" : ""}"
            type="button"
            @click=${this._addFilterTextToShoppingList}
            title="Zur Einkaufsliste hinzufügen"
            aria-label="Zur Einkaufsliste hinzufügen"
          >
            <ha-icon icon="mdi:cart-plus"></ha-icon>
          </button>
        </div>
        
        ${Array.isArray(this.config.filter_key_buttons) && this.config.filter_key_buttons.length ? x`<div class="key-buttons" role="toolbar" aria-label="Schnellfilter">
              ${this.config.filter_key_buttons.map((btn) => {
      const label = btn.name || btn.filter_key || "";
      const icon = typeof btn.icon === "string" && /^mdi:[\w-]+$/.test(btn.icon) ? btn.icon : null;
      const fk = btn.filter_key || "";
      return x`
                  <button
                    class="key-btn"
                    type="button"
                    title=${label}
                    aria-label=${label}
                    @click=${() => this._onFilterKeyButtonClick(fk)}
                  >
                    ${icon ? x`<ha-icon .icon=${icon}></ha-icon>` : x`${label}`}
                  </button>
                `;
    })}
            </div>` : ""}


        ${filterValue.trim() ? x`<div class="info" aria-live="polite">Filter: "${filterValue.trim()}" → ${(this._fullItemsList || []).length} Treffer</div>` : totalItemsCount > (this.config.max_items_without_filter ?? 20) ? x`<div class="info" aria-live="polite">${displayedCount} von ${totalItemsCount} Einträgen</div>` : ""}

        ${displayedCount === 0 ? x`<div class="empty-state" aria-live="polite">Keine Ergebnisse gefunden</div>` : x`<div role="list" aria-label="Trefferliste">${displayedItems.map((item) => this._renderItemRow(item, this._cachedSourceMap))}</div>`}

        ${this._fullItemsList && this._fullItemsList.length > (displayedItems?.length || 0) ? (() => {
      const remaining2 = Math.max(0, this._fullItemsList.length - displayedItems.length);
      const configured = this._parseShowMoreButtons();
      return x`
                <div class="key-buttons" role="group" aria-label="Mehr anzeigen Optionen">
                  ${configured.length ? configured.map(
        (n5) => x`
                          <button
                            class="key-btn"
                            type="button"
                            title="Mehr anzeigen ${n5}"
                            ?disabled=${n5 > remaining2}
                            @click=${() => this._showMore(n5)}
                          >
                            +${n5}
                          </button>
                        `
      ) : ""}
        
                  <button
                    class="key-btn"
                    type="button"
                    title="Alles anzeigen"
                    @click=${() => this._showMore("all")}
                  >
                    Alle (${remaining2})
                  </button>
                </div>
              `;
    })() : ""}
      
          </ha-card>
    `;
  }
  // Optional: Lovelace UI editor support
  static getConfigElement() {
    return null;
  }
  /**
   * Provides a default configuration stub for the editor to use when not
   * given a real configuration.
   *
   * @return {Object} A configuration stub with default values.
   */
  static getStubConfig() {
    return {
      title: "ToDo List",
      filter_items_entity: "sensor.todo_filtered_items",
      hash_entity: "sensor.todo_hash",
      shopping_list_entity: "todo.shopping_list",
      filter_entity: "input_text.todo_filter"
    };
  }
};
__publicField(ItemListCard, "properties", {
  hass: {},
  config: {},
  _cachedItems: { state: true },
  _cachedSourceMap: { state: true },
  _displayLimit: { state: true },
  _filterValue: { state: true },
  _pendingUpdates: { state: true },
  _lastItemsHash: { state: false }
});
__publicField(ItemListCard, "styles", styles);
if (!customElements.get("item-list-card")) {
  customElements.define("item-list-card", ItemListCard);
}
/*! Bundled license information:

@lit/reactive-element/css-tag.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/reactive-element.js:
lit-html/lit-html.js:
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
