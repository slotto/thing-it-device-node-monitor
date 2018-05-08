module.exports = {
    metadata: {
        plugin: "networkStats",
        label: "Network Stats",
        role: "sensor",
        family: "networkStats",
        deviceTypes: ["node-monitor/nodeMonitor"],
        events: [],
        state: [{
            id: "currentConnectionName",
            label: "Current connection SSID",
            type: {
                id: "string"
            }
        }, {
            id: "localIp",
            label: "Local IP",
            type: {
                id: "string"
            }
        }],
        configuration: []
    },
    create: function () {
        return new NetworkStats();
    }
};


/**
 *
 */
function NetworkStats() {
    /**
     *
     */
    NetworkStats.prototype.start = function () {

        this.logLevel = 'debug';

        var iwconfig = require('wireless-tools/iwconfig');
        var network = require('network');


        try {
            if (!this.isSimulated()) {

                try {

                    setInterval(function () {

                        iwconfig.status(function (err, status) {
                            console.log(status);
                        }.bind(this));

                        network.get_private_ip(function (err, ip) {
                            if (err) {
                                this.logDebug("Faild to get local IP address Error: " + err);
                            } else {
                                //this.state.localIp = ip;
                                //this.publishStateChange();
                                //this.logDebug("Local IP: " + ip);
                            console.log(ip);
                            }
                        }.bind(this));


                    }.bind(this), 1000);


                } catch (x) {

                    console.log(x);
                }


            }
        } catch (x) {
            this.publishMessage("Cannot initialize " + this.device.id + "/"
                + this.id + ":" + x);
        }
    };


    NetworkStats.prototype.getState = function () {
        return this.state;
    };
};