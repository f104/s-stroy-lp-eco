import $ from 'jquery';
import svg4everybody from 'svg4everybody';
import FastClick from 'fastclick';
import browser from 'browser-detect';

const page = {
    init: function () {
        const app = this;

        // Base components
        app.window = $(window);
//        app.window.jQuery = $;
        app.document = $(document);
        app.html = $("html");
        app.body = $("body");

        // App params
        app.browser = browser();
        app.mobile = app.browser.mobile;
        app.html.removeClass('no-js').addClass(app.mobile ? "mobile" : "desktop").addClass(app.browser.name);

        // svg4everybody | Init
        if (!app.mobile) {
            svg4everybody();
        }

        // FastClick | Init
        if (app.mobile) {
            FastClick.attach(document.body);
        }
        
    },
    
};

export default page;