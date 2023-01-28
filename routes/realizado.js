var express = require("express");
var router = express.Router();

/* GET done task. */
router.get("/realizado", function (req, res, next) {
    res.render("realizado", { title: "Express" });
});

module.exports = router;
