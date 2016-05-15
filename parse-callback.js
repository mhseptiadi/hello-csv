'use strict';

const debug = require('debug')('hello');

const fs = require('fs');
const parse = require('csv-parse');
const helper = require('./helper');

// 0. Naïve

function naive() {
    fs.readFile(__dirname + '/sample.csv', function thenParse(err, loadedCsv) {

        parse(loadedCsv, function transformEachLine(err, parsed) {

            for (let index in parsed) {

                let line = parsed[index];

                // FIXME: Put your transformation here
                line[12] = line[0] + ' ' + line[1];

                if (index > 0) {
                    debug(`sending data index: ${index - 1}`);

                    helper.sendSms(line, function afterSending(err, sendingStatus) {
                        let lineToLog;
                        if (err) {
                            debug(err.message);

                            lineToLog = {
                                sendingStatus,
                                line,
                            };
                        }

                        if (lineToLog) {
                            helper.logToS3(lineToLog, function afterLogging(err, loggingStatus) {
                                if (err) {
                                    debug(err.message);
                                }
                            });
                        }
                    });
                }

                index++;
            }
        });
    });
}

naive();

