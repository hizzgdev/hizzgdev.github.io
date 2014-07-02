var path_prefix = "https://api.github.com/repos/hizzgdev/hizzgdev.github.io/contents/"
var path_suffix = "?callback=show_post"
var path_posts = "blog/posts"

// path_prefix = "https://api.github.com/repos/sneezry/sneezry.github.com/contents/"
// path_posts = "md"

if (typeof(config) == 'undefined') { config = {lang:'zh'}; }
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
    var all_zh = resp.data.reverse();
    var all_len_zh = all_zh.length;
    var all_en = [];
    var all_len_en = 0;

    var i = all_len_zh;
    var post = null;
    while(i--){
        post = all_zh[i];
        if(/.en.md$/.test(post.name)){
            all_zh.splice(i,1);
            all_len_zh--;
            all_en.unshift(post)
            all_len_en++;
        }
    }
    __all = config.lang == 'zh' ? all_zh : all_en;
    __all_len = config.lang == 'zh' ? all_len_zh : all_len_en;

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
        show_post_meta(post);
        query_post(post.path);
    }
    _first_load = false;
}

function show_post_meta(post){
    //console.log(post);
    var el = $template.cloneNode(true);
    el.id = 'blog_'+post.sha;
    $container.appendChild(el);
    var post_date = post.name.substr(0,10);
    var post_name = post.name.substr(11).replace(/-/g,' ').replace(/\.en\.md/,'').replace(/\.md/,'');
    $('h3 a',el).text(post_name).attr('href','#!'+post.path);
    $('span.date',el).text(post_date);
    $('a.ds-thread-count',el).attr('data-thread-key',post.sha).click(function(e){toggle_comments(e);return false;});
}

function show_post(resp){
    path = resp.data.path;
    if(!(path in __posts)){
        __posts[path] = resp;
    }
    post = resp.data;
    var el_id = '#blog_'+post.sha;
    $(el_id+' .article-body').html(markdown.toHTML(Base64.decode(post.content)));
}

function query_post(path){
    if(path in __posts){
        show_post(__posts[path]);
    }else{
        var el = document.createElement('script');
        el.src = path_prefix+path+path_suffix;
        $html.appendChild(el);
        setTimeout(function(){$html.removeChild(el);},10000);
    }
}

function toggle_comments(e){
    var el = $(e.target);
    var k = el.attr('data-thread-key');
    if(el.attr('comment-shown') == 'true'){
        $('#blog_'+k+' .comments').remove();
        el.attr('comment-shown', 'false')
    }else{
        var c = document.createElement('div');
        c.className = 'panel-footer comments';
        c.setAttribute('data-thread-key', k);
        DUOSHUO.EmbedThread(c);
        $(c).appendTo('#blog_'+k+'');
        el.attr('comment-shown', 'true')
    }
}

(function query_post(path){
    var el = document.createElement('script');
    el.src = path_prefix+path+"?callback=cache_list";
    $html.appendChild(el);
    setTimeout(function(){$html.removeChild(el);},10000);
})(path_posts);

(function page_load(){
    $('.pager .next').click(function(){next_page();});
    $('.pager .prev').click(function(){prev_page();});
})();
