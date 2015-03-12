/*-------------------------base层，用于解决浏览器兼容以及封装原生接口--------------------------------*/
BS={};
//创建命名空间
BS.namespace=function(name){
	var o=BS,names=name.split(".");
	for(var i=names[0]==='BS'?1:0,len=names.length;i<len;i++){
		o[names[i]]=o[names[i]] || {};
		o=o[names[i]];
	}
}

var toStr = Object.prototype.toString,
	slice = Array.prototype.slice,
	arrayProto=Array.prototype;
/*-------------------debug---------------------------*/
BS.log=function(msg){
	console.log(msg);
}
/*--------------------extend--------------------------*/
BS.extend=function(SubObj,SuperObj){
	function Foo(){};
	Foo.prototype=SuperObj.prototype;
	var f=new Foo();
	SubObj.prototype=f;
	f.constructor=SubObj;
}

/*--------------------动态加载JS || CSS----------------*/
BS.loadJs=function(url){
	var js=document.createElement("script");
	js.type="text/javascript";
	js.src=url;
	document.body.appendChild(js);
}
BS.loadCss=function(url){
	var css=document.createElement("link");
	css.type="text/css";
	css.rel="stylesheet";
	css.href=url;
	document.getElementsByTagName("head")[0].appendChild(css);
}
/*-------------------操作DOM--------------------------*/
BS.namespace("Dom");
//设置透明度
BS.Dom.setOpacity=function(node,level){
	var ele=typeof node=="string"? document.getElementById(node):node;
	if(!ele) return null;
	if(document.all){
		//IE
		ele.style.filter="alpha(opacity="+level+")";
	}else
		ele.style.opacity=level/100;
}

/*-------------------操作Event--------------------------*/
BS.namespace("Event");
/*
 * @class   Event 事件处理类
 */
BS.Event={  //为了兼容IE中的this指向，这里在addEvent中采用 传入参数 scope的方式！！！
		addEvent:null,
		removeEvent:null,
		getEvent:function(event){
			return event?event:window.event;
		},
		getTarget:function(event){
			return event.target || event.srcElement;
		},
		preventDefault:function(event){
			if(event.preventDefault)
				event.preventDefault();
			else if(event.returnValue)
				event.returnValue=false;
		},
		stopPropatation:function(event){
			if(event.stopPropagation)
				event.stopPropagation();
			else
				event.cancelBubble=true;
		},
		getRelatedTarget:function(event){
			if(event.relatedTarget)
				return event.relatedTarget;
			else if(event.toElement)    //对IE8之前的浏览器
				return event.toElement;
			else if(event.fromElement)
				return event.fromElement;
			else
				return null;
		}
};
(function(){
	if(typeof window.addEventListener==="function"){
		BS.Event.addEvent=function(element,type,handler,scope){
			element.addEventListener(type,function(){handler.apply(scope,arguments)});
		};
		BS.Event.removeEvent=function(element,type,handler){
			element.removeEventListener(type,handler);
		}
	}else if(typeof window.attachEvent==="function"){
		BS.Event.addEvent=function(element,type,handler,scope){
			element.attachEvent("on"+type,function(){handler.apply(scope,arguments)});
		};
		BS.Event.removeEvent=function(element,type,handler){
			element.detachEvent("on"+type,handler);
		}
	}else{
		BS.Event.addEvent=function(element,type,handler,scope){
			element["on"+type]=function(){handler.apply(scope,arguments)};
		};
		BS.Event.removeEvent=function(element,type,handler){
			element["on"+type]=null;
		}
	}
})();

/*-------------------原生API封装--------------------------*/
BS.namespace("Lan");

