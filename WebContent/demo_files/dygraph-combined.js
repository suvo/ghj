DygraphLayout = function (b, a) {
    this.dygraph_ = b;
    this.options = {};
    Dygraph.update(this.options, a ? a : {});
    this.datasets = new Array();
    this.annotations = new Array()
};
DygraphLayout.prototype.attr_ = function (a) {
    return this.dygraph_.attr_(a)
};
DygraphLayout.prototype.addDataset = function (a, b) {
    this.datasets[a] = b
};
DygraphLayout.prototype.setAnnotations = function (d) {
    this.annotations = [];
    var e = this.attr_("xValueParser");
    for (var c = 0; c < d.length; c++) {
        var b = {};
        if (!d[c].xval && !d[c].x) {
            this.dygraph_.error("Annotations must have an 'x' property");
            return
        }
        if (d[c].icon && !(d[c].hasOwnProperty("width") && d[c].hasOwnProperty("height"))) {
            this.dygraph_.error("Must set width and height when setting annotation.icon property");
            return
        }
        Dygraph.update(b, d[c]);
        if (!b.xval) {
            b.xval = e(b.x)
        }
        this.annotations.push(b)
    }
};
DygraphLayout.prototype.evaluate = function () {
    this._evaluateLimits();
    this._evaluateLineCharts();
    this._evaluateLineTicks();
    this._evaluateAnnotations()
};
DygraphLayout.prototype._evaluateLimits = function () {
    this.minxval = this.maxxval = null;
    if (this.options.dateWindow) {
        this.minxval = this.options.dateWindow[0];
        this.maxxval = this.options.dateWindow[1]
    } else {
        for (var c in this.datasets) {
            if (!this.datasets.hasOwnProperty(c)) {
                continue
            }
            var e = this.datasets[c];
            if (e.length > 1) {
                var b = e[0][0];
                if (!this.minxval || b < this.minxval) {
                    this.minxval = b
                }
                var a = e[e.length - 1][0];
                if (!this.maxxval || a > this.maxxval) {
                    this.maxxval = a
                }
            }
        }
    }
    this.xrange = this.maxxval - this.minxval;
    this.xscale = (this.xrange != 0 ? 1 / this.xrange : 1);
    for (var d = 0; d < this.options.yAxes.length; d++) {
        var f = this.options.yAxes[d];
        f.minyval = f.computedValueRange[0];
        f.maxyval = f.computedValueRange[1];
        f.yrange = f.maxyval - f.minyval;
        f.yscale = (f.yrange != 0 ? 1 / f.yrange : 1)
    }
};
DygraphLayout.prototype._evaluateLineCharts = function () {
    this.points = new Array();
    for (var f in this.datasets) {
        if (!this.datasets.hasOwnProperty(f)) {
            continue
        }
        var e = this.datasets[f];
        var c = this.options.yAxes[this.options.seriesToAxisMap[f]];
        for (var b = 0; b < e.length; b++) {
            var d = e[b];
            var a = {
                x: ((parseFloat(d[0]) - this.minxval) * this.xscale),
                y: 1 - ((parseFloat(d[1]) - c.minyval) * c.yscale),
                xval: parseFloat(d[0]),
                yval: parseFloat(d[1]),
                name: f
            };
            this.points.push(a)
        }
    }
};
DygraphLayout.prototype._evaluateLineTicks = function () {
    this.xticks = new Array();
    for (var d = 0; d < this.options.xTicks.length; d++) {
        var c = this.options.xTicks[d];
        var b = c.label;
        var f = this.xscale * (c.v - this.minxval);
        if ((f >= 0) && (f <= 1)) {
            this.xticks.push([f, b])
        }
    }
    this.yticks = new Array();
    for (var d = 0; d < this.options.yAxes.length; d++) {
        var e = this.options.yAxes[d];
        for (var a = 0; a < e.ticks.length; a++) {
            var c = e.ticks[a];
            var b = c.label;
            var f = 1 - (e.yscale * (c.v - e.minyval));
            if ((f >= 0) && (f <= 1)) {
                this.yticks.push([d, f, b])
            }
        }
    }
};
DygraphLayout.prototype.evaluateWithError = function () {
    this.evaluate();
    if (!this.options.errorBars) {
        return
    }
    var d = 0;
    for (var g in this.datasets) {
        if (!this.datasets.hasOwnProperty(g)) {
            continue
        }
        var c = 0;
        var f = this.datasets[g];
        for (var c = 0; c < f.length; c++, d++) {
            var e = f[c];
            var a = parseFloat(e[0]);
            var b = parseFloat(e[1]);
            if (a == this.points[d].xval && b == this.points[d].yval) {
                this.points[d].errorMinus = parseFloat(e[2]);
                this.points[d].errorPlus = parseFloat(e[3])
            }
        }
    }
};
DygraphLayout.prototype._evaluateAnnotations = function () {
    var f = {};
    for (var d = 0; d < this.annotations.length; d++) {
        var b = this.annotations[d];
        f[b.xval + "," + b.series] = b
    }
    this.annotated_points = [];
    for (var d = 0; d < this.points.length; d++) {
        var e = this.points[d];
        var c = e.xval + "," + e.name;
        if (c in f) {
            e.annotation = f[c];
            this.annotated_points.push(e)
        }
    }
};
DygraphLayout.prototype.removeAllDatasets = function () {
    delete this.datasets;
    this.datasets = new Array()
};
DygraphLayout.prototype.updateOptions = function (a) {
    Dygraph.update(this.options, a ? a : {})
};
DygraphLayout.prototype.unstackPointAtIndex = function (b) {
    var a = this.points[b];
    var d = {};
    for (var c in a) {
        d[c] = a[c]
    }
    if (!this.attr_("stackedGraph")) {
        return d
    }
    for (var c = b + 1; c < this.points.length; c++) {
        if (this.points[c].xval == a.xval) {
            d.yval -= this.points[c].yval;
            break
        }
    }
    return d
};
DygraphCanvasRenderer = function (d, c, e, b) {
    this.dygraph_ = d;
    this.options = {
        strokeWidth: 0.5,
        drawXAxis: true,
        drawYAxis: true,
        axisLineColor: "black",
        axisLineWidth: 0.5,
        axisTickSize: 3,
        axisLabelColor: "black",
        axisLabelFont: "Arial",
        axisLabelFontSize: 9,
        axisLabelWidth: 50,
        drawYGrid: true,
        drawXGrid: true,
        gridLineColor: "rgb(128,128,128)",
        fillAlpha: 0.15,
        underlayCallback: null
    };
    Dygraph.update(this.options, b);
    this.layout = e;
    this.element = c;
    this.container = this.element.parentNode;
    this.height = this.element.height;
    this.width = this.element.width;
    if (!this.isIE && !(DygraphCanvasRenderer.isSupported(this.element))) {
        throw "Canvas is not supported."
    }
    this.xlabels = new Array();
    this.ylabels = new Array();
    this.annotations = new Array();
    this.area = {
        x: this.options.yAxisLabelWidth + 2 * this.options.axisTickSize,
        y: 0
    };
    this.area.w = this.width - this.area.x - this.options.rightGap;
    this.area.h = this.height - this.options.axisLabelFontSize - 2 * this.options.axisTickSize;
    if (this.dygraph_.numAxes() == 2) {
        this.area.w -= (this.options.yAxisLabelWidth + 2 * this.options.axisTickSize)
    } else {
        if (this.dygraph_.numAxes() > 2) {
            this.dygraph_.error("Only two y-axes are supported at this time. (Trying to use " + this.dygraph_.numAxes() + ")")
        }
    }
    this.container.style.position = "relative";
    this.container.style.width = this.width + "px";
    var a = this.dygraph_.canvas_.getContext("2d");
    a.beginPath();
    a.rect(this.area.x, this.area.y, this.area.w, this.area.h);
    a.clip();
    a = this.dygraph_.hidden_.getContext("2d");
    a.beginPath();
    a.rect(this.area.x, this.area.y, this.area.w, this.area.h);
    a.clip()
};
DygraphCanvasRenderer.prototype.attr_ = function (a) {
    return this.dygraph_.attr_(a)
};
DygraphCanvasRenderer.prototype.clear = function () {
    if (this.isIE) {
        try {
            if (this.clearDelay) {
                this.clearDelay.cancel();
                this.clearDelay = null
            }
            var b = this.element.getContext("2d")
        } catch (d) {
            this.clearDelay = MochiKit.Async.wait(this.IEDelay);
            this.clearDelay.addCallback(bind(this.clear, this));
            return
        }
    }
    var b = this.element.getContext("2d");
    b.clearRect(0, 0, this.width, this.height);
    for (var a = 0; a < this.xlabels.length; a++) {
        var c = this.xlabels[a];
        if (c.parentNode) {
            c.parentNode.removeChild(c)
        }
    }
    for (var a = 0; a < this.ylabels.length; a++) {
        var c = this.ylabels[a];
        if (c.parentNode) {
            c.parentNode.removeChild(c)
        }
    }
    for (var a = 0; a < this.annotations.length; a++) {
        var c = this.annotations[a];
        if (c.parentNode) {
            c.parentNode.removeChild(c)
        }
    }
    this.xlabels = new Array();
    this.ylabels = new Array();
    this.annotations = new Array()
};
DygraphCanvasRenderer.isSupported = function (g) {
    var b = null;
    try {
        if (typeof(g) == "undefined" || g == null) {
            b = document.createElement("canvas")
        } else {
            b = g
        }
        var c = b.getContext("2d")
    } catch (d) {
        var f = navigator.appVersion.match(/MSIE (\d\.\d)/);
        var a = (navigator.userAgent.toLowerCase().indexOf("opera") != -1);
        if ((!f) || (f[1] < 6) || (a)) {
            return false
        }
        return true
    }
    return true
};
DygraphCanvasRenderer.prototype.render = function () {
    var b = this.element.getContext("2d");

    function c(h) {
        return Math.round(h) + 0.5
    }
    function g(h) {
        return Math.round(h) - 0.5
    }
    if (this.options.underlayCallback) {
        this.options.underlayCallback(b, this.area, this.dygraph_, this.dygraph_)
    }
    if (this.options.drawYGrid) {
        var e = this.layout.yticks;
        b.save();
        b.strokeStyle = this.options.gridLineColor;
        b.lineWidth = this.options.axisLineWidth;
        for (var d = 0; d < e.length; d++) {
            if (e[d][0] != 0) {
                continue
            }
            var a = c(this.area.x);
            var f = g(this.area.y + e[d][1] * this.area.h);
            b.beginPath();
            b.moveTo(a, f);
            b.lineTo(a + this.area.w, f);
            b.closePath();
            b.stroke()
        }
    }
    if (this.options.drawXGrid) {
        var e = this.layout.xticks;
        b.save();
        b.strokeStyle = this.options.gridLineColor;
        b.lineWidth = this.options.axisLineWidth;
        for (var d = 0; d < e.length; d++) {
            var a = c(this.area.x + e[d][0] * this.area.w);
            var f = g(this.area.y + this.area.h);
            b.beginPath();
            b.moveTo(a, f);
            b.lineTo(a, this.area.y);
            b.closePath();
            b.stroke()
        }
    }
    this._renderLineChart();
    this._renderAxis();
    this._renderAnnotations()
};
DygraphCanvasRenderer.prototype._renderAxis = function () {
    if (!this.options.drawXAxis && !this.options.drawYAxis) {
        return
    }
    function b(i) {
        return Math.round(i) + 0.5
    }
    function e(i) {
        return Math.round(i) - 0.5
    }
    var c = this.element.getContext("2d");
    var k = {
        position: "absolute",
        fontSize: this.options.axisLabelFontSize + "px",
        zIndex: 10,
        color: this.options.axisLabelColor,
        width: this.options.axisLabelWidth + "px",
        overflow: "hidden"
    };
    var g = function (i) {
        var s = document.createElement("div");
        for (var r in k) {
            if (k.hasOwnProperty(r)) {
                s.style[r] = k[r]
            }
        }
        s.appendChild(document.createTextNode(i));
        return s
    };
    c.save();
    c.strokeStyle = this.options.axisLineColor;
    c.lineWidth = this.options.axisLineWidth;
    if (this.options.drawYAxis) {
        if (this.layout.yticks && this.layout.yticks.length > 0) {
            for (var h = 0; h < this.layout.yticks.length; h++) {
                var j = this.layout.yticks[h];
                if (typeof(j) == "function") {
                    return
                }
                var o = this.area.x;
                var f = 1;
                if (j[0] == 1) {
                    o = this.area.x + this.area.w;
                    f = -1
                }
                var m = this.area.y + j[1] * this.area.h;
                c.beginPath();
                c.moveTo(b(o), e(m));
                c.lineTo(b(o - f * this.options.axisTickSize), e(m));
                c.closePath();
                c.stroke();
                var n = g(j[2]);
                var l = (m - this.options.axisLabelFontSize / 2);
                if (l < 0) {
                    l = 0
                }
                if (l + this.options.axisLabelFontSize + 3 > this.height) {
                    n.style.bottom = "0px"
                } else {
                    n.style.top = l + "px"
                }
                if (j[0] == 0) {
                    n.style.left = "0px";
                    n.style.textAlign = "right"
                } else {
                    if (j[0] == 1) {
                        n.style.left = (this.area.x + this.area.w + this.options.axisTickSize) + "px";
                        n.style.textAlign = "left"
                    }
                }
                n.style.width = this.options.yAxisLabelWidth + "px";
                this.container.appendChild(n);
                this.ylabels.push(n)
            }
            var p = this.ylabels[0];
            var q = this.options.axisLabelFontSize;
            var a = parseInt(p.style.top) + q;
            if (a > this.height - q) {
                p.style.top = (parseInt(p.style.top) - q / 2) + "px"
            }
        }
        c.beginPath();
        c.moveTo(b(this.area.x), e(this.area.y));
        c.lineTo(b(this.area.x), e(this.area.y + this.area.h));
        c.closePath();
        c.stroke();
        if (this.dygraph_.numAxes() == 2) {
            c.beginPath();
            c.moveTo(e(this.area.x + this.area.w), e(this.area.y));
            c.lineTo(e(this.area.x + this.area.w), e(this.area.y + this.area.h));
            c.closePath();
            c.stroke()
        }
    }
    if (this.options.drawXAxis) {
        if (this.layout.xticks) {
            for (var h = 0; h < this.layout.xticks.length; h++) {
                var j = this.layout.xticks[h];
                if (typeof(dataset) == "function") {
                    return
                }
                var o = this.area.x + j[0] * this.area.w;
                var m = this.area.y + this.area.h;
                c.beginPath();
                c.moveTo(b(o), e(m));
                c.lineTo(b(o), e(m + this.options.axisTickSize));
                c.closePath();
                c.stroke();
                var n = g(j[1]);
                n.style.textAlign = "center";
                n.style.bottom = "0px";
                var d = (o - this.options.axisLabelWidth / 2);
                if (d + this.options.axisLabelWidth > this.width) {
                    d = this.width - this.options.xAxisLabelWidth;
                    n.style.textAlign = "right"
                }
                if (d < 0) {
                    d = 0;
                    n.style.textAlign = "left"
                }
                n.style.left = d + "px";
                n.style.width = this.options.xAxisLabelWidth + "px";
                this.container.appendChild(n);
                this.xlabels.push(n)
            }
        }
        c.beginPath();
        c.moveTo(b(this.area.x), e(this.area.y + this.area.h));
        c.lineTo(b(this.area.x + this.area.w), e(this.area.y + this.area.h));
        c.closePath();
        c.stroke()
    }
    c.restore()
};
DygraphCanvasRenderer.prototype._renderAnnotations = function () {
    var h = {
        position: "absolute",
        fontSize: this.options.axisLabelFontSize + "px",
        zIndex: 10,
        overflow: "hidden"
    };
    var j = function (i, q, r, a) {
        return function (s) {
            var p = r.annotation;
            if (p.hasOwnProperty(i)) {
                p[i](p, r, a.dygraph_, s)
            } else {
                if (a.dygraph_.attr_(q)) {
                    a.dygraph_.attr_(q)(p, r, a.dygraph_, s)
                }
            }
        }
    };
    var m = this.layout.annotated_points;
    for (var g = 0; g < m.length; g++) {
        var e = m[g];
        if (e.canvasx < this.area.x || e.canvasx > this.area.x + this.area.w) {
            continue
        }
        var k = e.annotation;
        var l = 6;
        if (k.hasOwnProperty("tickHeight")) {
            l = k.tickHeight
        }
        var c = document.createElement("div");
        for (var b in h) {
            if (h.hasOwnProperty(b)) {
                c.style[b] = h[b]
            }
        }
        if (!k.hasOwnProperty("icon")) {
            c.className = "dygraphDefaultAnnotation"
        }
        if (k.hasOwnProperty("cssClass")) {
            c.className += " " + k.cssClass
        }
        var d = k.hasOwnProperty("width") ? k.width : 16;
        var n = k.hasOwnProperty("height") ? k.height : 16;
        if (k.hasOwnProperty("icon")) {
            var f = document.createElement("img");
            f.src = k.icon;
            f.width = d;
            f.height = n;
            c.appendChild(f)
        } else {
            if (e.annotation.hasOwnProperty("shortText")) {
                c.appendChild(document.createTextNode(e.annotation.shortText))
            }
        }
        c.style.left = (e.canvasx - d / 2) + "px";
        if (k.attachAtBottom) {
            c.style.top = (this.area.h - n - l) + "px"
        } else {
            c.style.top = (e.canvasy - n - l) + "px"
        }
        c.style.width = d + "px";
        c.style.height = n + "px";
        c.title = e.annotation.text;
        c.style.color = this.colors[e.name];
        c.style.borderColor = this.colors[e.name];
        k.div = c;
        Dygraph.addEvent(c, "click", j("clickHandler", "annotationClickHandler", e, this));
        Dygraph.addEvent(c, "mouseover", j("mouseOverHandler", "annotationMouseOverHandler", e, this));
        Dygraph.addEvent(c, "mouseout", j("mouseOutHandler", "annotationMouseOutHandler", e, this));
        Dygraph.addEvent(c, "dblclick", j("dblClickHandler", "annotationDblClickHandler", e, this));
        this.container.appendChild(c);
        this.annotations.push(c);
        var o = this.element.getContext("2d");
        o.strokeStyle = this.colors[e.name];
        o.beginPath();
        if (!k.attachAtBottom) {
            o.moveTo(e.canvasx, e.canvasy);
            o.lineTo(e.canvasx, e.canvasy - 2 - l)
        } else {
            o.moveTo(e.canvasx, this.area.h);
            o.lineTo(e.canvasx, this.area.h - 2 - l)
        }
        o.closePath();
        o.stroke()
    }
};
DygraphCanvasRenderer.prototype._renderLineChart = function () {
    var d = this.element.getContext("2d");
    var g = this.options.colorScheme.length;
    var p = this.options.colorScheme;
    var A = this.options.fillAlpha;
    var F = this.layout.options.errorBars;
    var u = this.attr_("fillGraph");
    var e = this.layout.options.stackedGraph;
    var m = this.layout.options.stepPlot;
    var H = [];
    for (var I in this.layout.datasets) {
        if (this.layout.datasets.hasOwnProperty(I)) {
            H.push(I)
        }
    }
    var B = H.length;
    this.colors = {};
    for (var D = 0; D < B; D++) {
        this.colors[H[D]] = p[D % g]
    }
    for (var D = 0; D < this.layout.points.length; D++) {
        var w = this.layout.points[D];
        w.canvasx = this.area.w * w.x + this.area.x;
        w.canvasy = this.area.h * w.y + this.area.y
    }
    var q = function (i) {
        return i && !isNaN(i)
    };
    var v = d;
    if (F) {
        if (u) {
            this.dygraph_.warn("Can't use fillGraph option with error bars")
        }
        for (var D = 0; D < B; D++) {
            var l = H[D];
            var c = this.layout.options.yAxes[this.layout.options.seriesToAxisMap[l]];
            var y = this.colors[l];
            v.save();
            var k = NaN;
            var f = NaN;
            var h = [-1, -1];
            var E = c.yscale;
            var a = new RGBColor(y);
            var G = "rgba(" + a.r + "," + a.g + "," + a.b + "," + A + ")";
            v.fillStyle = G;
            v.beginPath();
            for (var z = 0; z < this.layout.points.length; z++) {
                var w = this.layout.points[z];
                if (w.name == l) {
                    if (!q(w.y)) {
                        k = NaN;
                        continue
                    }
                    if (m) {
                        var s = [f - w.errorPlus * E, f + w.errorMinus * E];
                        f = w.y
                    } else {
                        var s = [w.y - w.errorPlus * E, w.y + w.errorMinus * E]
                    }
                    s[0] = this.area.h * s[0] + this.area.y;
                    s[1] = this.area.h * s[1] + this.area.y;
                    if (!isNaN(k)) {
                        if (m) {
                            v.moveTo(k, s[0])
                        } else {
                            v.moveTo(k, h[0])
                        }
                        v.lineTo(w.canvasx, s[0]);
                        v.lineTo(w.canvasx, s[1]);
                        if (m) {
                            v.lineTo(k, s[1])
                        } else {
                            v.lineTo(k, h[1])
                        }
                        v.closePath()
                    }
                    h = s;
                    k = w.canvasx
                }
            }
            v.fill()
        }
    } else {
        if (u) {
            var r = [];
            for (var D = B - 1; D >= 0; D--) {
                var l = H[D];
                var y = this.colors[l];
                var c = this.layout.options.yAxes[this.layout.options.seriesToAxisMap[l]];
                var b = 1 + c.minyval * c.yscale;
                if (b < 0) {
                    b = 0
                } else {
                    if (b > 1) {
                        b = 1
                    }
                }
                b = this.area.h * b + this.area.y;
                v.save();
                var k = NaN;
                var h = [-1, -1];
                var E = c.yscale;
                var a = new RGBColor(y);
                var G = "rgba(" + a.r + "," + a.g + "," + a.b + "," + A + ")";
                v.fillStyle = G;
                v.beginPath();
                for (var z = 0; z < this.layout.points.length; z++) {
                    var w = this.layout.points[z];
                    if (w.name == l) {
                        if (!q(w.y)) {
                            k = NaN;
                            continue
                        }
                        var s;
                        if (e) {
                            lastY = r[w.canvasx];
                            if (lastY === undefined) {
                                lastY = b
                            }
                            r[w.canvasx] = w.canvasy;
                            s = [w.canvasy, lastY]
                        } else {
                            s = [w.canvasy, b]
                        }
                        if (!isNaN(k)) {
                            v.moveTo(k, h[0]);
                            if (m) {
                                v.lineTo(w.canvasx, h[0])
                            } else {
                                v.lineTo(w.canvasx, s[0])
                            }
                            v.lineTo(w.canvasx, s[1]);
                            v.lineTo(k, h[1]);
                            v.closePath()
                        }
                        h = s;
                        k = w.canvasx
                    }
                }
                v.fill()
            }
        }
    }
    for (var D = 0; D < B; D++) {
        var l = H[D];
        var y = this.colors[l];
        var t = this.dygraph_.attr_("strokeWidth", l);
        d.save();
        var w = this.layout.points[0];
        var n = this.dygraph_.attr_("pointSize", l);
        var k = null,
            f = null;
        var x = this.dygraph_.attr_("drawPoints", l);
        var C = this.layout.points;
        for (var z = 0; z < C.length; z++) {
            var w = C[z];
            if (w.name == l) {
                if (!q(w.canvasy)) {
                    if (m && k != null) {
                        v.beginPath();
                        v.strokeStyle = y;
                        v.lineWidth = this.options.strokeWidth;
                        v.moveTo(k, f);
                        v.lineTo(w.canvasx, f);
                        v.stroke()
                    }
                    k = f = null
                } else {
                    var o = (!k && (z == C.length - 1 || !q(C[z + 1].canvasy)));
                    if (!k) {
                        k = w.canvasx;
                        f = w.canvasy
                    } else {
                        if (t) {
                            v.beginPath();
                            v.strokeStyle = y;
                            v.lineWidth = t;
                            v.moveTo(k, f);
                            if (m) {
                                v.lineTo(w.canvasx, f)
                            }
                            k = w.canvasx;
                            f = w.canvasy;
                            v.lineTo(k, f);
                            v.stroke()
                        }
                    }
                    if (x || o) {
                        v.beginPath();
                        v.fillStyle = y;
                        v.arc(w.canvasx, w.canvasy, n, 0, 2 * Math.PI, false);
                        v.fill()
                    }
                }
            }
        }
    }
    d.restore()
};
Dygraph = function (c, b, a) {
    if (arguments.length > 0) {
        if (arguments.length == 4) {
            this.warn("Using deprecated four-argument dygraph constructor");
            this.__old_init__(c, b, arguments[2], arguments[3])
        } else {
            this.__init__(c, b, a)
        }
    }
};
Dygraph.NAME = "Dygraph";
Dygraph.VERSION = "1.2";
Dygraph.__repr__ = function () {
    return "[" + this.NAME + " " + this.VERSION + "]"
};
Dygraph.toString = function () {
    return this.__repr__()
};
Dygraph.DEFAULT_ROLL_PERIOD = 1;
Dygraph.DEFAULT_WIDTH = 480;
Dygraph.DEFAULT_HEIGHT = 320;
Dygraph.AXIS_LINE_WIDTH = 0.3;
Dygraph.DEFAULT_ATTRS = {
    highlightCircleSize: 3,
    pixelsPerXLabel: 60,
    pixelsPerYLabel: 30,
    labelsDivWidth: 250,
    labelsDivStyles: {},
    labelsSeparateLines: false,
    labelsShowZeroValues: true,
    labelsKMB: false,
    labelsKMG2: false,
    showLabelsOnHighlight: true,
    yValueFormatter: function (a) {
        return Dygraph.round_(a, 2)
    },
    strokeWidth: 1,
    axisTickSize: 3,
    axisLabelFontSize: 14,
    xAxisLabelWidth: 50,
    yAxisLabelWidth: 50,
    xAxisLabelFormatter: Dygraph.dateAxisFormatter,
    rightGap: 5,
    showRoller: false,
    xValueFormatter: Dygraph.dateString_,
    xValueParser: Dygraph.dateParser,
    xTicker: Dygraph.dateTicker,
    delimiter: ",",
    logScale: false,
    sigma: 2,
    errorBars: false,
    fractions: false,
    wilsonInterval: true,
    customBars: false,
    fillGraph: false,
    fillAlpha: 0.15,
    connectSeparatedPoints: false,
    stackedGraph: false,
    hideOverlayOnMouseOut: true,
    stepPlot: false,
    avoidMinZero: false,
    interactionModel: null
};
Dygraph.DEBUG = 1;
Dygraph.INFO = 2;
Dygraph.WARNING = 3;
Dygraph.ERROR = 3;
Dygraph.HORIZONTAL = 1;
Dygraph.VERTICAL = 2;
Dygraph.addedAnnotationCSS = false;
Dygraph.prototype.__old_init__ = function (f, d, e, b) {
    if (e != null) {
        var a = ["Date"];
        for (var c = 0; c < e.length; c++) {
            a.push(e[c])
        }
        Dygraph.update(b, {
            labels: a
        })
    }
    this.__init__(f, d, b)
};
Dygraph.prototype.__init__ = function (d, c, b) {
    if (/MSIE/.test(navigator.userAgent) && !window.opera && typeof(G_vmlCanvasManager) != "undefined" && document.readyState != "complete") {
        var a = this;
        setTimeout(function () {
            a.__init__(d, c, b)
        }, 100)
    }
    if (b == null) {
        b = {}
    }
    this.maindiv_ = d;
    this.file_ = c;
    this.rollPeriod_ = b.rollPeriod || Dygraph.DEFAULT_ROLL_PERIOD;
    this.previousVerticalX_ = -1;
    this.fractions_ = b.fractions || false;
    this.dateWindow_ = b.dateWindow || null;
    this.wilsonInterval_ = b.wilsonInterval || true;
    this.is_initial_draw_ = true;
    this.annotations_ = [];
    d.innerHTML = "";
    if (d.style.width == "") {
        d.style.width = (b.width || Dygraph.DEFAULT_WIDTH) + "px"
    }
    if (d.style.height == "") {
        d.style.height = (b.height || Dygraph.DEFAULT_HEIGHT) + "px"
    }
    this.width_ = parseInt(d.style.width, 10);
    this.height_ = parseInt(d.style.height, 10);
    if (d.style.width.indexOf("%") == d.style.width.length - 1) {
        this.width_ = d.offsetWidth
    }
    if (d.style.height.indexOf("%") == d.style.height.length - 1) {
        this.height_ = d.offsetHeight
    }
    if (this.width_ == 0) {
        this.error("dygraph has zero width. Please specify a width in pixels.")
    }
    if (this.height_ == 0) {
        this.error("dygraph has zero height. Please specify a height in pixels.")
    }
    if (b.stackedGraph) {
        b.fillGraph = true
    }
    this.user_attrs_ = {};
    Dygraph.update(this.user_attrs_, b);
    this.attrs_ = {};
    Dygraph.update(this.attrs_, Dygraph.DEFAULT_ATTRS);
    this.boundaryIds_ = [];
    this.labelsFromCSV_ = (this.attr_("labels") == null);
    this.createInterface_();
    this.start_()
};
Dygraph.prototype.attr_ = function (b, a) {
    if (a && typeof(this.user_attrs_[a]) != "undefined" && this.user_attrs_[a] != null && typeof(this.user_attrs_[a][b]) != "undefined") {
        return this.user_attrs_[a][b]
    } else {
        if (typeof(this.user_attrs_[b]) != "undefined") {
            return this.user_attrs_[b]
        } else {
            if (typeof(this.attrs_[b]) != "undefined") {
                return this.attrs_[b]
            } else {
                return null
            }
        }
    }
};
Dygraph.prototype.log = function (a, b) {
    if (typeof(console) != "undefined") {
        switch (a) {
        case Dygraph.DEBUG:
            console.debug("dygraphs: " + b);
            break;
        case Dygraph.INFO:
            console.info("dygraphs: " + b);
            break;
        case Dygraph.WARNING:
            console.warn("dygraphs: " + b);
            break;
        case Dygraph.ERROR:
            console.error("dygraphs: " + b);
            break
        }
    }
};
Dygraph.prototype.info = function (a) {
    this.log(Dygraph.INFO, a)
};
Dygraph.prototype.warn = function (a) {
    this.log(Dygraph.WARNING, a)
};
Dygraph.prototype.error = function (a) {
    this.log(Dygraph.ERROR, a)
};
Dygraph.prototype.rollPeriod = function () {
    return this.rollPeriod_
};
Dygraph.prototype.xAxisRange = function () {
    if (this.dateWindow_) {
        return this.dateWindow_
    }
    var b = this.rawData_[0][0];
    var a = this.rawData_[this.rawData_.length - 1][0];
    return [b, a]
};
Dygraph.prototype.yAxisRange = function (a) {
    if (typeof(a) == "undefined") {
        a = 0
    }
    if (a < 0 || a >= this.axes_.length) {
        return null
    }
    return [this.axes_[a].computedValueRange[0], this.axes_[a].computedValueRange[1]]
};
Dygraph.prototype.yAxisRanges = function () {
    var a = [];
    for (var b = 0; b < this.axes_.length; b++) {
        a.push(this.yAxisRange(b))
    }
    return a
};
Dygraph.prototype.toDomCoords = function (b, g, d) {
    var c = [null, null];
    var e = this.plotter_.area;
    if (b !== null) {
        var a = this.xAxisRange();
        c[0] = e.x + (b - a[0]) / (a[1] - a[0]) * e.w
    }
    if (g !== null) {
        var f = this.yAxisRange(d);
        c[1] = e.y + (f[1] - g) / (f[1] - f[0]) * e.h
    }
    return c
};
Dygraph.prototype.toDataCoords = function (b, g, d) {
    var c = [null, null];
    var e = this.plotter_.area;
    if (b !== null) {
        var a = this.xAxisRange();
        c[0] = a[0] + (b - e.x) / e.w * (a[1] - a[0])
    }
    if (g !== null) {
        var f = this.yAxisRange(d);
        c[1] = f[0] + (e.h - g) / e.h * (f[1] - f[0])
    }
    return c
};
Dygraph.prototype.numColumns = function () {
    return this.rawData_[0].length
};
Dygraph.prototype.numRows = function () {
    return this.rawData_.length
};
Dygraph.prototype.getValue = function (b, a) {
    if (b < 0 || b > this.rawData_.length) {
        return null
    }
    if (a < 0 || a > this.rawData_[b].length) {
        return null
    }
    return this.rawData_[b][a]
};
Dygraph.addEvent = function (c, a, b) {
    var d = function (f) {
        if (!f) {
            var f = window.event
        }
        b(f)
    };
    if (window.addEventListener) {
        c.addEventListener(a, d, false)
    } else {
        c.attachEvent("on" + a, d)
    }
};
Dygraph.cancelEvent = function (a) {
    a = a ? a : window.event;
    if (a.stopPropagation) {
        a.stopPropagation()
    }
    if (a.preventDefault) {
        a.preventDefault()
    }
    a.cancelBubble = true;
    a.cancel = true;
    a.returnValue = false;
    return false
};
Dygraph.prototype.createInterface_ = function () {
    var a = this.maindiv_;
    this.graphDiv = document.createElement("div");
    this.graphDiv.style.width = this.width_ + "px";
    this.graphDiv.style.height = this.height_ + "px";
    a.appendChild(this.graphDiv);
    this.canvas_ = Dygraph.createCanvas();
    this.canvas_.style.position = "absolute";
    this.canvas_.width = this.width_;
    this.canvas_.height = this.height_;
    this.canvas_.style.width = this.width_ + "px";
    this.canvas_.style.height = this.height_ + "px";
    this.hidden_ = this.createPlotKitCanvas_(this.canvas_);
    this.graphDiv.appendChild(this.hidden_);
    this.graphDiv.appendChild(this.canvas_);
    this.mouseEventElement_ = this.canvas_;
    var b = this;
    Dygraph.addEvent(this.mouseEventElement_, "mousemove", function (c) {
        b.mouseMove_(c)
    });
    Dygraph.addEvent(this.mouseEventElement_, "mouseout", function (c) {
        b.mouseOut_(c)
    });
    this.layoutOptions_ = {
        xOriginIsZero: false
    };
    Dygraph.update(this.layoutOptions_, this.attrs_);
    Dygraph.update(this.layoutOptions_, this.user_attrs_);
    Dygraph.update(this.layoutOptions_, {
        errorBars: (this.attr_("errorBars") || this.attr_("customBars"))
    });
    this.layout_ = new DygraphLayout(this, this.layoutOptions_);
    this.renderOptions_ = {
        colorScheme: this.colors_,
        strokeColor: null,
        axisLineWidth: Dygraph.AXIS_LINE_WIDTH
    };
    Dygraph.update(this.renderOptions_, this.attrs_);
    Dygraph.update(this.renderOptions_, this.user_attrs_);
    this.createStatusMessage_();
    this.createDragInterface_()
};
Dygraph.prototype.destroy = function () {
    var a = function (c) {
        while (c.hasChildNodes()) {
            a(c.firstChild);
            c.removeChild(c.firstChild)
        }
    };
    a(this.maindiv_);
    var b = function (c) {
        for (var d in c) {
            if (typeof(c[d]) === "object") {
                c[d] = null
            }
        }
    };
    b(this.layout_);
    b(this.plotter_);
    b(this)
};
Dygraph.prototype.createPlotKitCanvas_ = function (a) {
    var b = Dygraph.createCanvas();
    b.style.position = "absolute";
    b.style.top = a.style.top;
    b.style.left = a.style.left;
    b.width = this.width_;
    b.height = this.height_;
    b.style.width = this.width_ + "px";
    b.style.height = this.height_ + "px";
    return b
};
Dygraph.hsvToRGB = function (h, g, k) {
    var c;
    var d;
    var l;
    if (g === 0) {
        c = k;
        d = k;
        l = k
    } else {
        var e = Math.floor(h * 6);
        var j = (h * 6) - e;
        var b = k * (1 - g);
        var a = k * (1 - (g * j));
        var m = k * (1 - (g * (1 - j)));
        switch (e) {
        case 1:
            c = a;
            d = k;
            l = b;
            break;
        case 2:
            c = b;
            d = k;
            l = m;
            break;
        case 3:
            c = b;
            d = a;
            l = k;
            break;
        case 4:
            c = m;
            d = b;
            l = k;
            break;
        case 5:
            c = k;
            d = b;
            l = a;
            break;
        case 6:
        case 0:
            c = k;
            d = m;
            l = b;
            break
        }
    }
    c = Math.floor(255 * c + 0.5);
    d = Math.floor(255 * d + 0.5);
    l = Math.floor(255 * l + 0.5);
    return "rgb(" + c + "," + d + "," + l + ")"
};
Dygraph.prototype.setColors_ = function () {
    var e = this.attr_("labels").length - 1;
    this.colors_ = [];
    var a = this.attr_("colors");
    if (!a) {
        var c = this.attr_("colorSaturation") || 1;
        var b = this.attr_("colorValue") || 0.5;
        var j = Math.ceil(e / 2);
        for (var d = 1; d <= e; d++) {
            if (!this.visibility()[d - 1]) {
                continue
            }
            var g = d % 2 ? Math.ceil(d / 2) : (j + d / 2);
            var f = (1 * g / (1 + e));
            this.colors_.push(Dygraph.hsvToRGB(f, c, b))
        }
    } else {
        for (var d = 0; d < e; d++) {
            if (!this.visibility()[d]) {
                continue
            }
            var h = a[d % a.length];
            this.colors_.push(h)
        }
    }
    this.renderOptions_.colorScheme = this.colors_;
    Dygraph.update(this.plotter_.options, this.renderOptions_);
    Dygraph.update(this.layoutOptions_, this.user_attrs_);
    Dygraph.update(this.layoutOptions_, this.attrs_)
};
Dygraph.prototype.getColors = function () {
    return this.colors_
};
Dygraph.findPosX = function (a) {
    var b = 0;
    if (a.offsetParent) {
        while (1) {
            b += a.offsetLeft;
            if (!a.offsetParent) {
                break
            }
            a = a.offsetParent
        }
    } else {
        if (a.x) {
            b += a.x
        }
    }
    return b
};
Dygraph.findPosY = function (b) {
    var a = 0;
    if (b.offsetParent) {
        while (1) {
            a += b.offsetTop;
            if (!b.offsetParent) {
                break
            }
            b = b.offsetParent
        }
    } else {
        if (b.y) {
            a += b.y
        }
    }
    return a
};
Dygraph.prototype.createStatusMessage_ = function () {
    var d = this.user_attrs_.labelsDiv;
    if (d && null != d && (typeof(d) == "string" || d instanceof String)) {
        this.user_attrs_.labelsDiv = document.getElementById(d)
    }
    if (!this.attr_("labelsDiv")) {
        var a = this.attr_("labelsDivWidth");
        var c = {
            position: "absolute",
            fontSize: "14px",
            zIndex: 10,
            width: a + "px",
            top: "0px",
            left: (this.width_ - a - 2) + "px",
            background: "white",
            textAlign: "left",
            overflow: "hidden"
        };
        Dygraph.update(c, this.attr_("labelsDivStyles"));
        var e = document.createElement("div");
        for (var b in c) {
            if (c.hasOwnProperty(b)) {
                e.style[b] = c[b]
            }
        }
        this.graphDiv.appendChild(e);
        this.attrs_.labelsDiv = e
    }
};
Dygraph.prototype.positionLabelsDiv_ = function () {
    if (this.user_attrs_.hasOwnProperty("labelsDiv")) {
        return
    }
    var a = this.plotter_.area;
    var b = this.attr_("labelsDiv");
    b.style.left = a.x + a.w - this.attr_("labelsDivWidth") - 1 + "px"
};
Dygraph.prototype.createRollInterface_ = function () {
    if (!this.roller_) {
        this.roller_ = document.createElement("input");
        this.roller_.type = "text";
        this.roller_.style.display = "none";
        this.graphDiv.appendChild(this.roller_)
    }
    var d = this.attr_("showRoller") ? "block" : "none";
    var b = {
        position: "absolute",
        zIndex: 10,
        top: (this.plotter_.area.h - 25) + "px",
        left: (this.plotter_.area.x + 1) + "px",
        display: d
    };
    this.roller_.size = "2";
    this.roller_.value = this.rollPeriod_;
    for (var a in b) {
        if (b.hasOwnProperty(a)) {
            this.roller_.style[a] = b[a]
        }
    }
    var c = this;
    this.roller_.onchange = function () {
        c.adjustRoll(c.roller_.value)
    }
};
Dygraph.pageX = function (c) {
    if (c.pageX) {
        return (!c.pageX || c.pageX < 0) ? 0 : c.pageX
    } else {
        var d = document;
        var a = document.body;
        return c.clientX + (d.scrollLeft || a.scrollLeft) - (d.clientLeft || 0)
    }
};
Dygraph.pageY = function (c) {
    if (c.pageY) {
        return (!c.pageY || c.pageY < 0) ? 0 : c.pageY
    } else {
        var d = document;
        var a = document.body;
        return c.clientY + (d.scrollTop || a.scrollTop) - (d.clientTop || 0)
    }
};
Dygraph.prototype.dragGetX_ = function (b, a) {
    return Dygraph.pageX(b) - a.px
};
Dygraph.prototype.dragGetY_ = function (b, a) {
    return Dygraph.pageY(b) - a.py
};
Dygraph.startPan = function (c, k, d) {
    var h = false;
    for (var j = 0; j < k.axes_.length; j++) {
        if (k.axes_[j].valueWindow || k.axes_[j].valueRange) {
            h = true;
            break
        }
    }
    if (!k.dateWindow_ && !h) {
        return
    }
    d.isPanning = true;
    var b = k.xAxisRange();
    d.dateRange = b[1] - b[0];
    d.is2DPan = false;
    for (var j = 0; j < k.axes_.length; j++) {
        var e = k.axes_[j];
        var f = k.yAxisRange(j);
        e.dragValueRange = f[1] - f[0];
        var a = k.toDataCoords(null, d.dragStartY, j);
        e.draggingValue = a[1];
        if (e.valueWindow || e.valueRange) {
            d.is2DPan = true
        }
    }
    d.draggingDate = (d.dragStartX / k.width_) * d.dateRange + b[0]
};
Dygraph.movePan = function (b, h, c) {
    c.dragEndX = h.dragGetX_(b, c);
    c.dragEndY = h.dragGetY_(b, c);
    var e = c.draggingDate - (c.dragEndX / h.width_) * c.dateRange;
    var a = e + c.dateRange;
    h.dateWindow_ = [e, a];
    if (c.is2DPan) {
        var l = c.dragEndY / h.height_;
        for (var f = 0; f < h.axes_.length; f++) {
            var d = h.axes_[f];
            var j = d.draggingValue + l * d.dragValueRange;
            var k = j - d.dragValueRange;
            d.valueWindow = [k, j]
        }
    }
    h.drawGraph_()
};
Dygraph.endPan = function (c, b, a) {
    a.isPanning = false;
    a.is2DPan = false;
    a.draggingDate = null;
    a.dateRange = null;
    a.valueRange = null
};
Dygraph.startZoom = function (c, b, a) {
    a.isZooming = true
};
Dygraph.moveZoom = function (c, b, a) {
    a.dragEndX = b.dragGetX_(c, a);
    a.dragEndY = b.dragGetY_(c, a);
    var e = Math.abs(a.dragStartX - a.dragEndX);
    var d = Math.abs(a.dragStartY - a.dragEndY);
    a.dragDirection = (e < d / 2) ? Dygraph.VERTICAL : Dygraph.HORIZONTAL;
    b.drawZoomRect_(a.dragDirection, a.dragStartX, a.dragEndX, a.dragStartY, a.dragEndY, a.prevDragDirection, a.prevEndX, a.prevEndY);
    a.prevEndX = a.dragEndX;
    a.prevEndY = a.dragEndY;
    a.prevDragDirection = a.dragDirection
};
Dygraph.endZoom = function (b, j, e) {
    e.isZooming = false;
    e.dragEndX = j.dragGetX_(b, e);
    e.dragEndY = j.dragGetY_(b, e);
    var f = Math.abs(e.dragEndX - e.dragStartX);
    var d = Math.abs(e.dragEndY - e.dragStartY);
    if (f < 2 && d < 2 && j.lastx_ != undefined && j.lastx_ != -1) {
        if (j.attr_("clickCallback") != null) {
            j.attr_("clickCallback")(b, j.lastx_, j.selPoints_)
        }
        if (j.attr_("pointClickCallback")) {
            var l = -1;
            var m = 0;
            for (var h = 0; h < j.selPoints_.length; h++) {
                var c = j.selPoints_[h];
                var a = Math.pow(c.canvasx - e.dragEndX, 2) + Math.pow(c.canvasy - e.dragEndY, 2);
                if (l == -1 || a < m) {
                    m = a;
                    l = h
                }
            }
            var k = j.attr_("highlightCircleSize") + 2;
            if (m <= 5 * 5) {
                j.attr_("pointClickCallback")(b, j.selPoints_[l])
            }
        }
    }
    if (f >= 10 && e.dragDirection == Dygraph.HORIZONTAL) {
        j.doZoomX_(Math.min(e.dragStartX, e.dragEndX), Math.max(e.dragStartX, e.dragEndX))
    } else {
        if (d >= 10 && e.dragDirection == Dygraph.VERTICAL) {
            j.doZoomY_(Math.min(e.dragStartY, e.dragEndY), Math.max(e.dragStartY, e.dragEndY))
        } else {
            j.canvas_.getContext("2d").clearRect(0, 0, j.canvas_.width, j.canvas_.height)
        }
    }
    e.dragStartX = null;
    e.dragStartY = null
};
Dygraph.defaultInteractionModel = {
    mousedown: function (c, b, a) {
        a.initializeMouseDown(c, b, a);
        if (c.altKey || c.shiftKey) {
            Dygraph.startPan(c, b, a)
        } else {
            Dygraph.startZoom(c, b, a)
        }
    },
    mousemove: function (c, b, a) {
        if (a.isZooming) {
            Dygraph.moveZoom(c, b, a)
        } else {
            if (a.isPanning) {
                Dygraph.movePan(c, b, a)
            }
        }
    },
    mouseup: function (c, b, a) {
        if (a.isZooming) {
            Dygraph.endZoom(c, b, a)
        } else {
            if (a.isPanning) {
                Dygraph.endPan(c, b, a)
            }
        }
    },
    mouseout: function (c, b, a) {
        if (a.isZooming) {
            a.dragEndX = null;
            a.dragEndY = null
        }
    },
    dblclick: function (c, b, a) {
        if (c.altKey || c.shiftKey) {
            return
        }
        b.doUnzoom_()
    }
};
Dygraph.DEFAULT_ATTRS.interactionModel = Dygraph.defaultInteractionModel;
Dygraph.prototype.createDragInterface_ = function () {
    var c = {
        isZooming: false,
        isPanning: false,
        is2DPan: false,
        dragStartX: null,
        dragStartY: null,
        dragEndX: null,
        dragEndY: null,
        dragDirection: null,
        prevEndX: null,
        prevEndY: null,
        prevDragDirection: null,
        draggingDate: null,
        dateRange: null,
        px: 0,
        py: 0,
        initializeMouseDown: function (i, h, f) {
            if (i.preventDefault) {
                i.preventDefault()
            } else {
                i.returnValue = false;
                i.cancelBubble = true
            }
            f.px = Dygraph.findPosX(h.canvas_);
            f.py = Dygraph.findPosY(h.canvas_);
            f.dragStartX = h.dragGetX_(i, f);
            f.dragStartY = h.dragGetY_(i, f)
        }
    };
    var e = this.attr_("interactionModel");
    var b = this;
    var d = function (f) {
        return function (g) {
            f(g, b, c)
        }
    };
    for (var a in e) {
        if (!e.hasOwnProperty(a)) {
            continue
        }
        Dygraph.addEvent(this.mouseEventElement_, a, d(e[a]))
    }
    Dygraph.addEvent(document, "mouseup", function (g) {
        if (c.isZooming || c.isPanning) {
            c.isZooming = false;
            c.dragStartX = null;
            c.dragStartY = null
        }
        if (c.isPanning) {
            c.isPanning = false;
            c.draggingDate = null;
            c.dateRange = null;
            for (var f = 0; f < b.axes_.length; f++) {
                delete b.axes_[f].draggingValue;
                delete b.axes_[f].dragValueRange
            }
        }
    })
};
Dygraph.prototype.drawZoomRect_ = function (e, c, i, b, g, a, f, d) {
    var h = this.canvas_.getContext("2d");
    if (a == Dygraph.HORIZONTAL) {
        h.clearRect(Math.min(c, f), 0, Math.abs(c - f), this.height_)
    } else {
        if (a == Dygraph.VERTICAL) {
            h.clearRect(0, Math.min(b, d), this.width_, Math.abs(b - d))
        }
    }
    if (e == Dygraph.HORIZONTAL) {
        if (i && c) {
            h.fillStyle = "rgba(128,128,128,0.33)";
            h.fillRect(Math.min(c, i), 0, Math.abs(i - c), this.height_)
        }
    }
    if (e == Dygraph.VERTICAL) {
        if (g && b) {
            h.fillStyle = "rgba(128,128,128,0.33)";
            h.fillRect(0, Math.min(b, g), this.width_, Math.abs(g - b))
        }
    }
};
Dygraph.prototype.doZoomX_ = function (d, a) {
    var b = this.toDataCoords(d, null);
    var c = b[0];
    b = this.toDataCoords(a, null);
    var e = b[0];
    this.doZoomXDates_(c, e)
};
Dygraph.prototype.doZoomXDates_ = function (a, b) {
    this.dateWindow_ = [a, b];
    this.drawGraph_();
    if (this.attr_("zoomCallback")) {
        this.attr_("zoomCallback")(a, b, this.yAxisRanges())
    }
};
Dygraph.prototype.doZoomY_ = function (g, f) {
    var c = [];
    for (var e = 0; e < this.axes_.length; e++) {
        var d = this.toDataCoords(null, g, e);
        var b = this.toDataCoords(null, f, e);
        this.axes_[e].valueWindow = [b[1], d[1]];
        c.push([b[1], d[1]])
    }
    this.drawGraph_();
    if (this.attr_("zoomCallback")) {
        var a = this.xAxisRange();
        this.attr_("zoomCallback")(a[0], a[1], this.yAxisRanges())
    }
};
Dygraph.prototype.doUnzoom_ = function () {
    var b = false;
    if (this.dateWindow_ != null) {
        b = true;
        this.dateWindow_ = null
    }
    for (var a = 0; a < this.axes_.length; a++) {
        if (this.axes_[a].valueWindow != null) {
            b = true;
            delete this.axes_[a].valueWindow
        }
    }
    if (b) {
        this.drawGraph_();
        if (this.attr_("zoomCallback")) {
            var c = this.rawData_[0][0];
            var d = this.rawData_[this.rawData_.length - 1][0];
            this.attr_("zoomCallback")(c, d, this.yAxisRanges())
        }
    }
};
Dygraph.prototype.mouseMove_ = function (b) {
    var a = Dygraph.pageX(b) - Dygraph.findPosX(this.mouseEventElement_);
    var t = this.layout_.points;
    var m = -1;
    var j = -1;
    var q = 1e+100;
    var r = -1;
    for (var f = 0; f < t.length; f++) {
        var o = t[f];
        if (o == null) {
            continue
        }
        var h = Math.abs(o.canvasx - a);
        if (h > q) {
            continue
        }
        q = h;
        r = f
    }
    if (r >= 0) {
        m = t[r].xval
    }
    var s = t[t.length - 1];
    if (s != null && a > s.canvasx) {
        m = t[t.length - 1].xval
    }
    this.selPoints_ = [];
    var d = t.length;
    if (!this.attr_("stackedGraph")) {
        for (var f = 0; f < d; f++) {
            if (t[f].xval == m) {
                this.selPoints_.push(t[f])
            }
        }
    } else {
        var g = 0;
        for (var f = d - 1; f >= 0; f--) {
            if (t[f].xval == m) {
                var c = {};
                for (var e in t[f]) {
                    c[e] = t[f][e]
                }
                c.yval -= g;
                g += c.yval;
                this.selPoints_.push(c)
            }
        }
        this.selPoints_.reverse()
    }
    if (this.attr_("highlightCallback")) {
        var n = this.lastx_;
        if (n !== null && m != n) {
            this.attr_("highlightCallback")(b, m, this.selPoints_, this.idxToRow_(r))
        }
    }
    this.lastx_ = m;
    this.updateSelection_()
};
Dygraph.prototype.idxToRow_ = function (a) {
    if (a < 0) {
        return -1
    }
    for (var b in this.layout_.datasets) {
        if (a < this.layout_.datasets[b].length) {
            return this.boundaryIds_[0][0] + a
        }
        a -= this.layout_.datasets[b].length
    }
    return -1
};
Dygraph.prototype.updateSelection_ = function () {
    var q = this.canvas_.getContext("2d");
    if (this.previousVerticalX_ >= 0) {
        var h = 0;
        var j = this.attr_("labels");
        for (var g = 1; g < j.length; g++) {
            var b = this.attr_("highlightCircleSize", j[g]);
            if (b > h) {
                h = b
            }
        }
        var o = this.previousVerticalX_;
        q.clearRect(o - h - 1, 0, 2 * h + 2, this.height_)
    }
    var p = function (c) {
        return c && !isNaN(c)
    };
    if (this.selPoints_.length > 0) {
        var d = this.selPoints_[0].canvasx;
        var e = this.attr_("xValueFormatter")(this.lastx_, this) + ":";
        var f = this.attr_("yValueFormatter");
        var m = this.colors_.length;
        if (this.attr_("showLabelsOnHighlight")) {
            for (var g = 0; g < this.selPoints_.length; g++) {
                if (!this.attr_("labelsShowZeroValues") && this.selPoints_[g].yval == 0) {
                    continue
                }
                if (!p(this.selPoints_[g].canvasy)) {
                    continue
                }
                if (this.attr_("labelsSeparateLines")) {
                    e += "<br/>"
                }
                var n = this.selPoints_[g];
                var l = new RGBColor(this.plotter_.colors[n.name]);
                var k = f(n.yval);
                e += " <b><font color='" + l.toHex() + "'>" + n.name + "</font></b>:" + k
            }
            this.attr_("labelsDiv").innerHTML = e
        }
        q.save();
        for (var g = 0; g < this.selPoints_.length; g++) {
            if (!p(this.selPoints_[g].canvasy)) {
                continue
            }
            var a = this.attr_("highlightCircleSize", this.selPoints_[g].name);
            q.beginPath();
            q.fillStyle = this.plotter_.colors[this.selPoints_[g].name];
            q.arc(d, this.selPoints_[g].canvasy, a, 0, 2 * Math.PI, false);
            q.fill()
        }
        q.restore();
        this.previousVerticalX_ = d
    }
};
Dygraph.prototype.setSelection = function (c) {
    this.selPoints_ = [];
    var d = 0;
    if (c !== false) {
        c = c - this.boundaryIds_[0][0]
    }
    if (c !== false && c >= 0) {
        for (var b in this.layout_.datasets) {
            if (c < this.layout_.datasets[b].length) {
                var a = this.layout_.points[d + c];
                if (this.attr_("stackedGraph")) {
                    a = this.layout_.unstackPointAtIndex(d + c)
                }
                this.selPoints_.push(a)
            }
            d += this.layout_.datasets[b].length
        }
    }
    if (this.selPoints_.length) {
        this.lastx_ = this.selPoints_[0].xval;
        this.updateSelection_()
    } else {
        this.lastx_ = -1;
        this.clearSelection()
    }
};
Dygraph.prototype.mouseOut_ = function (a) {
    if (this.attr_("unhighlightCallback")) {
        this.attr_("unhighlightCallback")(a)
    }
    if (this.attr_("hideOverlayOnMouseOut")) {
        this.clearSelection()
    }
};
Dygraph.prototype.clearSelection = function () {
    var a = this.canvas_.getContext("2d");
    a.clearRect(0, 0, this.width_, this.height_);
    this.attr_("labelsDiv").innerHTML = "";
    this.selPoints_ = [];
    this.lastx_ = -1
};
Dygraph.prototype.getSelection = function () {
    if (!this.selPoints_ || this.selPoints_.length < 1) {
        return -1
    }
    for (var a = 0; a < this.layout_.points.length; a++) {
        if (this.layout_.points[a].x == this.selPoints_[0].x) {
            return a + this.boundaryIds_[0][0]
        }
    }
    return -1
};
Dygraph.zeropad = function (a) {
    if (a < 10) {
        return "0" + a
    } else {
        return "" + a
    }
};
Dygraph.hmsString_ = function (a) {
    var c = Dygraph.zeropad;
    var b = new Date(a);
    if (b.getSeconds()) {
        return c(b.getHours()) + ":" + c(b.getMinutes()) + ":" + c(b.getSeconds())
    } else {
        return c(b.getHours()) + ":" + c(b.getMinutes())
    }
};
Dygraph.dateAxisFormatter = function (b, c) {
    if (c >= Dygraph.DECADAL) {
        return b.strftime("%Y")
    } else {
        if (c >= Dygraph.MONTHLY) {
            return b.strftime("%b %y")
        } else {
            var a = b.getHours() * 3600 + b.getMinutes() * 60 + b.getSeconds() + b.getMilliseconds();
            if (a == 0 || c >= Dygraph.DAILY) {
                return new Date(b.getTime() + 3600 * 1000).strftime("%d%b")
            } else {
                return Dygraph.hmsString_(b.getTime())
            }
        }
    }
};
Dygraph.dateString_ = function (b, j) {
    var c = Dygraph.zeropad;
    var g = new Date(b);
    var h = "" + g.getFullYear();
    var e = c(g.getMonth() + 1);
    var i = c(g.getDate());
    var f = "";
    var a = g.getHours() * 3600 + g.getMinutes() * 60 + g.getSeconds();
    if (a) {
        f = " " + Dygraph.hmsString_(b)
    }
    return h + "/" + e + "/" + i + f
};
Dygraph.round_ = function (c, b) {
    var a = Math.pow(10, b);
    return Math.round(c * a) / a
};
Dygraph.prototype.loadedEvent_ = function (a) {
    this.rawData_ = this.parseCSV_(a);
    this.predraw_()
};
Dygraph.prototype.months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
Dygraph.prototype.quarters = ["Jan", "Apr", "Jul", "Oct"];
Dygraph.prototype.addXTicks_ = function () {
    var a, c;
    if (this.dateWindow_) {
        a = this.dateWindow_[0];
        c = this.dateWindow_[1]
    } else {
        a = this.rawData_[0][0];
        c = this.rawData_[this.rawData_.length - 1][0]
    }
    var b = this.attr_("xTicker")(a, c, this);
    this.layout_.updateOptions({
        xTicks: b
    })
};
Dygraph.SECONDLY = 0;
Dygraph.TWO_SECONDLY = 1;
Dygraph.FIVE_SECONDLY = 2;
Dygraph.TEN_SECONDLY = 3;
Dygraph.THIRTY_SECONDLY = 4;
Dygraph.MINUTELY = 5;
Dygraph.TWO_MINUTELY = 6;
Dygraph.FIVE_MINUTELY = 7;
Dygraph.TEN_MINUTELY = 8;
Dygraph.THIRTY_MINUTELY = 9;
Dygraph.HOURLY = 10;
Dygraph.TWO_HOURLY = 11;
Dygraph.SIX_HOURLY = 12;
Dygraph.DAILY = 13;
Dygraph.WEEKLY = 14;
Dygraph.MONTHLY = 15;
Dygraph.QUARTERLY = 16;
Dygraph.BIANNUAL = 17;
Dygraph.ANNUAL = 18;
Dygraph.DECADAL = 19;
Dygraph.CENTENIAL = 20;
Dygraph.NUM_GRANULARITIES = 21;
Dygraph.SHORT_SPACINGS = [];
Dygraph.SHORT_SPACINGS[Dygraph.SECONDLY] = 1000 * 1;
Dygraph.SHORT_SPACINGS[Dygraph.TWO_SECONDLY] = 1000 * 2;
Dygraph.SHORT_SPACINGS[Dygraph.FIVE_SECONDLY] = 1000 * 5;
Dygraph.SHORT_SPACINGS[Dygraph.TEN_SECONDLY] = 1000 * 10;
Dygraph.SHORT_SPACINGS[Dygraph.THIRTY_SECONDLY] = 1000 * 30;
Dygraph.SHORT_SPACINGS[Dygraph.MINUTELY] = 1000 * 60;
Dygraph.SHORT_SPACINGS[Dygraph.TWO_MINUTELY] = 1000 * 60 * 2;
Dygraph.SHORT_SPACINGS[Dygraph.FIVE_MINUTELY] = 1000 * 60 * 5;
Dygraph.SHORT_SPACINGS[Dygraph.TEN_MINUTELY] = 1000 * 60 * 10;
Dygraph.SHORT_SPACINGS[Dygraph.THIRTY_MINUTELY] = 1000 * 60 * 30;
Dygraph.SHORT_SPACINGS[Dygraph.HOURLY] = 1000 * 3600;
Dygraph.SHORT_SPACINGS[Dygraph.TWO_HOURLY] = 1000 * 3600 * 2;
Dygraph.SHORT_SPACINGS[Dygraph.SIX_HOURLY] = 1000 * 3600 * 6;
Dygraph.SHORT_SPACINGS[Dygraph.DAILY] = 1000 * 86400;
Dygraph.SHORT_SPACINGS[Dygraph.WEEKLY] = 1000 * 604800;
Dygraph.prototype.NumXTicks = function (e, b, g) {
    if (g < Dygraph.MONTHLY) {
        var h = Dygraph.SHORT_SPACINGS[g];
        return Math.floor(0.5 + 1 * (b - e) / h)
    } else {
        var f = 1;
        var d = 12;
        if (g == Dygraph.QUARTERLY) {
            d = 3
        }
        if (g == Dygraph.BIANNUAL) {
            d = 2
        }
        if (g == Dygraph.ANNUAL) {
            d = 1
        }
        if (g == Dygraph.DECADAL) {
            d = 1;
            f = 10
        }
        if (g == Dygraph.CENTENIAL) {
            d = 1;
            f = 100
        }
        var c = 365.2524 * 24 * 3600 * 1000;
        var a = 1 * (b - e) / c;
        return Math.floor(0.5 + 1 * a * d / f)
    }
};
Dygraph.prototype.GetXAxis = function (m, h, a) {
    var r = this.attr_("xAxisLabelFormatter");
    var y = [];
    if (a < Dygraph.MONTHLY) {
        var c = Dygraph.SHORT_SPACINGS[a];
        var u = "%d%b";
        var v = c / 1000;
        var w = new Date(m);
        if (v <= 60) {
            var f = w.getSeconds();
            w.setSeconds(f - f % v)
        } else {
            w.setSeconds(0);
            v /= 60;
            if (v <= 60) {
                var f = w.getMinutes();
                w.setMinutes(f - f % v)
            } else {
                w.setMinutes(0);
                v /= 60;
                if (v <= 24) {
                    var f = w.getHours();
                    w.setHours(f - f % v)
                } else {
                    w.setHours(0);
                    v /= 24;
                    if (v == 7) {
                        w.setDate(w.getDate() - w.getDay())
                    }
                }
            }
        }
        m = w.getTime();
        for (var k = m; k <= h; k += c) {
            y.push({
                v: k,
                label: r(new Date(k), a)
            })
        }
    } else {
        var e;
        var n = 1;
        if (a == Dygraph.MONTHLY) {
            e = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
        } else {
            if (a == Dygraph.QUARTERLY) {
                e = [0, 3, 6, 9]
            } else {
                if (a == Dygraph.BIANNUAL) {
                    e = [0, 6]
                } else {
                    if (a == Dygraph.ANNUAL) {
                        e = [0]
                    } else {
                        if (a == Dygraph.DECADAL) {
                            e = [0];
                            n = 10
                        } else {
                            if (a == Dygraph.CENTENIAL) {
                                e = [0];
                                n = 100
                            } else {
                                this.warn("Span of dates is too long")
                            }
                        }
                    }
                }
            }
        }
        var q = new Date(m).getFullYear();
        var o = new Date(h).getFullYear();
        var b = Dygraph.zeropad;
        for (var s = q; s <= o; s++) {
            if (s % n != 0) {
                continue
            }
            for (var p = 0; p < e.length; p++) {
                var l = s + "/" + b(1 + e[p]) + "/01";
                var k = Date.parse(l);
                if (k < m || k > h) {
                    continue
                }
                y.push({
                    v: k,
                    label: r(new Date(k), a)
                })
            }
        }
    }
    return y
};
Dygraph.dateTicker = function (a, f, d) {
    var b = -1;
    for (var e = 0; e < Dygraph.NUM_GRANULARITIES; e++) {
        var c = d.NumXTicks(a, f, e);
        if (d.width_ / c >= d.attr_("pixelsPerXLabel")) {
            b = e;
            break
        }
    }
    if (b >= 0) {
        return d.GetXAxis(a, f, b)
    } else {}
};
Dygraph.numericTicks = function (z, y, o, c, h) {
    var r = function (i) {
        if (c && c.hasOwnProperty(i)) {
            return c[i]
        }
        return o.attr_(i)
    };
    var A = [];
    if (h) {
        for (var x = 0; x < h.length; x++) {
            A.push({
                v: h[x]
            })
        }
    } else {
        if (r("labelsKMG2")) {
            var g = [1, 2, 4, 8]
        } else {
            var g = [1, 2, 5]
        }
        var B, s, a, t;
        var m = r("pixelsPerYLabel");
        for (var x = -10; x < 50; x++) {
            if (r("labelsKMG2")) {
                var d = Math.pow(16, x)
            } else {
                var d = Math.pow(10, x)
            }
            for (var v = 0; v < g.length; v++) {
                B = d * g[v];
                s = Math.floor(z / B) * B;
                a = Math.ceil(y / B) * B;
                t = Math.abs(a - s) / B;
                var e = o.height_ / t;
                if (e > m) {
                    break
                }
            }
            if (e > m) {
                break
            }
        }
        if (s > a) {
            B *= -1
        }
        for (var x = 0; x < t; x++) {
            var l = s + x * B;
            A.push({
                v: l
            })
        }
    }
    var u;
    var q = [];
    if (r("labelsKMB")) {
        u = 1000;
        q = ["K", "M", "B", "T"]
    }
    if (r("labelsKMG2")) {
        if (u) {
            o.warn("Setting both labelsKMB and labelsKMG2. Pick one!")
        }
        u = 1024;
        q = ["k", "M", "G", "T"]
    }
    var w = r("yAxisLabelFormatter") ? r("yAxisLabelFormatter") : r("yValueFormatter");
    for (var x = 0; x < A.length; x++) {
        var l = A[x].v;
        var b = Math.abs(l);
        var f;
        if (w != undefined) {
            f = w(l)
        } else {
            f = Dygraph.round_(l, 2)
        }
        if (q.length) {
            var p = u * u * u * u;
            for (var v = 3; v >= 0; v--, p /= u) {
                if (b >= p) {
                    f = Dygraph.round_(l / p, 1) + q[v];
                    break
                }
            }
        }
        A[x].label = f
    }
    return A
};
Dygraph.prototype.extremeValues_ = function (d) {
    var h = null,
        f = null;
    var b = this.attr_("errorBars") || this.attr_("customBars");
    if (b) {
        for (var c = 0; c < d.length; c++) {
            var g = d[c][1][0];
            if (!g) {
                continue
            }
            var a = g - d[c][1][1];
            var e = g + d[c][1][2];
            if (a > g) {
                a = g
            }
            if (e < g) {
                e = g
            }
            if (f == null || e > f) {
                f = e
            }
            if (h == null || a < h) {
                h = a
            }
        }
    } else {
        for (var c = 0; c < d.length; c++) {
            var g = d[c][1];
            if (g === null || isNaN(g)) {
                continue
            }
            if (f == null || g > f) {
                f = g
            }
            if (h == null || g < h) {
                h = g
            }
        }
    }
    return [h, f]
};
Dygraph.prototype.predraw_ = function () {
    this.computeYAxes_();
    if (this.plotter_) {
        this.plotter_.clear()
    }
    this.plotter_ = new DygraphCanvasRenderer(this, this.hidden_, this.layout_, this.renderOptions_);
    this.createRollInterface_();
    this.positionLabelsDiv_();
    this.drawGraph_()
};
Dygraph.prototype.drawGraph_ = function () {
    var D = this.rawData_;
    var o = this.is_initial_draw_;
    this.is_initial_draw_ = false;
    var A = null,
        z = null;
    this.layout_.removeAllDatasets();
    this.setColors_();
    this.attrs_.pointSize = 0.5 * this.attr_("highlightCircleSize");
    var d = [];
    var f = [];
    var a = {};
    for (var w = D[0].length - 1; w >= 1; w--) {
        if (!this.visibility()[w - 1]) {
            continue
        }
        var y = this.attr_("labels")[w];
        var b = this.attr_("connectSeparatedPoints", w);
        var m = [];
        for (var t = 0; t < D.length; t++) {
            if (D[t][w] != null || !b) {
                var B = D[t][0];
                m.push([B, D[t][w]])
            }
        }
        m = this.rollingAverage(m, this.rollPeriod_);
        var p = this.attr_("errorBars") || this.attr_("customBars");
        if (this.dateWindow_) {
            var F = this.dateWindow_[0];
            var g = this.dateWindow_[1];
            var q = [];
            var e = null,
                E = null;
            for (var s = 0; s < m.length; s++) {
                if (m[s][0] >= F && e === null) {
                    e = s
                }
                if (m[s][0] <= g) {
                    E = s
                }
            }
            if (e === null) {
                e = 0
            }
            if (e > 0) {
                e--
            }
            if (E === null) {
                E = m.length - 1
            }
            if (E < m.length - 1) {
                E++
            }
            this.boundaryIds_[w - 1] = [e, E];
            for (var s = e; s <= E; s++) {
                q.push(m[s])
            }
            m = q
        } else {
            this.boundaryIds_[w - 1] = [0, m.length - 1]
        }
        var n = this.extremeValues_(m);
        if (p) {
            for (var t = 0; t < m.length; t++) {
                val = [m[t][0], m[t][1][0], m[t][1][1], m[t][1][2]];
                m[t] = val
            }
        } else {
            if (this.attr_("stackedGraph")) {
                var r = m.length;
                var C;
                for (var t = 0; t < r; t++) {
                    var h = m[t][0];
                    if (d[h] === undefined) {
                        d[h] = 0
                    }
                    C = m[t][1];
                    d[h] += C;
                    m[t] = [h, d[h]];
                    if (d[h] > n[1]) {
                        n[1] = d[h]
                    }
                    if (d[h] < n[0]) {
                        n[0] = d[h]
                    }
                }
            }
        }
        a[y] = n;
        f[w] = m
    }
    for (var w = 1; w < f.length; w++) {
        if (!this.visibility()[w - 1]) {
            continue
        }
        this.layout_.addDataset(this.attr_("labels")[w], f[w])
    }
    var v = this.computeYAxisRanges_(a);
    var u = v[0];
    var c = v[1];
    this.layout_.updateOptions({
        yAxes: u,
        seriesToAxisMap: c
    });
    this.addXTicks_();
    this.layout_.updateOptions({
        dateWindow: this.dateWindow_
    });
    this.layout_.evaluateWithError();
    this.plotter_.clear();
    this.plotter_.render();
    this.canvas_.getContext("2d").clearRect(0, 0, this.canvas_.width, this.canvas_.height);
    if (this.attr_("drawCallback") !== null) {
        this.attr_("drawCallback")(this, o)
    }
};
Dygraph.prototype.computeYAxes_ = function () {
    this.axes_ = [{}];
    this.seriesToAxisMap_ = {};
    var h = this.attr_("labels");
    var f = {};
    for (var g = 1; g < h.length; g++) {
        f[h[g]] = (g - 1)
    }
    var e = ["includeZero", "valueRange", "labelsKMB", "labelsKMG2", "pixelsPerYLabel", "yAxisLabelWidth", "axisLabelFontSize", "axisTickSize"];
    for (var g = 0; g < e.length; g++) {
        var d = e[g];
        var n = this.attr_(d);
        if (n) {
            this.axes_[0][d] = n
        }
    }
    for (var j in f) {
        if (!f.hasOwnProperty(j)) {
            continue
        }
        var c = this.attr_("axis", j);
        if (c == null) {
            this.seriesToAxisMap_[j] = 0;
            continue
        }
        if (typeof(c) == "object") {
            var a = {};
            Dygraph.update(a, this.axes_[0]);
            Dygraph.update(a, {
                valueRange: null
            });
            Dygraph.update(a, c);
            this.axes_.push(a);
            this.seriesToAxisMap_[j] = this.axes_.length - 1
        }
    }
    for (var j in f) {
        if (!f.hasOwnProperty(j)) {
            continue
        }
        var c = this.attr_("axis", j);
        if (typeof(c) == "string") {
            if (!this.seriesToAxisMap_.hasOwnProperty(c)) {
                this.error("Series " + j + " wants to share a y-axis with series " + c + ", which does not define its own axis.");
                return null
            }
            var l = this.seriesToAxisMap_[c];
            this.seriesToAxisMap_[j] = l
        }
    }
    var m = {};
    var b = this.visibility();
    for (var g = 1; g < h.length; g++) {
        var o = h[g];
        if (b[g - 1]) {
            m[o] = this.seriesToAxisMap_[o]
        }
    }
    this.seriesToAxisMap_ = m
};
Dygraph.prototype.numAxes = function () {
    var c = 0;
    for (var b in this.seriesToAxisMap_) {
        if (!this.seriesToAxisMap_.hasOwnProperty(b)) {
            continue
        }
        var a = this.seriesToAxisMap_[b];
        if (a > c) {
            c = a
        }
    }
    return 1 + c
};
Dygraph.prototype.computeYAxisRanges_ = function (a) {
    var g = [];
    for (var h in this.seriesToAxisMap_) {
        if (!this.seriesToAxisMap_.hasOwnProperty(h)) {
            continue
        }
        var l = this.seriesToAxisMap_[h];
        while (g.length <= l) {
            g.push([])
        }
        g[l].push(h)
    }
    for (var p = 0; p < this.axes_.length; p++) {
        var b = this.axes_[p];
        if (b.valueWindow) {
            b.computedValueRange = [b.valueWindow[0], b.valueWindow[1]]
        } else {
            if (b.valueRange) {
                b.computedValueRange = [b.valueRange[0], b.valueRange[1]]
            } else {
                var h = g[p];
                var s = Infinity;
                var r = -Infinity;
                for (var n = 0; n < h.length; n++) {
                    s = Math.min(a[h[n]][0], s);
                    r = Math.max(a[h[n]][1], r)
                }
                if (b.includeZero && s > 0) {
                    s = 0
                }
                var o = r - s;
                if (o == 0) {
                    o = r
                }
                var d = r + 0.1 * o;
                var t = s - 0.1 * o;
                if (!this.attr_("avoidMinZero")) {
                    if (t < 0 && s >= 0) {
                        t = 0
                    }
                    if (d > 0 && r <= 0) {
                        d = 0
                    }
                }
                if (this.attr_("includeZero")) {
                    if (r < 0) {
                        d = 0
                    }
                    if (s > 0) {
                        t = 0
                    }
                }
                b.computedValueRange = [t, d]
            }
        }
        if (p == 0 || b.independentTicks) {
            b.ticks = Dygraph.numericTicks(b.computedValueRange[0], b.computedValueRange[1], this, b)
        } else {
            var k = this.axes_[0];
            var e = k.ticks;
            var f = k.computedValueRange[1] - k.computedValueRange[0];
            var u = b.computedValueRange[1] - b.computedValueRange[0];
            var c = [];
            for (var p = 0; p < e.length; p++) {
                var m = (e[p].v - k.computedValueRange[0]) / f;
                var q = b.computedValueRange[0] + m * u;
                c.push(q)
            }
            b.ticks = Dygraph.numericTicks(b.computedValueRange[0], b.computedValueRange[1], this, b, c)
        }
    }
    return [this.axes_, this.seriesToAxisMap_]
};
Dygraph.prototype.rollingAverage = function (m, d) {
    if (m.length < 2) {
        return m
    }
    var d = Math.min(d, m.length - 1);
    var b = [];
    var s = this.attr_("sigma");
    if (this.fractions_) {
        var k = 0;
        var h = 0;
        var e = 100;
        for (var x = 0; x < m.length; x++) {
            k += m[x][1][0];
            h += m[x][1][1];
            if (x - d >= 0) {
                k -= m[x - d][1][0];
                h -= m[x - d][1][1]
            }
            var B = m[x][0];
            var v = h ? k / h : 0;
            if (this.attr_("errorBars")) {
                if (this.wilsonInterval_) {
                    if (h) {
                        var t = v < 0 ? 0 : v,
                            u = h;
                        var A = s * Math.sqrt(t * (1 - t) / u + s * s / (4 * u * u));
                        var a = 1 + s * s / h;
                        var F = (t + s * s / (2 * h) - A) / a;
                        var o = (t + s * s / (2 * h) + A) / a;
                        b[x] = [B, [t * e, (t - F) * e, (o - t) * e]]
                    } else {
                        b[x] = [B, [0, 0, 0]]
                    }
                } else {
                    var z = h ? s * Math.sqrt(v * (1 - v) / h) : 1;
                    b[x] = [B, [e * v, e * z, e * z]]
                }
            } else {
                b[x] = [B, e * v]
            }
        }
    } else {
        if (this.attr_("customBars")) {
            var F = 0;
            var C = 0;
            var o = 0;
            var g = 0;
            for (var x = 0; x < m.length; x++) {
                var E = m[x][1];
                var l = E[1];
                b[x] = [m[x][0],
                    [l, l - E[0], E[2] - l]
                ];
                if (l != null && !isNaN(l)) {
                    F += E[0];
                    C += l;
                    o += E[2];
                    g += 1
                }
                if (x - d >= 0) {
                    var r = m[x - d];
                    if (r[1][1] != null && !isNaN(r[1][1])) {
                        F -= r[1][0];
                        C -= r[1][1];
                        o -= r[1][2];
                        g -= 1
                    }
                }
                b[x] = [m[x][0],
                    [1 * C / g, 1 * (C - F) / g, 1 * (o - C) / g]
                ]
            }
        } else {
            var q = Math.min(d - 1, m.length - 2);
            if (!this.attr_("errorBars")) {
                if (d == 1) {
                    return m
                }
                for (var x = 0; x < m.length; x++) {
                    var c = 0;
                    var D = 0;
                    for (var w = Math.max(0, x - d + 1); w < x + 1; w++) {
                        var l = m[w][1];
                        if (l == null || isNaN(l)) {
                            continue
                        }
                        D++;
                        c += m[w][1]
                    }
                    if (D) {
                        b[x] = [m[x][0], c / D]
                    } else {
                        b[x] = [m[x][0], null]
                    }
                }
            } else {
                for (var x = 0; x < m.length; x++) {
                    var c = 0;
                    var f = 0;
                    var D = 0;
                    for (var w = Math.max(0, x - d + 1); w < x + 1; w++) {
                        var l = m[w][1][0];
                        if (l == null || isNaN(l)) {
                            continue
                        }
                        D++;
                        c += m[w][1][0];
                        f += Math.pow(m[w][1][1], 2)
                    }
                    if (D) {
                        var z = Math.sqrt(f) / D;
                        b[x] = [m[x][0],
                            [c / D, s * z, s * z]
                        ]
                    } else {
                        b[x] = [m[x][0],
                            [null, null, null]
                        ]
                    }
                }
            }
        }
    }
    return b
};
Dygraph.dateParser = function (b, a) {
    var c;
    var e;
    if (b.search("-") != -1) {
        if (b.search("T") == -1) {
            c = b.replace("-", "/", "g");
            while (c.search("-") != -1) {
                c = c.replace("-", "/")
            }
            e = Date.parse(c)
        } else {
            e = Date.parse(b)
        }
    } else {
        if (b.length == 8) {
            c = b.substr(0, 4) + "/" + b.substr(4, 2) + "/" + b.substr(6, 2);
            e = Date.parse(c)
        } else {
            e = Date.parse(b)
        }
    }
    if (!e || isNaN(e)) {
        a.error("Couldn't parse " + b + " as a date")
    }
    return e
};
Dygraph.prototype.detectTypeFromString_ = function (b) {
    var a = false;
    if (b.indexOf("-") >= 0 || b.indexOf("/") >= 0 || isNaN(parseFloat(b))) {
        a = true
    } else {
        if (b.length == 8 && b > "19700101" && b < "20371231") {
            a = true
        }
    }
    if (a) {
        this.attrs_.xValueFormatter = Dygraph.dateString_;
        this.attrs_.xValueParser = Dygraph.dateParser;
        this.attrs_.xTicker = Dygraph.dateTicker;
        this.attrs_.xAxisLabelFormatter = Dygraph.dateAxisFormatter
    } else {
        this.attrs_.xValueFormatter = function (c) {
            return c
        };
        this.attrs_.xValueParser = function (c) {
            return parseFloat(c)
        };
        this.attrs_.xTicker = Dygraph.numericTicks;
        this.attrs_.xAxisLabelFormatter = this.attrs_.xValueFormatter
    }
};
Dygraph.prototype.parseCSV_ = function (h) {
    var n = [];
    var r = h.split("\n");
    var b = this.attr_("delimiter");
    if (r[0].indexOf(b) == -1 && r[0].indexOf("\t") >= 0) {
        b = "\t"
    }
    var a = 0;
    if (this.labelsFromCSV_) {
        a = 1;
        this.attrs_.labels = r[0].split(b)
    }
    var k = function (i) {
        var j = parseFloat(i);
        return isFinite(j) ? j : null
    };
    var c;
    var p = false;
    var d = this.attr_("labels").length;
    var m = false;
    for (var g = a; g < r.length; g++) {
        var q = r[g];
        if (q.length == 0) {
            continue
        }
        if (q[0] == "#") {
            continue
        }
        var f = q.split(b);
        if (f.length < 2) {
            continue
        }
        var l = [];
        if (!p) {
            this.detectTypeFromString_(f[0]);
            c = this.attr_("xValueParser");
            p = true
        }
        l[0] = c(f[0], this);
        if (this.fractions_) {
            for (var e = 1; e < f.length; e++) {
                var o = f[e].split("/");
                l[e] = [k(o[0]), k(o[1])]
            }
        } else {
            if (this.attr_("errorBars")) {
                for (var e = 1; e < f.length; e += 2) {
                    l[(e + 1) / 2] = [k(f[e]), k(f[e + 1])]
                }
            } else {
                if (this.attr_("customBars")) {
                    for (var e = 1; e < f.length; e++) {
                        var o = f[e].split(";");
                        l[e] = [k(o[0]), k(o[1]), k(o[2])]
                    }
                } else {
                    for (var e = 1; e < f.length; e++) {
                        l[e] = k(f[e])
                    }
                }
            }
        }
        if (n.length > 0 && l[0] < n[n.length - 1][0]) {
            m = true
        }
        n.push(l);
        if (l.length != d) {
            this.error("Number of columns in line " + g + " (" + l.length + ") does not agree with number of labels (" + d + ") " + q)
        }
    }
    if (m) {
        this.warn("CSV is out of order; order it correctly to speed loading.");
        n.sort(function (j, i) {
            return j[0] - i[0]
        })
    }
    return n
};
Dygraph.prototype.parseArray_ = function (b) {
    if (b.length == 0) {
        this.error("Can't plot empty data set");
        return null
    }
    if (b[0].length == 0) {
        this.error("Data set cannot contain an empty row");
        return null
    }
    if (this.attr_("labels") == null) {
        this.warn("Using default labels. Set labels explicitly via 'labels' in the options parameter");
        this.attrs_.labels = ["X"];
        for (var a = 1; a < b[0].length; a++) {
            this.attrs_.labels.push("Y" + a)
        }
    }
    if (Dygraph.isDateLike(b[0][0])) {
        this.attrs_.xValueFormatter = Dygraph.dateString_;
        this.attrs_.xAxisLabelFormatter = Dygraph.dateAxisFormatter;
        this.attrs_.xTicker = Dygraph.dateTicker;
        var c = Dygraph.clone(b);
        for (var a = 0; a < b.length; a++) {
            if (c[a].length == 0) {
                this.error("Row " + (1 + a) + " of data is empty");
                return null
            }
            if (c[a][0] == null || typeof(c[a][0].getTime) != "function" || isNaN(c[a][0].getTime())) {
                this.error("x value in row " + (1 + a) + " is not a Date");
                return null
            }
            c[a][0] = c[a][0].getTime()
        }
        return c
    } else {
        this.attrs_.xValueFormatter = function (d) {
            return d
        };
        this.attrs_.xTicker = Dygraph.numericTicks;
        return b
    }
};
Dygraph.prototype.parseDataTable_ = function (v) {
    var g = v.getNumberOfColumns();
    var f = v.getNumberOfRows();
    var e = v.getColumnType(0);
    if (e == "date" || e == "datetime") {
        this.attrs_.xValueFormatter = Dygraph.dateString_;
        this.attrs_.xValueParser = Dygraph.dateParser;
        this.attrs_.xTicker = Dygraph.dateTicker;
        this.attrs_.xAxisLabelFormatter = Dygraph.dateAxisFormatter
    } else {
        if (e == "number") {
            this.attrs_.xValueFormatter = function (i) {
                return i
            };
            this.attrs_.xValueParser = function (i) {
                return parseFloat(i)
            };
            this.attrs_.xTicker = Dygraph.numericTicks;
            this.attrs_.xAxisLabelFormatter = this.attrs_.xValueFormatter
        } else {
            this.error("only 'date', 'datetime' and 'number' types are supported for column 1 of DataTable input (Got '" + e + "')");
            return null
        }
    }
    var l = [];
    var s = {};
    var r = false;
    for (var p = 1; p < g; p++) {
        var b = v.getColumnType(p);
        if (b == "number") {
            l.push(p)
        } else {
            if (b == "string" && this.attr_("displayAnnotations")) {
                var q = l[l.length - 1];
                if (!s.hasOwnProperty(q)) {
                    s[q] = [p]
                } else {
                    s[q].push(p)
                }
                r = true
            } else {
                this.error("Only 'number' is supported as a dependent type with Gviz. 'string' is only supported if displayAnnotations is true")
            }
        }
    }
    var t = [v.getColumnLabel(0)];
    for (var p = 0; p < l.length; p++) {
        t.push(v.getColumnLabel(l[p]));
        if (this.attr_("errorBars")) {
            p += 1
        }
    }
    this.attrs_.labels = t;
    g = t.length;
    var u = [];
    var h = false;
    var a = [];
    for (var p = 0; p < f; p++) {
        var d = [];
        if (typeof(v.getValue(p, 0)) === "undefined" || v.getValue(p, 0) === null) {
            this.warn("Ignoring row " + p + " of DataTable because of undefined or null first column.");
            continue
        }
        if (e == "date" || e == "datetime") {
            d.push(v.getValue(p, 0).getTime())
        } else {
            d.push(v.getValue(p, 0))
        }
        if (!this.attr_("errorBars")) {
            for (var n = 0; n < l.length; n++) {
                var c = l[n];
                d.push(v.getValue(p, c));
                if (r && s.hasOwnProperty(c) && v.getValue(p, s[c][0]) != null) {
                    var o = {};
                    o.series = v.getColumnLabel(c);
                    o.xval = d[0];
                    o.shortText = String.fromCharCode(65 + a.length);
                    o.text = "";
                    for (var m = 0; m < s[c].length; m++) {
                        if (m) {
                            o.text += "\n"
                        }
                        o.text += v.getValue(p, s[c][m])
                    }
                    a.push(o)
                }
            }
        } else {
            for (var n = 0; n < g - 1; n++) {
                d.push([v.getValue(p, 1 + 2 * n), v.getValue(p, 2 + 2 * n)])
            }
        }
        if (u.length > 0 && d[0] < u[u.length - 1][0]) {
            h = true
        }
        for (var n = 0; n < d.length; n++) {
            if (!isFinite(d[n])) {
                d[n] = null
            }
        }
        u.push(d)
    }
    if (h) {
        this.warn("DataTable is out of order; order it correctly to speed loading.");
        u.sort(function (j, i) {
            return j[0] - i[0]
        })
    }
    this.rawData_ = u;
    if (a.length > 0) {
        this.setAnnotations(a, true)
    }
};
Dygraph.update = function (b, c) {
    if (typeof(c) != "undefined" && c !== null) {
        for (var a in c) {
            if (c.hasOwnProperty(a)) {
                b[a] = c[a]
            }
        }
    }
    return b
};
Dygraph.isArrayLike = function (b) {
    var a = typeof(b);
    if ((a != "object" && !(a == "function" && typeof(b.item) == "function")) || b === null || typeof(b.length) != "number" || b.nodeType === 3) {
        return false
    }
    return true
};
Dygraph.isDateLike = function (a) {
    if (typeof(a) != "object" || a === null || typeof(a.getTime) != "function") {
        return false
    }
    return true
};
Dygraph.clone = function (c) {
    var b = [];
    for (var a = 0; a < c.length; a++) {
        if (Dygraph.isArrayLike(c[a])) {
            b.push(Dygraph.clone(c[a]))
        } else {
            b.push(c[a])
        }
    }
    return b
};
Dygraph.prototype.start_ = function () {
    if (typeof this.file_ == "function") {
        this.loadedEvent_(this.file_())
    } else {
        if (Dygraph.isArrayLike(this.file_)) {
            this.rawData_ = this.parseArray_(this.file_);
            this.predraw_()
        } else {
            if (typeof this.file_ == "object" && typeof this.file_.getColumnRange == "function") {
                this.parseDataTable_(this.file_);
                this.predraw_()
            } else {
                if (typeof this.file_ == "string") {
                    if (this.file_.indexOf("\n") >= 0) {
                        this.loadedEvent_(this.file_)
                    } else {
                        var b = new XMLHttpRequest();
                        var a = this;
                        b.onreadystatechange = function () {
                            if (b.readyState == 4) {
                                if (b.status == 200) {
                                    a.loadedEvent_(b.responseText)
                                }
                            }
                        };
                        b.open("GET", this.file_, true);
                        b.send(null)
                    }
                } else {
                    this.error("Unknown data format: " + (typeof this.file_))
                }
            }
        }
    }
};
Dygraph.prototype.updateOptions = function (a) {
    if ("rollPeriod" in a) {
        this.rollPeriod_ = a.rollPeriod
    }
    if ("dateWindow" in a) {
        this.dateWindow_ = a.dateWindow
    }
    Dygraph.update(this.user_attrs_, a);
    Dygraph.update(this.renderOptions_, a);
    this.labelsFromCSV_ = (this.attr_("labels") == null);
    this.layout_.updateOptions({
        errorBars: this.attr_("errorBars")
    });
    if (a.file) {
        this.file_ = a.file;
        this.start_()
    } else {
        this.predraw_()
    }
};
Dygraph.prototype.resize = function (b, a) {
    if (this.resize_lock) {
        return
    }
    this.resize_lock = true;
    if ((b === null) != (a === null)) {
        this.warn("Dygraph.resize() should be called with zero parameters or two non-NULL parameters. Pretending it was zero.");
        b = a = null
    }
    this.maindiv_.innerHTML = "";
    this.attrs_.labelsDiv = null;
    if (b) {
        this.maindiv_.style.width = b + "px";
        this.maindiv_.style.height = a + "px";
        this.width_ = b;
        this.height_ = a
    } else {
        this.width_ = this.maindiv_.offsetWidth;
        this.height_ = this.maindiv_.offsetHeight
    }
    this.createInterface_();
    this.predraw_();
    this.resize_lock = false
};
Dygraph.prototype.adjustRoll = function (a) {
    this.rollPeriod_ = a;
    this.predraw_()
};
Dygraph.prototype.visibility = function () {
    if (!this.attr_("visibility")) {
        this.attrs_.visibility = []
    }
    while (this.attr_("visibility").length < this.rawData_[0].length - 1) {
        this.attr_("visibility").push(true)
    }
    return this.attr_("visibility")
};
Dygraph.prototype.setVisibility = function (b, c) {
    var a = this.visibility();
    if (b < 0 || b >= a.length) {
        this.warn("invalid series number in setVisibility: " + b)
    } else {
        a[b] = c;
        this.predraw_()
    }
};
Dygraph.prototype.setAnnotations = function (b, a) {
    Dygraph.addAnnotationRule();
    this.annotations_ = b;
    this.layout_.setAnnotations(this.annotations_);
    if (!a) {
        this.predraw_()
    }
};
Dygraph.prototype.annotations = function () {
    return this.annotations_
};
Dygraph.prototype.indexFromSetName = function (a) {
    var c = this.attr_("labels");
    for (var b = 0; b < c.length; b++) {
        if (c[b] == a) {
            return b
        }
    }
    return null
};
Dygraph.addAnnotationRule = function () {
    if (Dygraph.addedAnnotationCSS) {
        return
    }
    var f = "border: 1px solid black; background-color: white; text-align: center;";
    var e = document.createElement("style");
    e.type = "text/css";
    document.getElementsByTagName("head")[0].appendChild(e);
    for (var b = 0; b < document.styleSheets.length; b++) {
        if (document.styleSheets[b].disabled) {
            continue
        }
        var d = document.styleSheets[b];
        try {
            if (d.insertRule) {
                var a = d.cssRules ? d.cssRules.length : 0;
                d.insertRule(".dygraphDefaultAnnotation { " + f + " }", a)
            } else {
                if (d.addRule) {
                    d.addRule(".dygraphDefaultAnnotation", f)
                }
            }
            Dygraph.addedAnnotationCSS = true;
            return
        } catch (c) {}
    }
    this.warn("Unable to add default annotation CSS rule; display may be off.")
};
Dygraph.createCanvas = function () {
    var a = document.createElement("canvas");
    isIE = (/MSIE/.test(navigator.userAgent) && !window.opera);
    if (isIE && (typeof(G_vmlCanvasManager) != "undefined")) {
        a = G_vmlCanvasManager.initElement(a)
    }
    return a
};
Dygraph.GVizChart = function (a) {
    this.container = a
};
Dygraph.GVizChart.prototype.draw = function (b, a) {
    this.container.innerHTML = "";
    if (typeof(this.date_graph) != "undefined") {
        this.date_graph.destroy()
    }
    this.date_graph = new Dygraph(this.container, b, a)
};
Dygraph.GVizChart.prototype.setSelection = function (b) {
    var a = false;
    if (b.length) {
        a = b[0].row
    }
    this.date_graph.setSelection(a)
};
Dygraph.GVizChart.prototype.getSelection = function () {
    var b = [];
    var c = this.date_graph.getSelection();
    if (c < 0) {
        return b
    }
    col = 1;
    for (var a in this.date_graph.layout_.datasets) {
        b.push({
            row: c,
            column: col
        });
        col++
    }
    return b
};
DateGraph = Dygraph;

