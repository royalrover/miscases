/**
 * Created by admin on 2014/12/5.
 */
var obj = {
    name: 'tanGe',
    says: 'I Love Yang Li',
    action: function(){
        log(this.name + 'says: '+ this.says);
    }
}
obj.action();