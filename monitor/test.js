'use strict';

const assert = require('assert');
const monitor = require('./monitor');

const HTTP_SERVER = 'http://1.1.1.1';
const HTTPS_SERVER = 'https://1.1.1.1';
const HTTP_CLIENT = 'http://1.1.1.2';
const HTTPS_CLIENT = 'https://1.1.1.2';

/**
 * @param {object} responses - Mapping between the request URL and the response
 *   expected key format is: 'METHOD URL', e. g. 'GET http://localhot'
 */
const httpMock = (responses) => ({
    request: (options, processor) => {
        const resp = { ...responses };
        const req = `${options.method} ${options.protocol}//`
            + `${options.hostname}${options.path}`;
        if (!(req in resp)) {
            throw new Error(`Request '${req}' not expected!`);
        }
        const events = { };
        const on = (event, handler) => {
            if (event === 'error') {
                events[event] = (...args) => {
                    handler(...args);
                };
            }
        };
        const setTimeout = (ms) => {
            const timeout = 3000;
            if (ms !== timeout) {
                throw new Error(`HTTP timeout expected to be ${timeout}!`);
            }
        };
        processor({
            on: (event, handler) => {
                events[event] = handler;
            },
            statusCode: resp[req].code,
            headers: { 'content-type': 'application/json' }
        });
        const end = () => {
            events.data(JSON.stringify(responses[req].response || { }));
            events.end();
        };
        return { setTimeout, on, end };
    }
});

const streamMock = (...outputs) => {
    let counter = 0;
    return {
        write: (text) => {
            if (counter >= outputs.length) {
                throw new Error(`stream: no call expected, got:\n${text}`);
            }
            assert.strict.equal(text, outputs[counter]);
            counter++;
        },
        end: () => {
            if (counter < outputs.length) {
                throw new Error(`stream: expected output not received: ${outputs[counter]}`);
            }
        }
    };
};

const mailerMock = (config, subject, body) => {
    let sent = false;

    return {
        createTransport: (conf) => {
            const expectedConf = {
                auth: {
                    user: config.smtpUser,
                    pass: config.smtpPassword
                },
                host: config.smtpHost,
                port: config.smtpPort
            };
            assert.deepStrictEqual(conf, expectedConf);

            return {
                sendMail: (mail) => {
                    if (body === undefined) {
                        throw new Error('No mail expected!');
                    }
                    sent = true;
                    assert.strict.equal(mail.to, config.mail);
                    assert.strict.equal(mail.subject, subject);
                    assert.strict.equal(mail.text, body);
                }
            };
        },
        end: () => {
            if (!sent && body !== undefined) {
                throw new Error('No mail sent!');
            }
        }
    };
};

/**
 * @param {object} status
 * @returns string
 */
const statusToStr = (status) => {
    const {
        app, date, server, client
    } = status;
    let retVal = `${app} ${server && client ? 'OK' : 'KO'}\n`
        + `Date: ${date}\n`;
    if (!(client && server)) {
        retVal += `Server: ${server ? 'OK' : 'KO'}\n`
        + `Client: ${client ? 'OK' : 'KO'}\n`;
    }
    return retVal;
};

/**
 * @param {object} status
 * @returns string
 */
const statusToMailSubject = (status) => {
    const {
        app, server, client
    } = status;
    return `CHAT MONITORING: ${app} ${server && client ? 'OK' : 'KO'}`;
};

