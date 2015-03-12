/**
 * Created by admin on 2014/10/19.
 */
function getBasePath(){
    try{
        a.b();
    }catch (e){
        if(e.fileName){  //firefox
            return e.fileName;
        }else if(e.sourceURL){  //safari
            return e.sourceURL;
        }
    }
    var ss = document.getElementsByTagName('script'),
        s;
    if(window.VBArray){  //ie
        var i,len = ss.length,item;
        for(i=len;item = ss[--i];){
            if(item.readyState === 'interactive'){
                break;
            }
        }
        s = item;
    }else{
        s = ss[ss.length - 1];
    }
    return s.src;
}
console.log(getBasePath());