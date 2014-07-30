/**
 * Created by Alexander Lex on 7/30/14.
 *
 * Google analytics code, disabled on master branch.
 * If you want to use UpSet on your own server and want to use google analytics make sure to replace the tracking ID.
 */

(function (i, s, o, g, r, a, m) {
    i['GoogleAnalyticsObject'] = r;
    i[r] = i[r] || function () {
        (i[r].q = i[r].q || []).push(arguments)
    }, i[r].l = 1 * new Date();
    a = s.createElement(o),
        m = s.getElementsByTagName(o)[0];
    a.async = 1;
    a.src = g;
    m.parentNode.insertBefore(a, m)
})(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

ga('create', 'UA-52852221-1', 'auto');
ga('send', 'pageview');
