'use strict';

/**
 * This is a cloud function for the monitoring of the chat-ui application
 */
const nodemailer = require('nodemailer');
const urlParse = require('url');
const httpImplemenation = require('http');
const httpsImplemenation = require('https');

class Monitor {

    /*
    2020-05-10 jan_nemecek@cz.ibm.com - F*CKEN IBM cloud does not support Node 12
    (introduced on 2019-04-23) for cloud functions

    #serverUrl;

    #clientUrl;

    #appName;

    #smtp;

    #mail;

    #reportOnlyKO;

    #timeoutMS;

    #mailer;

    #http;

    #https;

    #stdout;

    #date;
    */

    /**
     * @param {object} params
     * @param {string} params.serverUrl - the monitor sends
     *   request to ${serverUrl}/health-check
     * @param {string} params.clientUrl
     * @param {string} appName - Name of the application to monitor
     * @param {number} timeoutMS [OPTIONAL] - Timeout for http requests
     *   in ms (default 3000)
     * @param {string} params.mail [OPTIONAL] - If this parameter is set,
     *   the report is not written to stdout but mailed to this address
     * @param {string} params.mailSender [OPTIONAL] - From address from which
     *   the e-mail is being sent
     * @param {string} params.smtpHost [OPTIONAL]
     * @param {string} params.smtpPort [OPTIONAL]
     * @param {string} params.smtpUser [OPTIONAL]
     * @param {string} params.smtpPassword [OPTIONAL]
     * @param {boolean} reportOnlyKO [OPTIONAL] - default true
     *
     * Params with default values that may be mocked
     * @param {object} mailer - defaults to nodemailer
     * @param {object} http - defaults to Node.js http
     * @param {object} https - defaults to Node.js https
     * @param {object} stdout - defaults to process.stdout
     * @param {string} date
     */
    constructor (params) {
        this._serverUrl = params.serverUrl;
        this._clientUrl = params.clientUrl;
        this._appName = params.appName;
        this._mail = params.mail;
        this._mailSender = params.mailSender;
        this._reportOnlyKO = params.reportOnlyKO === undefined
            ? true
            : params.reportOnlyKO;
        this._timeoutMS = params.timeoutMS === undefined
            ? 3000
            : params.timeoutMS;
        if (params.smtpUser) {
            const { smtpHost: host, smtpPort: port } = params;
            this._smtp = { host, port };
            const { smtpUser: user, smtpPassword: pass } = params;
            this._smtp.auth = { user, pass };
        }
        this._mailer = params.mailer || nodemailer;
        this._http = params.http || httpImplemenation;
        this._https = params.https || httpsImplemenation;
        this._stdout = params.stdout || process.stdout;
        this._date = params.date || new Date().toISOString().replace(/\..*/, '');
    }

    /**
     * @param {string} url
     * @returns {http|https}
     */
    _getClient (url) {
        return /^https:/.test(url) ? this._https : this._http;
    }

    /**
     * @param {object} res - http request response
     * @param {string} data - raw http response data
     * @returns {any}
     */
    _decodeResponseData (res, data) {
        return /json/.test(res.headers['content-type'])
            ? JSON.parse(data)
            : data;
    }

    /**
     * @param {string} url
     * @returns {Promise<object}}
     */
    _getRequest (url) {
        return new Promise((resolve) => {
            const options = {
                ...urlParse.parse(url),
                method: 'GET'
            };
            const req = this._getClient(url).request(
                options,
                (res) => {
                    let data = '';
                    res.on('data', (chunk) => {
                        data += chunk;
                    });
                    res.on('end', () => {
                        resolve({
                            code: res.statusCode,
                            response: this._decodeResponseData(res, data)
                        });
                    });
                }
            );
            req.setTimeout(
                this._timeoutMS,
                () => req.destroy(`Response not received in ${this._timeoutMS} ms`)
            );
            req.on('error', (e) => resolve({ code: 500, error: e.toString() }));
            req.end();
        });
    }

    /**
     * @returns {object}
     */
    async _getServerStatus () {
        const response = await this._getRequest(`${this._serverUrl}/health-check`);
        return response.code === 200
            ? response.response
            : { ok: false };
    }

    /**
     * @returns {object}
     */
    async _getClientStatus () {
        const response = await this._getRequest(`${this._clientUrl}`);
        return { ok: response.code === 200 };
    }

    /**
     * Returns the application status of the client and the server
     */
    async _getStatus () {
        const [server, client] = await Promise.all([
            this._getServerStatus(),
            this._getClientStatus()
        ]);
        return { server, client };
    }

    /**
     * Converts application status to plain text
     *
     * @param {object} status
     * @returns {string}
     */
    _statusToPlainText (status) {
        const { client, server } = status;
        const ok = client.ok && server.ok;
        let retVal = `${this._appName ? this._appName : 'Application'}`
            + ` ${ok ? 'OK' : 'KO'}\n`
            + `Date: ${this._date}\n`;
        if (!ok) {
            retVal += `Server: ${server.ok ? 'OK' : 'KO'}\n`
                + `Client: ${client.ok ? 'OK' : 'KO'}\n`;
        }
        return retVal;
    }

    /**
     * Converts application status to mail subject
     *
     * @param {object} status
     * @returns {string}
     */
    _statusToMailSubject (status) {
        const { client, server } = status;
        const ok = client.ok && server.ok;
        const retVal = 'CHAT MONITORING:'
            + `${this._appName ? ` ${this._appName}` : ''}`
            + ` ${ok ? 'OK' : 'KO'}`;
        return retVal;
    }

    _getMailer () {
        return this._mailer.createTransport(this._smtp);
    }

    /**
     * @param {object} status - Object with the status information
     */
    async _mailReport (status) {
        const mail = {
            to: this._mail,
            from: this._mailSender,
            subject: this._statusToMailSubject(status),
            text: this._statusToPlainText(status)
        };
        await this._getMailer().sendMail(mail);
    }

    async execute () {
        const status = await this._getStatus();
        if (this._reportOnlyKO && status.server.ok && status.client.ok) {
            return;
        }
        if (this._mail) {
            if (!this._mailSender) {
                throw new Error(
                    'Report to mail required but mailSender not specified!'
                );
            }
            if (!this._smtp) {
                throw new Error(
                    'Report to mail required but SMTP not configured!'
                );
            }
            this._mailReport(status);
        } else {
            this._stdout.write(this._statusToPlainText(status));
        }
    }
}

async function main (params) {
    return new Monitor(params).execute();
}

module.exports = main;
