/**
 * Created by admin on 2014/10/27.
 * fix event mousewheel,
 * firefoxuse DOMMouseScroll
 * ie,opera 9.x,chrome,safari,opera use mousewheel
 */
addEvent = function(type,callback,useCapture){
    if(window.addEventListener){
        this.addEventListener(type,callback,!!useCapture);
    }else if(window.attachEvent){
        this.attachEvent('on'+type,callback);
    }
    return callback;
}
wheel = function(el,callback){
    var type = 'mousewheel';
    try{
        document.createEvent('MouseScrollEvents');
        type = 'DOMMouseScroll';
    }catch(e){}
    el.addEvent = addEvent;
    el.addEvent(type,function(e){
        e = e || window.event;
        var wheelDelta,delta;
        if('wheelDelta' in e){
            wheelDelta = e.wheelDelta;  // 正数向上滚动
            if(window.opera && window.opera.version() < 10){
                e.delta = parseInt(-wheelDelta) / 120;  // safari 下的wheeldelta为浮点数
            }
            e.delta = parseInt(wheelDelta) / 120;
        }else if('detail' in e){
            e.wheelDelta = -e.detail * 40; //修复firefox下没有wheelDelta的bug，detail为+-3
            e.delta = e.wheelDelta / 120;
        }
        callback.call(el,e);
        //阻止向上冒泡
        e.stopPropagation && e.stopPropagation();
        if("stopBubble" in e) e.stopBubble = true;
        return false;
    },false);
};

wheel($('#cr7')[0],function(e){ console.log(this.width+" "+ this.offsetWidth)
    this.style.width = this.offsetWidth + e.delta + 'px';
    this.style.height = this.offsetHeight + e.delta + 'px';
    e.preventDefault();
})