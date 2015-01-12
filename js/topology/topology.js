/**
 * topology.js
 * 	made by YL
 *  version 0.1
 *  time:14/9/25
 */
function log(){
	console.log(arguments[0])
}
(function(global,undefined){
	var Topo = {
		version : 0.1,
		namespace : function(name){
			var names = [],
			i,len,
			parent = this;
			typeof name === 'string'? name:'';
			names = name.split('.');
			names[0] === 'Topo'?names.splice(0,1):names;
			for(i=0,len=names.length;i<len;i++){
				if(!parent[names[i]]){
					parent[names[i]]={};
				}
				parent = parent[names[i]];
			}
			return;
		}
	};
	global.Topo = Topo;
})(window);

/**
 * 
 * 工具类， Topo.Utils
 * @param {Object} Topo
 * @param {Object} undefined
 */
(function(Topo,undefined){
	Topo.namespace('Topo.Utils');
	var utils = Topo.Utils,
	slice = Array.prototype.slice,
	toString = Object.prototype.toString;
	
	Array.prototype.delArrayElement = function(arg){
		if(typeof arg !== 'number'){
			var i,len;
			for(i=0,len=this.length;i<len;i++){
				if(this[i] === arg){
					return this.slice(0,i).concat(this.slice(i+1,this.length));
				}
			}
		}else{ 
			return this.slice(0,arg).concat(slice.call(this,arg+1,this.length));
		}
	};
	utils.isArray = function(arr){
		if (Array.isArray) {
			return Array.isArray(arr);
		}
		if(toString.call(arr) === '[object Array]')
			return true;
		return false;
	}
	
	utils.publisher = {
		subscribers : {},
		subscribe : function(type,fn){
			typeof type === 'string' ? type:'';
			if (type === '') return;
			if(!this.subscribers[type]){
				this.subscribers[type] = [fn];
				return;
			}
			this.subscribers[type].push(fn);
			return;
		},
		unsubscribe : function(type,fn){
			this.handler('del',type,fn);
		},
		publish : function(type,event){
			this.handler('publish',type,event);
		},
		handler : function(action,type,model){
			typeof type === 'string' ? type: '';
			if(type === '') return;
			var fns = this.subscribers[type],
			i,len;
			if(action === 'del'){ 
				if(utils.isArray(fns)){
					for(i=0,len=fns.length;i<len;i++){
					if(fns[i] === model){
						fns.splice(i,1);
						return;
					}
				}
				}
			}else{ 
				if(utils.isArray(fns)){
					for(i=0,len=fns.length;i<len;i++){ 
						fns[i](model);
					}
				}
			}
		}
	};
	utils.makePublisher = function(publisher){
		var i,len,obj = {};
		for(i in publisher){
			if(publisher.hasOwnProperty(i) && typeof publisher[i]==='function' ){
				obj[i]=publisher[i];
			}
		};
		obj.subscribers={
			
		};
		return obj;
	};
	
	utils.getXYInCanvas = function(e,canvas){
		e = e || window.event;
		return {
			x : document.body.scrollLeft + (e.x || e.layerX) - canvas.offsetLeft,
			y : document.body.scrollTop + (e.y || e.layerY) -canvas.offsetTop
		}
	};
	utils.getPageXY = function(e){
		if(e.pageX && e.pageY){
			return {
				pageX : e.pageX,
				pageY : e.pageY
			}
		}
		var doc = document.documentElement,
		body = document.body;
		return {
			pageX : e.clientX + (doc && doc.scrollLeft || body && body.scrollLeft) - (doc && doc.clientLeft || body && body.clientlLeft),
			pageY : e.clientY + (doc && doc.scrollTop || body && body.scrollTop) - (doc && doc.clientTop || body && body.clientlTop)
		}
	};
	utils.clone = function(obj){
		var o={},i;
		for(i in obj){
			if(obj.hasOwnProperty(i)){
				o[i]=obj[i];
			}
		}
		return o;
	}
	
})(Topo);
/**
 * 舞台类，Topo.Stage
 * @param {Object} Topo
 * @param {Object} undefined
 */
