/**
 * Created by admin on 2014/11/4.
 * 旋转图片，裁剪图片
 * lte ie9 可以尝试引用excanvas，但也可能不兼容
 */
function handleImage(img){
    var curW,curH,curX,curY,lastX,lastY;
    function css(obj,key){
        return obj.currentStyle ? obj.currentStyle[key] : document.defaultView.getComputedStyle(obj,null)[key];
    }
    function get(id){
        return document.getElementById(id);
    }
    if(typeof img === 'object' && img.tagName.toLowerCase() === 'img'){
        curH = parseInt(css(img,'height'));
        curW = parseInt(css(img,'width')); console.log(curH)
    }
    var wrapper = document.createElement('div');
    wrapper.style.height = curH + 'px';
    wrapper.style.width = curW + 'px';
    wrapper.style.position = 'relative';
    var inner = '<canvas id="_innercanvas" ><\/canvas>' +
        '<div id="_clipContainer" style="width:40px;height:40px;left:80px;top:80px;border:1px solid #000000;background: #ffffff;opacity: 0.3;filter:alpha(opacity=30);position:absolute;">' +
            '<div id="_nw" style="width:4px;height:4px;position:absolute;border: 1px solid #ffffff;left:-3px;top:-3px;"><\/div>' +
            '<div id="_n" style="width:4px;height:4px;position:absolute;border: 1px solid #ffffff;left:17px;top:-3px;"><\/div>'+
            '<div id="_ne" style="width:4px;height:4px;position:absolute;border: 1px solid #ffffff;right:-3px;top:-3px;"><\/div>' +
            '<div id="_e" style="width:4px;height:4px;position:absolute;border: 1px solid #ffffff;right:-3px;top:17px;"><\/div>' +
            '<div id="_se" style="width:4px;height:4px;position:absolute;border: 1px solid #ffffff;right:-3px;bottom:-3px;"><\/div>' +
            '<div id="_s" style="width:4px;height:4px;position:absolute;border: 1px solid #ffffff;left:17px;bottom:-3px;"><\/div>' +
            '<div id="_sw" style="width:4px;height:4px;position:absolute;border: 1px solid #ffffff;left:-3px;bottom:-3px;"><\/div>' +
            '<div id="_w" style="width:4px;height:4px;position:absolute;border: 1px solid #ffffff;left:-3px;top:17px;"><\/div>' +
        '<\/div>';
    wrapper.innerHTML = inner;
    img.parentNode.insertBefore(wrapper,img);
    var canvas = get('_innercanvas');
    if(window.ActiveXObject && window.G_vmlCanvasManager){
        //IE
        oCanvas = window.G_vmlCanvasManager.initElement(canvas); //使IE支持动态创建的canvas元素
    }
    wrapper.insertBefore(img,canvas);

    var rotateImg = function(canvas,img,deg){
        deg = Number(deg) || parseInt(deg,10);
        var rad = deg * Math.PI / 180, s, c,canW,canH;
        s = Math.round(Math.sin(rad) * 100) / 100;
        c = Math.round(Math.cos(rad) * 100) / 100;
        canH = curH;
        canW = curW;
        canH = (Math.abs(curH * c) + Math.abs(curW * s)) >> 0;
        canW = (Math.abs(curH * s) + Math.abs(curW * c)) >> 0;
        canvas.style.width = canW + 'px';
        canvas.style.height = canH + 'px';
        var graphic = canvas.getContext('2d');
        graphic.save();
        graphic.translate(s*curH,0);
        graphic.drawImage(img,0,0,curW,curH);
        graphic.restore();
        img.style.display = 'none';
    }

    rotateImg(canvas,img,get('degree').value);
}