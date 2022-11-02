# Monitor

The script `monitor.js` is a simple cloud function intended for a monitoring
of the chat application status. It does two simple checks:

1. Sends a GET request to the client URL (configured as a param `clientUrl`)
   and checks that a response with the 200 status code is returned.
2. Sends a GET request to `${serverUrl}/health-check` (where `serverUrl` is
   a cloud function parameter) and checks that it gets a JSON response
   containing `{ ok: true }` (and possibly other details).

By default the script writes the status on the starndard output. It can
also send it by e-mail. In that case we must set the CF parameters:
  1. mail - a comma separated list of recipients
  2. mailSender - mail address from which the mail is sent
     IMPORTANT: Currently in production we use SendGrid as a SMTP provider. It
                is necessary to use a sender that is verified (see Single
                Sender Verification in the SendGrid documentation).
  3. smtpHost, smtpPort, smtpUser, smtpPassword - a configuration of the
     outgoing SMTP server

## Test the Script Locally

Copy `.env.template` to `.env`, edit the values and execute:

- `npm run exec:print' for writing the status to the standard output
- `npm run exec:mail` for sending the report by e-mail

## Unit Tests and Coverage

`npm run test`
`npm run coverage`