(function(Topo,undefined){
//	Topo.namespace('Topo.Stage');
	function Stage(canvas){
		stage = this;
		this.initialize = function(canvas){
			this.width = 0;
			this.height = 0;
			this.canvas = canvas;
			this.canvas.style.cursor = 'default';
			this.scenes = [];
			this.currentScene = null;
			this.frame = 20;
			this.width = canvas.width;
			this.height = canvas.height;
			this.graphic = canvas.getContext('2d');
			this.publisher = Topo.Utils.makePublisher(Topo.Utils.publisher);
		};
		this.initialize(canvas);
		
		//有问题-----------
		this.saveAsImage = function(){
			var canvas = this.canvas,
			img = new Image(),
			imgUrl,openwindow;
			imgUrl = canvas.toDataURL('image/png');
			img.src = imgUrl;
			openwindow = window.open("_blank",'from canvas');
			openwindow.document.write('<img src="'+imgUrl+'"/>');
		}
		
		this.addEventListener = function(type,fn){
			this.publisher.subscribe(type,fn);
		};
		this.removeEventListener = function(type,fn){
			this.publisher.unsubscribe(type,fn);
		}
		this.publish = function(type,evnet){
			this.publisher.publish(type,event);
		}
		
		function toEvent(canvasEvent){
			var XY = Topo.Utils.getXYInCanvas(canvasEvent,this.canvas),
			pageXY = Topo.Utils.getPageXY(canvasEvent);
			return {
                x: XY.x,  //返回在stage中的坐标
                y: XY.y,
                button: canvasEvent.button,
                ctrlKey: canvasEvent.ctrlkey,
                altKey: canvasEvent.altkey,
                shiftKey: canvasEvent.shiftKey,
                pageX: pageXY.pageX,
                pageY: pageXY.pageY,
                scene: stage.currentScene
            };
		}
		
		document.oncontextmenu = function(){return false;};
		document.addEventListener('selectstart',function(){return false;});
		
		canvas.addEventListener('click',function(e){
			e = toEvent(e);
			stage.publisher.publish('click',e);
			if(stage.currentScene){
				stage.currentScene.clickHelper(e);
			}
		});
		canvas.addEventListener('dblclick',function(e){
			e = toEvent(e);
			stage.publisher.publish('dblclick',e);
			if(stage.currentScene){
				stage.currentScene.dblclickHelper(e);
			}
		});
		canvas.addEventListener('mousemove',function(e){
			e = toEvent(e);
			stage.publisher.publish('mousemove',e);
			if(stage.currentScene){
				stage.currentScene.mousemoveHelper(e);
			}
		});
		canvas.addEventListener('mousedown',function(e){
			e = toEvent(e);
			stage.publisher.publish('mousedown',e);
			if(stage.currentScene){
				stage.currentScene.mousedownHelper(e);
			}
		});
		canvas.addEventListener('mouseup',function(e){
			e = toEvent(e);
			stage.publisher.publish('mouseup',e);
			if(stage.currentScene){
				stage.currentScene.mouseupHelper(e);
			}
		});
		
		window.addEventListener('keydown',function(e){
			stage.publisher.publish('keydown',e);
			if(stage.currentScene){
				stage.currentScene.keydownHelper(e);
			}
		});
		window.addEventListener('keyup',function(e){
			stage.publisher.publish('keyup',e);
			if(stage.currentScene){
				stage.currentScene.keyupHelper(e);
			}
		});
		
		this.clearAllScenes = function(){
			this.scenes = [];
			this.currentScene = null;	
		};
		this.repaint = function(graphic){
			if(!this.currentScene.visiable) return;
			this.currentScene.repaint(graphic);
		};
		
		setInterval(function(){stage.repaint(stage.graphic)},this.frame);
	}
	
	Topo.Stage = Stage;
})(Topo);
/**
 * AbstractScene 
 * 
 * Scene
 * @param {Object} Topo
 * @param {Object} undefined
 */
