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
        var url = this.config.url;
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
