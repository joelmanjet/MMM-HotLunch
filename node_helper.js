var NodeHelper = require('node_helper');
var https = require('https');

module.exports = NodeHelper.create({
    start: function () {
        console.log("Starting node_helper for module: " + this.name);
    },

    // Handle incoming requests
    socketNotificationReceived: function (notification, payload) {
        var self = this;
        // The URL to fetch is in the config
        if (notification == "MMM-HOTLUNCH-CONFIG") {
            this.config = payload;
        } else if (notification == "MMM-HOTLUNCH-GET") {
            this.getMenuItems(payload);
        }
    },

    // HTTP GET the menu data and pull out the menu items
    getMenuItems: function () {
        // https://www.twilio.com/blog/2017/08/http-requests-in-node-js.html
        var menuid = this.config.menuid;
        var url = 'https://api.isitesoftware.com//graphql?query=%7B%0Amenu%28id%3A%20%22' + menuid + '%22%29%20%7B%0Aid%0Abg%0AweeksForCycle%0AisTwoPages%0Amonth%0Ayear%0AmenuType%20%7B%0Aid%0Aname%0Aformats%0AlistMenuIDs%0AsitePaths%20%7B%0Asites%20%7B%0Aid%0Aname%0A%7D%0A%7D%0A%7D%0Aitems%20%7B%0Aday%0Aproduct%20%7B%0Aid%0Aname%0Acategory%0Aenabled%0Afood_group%0Ahide_on_calendars%0Ahide_on_mobile%0Ais_ancillary%0Along_description%0Ameal%0Apdf_url%0Aportion_size%0Aportion_size_unit%0Aprice%0Aproduct_fullname%0AproductID%0AproviderProductID%0Avisible_month_cal%0Ahide_on_calendars%0Ahide_on_web_menu_view%0Aglobal%0A%7D%0A%7D%0ApreviousMonthPublished%20%7B%0Aid%0A%7D%0AnextMonthPublished%20%7B%0Aid%0A%7D%0A%7D%0A%7D%0A';
        https.get(url, (resp) => {
            let data = '';
            resp.on('data', (chunk) => {
                data += chunk;
            });
            resp.on('end', () => {
                this.handleItems(JSON.parse(data).data.menu);
            });
        }).on("error", (err) => {
            console.log("Error: " + err.message);
        });
    },

    // Format the menu data and send it to the UI
    handleItems: function (menu) {
        var newItems = this.formatMenu(menu);
        this.sendSocketNotification("MMM-HOTLUNCH-ITEMS", newItems);
    },

    // Build up the list of menu items to our liking
    formatMenu: function (menu) {
        var month = menu.month; // 0=Jan
        var year = menu.year; // 2019

        var days = [];
        for (let i of menu.items) {
            var day = i.day;
            if (!days[day]) {
                days[day] = '';
            }
            var name = i.product.name;
            name = name.trim();
            if (name === '-With-') {
                name = 'with';
            } else if (name === 'Or') {
                name = 'or';
            }
            name += ' ';
            days[day] += name;
        }
        var now = new Date();
        var today = now.getDate();
        var futuredays = 7;

        var upcoming_lunches = [];

        for (i = today; i < today + futuredays; i++) {
            if (days[i]) {
                var dateday = this.dateDay(year, month, i);
                var lunch = dateday + ': ' + days[i];
                upcoming_lunches.push(lunch);
            }
        }
        return upcoming_lunches;
    },

    dateDay: function (year, month, day) {
        var dow = new Date(year, month, day).getDay();
        var days = ['Sun', 'Mon', 'Tues', 'Wed', 'Thu', 'Fri', 'Sat'];
        return days[dow];
    }

});