(function(Topo,undefined){
	var utils = Topo.Utils;
	function AbstractScene(stage){
		var self = this;
		this.initialize = function(stage){
			this.graphic = stage.graphic;
			this.width = stage.width;
			this.height = stage.height;
			this.style = {
				fillStyle : "238,238,238"
			};
			this.stage = stage;
			this.stage.currentScene = this;
			this.publisher = Topo.Utils.makePublisher(Topo.Utils.publisher);
			this.elements = [];
			this.elementsMap = {};
			this.backgroundImg = null;
			this.shadow = false;
			this.visiable = true;
		};
		this.show = function(){
			this.visiable = true;
			this.paint();
		}
		this.hide = function(){
			this.visiable = false;
		}
		this.pushElement = function(el){
			this.elements.push(el);
			var id = new Date().getTime()+"_"+(this.elements.length-1);
			this.elementsMap[id] = el; 
		};
		this.clearAllElements = function(){
			this.elements = [];
			this.elementsMap = {};
		} 
		this.add = function(el){
			this.pushElement(el);
		};
		this.remove =function(el){
			var i,len,e,
			els = this.elements,
			map = this.elementsMap;
			els = els.delArrayElement(el);
			for(i in map){
				if(map.hasOwnProperty(i)){
					if(map[i] === el){
						delete map[i];
					}
				}
			}
		};
		this.paintElements = function(graphic){
			var i,len,
			els = this.elements,
			el; 
			for(i=0,len=els.length;i<len;i++){
				el = els[i];
				graphic.save();
				if(el.translate){
					if(el.width && el.height){  //将坐标轴移至元素的中心
						graphic.translate(el.x + el.width * el.scaleX / 2,el.y+el.height * el.scaleY / 2);
					}
					if(el.rotate){
						graphic.rotate(el.rotate);
					}
					graphic.scale(el.scaleX,el.scaleY);
				}
				el.paint(graphic);
				graphic.restore();
			}
		};
		this.setBackground = function(o){
			if(typeof o ==='string'){
				var img = new Image();
				img.src = o;
				this.backgroundImg = img; 
				return;
			}else if(o instanceof Image){
				this.backgroundImg = o;
				return;
			}
		};
		this.paintBackground = function(graphic){
			graphic.save();
			graphic.fillStyle = this.style.fillStyle;
			
			if(this.backgroundImg){
				graphic.drawImage(this.backgroundImg,0,0,this.width,this.height)
			}else{
				graphic.fillRect(0,0,this.width,this.height);
			}
			graphic.restore();
		};
		this.paint = function(graphic){
			if(!this.visiable) return;
			graphic.clearRect(0,0,this.width,this.height);
			graphic.save();
			if(this.shadow){
				graphic.shadowColor = "rgba(0,0,0,0.5)";
				graphic.shadowOffsetX = 3;
				graphic.shadowOffsetY = 3;
				graphic.shadowBlur = 4;
			}
			this.paintBackground(graphic);
			this.paintElements(graphic);
			graphic.restore();
		}
		this.repaint = function(graphic){
			this.paint(graphic);
		}
		this.clickHelper = function(e){
			this.clickX = e.x;
			this.clickY = e.y;
			var event = utils.clone(e);
			this.publisher.publish('_click',event);
		};
		this.dblclickHelper = function(e){
			this.isDblclick = true;
			this.dblclickX = e.x;
			this.dblclickY = e.y;
			var event = utils.clone(e);
			this.publisher.publish('_dblclick',event);
		};
		this.mousemoveHelper = function(e){
			this.mousemoveX = e.x;
			this.mousemoveY = e.y;
			var event;
			if(this.isMousedown){  
				event = {
					x : e.x,
					y : e.y,
					deltaX : e.x - this.mousedownX,
					deltaY : e.y - this.mousedownY,
					mousedownX : this.mousedownX,
					mousedownY : this.mousedownY
				};
				this.isMousedrag = true;
				this.publisher.publish('_mousedrag',event);
				this.isMousedrag = false;
				return;
			}
			this.isMousemove = true;
			this.publisher.publish('_mousemove',e);
		}
		this.mousedownHelper = function(e){
			this.isMousedown = true;
			this.mousedownX = e.x;
			this.mousedownY = e.y;
			var event = utils.clone(e);
			this.publisher.publish('_mousedown',event);
		}
		this.mouseupHelper = function(e){
			this.isMousedown = false;
			this.mouseupX = e.x;
			this.mouseupY = e.y;
			var event = utils.clone(e);
			this.publisher.publish('_mouseup',event);
		}
		this.keydownHelper = function(e){
			this.isKeydown = true;
			(e.ctrlKey === undefined || e.ctrlKey === false)? this.isCtrlKeyDown = false : this.isCtrlKeyDown = true;
			var event = utils.clone(e);
			this.publisher.publish('_keydown',event);
		}
		this.keyupHelper = function(e){
			this.isKeydown = false;
			this.isCtrlKeyDown = false;
			var event = utils.clone(e);
			this.publisher.publish('_keyup',event);
		}
		

		/*
		 * 判断鼠标是否在元素的区域
		 * @param:el
		 * @param:location  鼠标当前位置
		 */
		this.isMouseOverElement = function(el,location){
			if(el.translate){
				if(el.x < location.x && el.x + el.width * el.scaleX > location.x && el.y < location.y && el.y + el.height * el.scaleY > location.y){
					return true;
				}
			}else{
				if(el.x < location.x && el.x + el.width > location.x && el.y < location.y && el.y + el.height > location.y){
					return true;
				}
			}
			return false;
		};
		this.isMouseOverLink = function(link,location){
			var sx,sy,ex,ey,dx,dy;
			sx = link.startNode.width / 2 + link.startNode.x;
			sy = link.startNode.height / 2 + link.startNode.y;
			ex = link.endNode.width / 2 + link.endNode.x;
			ey = link.endNode.height / 2 + link.endNode.y;
			dx = ex - sx;
			dy = ey - sy;			
			if([dy * (location.x - sx)] /[dx * (location.y - sy)] >=0.96){
				if(location.x >= sx && location.x <= ex && location.y >= sy && location.y <= ey){
					return true;
				}
			}
			return false;
		}
		this.getMouseOverElement = function(location){
			var i,len,
			els = this.elements; 
			for(i=0,len=els.length;i<len;i++){ 
				if(els[i] instanceof Topo.Node){
					if(this.isMouseOverElement(els[i],location)){
						return els[i];
					}
				}else if(els[i] instanceof Topo.Link){
					if(this.isMouseOverLink(els[i],location)){
						return els[i];
					}
				}
				
			}
			return null;
		};
		/*
		 * 选定指定区域内的所有元素
		 * @param location
		 */
		this.getElementsInArea = function(location){
			var i,len,els = this.elements,el,
			selectedEls = [];
			for(i=0,len=els.length;i<len;i++){
				el = els[i];
				if(el.translate){
					if(el.x > location.x1 && el.x + el.width * el.scaleX < location.x2 && el.y > location.y1 && el.y + el.height * el.scaleY < location.y2){
						selectedEls.push(el);
					}
				}else{
					if(el.x > location.x1 && el.x + el.width < location.x2 && el.y1 > location.y && el.y + el.height < location.y2){
						selectedEls.push(el);
					}
				}
			}
			return selectedEls;
		}
	}
	
	function Scene(stage){
		var self = this;
		this.initialize = function(stage){
			Scene.prototype.initialize(stage);
			this.currentElement = null;
			this.mouseoverElement = null;
			this.nodes = [];
			this.links = [];
			this.containers = [];
			this.selectElements = [];
		}
		this.initialize(stage);
		this.setBackground = function(o){
			if(typeof o ==='string'){
				var img = new Image();
				img.src = o;
				Scene.prototype.backgroundImg = img; 
				return;
			}else if(o instanceof Image){
				Scene.prototype.backgroundImg = o;
				return;
			}
		};
		this.add = function(el){
			Scene.prototype.add(el);
			if(el instanceof Topo.Node){
				this.nodes.push(el);
			}else{
				if(el instanceof Topo.Link){
					this.links.push(el);
				}else if(el instanceof Topo.Container){
					this.containers.push(el);
				}
			}
		};
		this.remove = function(el){
			Scene.prototype.remove(el);
			if(el instanceof Topo.Node){
				this.nodes = this.nodes.delArrayElement(el);
			}else{
				if(el instanceof Topo.Link){
					this.links = this.links.delArrayElement(el);
				}else if(el instanceof Topo.Container){
					this.containers = this.containers.delArrayElement(el);
				}
			}
		};
		this.clear = function(){
			this.currentElement = null;
			this.mouseoverElement = null;
			this.nodes = [];
			this.links = [];
			this.containers = [];
			this.selectElements = [];
			Scene.prototype.clearAllElements();
		};
		this.getNodes = function(){
			return this.nodes;
		};
		this.getLinks = function(){
			return this.getLinks;
		};
		this.getContainers = function(){
			return this.containers;
		};
		
		this.addEventListener = function(type,fn){
			this.publisher.subscribe(type,fn);
		};
		this.removeEventListener = function(type,fn){
			this.publisher.unsubscribe(type,fn);
		};
		this.publish = function(type,event){
			this.publisher.publish(type,event);
		};
		
		this.isInSelectedElements = function(el){
			var i,len,e,els = this.selectElements;
			if(el.length) return false;
			for(i=0,len=els.length;i<len;i++){
				e = els[i];
				if(e === el)
					return true;
			}
			return false;
		};
		this.pushInSelectedElements = function(el){
			this.selectElements.push(el);
			this.currentElement = el;
		};
		// 删除元素的选中状态
		this.cancelAllSelectedElements = function(){
			var i,len,els = self.elements,el;
			for(i=0,len=els.length;i<len;i++){
				els[i].isSelected = false;
			}
		}
		
		this.addEventListener('_click',function(e){
			var event = utils.clone(e),
			selectedEl,location;
			location = {
				x : e.x,
				y : e.y
			};
			self.publish('click',e);
			selectedEl = self.getMouseOverElement(location);
			if(selectedEl){
	//			self.cancelAllSelectedElements();
				self.currentElement = selectedEl;
				event.target = selectedEl;
				selectedEl.onSelected();
				selectedEl.onClick(event);
			}else{
				if(self.selectElements.length !== 0){
					self.currentElement = null;
					return;
				}
				self.currentElement = null;
				self.cancelAllSelectedElements();
			}

		});
		this.addEventListener('_dblclick',function(e){
			var event = utils.clone(e),
			selectedEl,location;
			location = {
				x : e.x,
				y : e.y
			};
			self.publish('dblclick',e);
			selectedEl = self.getMouseOverElement(location);
			if(selectedEl){
	//			self.cancelAllSelectedElements();
				self.currentElement = selectedEl;
				event.target = selectedEl;
				selectedEl.onSelected();
				selectedEl.onDblclick(event);
			}else{
				self.currentElement = null;
				self.cancelAllSelectedElements();
			}
		});
		this.addEventListener('_mousedrag',function(e){
			var event = utils.clone(e),
			selectedEl,location;
			location = {
				x : e.x,
				y : e.y
			};
			self.publish('mousedrag',e);  
			selectedEl = self.getMouseOverElement(location); log(self.selectElements.length)
			if(self.currentElement && self.currentElement.dragable){
				var ex,ey,nx,ny;
				ex = self.currentElement.x;
				ey = self.currentElement.y;
				event.target = self.currentElement;
				self.currentElement.onMousedrag(event); 
				// 新位置 = 原来位置 + 偏移位置
				nx = self.currentElement.selectedLocation.x+e.deltaX;
				ny = self.currentElement.selectedLocation.y+e.deltaY;
				self.currentElement.setLocation(nx,ny);
				if(self.selectElements){
					var i,len,el,x,y;
					for(i=0,len=self.selectElements.length;i<len;i++){
						el = self.selectElements[i];
						if(el === self.currentElement)
							continue;
						x = el.selectedLocation.x + e.deltaX;
						y = el.selectedLocation.y + e.deltaY;
						el.setLocation(x,y);
					}
				}
			}
			else{
				var graphic = self.graphic,
				a,b,c,d,location,
				selectedEles,
				i,len;
				a = e.mousedownX;
				b = e.mousedownY;
				c = e.deltaX;
				d = e.deltaY;
				location = {
					x1 : a,
					y1 : b,
					x2 : a + c,
					y2 : b + d
				};
				graphic.save();
				graphic.beginPath();
				graphic.fillStyle = "rgba(0,0,236,0.1)";
				graphic.strokeStyle = "rgba(0,0,236,0.5)";
				graphic.rect(a,b,c,d);
				graphic.fill();
				graphic.stroke();
				graphic.closePath();
				graphic.restore();
				selectedEles = self.getElementsInArea(location);
				self.selectElements = [];
				for(i=0,len=selectedEles.length;i<len;i++){
					selectedEles[i].onSelected();
					self.selectElements.push(selectedEles[i]);
				}
			}
		});
		this.addEventListener('_mousemove',function(e){
			var event = utils.clone(e),selectedEl,
			location = {
				x : e.x,
				y : e.y
			};  
			self.publish('mousemove',e);
			selectedEl = self.getMouseOverElement(location); 
			if(selectedEl){
				if(self.mouseoverElement && self.mouseoverElement !== selectedEl){
					self.mouseoverElement.onMouseout(event)
				}
				self.mouseoverElement = selectedEl;
				selectedEl.onMouseover(event);
				selectedEl.onSelected();
			}else{
				if(self.mouseoverElement){
					self.mouseoverElement.onMouseout(event);
					self.mouseoverElement.cancelSelected();
				}
			}
		});
		this.addEventListener('_mousedown',function(e){
			var event = utils.clone(e),
			selectedEl,location;
			location = {
				x : e.x,
				y : e.y
			};
			self.publish('mousedown',e);
			selectedEl = self.getMouseOverElement(location);
			if(self.isCtrlKeyDown && selectedEl){  //按下ctrl进行多选
				event.target = selectedEl;
				selectedEl.onSelected();
				selectedEl.onMousedown(event);
				self.pushInSelectedElements(selectedEl);
			}else if(!self.isCtrlKeyDown && selectedEl && self.selectElements.length > 1){
				self.currentElement = selectedEl;
			}   //当被选中的集合中元素数量只有一个或者没有时，则只对当前元素可进行推拽.
			else if(!self.isCtrlKeyDown && selectedEl && self.selectElements.length <= 1){
				self.cancelAllSelectedElements();
				self.selectElements = [];
				self.currentElement = selectedEl;
				self.selectElements.push(selectedEl);
				event.target = selectedEl;
				selectedEl.onSelected();
				selectedEl.onMousedown(event);
			}else{
				self.currentElement = null;
				self.selectElements = [];
			}
		});
		this.addEventListener('_mouseup',function(e){
			var event = utils.clone(e),
			selectedEl,location;
			location = {
				x : e.x,
				y : e.y
			};
			self.publish('mouseup',e);
			selectedEl = self.getMouseOverElement(location);
			if(selectedEl){
				event.target = selectedEl;
				selectedEl.onMouseup(event);
			}
		});
		this.addEventListener('_keydown',function(e){
			var event = utils.clone(e);
			self.publish('keydown',event);
		});
		this.addEventListener('_keyup',function(e){
			var event = utils.clone(e);
			self.publish('keyup',event);
		});
	}
	
	Scene.prototype = new AbstractScene();
	Topo.AbstractScene = AbstractScene;
	Topo.Scene = Scene;
	
})(Topo);

