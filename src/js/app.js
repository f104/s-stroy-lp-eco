import $ from 'jquery';
import page from 'page';
import forms from 'forms';
import Swiper from 'swiper/dist/js/swiper.min.js';
var app = {

    breakpoints: {
        sm: 320,
        md: 768,
        lg: 1280,
        xl: 1440
    },
    media: 320,
    resizeEventName: 'app_resize',
    submitEventName: 'app_submit',
    fancyOptions: {
        autoFocus: false,
        touch: false,
        baseClass: 'popup',
        afterShow: function (instance, slide) {
            let action = instance.$trigger.data('action');
            if (action) {
                let $input = slide.$slide.find('[name="action"]');
                if ($input) {
                    $input.val(action);
                }
            }
        },
    },

    init: function () {

        // Init page
        this.page = page;
        this.page.init.call(this);

        app.checkMedia();
        app.window.on('resize', app.checkMedia);
        window.jQuery = $;

        // Init forms
        this.forms = forms;
        this.forms.init.call(this);

        app.document.ready(function () {
            app.initPopup();
            app.initConfig();
            app.initManSlider();
        });

        app.document.on(app.resizeEventName, function () {
        });

        // Antispam
        setTimeout(function () {
            $('input[name="email3"],input[name="email"],input[name="text"]').attr('value', '').val('');
        }, 5000);
    },

    initPopup: function () {
        require("@fancyapps/fancybox");
        $('.js-popup').fancybox(this.fancyOptions);
    },
    
    initConfig: function () {
        $('.js-config').each(function(){
            let $toggler = $(this).find('.js-config__toggler');
            let $target = $(this).find('.js-config__target');
            $toggler.on('click', function() {
                $toggler.removeClass('_active');
                $(this).addClass('_active');
                $target.toggleClass('hidden');
            });
        });
    },
    
    initManSlider: function () {
        let stretch = 535;
        if (app.media >= app.breakpoints.lg) {
            stretch = 725;
        }
        if (app.media >= app.breakpoints.xl) {
            stretch = 745;
        }
        let selector = ('.man .swiper-container');
        let el = document.querySelector(selector);
        if (el.swiper) {
            el.swiper.destroy();
        }
        let slider = new Swiper(selector, {
            effect: app.media >= app.breakpoints.md ? 'coverflow' : 'slide',
            slidesPerView: 'auto',
            normalizeSlideIndex: false,
//            centeredSlides: false,
            coverflowEffect: {
                rotate: 0,
                stretch: stretch,
                depth: 200,
                modifier: 1,
                slideShadows: false,
            },
            pagination: {
                el: '.man .swiper-pagination',
                type: 'bullets',
                clickable: true
            },
            navigation: {
                nextEl: '.man .swiper-button-next',
                prevEl: '.man .swiper-button-prev',
            },
        });
    },

    /**
     * Проверяет размер окна и пишет его в app.media
     * @returns void
     */
    checkMedia: function () {
        let current = app.media;
        for (let key of Object.keys(app.breakpoints)) {
            if (app.window.outerWidth() >= app.breakpoints[key]) {
                app.media = app.breakpoints[key];
            }
//            console.log(app.media);
        }
        if (app.media != current) {
            app.document.trigger(app.resizeEventName, {media: app.media});
        }
    },

};
app.init();