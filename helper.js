'use strict';

const debug = require('debug')('hello-helper');
const AWS = require('mock-aws-s3');

AWS.config.basePath = __dirname + '/buckets';

const s3 = AWS.S3({ params: { Bucket: 'example' } });

function surprise(name) {
    if (Math.floor(Math.random() * 100) + 1 <= 50) {
        return new Error(`w00t!!! ${name} error`);
    }
}

// simulates sending sms
exports.sendSms = function (data, callback) {

    setTimeout(() => {
        debug(`sending out sms: ${JSON.stringify(data)}`);
        callback(surprise('sending-sms'), {
            status: 200,
            message: 'OK',
        });
    }, 200);
};

// simulates logging to s3
exports.logToS3 = function (data, callback) {

    setTimeout(() => {
        debug(`putting data to S3: ${JSON.stringify(data)}`);
        s3.putObject({
            Key: `row/line-${new Date().valueOf()}.json`,
            Body: JSON.stringify(data),
        }, (err) => {
            callback(err ? err : surprise('log-to-s3'), { data, logged: true });
        });
    });
};