describe('Chat App Monitoring', () => {

    describe('Output to Stdout', () => {

        it('server_500-client_200', async () => {
            try {
                const date = '1970-01-01T00:00:00';
                const app = 'APP';
                const stdout = streamMock(statusToStr({
                    app, date, server: 0, client: 1
                }));
                await monitor({
                    serverUrl: HTTP_SERVER,
                    clientUrl: HTTP_CLIENT,
                    appName: app,
                    http: httpMock({
                        [`GET ${HTTP_SERVER}/health-check`]: { code: 500 },
                        [`GET ${HTTP_CLIENT}/`]: { code: 200 }
                    }),
                    https: httpMock({ }),
                    date,
                    stdout
                });
                stdout.end();
                assert.ok(true);
            } catch (e) {
                assert.fail(e.toString());
            }
        });

        it('server_200_nok_response-client_200', async () => {
            try {
                const date = '1970-01-01T00:00:00';
                const app = 'APP';
                const stdout = streamMock(statusToStr({
                    app, date, server: 0, client: 1
                }));
                await monitor({
                    serverUrl: HTTP_SERVER,
                    clientUrl: HTTP_CLIENT,
                    appName: app,
                    http: httpMock({
                        [`GET ${HTTP_SERVER}/health-check`]: { code: 500, response: { ok: false } },
                        [`GET ${HTTP_CLIENT}/`]: { code: 200 }
                    }),
                    https: httpMock({ }),
                    date,
                    stdout
                });
                stdout.end();
                assert.ok(true);
            } catch (e) {
                assert.fail(e.toString());
            }
        });

        it('server_200-client_500', async () => {
            try {
                const date = '1970-01-01T00:00:00';
                const app = 'APP';
                const stdout = streamMock(statusToStr({
                    app, date, server: 1, client: 0
                }));
                await monitor({
                    serverUrl: HTTPS_SERVER,
                    clientUrl: HTTPS_CLIENT,
                    appName: app,
                    http: httpMock({ }),
                    https: httpMock({
                        [`GET ${HTTPS_SERVER}/health-check`]: { code: 200, response: { ok: true } },
                        [`GET ${HTTPS_CLIENT}/`]: { code: 500 }
                    }),
                    date,
                    stdout
                });
                stdout.end();
                assert.ok(true);
            } catch (e) {
                assert.fail(e.toString());
            }
        });

        it('server_200-client_200-report_only_ko', async () => {
            try {
                const date = '1970-01-01T00:00:00';
                const app = 'APP';
                const stdout = streamMock();
                await monitor({
                    serverUrl: HTTP_SERVER,
                    clientUrl: HTTP_CLIENT,
                    appName: app,
                    http: httpMock({
                        [`GET ${HTTP_SERVER}/health-check`]: { code: 200, response: { ok: true } },
                        [`GET ${HTTP_CLIENT}/`]: { code: 200 }
                    }),
                    https: httpMock({ }),
                    date,
                    stdout
                });
                assert.ok(true);
            } catch (e) {
                assert.fail(e.toString());
            }
        });

        it('server_200-client_200-report_all', async () => {
            try {
                const date = '1970-01-01T00:00:00';
                const app = 'APP';
                const stdout = streamMock(statusToStr({
                    app, date, server: 1, client: 1
                }));
                await monitor({
                    serverUrl: HTTP_SERVER,
                    clientUrl: HTTP_CLIENT,
                    appName: app,
                    reportOnlyKO: false,
                    http: httpMock({
                        [`GET ${HTTP_SERVER}/health-check`]: { code: 200, response: { ok: true } },
                        [`GET ${HTTP_CLIENT}/`]: { code: 200 }
                    }),
                    https: httpMock({ }),
                    date,
                    stdout
                });
                stdout.end();
                assert.ok(true);
            } catch (e) {
                assert.fail(e.toString());
            }
        });
    });

    describe('Mail Notifications', () => {
        const mailConfig = {
            mail: 'your.name@gmail.com',
            mailSender: 'sender@gmail.com',
            smtpUser: 'your.name@gmail.com',
            smtpPassword: 'PASSWORD',
            smtpHost: 'smtp.gmail.com',
            smtpPort: 465
        };

        it('missing_sender', async () => {
            try {
                const mailer = mailerMock(mailConfig);
                await monitor({
                    serverUrl: HTTP_SERVER,
                    clientUrl: HTTP_CLIENT,
                    mail: 'your.name@gmail.com',
                    http: httpMock({
                        [`GET ${HTTP_SERVER}/health-check`]: { code: 500 },
                        [`GET ${HTTP_CLIENT}/`]: { code: 200 }
                    }),
                    https: httpMock({ }),
                    mailer
                });
                assert.fail('Exception expected');
            } catch (e) {
                assert.deepStrictEqual(
                    e,
                    new Error(
                        'Report to mail required but mailSender not specified!'
                    )
                );
            }
        });

        it('missing_smtp_config', async () => {
            try {
                const mailer = mailerMock(mailConfig);
                await monitor({
                    serverUrl: HTTP_SERVER,
                    clientUrl: HTTP_CLIENT,
                    mail: 'your.name@gmail.com',
                    mailSender: 'sender@gmail.com',
                    http: httpMock({
                        [`GET ${HTTP_SERVER}/health-check`]: { code: 500 },
                        [`GET ${HTTP_CLIENT}/`]: { code: 200 }
                    }),
                    https: httpMock({ }),
                    mailer
                });
                assert.fail('Exception expected');
            } catch (e) {
                assert.deepStrictEqual(
                    e,
                    new Error('Report to mail required but SMTP not configured!')
                );
            }
        });

        it('nok', async () => {
            try {
                const date = '1970-01-01T00:00:00';
                const app = 'APP';
                const mailer = mailerMock(
                    mailConfig,
                    statusToMailSubject({ app, server: 0, client: 1 }),
                    statusToStr({
                        app, date, server: 0, client: 1
                    })
                );
                await monitor({
                    serverUrl: HTTP_SERVER,
                    clientUrl: HTTP_CLIENT,
                    appName: app,
                    ...mailConfig,
                    http: httpMock({
                        [`GET ${HTTP_SERVER}/health-check`]: { code: 500 },
                        [`GET ${HTTP_CLIENT}/`]: { code: 200 }
                    }),
                    https: httpMock({ }),
                    date,
                    mailer
                });
                mailer.end();
                assert.ok(true);
            } catch (e) {
                assert.fail(e.toString());
            }
        });

        it('ok-report_only_ko', async () => {
            try {
                const date = '1970-01-01T00:00:00';
                const app = 'APP';
                const mailer = mailerMock(mailConfig);
                await monitor({
                    serverUrl: HTTP_SERVER,
                    clientUrl: HTTP_CLIENT,
                    appName: app,
                    ...mailConfig,
                    http: httpMock({
                        [`GET ${HTTP_SERVER}/health-check`]: { code: 200, response: { ok: 1 } },
                        [`GET ${HTTP_CLIENT}/`]: { code: 200 }
                    }),
                    https: httpMock({ }),
                    date,
                    mailer
                });
                mailer.end();
                assert.ok(true);
            } catch (e) {
                assert.fail(e.toString());
            }
        });

        it('ok-report_all', async () => {
            try {
                const date = '1970-01-01T00:00:00';
                const app = 'APP';
                const mailer = mailerMock(
                    mailConfig,
                    statusToMailSubject({
                        app, server: 1, client: 1
                    }),
                    statusToStr({
                        app, date, server: 1, client: 1
                    })
                );
                await monitor({
                    serverUrl: HTTP_SERVER,
                    clientUrl: HTTP_CLIENT,
                    reportOnlyKO: false,
                    appName: app,
                    ...mailConfig,
                    http: httpMock({
                        [`GET ${HTTP_SERVER}/health-check`]: { code: 200, response: { ok: true } },
                        [`GET ${HTTP_CLIENT}/`]: { code: 200 }
                    }),
                    https: httpMock({ }),
                    date,
                    mailer
                });
                mailer.end();
                assert.ok(true);
            } catch (e) {
                assert.fail(e.toString());
            }
        });
    });
});
