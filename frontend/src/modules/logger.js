export default class Logger {
    static debug(text) {
        console.debug(text)
    }

    static trace(text) {
        console.trace(text);
    }

    static log(text) {
        console.log(text)
    }

    static info(text) {
        console.info(text)
    }

    static warn(text) {
        console.warn(text)
    }

    static error(text) {
        console.error(text)
    }
}
