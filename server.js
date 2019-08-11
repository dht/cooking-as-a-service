const app = require("express")();
const getTabMiddleware = require("poe-utils/middlewares/tab");
const api = require("poe-utils/baas");
const response = require("poe-utils/middlewares/response");
const firebase = require("poe-utils/firebase");
const config = require("poe-utils/config");
const storage = require("poe-utils/storage-node");
const cors = require("cors");
const http = require("http").Server(app);
const bodyParser = require("body-parser");
const Logic = require("poe-commands").OK;
require("dotenv").config();

config.port = process.env.PORT;
config.domain = process.env.DOMAIN;

const tab = getTabMiddleware("okcupid", Logic, "https://www.okcupid.com");

app.use(cors());
app.use(bodyParser.json());

const start = async () => {
    storage.config("./cookies.json");

    await firebase.init();

    config.port = 4001;

    app.get("/tabs", tab, async (req, res, next) => {
        res.locals.response = await api.getTabs();
        next();
    });

    app.get("/matches", tab, async (req, res, next) => {
        const matches = await res.locals.logic.getMatches();

        res.locals.response = {
            matches,
        };

        next();
    });

    app.get("/matches/more", tab, async (req, res, next) => {
        const matches = await res.locals.logic.moreMatches();

        res.locals.response = {
            matches,
        };

        next();
    });

    app.get("/profile/:id", tab, async (req, res, next) => {
        const { id } = req.params;

        const profile = await res.locals.logic.getProfile(id);

        res.locals.response = {
            profile,
        };

        next();
    });

    app.post("/profile/:id/approve", tab, async (req, res, next) => {
        const { id } = req.params;
        const { message } = req.body;

        const response = await res.locals.logic.like(id, message);

        res.locals.response = {
            ...response,
        };

        next();
    });

    app.post("/profile/:id/pass", tab, async (req, res, next) => {
        const { id } = req.params;

        await res.locals.logic.pass(id);

        res.locals.response = {};

        next();
    });

    app.use(response);

    http.listen(config.portServer, function() {
        const environment = (process.env.STAGE || "").toUpperCase();
        console.log(
            `Connecting to ${environment} listening on port ${
                config.portServer
            }!`,
        );
    });
};

module.exports = start;
