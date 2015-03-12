// JS编辑器 
// @version beta 0.1
// @date 2010-03-21
// @author goodNess
// @blog http://www.cnblogs.com/goodness2010/
// @email goodNess2010@126.com
var rt={};
rt.browser=(function(ua){
	ua=ua.toLowerCase();
	var bro = {
		ie: !!window.VBArray,
		safari: /webkit/g.test(ua) && !/chrome/g.test(ua),
		chrome: /chrome/g.test(ua),
		opera: /opera/g.test(ua),
		firefox: /firefox/g.test(ua) && /gecko/g.test(ua)
	},ver='';
	//若是IE，则取出版本号
	if(bro.ie){
		ver=/msie\s(\d+\.\d+)/gi.exec(ua);
        if(ver && ver.length)
		ver=ver[1];
	}
	bro.version=ver;
	return bro;
})(window.navigator.userAgent);

rt._init=function(){
	var ifr=document.createElement("iframe"),idoc;
	ifr.style.width="890px";
	ifr.style.height="370px";
	$("#richText")[0].appendChild(ifr);
	idoc=ifr.contentDocument || ifr.contentWindow.document;
	idoc.designMode="on";
	idoc.open();
	idoc.write("<html><head></head><body>RichText Editor!!</body></html>");
	idoc.close();
    rt.ifr = ifr;
	rt.idoc=idoc;
    rt.browser.ie && rt.saveBookMark();
};
//不需要设置参数的命令
rt.NO_ARG_COMMAND = {
		BOLD: 'bold',
		ITALIC: 'italic',
		UNDERLINE: 'underline',
		CUT: 'cut',
		COPY: 'copy',
		JUSTIFYLEFT: 'justifyleft',
		JUSTIFYRIGHT: 'justifyright',
		JUSTIFYCENTER: 'justifycenter',
		INSERTUNORDEREDLIST: 'insertunorderedlist',
		INSERTORDEREDLIST: 'insertorderedlist',
		OUTDENT: 'outdent',
		INDENT: 'indent',
		REMOVEFORMAT: 'removeformat'
};
//需要单击显示下拉框的命令
rt.POP_COMMAND = {
		FONTSIZE : 'fontsize',
		FONTNAME : 'fontname',
		FORECOLOR : 'forecolor',
		INSERTHTML : 'insertHTML',
		CREATELINK : 'createlink',
		INSERTIMAGE : 'insertimage',
		INSERTEMOTION : 'insertemotion'
}
//显示下拉框
rt.showPop=function(node,props){
	if(!node){
		return;
	}
	var $pop=$("#pop-bar"),x=node.offsetLeft,y=node.offsetTop+$(node).height();
	$pop.css({left:x,top:y});
	$pop.css(props);
	$pop.show();
};
//隐藏下拉框
rt.hidePop=function(){
	$("#pop-bar").css({display:'none'});
};
//执行execCommand命令
rt.execEdit=function(command,param){
	if(!rt.idoc.execCommand)
		return;
    rt.ifr.contentWindow.focus();
	rt.idoc.execCommand(command,false,param);
}

function getSelection(){
	var sn=window.getSelection() || document.getSelection() || document.selection;
	return sn;
}

