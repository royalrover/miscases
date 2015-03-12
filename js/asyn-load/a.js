/**
 * Created by admin on 2014/12/5.
 */
function log(m){
    if(console)console.log(m);
    else alert(m)
}
this.log = log;
log('a')
log($)