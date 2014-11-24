/**
 * Created by admin on 2014/11/6.
 * 类jQuery库
 */
(function(window,undefined){
    var doc = window.document;
    var slice = [].slice,
        toStr = {}.toString;
    Screen.version = '0.1.0';
    Screen.support = {
        sliceOnNodeList: (function(){
            var b = doc.getElementsByTagName('body');
            var flag = true;
            try{ // ie 678下会出错
                slice.apply(b);
            }catch(e){
                flag = false;
            }
            return flag;
        })(),
        cssFloat: (function(){
            var d = doc.createElement('div');
            d.innerHTML = '<p style="float:left"><\/p>';
            var p = d.getElementsByTagName('p')[0];
            var ret;
            ret = !!p.style.cssFloat;
            d = null;
            return ret;
        })(),
        opacity: (function(){
            var d = doc.createElement('div'),a;
            d.innerHTML = '<a></a>';
            a = d.getElementsByTagName('a')[0];
            a.style.cssText = 'opacity:0.5';
            return !!a.style.opacity;
        })(),
        // ie 6,7 不支持setAttribute 设置class for等属性
        //http://www.cnblogs.com/snandy/archive/2011/08/27/2155300.html
        setAttr: (function(){
            var d = doc.createElement('div');
            d.setAttribute('class','abc');
            return d.className === 'abc' ? true : false;
        })(),
        classList: (function(){
            var d = doc.createElement('div');
            return !!d.classList
        })(),
        innerHTMLInTable: (function(){
            var table = doc.createElement('table'),
            tbody = doc.createElement('tbody');
            table.appendChild(tbody);
            var flag = true;
            try{
                tbody.innerHTML = '<tr></tr>';
            }catch (e){
                flag = false;
            }
            table = null;
            tbody = null;
            return flag;
        })()
    };

    //浏览器嗅探
    Screen.browser = (function(window,document,undefined){
        var engine,name,version,
            isIe = false,
            isFirefox = false,
            isChrome = false,
            isOpera = false,
            isSafari = false,
            isIe10 = false,
            isIe9 = false,
            isIe8 = false,
            isIe7 = false,
            isIe6 = false,
            isStandardMode = true,
            ua = window.navigator.userAgent;
        if(document.compatMode === 'CSS1Compat'){
            isStandardMode = true;
        }else{
            isStandardMode = false;
        }
        if(/MSIE|Trident/.test(ua)){
            engine = "Trident";
        }else if(/WebKit/.test(ua)){
            engine = "WebKit";
        }else if(/Gecko/.test(ua)){
            engine = 'Gecko';
        }else if(/Presto/.test(ua)){
            engine = 'Presto';
        }

        if(ua.match(/(IE|Firefox|Chrome|Safari|Opera)(?:\/)(\d+)/)){
            name = RegExp.$1;
            switch (name){
                case 'IE':
                    isIe = true;
                    break;
                case 'Firefox':
                    isFirefox = true;
                    break;
                case 'Chrome':
                    isChrome = true;
                    break;
                case 'Safari':
                    isSafari = true;
                    break;
                case 'Opera':
                    isOpera = true;
                    break;
            }
            version = parseInt(RegExp.$2);
            if(ua.match(/Version\/(\d+)/)){
                version = parseInt(RegExp.$1);
            }
        }

        if(isIe){
            if(window.WebSocket){
                isIe10 = true;
            }else if(window.HTMLElement){
                isIe9 = true;
            }else if(window.localStorage){
                isIe8 = true;
            }else if(document.documentElement.currentStyle.minWidth){
                isIe7 = true;
            }else{
                isIe6 = true;
                try{// ie6不会对背景图片进行缓存，可通过如下实现，图片缓存在ie6的内存中。
                    document.execCommand('BackgroundImageCache',null,false);
                }catch(e){}
            }
        }

        return {
            engine : engine,
            name : name,
            version : version,
            isIe : isIe,
            isFirefox : isFirefox,
            isChrome : isChrome,
            isOpera : isOpera,
            isSafari : isSafari,
            isIe10 : isIe10,
            isIe9 : isIe9,
            isIe8 : isIe8,
            isIe7 : isIe7,
            isIe6 : isIe6,
            isStandardMode : isStandardMode
        }
    })(window,document);

    //类型判定
    Screen.isObject = function(obj){
        return typeof obj === 'object' ? true : false;
    }
    Screen.isArray = function(obj){
        return toStr.apply(obj) === '[object Array]' ? true : false;
    };
    Screen.isString = function(str){
        return typeof str === 'string' ? true : false;
    };
    Screen.isFunction = function(fn){
        return fn && typeof fn !== 'string' && !fn.nodeType && typeof fn.constructor !== Array && /function/.test(fn + "");
    }
    Screen.isNaN = function(arg){
        return arg !== arg;
    };
    Screen.isNull = function(arg){
        return arg === null;
    };
    Screen.isUndefined = function(arg){
        return arg === void 0;
    };
    Screen.isNumber = function(n){
        return !isNaN(n) && isFinite(n) && typeof n === 'number';
    };
    Screen.isWindow = function(w){
        return !!w.window && !!w.setTimeout;
    };
    Screen.isDocument = function(d){
        return d && d.nodeType && d.nodeType === 9;
    }
    //数组化
    function makeArray(arr){
        if(!arr) return [];
        var ret = [],len = arr.length;
        if(len){
            if(typeof arr === 'string' || typeof arr === 'function' || arr.setTimeout){
                ret.push(arr);
                return ret;
            }
            while(len){
                --len;
                ret[len] = arr[len];
            }
        }else if(arr instanceof Object){
            ret.push(arr);
        }
        return ret;
    }


    var tId = /#(\w+)/,
    tcls = /(\w+)?(\.\w+)+/,// div.cls   .cls
    ttag = /(\w+)/,
    tattr = /(\w+)?\[(\w+-?\w+)=?(\w+)?\]/;
    var query = function(selector,context){
        var s = selector,ret = [],fil = [];
        if(!s)return ret;
        if(!typeof s === 'string')
            return ret;
        if(!context || typeof context === 'string'){
            context = doc;
        }
        //文本节点 注释节点
        if(context.nodeType == 3 || context.nodeType == 8)
            context = context.parentNode;
        if(tId.test(s)){
            s = RegExp.$1;
            return makeArray(context.getElementById(s));
        }

        if(context.querySelectorAll){
            try{
                if(!Screen.isDocument(context)){
                    var old = context.id;
                    context.id = '__screenID__';
                    ret = context.querySelectorAll('#' + context.id + ' ' + selector);
                }else{
                    ret = context.querySelectorAll(selector);
                }
            }catch(e){
                ret = context.querySelectorAll(selector);
            }finally{
                if(Screen.isDocument(context)){
                    old ? context.id = old : context.id = '';
                }else{
                    old ? context.id = old : context.removeAttribute('id');
                }
            }
            return makeArray(ret);
        }
        // div.cls  .cls
        if(tcls.test(s)){
            var tag,cls,s;
            s = s.split('.');
            tag = s[0];
            cls = s[1];
            if(context.getElementsByClassName){
                fil = context.getElementsByClassName(cls);
                fil = makeArray(fil);
                ret = filter(fil,'tagName',tag);
            }else{
                tag = tag || '*';
                fil = context.getElementsByTagName(tag);
                fil = makeArray(fil);
                ret = filter(fil,'class',cls);
            }
        }

        if(tattr.test(s)){
            var tag = RegExp.$1,
                attr = RegExp.$2,
                value = RegExp.$3;
            if(tag){
                fil = context.getElementsByTagName(tag);
            }else{
                fil = context.getElementsByTagName('*');
            }
            fil = makeArray(fil);
            ret = filter(fil,attr,value);
            return ret;
        }

        if(ttag.test(s)){ console.log(s)
            return makeArray(context.getElementsByTagName(s));
        }

        function filter(els,attr,value){
            var len = els.length,ret = [];
            attr = attr === 'class' ? 'className' : attr;
            var i = 0;
            if(value){
                for(;i<len;i++){
                    if(els[i][attr] === value){
                        ret.push(els[i]);
                    }
                }
            }else{
                for(;i<len;i++){
                    if(els[i][attr]){
                        ret.push(els[i]);
                    }
                }
            }
            return ret;
        }
    };

    var matchSelector = (function(){
        var div = doc.createElement('div'),
            ms = (div.webkitMatchesSelector || div.mozMatchesSelector || div.oMatchesSelector
                || div.msMatchesSelector || div.matchesSelector);
        matchSelector = ms ? function(el,selector){
            return ms.apply(el,selector);
        } : function(el,selector){
            var parent = el.parentNode,
                nodes;
            //认为在dom树上
            if(parent){
                nodes = query(selector,doc);
                var len = nodes.length;
                if(!len) return false;
                for(;--len;){
                    if(nodes[len] == el)
                        return true;
                    else
                        return false;
                }
            }else{ // 没有添加到dom树
                div.appendChild(el);
                var ret = [];
                ret = query(selector,div);
                div.removeChild(el);
                return !ret.length;
            }
        };
    })();

    function Screen(selector,context){
        return new Screen.fn.init(selector,context);
    }
    var S = Screen;

    //创建命名空间
    Screen.namespace = function(name){
        name = typeof name !== 'string' ? '' : name;
        var o=Screen,names=name.split(".");
        for(var i=names[0]==='Screen'?1:0,len=names.length;i<len;i++){
            o[names[i]]=o[names[i]] || {};
            o=o[names[i]];
        }
    };

    //添加ecma5的相关方法
    Screen.namespace('Screen.Object');
    Screen.namespace('Screen.Function');
    Screen.namespace('Screen.String');
    Screen.namespace('Screen.Array');

    Screen.Object.keys = function(){
        if(Object.keys){
            return Object.keys;
        }
        return function(obj){
            var props = [],prop;
            if(obj !== Object(obj))
                throw TypeError('the parameter should be an Object');
            for(prop in obj){
                if(Object.prototype.hasOwnProperty.call(obj,prop)){
                    props.push(prop);
                }
            }
            return props;
        }
    }();
    Screen.Object.create = function(){
        if(Object.create){
            return Object.create;
        }
        return function(obj){
            function foo(){};
            foo.prototype = obj;
            return new foo();
        }
    }();
    Screen.Object.forEach = function(obj,fn){
        for(var i in obj){
            if(obj.hasOwnProperty(i) && S.isObject(obj[i])){
                fn.call(obj[i],obj[i],i,obj);
            }
        }
    };

    Screen.Function.bind = function(){
        if(new Function().bind){
            return function(context,fn){
                return fn.bind(context);
            };
        }
        Screen.Function.bind = function(context,fn){
            var slice = Array.prototype.slice,
                params = slice.call(arguments,1),
                args;
            return function(){
                args = params.concat(slice.call(arguments));
                fn.apply(context,args);
            }
        }
    }();

    Screen.String.trim = function(){
        if(''.trim){
            return function(str){
                return str.trim();
            };
        }
        return function(str){
            str.replace(/^\s+|\s+$/g,'');
        }
    }();

    Screen.Array.forEach = function(){
        if([].forEach){
            return function(arr,fn){ log(arr)
                arr.forEach(fn);
            }
        }
        return function(arr,fn){
            var i,len,el;
            for(i=0,len=arr.length;i<len;i++){
                el = arr[i];
                fn.call(el,el,i,arr);
            }
        }
    }();
    Screen.Array.every = function(){
        if([].every){
            return function(arr,fn){
                arr.every(fn);
            }
        }
        return function(fn){
            var returnVal;
            Screen.Array.forEach(function(item,index,array){
                returnVal = fn.call(item,index,array);
                if(returnVal === false)
                    return false;
            });
            return true;
        }
    }();
    Screen.Array.some = function(){
        if([].some){
            return function(arr,fn){
                arr.some(fn);
            }
        }
        return function(fn){
            var returnVal;
            Screen.Array.forEach(function(item,index,array){
                returnVal = fn.call(item,index,array);
                if(returnVal === true)
                    return true;
            });
            return false;
        }
    }();
    Screen.Array.map = function(){
        if([].map){
            return function(arr,fn){
                arr.map(fn);
            }
        }
        return function(fn){
            Screen.Array.forEach(function(item,index,array){
                var returnVal,arr = [];
                returnVal = fn.call(item,index,array);
                arr.push(returnVal);
            })
            return arr;
        }
    }();
    Screen.Array.filter = function(){
        if([].filter){
            return function(arr,fn){
                arr.filter(fn);
            }
        }
        return function(fn){
            var returnval,arr = [];
            Screen.Array.forEach(function(item,index,array){
                returnVal = fn.call(item,index,array);
                if(returnval === true){
                    arr.push(item);
                }
            })
            return arr;
        }
    }();
    Screen.Array.indexOf = function(){
        if([].indexOf){
            return function(arr,item,position){
                arr.indexOf(item,position);
            }
        }
        return function(arr,item,position){
            var i,len;
            position = position || 0;
            for(i=position,len=arr.length;i<len;i++){
                if(arr[i] === item)
                    return i;
            }
            return -1;
        }
    }();
    Screen.Array.lastIndexOf = function(){
        if([].lastIndexOf){
            return function(arr,item,position){
                arr.lastIndexOf(item,position);
            }
        }
        return function(arr,item,position){
            var i;
            position = position || 0;
            for(i=position;i>0;i--){
                if(arr[i] === item)
                    return i;
            }
            return -1;
        }
    }();


    Screen.prototype = {
        init: function(selector,context){
            if(!selector) return [];
            var ret = [];
            if(typeof selector !== 'string' && ((selector.nodeType && selector.nodeType == 1 ||
                selector.nodeType == 9 ) || selector == window)){
                this[0] = selector;
                this.length = 1;
            }
            if(typeof selector === 'string'){
                context = context || doc;
                ret = query(selector,context);
                this.__pushIn(ret);
            }
            if(Screen.isArray(selector)){
                this.__pushIn(selector);
            }
        },
        __pushIn: function(arr){
            var i = 0,len = arr.length;
            for(;i<len;i++){
                this[i] = arr[i]
            }
            this.length = arr.length;
        },
        find: function(expr,item){
            var context = item === undefined ? this[0] : this[item];
            return new Screen.fn.init(expr,context);
        }
    };
    Screen.fn = Screen.prototype;
    Screen.fn.init.prototype = Screen.prototype;
    //扩展原型对象
    Screen.extend = Screen.fn.extend = function(obj,deep){
        if(!Screen.isObject(obj))
        return;
        deep = deep || false;
        var prop;
        if(!deep){
            for(prop in obj){
                if(obj.hasOwnProperty && obj.hasOwnProperty(prop)){
                    this[prop] = obj[prop];
                }
            }
            return;
        }else{ //深复制
            for(prop in obj){
                if(obj.hasOwnProperty && obj.hasOwnProperty(prop)){
                    if(Screen.isObject(obj[prop])){
                        if(Screen.isArray(obj[prop])){
                            this[prop] = [];
                            arguments.callee.call(this[prop],obj[prop],deep)
                        }else{
                            this[prop] = {};
                            arguments.callee.call(this[prop],obj[prop],deep)
                        }
                    }else{
                        this[prop] = obj[prop];
                    }
                }
            }
            return;
        }

    };
    // 混入对象
    Screen.mixin = function(){
        function mix(b,c){
            if(!Screen.isObject(b) || !Screen.isObject(c))return {};
            for(var prop in c){
                if(c.hasOwnProperty && c.hasOwnProperty(prop)){
                    if(!b[prop]){
                        b[prop] = c[prop];
                    }
                }
            }
            return b;
        }
        if(!arguments.length) return {};
        var arg = slice.apply(arguments),len = arg.length,
            d = arg[len - 1];
        for(;--len>0;){
            d = mix(arg[len-1],d);
        }
        return d;
    };
    // 提供 数组化
    // 函数执行方式 once,delay,throttle
    Screen.extend({
        makeArray: makeArray,
        delay: function(){
            return function(fn,context,timeout,args){
                if(!Screen.isFunction(fn))return;
                context = context || window;
                var arg = slice.call(arguments,3);
                setTimeout(function(){
                    fn.apply(context,arg);
                },timeout);
            }
        }(),
        once: function(){
            var flag = true;
            return function(fn,context,args){
                context = context || window;
                var arg = slice.call(arguments,2);
                if(flag){
                    fn.apply(context,arg);
                    flag = false;
                }
            }
        }(),
        throttle: function(){
            return function(fn,context,minTimeout,args){
                context = context || window;
                minTimeout = minTimeout || 100;
                var arg = slice.call(arguments,3);
                clearTimeout(fn.thid);
                fn.thid = setTimeout(function(){
                    fn.apply(context,arg);
                },minTimeout);
            }
        }()
    });

    //功能函数
    Screen.fn.extend({
       each: function(fn){
           S.Object.forEach(this,fn);
       }
    });



    //属性模块--------css模块
    // offset,position模块
    (function(){
        Screen.fn.extend({
            //相对页面的偏移
           offset: function(options){
               if(!this[0].nodeType || this[0].nodeType !== 1 || Screen.isWindow(this[0]))
               return;
               if(options){
                    setOffset(this[0],options);
                    return;
               }
               var doc = this[0].ownerDocument,position = {
                    left: 0,
                    top: 0
                   },root,os,
                   scrollLeft,scrollTop,
                   clientLeft,clientTop;
               if(!doc)return position;
               //获取window
               var window = doc.defaultView || this[0].parentWindow || window;
               if(doc.compatMode.toLowerCase() == 'backcompat'){
                   root = doc.body;
               }else{
                   root = doc.documentElement;
               }


               os = this[0].getBoundingClientRect();
               if(!os)return position;
               scrollLeft = window.pageXOffset || root.scrollLeft;
               scrollTop = window.pageYOffset || root.scrollTop;
               clientLeft = root.clientLeft || 0;
               clientTop = root.clientTop || 0;
               position.left = os.left + scrollLeft - clientLeft;
               position.top = os.top + scrollTop - clientTop;
               return position;
           },
            //相对父元素offsetParent的偏移
            // 1,html body的父元素为null，需要修改
            // 2,position：fixed的父元素为null
            // 3,display:none的父元素为null
            //在这里设定offsetParent必须为absolute或者relative，否则向上回溯，返回html
            position: function(){
                var position = {
                    left: 0,
                    top: 0
                    },offset,node = this[0],offsetParent;
                if(node.nodeType !== 1)return;
                if(getCss(node,'position') == 'fixed'){
                    offset = node.getBoundingClientRect();
                }

                offsetParent = this.offsetParent();
                var parentOffset = offsetParent.offset();
                offset = this.offset();
                position.left = offset.left - parentOffset.left - offsetParent[0].clientLeft - parseInt(getCss(node,'margin-left'));
                position.top = offset.top - parentOffset.top - offsetParent[0].clientTop - parseInt(getCss(node,'margin-top'));
                return position;
            },
            //只取第一个dom元素的offsetparent.因为都是操作单个元素
            offsetParent: function(){
                var p = this[0].offsetParent || doc.documentElement;
                while(p.tagName && !p.tagName.toLowerCase() == 'html' && getCss(p,'position') == 'static'){
                    p = p.offsetParent;
                }
                return Screen(p);
            },
            css: function(options){
                if(arguments.length == 1 && Screen.isString(options)){
                    if(arguments[0] == 'z-index' || arguments[0] == 'zIndex'){
                        return getZIndex(this[0]);
                    }
                    return getCss(this[0],arguments[0])
                }
                if(arguments.length == 1 && Screen.isObject(options)){
                    for(var prop in options){
                        if(options.hasOwnProperty(prop)){
                            setCss(this[0],prop,options[prop]);
                        }
                    }
                }
                if(arguments.length == 2){
                    setCss(this[0],arguments[0],arguments[1]);
                }
            }
        });
        // 设置偏移量，若该元素不是定位元素，则设置为relative。
        // 求出设置的偏移与原来在页面中位置的偏移差
        function setOffset(node,options){
            if(node && node.nodeType !== 1) return;
            if(getCss(node,'position') == 'static'){
                setCss(node,'position','relative');
            }
            var offset = Screen(node).offset(),position = {
                left: parseInt(getCss(node,'left')) || 0,
                top : parseInt(getCss(node,'top')) || 0
            };
            if(getCss(node,'position') == 'absolute' || getCss(node,'position') == 'fixed'){
                if(getCss(node,'left') === 'auto' && getCss(node,'top') === 'auto'){
                    var p = Screen(node).position();
                    position.left = p.left;
                    position.top = p.top;
                }
            }
            if(options.left)
                setCss(node,'left',parseInt(options.left) - offset.left + position.left);
            if(options.top)
                setCss(node,'top',parseInt(options.top) - offset.top + position.top);
        }
        //驼峰法
        function camelize(prop){
            var camel = /(\w+)-(\w+)/;
            if(camel.test(prop)){
                var first = RegExp.$1,
                    second = RegExp.$2;
                second = second.charAt(0).toUpperCase() + second.slice(1);
                return first + second;
            }
            return prop;
        }

        function getZIndex(node){
            //z-index，若元素没有设置定位，则向上回溯，返回有定位父元素的z-index
            var p = node,pos,value;
            while(p.nodeType !== 9){
                pos = getCss(p,'position') || 'static';
                if(pos !== 'static'){
                    value = getCss(p,'z-index');
                    if(!isNaN(value) && value !== 0){
                        return value;
                    }
                }
                p = p.parentNode;
            }
            return 0 ;
        }
        function getCss(node,prop){
            if(node.nodeType && node.nodeType !== 1) return '';
            var window = node && node.ownerDocument && node.ownerDocument.defaultView || node.parentWindow;
            var ret;


            if(window.getComputedStyle){
                var s = window.getComputedStyle;
                if(prop == 'opacity'){
                    if((ret = s(node,null).getPropertyValue(prop)).length){
                        ret = ret.slice(0,3);
                    }
                    return ret;
                }
                ret = s(node,null).getPropertyValue(prop);
                return ret;
            }else{
                prop = camelize(prop);
                var cs = node.currentStyle;
                if(prop == 'float'){
                    prop = 'styleFloat';
                }
                if(prop == 'opacity'){
                    prop = 'filter';
                    ret = cs[prop];
                    var op = /opacity\s*=\s*(\d+)/;
                    if(op.test(ret)){
                        return parseFloat(RegExp.$1 / 100) + "";
                    }
                    return '';
                }
                return cs[prop];
            }
        }

        // 设置 添加样式表  视口 以及 页面 大小
        Screen.extend({
            // ie7添加内联样式filter属性，如果没有haslayout，则不会触发滤镜。但是在样式表中没有这种情况
            addSheet: function(css){
                if(!-[1,]){
                    css = css.replace(/opacity:\s*(\d?\.\d+)/g,function($,$1){
                        $1 = parseFloat($1) * 100;
                        if($1 < 0 || $1 > 100)
                            return "";
                        return "filter:alpha(opacity="+ $1 +");"
                    });
                }
                css += "\n";//增加末尾的换行符，方便在firebug下的查看。
                var doc = document, head = doc.getElementsByTagName("head")[0],
                    styles = head.getElementsByTagName("style"),style,media;
                if(styles.length == 0){//如果不存在style元素则创建
                    if(doc.createStyleSheet){    //ie
                        doc.createStyleSheet();
                    }else{
                        style = doc.createElement('style');//w3c
                        style.setAttribute("type", "text/css");
                        head.insertBefore(style,null)
                    }
                }
                style = styles[0];
                media = style.getAttribute("media");
                if(media === null && !/screen/i.test(media) ){
                    style.setAttribute("media","all");
                }
                if(style.styleSheet){    //ie
                    style.styleSheet.cssText += css;//添加新的内部样式
                }else{
                    style.appendChild(doc.createTextNode(css))
                }
            },
            viewSize: function(){
                return {
                    width: window.innerWidth || doc.documentElement.clientWidth || doc.body.clientWidth,
                    height: window.innerHeight || doc.documentElement.clientHeight || doc.body.clientHeight
                }
            },
            pageSize: function(){
                var root = doc.documentElement,
                    body = doc.body;
                return {
                    width: Math.max(root.scrollWidth,root.offsetWidth,root.clientWidth,body.scrollWidth,body.offsetWidth),
                    height: Math.max(root.scrollHeight,root.offsetHeight,root.clientHeight,body.scrollHeight,body.offsetHeight)
                }
            }

        });
        function setCss(node,prop,value){
            prop = camelize(prop);
            if(prop == 'opacity'){
                if(Screen.support.opacity){
                    node.style.opacity = value;
                }else{
                    //ie67下要想透明，必须先haslayout
                    node.style.filter = 'alpha(opacity='+ value * 100 +')';
                    node.style.zoom = 1;
                }
                return;
            }
            if(Screen.isNumber(value)){
                value += 'px';
            }
            node.style[prop] = value;
            return;
        }
    })();

    //属性模块 -------------属性操作模块
    (function(S){
        var ttag = /<([\w:]+)/,
            tscript = /<script/,
            mapper = {  //旧ie无法用innerHTML插入table
                tbody: [1,'<table>','</table>'],
                thead: [1,'<table>','</table>'],
                tfoot: [1,'<table>','</table>'],
                tr: [2,'<table><tbody>','</tbody></table>'],
                td: [3,'<table><tbody><tr>','</tr></tbody></table>'],
                th: [3,'<table><thead><tr>','</tr></thead></table>']
            };


        // 根据入参返回相应的文档对象
        // ex. S(obj).html('<td>abcabc</td>')
        // ex. innerHTML插入script标签，并不会加载执行。通过新建element替代原来的script进行加载
        S.DomParser = function(html){
            // 如果是字符串，将其解析成节点
            var tag,div,
                firstChild,frag = doc.createDocumentFragment(),
                scripts,sNode, n,
                attrs,attr,
                count;
            if(S.isObject(html) && html.nodeType){
                html = html.cloneNode(true);
                frag.appendChild(html);
                return frag;
            }
            if(S.isFunction(html))return S.DomParser(html());
            if(S.isString(html)){
                // 含有标签名
                if(ttag.test(html)){
                    div = doc.createElement('div');
                    tag = RegExp.$1 + '';
                    if(mapper[tag]){
                        div.innerHTML = mapper[tag][1] + html + mapper[tag][2];
                        count = mapper[tag][0];
                        while(count--){
                            div = div.firstChild;
                        }  console.log(mapper[tag][0])
                        while(firstChild = div.firstChild){  //将节点追加到frag上
                            frag.appendChild(firstChild);
                        }
                    }else if(tscript.test(html)){ //默认用innerHTML插入的script不会执行
                        div.innerHTML = html;
                        scripts = div.getElementsByTagName('script');
                        scripts = S.makeArray(scripts);
                        sNode = doc.createElement('script');
                        for(var i= 0,len=scripts.length;i<len;i++){
                            n = sNode.cloneNode(false);  //firefox不能省略参数
                            attrs = scripts[i].attributes;
                            for(var j = 0,l=attrs.length;j<l;j++){
                                attr = attrs[i];
                                if(attr.specified){
                                    n[attr.name] = attr.value;
                                }  console.log(n[attr.name] )
                            }
                            n.text = scripts[i].text //必须，text通过属性遍历不出
                            frag.appendChild(n);
                        }
                    }else{
                        div.innerHTML = html;
                        while(firstChild = div.firstChild){
                            frag.appendChild(firstChild);
                        }
                    }
                }else{  //当做字符串处理
                    frag.appendChild(doc.createTextNode(html));
                }
            }
            div = null;
            return frag;
        }

        // DOM节点的排序，包含
        S.extend({
            contains: function(node,el){  // node是否包含el
                if(node === el)return true;
                if(!el.parentNode)return false;
                if(node.compareDocumentPosition){
                    return !!(node.compareDocumentPosition(el) & 16);
                }
                if(node.contains)
                    return node.contains(el);
                while(el = el.parent){
                    if(node === el)return true;
                }
                return false;
            },
            isBefore: function(node,el){   // node节点是否在el之前
                var div = doc.createElement('div');
                return doc.compareDocumentPosition ? (function(){
                    if(!node.compareDocumentPosition || !el.compareDocumentPosition) return 0;
                    return node.compareDocumentPosition(el) & 4 ? -1 : node === el ? 0 : 1;
                })() : 'sourceIndex' in div ? (function(){
                    div = null;
                    if(!node.sourceIndex || !el.sourceIndex) return 0;
                    return node.sourceIndex - el.sourceIndex;
                })() : doc.createRange ? (function(){
                    var arange,brange;
                    arange = node.ownerDocument.createRange();
                    brange = el.ownerDocument.createRange();
                    arange.setStart(node,0);
                    arange.setEnd(node,0);
                    brange.setStart(node,0);
                    brange.setEnd(node,0);
                    return arange.compareBoundaryPoints(Range.START_TO_START,brange);
                })() : null;
            }
        });


        S.fn.extend({
            empty: function(){
                this.each(function(el){  // 清除缓存，清除事件，清楚子元素
                    var firstChild;
                    if(el.nodeType && el.nodeType == 1){
                        while(firstChild = el.firstChild){
                            S._unData(firstChild);
                            el.removeChild(firstChild);
                        }
                    }

                    if(el.nodeType){
                        S(el).unbind();
                    }

                });
                return this;
            },
            remove: function(){
                this.each(function(el){
                    if(el.nodeType && el.nodeType == 1){
                        S._unData(el);
                        if(el.parentNode){
                            el.parentNode.removeChild(el);
                        }
                    }
                });
                return this;
            },
            detach: function(){  //不删除缓存
                this.each(function(el){
                    if(el.nodeType && el.nodeType == 1){
                        if(el.parentNode){
                            el.parentNode.removeChild(el);
                        }
                    }
                });
                return this;
            },
            html: function(html){  // IE下，html,head,style,frameset,table,tbody,tr等节点的innerHTML只读
                if(!html){
                    return this[0].innerHTML;
                }
                this.each(function(el){
                    var frag = S.DomParser(html);
                    S(el).empty();
                    el.appendChild(frag);
                })
                return this;
            },
            text: function(text){
                if(!text){  //ff 使用textContent
                    return this[0].innerText? this[0].innerText : this[0].textContent;
                }
                this.each(function(el){
                    el.innerText ? el.innerText = text : el.textContent = text;
                })
                return this;
            },
            append: function(selector){
                var frag;
                this.each(function(el){
                    frag = S.DomParser(selector);
                    el.appendChild(frag);
                })
                return this;
            },
            prepend: function(selector){
                var frag;
                this.each(function(el){
                    frag = S.DomParser(selector);
                    el.insertBefore(frag,el.firstChild);
                })
                return this;
            },
            after: function(selector){
                var frag;
                this.each(function(el){
                    frag = S.DomParser(selector);
                    if(el.nextSibling){
                        el.parentNode.insertBefore(frag,el.nextSibling);
                    }else{
                        el.parentNode.appendChild(frag);
                    }
                })
                return this;
            },
            before: function(selector){
                var frag;
                this.each(function(el){
                    frag = S.DomParser(selector);
                    el.parentNode.insertBefore(frag,el);
                })
                return this;
            }
        })
    })(Screen);

    // 缓存系统
    // 采用valueOf对 元素进行判断，若经过改写，则认为在系统中有存储
    (function(S){
        var count = 0;
        function Data(){
            this.cache = {};
        }
        Data.prototype.unlock = function(el){
          var prefix = S.version,value;
           value = el.valueOf(Data);
          if(typeof value === 'object'){
              var now = new Date().getTime(),
                  guid = prefix + now + (count++);
              Object.defineProperty(el,'valueOf',{
                  configurable: true,
                  enumerable: true,
                  writable: true,
                  value: function(){
                      var arg = arguments;
                      if(arg[0] === Data){
                          return guid;
                      }
                      return el;
                  }
              });
              this.cache[guid] = {};
              return guid;
          }else{
              return value;
          }
        };
        Data.prototype.create = function(el){
            return this.unlock(el);
        };
        Data.prototype.get = function(el,property){
            property = typeof property !== 'string' ? '' : property;
            var guid = this.unlock(el);
            if(!this.cache[guid]){
                return ;
            }
            var cache = this.cache[guid];
            if(arguments.length == 1){
                return cache;
            }
            return cache[property];
        };
        Data.prototype.set = function(el,property,value){
            if(arguments.length !== 3) return;
            var guid = this.unlock(el);
            if(!this.cache[guid]){
                this.cache[guid] = {};
                this.cache[guid][property] = value;
                return;
            }else{
                var cache = this.cache[guid];
                if(property in cache){
                    delete  cache[property];
                }
                cache[property] = value;
            }
        };
        Data.prototype.del = function(el,property){
            var arg = arguments,
                guid,cache;
            guid = this.unlock(el);

            if(!this.cache[guid]) return;
            if(arg.length == 1){
                delete this.cache[guid];
                return;
            }
            cache = this.cache[guid];
            if(!cache[property])return;
            if(arg.length == 2){
                delete  cache[property];
            }
            return;
        }

        var data = new Data(),
            _data = new Data();
        S.lockData = function(el){
            return data.create(el);
        };
        S._lockData = function(el){
            return _data.create(el);
        };
        S.data = function(el,property,value){
            if(arguments.length == 1){
                return data.get(el);
            }
            if(arguments.length == 2){
                return data.get(el,property);
            }else{
                return data.set(el,property,value);
            }

        };
        S._data = function(el,property,value){
            if(arguments.length == 1){
                return _data.get(el);
            }
            if(arguments.length == 2){
                return _data.get(el,property);
            }else{
                return _data.set(el,property,value);
            }

        };
        S.unData = function(el,property){
            if(arguments.length == 1)
                return data.del(el);
            return data.del(el,property);
        }
        S._unData = function (el,property) {
            if(arguments.length == 1)
                return _data.del(el);
            return _data.del(el,property);
        }
    })(Screen);

    (function(s){
        var addEvent = (function(){
            if(window.addEventListener){
                return function (el,type,fn) {
                    el.addEventListener(type,fn,false);
                }
            }else{
                return function(el,type,fn){
                    el.attachEvent('on'+type,fn);
                }
            }
        })();
        var removeEvent = (function (){
            if(window.removeEventListener){
                return function(el,type,fn){
                    el.removeEventListener(type,fn,false);
                }
            }else{
                return function(el,type,fn){
                    el.detachEvent('on'+type,fn);
                }
            }
        })();

        // HandlerObject constructor
        function Handler(config){
            this.handler = config.handler;
            this.special = config.special; //特殊的回调，ex. once函数，throggle函数等等，原回调放在此处，handler放包裹后的回调
            this.type = config.type;
            this.namespace = config.namespace;
            this.data = config.data;
            this.once = config.once;
            this.delay = config.delay;
            this.throttle = config.throttle;
            this.stop = config.stop;  //  取消默认和冒泡
            this.stopBubble = config.stopBubble;
            this.preventDefalut = config.preventDefalut;
        }
        //typeEvents=[handlerObj1,handlerObj2,...]
        function execHandlers(el,event,args,context){  // 若args不为空，则为自定义事件出发，trigger
            if(el.nodeValue == 3 || el.nodeValue == 8) return;
            var elData,events,handlers,typeEvents,ret,
                flag = true;
            context = context || el;
            //获取缓存对象
            elData= S._data(el);
            if(!elData || !elData['events'])return;
            events = elData['events'];
            handlers = elData['handlers'];
            if(!events[event.type])return;
            typeEvents = events[event.type];

            // 如果其中一个回调执行出错，函数库也不会抛错
            for(var i = 0,len=typeEvents.length;i<len;i++){

                // 捕获错误，如果一个事件绑定多个回调，其中一个回调出错不会影响其他回调执行
                try{
                    ret = execHandler(el,event,typeEvents[i],args,context);
                    if(ret == false){
                        flag = false
                    }
                }catch(e){
                    setTimeout(function(){
                        throw Error(e);   // 异步抛出错误
                    },0);

                    if(i < len && i+1 <len){
                        i++;
                        ret = execHandler(el,event,typeEvents[i],args,context);
                        if(ret == false){
                            flag = false
                        }
                    }
                }
            }
            if(!flag){
                event.preventDefault();
                event.stopPropagation();
            }
            return;
        }
        function execHandler(el,event,handlerObj,args,context){
            var handler = handlerObj.handler,
                type = event.type,
                special = handlerObj.special,
                stop = handlerObj.stop,
                preventDefault = handlerObj.preventDefalut,
                stopBubble = handlerObj.stopBubble,
                data = handlerObj.data,
                once = handlerObj.once,
                delay = handlerObj.delay,  // 时延
                throttle = handlerObj.throttle; //最小间隔时间
            if(handlerObj.type && type !== handlerObj.type) return;

            if(!handler || !S.isFunction(handler))return;

            if(stop){
                event.preventDefalut();
                event.stopPropagation();
            }
            if(preventDefault){
                event.preventDefalut();
            }
            if(stopBubble){
                event.stopPropagation();
            }


            if(once){
                var onceHandler = function(event,args){
                    return S.once(handler,context,event,args);
                };
                return onceHandler.call(context,event,args);
            }
            if(delay && S.isNumber(delay)){
                var delayHandler = function(event,args){
                    return S.delay(handler,context,delay,event,args);
                }
                return delayHandler.call(context,event,args);
            }
            if(throttle && S.isNumber(throttle)){
                var throttleHandler = function(event,args){
                    return S.throttle(handler,context,throttle,event,args);
                }
                return throttleHandler.call(context,event,args);
            }

            if(handler){
                return handler.call(context,event,args);
            }
            return;
        }

        function returnTrue(){
            return true;
        }
        function returnFalse(){
            return false;
        }
        //Event constructor
        function Event(e){ //传入事件参数
            this.originalEvent = e;
            var type = e.type;
            if(/^(\w+)\.(\w+)$/.test(type)){
                this.type = RegExp.$1;
                this.namespace = RegExp.$2
            }else{
                this.type = type;
                this.namespace = '';
            }
        }

        Event.prototype = {
            preventDefault: function(){
                var e = this.originalEvent;
                if(e.preventDefalut){
                    return e.preventDefault();
                }
                e.returnValue = false;
                this.isPreventDefault = returnTrue;
                return;
            },
            stopPropagation: function(){
                var e = this.originalEvent;
                if(e.stopPropagation){
                    return e.stopPropagation();
                }
                e.stopBubble = true;
                this.isStopPropagation = returnTrue;
                return;
            },
            stopImmediatePropagation: function(){
                this.stopPropagation();
                this.isImmediatePropagationStopped = returnTrue;
            },
            isPreventDefault: returnFalse,
            isStopPropagation: returnFalse
        };
        //事件修复
        function fixEvent(event){
            var i, prop, props = [], originalEvent = event.originalEvent;

            props = props.concat('altKey bubbles button cancelable charCode clientX clientY ctrlKey currentTarget'.split(' '));
            props = props.concat('data detail eventPhase fromElement handler keyCode layerX layerY metaKey'.split(' '));
            props = props.concat('newValue offsetX offsetY originalTarget pageX pageY prevValue relatedTarget'.split(' '));
            props = props.concat('screenX screenY shiftKey target toElement view wheelDelta which'.split(' '));
            for(i=props.length;--i;){
                event[props[i]] = originalEvent[props[i]];
            }

            if(!event.target){
                event.target = event.srcElement;
            }

            if(event.target.nodeType == 3){
                event.target = event.target.parentNode;
            }

            if(!event.relatedTarget){
                event.relatedTarget = event.fromElement === event.target? event.toElement : event.fromElement;
            }

            if(!event.which && (event.charCode || event.keyCode)){
                event.which = event.charCode ? event.charCode : event.keyCode ? event.keyCode : null;
            }

            if(!event.pageX || !event.pageY){
                event.pageX = event.clientX + (doc.documentElement && doc.documentElement.scrollLeft || doc.body && doc.body.scrollLeft || 0)
                - (doc.documentElement && doc.documentElement.clientLeft || doc.body && doc.body.clientLeft || 0);
                event.pageY = event.clientY + (doc.documentElement && doc.documentElement.scrollTop || doc.body && doc.body.scrollTop || 0)
                    - (doc.documentElement && doc.documentElement.clientTop || doc.body && doc.body.clientTop || 0);
            }

            if(!event.which && event.button != undefined){ //ie下 0 无动作, 1 左键 ,2 右键, 4 中间键
                event.which = (event.button & 1) ? 1 : (event.button & 2) ? 3 : (event.button & 4) ? 2 : 0;
            }
            return event;
        }

        function bind(el,type,fn){
            if(el.nodeType && el.nodeType == 3 || el.nodeType == 8) return;

            var elData= S._data(el),events,handlers,typeEvents;
            if(!elData) {
                S._lockData(el);  //开辟缓存
                elData = S._data(el);
            }
            if(!elData['events']){
                elData['events']  = {};
            }
            events = elData['events'];
            handlers = elData['handlers'];  // 目前先不对其赋值
            if(!events[type]){
                events[type] = [];
            }
            typeEvents = events[type];

            var handlerObj;
            if(S.isFunction(fn)){
                handlerObj = new Handler({handler: fn});
            }else if(S.isObject(fn)){
                handlerObj = new Handler(fn);
            }else{
                return;
            }

            handlerObj.handlerHook = function(event,args){  // 函数钩子，用于unbind删除回调函数
                event = event || window.event;
                var e = new Event(event);
                e = fixEvent(e);
                execHandlers(el,e,args,el);
            };


            if(!typeEvents || !typeEvents.length)
                addEvent(el,type,handlerObj.handlerHook);

            typeEvents.push(handlerObj);
        }

        function unbind(el,type,fn){
            var newEvents = [];
            if(el.nodeType && el.nodeType == 3 || el.nodeType == 8) return;

            var elData= S._data(el),events,handlers,typeEvents;

            if(!elData || !elData['events'])return;

            if(arguments.length == 1){  // 删除该元素所有缓存 事件
                for(var i in elData['events']){
                    if(elData['events'].hasOwnProperty(i)){
                        for(var j=0,len=elData['events'][i].length;j<len;j++){
                            removeEvent(el,i,elData['events'][i][j].handlerHook);
                        }
                    }
                }
                S._unData(el);
            }

            events = elData['events'][type];
            newEvents = events.concat();

            if(arguments.length == 2 && events){
                try{
                    for(var i= 0,len=events.length;i<len;i++){
                        removeEvent(el,type,events[i].handlerHook);
                    }
                }catch(e){
                    throw new TypeError('哎呀啊，解除回调出现意外')
                }

                events = {};
                delete elData[type];
            }

            if(arguments.length == 3){
                for(var i= 0,len=events.length;i<len;i++){
                    if(events[i].handler === fn){
                        try{
                            removeEvent(el,type,events[i].handlerHook);
                        }catch(e){
                            throw new TypeError('哎呀啊，解除回调出现意外')
                        }
                        newEvents.splice(i,1);
                    }
                }
            }
            elData['events'][type] = events = newEvents;
        }

        function trigger(el,type,args){
            if(el.nodeType && el.nodeType == 3 || el.nodeType == 8) return;

            var elData= S._data(el),events,handlers,typeEvents;

            if(!elData || !elData['events'] || !elData['events'][type])return;
            events = elData['events'][type];

            var handlerObj,event;
            event = {
                target: el,
                type: type,
                data: args
            };
            for(var len=events.length;--len>=0;){
                handlerObj = events[len];
                handlerObj.handlerHook(event,args);
            }
        }

        S.fn.extend({
            bind: function(type,fn){
                this.each(function(el){
                    bind.call(el,el,type,fn);
                })

            },
            unbind: function(type,fn){
                var args = arguments;
                this.each(function(el){
                    args.length == 0 ? unbind.call(el,el) : args.length == 1 ?
                        unbind.call(el,el,type) : unbind.call(el,el,type,fn);
                })
            },
            trigger: function(type,args){
                this.each(function(el){
                    trigger.call(el,el,type,args);
                })
            },
            delegate: function(selector,type,fn,data){
                if(arguments.length < 3)return;
                if(S.isFunction(data)){
                    fn = data;
                    data = {};
                }
                this.each(function(el){
                    S(el).bind(type,function(e){
                        var tar = e.target;
                        Z(selector,el).each(function(ele){
                            if(ele === tar || S.contains(ele,tar)) fn.call(tar,e,data);
                        })
                    })
                })
            },
            undelegate: function(type,fn){
                this.each(function(el){
                    S(el).unbind(type,fn);
                })
            }
        })
    })(Screen);
    window.S = window.Screen = Screen;
})(this);