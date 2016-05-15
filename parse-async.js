// Please use async lib https://github.com/caolan/async

const debug = require('debug')('hello');

const fs = require('fs');
const parse = require('csv-parse');
const helper = require('./helper');

var async = require('async');

function naive() {
    fs.readFile(__dirname + '/sample.csv', function thenParse(err, loadedCsv) {

        parse(loadedCsv, function transformEachLine(err, parsed) {

            async.forEachOf(parsed, function (line, index, callback) {

                // FIXME: Put your transformation here
                line[12] = line[0] + ' ' + line[1];

                if (index > 0) {
                    debug(`sending data index: ${index - 1}`);
                    async.waterfall([
                        function (callback) {
                            helper.sendSms(line, function afterSending(err, sendingStatus) {
                                if (err) {
                                    debug(err.message);

                                    lineToLog = {
                                        sendingStatus,
                                        line,
                                    };

                                    callback(null, lineToLog);
                                }
                            });
                        },

                        function (lineToLog, callback) {
                            if (lineToLog) {
                                helper.logToS3(lineToLog, function afterLogging(err, loggingStatus) {
                                    if (err) {
                                        debug(err.message);
                                    }
                                });
                            }
                        },
                    ]);
                }
            });
        });
    });
}

naive();
