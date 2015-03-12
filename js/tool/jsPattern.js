// JS设计模式
// @version beta 0.1
// @date 2014/8/22
// @author goodNess
// @blog http://www.cnblogs.com/goodness2010/
// @email goodNess2010@126.com

/*-----------------------------------类继承模式，拥有构造函数----------------------------------------*/
/*
 * @param parent 为继承的父类
 * @param props 给子类的初始化方法以及原型方法。
 * @return 返回子类的构造函数
 */
function klass(parent,props){
		var child,prop;
		parent=parent || Object;
		//构造函数
		child=function(){
			if(child.uber && typeof child.uber._constructor==="function"){
				child.uber._constructor.apply(this,arguments);
			}
			if(child.prototype && typeof child.prototype._constructor==="function"){
				child.prototype._constructor.apply(this,arguments);
			}
		}
	    //继承
		function F(){};
		F.prototype=parent.prototype;
		child.prototype=new F();
		child.uber=parent.prototype;
		child.prototype.constructor=child;
		//props
		for(prop in props){
			if(props.hasOwnProperty(prop)){
				child.prototype[prop]=props[prop];
			}
		}
		return child;
	}

/*---------------------------------------------单例模式------------------------------------------------*/
/*
 * 使用闭包实现的单例模式， 自定义函数。
 */
function Universe(){
	var instance=this,_proto;
	this.start_time=0;
	this.bang="big";
	_proto=Universe.prototype;
	
	Universe=function(){
		return instance;
	}
	Universe.prototype=_proto;
	instance.constructor=Universe;
	return instance;
}
/*------------------------------------------------静态属性与静态方法---------------------------------------*/
var  Ga=(function(){
	var count=0,nGa;  //此处使用闭包来获取count，但对于所有的实例而言，其共享的变量对象是同一个count，故所有实例的count都相等。
	nGa=function(){
		count++;
		this.count=count;
	}
	nGa.intro=function(){
		console.log("私有方法");
	}
	nGa.prototype.getC=function(){
		console.log(this.count);
	}
	return nGa;
})();
/*--------------------------------------------------常量模式------------------------------------------------------------*/
var constant=(function(){
	var prefix,constants={},type={number:1,string:1},
	ownProp=Object.prototype.hasOwnProperty;
	prefix=(Math.random()+"_").slice(2);
	return {
		isOwn:function(name){
			return ownProp.call(constants,prefix+name);
		},
		get:	function(name){
			if(!this.isOwn(name) || (this.isOwn(name) && !typeof name in type)){
				return null;
			}
			return constants[prefix+name];
		},
		set: function(name,value){
			if(this.isOwn(name) || (this.isOwn(name) && !typeof name in type))
				return false;
			constants[prefix+name]=value;
			return true;
		}
	};
})();
/*------------------------------------------------method()--------------------------------------------------------*/
/*
 * 给构造函数添加额外原型方法
*/
Function.prototype.method=(function(){
	if(Function.prototype.method)
		return;
	Function.prototype.method=function(name,fn){
		Function.prototype[name]=fn;
		return this;
	}
})();
/*-------------------------------------------------装饰者模式（使用继承）----------------------------------------*/
function Sale(price){
	this.price= price || 100;
}
Sale.prototype.getPrice=function(){
	return this.price;
}
Sale.prototype.decorate=function(name){
	var deObj,decorator=Sale.decorators[name],
	i;
	//此处需要仔细理解
	function F(){}  
	F.prototype=this;
	deObj=new F();
	deObj.uber=F.prototype;
	
	for(i in decorator){
		if(decorator.hasOwnProperty(i)){
			deObj[i]=decorator[i];
		}
	}
	return deObj;
}
Sale.decorators={};
Sale.decorators.france={
	getPrice:function(){
		var price;
		price=this.uber.getPrice();
		price=price*1.2;
		return price;
	}
}
Sale.decorators.paris={
	getPrice:function(){
		var price;
		price=this.uber.getPrice();
		price=price*1.3;
		return price;
	}
}
Sale.decorators.info={
	getPrice:function(){
		console.log("I'm from Chine. The Price Is "+this.uber.getPrice());
	}
}
//测试
var sale=new Sale(200);
sale=sale.decorate("france");
sale=sale.decorate("paris");
sale=sale.decorate("info");
sale.getPrice();
/*-------------------------------------------------装饰者模式（不使用继承）----------------------------------------*/
function Sale(price){
	this.price= price || 100;
	this.dec_list=[];
}
Sale.decorators={};
Sale.decorators.france={
	getPrice:function(){
		var price;
		price=arguments[0];
		price=price*1.2;
		return price;
	}
}
Sale.decorators.paris={
	getPrice:function(){
		var price;
		price=arguments[0];
		price=price*1.3;
		return price;
	}
}
Sale.decorators.info={
	getPrice:function(){
		console.log("I'm from Chine. The Price Is "+arguments[0]);
	}
};
Sale.prototype.decorate=function(name){
	this.dec_list.push(name);
};
Sale.prototype.getPrice=function(){
	var i,len,
	nObj,result=this.price;
	for(i=0,len=this.dec_list.length;i<len;i++){
		nObj=Sale.decorators[this.dec_list[i]];
		result=nObj.getPrice(result);
	}
}
var sale=new Sale(200);
sale.decorate("france");
sale.decorate("paris");
sale.decorate("info");
sale.getPrice();
/*-------------------------------------------------观察者模式----------------------------------------*/
var publisher={
		subscribers:{  //保存订阅者的行为，即回调函数
			any:[]
		},
		subscribe:function(sub,type){
			if(type===undefined || type==='any' || type===null){
				this.subscribers.any.push(sub);
				return;
			}
			if(!this.subscribers[type]){
				this.subscribers[type]=[];
			}
			this.subscribers[type].push(sub);
			return;
		},
		unsubscribe:function(sub,type){
			this.integrate('del',type,sub);
		},
		publish:function(type,arg){  // 在实践中，arg是类Event对象
			this.integrate('publish',type,arg)
		},
		integrate:function(action,type,arg){
			var type=type || 'any',
		    subscribers=this.subscribers[type],
			i,len;
			if(action==='del'){
				for(i=0,len=subscribers.length;i<len;i++){
					if(subscribers[i]===arg){
						subscribers.splice(i,1);
						return;
					}
				}
			}else{
				for (i = 0, len=subscribers.length; i < len; i++) {
					if(subscribers[i]){
						subscribers[i](arg);
					}
				}
			}
		}
	};
	
	var makePublisher=function(obj,publisher){
		var i,len;
		for(i in publisher){
			if(publisher.hasOwnProperty(i) && typeof publisher[i]==='function' ){
				obj[i]=publisher[i];
			}
		};
		obj.subscribers={
			any:[]
		};
	};
	var paper,man;
	
	paper={
		daily:function(){
			this.publish('daily','daily paper!!!');
		},
		monthly:function(){
			this.publish('monthly','monthly paper!!!');
		},
		nothing:function(){
			this.publish('any','not special');
		}
	};
	makePublisher(paper,publisher);
	man={
		haveCoffee:function(msg){
			console.log('i love read '+msg+' when i have a coffee');
		},
		travel:function(msg){
			console.log('i do not read '+ msg +"when i travel");
		},
		goHome:function(msg){
			console.log(msg);
		}
	};
	
	paper.subscribe(man.haveCoffee,'daily');
	paper.subscribe(man.travel,'monthly');
	paper.subscribe(man.goHome);
	paper.daily();
	paper.monthly();
	paper.nothing();
	paper.unsubscribe(man.goHome)
	console.log(paper.subscribers)