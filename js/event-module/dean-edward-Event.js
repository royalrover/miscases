/**
 * Created by admin on 2014/11/4.
 * dean edward 的无入侵事件系统
 * jquery的第一代时间系统
 */
addEvent.guid = 1;
addEvent.events = {}; //简单缓存系统
function addEvent(el,type,fn){
    if(!fn.$$guid){
        fn.$$guid = addEvent.guid++;
    }
    if(!el.$$guid){
        el.$$guid = addEvent.guid++;
    }
    if(!addEvent.events[el.$$guid]){
        addEvent.events[el.$$guid] = {};
    }
    var fns = addEvent.events[el.$$guid][type];
    if(!fns){
        fns = addEvent.events[el.$$guid][type] = {};
        // 若在html行内绑定事件，则首先执行
        if(el['on'+type]){
            fns[0] = el['on'+type];
        }
    }
    fns[fn.$$guid] = fn;
    el['on'+type] = handleEvent;
}

function deleteEvent(el,type,fn){
    if(fn.$$guid in addEvent.events[el.$$guid][type]){
        delete addEvent.events[el.$$guid][type][fn.$$guid];
    }
}

function handleEvent(event){
    // 修正跨iframe获取不到event的bug
    event = event || fixEvent(((this.ownerDocument || document || this).parentWindow || window).event);
    var type = event.type,returnValue = true,
    handlers = addEvent.events[this.$$guid][type];
    for(var i in handlers){
        if(handlers[i].call(this,event) === false){
            returnValue = false;
        }
    }
    return returnValue;
}

function fixEvent(event) {

    event.preventDefault = function(){return event.returnValue = false;};
    event.stopPropagation = function(){return event.cancelBubble = true;};
    return event;
}