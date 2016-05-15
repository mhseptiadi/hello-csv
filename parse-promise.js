// please use promise approach to fight the naive one in parse-callback.js
'use strict';

const debug = require('debug')('hello');

const fs = require('fs');
const parse = require('csv-parse');
const helper = require('./helper');

var Q = require('q');
var Q_readFile = Q.denodeify(fs.readFile);
var Q_parse = Q.denodeify(parse);
var Q_helper_sendSms = Q.denodeify(helper.sendSms);

// 0. Naïve

function naive() {

    Q_readFile(__dirname + '/sample.csv')
    .then(function (files) {
        return Q_parse(files);
    })
    .then(function (lines) {

        for (let index in lines) {
            let line = lines[index];
            // FIXME: Put your transformation here
            line[12] = line[0] + ' ' + line[1];

            if (index > 0) {
                debug(`sending data index: ${index - 1}`);

                Q_helper_sendSms(line)
                .then(
                    function afterSending(err, sendingStatus) {
                        let lineToLog;
                        if (err) {
                            debug(err.message);

                            lineToLog = {
                                sendingStatus,
                                line,
                            };
                        }

                        return lineToLog;
                    }
                ).then(
                    function (lineToLog) {
                        if (lineToLog) {
                            helper.logToS3(lineToLog, function afterLogging(err, loggingStatus) {
                                if (err) {
                                    debug(err.message);
                                }
                            });
                        }
                    }
                );
            }
        }
    });
}

naive();

