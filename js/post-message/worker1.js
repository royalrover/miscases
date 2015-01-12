/**
 * Created by admin on 2015/1/7.
 */
importScripts("t1.js");
console.log("worker1.js");
onmessage = function(e){
    console.log(e.data)
}