//清楚字符串的空格
BS.Lan.trim=function(str){
	if(typeof str==="string")
		return str.replace(/^\s+|\s+$/g,"");
}
//判断是否为数组对象
BS.Lan.isArray=function(s){
	return Object.prototype.toString.call(s)==="[object Array]";
}
//判断是否为字符串
BS.Lan.isString=function(s){
	return typeof s==="string";
}
//get()
BS.Lan.get=function(node){
	return BS.Lan.isString(node)?document.getElementById(node):null;
}
//$()
BS.Lan.$=function(node){
	return BS.Lan.isString(node)?document.getElementById(node):null;
}
/*getElementByClassName
 * Param:className 必选。root，tag可选,其中root为父元素的ID
 */
BS.Lan.getElementsByClassName=function(className,root,tag){
	className=BS.Lan.isString(className)?className:null;
	if(root){
		root=BS.Lan.isString(root)?BS.Lan.get(root):null;
	}else
		root=document;
	tag=tag || "*";
	var eles=root.getElementsByTagName(tag),result=[];
	for(var i=0,len=eles.length;i<len;i++)
		for(var j=0,classes=eles[i].className.split(" "),num=classes.length;j<num;j++){
			if(classes[j]===className){
				result.push(eles[i]);
				break;
			}
				
		}
	
	return result;
}
BS.Lan.addClass=function(node,cname){
	if(!new RegExp("(^|\\s+)"+cname).test(node.className))
		node.className+=" "+cname;
}
BS.Lan.removeClass=function(node,cname){
	node.className=node.className.replace(new RegExp("(^|\\s+)"+cname),"");
}

//获取 浏览器当前视口	
BS.Lan.getViewPort=function(){
	if(document.compatMode==="BackCompat")    //混杂模式，用于IE7及其之前的版本
		return {
			width:document.body.clientWidth,
			height:document.body.clientHeight
	};
	else
		return {
		width:document.documentElement.clientWidth,
		height:document.documentElement.clientHeight
};
}

BS.Lan.each = function(ctx,callback){
	var i,len;
	if(arrayProto.each && ctx.each===arrayProto.each) return ctx.each(callback);
	if(toStr.apply(ctx)==='object [Array]'){
		for(i=0,len=ctx.length;i<len;i++){
			callback.apply(ctx,slice.apply(arguments,2));
		}
		return;
	}
	if(typeof ctx === 'object'){
		for(i in ctx){
			if(ctx.hasOwnProperty(i)){
				callback.apply(ctx[i],slice.apply(arguments,2));
			}
		}
	}
}
BS.Lan.map=function(ctx,callback){
	var result=[];
	if(arrayProto.map) return ctx.map(callback);
	BS.Lan.each(ctx,function(value,index){
		return result.push(callback.apply(ctx,slice.apply(arguments,2)));
	})
}



/*----------------------------------Cookie--------------------------*/
BS.namespace("Cookie");
BS.Cookie={
		get:function(name){
			var value,startIndex,endIndex;
			startIndex=document.cookie.indexOf(encodeURIComponent(name)+"="),
			len=(encodeURIComponent(name)+"=").length;
			if(startIndex!=-1){
				if(document.cookie.indexOf(";", startIndex)==-1){
					endIndex=document.cookie.length;
				}else{
					endIndex=document.cookie.indexOf(";", startIndex);
				}
				return decodeURIComponent(document.cookie.substring(startIndex+len, endIndex));
			}
		},
	  	set:function(name,value,domain,path,expires,secure){
	  		var cookieText="";
	  		cookieText=encodeURIComponent(name)+"="+encodeURIComponent(value);
	  		if(domain)
	  			cookieText+=";domain="+domain;
	  		if(path)
	  			cookieText+=";path="+path;
	  		if(expires instanceof Date)
	  			cookieText+=";expires="+expires.toGMTString();
	  		if(secure)
	  			cookieText+=";secure";
	  		document.cookie=cookieText;
	  	},
		del:function(name){
			this.set(name,get(name),null,null,new Date(0),null);
		}
}

/*-----------------------------------Browser----------------------------------*/
BS.namespace('Browser');
BS.Browser = (function(window,document,undefined){
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