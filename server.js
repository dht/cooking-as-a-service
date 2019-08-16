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
const Logic = require("poe-commands").EG;
require("dotenv").config();

config.port = process.env.PORT;
config.domain = process.env.DOMAIN;

const tab = getTabMiddleware("eat88", Logic, "http://localhost:3088");

app.use(cors());
app.use(bodyParser.json());

const start = async () => {
    storage.config("./cookies.json");

    await firebase.init();

    app.get("/tabs", tab, async (req, res, next) => {
        res.locals.response = await api.getTabs();
        next();
    });

    app.get("/recipes", tab, async (req, res, next) => {
        console.log("recipes -> ", true);

        const recipes = await res.locals.logic.getRecipes();

        res.locals.response = {
            recipes,
        };

        next();
    });

    app.get("/recipes/:id", tab, async (req, res, next) => {
        console.log("recipe/:id -> ", true);

        const { id } = req.params;

        const recipe = await res.locals.logic.getRecipe(id);

        res.locals.response = {
            recipe,
        };

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
