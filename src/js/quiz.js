import $ from 'jquery';
import Swiper from 'swiper';
import Hogan from 'hogan.js';
const quiz = {

    srcFile: 'quiz.json',
    tpl: {
        question: Hogan.compile('<div class="quiz-item swiper-slide js-quiz__question" data-index="{{index}}"><div class="quiz-item__question js-quiz__question__text">{{question}}</div><ul class="quiz-item__responces sm-full">{{{answers}}}</ul></div>'),
        answer: Hogan.compile('<li class="quiz-item__responces__item js-quiz__answer" data-next="{{nextQuestion}}">{{answer}}</li>')
    },
    codeLength: 7,
    codeSymbols: 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789',

    init: function () {
        const app = this;
        this.submitEventName = app.submitEventName;

        $.getJSON(this.quiz.srcFile, function (json) {
            app.quiz.initQuiz(json);
            app.quiz.initTooltip();
        }).fail(function (jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            console.log("Request Failed: " + err);
        });
    },

    initQuiz: function (data) {
        const that = this;
        let $wrapper = $('.js-quiz__wrapper'),
                questions = data.questions,
                html = [];
        for (let index of Object.keys(questions)) {
            let answers = [];
            questions[index]['answers'].forEach(function (answer) {
                answers.push(that.tpl.answer.render(answer))
            });
            let question = that.tpl.question.render({
                index: index,
                question: questions[index]['question'],
                answers: answers.join('')
            });
            html.push(question);
        }
        $wrapper.prepend(html.join(''));
        let selector = ('.quiz .swiper-container');
        let slider = new Swiper(selector, {
            slidesPerView: 1,
            effect: 'fade',
            simulateTouch: false,
//            initialSlide: 3,
            autoHeight: true
        });
        let total = this.getTotal(1, questions),
                rate = data.discountPerQuestion,
                step = 1,
                prevIndex = [],
                finalIndex = slider.slides.length - 1,
                results = [],
                $back = $('.js-quiz__back'),
                $toggle = $('.js-quiz__toggle'),
                $hide = $('.js-quiz__end-hide'),
                $code = $('.js-quiz__code'),
                $results = $('.js-quiz__results-input');
        that.setStep(step, total);
        $('.js-quiz__rate').text(rate);
        $('.js-quiz__total').text(total);
        $('.js-quiz__answer').on('click', function () {
            let parent = $(this).parents('.js-quiz__question');
            step++;
            prevIndex.push(parent.data('index') - 1);
            results.push({
                question: parent.find('.js-quiz__question__text').text(),
                answer: $(this).text()
            });
//            console.log(results);
            let next = $(this).data('next');
            if (next !== 0) {
                slider.slideTo(next - 1);
            } else {
                slider.slideTo(finalIndex);
            }
        });
        slider.on('slideChange', function () {
//            console.log(this);
            that.setStep(step, total);
            that.setDiscount(rate, step, data.discountMax);
            slider.isBeginning ? $back.removeClass('_active') : $back.addClass('_active');
            if (slider.isEnd) {
                $toggle.addClass('_final');
                $hide.hide();
                $results.val(JSON.stringify(results));
            } else {
                $toggle.removeClass('_final');
                $hide.show();
            }
        });
        $back.on('click', function () {
            step--;
            slider.slideTo(prevIndex.pop());
        });
        $code.val(that.makeCode());
        
        // handle direct link
        if (location.hash && location.hash == '#accessories') {
            $('.js-quiz__answer').filter('[data-next="4"]').click();
        }

        // handle reset form
        $(document).on('app_submit', function (e, data) {
            if (data.$form.hasClass('js-quiz__form')) {
                step = 1;
                prevIndex = [];
                results = [];
                $code.val(that.makeCode());
                slider.slideTo(0);
            }
        });

    },

    setStep: function (current, total) {
        $('.js-quiz__progress').css({width: current * 100 / total + '%'});
        $('.js-quiz__current').text(current);
    },

    setDiscount: function (rate, step, max) {
        let discount = rate * (step - 1);
        if (discount > max) {
            discount = max;
        }
        $('.js-quiz__discount').html(discount);
        $('.js-quiz__discount-input').val(discount);
    },

    getTotal: function (index, data) {
        let total = 1, nextIndex = data[index]['answers'][0]['nextQuestion'];
        if (data[nextIndex]['answers'][0]['nextQuestion'] !== 0) {
            total += this.getTotal(nextIndex, data);
        } else {
            total = total + 2; // отправка формы - тоже шаг
        }
        return total;
    },

    initTooltip: function () {
        let $tooltip = $('.js-quiz__tooltip'), tooltipText = $tooltip.text();
        $('.js-quiz__btn').hover(function () {
            $tooltip.text(tooltipText);
            $tooltip.show(200);
        }, function () {
            $tooltip.hide(200);
        }).on('click', function () {
            let i = document.querySelector('.quiz-item__code__input');
            i.select();
            if (document.execCommand("copy")) {
                $tooltip.text($tooltip.data('success'));
            }
            return false;
        });
    },

    makeCode: function () {
        let code = '';
        for (let i = 0; i < this.codeLength; i++)
            code += this.codeSymbols.charAt(Math.floor(Math.random() * this.codeSymbols.length));
        return code;
    },

    _initQuiz: function () {
        let selector = ('.quiz .swiper-container');
        let slider = new Swiper(selector, {
            slidesPerView: 1,
            effect: 'fade',
            simulateTouch: false,
//            initialSlide: 3,
            autoHeight: true
        });
        $('.js-quiz__responce').on('click', function () {
            slider.slideNext();
        });
        let total = slider.slides.length;
        let $current = $('.js-quiz__current');
        let $bar = $('.js-quiz__progress');
        let $back = $('.js-quiz__back');
        let $toggle = $('.js-quiz__toggle');
        let $discount = $('.js-quiz__discount');
        let rate = parseInt($('.js-quiz__rate').text());
        $bar.css({width: 100 / total + '%'});
        $('.js-quiz__total').text(total);
        $back.on('click', function () {
            slider.slidePrev();
        });
        slider.on('slideChange', function () {
            let current = slider.realIndex + 1;
            let percent = current * 100 / total;
            $current.text(current);
            $bar.css({width: percent + '%'});
            $discount.text(slider.realIndex * rate);
            current === 1 ? $back.removeClass('_active') : $back.addClass('_active');
            slider.isEnd ? $toggle.addClass('_final') : $toggle.removeClass('_final');
        });
        let $tooltip = $('.js-quiz__tooltip'), tooltipText = $tooltip.text();
        $('.js-quiz__btn').hover(function () {
            $tooltip.text(tooltipText);
            $tooltip.show(200);
        }, function () {
            $tooltip.hide(200);
        }).on('click', function () {
            let i = document.querySelector('.quiz-item__code__input');
            i.select();
            if (document.execCommand("copy")) {
                $tooltip.text($tooltip.data('success'));
            }
        });
    },
};
export default quiz;