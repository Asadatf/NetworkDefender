var e, t;
(e = void 0),
  (t = function () {
    const e = {
        id: ["id", void 0],
        text: ["value", void 0],
        maxLength: ["maxLength", void 0],
        minLength: ["minLength", void 0],
        placeholder: ["placeholder", void 0],
        tooltip: ["title", void 0],
        readOnly: ["readOnly", !1],
        spellCheck: ["spellcheck", !1],
        autoComplete: ["autocomplete", "off"],
      },
      t = {
        align: ["textAlign", void 0],
        paddingLeft: ["padding-left", void 0],
        paddingRight: ["padding-right", void 0],
        paddingTop: ["padding-top", void 0],
        paddingBottom: ["padding-bottom", void 0],
        fontFamily: ["fontFamily", void 0],
        fontSize: ["font-size", void 0],
        color: ["color", "#ffffff"],
        backgroundColor: ["backgroundColor", "transparent"],
        border: ["border", 0],
        borderColor: ["borderColor", "transparent"],
        borderRadius: ["border-radius", void 0],
        outline: ["outline", "none"],
        direction: ["direction", void 0],
      },
      o = {
        input: "textchange",
        click: "click",
        dblclick: "dblclick",
        mousedown: "pointerdown",
        mousemove: "pointermove",
        mouseup: "pointerup",
        touchstart: "pointerdown",
        touchmove: "pointermove",
        touchend: "pointerup",
        keydown: "keydown",
        keyup: "keyup",
        keypress: "keypress",
        compositionstart: "compositionStart",
        compositionend: "compositionEnd",
        compositionupdate: "compositionUpdate",
        focus: "focus",
        blur: "blur",
        select: "select",
      },
      n = Phaser.Utils.Objects.GetValue;
    var i = function (e, t, o) {
      var i, s;
      for (var r in (void 0 === o && (o = {}), e))
        (i = e[r]), void 0 !== (s = n(t, r, i[1])) && (o[i[0]] = s);
      return o;
    };
    const s = Phaser.Utils.Objects.GetValue;
    var r = function (e) {
      e.stopPropagation();
    };
    const d = Phaser.GameObjects.DOMElement,
      l = Phaser.Utils.Objects.IsPlainObject,
      h = Phaser.Utils.Objects.GetValue;
    class a extends d {
      constructor(n, d, a, u, c, p) {
        var g;
        l(d)
          ? ((d = h((p = d), "x", 0)),
            (a = h(p, "y", 0)),
            (u = h(p, "width", 0)),
            (c = h(p, "height", 0)))
          : l(u) && ((u = h((p = u), "width", 0)), (c = h(p, "height", 0))),
          void 0 === p && (p = {});
        var v = h(p, "inputType", void 0);
        void 0 === v && (v = h(p, "type", "text")),
          "textarea" === v
            ? ((g = document.createElement("textarea")).style.resize = "none")
            : ((g = document.createElement("input")).type = v),
          i(e, p, g);
        var f = h(p, "style", void 0);
        f = i(t, p, f);
        var m = g.style;
        for (var y in p) y in e || y in t || (y in m && (f[y] = p[y]));
        (f["box-sizing"] = "border-box"),
          super(n, d, a, g, f),
          (this.type = "rexInputText"),
          this.resize(u, c),
          (function (e, t, o, n) {
            var i = s(n, "preventDefault", !1),
              r = s(n, "preTest");
            for (let n in o)
              t.addEventListener(n, function (t) {
                (r && !r(e, n)) || e.emit(o[n], e, t), i && t.preventDefault();
              });
          })(this, g, o),
          (function (e) {
            e.addEventListener("touchstart", r, !1),
              e.addEventListener("touchmove", r, !1),
              e.addEventListener("touchend", r, !1),
              e.addEventListener("mousedown", r, !1),
              e.addEventListener("mouseup", r, !1),
              e.addEventListener("mousemove", r, !1);
          })(g),
          h(p, "selectAll", !1) && this.selectAll(),
          (this._isFocused = !1),
          this.on(
            "focus",
            function () {
              this._isFocused = !0;
            },
            this
          ).on(
            "blur",
            function () {
              this._isFocused = !1;
            },
            this
          );
      }
      get inputType() {
        return "textarea" === this.node.tagName.toLowerCase()
          ? "textarea"
          : this.node.type;
      }
      get text() {
        return this.node.value;
      }
      set text(e) {
        this.node.value = e;
      }
      setText(e) {
        return (this.text = e), this;
      }
      get maxLength() {
        return this.node.maxLength;
      }
      set maxLength(e) {
        this.node.maxLength = e;
      }
      setMaxLength(e) {
        return (this.maxLength = e), this;
      }
      get minLength() {
        return this.node.minLength;
      }
      set minLength(e) {
        this.node.minLength = e;
      }
      setMinLength(e) {
        return (this.minLength = e), this;
      }
      get placeholder() {
        return this.node.placeholder;
      }
      set placeholder(e) {
        this.node.placeholder = e;
      }
      setPlaceholder(e) {
        return (this.placeholder = e), this;
      }
      selectText(e, t) {
        return (
          void 0 === e ? this.node.select() : this.node.setSelectionRange(e, t),
          this
        );
      }
      selectAll() {
        return this.selectText(), this;
      }
      get selectionStart() {
        return this.node.selectionStart;
      }
      get selectionEnd() {
        return this.node.selectionEnd;
      }
      get selectedText() {
        var e = this.node;
        return e.value.substring(e.selectionStart, e.selectionEnd);
      }
      get cursorPosition() {
        return this.node.selectionStart;
      }
      set cursorPosition(e) {
        this.node.setSelectionRange(e, e);
      }
      setCursorPosition(e) {
        return (
          void 0 === e
            ? (e = this.text.length)
            : e < 0 && (e = this.text.length + e),
          (this.cursorPosition = e),
          this
        );
      }
      get tooltip() {
        return this.node.title;
      }
      set tooltip(e) {
        this.node.title = e;
      }
      setTooltip(e) {
        return (this.tooltip = e), this;
      }
      setTextChangedCallback(e) {
        return (this.onTextChanged = e), this;
      }
      get readOnly() {
        return this.node.readOnly;
      }
      set readOnly(e) {
        this.node.readOnly = e;
      }
      setReadOnly(e) {
        return void 0 === e && (e = !0), (this.readOnly = e), this;
      }
      get spellCheck() {
        return this.node.spellcheck;
      }
      set spellCheck(e) {
        this.node.spellcheck = e;
      }
      setSpellCheck(e) {
        return (this.spellCheck = e), this;
      }
      get fontColor() {
        return this.node.style.color;
      }
      set fontColor(e) {
        this.node.style.color = e;
      }
      setFontColor(e) {
        return (this.fontColor = e), this;
      }
      setStyle(e, t) {
        return (this.node.style[e] = t), this;
      }
      getStyle(e) {
        return this.node.style[e];
      }
      scrollToBottom() {
        return (this.node.scrollTop = this.node.scrollHeight), this;
      }
      setEnabled(e) {
        return void 0 === e && (e = !0), (this.node.disabled = !e), this;
      }
      setBlur() {
        return this.node.blur(), this;
      }
      setFocus() {
        return this.node.focus(), this;
      }
      get isFocused() {
        return this._isFocused;
      }
    }
    var u = {
      resize: function (e, t) {
        if (
          (this.scene.sys.scale.autoRound &&
            ((e = Math.floor(e)), (t = Math.floor(t))),
          this.width === e && this.height === t)
        )
          return this;
        var o = this.node.style;
        return (
          (o.width = `${e}px`), (o.height = `${t}px`), this.updateSize(), this
        );
      },
    };
    function c(e, t, o, n, i) {
      var s = new a(this.scene, e, t, o, n, i);
      return this.scene.add.existing(s), s;
    }
    Object.assign(a.prototype, u);
    const p = Phaser.Utils.Objects.GetAdvancedValue,
      g = Phaser.GameObjects.BuildGameObject;
    function v(e, t) {
      void 0 === e && (e = {}), void 0 !== t && (e.add = t);
      var o = p(e, "width", void 0),
        n = p(e, "height", void 0),
        i = new a(this.scene, 0, 0, o, n, e);
      return g(this.scene, i, e), i;
    }
    var f = function (e) {
      return null == e || "" === e || 0 === e.length;
    };
    class m extends Phaser.Plugins.BasePlugin {
      constructor(e) {
        super(e), e.registerGameObject("rexInputText", c, v);
      }
      start() {
        this.game.events.on("destroy", this.destroy, this);
      }
    }
    return (
      (function (e, t, o, n) {
        if ((void 0 === n && (n = "."), "object" == typeof e))
          if (f(t)) {
            if (null == o) return;
            "object" == typeof o && (e = o);
          } else {
            "string" == typeof t && (t = t.split(n));
            var i = t.pop(),
              s = (function (e, t, o) {
                var n = e;
                if (f(t));
                else {
                  var i;
                  "string" == typeof t && (t = t.split("."));
                  for (var s = 0, r = t.length; s < r; s++) {
                    var d;
                    (null != n[(i = t[s])] && "object" == typeof n[i]) ||
                      ((d = s === r - 1 ? (void 0 === o ? {} : o) : {}),
                      (n[i] = d)),
                      (n = n[i]);
                  }
                }
                return n;
              })(e, t);
            s[i] = o;
          }
      })(window, "RexPlugins.GameObjects.InputText", a),
      m
    );
  }),
  "object" == typeof exports && "undefined" != typeof module
    ? (module.exports = t())
    : "function" == typeof define && define.amd
    ? define(t)
    : ((e =
        "undefined" != typeof globalThis
          ? globalThis
          : e || self).rexinputtextplugin = t());
