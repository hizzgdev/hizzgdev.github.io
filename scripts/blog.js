(function(){
var __query_path = location.pathname;
var _query_path = 'blog'
var _query_item = false;
if(/\/blog\/.*\.html$/.test(__query_path)){
    _query_path = __query_path.substr(1).replace(/\.html$/,'.md');
    _query_item = true;
}

//_query_item = true;
//_query_path = 'blog/2014-07-01_Hello-World.html'.replace(/\.html$/,'.md');

var path_prefix = "https://api.github.com/repos/hizzgdev/hizzgdev.github.io/contents/"
var path_suffix = "?callback=__post"

// path_prefix = "https://api.github.com/repos/sneezry/sneezry.github.com/contents/"
// _query_path = "md"

var page_size = 3;

var $html = document.getElementsByTagName('html')[0];
var $loading = document.getElementById('loading');
var $container = document.getElementById('blog_list');
var $template = document.getElementById('blog_item_template');

var __all = null;
var __all_len = 0;
var __posts = {};
var __page = 0;
var __page_total = 1;

var _first_load = true;

function cache_list(resp){
    console.log(resp);
    __all = resp.data.reverse();
    __all_len = __all.length;
    __page_total = Math.ceil(__all_len/page_size);
    show_list(1);
}

function prev_page(){
    var prev = __page + 1;
    if(prev <= __page_total){
        show_list(prev);
    }
}

function next_page(){
    var prev = __page - 1;
    if(prev > 0){
        show_list(prev);
    }
}

function show_list(page){
    if(__page == page){
        return;
    }else{
        __page = page;
    }

    if(!_first_load){
        $container.innerHTML = '';
    }
    var offset = (page-1)*page_size;
    var min = Math.min(offset,__all_len);
    var max = Math.min(offset+page_size,__all_len)
    var post = null;
    if(_first_load){
        $loading.parentNode.removeChild($loading);
    }
    for(var i=min;i<max;i++){
        post = __all[i];
        show_post_meta(post, true);
        query_item(post.path);
    }
    _first_load = false;
}

function show_post_meta(post, inlist){
    console.log(post);
    var el = $template.cloneNode(true);
    el.id = 'blog_'+post.sha;
    $container.appendChild(el);
    var post_date = post.name.substr(0,10);
    var post_name = post.name.substr(11).replace(/-/g,' ').replace(/\.md$/,'');
    if(inlist){
        $('.article-heading h3 a',el).text(post_name).attr('href','/'+post.path.replace(/\.md$/,'.html'));
    }else{
        $loading.parentNode.removeChild($loading);
        $('.pager').remove();
        $('.article-heading h3',el).text(post_name);
    }
    $('span.date',el).text(post_date);
}

function show_post(resp){
    path = resp.data.path;
    if(!(path in __posts)){
        __posts[path] = resp;
    }
    if(resp.meta.status == 404){
        location.href='err.404.html#'+location.pathname;
    }
    post = resp.data;
    if(_query_item){
        show_post_meta(post, false);
    }
    var el_id = '#blog_'+post.sha;
    $(el_id+' .article-body').html(markdown.toHTML(Base64.decode(post.content)));
}

function query_item(path){
    if(path in __posts){
        show_post(__posts[path]);
    }else{
        var el = document.createElement('script');
        el.src = path_prefix+path+path_suffix;
        $html.appendChild(el);
        setTimeout(function(){$html.removeChild(el);},10000);
    }
}

function query_list(path){
    var el = document.createElement('script');
    el.src = path_prefix+path+"?callback=__list";
    $html.appendChild(el);
    setTimeout(function(){$html.removeChild(el);},10000);
}

function page_load(){
    $('.pager .next').click(function(){next_page();});
    $('.pager .prev').click(function(){prev_page();});
    if(_query_item){
        query_item(_query_path);
    }else{
        query_list(_query_path);
    }
}

window.__list = function(o){ cache_list(o); };
window.__post = function(o){ show_post(o); };

page_load();

})();

