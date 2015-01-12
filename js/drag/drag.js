/**
 * Created by admin on 2015/1/8.
 * 来自于cnblog上的代码
 * iframe兼容并不好
 */
(function(w){
    var Drag = function(el,minX,maxX,minY,maxY){
        // 拖拽元素
        //el: 拖拽元素
        //minX: X轴最小边界
        //minY: Y轴最小边界
        //maxX: X轴最大边界
        //maxY: X轴最大边界
        var self = this;
        this.obj = el;
        this.obj.minX = minX;
        this.obj.minY = minY;
        this.obj.maxX = maxX;
        this.obj.maxY = maxY;

        if(isNaN(Drag.getLocation(el).x))
            this.obj.style.left = !isNaN(getCss(el,"left")) && getCss(el,"left") || '0px';
        if(isNaN(Drag.getLocation(el).y))
            this.obj.style.top = !isNaN(getCss(el,"top")) && getCss(el,"top") || '0px';
        if(el.tagName.toLowerCase() == 'iframe'){
            this.obj.contentDocument.onmousedown = function(e){
                start.call(el,e);
            };
            this.obj.contentDocument.addEventListener('click',function(){console.log(123)})
        }else{
            this.obj.onmousedown = function(e){
                start.call(el,e);
            };
        }

    }
    Drag.fixEvent = function(e){
        e = e || window.event;
        if(!e.layerX)
            e.layerX = e.offsetX;
        if(!e.layerY)
            e.layerY = e.offsetY;
        if(!e.pageX)
            e.pageX = e.clientX + document.body.scrollLeft - document.body.clientLeft;
        if(!e.pageY)
            e.pageY = e.clientY + document.body.scrollTop - document.body.clientTop;

        return e;
    };
    Drag.getLocation = function(el){
        var location = {},style;
        if(window.getComputedStyle){
            style = window.getComputedStyle(el,'');
            location.x = parseInt(style.getPropertyValue('left'));
            location.y = parseInt(style.getPropertyValue('top'));
        }else{
            style = el.currentStyle;
            location.x = parseInt(style['left']);
            location.y = parseInt(style['top']);
        }
        return location;
    };

    function start(e){
        var self = this;
        e = Drag.fixEvent(e);
        this.inDOMLocation = {
            x: e.layerX,
            y: e.layerY
        };
        this.oldLocation = {
            x: e.clientX,
            y: e.clientY
        };
        //设定鼠标的移动范围
        if(this.minX)
            this.minMouseX = e.layerX + this.minX;
        if(this.minY)
            this.minMouseY = e.layerY + this.minY;
        if(this.maxX)
            this.maxMouseX = this.maxX - (this.offsetWidth - (parseInt(this.clientLeft) || 0) - e.layerX)
        if(this.maxY)
            this.maxMouseY = this.maxY - (this.offsetHeight - (parseInt(this.clientTop) || 0) - e.layerY)

        if(this.tagName.toLowerCase() == 'iframe'){
            this.contentDocument.onmousemove = function(e){
                drag.call(self,e);
            };
            this.contentDocument.onmouseup = function(e){
                stop.call(self,e);
            };
        }else{
            this.onmousemove = function(e){
                drag.call(self,e);
            };
            this.onmouseup = function(e){
                stop.call(self,e);
            };
        }

    }
    function drag(e){
        e = Drag.fixEvent(e);
        var newLocation = {
            x: e.clientX,
            y: e.clientY
        }, x,y;
        x = newLocation.x;
        y = newLocation.y;
        if(this.minMouseX)
            x = Math.max(this.minMouseX,newLocation.x)
        if(this.minMouseY)
            y = Math.max(this.minMouseY,newLocation.y)
        if(this.maxMouseX)
            x = Math.min(this.maxMouseX,x)
        if(this.maxMouseY)
            y = Math.min(this.maxMouseY,y)

        this.style.left = Drag.getLocation(this).x + (x - this.oldLocation.x) + 'px';
        this.style.top = Drag.getLocation(this).y + (y - this.oldLocation.y) + 'px';
        this.oldLocation = {
            x: x,
            y: y
        }
        return;
    }
    function stop(){
        this.oldLocation = null;
        this.inDOMLocation = null;
        if(this.tagName.toLowerCase() == 'iframe'){
            this.contentDocument.onmouseup = this.contentDocument.onmousemove = null
        }else{
            this.onmouseup = this.onmousemove = null
        }
    }

    function getCss(el,k){
        if(window.getComputedStyle){
            return getComputedStyle(el)[k]
        }else
            return el.currentStyle[k];
    }
    w.Drag = Drag;
})(window)
