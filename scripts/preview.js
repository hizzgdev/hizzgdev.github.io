(function($w){
    var $d= $w.document;
    var $ = function(express){return $d.querySelector(express);};
    var $A = function(express){return $d.querySelectorAll(express);};
    var $xhr = new XMLHttpRequest();

    function pageload(){
        $('#load_preview').addEventListener('click',function(){
            var mdpath = '_posts/'+$('#md_file_path').value;
            loadmd(mdpath);
        });
        
        $xhr.addEventListener('readystatechange',function(e){
            if($xhr.readyState==4 && $xhr.status==200){
                showmd($xhr.responseText);
            }else{
                showmd('error: status['+$xhr.status+']+\r\n'+$xhr.responseText);
            }
        });
    }

    function loadmd(mdpath){
        $xhr.open('GET',mdpath,true);
        $xhr.send();
    }

    function showmd(md){
        var html = markdown.toHTML(md);
        $('#preview_article section').innerHTML = html;
    }

    pageload();
})(window);
