(function(){
var __cache_minute = 20;
var __query_path = location.pathname;
var _query_path = 'blog'
var _query_item = false;
var _page = 0;

if(/\/blog\/.*\.html$/.test(__query_path)){
    _query_path = __query_path.substr(1).replace(/\.html$/,'.md');
    _query_item = true;
}else{
    _page = parseInt(__query_path.substr(6)) || 1;
}

//_query_item = true;
//_query_path = 'blog/2014-07-01_Hello-World.html'.replace(/\.html$/,'.md');

var path_prefix = "https://api.github.com/repos/hizzgdev/hizzgdev.github.io/contents/"
var path_suffix = "?callback=__post"

// path_prefix = "https://api.github.com/repos/sneezry/sneezry.github.com/contents/"
// _query_path = "md"

var page_size = 3;

var $html = document.getElementsByTagName('html')[0];
var $container = document.getElementById('blog_list');
var $template = document.getElementById('blog_item_template');

var __all = null;
var __all_len = 0;
var __page_total = 1;

var _first_load = true;

function list_post(resp, fresh){
    if(fresh && !!localStorage){
        localStorage['blog/list.time'] = (new Date()).toISOString();
        localStorage['blog/list'] = JSON.stringify(resp);
    }
    __all = resp.data.reverse();
    __all_len = __all.length;
    __page_total = Math.ceil(__all_len/page_size);
    show_list(_page);
}

function show_list(page){
    if(!_first_load){
        $container.innerHTML = '';
    }
    var offset = (page-1)*page_size;
    var min = Math.min(offset,__all_len);
    var max = Math.min(offset+page_size,__all_len)
    var post = null;
    if(_first_load){
        $('#loading').remove();
    }
    for(var i=min;i<max;i++){
        post = __all[i];
        show_post_meta(post, true);
        query_item_cache(post.path);
    }
    _first_load = false;
    var prev = _page + 1;
    var next = _page - 1;
    if(prev <= __page_total){
        $('.pager .previous').attr('href','/blog/'+prev);
    }else{
        $('.pager .previous').removeAttr('href');
    }
    if(next > 0){
        $('.pager .next').attr('href','/blog/'+next).show();
    }else{
        $('.pager .next').hide();
    }
    disqus_reset();
}

function show_post_meta(post, inlist){
    var el = $template.cloneNode(true);
    el.id = 'blog_'+post.sha;
    $container.appendChild(el);
    var post_date = post.name.substr(0,10);
    var post_name = post.name.substr(11).replace(/-/g,' ').replace(/\.md$/,'');
    if(inlist){
        var post_url = '/'+post.path.replace(/\.md$/,'.html');
        $('.article-heading h3 a',el).text(post_name).attr('href', post_url);
        $('.panel-footer a.comment',el).attr('href', post_url+'#disqus_thread');
    }else{
        $('#loading').remove();
        $('.pager').remove();
        $('.article-heading h3',el).text(post_name);
        $('.panel-footer a.comment',el).remove();
        var disqus_thread_el = document.createElement('div');
        disqus_thread_el.id = 'disqus_thread';
        disqus_thread_el.className = 'panel-footer';
        el.appendChild(disqus_thread_el);
    }
    $('span.date',el).text(post_date);
}

function show_post(resp, fresh){
    if(resp.meta.status == 404){
        location.href='err.404.html#'+location.pathname;
    }
    var path = resp.data.path;
    if(fresh && !!localStorage){
        localStorage[path] = JSON.stringify(resp);
        localStorage[path+'.time'] = (new Date()).toISOString();
    }
    var post = resp.data;
    if(_query_item){
        show_post_meta(post, false);
    }
    var el_id = '#blog_'+post.sha;
    $(el_id+' .article-body').html(markdown.toHTML(Base64.decode(post.content)));
    disqus_reset();
}

function script_inject(path){
    var el = document.createElement('script');
    el.src = path;
    $html.appendChild(el);
}

function query_item(path){
    script_inject(path_prefix+path+path_suffix);
}

function query_item_cache(path){
    if(!localStorage){
        query_item(path);
    }else{
        var post_time_str = localStorage[path+'.time'];
        if(!!post_time_str){
            var post_time = new Date(post_time_str);
            var now_time = new Date();
            if(now_time - post_time > 1000*60*__cache_minute){
                query_item(path);
            }else{
                show_post(JSON.parse(localStorage[path]), false);                
            }
        }else{
            query_item(path);
        }
    }
}

function query_list(path){
    script_inject(path_prefix+path+"?callback=__list");
}

function query_list_cache(path){
    if(!localStorage){
        query_list(path);
    }else{
        var list_time_str = localStorage['blog/list.time'];
        if(!!list_time_str){
            var list_time = new Date(list_time_str);
            var now_time = new Date();
            if(now_time - list_time > 1000*60*__cache_minute){
                query_list(path);
            }else{
                list_post(JSON.parse(localStorage['blog/list']), false);
            }
        }else{
            query_list(path);
        }
    }
}

function disqus_reset(){
    if(typeof DISQUS != 'undefined'){
        DISQUS.reset({reload:true});
    }
    if(typeof DISQUSWIDGETS != 'undefined'){
        DISQUSWIDGETS.getCount();
    }
}

function page_load(){
    if(_query_item){
        script_inject('//hizzgdev.disqus.com/embed.js');
        query_item_cache(_query_path);
    }else{
        script_inject('//hizzgdev.disqus.com/count.js');
        query_list_cache(_query_path);
    }
}

window.__list = function(o){ list_post(o, true); };
window.__post = function(o){ show_post(o, true); };
window.disqus_shortname = 'hizzgdev';

page_load();

})();

