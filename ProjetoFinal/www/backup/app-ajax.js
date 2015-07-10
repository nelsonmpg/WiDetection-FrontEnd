(function () {
    "use strict";

    var DEFAULT_ROUTE = 'one';

    var template = document.querySelector('#t');
    var ajax, pages, scaffold;
    var cache = {};

    template.pages = [
        {
            name: 'Status',
            hash: 'one',
            url: window.location.href.split("/#")[0] + '/html/status.html'
        }, {
            name: 'Dashboard',
            hash: 'two',
            url: window.location.href.split("/#")[0] + '/html/Dashboard.html'
        }, {
            name: 'Estatistica',
            hash: 'three',
            url: window.location.href.split("/#")[0] + '/html/Estatistica.html'
        }, {
            name: 'Acerca De ...',
            hash: 'four',
            url: window.location.href.split("/#")[0] + '/html/Acerca_De.html'
        }
    ];

    template.addEventListener('template-bound', function (e) {
        scaffold = document.querySelector('#scaffold');
        ajax = document.querySelector('#ajax');
        pages = document.querySelector('#pages');
        var keys = document.querySelector('#keys');

        // Allow selecting pages by num keypad. Dynamically add
        // [1, template.pages.length] to key mappings.
        var keysToAdd = Array.apply(null, template.pages).map(function (x, i) {
            return i + 1;
        }).reduce(function (x, y) {
            return x + ' ' + y;
        });
        keys.keys += ' ' + keysToAdd;

        this.route = this.route || DEFAULT_ROUTE; // Select initial route.
    });

    template.keyHandler = function (e, detail, sender) {
        // Select page by num key.
        var num = parseInt(detail.key);
        if (!isNaN(num) && num <= this.pages.length) {
            pages.selectIndex(num - 1);
            return;
        }

        switch (detail.key) {
            case 'left':
            case 'up':
                pages.selectPrevious();
                break;
            case 'right':
            case 'down':
                pages.selectNext();
                break;
            case 'space':
                detail.shift ? pages.selectPrevious() : pages.selectNext();
                break;
        }
    };

    template.menuItemSelected = function (e, detail, sender) {
        if (detail.isSelected) {
            // Need to wait one rAF so <core-ajax> has it's URL set.
            this.async(function () {
//                if (!cache[ajax.url]) {
                ajax.go();
//                }

                scaffold.closeDrawer();
            }, true);

        }
    };

    template.ajaxLoad = function (e, detail, sender) {
        e.preventDefault(); // prevent link navigation.
    };

    template.onResponse = function (e, detail, sender) {
        var article = detail.response.querySelector('conteiner');

//        article.querySelector('.byline').remove();

        // Fix up image paths to not be local.
//        [].forEach.call(article.querySelectorAll('img'), function (img) {
//            img.setAttribute('src', img.src);
//        });

        var html = article.innerHTML;

        cache[ajax.url] = html; // Primitive caching by URL.

        this.injectBoundHTML(html, pages.selectedItem.firstElementChild);
    };

})();
