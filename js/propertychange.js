/**
 * Created by admin on 2014/10/27.
 * ie: propertychange
 * w3c: DOMAttrModified
 */
(function(){

    //判断是否支持MutationObserver对象
    var mutationObserver = window.MutationObserver || window.WebkitMutationObserver ||
        window.MozMutationObserver,
    mutationObserverSupported = !!mutationObserver;
    // 判断是否支持 DOMAttrModified属性
    var domAttrModifiedSupported = (function(){
        var fn,el,flag = false,name ;
        el = document.documentElement;
        name = el.name;
        fn = function(){
            el.removeEventListener('DOMAttrModified',fn,false);
            el.name = name;
        }
        if(el.addEventListener){
            el.addEventListener('DOMAttrModified',fn,false);
        }
        el.name = '_test_';
        flag = el.name != '_test_';
        return flag;
    })();
    var el = document.querySelector('#text');
    if(mutationObserverSupported){
        var fn = function(mutationRecords){
            mutationRecords.map(function(mr,index){
               console.dir(mr)
            });
        };
        var observer = new mutationObserver(fn);
        observer.observe(el,{
            'attributes': true,
            'attributeOldValue': true,
            'attributeFilter' : ['value']
        });
    }else if(domAttrModifiedSupported){
        var fn = function(e){
            if(e.attrName && e.attrName === 'value'){
                console.log(e.target[e.attrName]);
            }
        };
        el.addEventListener('DOMAttrModified',fn,false);
    }else if(el.attachEvent){
        var fn = function(e){
            if(e.propertyName && e.propertyName === 'value'){
                console.log(e.sourceElement[e.propertyName]);
            }
        };
        el.attachEvent('onpropertychange',fn);
    }else if(el.addEventListener){
        var fn = function(e){
            if(e.attrName && e.attrName === 'value'){
                console.log(e.target[e.attrName]);
            }
            console.log(e.target['value'])
        };
        el.addEventListener('input',fn,false);
    }

    el.value = 'abc';
})()

