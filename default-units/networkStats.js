module.exports = {
    metadata: {
        plugin: "networkStats",
        label: "Network Stats",
        role: "sensor",
        family: "networkStats",
        deviceTypes: ["node-monitor/nodeMonitor"],
        events: [],
        state: [{
            id: "ethernetActive",
            label: "Ethernet active",
            type: {
                id: "boolean"
            }
        }, {
            id: "wifiActive",
            label: "Wifi active",
            type: {
                id: "boolean"
            }
        }, {
            id: "wifiSSID",
            label: "Wifi SSID",
            type: {
                id: "string"
            }
        }, {
            id: "wifiApMAC",
            label: "Wifi access point MAC",
            type: {
                id: "string"
            }
        }, {
            id: "wifiIEEE",
            label: "Wifi IEEE",
            type: {
                id: "string"
            }
        }, {
            id: "wifiFrequency",
            label: "Wifi frequency",
            type: {
                id: "string"
            }
        }, {
            id: "wifiSignalQuality",
            label: "Wifi signal quality",
            type: {
                id: "integer"
            }
        }, {
            id: "localIp",
            label: "Local IP",
            type: {
                id: "string"
            }
        }, {
            id: "hostname",
            label: "Hostname",
            type: {
                id: "string"
            }
        }],
        configuration: [{
            id: "refreshInterval",
            label: "Refresh Interval",
            type: {
                id: "integer"
            },
            defaultValue: 10,
            unit: "sec"
        }
        ]
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
        var os = require('os');


        try {
            if (!this.isSimulated()) {

                try {


                    this.state.hostname = os.hostname();

                    setInterval(function () {

                        iwconfig.status('wlan0', function (err, status) {
                            console.log(status);

                            // [ { interface: 'wlan0',
                            //     access_point: 'f0:9f:c2:2a:0e:43',
                            //     frequency: 2.462,
                            //     ieee: '802.11',
                            //     mode: 'managed',
                            //     quality: 68,
                            //     signal: -42,
                            //     ssid: 'StellasNet' } ]


                        });


                        network.get_private_ip(function (err, ip) {
                            if (err) {
                                this.logDebug("Faild to get local IP address Error: " + err);
                            } else {
                                //this.state.localIp = ip;
                                //this.publishStateChange();
                                //this.logDebug("Local IP: " + ip);
                                console.log(ip);
                            }
                        });


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