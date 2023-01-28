var express = require("express");
var router = express.Router();

/* GET done task. */
router.get("/pendientes", function (req, res, next) {
    res.render("pendientes", { title: "Express" });
});

module.exports = router;
