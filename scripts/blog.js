(function(){
"use strict"
var __cache_minute = 20;
var __query_path = location.pathname;
var __md_path = null;
var __is_list = false;
var __is_blog = false;
var __is_other  = false;

if(/\/blog\/.*\.html$/.test(__query_path)){
    __is_blog = true;
    __md_path = __query_path.substr(1).replace(/\.html$/,'.md');
}else if(/\/blog\.html$/.test(__query_path)){
    __is_list = true;
}else{
    __is_other = true;
}

var path_prefix = "https://api.github.com/repos/hizzgdev/hizzgdev.github.io/contents/"
var path_suffix = "?callback="

// path_prefix = "https://api.github.com/repos/sneezry/sneezry.github.com/contents/"
// _query_path = "md"

var $ = function(id){return document.getElementById(id);};
var $q = function(s,c){return document.querySelector(s,c);}
var $c = function(t){return document.createElement(t);}

var $html = document.getElementsByTagName('html')[0];

function script_inject(path,async){
    var el = document.createElement('script');
    el.src = path;
    if(!!async){el.async=true;}
    $html.appendChild(el);
}

function github_jsonp(path,callback){
    var url = path_prefix+path+path_suffix+callback;
    script_inject(url);
}

// 404 begin
function show_404(){
    $q('title').innerHTML='Sorry, I lost myself - Zhigang Zhang';
    $q('.container nav a.active').className='';
    $q('header h1').innerHTML='Zhigang Zhang';
    $q('header p').innerHTML='you got me there';
    $q('article header h2').innerHTML=__query_path+' was not found';
    $q('article section').innerHTML='<p>Sorry, the page you request can not be found.</p><p>you may go <a href="/">Home</a>. Thank you.</p>';
    $q('article footer').className='hidden';
}
// 404 end

// blog list begin
function show_list(list){
    var len = list.length;
    var post_date_m_l = null;
    var $list = $('blog_list');
    var ul = null;
    while(len--){
        var post = list[len];
        var post_date = post.name.substr(0,10);
        var post_date_m = post_date.substr(0,7);
        if(post_date_m != post_date_m_l){
            post_date_m_l = post_date_m;
            var li = $c('li');
            ul = $c('ul');
            $list.appendChild(li);
            li.innerHTML = post_date_m.replace('-','.');
            li.appendChild(ul);
        }
        var post_name = post.name.substr(11).replace(/-/g,' ').replace(/\.md$/,'');
        var post_url = '/'+post.path.replace(/\.md$/,'.html');
        var li = $c('li');
        li.innerHTML = '<span>'+post_date+'</span><span>»</span><a href="'+post_url+'">'+post_name+'</a>';
        ul.appendChild(li);
    }
}

function list_blog(resp, fresh){
    $('loading').className = 'hidden';
    if(fresh && !!localStorage){
        localStorage['blog/list.time'] = (new Date()).toISOString();
        localStorage['blog/list'] = JSON.stringify(resp);
    }
    show_list(resp.data);
}

function query_list(){
    github_jsonp('blog','__list');
}

function query_list_cache(){
    if(!localStorage){
        query_list();
    }else{
        var list_time_str = localStorage['blog/list.time'];
        if(!!list_time_str){
            var list_time = new Date(list_time_str);
            var now_time = new Date();
            if(now_time - list_time > 1000*60*__cache_minute){
                query_list();
            }else{
                list_blog(JSON.parse(localStorage['blog/list']), false);
            }
        }else{
            query_list();
        }
    }
}
// blog list end

// blog detail begin
function disqus_load_embed(){
    window.disqus_shortname = 'hizzgdev';
    var disqus_thread_el = $c('div');
    disqus_thread_el.id = 'disqus_thread';
    disqus_thread_el.className = 'panel-footer';
    $q('article').appendChild(disqus_thread_el);
    script_inject('//hizzgdev.disqus.com/embed.js',true);
}

function show_detail(post){
    var post_date = post.name.substr(0,10);
    var post_name = post.name.substr(11).replace(/-/g,' ').replace(/\.md$/,'');
    window.disqus_title = post_name;
    $q('title').innerHTML=post_name+' - Zhigang Zhang\'s blog';
    $q('article header h2').innerHTML=post_name;
    $q('article section').innerHTML=markdown.toHTML(Base64.decode(post.content));
    $q('article time').innerHTML=post_date;
    $q('article footer a').href='/'+post.path;
    disqus_load_embed();
}

function show_blog(resp, fresh){
    if(resp.meta.status == 404){
        show_404();
        return;
    }
    var path = resp.data.path;
    if(fresh && !!localStorage){
        localStorage[path] = JSON.stringify(resp);
        localStorage[path+'.time'] = (new Date()).toISOString();
    }
    show_detail(resp.data);
}

function query_item(){
    github_jsonp(__md_path,'__blog');
}

function query_item_cache(){
    if(!localStorage){
        query_item();
    }else{
        var path=__md_path;
        var post_time_str = localStorage[path+'.time'];
        if(!!post_time_str){
            var post_time = new Date(post_time_str);
            var now_time = new Date();
            if(now_time - post_time > 1000*60*__cache_minute){
                query_item();
            }else{
                show_blog(JSON.parse(localStorage[path]), false);                
            }
        }else{
            query_item();
        }
    }
}

function page_load(){
    if(__is_list){
        query_list_cache();
    }
    if(__is_blog){
        query_item_cache();
    }
    if(__is_other){
        show_404();
    }
}

window.__list = function(o){ list_blog(o, true); };
window.__blog = function(o){ show_blog(o, true); };

page_load();

})();

