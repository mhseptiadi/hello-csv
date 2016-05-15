// 0. Please use readline (https://nodejs.org/api/readline.html) to deal with per line file reading
// 1. Then use the parse API of csv-parse (http://csv.adaltas.com/parse/ find the Node.js Stream API section)

'use strict';

const debug = require('debug')('hello');

const fs = require('fs');
const parse = require('csv-parse');
const helper = require('./helper');

const readline = require('readline');

// 0. Naïve

function naive() {

    var line;
    var firstline = true;
    var index = 0;

    var parser = parse({ delimiter: '|||' });
    parser.on('readable', function () {
        while (line = parser.read()) {
            // FIXME: Put your transformation here
            line[12] = line[0] + ' ' + line[1];

            if (firstline) {
                firstline = false;
            }else {

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

    const rl = readline.createInterface({
        input: fs.createReadStream(__dirname + '/sample.csv'),
    });

    rl.on('line', (cmd) => {
        parser.write(cmd.replace(/","/gi, '|||').replace(/,"/gi, '|||').replace(/",/gi, '|||').replace(/"/gi, '') + '\n');// remove quote and have ||| as unique delimiter
    }).on('close', () => {parser.end();});

}

naive();

