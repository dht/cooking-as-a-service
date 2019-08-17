const app = require("express")();
const response = require("poe-utils/middlewares/response");
const query = require("poe-utils/middlewares/query");
const cors = require("cors");
const Fetch = require("poe-utils/fetch-node");
const config = require("poe-utils/config");
const delay = require("poe-utils/delay").delay;
const http = require("http").Server(app);
const bodyParser = require("body-parser");
const startServer = require("./server");
const parser = require("./facade.parser");

config.port = process.env.PORT;
config.domain = process.env.DOMAIN;

const fetch = Fetch.init(config.serverUrl).fetch;

app.use(cors());
app.use(bodyParser.json());

const urlWithQuery = (path, res) => {
    return `${path}?${res.locals.query}`;
};

const startFacade = async () => {
    app.get("/tabs", query, async (req, res, next) => {
        const url = urlWithQuery("/tabs", res);
        console.log("url -> ", url);
        res.locals.response = await fetch(url);
        next();
    });

    app.get("/items", query, async (req, res, next) => {
        const url = urlWithQuery("/recipes", res);

        console.log("items -> ", true);

        let result = await fetch(url);
        const { recipes } = result || {};

        res.locals.response = {
            success: result.success,
            items: parser.parseRecipes(recipes),
        };

        next();
    });

    app.get("/one/:id", query, async (req, res, next) => {
        console.log("one/:id -> ", true);

        const { id } = req.params;
        const url = urlWithQuery(`/recipes/${id}`, res);
        let result = await fetch(url);
        const { recipe } = result;

        const success = result.success && typeof recipe === "object";

        res.locals.response = {
            success,
            item: parser.parseRecipe(recipe || {}),
        };

        next();
    });

    app.use(response);

    http.listen(config.portFacade, function() {
        const environment = (process.env.STAGE || "").toUpperCase();
        console.log(
            `Connecting to ${environment} listening on port ${
                config.portFacade
            }!`,
        );
    });
};

startServer();
startFacade();