function RGBColor(g) {
    this.ok = false;
    if (g.charAt(0) == "#") {
        g = g.substr(1, 6)
    }
    g = g.replace(/ /g, "");
    g = g.toLowerCase();
    var a = {
        aliceblue: "f0f8ff",
        antiquewhite: "faebd7",
        aqua: "00ffff",
        aquamarine: "7fffd4",
        azure: "f0ffff",
        beige: "f5f5dc",
        bisque: "ffe4c4",
        black: "000000",
        blanchedalmond: "ffebcd",
        blue: "0000ff",
        blueviolet: "8a2be2",
        brown: "a52a2a",
        burlywood: "deb887",
        cadetblue: "5f9ea0",
        chartreuse: "7fff00",
        chocolate: "d2691e",
        coral: "ff7f50",
        cornflowerblue: "6495ed",
        cornsilk: "fff8dc",
        crimson: "dc143c",
        cyan: "00ffff",
        darkblue: "00008b",
        darkcyan: "008b8b",
        darkgoldenrod: "b8860b",
        darkgray: "a9a9a9",
        darkgreen: "006400",
        darkkhaki: "bdb76b",
        darkmagenta: "8b008b",
        darkolivegreen: "556b2f",
        darkorange: "ff8c00",
        darkorchid: "9932cc",
        darkred: "8b0000",
        darksalmon: "e9967a",
        darkseagreen: "8fbc8f",
        darkslateblue: "483d8b",
        darkslategray: "2f4f4f",
        darkturquoise: "00ced1",
        darkviolet: "9400d3",
        deeppink: "ff1493",
        deepskyblue: "00bfff",
        dimgray: "696969",
        dodgerblue: "1e90ff",
        feldspar: "d19275",
        firebrick: "b22222",
        floralwhite: "fffaf0",
        forestgreen: "228b22",
        fuchsia: "ff00ff",
        gainsboro: "dcdcdc",
        ghostwhite: "f8f8ff",
        gold: "ffd700",
        goldenrod: "daa520",
        gray: "808080",
        green: "008000",
        greenyellow: "adff2f",
        honeydew: "f0fff0",
        hotpink: "ff69b4",
        indianred: "cd5c5c",
        indigo: "4b0082",
        ivory: "fffff0",
        khaki: "f0e68c",
        lavender: "e6e6fa",
        lavenderblush: "fff0f5",
        lawngreen: "7cfc00",
        lemonchiffon: "fffacd",
        lightblue: "add8e6",
        lightcoral: "f08080",
        lightcyan: "e0ffff",
        lightgoldenrodyellow: "fafad2",
        lightgrey: "d3d3d3",
        lightgreen: "90ee90",
        lightpink: "ffb6c1",
        lightsalmon: "ffa07a",
        lightseagreen: "20b2aa",
        lightskyblue: "87cefa",
        lightslateblue: "8470ff",
        lightslategray: "778899",
        lightsteelblue: "b0c4de",
        lightyellow: "ffffe0",
        lime: "00ff00",
        limegreen: "32cd32",
        linen: "faf0e6",
        magenta: "ff00ff",
        maroon: "800000",
        mediumaquamarine: "66cdaa",
        mediumblue: "0000cd",
        mediumorchid: "ba55d3",
        mediumpurple: "9370d8",
        mediumseagreen: "3cb371",
        mediumslateblue: "7b68ee",
        mediumspringgreen: "00fa9a",
        mediumturquoise: "48d1cc",
        mediumvioletred: "c71585",
        midnightblue: "191970",
        mintcream: "f5fffa",
        mistyrose: "ffe4e1",
        moccasin: "ffe4b5",
        navajowhite: "ffdead",
        navy: "000080",
        oldlace: "fdf5e6",
        olive: "808000",
        olivedrab: "6b8e23",
        orange: "ffa500",
        orangered: "ff4500",
        orchid: "da70d6",
        palegoldenrod: "eee8aa",
        palegreen: "98fb98",
        paleturquoise: "afeeee",
        palevioletred: "d87093",
        papayawhip: "ffefd5",
        peachpuff: "ffdab9",
        peru: "cd853f",
        pink: "ffc0cb",
        plum: "dda0dd",
        powderblue: "b0e0e6",
        purple: "800080",
        red: "ff0000",
        rosybrown: "bc8f8f",
        royalblue: "4169e1",
        saddlebrown: "8b4513",
        salmon: "fa8072",
        sandybrown: "f4a460",
        seagreen: "2e8b57",
        seashell: "fff5ee",
        sienna: "a0522d",
        silver: "c0c0c0",
        skyblue: "87ceeb",
        slateblue: "6a5acd",
        slategray: "708090",
        snow: "fffafa",
        springgreen: "00ff7f",
        steelblue: "4682b4",
        tan: "d2b48c",
        teal: "008080",
        thistle: "d8bfd8",
        tomato: "ff6347",
        turquoise: "40e0d0",
        violet: "ee82ee",
        violetred: "d02090",
        wheat: "f5deb3",
        white: "ffffff",
        whitesmoke: "f5f5f5",
        yellow: "ffff00",
        yellowgreen: "9acd32"
    };
    for (var c in a) {
        if (g == c) {
            g = a[c]
        }
    }
    var h = [{
        re: /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/,
        example: ["rgb(123, 234, 45)", "rgb(255,234,245)"],
        process: function (i) {
            return [parseInt(i[1]), parseInt(i[2]), parseInt(i[3])]
        }
    },
    {
        re: /^(\w{2})(\w{2})(\w{2})$/,
        example: ["#00ff00", "336699"],
        process: function (i) {
            return [parseInt(i[1], 16), parseInt(i[2], 16), parseInt(i[3], 16)]
        }
    },
    {
        re: /^(\w{1})(\w{1})(\w{1})$/,
        example: ["#fb0", "f0f"],
        process: function (i) {
            return [parseInt(i[1] + i[1], 16), parseInt(i[2] + i[2], 16), parseInt(i[3] + i[3], 16)]
        }
    }];
    for (var b = 0; b < h.length; b++) {
        var e = h[b].re;
        var d = h[b].process;
        var f = e.exec(g);
        if (f) {
            channels = d(f);
            this.r = channels[0];
            this.g = channels[1];
            this.b = channels[2];
            this.ok = true
        }
    }
    this.r = (this.r < 0 || isNaN(this.r)) ? 0 : ((this.r > 255) ? 255 : this.r);
    this.g = (this.g < 0 || isNaN(this.g)) ? 0 : ((this.g > 255) ? 255 : this.g);
    this.b = (this.b < 0 || isNaN(this.b)) ? 0 : ((this.b > 255) ? 255 : this.b);
    this.toRGB = function () {
        return "rgb(" + this.r + ", " + this.g + ", " + this.b + ")"
    };
    this.toHex = function () {
        var k = this.r.toString(16);
        var j = this.g.toString(16);
        var i = this.b.toString(16);
        if (k.length == 1) {
            k = "0" + k
        }
        if (j.length == 1) {
            j = "0" + j
        }
        if (i.length == 1) {
            i = "0" + i
        }
        return "#" + k + j + i
    }
}
Date.ext = {};
Date.ext.util = {};
Date.ext.util.xPad = function (a, c, b) {
    if (typeof(b) == "undefined") {
        b = 10
    }
    for (; parseInt(a, 10) < b && b > 1; b /= 10) {
        a = c.toString() + a
    }
    return a.toString()
};
Date.prototype.locale = "en-GB";
if (document.getElementsByTagName("html") && document.getElementsByTagName("html")[0].lang) {
    Date.prototype.locale = document.getElementsByTagName("html")[0].lang
}
Date.ext.locales = {};
Date.ext.locales.en = {
    a: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    A: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    b: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    B: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    c: "%a %d %b %Y %T %Z",
    p: ["AM", "PM"],
    P: ["am", "pm"],
    x: "%d/%m/%y",
    X: "%T"
};
Date.ext.locales["en-US"] = Date.ext.locales.en;
Date.ext.locales["en-US"].c = "%a %d %b %Y %r %Z";
Date.ext.locales["en-US"].x = "%D";
Date.ext.locales["en-US"].X = "%r";
Date.ext.locales["en-GB"] = Date.ext.locales.en;
Date.ext.locales["en-AU"] = Date.ext.locales["en-GB"];
Date.ext.formats = {
    a: function (a) {
        return Date.ext.locales[a.locale].a[a.getDay()]
    },
    A: function (a) {
        return Date.ext.locales[a.locale].A[a.getDay()]
    },
    b: function (a) {
        return Date.ext.locales[a.locale].b[a.getMonth()]
    },
    B: function (a) {
        return Date.ext.locales[a.locale].B[a.getMonth()]
    },
    c: "toLocaleString",
    C: function (a) {
        return Date.ext.util.xPad(parseInt(a.getFullYear() / 100, 10), 0)
    },
    d: ["getDate", "0"],
    e: ["getDate", " "],
    g: function (a) {
        return Date.ext.util.xPad(parseInt(Date.ext.util.G(a) / 100, 10), 0)
    },
    G: function (c) {
        var e = c.getFullYear();
        var b = parseInt(Date.ext.formats.V(c), 10);
        var a = parseInt(Date.ext.formats.W(c), 10);
        if (a > b) {
            e++
        } else {
            if (a === 0 && b >= 52) {
                e--
            }
        }
        return e
    },
    H: ["getHours", "0"],
    I: function (b) {
        var a = b.getHours() % 12;
        return Date.ext.util.xPad(a === 0 ? 12 : a, 0)
    },
    j: function (c) {
        var a = c - new Date("" + c.getFullYear() + "/1/1 GMT");
        a += c.getTimezoneOffset() * 60000;
        var b = parseInt(a / 60000 / 60 / 24, 10) + 1;
        return Date.ext.util.xPad(b, 0, 100)
    },
    m: function (a) {
        return Date.ext.util.xPad(a.getMonth() + 1, 0)
    },
    M: ["getMinutes", "0"],
    p: function (a) {
        return Date.ext.locales[a.locale].p[a.getHours() >= 12 ? 1 : 0]
    },
    P: function (a) {
        return Date.ext.locales[a.locale].P[a.getHours() >= 12 ? 1 : 0]
    },
    S: ["getSeconds", "0"],
    u: function (a) {
        var b = a.getDay();
        return b === 0 ? 7 : b
    },
    U: function (e) {
        var a = parseInt(Date.ext.formats.j(e), 10);
        var c = 6 - e.getDay();
        var b = parseInt((a + c) / 7, 10);
        return Date.ext.util.xPad(b, 0)
    },
    V: function (e) {
        var c = parseInt(Date.ext.formats.W(e), 10);
        var a = (new Date("" + e.getFullYear() + "/1/1")).getDay();
        var b = c + (a > 4 || a <= 1 ? 0 : 1);
        if (b == 53 && (new Date("" + e.getFullYear() + "/12/31")).getDay() < 4) {
            b = 1
        } else {
            if (b === 0) {
                b = Date.ext.formats.V(new Date("" + (e.getFullYear() - 1) + "/12/31"))
            }
        }
        return Date.ext.util.xPad(b, 0)
    },
    w: "getDay",
    W: function (e) {
        var a = parseInt(Date.ext.formats.j(e), 10);
        var c = 7 - Date.ext.formats.u(e);
        var b = parseInt((a + c) / 7, 10);
        return Date.ext.util.xPad(b, 0, 10)
    },
    y: function (a) {
        return Date.ext.util.xPad(a.getFullYear() % 100, 0)
    },
    Y: "getFullYear",
    z: function (c) {
        var b = c.getTimezoneOffset();
        var a = Date.ext.util.xPad(parseInt(Math.abs(b / 60), 10), 0);
        var e = Date.ext.util.xPad(b % 60, 0);
        return (b > 0 ? "-" : "+") + a + e
    },
    Z: function (a) {
        return a.toString().replace(/^.*\(([^)]+)\)$/, "$1")
    },
    "%": function (a) {
        return "%"
    }
};
Date.ext.aggregates = {
    c: "locale",
    D: "%m/%d/%y",
    h: "%b",
    n: "\n",
    r: "%I:%M:%S %p",
    R: "%H:%M",
    t: "\t",
    T: "%H:%M:%S",
    x: "locale",
    X: "locale"
};
Date.ext.aggregates.z = Date.ext.formats.z(new Date());
Date.ext.aggregates.Z = Date.ext.formats.Z(new Date());
Date.ext.unsupported = {};
Date.prototype.strftime = function (a) {
    if (!(this.locale in Date.ext.locales)) {
        if (this.locale.replace(/-[a-zA-Z]+$/, "") in Date.ext.locales) {
            this.locale = this.locale.replace(/-[a-zA-Z]+$/, "")
        } else {
            this.locale = "en-GB"
        }
    }
    var c = this;
    while (a.match(/%[cDhnrRtTxXzZ]/)) {
        a = a.replace(/%([cDhnrRtTxXzZ])/g, function (e, d) {
            var g = Date.ext.aggregates[d];
            return (g == "locale" ? Date.ext.locales[c.locale][d] : g)
        })
    }
    var b = a.replace(/%([aAbBCdegGHIjmMpPSuUVwWyY%])/g, function (e, d) {
        var g = Date.ext.formats[d];
        if (typeof(g) == "string") {
            return c[g]()
        } else {
            if (typeof(g) == "function") {
                return g.call(c, c)
            } else {
                if (typeof(g) == "object" && typeof(g[0]) == "string") {
                    return Date.ext.util.xPad(c[g[0]](), g[1])
                } else {
                    return d
                }
            }
        }
    });
    c = null;
    return b
};