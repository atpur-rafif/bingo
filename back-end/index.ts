import livereload from "livereload"
import connectLivereload from "connect-livereload"
import path from "path";
import express from "express";

const liveReloadServer = livereload.createServer();
liveReloadServer.watch(path.join(__dirname, './static'));

const app = express();
app.use(connectLivereload());
app.use(express.static("./dist/static"))

app.listen(8080)