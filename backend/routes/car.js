const express = require("express");
const CarController = require("../controllers/car");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

router.get("/getCars", CarController.getCars);
router.get("/getFilteredCars", CarController.getFilteredCars);
router.delete("/deleteCar/:id", checkAuth, CarController.deleteCar);
router.post("/addCar", checkAuth, CarController.createCar);

module.exports = router;

