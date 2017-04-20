/**
 * @libary {color-picker}
 *
 * @author: misliu
 * 
 * @time: 2017-04-20 
*/

(function () {

    var ColorPicker = function (target, options) {

        //参数配置
        var defaults = {
            h: 26,
            dragMove: false,
            custombg: 'b', //[w:#fff, b: #000, g: #666]
            showRgb: false,
            showTargetBg: false,
            position: 'defaults',
            targetbg: '#ffffff',
            initColor: {
                r: 255,
                g: 0,
                b: 0,
                a: 1
            },
            // w: 300,
            // wh: 300,
            scale: 1, //缩放
            callbackHex: null, 
            calbackRgb: null
        };

        var params = colorExtend(defaults, options);
        this.bg = { w: '#ffffff', b: '#444444', g: '#666666' };
        
        this.dom = target;
        this.r = 255;
        this.g = 255;
        this.b = 255;
        this.alpha = 1;
        this.hue = 0;
        this.scale = params.scale; //[1, 2]
        
        this.size = 256 / this.scale;
        this.wheelOffset = 8 / this.scale;
        this.hueOffset = 3;
        this.rgba = 'rgbah';
        this.rgbaDoms = [];

        this.x = 0; //wheel位置记录
        this.y = 0; //wheel位置记录

        this.left = 0;
        this.top = 0;

        this.ui = this.initColorPickerUI(params);

        this.renderColorPicker(params);
    };

    ColorPicker.prototype = {

        constructor: ColorPicker,

        renderColorPicker: function (params) {

            var self = this;
            if (params.showTargetBg) {
                this.dom.value = '';
                this.dom.style.background = params.targetbg;    
                //TODO: 根据初始的hex值计算wheel的x, y坐标；
                // var hex = params.targetbg.substring(1), r, g, b;
                // if (hex.length < 6) {
                //     r = hex.substring(0, 1),
                //     g = hex.substring(1, 2),
                //     b = hex.substring(2, 3);
                // } else {
                //     r = hex.substring(0, 2),
                //     g = hex.substring(2, 4),
                //     b = hex.substring(4, 6);
                // }
                
                // r.toString(10);
                // g.toString(10);
                // b.toString(10);
                // console.log(r,g,b);

                // self.update(this.x, this.y, params);
            }

            if (!(this.ui.wrapper in document.body)) {
                self.dom.onfocus = function () {
                    document.removeEventListener('mousedown', clearWrapper);
                    document.addEventListener('mousedown', clearWrapper, false);


                    function clearWrapper(e) {
                        if (
                            // self.ui.wrapper in document.body && 
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

                            // self.ui.closed.onclick.call(document.body);
                            // document.body.removeChild(self.ui.wrapper);    
                            // document.removeEventListener('mousedown', clearWrapper);                            
                        }
                    }
                    document.body.appendChild(self.ui.wrapper);

                    if (params.dragMove) {
                        // self.addEvent([self.ui.title], 'mousedown', self.dragMove.bind(self));
                        self.wrapperDragMove(self.ui.title, self.ui.wrapper);
                    }
                    self.wheelDragMove(self.ui.board, self.ui.wheel, params);
                }

                self.selectDragMove(self.ui.bar, self.ui.selector, params);

                self.ui.closed.onclick = function () {
                    self.dom.blur();
                    document.body.removeChild(self.ui.wrapper);

                    self.setPosition(self.ui.wrapper, params);

                    if (params.callbackHex !== null) {
                        var hex = self.torgb(self.r, self.g, self.b);
                        params.callbackHex(hex);
                    }
                }

                if (params.showRgb) {
                    var ahex = this.rgbaDoms[3];
                    ahex.onchange = function (e) {
                        if (e.target.value <= 1 && e.target.value >= 0) {
                            self.alpha = (e.target.value * 100 | 0) / 100;
                            self.updatePanel(self.r, self.g, self.b);
                        }
                    
                    };
                }
            }

        },

        wrapperDragMove: function (clickTarget, moveTarget) {
            var self = this;
            clickTarget.addEventListener('mousedown', onMouseDown, false);

            function onMouseDown(e) {
                e.preventDefault();
                disX = e.pageX - self.left;
                disY = e.pageY - self.top;

                document.addEventListener('mousemove', onMouseMoveInWrapper, false);
                document.addEventListener('mouseup', onMouseUpInWrapper, false);

                function onMouseMoveInWrapper(e) {
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

                function onMouseUpInWrapper() {
                    document.removeEventListener('mousemove', onMouseMoveInWrapper);
                    document.removeEventListener('mouseup', onMouseUpInWrapper);
                }

            }
        },

        setWheelStyle: function (colorWheel) {
            if (this.scale > 1) {
                colorWheel.style.left = - this.wheelOffset * 2 + 'px';
                colorWheel.style.top = - this.wheelOffset * 2 + 'px';
            } else {
                colorWheel.style.left = - this.wheelOffset + 'px';
                colorWheel.style.top = - this.wheelOffset + 'px';
            }
            // colorWheel.style.border = '1px solid #333';                
            // colorWheel.style.borderRadius = '50%';
        },

        wheelDragMove: function (clickTarget, moveTarget, params) {
            var self = this;
            clickTarget.addEventListener('mousedown', onMouseDown, false);
            moveTarget.addEventListener('mousedown', onMouseDown, false);

            function onMouseDown(e) {
                e.preventDefault();
                var disX = e.pageX - self.left - 6 - self.wheelOffset;

                var disY = e.pageY - self.top - 42 - self.wheelOffset;
                disX = self.scale > 1 ? disX - self.scale * 2 : disX;
                disY = self.scale > 1 ? disY - self.scale * 2 + 6 : disY;                
                self.x = disX;
                self.y = disY;

                moveTarget.style.left = disX + 'px';
                moveTarget.style.top = disY + 'px';

                self.update(disX, disY, params);

                document.addEventListener('mousemove', onMouseMove, false);
                document.addEventListener('mouseup', onMouseUp, false);

                function onMouseMove(e) {
                    e.preventDefault();
                    disX = e.pageX - self.left - 6 - self.wheelOffset;
                    disY = e.pageY - self.top - 42 - self.wheelOffset;
                    if (disX < - self.wheelOffset) {
                        disX = - self.wheelOffset
                    } else if (disX > self.size - self.wheelOffset) {
                        disX = self.size - self.wheelOffset
                    }

                    if (disY < - self.wheelOffset * self.scale - (self.scale > 1 ? 2 : 0)) {
                        disY = - self.wheelOffset * self.scale - (self.scale > 1 ? 2 : 0) ;
                    } else if (disY > self.size - self.wheelOffset * self.scale - (self.scale > 1 ? 2 : 0) ) {
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
                    document.removeEventListener('mousemove', onMouseMove);
                    document.removeEventListener('mouseup', onMouseUp);
                }

            }
        },

        selectDragMove: function (clickTarget, moveTarget, params) {

            var self = this;
            clickTarget.addEventListener('mousedown', onMouseDown, false);

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

        },

        sethue: function (x, y, t, scope, params) {
            /**
             * [0-0]    [255, 0, 0]
             * [0-6]    this.B++ rgb[255, 0, 0~255];
             * [6-12]   this.R-- rgb[255~0, 0, 255];
             * [12-18]  this.G++ rgb[0, 0~255, 255];
             * [18-24]  this.B-- rgb[0, 255~0, 255];
             * [24-36]  this.R++ rgb[0~255, 0, 255];
             * [36-0]   this.G--, this.B-- rgb[255, 255~0, 255~0];
             * */
            t += 3;
            var min, max, rgb = '';
            var self = this;
            if (t <= - this.hueOffset) {
                self.r = 255;
                self.g = 0;
                self.b = 0;

            } else if (t <= scope) {
                //[0-6]    this.B++ rgb[255, 0, 0~255];
                self.r = 255;
                self.g = 0;
                self.b = Math.abs(t * 6) + 3;

            } else if (t <= 2 * scope) {
                //[6-12]   this.R-- rgb[255~0, 0, 255];
                self.r = 255 - ((t - scope) * 6 + 3);
                self.g = 0;
                self.b = 255;

            } else if (t <= 3 * scope) {
                //[12-18]  this.G++ rgb[0, 0~255, 255];
                self.r = 0;
                self.g = Math.abs((t - scope * 2) * 6 + 3);
                self.b = 255;

            } else if (t <= 4 * scope) {
                //[18-24]  this.B-- rgb[0, 255~0, 255];
                self.r = 0;
                self.g = 255;
                self.b = 255 - ((t - 3 * scope) * 6 + 3);

            } else if (t <= 5 * scope) {
                //[24-36]  this.R++ rgb[0~255, 0, 255];
                self.r = Math.abs((t - 4 * scope) * 6) + 3;
                self.g = 255;
                self.b = 0;

            } else if (t <= 6 * scope) {
                //[36-0]   this.G--, this.B-- rgb[255, 255~0, 255~0];
                self.r = 255;
                self.g = 255 - ((t - 5 * scope) * 6 + 3);
                self.b = 0;

            } else if (t >= 6 * scope) {
                self.r = 255;
                self.g = 0;
                self.b = 0;
            }
            rgb = self.r + ',' + self.g + ',' + self.b;
            self.ui.mask.style.background = 'rgb(' + rgb + ')';

            self.update(self.x, self.y, params);

        },

        update: function (x, y, params) {
            var self = this;
            var r = self.r,
                g = self.g,
                b = self.b;
            /**                   
             *   |-----------------| y(0-256)  | z (2-360) 
             *   |                 |明度        | 色相
             *   |                 |           |
             *   |      o----------|           |
             *   |      |          |           |
             *   |      |          |           |
             *   |______|__________|           |
             *  x(0-256)饱和        (0, 0)   (原点)
             */
            var h = self.hue;
            var v = (100 - 1 / self.size * (y + self.wheelOffset) * 100 | 0);
            var _s = (x + self.wheelOffset) / self.size * 100;
            var s = _s | 0;

            var colorRgb = self.hsv2rgb(h, s, v);
            // r = Math.abs(self.limitValue(colorRgb.r, 1, 0) * 255) | 0;
            // g = Math.abs(self.limitValue(colorRgb.g, 1, 0) * 255) | 0;
            // b = Math.abs(self.limitValue(colorRgb.b, 1, 0) * 255) | 0;
            r = Math.round(Math.abs(self.limitValue(colorRgb.r, 1, 0) * 255));
            g = Math.floor(Math.abs(self.limitValue(colorRgb.g, 1, 0) * 255));
            b = Math.floor(Math.abs(self.limitValue(colorRgb.b, 1, 0) * 255));

            var rgba = r + ',' + g + ',' + b + ',' + self.alpha;
            
            var color = self.torgb(r, g, b);
            if (params.showRgb) {
                self.updatePanel(r, g, b);
                this.ui.bg.style.background = 'rgba(' + rgba + ')';                
            }

            if (params.showTargetBg) {
                self.dom.style.background = 'rgba('+rgba+')';
            } else {
                self.dom.value = color;
            }
        },

        updatePanel: function (r, g, b) {
            var color = this.torgb(r, g, b);
            var rgba = r + ',' + g + ',' + b + ',' + this.alpha;
            var rhex = this.rgbaDoms[0];
            var ghex = this.rgbaDoms[1];
            var bhex = this.rgbaDoms[2];
            var ahex = this.rgbaDoms[3];
            var hex = this.rgbaDoms[4];
            rhex.value = r;
            ghex.value = g;
            bhex.value = b;

            rhex.style.backgroundPositionX =  - (255 - r)/5 + 'px';
            ghex.style.backgroundPositionX =  - (255 - g)/5 + 'px';
            bhex.style.backgroundPositionX =  - (255 - b)/5 + 'px';
            ahex.style.backgroundPositionX = - (1 - this.alpha) * 51 + 'px';            
            hex.value = color.substring(1);
            this.ui.bg.style.background = 'rgba(' + rgba + ')';
            this.dom.style.background = 'rgba('+rgba+')';
            this.r = r;
            this.g = g;
            this.b = b;
        },

        hsv2rgb: function (h, s, v) {
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
        },

        limitValue: function (value, max, min) {
            return (value > max ? max : value < min ? min : value);
        },

        setWrapperbg: function (wrapper, params) {
            wrapper.style.background = this.bg[params.custombg];
            wrapper.style.height = (45 + this.size - 10) + 'px';
        },

        setBoardStyle: function (colorMaskParent) {
            colorMaskParent.style.width = this.size + 'px';
            colorMaskParent.style.height = this.size + 'px';
        },

        setBarStyle: function (colorbar) {
            colorbar.style.height = this.size + 'px';
            if (this.scale > 1) {
                colorbar.style.width = '12px';
                colorbar.style.backgroundSize = '100% 1500%';                
            }
        },
        setSelectStyle: function (selector) {
            if (this.scale > 1) {
                selector.style.width = '12px';
            }
        },

        setTitle: function (title) {
            if (this.scale > 1) {
                title.style.height = '24px';
                title.style.lineHeight = '24px';
                title.style.textIndent = '7px';
            }
        },

        setClosed: function (closed) {
            if (this.scale > 1) {
                closed.style.margin = '2px 5px 0 0';
            }
        },

        setPanelStyle: function (panel, bg, row, value) {
            if (this.scale > 1) {
                panel.style.height = '108px';
                bg.style.height = '12px';
                row.style.height = '18px';
                row.style.lineHeight = '18px';
                value.style.fontSize = '12px';
                value.style.lineHeight = '16px';
            }
        },

        initColorPickerUI: function (params) {

            var colorWrapper = getDom('div', 'color-wrapper'),
                colorTitle = getDom('div', 'color-title'),
                colorClosed = getDom('span', 'color-closed'),
                colorMaskParent = getDom('div', 'color-mask-parent'),
                colorBoard = getDom('div', 'color-board'),
                colorMask = getDom('div', 'color-mask'),
                colorWheel = getDom('div', 'color-wheel'),
                colorbar = getDom('div', 'color-bar'),
                colorSelector = getDom('div', 'color-bar-selected'),
                colorPanel = null;

            colorTitle.textContent = 'color picker';
            colorTitle.appendChild(colorClosed);

            //设置滚轮的样式
            this.setWrapperbg(colorWrapper, params);
            this.setTitle(colorTitle);
            this.setClosed(colorClosed);
            this.setWheelStyle(colorWheel);
            this.setBoardStyle(colorMaskParent);
            this.setBarStyle(colorbar);
            this.setSelectStyle(colorSelector);
            colorbar.appendChild(colorSelector);

            var r = params.initColor.r,
                g = params.initColor.g,
                b = params.initColor.b;

            colorMask.style.background = 'rgb(' + r + ',' + g + ',' + b + ')';

            if (params.showRgb) {
                colorPanel = getDom('div', 'color-hex-panel');
                var colorbg = getDom('div', 'color-hex-bg');

                colorbg.style.background = 'rgba(' + this.r + ',' + this.g + ',' + this.b + ',' + this.alpha + ')';
                colorPanel.appendChild(colorbg);
                for (var i = 0; i < this.rgba.length; i++) {

                    var colorRow = getDom('div', 'color-hex-row'),
                        colorKey = getDom('span', 'color-hex-key'),
                        colorValueBox = getDom('div', 'color-hex-box'),
                        colorValue = getDom('input', 'color-hex-value');

                    colorKey.textContent = this.rgba[i] + ':';
                    colorValue.className += ' ' + this.rgba[i] + 'hex';
                    colorValue.type = 'text';
                    if (this.rgba[i] === 'a') {
                        colorValue.maxLength = 3;
                    }
                    this.rgbaDoms.push(colorValue);

                    add(colorRow, [colorKey, colorValue]);

                    colorPanel.appendChild(colorRow);
                     this.setPanelStyle(colorPanel, colorbg, colorRow, colorValue)                    
                }
                
                this.rgbaDoms[0].value = this.r;
                this.rgbaDoms[1].value = this.g;
                this.rgbaDoms[2].value = this.b;
                this.rgbaDoms[3].value = this.alpha;
                this.rgbaDoms[4].value = this.torgb(this.r, this.g, this.b);

                this.rgbaDoms[0].style.backgroundPositionX =  - (255 - this.r)/5 + 'px';
                this.rgbaDoms[1].style.backgroundPositionX =  - (255 - this.g)/5 + 'px';
                this.rgbaDoms[2].style.backgroundPositionX =  - (255 - this.b)/5 + 'px';
                this.rgbaDoms[3].style.backgroundPositionX = - (1 - this.alpha) * 51 + 'px';


            }

            this.setPosition(colorWrapper, params);

            add(colorMaskParent, [colorBoard, colorMask, colorWheel]);
            add(colorWrapper, [colorTitle, colorMaskParent, colorbar, colorPanel]);

            return {
                wrapper: colorWrapper,
                title: colorTitle,
                closed: colorClosed,
                colorMaskParent: colorMaskParent,
                board: colorBoard,
                mask: colorMask,
                wheel: colorWheel,
                bar: colorbar,
                bg: colorbg,
                selector: colorSelector,
                panel: colorPanel,
                row: colorRow,
                key: colorKey,
                value: colorValue
            };

        },

        setPosition: function (wrapper, params) {


            switch (params.position) {

                case 'l b':
                    this.left = this.dom.offsetLeft;
                    this.top = this.dom.offsetTop + params.h;
                    wrapper.style.left = (this.left - 1) + 'px';
                    wrapper.style.top = this.top + 'px';
                    break;
                case 'r b':
                    break;
                case 'l t':
                    break;
                case 'r t':
                    break;
                default:
                    break;
            }

        },

        torgb: function (r, g, b) {
            return '#' + hex2(r) + hex2(g) + hex2(b);
        }

    };

    function to2(n) {
        return parseInt(n) > 9 ? n : '0' + n;
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

    window.ColorPicker = ColorPicker;

})();