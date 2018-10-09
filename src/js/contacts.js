import $ from 'jquery';
import Swiper from 'swiper';
const contacts = {

    items: [],
    placemarks: [],
    map: null,
    slider: null,
    media: 320,

    init: function () {
        const app = this;
        app.document.ready(function () {
            this.media = app.media;
            app.contacts.initSlider();
        });
        app.document.on(app.resizeEventName, function (ev, params) {
            contacts.media = params.media;
        });
    },

    initSlider: function () {
        let selector = '.contacts .swiper-container',
                items = [],
                $prev = $('.js-map__prev'),
                $next = $('.js-map__next'),
                that = this;
        $('.js-map__item').each(function () {
            let geo = $(this).data('geo');
            geo = geo.split(',');
            geo[0] = parseFloat(geo[0]);
            geo[1] = parseFloat(geo[1]);
            items.push({
                text: $(this).text(),
                geo: geo
            });
        });
        $prev.text(items[items.length - 1]['text']);
        $next.text(items[1]['text']);
        let slider = new Swiper(selector, {
            slidesPerView: 1,
            loop: true,
            navigation: {
                nextEl: '.contacts .swiper-button-next',
                prevEl: '.contacts .swiper-button-prev',
            },
        });
        slider.on('slideChange', function () {
            let prev = this.realIndex == 0 ? (items.length - 1) : (this.realIndex - 1);
            let next = this.realIndex == items.length - 1 ? 0 : (this.realIndex + 1);
            $prev.text(items[prev]['text']);
            $next.text(items[next]['text']);
            $('.placemark').removeClass('_active');
            $('#pm_' + this.realIndex).addClass('_active');
            that.map.panTo(that.getCenter(items[this.realIndex]['geo']));
        });
        if (typeof (ymaps) === 'undefined') {
            $.ajax({
                url: '//api-maps.yandex.ru/2.1/?lang=ru_RU&mode=debug',
                dataType: "script",
                cache: true,
                success: function () {
                    ymaps.ready(that.initMap);
                }
            });
        } else {
            ymaps.ready(that.initMap);
        }
        that.items = items;
        that.slider = slider;
    },

    initMap: function () {
        let map = new ymaps.Map("map", {
            center: contacts.getCenter(contacts.items[0]['geo']),
            zoom: 11,
            controls: []
        }, {
            suppressMapOpenBlock: true,
        });
        map.behaviors.disable('scrollZoom');
        if (contacts.media >= 768) {
            map.controls.add('zoomControl', {
//                size: 'small',
                float: 'none',
                position: {
                    top: '50px',
                    right: '30px'
                }
            });
        }
//        map.controls.add('zoomControl', {
//            size: 'small'
//        });
        let placemarks = [];
        let tplPlacemark = ymaps.templateLayoutFactory.createClass(
                '<div id="pm_{{ properties.id }}" class="placemark {{ properties.active }}"><svg class="svgsprite _geo"><use xlink:href="assets/img/sprites/svgsprites.svg#geo"></svg></div>'
                );
        contacts.items.forEach(function (item, index) {
            let placemark = new ymaps.Placemark(item.geo,
                    {
                        id: index,
                        active: index == 0 ? '_active' : '',
                    },
                    {
                        iconLayout: tplPlacemark,
                        iconImageSize: [50, 60],
                        iconShape: {
                            type: 'Rectangle',
                            // Прямоугольник описывается в виде двух точек - верхней левой и нижней правой.
                            coordinates: [
                                [0, -60], [50, 0]
                            ]
                        }
                    });
            map.geoObjects.add(placemark);
            placemarks.push(placemark);
            placemark.events.add('click', function () {
                contacts.slider.slideToLoop(index);
            });
        });

        contacts.map = map;
        contacts.placemarks = placemarks;
    },

    getCenter: function (geo) {
//        if (typeof(this.media !== 'undefined') && this.media >= 1280){
//            geo[1] += 1;
//        }
        return geo;
    }

};
export default contacts;