(function(){
    var path = location.pathname;
    if(! /^\/path/.test(path)){
        console.log('redirect');
    }else{
        console.log('ok');
    }
})();
