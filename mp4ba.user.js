// ==UserScript==
// @name          为mp4ba添加豆瓣链接
// @namespace     http://www.yangzhongchao.com
// @description   为mp4ba添加豆瓣链接
// @run-at        document-end
// @grant         GM_xmlhttpRequest
// @grant         GM_addStyle
// @include       http://www.mp4ba.com/show.php?*
// @include       http://www.2tu.cc/Html/*
// @include       http://www.cnscg.org/*
// @exclude       http://diveintogreasemonkey.org/*
// @exclude       http://www.diveintogreasemonkey.org/*
// ==/UserScript==
var href = window.location.host;
console.log(href);

var xhr = function (url, cb) {
    GM_xmlhttpRequest({
      method: 'GET',
      url: url,
      headers: {
            'User-agent': 'Mozilla/4.0 (compatible) Greasemonkey',
            'Accept': 'application/atom+xml,application/xml,text/xml',
      },
      onload: function (result) {
          var json = eval('('+result.responseText+')');
          var url = json.subjects[0].alt;
          var average = json.subjects[0].rating.average;
          cb(url,average);
      },
      onerror: function (e) {
        console.log(e);
      }
    });  
};

function addStyle(css) {
    var head, style;
    head = document.getElementsByTagName('head')[0];
    if (!head) { return; }
    style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = css;
    head.appendChild(style);
}
         

var mpba = "www.mp4ba.com";
var tucc = "www.2tu.cc";
var cnscg = "www.cnscg.org";

var dbapi = "http://api.douban.com/v2/movie/search?q=";

if (href==mpba) {
    console.log("mp4ba");
    var title = document.title;
    console.log(title);
    var arr = new Array();
    arr = title.split(".");
    console.log(arr[0]);
    var name = arr[0];
    var fullurl = dbapi + name;
    console.log(fullurl);
    xhr(fullurl, function (url, average) {
        console.log(url);
        console.log(average);
        var target, newElement;
        target = document.getElementById('magnet').parentNode;
        newElement = document.createElement('p');
        newElement.className = 'douban';
        newElement.innerHTML = '<img src="http://img3.douban.com/favicon.ico"/><a target="_blank" href="'+url+'">豆瓣详情 '+average+'分</a>';
        target.parentNode.insertBefore(newElement,target.nextSibling);
    });

     addStyle('.douban a{margin-left: 6px;font-size:13px;text-decoration:underline;}.douban img{line-height:16px;margin-bottom: -4px;width:16px;}');
};



if (href==tucc) {
    var title = document.title;
    console.log(title);
    var arr = new Array();
    arr = title.split("在线观看");
    console.log(arr[0]);
    var name = arr[0];
    var fullurl = dbapi + name;
    console.log(fullurl);
    xhr(fullurl, function (url, average) {
    console.log(url);
    console.log(average);
    var filmStar, newElement;
    filmStar = document.getElementById('filmStar').parentNode.parentNode.previousSibling.previousSibling.firstChild;
    newElement = document.createElement('li');
    newElement.innerHTML = '<span>豆瓣：</span><a target="_blank" href="'+url+'">豆瓣详情 '+average+'分</a>';
    filmStar.parentNode.insertBefore(newElement, filmStar);
    });
};

if (href==cnscg) {
    console.log("圣城家园");
    var title = document.title;
    console.log(title);
    var arr = new Array();
    arr = title.split("]");
    name = arr[0].replace("[","");
    console.log(name);
    var fullurl = dbapi + name;
    console.log(fullurl);
        console.log(fullurl);
    xhr(fullurl, function (url, average) {
        console.log(url);
        console.log(average);
        var target, newElement;
        target = document.getElementById('magnet').parentNode;
        newElement = document.createElement('p');
        newElement.className = 'douban';
        newElement.innerHTML = '<img src="http://img3.douban.com/favicon.ico"/><a target="_blank" href="'+url+'">豆瓣详情 '+average+'分</a>';
        target.parentNode.insertBefore(newElement,target.nextSibling);
    });

     addStyle('.douban a{margin-left: 6px;font-size:13px;text-decoration:underline;}.douban img{line-height:16px;margin-bottom: -4px;}');


};