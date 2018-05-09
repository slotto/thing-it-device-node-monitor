module.exports = {
    metadata: {
        family: "nodeMonitor",
        superDevice: "node-monitor/nodeMonitor",
        plugin: "nodeMonitor",
        tangible: true,
        label: "Node Monitor",
        connectionTypes: [],
        dataTypes: {},
        actorTypes: [],
        sensorTypes: [],
        services: [],
        state: [{
            id: "raspberryModel",
            label: "Raspberry Pi Model",
            type: {
                id: "string"
            }
        }, {
            id: "hostUpTime",
            label: "Host uptime",
            type: {
                id: "string"
            }
        }, {
            id: "processUpTime",
            label: "Process uptime",
            type: {
                id: "string"
            }
        },{
            id: "totalMemory",
            label: "Total memory",
            type: {
                id: "string"
            }
        },{
            id: "usedMemory",
            label: "Used memory",
            type: {
                id: "string"
            }
        }],
        configuration: [{
            label: "Board Type",
            id: "boardType",
            type: {
                family: "reference",
                id: "boardType"
            },
            defaultValue: "RASPBERRY"
        }]
    },


    create: function () {
        return new NodeMonitor();
    }
};

var q = require('q');
var monitor = require("os-monitor");
var os = require('os');
const si = require('systeminformation');
var cpuinfo = require('proc-cpuinfo')();

//TODO COMPLETE from https://elinux.org/RPi_HardwareHistory
var raspberryRevision = [
    {revision: "Beta", model: "B (Beta)"},
    {revision: "0002", model: "B (Beta)"},
    {revision: "0003", model: "B (Beta)"},
    {revision: "0004", model: "B (Beta)"},
    {revision: "0005", model: "B (Beta)"},
    {revision: "0006", model: "B (Beta)"},
    {revision: "0007", model: "B (Beta)"},
    {revision: "0008", model: "B (Beta)"},
    {revision: "0009", model: "B (Beta)"},
    {revision: "000d", model: "B (Beta)"},
    {revision: "000e", model: "B (Beta)"},
    {revision: "000f", model: "B (Beta)"},
    {revision: "0010", model: "B (Beta)"},
    {revision: "0011", model: "B (Beta)"},
    {revision: "0012", model: "B (Beta)"},
    {revision: "0013", model: "B (Beta)"},
    {revision: "0014", model: "B (Beta)"},
    {revision: "0015", model: "B (Beta)"},
    {revision: "Beta", model: "B (Beta)"},
    {revision: "Beta", model: "B (Beta)"},
    {revision: "Beta", model: "B (Beta)"},
    {revision: "Beta", model: "B (Beta)"},
    {revision: "Beta", model: "B (Beta)"},
    {revision: "Beta", model: "B (Beta)"},
    {revision: "Beta", model: "B (Beta)"},
    {revision: "Beta", model: "B (Beta)"},
    {revision: "Beta", model: "B (Beta)"},
    {revision: "a02082", model: "3 Model B"},

];


function NodeMonitor() {
    /**
     *
     */

    NodeMonitor.prototype.start = function () {
        var deferred = q.defer();

        this.logLevel = 'debug';

        if (this.isSimulated()) {
            deferred.resolve();
        } else {


            //Determinate Raspberry Model
            if (cpuinfo.Revision) {
                try {
                    this.state.raspberryModel = raspberryRevision.find(function (obj) {
                        return obj.revision.includes(cpuinfo.Revision);
                    }).model;
                    this.logDebug("Raspberry Model: " + this.state.raspberryModel);
                } catch (x) {
                    this.state.raspberryModel = 'Not defined in device Plugin';
                    this.logDebug("Raspberry Model: " + this.state.raspberryModel);
                }
            } else {
                this.state.raspberryModel = "-"
            }

            this.state.totalMemory = os.totalmem();
            this.logDebug("Total Memory: " + this.state.totalMemory);


            setInterval(function () {

                this.state.hostUpTime = getTimeString(os.uptime());
                this.logDebug("Host Uptime: " + this.state.hostUpTime);

                this.state.processUpTime = getTimeString(Math.floor(process.uptime()));
                this.logDebug("Process Uptime: " + this.state.processUpTime);

                this.publishStateChange();

                osutil.cpuUsage(function (v) {
                    console.log('CPU Usage (%): ' + v);
                });

                osutil.cpuFree(function (v) {
                    console.log('CPU Free:' + v);
                });

            }.bind(this), 1000);


            deferred.resolve();
        }
        return deferred.promise;

    };


    /**
     *
     */
    NodeMonitor.prototype.getState = function () {
        return {};
    };

    /**
     *
     */
    NodeMonitor.prototype.setState = function () {
    };

    /**
     *
     */

    NodeMonitor.prototype.stop = function () {


        //this.board.io.reset()
        //TODO implement after adding to firmata -> https://github.com/rwaldron/johnny-five/issues/617

    };

    /**
     *
     */
}


var getTimeString = function (s) {
    let delim = " ";
    let days = Math.floor(s / 60 / 60 / 24); // DAYS
    let hours = Math.floor(s / 60 / 60) % 24;
    let minutes = Math.floor(s / 60) % 60;
    let seconds = s % 60;
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    return days + 'd' + delim + hours + 'h' + delim + minutes + 'm' + delim + seconds + 's';
};