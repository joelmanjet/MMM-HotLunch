// MMM-HotLunch module for https://magicmirror.builders/
// I have commented excessively to record my notes on how to build a module. 

Module.register('MMM-HotLunch', {
    defaults: {
        updateInterval: 60 * 60 * 1000,
        url: 'https://api.isitesoftware.com//graphql?query=%7B%0Amenu%28id%3A%20%225c829b1c534a135521ca0f8c%22%29%20%7B%0Aid%0Abg%0AweeksForCycle%0AisTwoPages%0Amonth%0Ayear%0AmenuType%20%7B%0Aid%0Aname%0Aformats%0AlistMenuIDs%0AsitePaths%20%7B%0Asites%20%7B%0Aid%0Aname%0A%7D%0A%7D%0A%7D%0Aitems%20%7B%0Aday%0Aproduct%20%7B%0Aid%0Aname%0Acategory%0Aenabled%0Afood_group%0Ahide_on_calendars%0Ahide_on_mobile%0Ais_ancillary%0Along_description%0Ameal%0Apdf_url%0Aportion_size%0Aportion_size_unit%0Aprice%0Aproduct_fullname%0AproductID%0AproviderProductID%0Avisible_month_cal%0Ahide_on_calendars%0Ahide_on_web_menu_view%0Aglobal%0A%7D%0A%7D%0ApreviousMonthPublished%20%7B%0Aid%0A%7D%0AnextMonthPublished%20%7B%0Aid%0A%7D%0A%7D%0A%7D%0A',
    },

    // CSS is used to limit the width of the widget.
    // I have not found good recommendations on how to keep this widget from
    // messing up the layout of other widgets on the screen. 
    getStyles: function () {
        return ["MMM-HotLunch.css"]
    },  

    start: function () {
        Log.info("Starting module: " + this.name);
        // Send the config to node_helper so it knows what URL to fetch
        this.sendSocketNotification('MMM-HOTLUNCH-CONFIG', this.config);
        this.menuItems = ['Loading hot lunch menu...'];
        // Start the timer and do the first fetch
        this.scheduleUpdate();
    },

    scheduleUpdate: function () {
        setInterval(() => {
            this.getMenu();
        }, this.config.updateInterval);
        this.getMenu();
    },

    // Ask the node_helper to fetch the menu for us
    getMenu: function () {
        this.sendSocketNotification('MMM-HOTLUNCH-GET');
    },

    // The node_helper sends back the menu items
    socketNotificationReceived: function (notification, payload) {
        if (notification === "MMM-HOTLUNCH-ITEMS") {
            this.menuItems = payload;
            // Tell the mirror to update our widet
            this.updateDom();
        }
    },

    // Build the widget contents
    getDom: function () {
        var wrapper = document.createElement("div");
        wrapper.classList.add("small"); // MM2 style
        var ul = document.createElement('ul');
        ul.classList.add('fa-ul'); // "fa" styles are used for FontAwesome icons
        wrapper.append(ul);
        for (var i = 0; i < this.menuItems.length; i++) {
            var li = document.createElement('li');

            // https://fontawesome.com/how-to-use/on-the-web/styling/icons-in-a-list
            var icon_span = document.createElement('span'); 
            icon_span.classList.add('fa-li');
            var icon_i = document.createElement('i');
            icon_i.classList.add('fas');
            icon_i.classList.add('fa-utensils');
            icon_span.appendChild(icon_i);
            li.appendChild(icon_span);

            ul.appendChild(li);

            // The first two items are big, the rest are smaller
            if (i >= 2) {
                li.classList.add("xsmall");
            }

            var item = this.menuItems[i];
            // item = this.emojify(item); /* emoji doesn't work on the pi */
            li.innerHTML = li.innerHTML + item;
        }
        return wrapper;
    },

    // Emojis are apparently not present in the font used on the browser on the Pi. 
    // This works fine in Chrome. 
    emojify: function (txt) {
      txt = txt.replaceAll('Pizzeria-Style Pizza', '&#x1f355;');
      txt = txt.replaceAll('All-Beef Hot Dog', '&#x1f32d;');
      txt = txt.replaceAll('Tossed Salad', '&#x1f957;');
      txt = txt.replaceAll('Bento Box', '&#x1f371;');
      txt = txt.replaceAll('Chicken', '&#x1f414;');
      txt = txt.replaceAll('Fortune Cookie', '&#x1f960;');
      return txt;
    }
});

// https://stackoverflow.com/questions/1137436/what-are-useful-javascript-methods-that-extends-built-in-objects/1137579#1137579
// This is used above to replace seme of the menu text with shorter text or emojis. 
String.prototype.replaceAll = function(search, replace) {
    if (replace === undefined) {
        return this.toString();
    }
    return this.split(search).join(replace);
};