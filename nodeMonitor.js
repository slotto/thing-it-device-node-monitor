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


    create: function (device) {
        return new NodeMonitor();
    }
};

var q = require('q');


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