// 保存快照用于IE定位
rt.saveBookMark = function() {
    var _this = this;
    if(_this.ifr.attachEvent){
        _this.ifr.attachEvent('onbeforedeactivate',function() {
            var rng = _this.idoc.selection.createRange();
            rng.pasteHTML('<span style="background-color: #000;color:#fff;">' + rng.htmlText + '</span>' );
            if(rng.getBookmark) {
                _this.bookmark = _this.idoc.selection.createRange().getBookmark(); // 保存光标用selection下的createRange();
            }
        });
        _this.ifr.attachEvent('onactivate',function() {
            if(_this.bookmark) {
                // Moves the start and end points of the current TextRange object to the positions represented by the specified bookmark.
                // 将光标移动到 TextRange 所以需要用 body.createTextRange();
                var rng = _this.idoc.body.createTextRange();
                rng.moveToBookmark(_this.bookmark);
                rng.select();
                _this.bookmark = null;
            }
        });
    }else{
        _this.ifr.addEventListener('beforedeactivate',function() {  console.log(123)
            var rng = _this.idoc.selection.createRange();
            if(rng.getBookmark) {
                _this.bookmark = _this.idoc.selection.createRange().getBookmark(); // 保存光标用selection下的createRange();
            }
        },false);
        _this.ifr.addEventListener('activate',function() {
            if(_this.bookmark) {
                // Moves the start and end points of the current TextRange object to the positions represented by the specified bookmark.
                // 将光标移动到 TextRange 所以需要用 body.createTextRange();
                var rng = _this.idoc.body.createTextRange();
                rng.moveToBookmark(_this.bookmark);
                rng.select();
                _this.bookmark = null;
            }
        },false);
    }

};
rt.addEvent=function(){
	var comm='';
	$("body").click(function(e){
		var targ=e.target,attr,
		popWin,html='';
		if(targ.tagName.toLowerCase()==='li'){
			attr=targ.getAttribute("name");
			if(attr.toUpperCase() in rt.NO_ARG_COMMAND){
				rt.execEdit(attr,null);
				rt.hidePop();
			}else if(attr.toUpperCase() in rt.POP_COMMAND){
				popWin=$("#pop-bar");
				html='';
				popWin.empty();
				switch (attr){
				case 'fontsize':
					for(var i=1;i<=7;i++){
						html+="<div><a href='javascript:void(0);' class='bas f"+i+"' name='"+i+"'>字号"+i+"</a></div>";
					}
					popWin.append($(html));
					rt.showPop($("#uagent>li[name=fontsize]")[0],{height:'200px',width:'100px'});
					comm='fontsize';
					break;
				case 'fontname':	
					html+="<div><a href='javascript:void(0);' class='bas f2' name='SimSun'>宋体</a></div>";
					html+="<div><a href='javascript:void(0);' class='bas f2' name='LiSu'>隶书</a></div>";
					html+="<div><a href='javascript:void(0);' class='bas f2' name='Microsoft YaHei'>雅黑</a></div>";
					html+="<div><a href='javascript:void(0);' class='bas f2' name='YouYuan'>幼圆</a></div>";
					popWin.append($(html));
					rt.showPop($("#uagent>li[name=fontname]")[0],{height:'200px',width:'100px'});
					comm='fontname';
					break;
				case 'createlink':
					html+="<div style='margin-top:30px;margin-left:15px;'><label for='URL'>链接：</label><input id='URL' type='text' style='width:80%;height:20px'></input></div>" +
					"<div style='text-align:center;'><button id='ok'>确定</button><button id='no'>取消</button></div>";
					popWin.append($(html));
					rt.showPop($("#uagent>li[name="+attr+"]")[0],{width:"300px",height:"100px"});
					comm = 'createlink';
					break;
				case 'insertimage':
					html+="<div style='margin-top:30px;margin-left:15px;'><label for='URL'>链接：</label><input id='URL' type='text' style='width:80%;height:20px'></input></div>" +
							"<div style='text-align:center;'><button id='ok'>确定</button><button id='no'>取消</button></div>";
					popWin.append($(html));
					rt.showPop($("#uagent>li[name="+attr+"]")[0],{width:"300px",height:"100px"});
					comm = 'insertimage';
					break;
                case 'insertHTML':
                    html = '<div style="margin-top:10px;text-align: center;"><label>行数：<input id="_rows" type="text" style="height:14px;width:30px;padding:2px;">px</label>' +
                        '<label style="margin-left:10px;">列数：<input id="_cols" type="text" style="height:14px;width:30px;padding:2px;">px</label></div>'
                    html += '<div style="margin-top:10px;text-align: center;"><label>表格高度：<input id="_width" type="text" style="height:14px;width:50px;padding:2px;">px</label></div>'
                    html += '<div style="margin-top:10px;text-align: center;"><label>表行高度：<input id="_height" type="text" style="height:14px;width:50px;padding:2px;">px</label></div>'
                    html+= "<div style='text-align:center;margin-top:10px;'><button id='ok'>确定</button><button id='no'>取消</button></div>";
                    popWin.append($(html));
                    rt.showPop($("#uagent>li[name="+attr+"]")[0],{width:"300px",height:"150px"});
                    comm = attr;
                    break;
				}
			}
		}else{
			//rt.hidePop();
		}
	});

    function createTable(rows,cols,width,height){
        var html = '', i,rlen, j,clen;
        html += '<table style="border:1px solid black;width: '+ width +'px;border-collapse:collapse;">'
        for(i=0;i<rows;i++){
            html += '<tr style="height:'+ height +'px;">';
            for(j=0;j<cols;j++){
                html += '<td style="border:1px solid black;"></td>';
            }
            html += '</tr>';
        }
        html += '</table>';

        if(rt.browser.ie){
            rt.ifr.contentWindow.focus();
            var textRange = rt.idoc.selection.createRange();
            textRange.pasteHTML(html);
        }else{
            rt.execEdit('insertHTML',html);
        }
    }
	//单击 编辑框 ，隐藏pop窗口     w3c浏览器的iframe无法绑定事件，需要对其contentWindow或者idoc进行绑定事件。
	$(rt.idoc).click(function(e){
		rt.hidePop();
	});
	//单击 下拉框 ，取得选中的值
	$("#pop-bar").click(function(e){
		var tar=e.target;
		if(comm && comm!=='createlink' && comm!=='insertimage' && comm != 'insertHTML'){
			rt.execEdit(comm,$(tar).attr("name"));
			rt.hidePop();
			comm = null;
		}else if(comm && comm == 'insertHTML'){
            if(tar.id === 'ok'){
                var rows = parseInt($('#_rows').val(),10),cols = parseInt($('#_cols').val(),10),
                    width = parseInt($('#_width').val(),10),
                    height = parseInt($('#_height').val(),10);

                createTable(rows,cols,width,height);
            }else{

            }

        }else{
			if(tar.id === 'ok'){
				rt.execEdit(comm,$('#URL').val());
				rt.hidePop();
			}else{
				
			}
		}

		
	})
};
rt._init();
rt.addEvent();