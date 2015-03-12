/**
 * Created by admin on 2014/10/22.
 *  解决项目依赖
 */

/**
 * 混入
 * @param d
 * @param s
 * @returns {*}
 */
(function(window){
    var mixin = function(d,s){
        for(var prop in s){
            if(s.hasOwnProperty(prop)){
                d[prop] = s[prop];
            }
        }
        return d;
    }

    var _dep = {
        /**
         * 用于保存添加的模块
         * {module-name:{
     *      name: '',
     *      path:'',
     *      dependences: [],
     *      exeInstantly: boolean;
     *      callback: fn
     * }}
         */
        modules: {},
        /**
         * 添加模块
         * @param m
         * @private
         */
        _addModule: function(m){
            this.modules[m.name] = {
                name: m.name,
                path: m.path,
                dependences: m.dependences,
                exeInstantly: m.exeInstantly,
                callback: m.callback
            };
            return;
        },
        isLoadModule: function(m){
        	if(this.isInArray(this.loadedRow,m.path)) return true;
        	return false;
        },
        /**
         * 判断是否所有模块都已加载
         * @returns {boolean}
         */
        isLoadAllModules: function(){
            var list = [],prop;
            for(prop in this.modules){
                list.push(this.modules[prop].path);
                for(var i=0, p = this.modules[prop].dependences.length,item; i<p;i++){
                	item = this.modules[prop].dependences[i];
                    list.push(item);
                }
            }
            list = this.distinct(list); 
            if(list.length > this.loadedRow.length)
            return false;
            for(var i=0, len = list.length,d;i<len;i++){
            	d = list[i];
                if(this.isLoadModule(d))
                	return false;
            }
            return true;
        },
        /**
         * 加载未加载的模块
         * @param callback
         */
        loadUnLoaded: function(callback){
            var list = [],prop,that = this;
            for(prop in this.modules){
                for(var i=0, p = this.modules[prop].dependences.length,item; i<p;i++){
                	item = this.modules[prop].dependences[i];
                    if(!this.isLoadModule(item))
                    list.push(item);
                }
            }
            list = this.distinct(list);

            var recursion = function(){
            	if(list.length === 0){
            		callback(that);
            	}else{
            		that.loadJsCss(list.shift(),recursion);	
            	}
            }
            recursion();
        },
        /**
         * 外部接口，添加模块
         * @param name
         * @param callback
         * @param config
         */
        addModule: function(name,callback,config){
            if(arguments.length < 3){
            	if(typeof name !== 'string'){
            		var config = callback;
                	callback = name;
                	name = new Date().getTime();
            	}else{
            		var config = {};
            		config.dependences = [];
            	}
                
            }
            var m = {};
            m.name = name;
            m.path = this._currentPath;
            m.dependences = config.dependences ? config.dependences : [];
            m.exeInstantly = this.exeInstantly ? this.exeInstantly : false;
            callback = typeof callback === 'function' ? callback : new Function;
            m.callback = callback;
            this._addModule(m);
        },
        /**
         * 默认的模块都是DomContentLoaded之后加载解析，运行。
         */
        exeInstantly: false,
        /**
         * 已加载的依赖 path
         * ['js/a.js','css/demo.css']
         */
        loadedRow: [],
        /**
         * 当前加载依赖 路径
         */
        _currentPath: '',
        /**
         * DOMContentLoaded 是否触发
         */
        isDomReady: false,
        /**
         * 存储即将要加载的依赖列表
         * [{path:'',callback:fn},{path:'',callback:fn}]
         */
        todoList: [],
        /**
         * DOMContentLoaded触发时，开始加载依赖（exeInstantly为true时）
         * @param callback
         * @param config
         */
        ready: function(callback,config){
            var dependences,
                exeInstantly,
                that = this;
            if(!config){
                dependences = [];
                that.exeInstantly = false;
            }
            if(!config.dependences){
                dependences = [];
            }else{
                dependences = config.dependences;
            }
            exeInstantly = config.exeInstantly ? config.exeInstantly : false;
            that.exeInstantly = exeInstantly;

            if(exeInstantly || that.isDomReady){ 
                that._execute(dependences,callback);
                return;
            }
			
            that.todoList.push({
                dependences: dependences,
                callback: callback
            });
            return;

        },
        exeCallback: function(){
            var that = this,
                moduleNameList;
            var createModuleNameList = function(){
                var moduleNameList = [],
                    modules = that.modules,
                    loaded = that.loadedRow;
                for(var i = 0,len = loaded.length,s;i< len;i++){
                    s = loaded[i];
                    for(var prop in modules){
                        if(s === modules[prop].path){
                            moduleNameList.push(prop);
                        }
                    }
                }
                return moduleNameList;
            };
            //对于在一个js文件中执行了多个addModule的情况
            // 此时多个moduleName对应于一个path，所以需要制定回调函数的执行顺序。
            var sort = function(moduleNameList){
                var path;    
                for(var i = 0;i<that.loadedRow.length;i++){
                    var _a = [],//[2,4,7]
                        _ta = [],//['m1','m2','m3']
                        fullpath = that.loadedRow[i];
                    for(var j = 0;j<moduleNameList.length;j++){
                        var mojoname = moduleNameList[j];
                        if(that.modules[mojoname].path == fullpath){
                            _a.push(j);
                            _ta.push(mojoname);
                        }
                    }
                    //这个文件中只有一个mojo，不用对_ExeQueue倒序，继续下一个循环
                    if(_a.length <= 1){
                        continue;
                    }else{
                        _a.reverse();
                        for(var k = 0;k<_a.length;k++){
                            var index = _a[k],
                                mname = _ta[k];
                            moduleNameList[index] = mname;
                        }
                    }
                }  
                return moduleNameList;
            };
            moduleNameList = createModuleNameList();      
            moduleNameList = sort(moduleNameList);  
            var exe = function(){
                var len = moduleNameList.length,m;
                for(;m = that.modules[moduleNameList[--len]];){
                    if(m.callback){
                        m.callback(that);
                    }
                }
                return;
            };
            exe();
        },
        /**
         * 执行ready（）中的依赖加载，并执行添加模块的回调
         * @param dependences
         * @param callback
         * @private
         */
        _execute: function(dependences,callback){
            var that = this,dep;
             var recursion = function(){
             	if(dependences.length === 0){
               		 if(that.isLoadAllModules()){  
                        that.exeCallback();
                        callback(that);
                    }else{
                        that.loadUnLoaded(recursion);
                    }
	            }else{ 
	            	dep = dependences.shift();
	                that.loadJsCss(dep,recursion);
	            }       
             }
             recursion();
        },
        /**
         * 加载js文件
         * @param url
         * @param callback
         */
        loadJs: function(url,callback){
            var that = this;
            if(this.isInArray(this.loadedRow,url)){
                callback(this);
                return;
            }
            if(this.isArray(url)){
                if(url.length === 1){
                    this.loadJs(url[0],callback);
                    return;
                }
                else{
                    var u = url.shift();
                    this.loadJs(u);
                    this.loadJs(url,callback);
                    return;
                }
            }
            this._currentPath = url;
            var script = document.createElement('script');
            script.type = 'application/javascript';

            if(script.readyState){ // 非标准浏览器
                script.onreadystatechange = function(){
                    if(/complete|loaded/i.test(script.readyState)){
                        that.loadedRow.push(url);
                        if(callback)
                            callback(that);
                    }
                }
            }else{
                script.onload = function(){
                    that.loadedRow.push(url);
                    if(callback)
                        callback(that);
                }
            }
            script.src = url; 
            var head = document.getElementsByTagName('head')[0];
            //防止IE6下head标签未闭合前使用appendChild抛错
            head.insertBefore(script,head.firstChild);
        },
        /**
         * 加载css文件
         * @param url
         * @param callback
         */
        loadCss: function(url,callback){
            if(this.isInArray(this.loadedRow,url)){
                callback(this);
                return;
            }
            if(this.isArray(url)){
                if(url.length === 1){
                    this.loadCss(url[0],callback);
                    return;
                }
                else{
                    var u = url.shift();
                    this.loadCss(u);
                    this.loadCss(url,callback);
                    return;
                }
            }
            var css = document.createElement('link'),
                head = document.getElementsByTagName('head')[0];
            css.type = 'text/css';
            css.rel = 'stylesheet';
            css.href = url;
            this._currentPath = url;
            this.loadedRow.push(url);
            if(callback)
                callback(this);
            head.insertBefore(css,head.firstChild);
            return;
        },
        loadJsCss: function(url,callback){ 
        	var that = this;  
            if(this.isInArray(this.loadedRow,url)){   console.log(this.loadedRow)
                callback(this);
                return;
            }  
            if(this.isArray(url)){
                if(url.length === 1){
                    this.loadJsCss(url[0],callback); 
                    return;
                }
                else{
                    var u = url.shift();
                    this.loadJsCss(u);
                    this.loadJsCss(url,callback);
                    return;
                }
            }

            if(/\.css$/i.test(url))
                that.loadCss(url,callback);
            else
                that.loadJs(url,callback);
            return;
        },
        distinct: function(arr){
            var hash = {},
                a = [],
                i,len = arr.length;
            for(i = 0;i < len;i++){ //使用hash表，以空间换时间。
                if(!hash[arr[i]]){
                    a.push(arr[i]);
                    hash[arr[i]] = true;
                }
            }
            return a;
        },
//    function(arr){
//       var a = [],i,len = arr.length;
//         for(i=0;i<len;i++){
//            if(a.indexOf(arr[i]) == -1){
//                a.push(arr[i]);
//            }
//        }
//        return a;
//    }


        /**
         * 实现DomContentLoaded的兼容性
         * @param callback
         */
        onDomContentLoaded: function(callback){
            var that = this,
                onlyOnce = true;
            var onReady = function(callback){
                if(onlyOnce){ 
                    onlyOnce = false;
                    that.isDomReady = true;
                    callback(that);
                }
                return;
            }
            if(this.browser.isIe && !(HTMLElement in window)){  // lt IE9
                if(self.top === self){
                    function s(){
                        try{
                            document.documentElement.doScroll('left');
                            onReady(callback);
                            return;
                        }catch(e){
                            setTimeout(s,50);
                        }
                    }
                    s();
                }else{ //包含框架
                    document.attachEvent('onreadystatechange',function(){
                        if(document.readyState === 'complete'){
                            onReady(callback);
                            document.detachEvent('onreadystatechange',arguments.callee);
                        }
                    });
                }

                document.onload = function(){
                    onReady(callback);
                    document.onload = null;
                };
            }else{ 
                document.addEventListener('DOMContentLoaded',function(){
                    onReady(callback);
                    document.removeEventListener('DOMContentLoaded',arguments.callee);
                },false);

                document.onload = function(){
                    onReady(callback);
                    document.onload = null;
                };
            }
        },
        /**
         * 检验是否是数组
         * @param arr
         * @returns {boolean}
         */
        isArray: function(arr){
            return {}.toString.call(arr) === '[object Array]' ? true : false;
        },
        isInArray: function(arr,item){
            if(!this.isArray(arr))
                return;
            var len = arr.length,a;
            if(len === 0)
            return false;
            if(!this.isArray(item)){
                for(;a = arr[--len];){
                    if(a === item)
                        return true;
                }
            }else{ // 传入的item也是数组
                var l = item.length,it;
                for(;a = arr[--len];){
                    for(;it = item[--l];){
                        if(a !== it)
                            return false;
                    }
                }
                return true;
            }

            return false;
        },
        /**
         * 浏览器嗅探
         */
        browser: (function(window,document,undefined) {
            var engine, name, version,
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
            if (document.compatMode === 'CSS1Compat') {
                isStandardMode = true;
            } else {
                isStandardMode = false;
            }
            if (/MSIE|Trident/.test(ua)) {
                engine = "Trident";
            } else if (/WebKit/.test(ua)) {
                engine = "WebKit";
            } else if (/Gecko/.test(ua)) {
                engine = 'Gecko';
            } else if (/Presto/.test(ua)) {
                engine = 'Presto';
            }

            if (ua.match(/(IE|Firefox|Chrome|Safari|Opera)(?:\/)(\d+)/)) {
                name = RegExp.$1;
                switch (name) {
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
                if (ua.match(/Version\/(\d+)/)) {
                    version = parseInt(RegExp.$1);
                }
            }

            if (isIe) {
                if (window.WebSocket) {
                    isIe10 = true;
                } else if (window.HTMLElement) {
                    isIe9 = true;
                } else if (window.localStorage) {
                    isIe8 = true;
                } else if (document.documentElement.currentStyle.minWidth) {
                    isIe7 = true;
                } else {
                    isIe6 = true;
                    try {// ie6不会对背景图片进行缓存，可通过如下实现，图片缓存在ie6的内存中。
                        document.execCommand('BackgroundImageCache', null, false);
                    } catch (e) {
                    }
                }
            }

            return {
                engine: engine,
                name: name,
                version: version,
                isIe: isIe,
                isFirefox: isFirefox,
                isChrome: isChrome,
                isOpera: isOpera,
                isSafari: isSafari,
                isIe10: isIe10,
                isIe9: isIe9,
                isIe8: isIe8,
                isIe7: isIe7,
                isIe6: isIe6,
                isStandardMode: isStandardMode
            }
        })
    }

    Dep = mixin({},_dep);

    Dep.onDomContentLoaded(function(){
        for(var i = 0,len = Dep.todoList.length;i<len;i++){
            Dep._execute(Dep.todoList[i].dependences,Dep.todoList[i].callback);
        }
    });
    window.Dep = Dep;
})(window);

