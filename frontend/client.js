const express = require('express');

const app = express();
app.use(express.static(`${__dirname}/dist/`));
const port = process.env.PORT || 8080;
app.listen(port);
console.log(`client started ${port}`);