(function(Topo,undefined){
	var utils = Topo.Utils;
	function AbstractElement(){
		this.initialize = function(){
			this.publisher = Topo.Utils.makePublisher(Topo.Utils.publisher);
		};
		
		this.setLocation = function(x,y){
			this.x = x;
			this.y = y;
		};
		this.getLocation = function(){
			return {
				x : this.x,
				y : this.y
			};
		};
		
		this.setSize = function(width,height){
			this.width = width;
			this.height = height;
		};
		this.getSize = function(){
			return {
				width : this.width,
				height : this.height
			}
		};
		
		this.setBound = function(x,y,width,height){
			this.setLocation(x,y);
			this.setSize(width,height);
		};
		this.getBound = function(){
			return {
				x : this.x,
				y : this.y,
				width : this.width,
				height : this.height
			}
		};
		
		this.addEventListener = function(type,fn){
			this.publisher.subscribe(type,fn);
		};
		this.removeEventListener = function(type,fn){
			this.publisher.unsubscribe(type,fn);
		};
		this.publish = function(type,event){
			this.publisher.publish(type,event);
		};
		this.cancelSelected = function(){
			this.isSelected = false;
		}
		this.onSelected = function(){
			this.isSelected = true;
			this.selectedLocation = {
				x : this.x,
				y : this.y
			};
		};
		this.onClick = function(e){
			this.publish('click',e);
		};
		this.onDblclick = function(e){
			this.publish('dblclick',e);
		};
		this.onMouseover = function(e){
			this.isMouseover = true;  
			this.publish('mouseover',e);
		};
		this.onMouseout = function(e){
			this.isMouseover = false;
			this.publish('mouseout',e);
		};
		this.onMousedrag = function(e){
			this.isMousedrag = true;
			this.mousedragLocation = {
				mousedownX : e.mousedownX,
				mousedownY : e.mousedownY,
				deltaX : e.deltaX,
				deltaY : e.deltaY,
				x : e.x,
				y : e.y
			};
			this.publish('mousedrag',e);
		};
		this.onMousedown = function(e){
			this.isMousedown = true;
			this.mousedownLocation = {
				x : e.x,
				y : e.y
			};
			this.publish('mousedown',e);
		};
		this.onMouseup = function(e){
			this.isMousedown = false;
			this.isMousedrag = false;
			this.publish('mouseup',e);
		};
		this.onKeydown = function(e){  
			this.isKeydown = true;
			this.publish('keydown',e);
		};
		this.onKeyup = function(e){
			this.isKeydown = false;
			this.publish('keyup',e);
		};
		
		this.paint = function(graphic){
			if(!this.visiable) return;
			graphic.fillStyle = this.style.fillStyle;
			graphic.fillRect(-this.width / 2,-this.height / 2,this.width,this.height);
			if(this.isSelected){
				this.paintSelectedElement(graphic);
			}
		};
		this.paintSelectedElement = function(graphic){
			graphic.save();
			graphic.fillStyle = this.style.fillStyle;
			graphic.strokeStyle = this.style.strokeStyle;
			graphic.beginPath();
			graphic.rect(-this.width / 2-4,-this.height / 2-4,this.width+8,this.height+8);
			graphic.fill();
			graphic.stroke();
			graphic.closePath();
			graphic.restore();
		};
	}
	
	function Node(name){
		this.initialize = function(name){
			Node.prototype.initialize();
			this.x = 0;
			this.y = 0;
			this.width = 0;
			this.height = 0;
			this.name = name;
			this.nameLocation = null;
			this.image = null;
			this.translate = true;
			this.scaleX = 1;
			this.scaleY = 1;
			this.rotate = 0;
			this.visiable = true;
			this.dragable = true;
			this.alpha = 1;
			this.style = {
				fillStyle : "rgb(22,119,238)",
				strokeStyle: "22,119,238",
				fontColor : 'rgb(255,255,255)',
				fontSize : 'bold 10px',
				fontFamily : 'Consolas'
			};
		};
		this.initialize(name);
		
		this.setName = function(name){
			typeof name === 'string'? this.name = name : this.name = '';
		};
		this.setNamelocation = function(l){
			var ls = ['Top_Center','Top_Right','Top_Left','Bottom_Center','Bottom_Right','Bottom_Left',
			'Middle_Center','Middle_Right','Middle_Left'];
			if(ls.indexOf(l) !== -1){
				this.nameLocation = l;
				return;
			}
			this.nameLocation = '';
			return;
		}
		this.setImage = function(o){
			if(typeof o ==='string'){
				var img = new Image();
				img.src = o;
				this.image = img; 
				return;
			}else if(o instanceof Image){
				this.image = o;
				return;
			}
		};
		this.paintImage = function(graphic){
			graphic.save();
			graphic.fillStyle = this.style.fillStyle;
			if(this.image){
				graphic.drawImage(this.image,-this.width / 2,-this.height / 2,this.width,this.height);
			}else{
				graphic.fillRect(-this.width / 2,-this.height / 2,this.width,this.height);
			}
			graphic.restore();
		};
		this.paintName = function(graphic){
			if(!this.name) return;
			graphic.fillStyle = this.style.fontColor;
			graphic.font = this.style.fontSize + ' ' + this.style.fontFamily;
			var tx,ty,twidth,tlocation;
			twidth = graphic.measureText(this.name).width;
			tlocation = this.getTextPostion(this.nameLocation,twidth); 
			graphic.fillText(this.name,tlocation.x,tlocation.y);
		};
		this.paint = function(graphic){
			if(!this.visiable) return;
			this.paintImage(graphic);
			this.paintName(graphic);
			if(this.isSelected){
				this.paintSelectedElement(graphic);
			}
		};
		this.getTextPostion = function(nameLocation, twidth) { 
            var n = {
                Top_Center: function() {
                    return {
                        x: -this.width / 2 + (this.width - twidth) / 2,
                        y: -this.height / 2
                    }
                },
                Top_Right: function() {
                    return {
                        x: this.width / 2,
                        y: -this.height / 2
                    }
                },
                Top_Left: function() {
                    return {
                        x: -this.width / 2 - twidth,
                        y: -this.height / 2
                    }
                },
                Bottom_Center: function() {
                    return {
                        x: -this.width / 2 + (this.width - twidth) / 2,
                        y: this.height / 2 + 12
                    }
                },
                Bottom_Right: function() {
                    return {
                        x: this.width / 2,
                        y: this.height / 2 + 12
                    }
                },
                Bottom_Left: function() {
                    return {
                        x: -this.width / 2 - twidth,
                        y: this.height / 2 + 12
                    }
                },
                Middle_Center: function() {
                    return {
                        x: -this.width / 2 + (this.width - twidth) / 2,
                        y: 0
                    }
                },
                Middle_Right: function() {
                    return {
                        x: this.width / 2,
                        y: 0
                    }
                },
                Middle_Left: function() {
                    return {
                        x: -this.width / 2 - twidth,
                        y: 0
                    }
                }
            },
			method,location;
			
			if(!nameLocation){
				method = n[Bottom_Center];
			}else{
				method = n[nameLocation];
			}
            location = method.call(this);
            return location;
        }
	}
	
	Topo.AbstractElement = AbstractElement;
	Node.prototype = new AbstractElement();
	Topo.Node = Node;
})(Topo);

