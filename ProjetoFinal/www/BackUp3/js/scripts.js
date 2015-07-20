
$(document).ready(function () {
    var socket = null;
    //themes, change CSS with JS
    //default theme(CSS) is cerulean, change it if needed
    var defaultTheme = 'cerulean';

    var currentTheme = $.cookie('currentTheme') == null ? defaultTheme : $.cookie('currentTheme');
    var msie = navigator.userAgent.match(/msie/i);
    $.browser = {};
    $.browser.msie = {};
    switchTheme(currentTheme);

    //disbaling some functions for Internet Explorer
    if (msie) {
//        $('#is-ajax').prop('checked', false);
//        $('#for-is-ajax').hide();
//        $('#toggle-fullscreen').hide();
        $('.login-box').find('.input-large').removeClass('span10');

    }

    var $sidebarNav = $('.sidebar-nav');

    // Hide responsive navbar on clicking outside
    $(document).mouseup(function (e) {
        if (!$sidebarNav.is(e.target) // if the target of the click isn't the container...
                && $sidebarNav.has(e.target).length === 0
                && !$('.navbar-toggle').is(e.target)
                && $('.navbar-toggle').has(e.target).length === 0
                && $sidebarNav.hasClass('active')
                )// ... nor a descendant of the container
        {
            e.stopPropagation();
            $('.navbar-toggle').click();
        }
    });

    // carrega o conteudo do login
    showPageToDiv("login-div", "login.html");

    // evento de carregar no botao do login
    $("body").on("click", "#login-btn", function () {

        // remove o conteudo do login
        $("body").find("#login-div").remove();

        // inicia a ligacao do web-socket
        socket = io.connect(window.location.href);

        // simula o clik no dashboard e carrega o conteudo
        $('a.ajax-link:first')[0].click();

    });

    //prevent # links from moving to top
    $("body").find('a[href="#"][data-top!=true]').click(function (e) {
        e.preventDefault();
    });

    $('#themes a').click(function (e) {
        e.preventDefault();
        currentTheme = $(this).attr('data-value');
        $.cookie('currentTheme', currentTheme, {expires: 365});
        switchTheme(currentTheme);
    });

    $('.navbar-toggle').click(function (e) {
        e.preventDefault();
        $('.nav-sm').html($('.navbar-collapse').html());
        $('.sidebar-nav').toggleClass('active');
        $(this).toggleClass('active');
    });

    $("a#logout-a").click(function (e) {
        e.preventDefault();
        $("body").append('<div id="login-div"></div>');
        $("body").find("#contentor-div > div").remove();
        $('ul.main-menu li.active').removeClass('active');


        // carrega o conteudo do login
        var $clink = $(this);
        showPageToDiv("login-div", $clink.attr('href'));
    });

    // evento de fechar o painel
    $("body").on("click", '.btn-close', function (e) {
        e.preventDefault();
        $(this).parent().parent().parent().fadeOut();
    });

    // evento de minimizar o painel
    $("body").on("click", '.btn-minimize', function (e) {
        e.preventDefault();
        var $target = $(this).parent().parent().next('.box-content');
        if ($target.is(':visible'))
            $('i', $(this)).removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
        else
            $('i', $(this)).removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up');
        $target.slideToggle();
    });

    // evento das setings
    $("body").on("click", '.btn-setting', function (e) {
        e.preventDefault();
        $('#myModal').modal('show');
    });

    //ajaxify menus
    $('a.ajax-link').click(function (e) {
        e.preventDefault();
        if (msie) {
            e.which = 1;
        }
        if (e.which != 1 || $(this).parent().hasClass('active')) {
            return;
        }
        $('.sidebar-nav').removeClass('active');
        $('.navbar-toggle').removeClass('active');
        $('#loading').remove();
        $('#content').fadeOut().parent().append('<div id="loading" class="center">Loading...<div class="center"></div></div>');
        var $clink = $(this);
        showPageToDiv("contentor-div", $clink.attr('href'));
        $('ul.main-menu li.active').removeClass('active');
        $clink.parent('li').addClass('active');
    });


    // verifica se o web-spcket e valido
    if (socket) {

        alert("asd");
    }
});

/**
 * Carrega a pagina pretendiad no local defenido por parametro
 * @param {type} local local a ser carregado o conteudo
 * @param {type} page conteudo a ser carregado
 * @returns {undefined}
 */
function showPageToDiv(local, page) {
    $.ajax({
        method: 'GET',
        url: "./html/" + page,
        cache: false, dataType: "text",
        success: function (data) {
            $("#" + local).html(data);

            // coloca a animacao do botao
            animationClick(".anima", "tada");

            switch (page) {
                case "dashboard.html":
                    carregarDashBoard();
                    break;
                case "":
                    break;
            }
        },
        error: function (err) {
            alert("error " + err);
        },
        complete: function () {
            //alert("finished");
        }
    });
}

function animationClick(element, animation) {
    $(element).addClass('animated ' + animation);
    //wait for animation to finish before removing classes
    window.setTimeout(function () {
        $(element).removeClass('animated ' + animation);
    }, 1000);

}

function switchTheme(themeName) {
    if (themeName == 'classic') {
        $('#bs-css').attr('href', 'bower_components/bootstrap/dist/css/bootstrap.min.css');
    } else {
        $('#bs-css').attr('href', 'css/bootstrap-' + themeName + '.min.css');
    }

    $('#themes i').removeClass('glyphicon glyphicon-ok whitespace').addClass('whitespace');
    $('#themes a[data-value=' + themeName + ']').find('i').removeClass('whitespace').addClass('glyphicon glyphicon-ok');
}

function carregarDashBoard() {
    $.ajax({
        type: "GET",
        url: "/getNumDispositivos",
        dataType: 'json',
        success: function (data) {
            $("body").find("#sensores-num-div").html(data.sensor);
            $("body").find("#disp-num-div").html(data.moveis);
            $("body").find("#ap-num-div").html(data.ap);
        },
        error: function (error) {
            console.log(JSON.stringify(error));
        }
    });
}

