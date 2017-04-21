/**
 * @libary {color-picker}
 * @author: misliu
 * @time: 2017-04-20 
 */

(function () {
    "use strict";
    /**
     * Class constructor for colorpicker plugin.
     * see demo at:http://github.com/misliu/misliu.github.io/plugins/colorpicker
     * @constructor
     * @param {target, options} dom and config
     */
    var ColorPicker = function (target, options) {

        this.dom = target;
        this.cssPreFix = 'colorpicker-';

        var defaults = {
            h: 26,
            dragMove: false,
            customBg: 'b',
            showRgbProps: false,
            showTargetBg: false,
            changeTargetValue: false,
            position: 'defaults',
            targetBg: '#ffffff',
            initColor: {
                r: 255,
                g: 0,
                b: 0,
                a: 1
            },
            scale: 1,
            callbackHex: null,
            callbackRgb: null,
            customClassName: null
        };
        var params = colorExtend(defaults, options);

        this.bgType = {
            w: '#ffffff',
            b: '#444444',
            g: '#888888'
        };
        this.id = this.cssPreFix + this.dom.id;
        this.r = 255;
        this.g = 255;
        this.b = 255;
        this.alpha = 1;
        this.hue = 0;
        this.scale = params.scale;
        this.size = 256 / this.scale;
        this.wheelOffset = 8 / this.scale;
        this.hueOffset = 3;
        this.rgba = 'rgbah';
        this.rgbaDomList = [];

        this.x = 0;
        this.y = 0;
        this.left = 0;
        this.top = 0;

        this.ui = this.renderColorPickerUI(params);

        this.initColorPicker(params);
    }
    window["ColorPicker"] = ColorPicker;

    ColorPicker.prototype.constructor = ColorPicker;

    /**
     * @method to2 {function}
     */

    // ColorPicker.to2 = to2;
    // ColorPicker.hex2 = hex2;
    // ColorPicker.extend = colorExtend;
    // ColorPicker.getDom = getDom;
    // ColorPicker.add = add;
    // ColorPicker.remove = remove;
    // ColorPicker.addEvent = addEvent;
    // ColorPicker.removeEvent = removeEvent;

    /**
     * init colorpioker ui className
     * @enum {string}
     * @private
     */

    ColorPicker.prototype.cssClasses = {
        WRAPPER: "wrapper",
        TITLE: "title",
        CLOSED: "closed",
        BOARD_PARENT: "board-parent",
        BOARD: "board",
        MASK: "mask",
        WHEEL: "wheel",
        BAR: "bar",
        SELECTOR: "selector",
        PANEL: "panel",
        BG: "bg",
        ROW: "row",
        KEY: "key",
        // BOX: "box",
        VALUE: "value",
        HEX: "hex"
    };

    ColorPicker.prototype.renderColorPickerUI = function (params) {

        if (params.customClassName) {
            params.customClassName(this.cssClasses);
        }

        var colorPickerWrapper = getDom("div", this.cssPreFix + this.cssClasses.WRAPPER),
            colorPickerTitle = getDom("div", this.cssPreFix + this.cssClasses.TITLE),
            colorPickerClosed = getDom("span", this.cssPreFix + this.cssClasses.CLOSED),
            colorPickerBoardParent = getDom("div", this.cssPreFix + this.cssClasses.BOARD_PARENT),
            colorPickerBoard = getDom("div", this.cssPreFix + this.cssClasses.BOARD),
            colorPickerMask = getDom("div", this.cssPreFix + this.cssClasses.MASK),
            colorPickerWheel = getDom("div", this.cssPreFix + this.cssClasses.WHEEL),
            colorPickerBar = getDom("div", this.cssPreFix + this.cssClasses.BAR),
            colorPickerSelector = getDom("div", this.cssPreFix + this.cssClasses.SELECTOR),
            colorPickerPanel = null,
            r, g, b;

        colorPickerWrapper.id = this.id;
        colorPickerTitle.textContent = "color picker";
        colorPickerTitle.appendChild(colorPickerClosed);
        colorPickerBar.appendChild(colorPickerSelector);
        r = params.initColor.r;
        g = params.initColor.g;
        b = params.initColor.b;

        setStyle(colorPickerMask, 'background', 'rgb(' + r + ',' + g + ',' + b + ')');

        if (params.showRgbProps) {

            colorPickerPanel = getDom('div', this.cssPreFix + this.cssClasses.PANEL);

            var colorPickerBg = getDom('div', this.cssPreFix + this.cssClasses.BG);
            var rgba = 'rgba(' + this.r + ',' + this.g + ',' + this.b + ',' + this.alpha + ')';
            setStyle(colorPickerBg, 'background', rgba);
            colorPickerPanel.appendChild(colorPickerBg);

            for (var i = 0; i < this.rgba.length; i++) {
                var colorPickerRow = getDom('div', this.cssPreFix + this.cssClasses.ROW),
                    colorPickerKey = getDom('span', this.cssPreFix + this.cssClasses.KEY),
                    colorPickerValue = getDom('input', this.cssPreFix + this.cssClasses.VALUE);

                colorPickerKey.textContent = this.rgba[i] + ':';
                colorPickerValue.className += ' ' + this.rgba[i] + this.cssClasses.HEX;
                colorPickerValue.type = 'text';

                if (this.rgba[i] === 'a') {
                    colorPickerValue.maxLength = 3;
                }

                this.rgbaDomList.push(colorPickerValue);
                add(colorPickerRow, [colorPickerKey, colorPickerValue]);
                colorPickerPanel.appendChild(colorPickerRow);
                this.setRgbaPanelStyle(colorPickerPanel, colorPickerBg, colorPickerRow, colorPickerValue);
            }

            this.rgbaDomList[0].value = this.r;
            this.rgbaDomList[1].value = this.g;
            this.rgbaDomList[2].value = this.b;
            this.rgbaDomList[3].value = this.alpha;
            this.rgbaDomList[4].value = this.rgbToHex(this.r, this.g, this.b);

            this.rgbaDomList[0].style.backgroundPositionX = - (255 - this.r) / 5 + 'px';
            this.rgbaDomList[1].style.backgroundPositionX = - (255 - this.g) / 5 + 'px';
            this.rgbaDomList[2].style.backgroundPositionX = - (255 - this.b) / 5 + 'px';
            this.rgbaDomList[3].style.backgroundPositionX = - (1 - this.alpha) * 51 + 'px';
        }

        this.setPosition(colorPickerWrapper, params);

        add(colorPickerBoardParent, [colorPickerBoard, colorPickerMask, colorPickerWheel]);
        add(colorPickerWrapper, [colorPickerTitle, colorPickerBoardParent, colorPickerBar, colorPickerPanel]);

        var colorPickerDomStack = {
            wrapper: colorPickerWrapper,
            title: colorPickerTitle,
            closed: colorPickerClosed,
            boardParent: colorPickerBoardParent,
            board: colorPickerBoard,
            mask: colorPickerMask,
            wheel: colorPickerWheel,
            bar: colorPickerBar,
            bg: colorPickerBg,
            selector: colorPickerSelector,
            panel: colorPickerPanel,
            row: colorPickerRow,
            key: colorPickerKey,
            value: colorPickerValue
        };
        this.setColorPickerStyle(colorPickerDomStack, params);
        return colorPickerDomStack;
    };

    ColorPicker.prototype.setColorPickerStyle = function (colorpicker, params) {
        colorpicker.wrapper.style.background = this.bgType[params.customBg];
        colorpicker.wrapper.style.height = (45 + this.size - 10) + 'px';
        colorpicker.boardParent.style.width = this.size + 'px';
        colorpicker.boardParent.style.height = this.size + 'px';
        if (this.scale > 1) {
            colorpicker.title.style.height = '24px';
            colorpicker.title.style.lineHeight = '24px';
            colorpicker.title.style.textIndent = '7px';

            colorpicker.closed.style.margin = '2px 5px 0 0';

            colorpicker.wheel.style.left = - this.wheelOffset * 2 + 'px';
            colorpicker.wheel.style.top = - this.wheelOffset * 2 + 'px';

            colorpicker.bar.style.width = '12px';
            colorpicker.bar.style.height = this.size + 'px';
            colorpicker.bar.style.backgroundSize = '100% 1500%';

            colorpicker.selector.style.width = '12px';
        } else {
            colorpicker.wheel.style.left = - this.wheelOffset + 'px';
            colorpicker.wheel.style.top = - this.wheelOffset + 'px';
        }
    };

    ColorPicker.prototype.setRgbaPanelStyle = function (panel, bg, row, value) {
        if (this.scale > 1) {
            panel.style.height = '108px';
            bg.style.height = '12px';
            row.style.height = '18px';
            row.style.lineHeight = '18px';
            value.style.fontSize = '12px';
            value.style.lineHeight = '16px';
        }
    };


    ColorPicker.prototype.initColorPicker = function (params) {
        var self = this;
        if (params.showTargetBg) {
            setStyle(this.dom, 'background', params.targetBg);
        }

        if (params.changeTargetValue) {
            var color = this.rgbToHex(this.r, this.g, this.b);
            this.dom.value = color;
        }

        //检测document中是否已经渲染了colorpicker
        var hasWrapper = document.getElementById(this.id);

        if (!hasWrapper) {
            addEvent(this.dom, 'focus', showWrapper);

            addEvent(this.ui.closed, 'click', hideWrapper);

            addEvent(document, 'mousedown', clearWrapper);

            if (params.showRgbProps) {
                addEvent(this.ui.panel, 'mousedown', cancelEvent);                
            }            

            if (params.dragMove) {
                this.dragMove(this.ui.title, this.ui.wrapper);
            }
            this.wheelDragMove(this.ui.board, this.ui.wheel, params);
            self.selectDragMove(self.ui.bar, self.ui.selector, params);
        }

        function cancelEvent (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        function showWrapper() {
            document.body.appendChild(self.ui.wrapper);
        }

        function hideWrapper() {
            var hasWrapper = document.getElementById(self.id);
            if (!!hasWrapper) {
                self.dom.blur();
                document.body.removeChild(self.ui.wrapper);
                self.setPosition(self.ui.wrapper, params);

                if (params.callbackHex !== null) {
                    var hex = self.rgbToHex(self.r, self.g, self.b);
                    params.callbackHex(hex);
                }

                if (params.callbackRgb !== null) {
                    var rgb = self.r + ',' + self.g + ',' + self.b;
                    params.callbackHex(rgb);
                }
            }
        }

        function clearWrapper(e) {
            var hasWrapper = document.getElementById(self.id);
            if (
                !!hasWrapper &&
                e.target !== self.dom &&
                e.target !== self.ui.wrapper &&
                e.target !== self.ui.title &&
                e.target !== self.ui.closed &&
                e.target !== self.ui.board &&
                e.target !== self.ui.wheel &&
                e.target !== self.ui.bar &&
                e.target !== self.ui.selector &&
                e.target !== self.ui.panel &&
                e.target !== self.ui.bg &&
                e.target !== self.ui.row) {

                document.body.removeChild(self.ui.wrapper);
                self.setPosition(self.ui.wrapper, params);
            }
        }

    };

    ColorPicker.prototype.dragMove = function (clickTarget, moveTarget) {
        var self = this;
        addEvent(clickTarget, 'mousedown', onMouseDown);
        function onMouseDown(e) {
            e.preventDefault();
            var disX = e.pageX - self.left,
                disY = e.pageY - self.top;
            addEvent(document, 'mousemove', onMouseMove);
            addEvent(document, 'mouseup', onMouseUp);

            function onMouseMove(e) {
                e.preventDefault();
                var left = e.pageX - disX;
                var top = e.pageY - disY;
                var maxL = document.documentElement.clientWidth - moveTarget.clientWidth - 2;
                var maxT = document.documentElement.clientHeight - moveTarget.clientHeight - 2;

                if (left < 0) {
                    left = 0;
                } else if (left > maxL) {
                    left = maxL
                }

                if (top < 0) {
                    top = 0;
                } else if (top > maxT) {
                    top = maxT;
                }


                self.left = left;
                self.top = top;

                moveTarget.style.left = left + 'px';
                moveTarget.style.top = top + 'px';

                return false;
            }

            function onMouseUp() {
                removeEvent(document, 'mousemove', onMouseMove);
                removeEvent(document, 'mouseup', onMouseUp);
            }

        }
    };

    ColorPicker.prototype.wheelDragMove = function (clickTarget, moveTarget, params) {
        var self = this;
        addEvent(clickTarget, 'mousedown', onMouseDown);
        addEvent(moveTarget, 'mousedown', onMouseDown);

        function onMouseDown(e) {
            e.preventDefault();
            var disX = e.pageX - self.left - 6 - self.wheelOffset;

            var disY = e.pageY - self.top - 43 - self.wheelOffset;
            disX = self.scale > 1 ? disX - self.scale * 2 : disX;
            disY = self.scale > 1 ? disY - self.scale * 2 + 6 : disY;
            self.x = disX;
            self.y = disY;

            moveTarget.style.left = disX + 'px';
            moveTarget.style.top = disY + 'px';

            self.update(disX, disY, params);

            addEvent(document, 'mousemove', onMouseMove);
            addEvent(document, 'mouseup', onMouseUp);

            function onMouseMove(e) {
                e.preventDefault();
                disX = e.pageX - self.left - 6 - self.wheelOffset;
                disY = e.pageY - self.top - 43 - self.wheelOffset;
                if (disX < - self.wheelOffset) {
                    disX = - self.wheelOffset
                } else if (disX > self.size - self.wheelOffset) {
                    disX = self.size - self.wheelOffset
                }

                if (disY < - self.wheelOffset * self.scale - (self.scale > 1 ? 2 : 0)) {
                    disY = - self.wheelOffset * self.scale - (self.scale > 1 ? 2 : 0);
                } else if (disY > self.size - self.wheelOffset * self.scale - (self.scale > 1 ? 2 : 0)) {
                    disY = self.size - self.wheelOffset * self.scale - (self.scale > 1 ? 2 : 0);
                }
                disX = self.scale > 1 ? disX - self.scale * 2 : disX;
                disY = self.scale > 1 ? disY - self.scale * 2 + 6 : disY;
                self.x = disX;
                self.y = disY;

                self.update(disX, disY, params);
                moveTarget.style.left = disX + 'px';
                moveTarget.style.top = disY + 'px';
            }

            function onMouseUp() {
                removeEvent(document, 'mousemove', onMouseMove);
                removeEvent(document, 'mouseup', onMouseUp);
            }

        }
    };

    ColorPicker.prototype.selectDragMove = function (clickTarget, moveTarget, params) {
        var self = this;
        addEvent(clickTarget, 'mousedown', onMouseDown);

        function onMouseDown(e) {
            e.preventDefault();
            var top = self.ui.bar.offsetTop;
            var t = self.top + top;
            var scope = self.size / 6 | 0; //分区                
            var disX = self.ui.wheel.offsetLeft + self.wheelSize;
            var disY = self.ui.wheel.offsetTop + self.wheelSize;

            var y = e.pageY - t - self.hueOffset;
            var h = 360 / (256 / self.scale);
            self.hue = 360 - Math.round((y + self.hueOffset) * h);
            self.sethue(disX, disY, y, scope, params);

            self.update(self.x, self.y, params);
            moveTarget.style.top = y + 'px';

            document.addEventListener('mousemove', onMouseMove, false);
            document.addEventListener('mouseup', onMouseUp, false);

            function onMouseMove(e) {
                e.preventDefault();
                disX = self.ui.wheel.offsetLeft + self.wheelSize;
                disY = self.ui.wheel.offsetTop + self.wheelSize;

                y = e.pageY - t - self.hueOffset;

                if (y < - self.hueOffset) {
                    y = - self.hueOffset;
                } else if (y > self.size - self.hueOffset) {
                    y = self.size - self.hueOffset;
                }
                self.hue = 360 - Math.round((y + self.hueOffset) * h);
                self.sethue(disX, disY, y, scope, params);

                self.update(self.x, self.y, params);

                var rgb = self.r + ',' + self.g + ',' + self.b;

                moveTarget.style.top = y + 'px';
            }

            function onMouseUp() {

                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);

            }

        }

    };

    ColorPicker.prototype.setPosition = function (wrapper, params) {
        switch (params.position) {
            case 'r b':
                break;
            case 'l t':
                break;
            case 'r t':
                break;
            case 'l b':
            default:
                this.left = this.dom.offsetLeft;
                this.top = this.dom.offsetTop + params.h;
                wrapper.style.left = (this.left - 1) + 'px';
                wrapper.style.top = this.top + 'px';
                break;
        }
    };

    ColorPicker.prototype.rgbToHex = function (r, g, b) {
        return '#' + hex2(r) + hex2(g) + hex2(b);
    };

    ColorPicker.prototype.limitValue = function (value, max, min) {
        return (value > max ? max : value < min ? min : value);
    };

    ColorPicker.prototype.sethue = function (x, y, t, scope, params) {
        /**
         * [0-0]    [255, 0, 0]
         * [0-6]    this.B++ rgb[255, 0, 0~255];
         * [6-12]   this.R-- rgb[255~0, 0, 255];
         * [12-18]  this.G++ rgb[0, 0~255, 255];
         * [18-24]  this.B-- rgb[0, 255~0, 255];
         * [24-36]  this.R++ rgb[0~255, 0, 255];
         * [36-0]   this.B-- rgb[255, 0, 255~0];
         * */
        var offset = this.hueOffset;
        t += offset;
        if (t <= - this.hueOffset) {
            this.r = 255;
            this.g = 0;
            this.b = 0;
        } else if (t <= scope) {
            this.r = 255;
            this.g = 0;
            this.b = Math.abs(t * 6) + offset;
        } else if (t <= 2 * scope) {
            this.r = 255 - ((t - scope) * 6 + offset);
            this.g = 0;
            this.b = 255;
        } else if (t <= 3 * scope) {
            this.r = 0;
            this.g = Math.abs((t - scope * 2) * 6 + offset);
            this.b = 255;
        } else if (t <= 4 * scope) {
            this.r = 0;
            this.g = 255;
            this.b = 255 - ((t - 3 * scope) * 6 + offset);
        } else if (t <= 5 * scope) {
            this.r = Math.abs((t - 4 * scope) * 6) + offset;
            this.g = 255;
            this.b = 0;
        } else if (t <= 6 * scope) {
            this.r = 255;
            this.g = 255 - ((t - 5 * scope) * 6 + offset);
            this.b = 0;
        } else {
            this.r = 255;
            this.g = 0;
            this.b = 0;
        }
        var rgb = this.r + ',' + this.g + ',' + this.b;
        this.ui.mask.style.background = 'rgb(' + rgb + ')';
        this.update(this.x, this.y, params);
    };

    ColorPicker.prototype.update = function (x, y, params) {
        var r = this.r,
            g = this.g,
            b = this.b,
            h = this.hue,
            v = (100 - 1 / this.size * (y + this.wheelOffset) * 100 | 0),
            s = (x + this.wheelOffset) / this.size * 100 | 0,
            rgbPercent = this.hsv2rgb(h, s, v);

        r = Math.round(Math.abs(this.limitValue(rgbPercent.r, 1, 0) * 255));
        g = Math.round(Math.abs(this.limitValue(rgbPercent.g, 1, 0) * 255));
        b = Math.round(Math.abs(this.limitValue(rgbPercent.b, 1, 0) * 255));
        var rgba = r + ',' + g + ',' + b + ',' + this.alpha,
            color = this.rgbToHex(r, g, b);
        if (params.showRgbProps) {
            this.updateRgbPanel(r, g, b);
            this.ui.bg.style.background = 'rgba(' + rgba + ')';
        }

        if (params.showTargetBg) {
            this.dom.style.background = 'rgba(' + rgba + ')';
        }

        if (params.changeTargetValue) {
            this.dom.value = color;
        }
    };

    ColorPicker.prototype.updateRgbPanel = function (r, g, b) {
        var color = this.rgbToHex(r, g, b),
            rgba = r + ',' + g + ',' + b + ',' + this.alpha,
            rhex = this.rgbaDomList[0],
            ghex = this.rgbaDomList[1],
            bhex = this.rgbaDomList[2],
            ahex = this.rgbaDomList[3],
            hex = this.rgbaDomList[4];
        rhex.value = r;
        ghex.value = g;
        bhex.value = b;

        rhex.style.backgroundPositionX = - (255 - r) / 5 + 'px';
        ghex.style.backgroundPositionX = - (255 - g) / 5 + 'px';
        bhex.style.backgroundPositionX = - (255 - b) / 5 + 'px';
        ahex.style.backgroundPositionX = - (1 - this.alpha) * 51 + 'px';
        hex.value = color.substring(1);
        this.ui.bg.style.background = 'rgba(' + rgba + ')';
        if (this.showTargetBg) {
            this.dom.style.background = 'rgba(' + rgba + ')';
        }
        this.r = r;
        this.g = g;
        this.b = b;
    };

    ColorPicker.prototype.hsv2rgb = function (h, s, v) {
        var h = h / 360 * 6,
            s = s / 100,
            v = v / 100,
            i = ~~h,
            f = h - i,
            p = v * (1 - s),
            q = v * (1 - f * s),
            t = v * (1 - (1 - f) * s),
            mod = i % 6;
        return {
            r: [v, q, p, p, t, v][mod],
            g: [t, v, v, q, p, p][mod],
            b: [p, p, t, v, v, q][mod]
        };
    };

    function setStyle(obj, type, attr) {
        obj.style[type] = attr;
    }

    function to2(n) {
        /**
         * 转化的数字必须是整型
         */
        n = n | 0;
        return n > 9 ? '0' + 9 : n;
    }

    function hex2(hex) {
        return (hex < 16 ? '0' : '') + hex.toString(16);
    }

    function colorExtend(target, options) {
        for (var prop in target) {
            if (options.hasOwnProperty(prop)) {
                target[prop] = options[prop];
            }
        }
        return target;
    }

    function getDom(dom, className) {
        var domEle = document.createElement(dom);
        domEle.className = className;
        return domEle;
    }

    function add(parent, doms) {
        var i = 0, l = doms.length;
        for (; i < l; i++) {
            if (doms[i]) {
                parent.appendChild(doms[i]);
            }
        }
    }

    function remove(parent, doms) {
        var i = 0, l = doms.length;
        for (; i < l; i++) {
            if (doms[i]) {
                parent.removeChild(doms[i]);
            }
        }
    }

    function addEvent(dom, type, method) {
        if (Array.isArray(dom)) {
            for (var i = 0, l = dom.length; i < l; i++) {
                if (dom[i]) {
                    dom[i].addEventListener(type, method, false);
                }
            }
        } else {
            dom.addEventListener(type, method, false);
        }
    }

    function removeEvent(dom, type, method) {
        if (Array.isArray(dom)) {
            for (var i = 0, l = dom.length; i < l; i++) {
                if (dom[i]) {
                    dom[i].removeEventListener(type, method, false);
                }
            }
        } else {
            dom.removeEventListener(type, method, false);
        }
    }

})();