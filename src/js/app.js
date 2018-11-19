import $ from 'jquery';
import page from 'page';
import forms from 'forms';
import quiz from 'quiz';
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

        // Init quiz
        this.quiz = quiz;
        this.quiz.init.call(this);

        app.document.ready(function () {
            app.initNav();
            app.initPopup();
            app.initConfig();
            app.initConfigSlider();
            app.initManSlider();
        });

        app.document.on(app.resizeEventName, function () {
            app.initConfigSlider();
        });

        // Antispam
        setTimeout(function () {
            $('input[name="email3"],input[name="email"],input[name="text"]').attr('value', '').val('');
        }, 5000);
    },

    initNav: function () {
        let $toggler = $('.js-nav-toggler'), $nav = $('.js-nav'), $header = $('.header');
        // handle hash link on load page 
        if (location.hash.length > 0) {
            let hash = location.hash;
            let id = hash.substr(1);
            let $target = $('#' + id);
            let $links = $('.js-nav-link[href="' + hash + '"]');
            if ($target && $links) {
                $links.addClass('_active');
                let offset = $target.offset().top - $header.outerHeight();
                window.scroll(0, offset);
            }
        }
        $toggler.on('click', function () {
            $toggler.toggleClass('_active');
            $nav.slideToggle();
        });
        app.document.on(app.resizeEventName, function () {
            $toggler.removeClass('_active');
            if (app.media >= app.breakpoints.lg) {
                $nav.show();
            } else {
                $nav.hide();
            }
        });
        $('.js-nav-link').on('click', function () {
            let id = $(this).attr('href').substr(1),
                    $target = $('#' + id);
            if ($target) {
                let offset = $target.offset().top - $header.outerHeight();
                $('html, body').animate({scrollTop: offset});
                if (history.pushState) {
                    history.pushState(null, null, '#' + id);
                } else {
                    location.hash = '#' + id;
                }
                $('.js-nav-link').removeClass('_active');
                $('.js-nav-link[href="#' + id + '"]').addClass('_active');
                if (app.media < app.breakpoints.lg) {
                    $toggler.removeClass('_active');
                    $nav.slideUp();
                }
            }
            return false;
        });
    },

    initPopup: function () {
        require("@fancyapps/fancybox");
        $('.js-popup').fancybox(this.fancyOptions);
    },

    initConfig: function () {
        $('.js-config').each(function () {
            let $toggler = $(this).find('.js-config__toggler');
            let $target = $(this).find('.js-config__target');
            $toggler.on('click', function () {
                $toggler.removeClass('_active');
                $(this).addClass('_active');
                $target.toggleClass('hidden');
            });
        });
        let heightClosed = 95;
        let duration = 200;
        let sliderEl = document.querySelector('.config-list .swiper-container');
        $('.js-config__cut').each(function () {
            let $cutParent = $(this).parent();
            let $target = $cutParent.siblings('.js-config__feats');
            let textShow = $(this).data('show');
            let textHide = $(this).data('hide');
            $(this).on('click', function () {
                let heightOpened = $target.find('.js-config__feats__inner').outerHeight();
                $cutParent.toggleClass('_active');
                if ($cutParent.hasClass('_active')) {
                    $target.animate({height: heightOpened}, duration, function () {
                        if (sliderEl.swiper) {
                            sliderEl.swiper.updateAutoHeight();
                        }
                    });
                    $target.addClass('_active');
                    $(this).text(textHide);
                } else {
                    $target.animate({height: heightClosed}, duration, function () {
                        if (sliderEl.swiper) {
                            sliderEl.swiper.updateAutoHeight();
                        }
                    });
                    $target.removeClass('_active');
                    $(this).text(textShow);
                }
            });
        });
    },

    initConfigSlider: function () {
        let selector = '.config-list .swiper-container',
                el = document.querySelector(selector);
        if (app.media == app.breakpoints.sm) {
            new Swiper(el, {
                autoHeight: true,
//                effect: 'fade',
                spaceBetween: 8,
                allowTouchMove: false,
                pagination: {
                    el: '.config-list .swiper-pagination',
                    type: 'bullets',
                    clickable: true
                },
                on: {
                    slideChange: function () {
                        $('.js-config-slider__current').text(this.activeIndex + 1);
                    },
                }
            });
            $('.js-config-slider__total').text($(selector).find('.swiper-slide').length);
        } else {
            if (el.swiper) {
                el.swiper.destroy();
            }
        }
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
        for (let key in app.breakpoints) {
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