(function(Topo,undefined){
	function Link(startNode,endNode,name){
		this.initialize = function(startNode,endNode,name){
			Link.prototype.initialize();
			this.name = name;
			this.startNode = startNode;
			this.endNode = endNode;
			this.alpha = 1;
			this.style = {
			    strokeStyle: "116, 166, 250",
                lineWidth: 2,
                fontSize: "10px",
                fontColor: "255,255,255",
                lineJoin: "miter"
			};
		}
		this.initialize(startNode,endNode,name);
		this.paint = function(graphic){
			var sx,sy,ex,ey;
			sx = this.startNode.width / 2 + this.startNode.x;
			sy = this.startNode.height / 2 + this.startNode.y;
			ex = this.endNode.width / 2 + this.endNode.x;
			ey = this.endNode.height / 2 + this.endNode.y;
			graphic.beginPath();
			if(this.isSelected){ 
				this.paintSelectedElement(graphic);
			}
			graphic.lineWidth = this.style.lineWidth;
			graphic.lineJoin = this.style.lineJoin;
			graphic.strokeStyle = "rgba("+this.style.strokeStyle+","+this.alpha+")";
			graphic.lineJoin = this.style.lineJoin;
			if(this.startNode === this.endNode){
				graphic.arc(this.startNode.x,this.endNode.y,this.startNode.width / 2,0,3*Math.PI / 2,true);
			}else{
				graphic.moveTo(sx,sy);
				graphic.lineTo(ex,ey);
			}
			graphic.stroke();
			graphic.closePath();
			
			graphic.lineWidth = this.style.lineWidth;
			graphic.shadowOffsetX = 0;
			graphic.shadowOffsetY = 0;
			graphic.shadowBlur = 0;
			this.paintName(graphic);

		};
		this.paintName = function(graphic){
			var x,y,centerA,centerZ;
			centerA = {
				x : this.startNode.width / 2 + this.startNode.x,
				y : this.startNode.height / 2 + this.startNode.y
			},centerZ = {
				x : this.endNode.width / 2 + this.endNode.x,
				y : this.endNode.height / 2 + this.endNode.y
			};
			x = (centerA.x + centerZ.x) / 2;
			y = (centerA.y + centerZ.y) / 2;
			if(!this.name) return;
			graphic.font = this.style.fontSize + " rgba("+this.style.fontColor+","+this.alpha+")";
			graphic.strokeText(this.name,x,y);
		};
		this.paintSelectedElement = function(graphic){
			graphic.shadowOffsetX = 3;
			graphic.shadowOffsetY = 2;
			graphic.shadowBlur = 4;
			graphic.shadowColor = 'rgba('+this.style.strokeStyle+',0.9)';
			graphic.lineWidth = graphic.lineWidth = this.style.lineWidth * 2;
		};
	}
	
	Link.prototype = new Topo.AbstractElement();
	Topo.Link = Link;
})(Topo);
