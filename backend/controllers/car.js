const Car = require("../models/car");

exports.getCars = (req, res, next) => {
    const pageSize = +req.query.pagesize;
    const currentPage = +req.query.page;
    let fetchedCars;
    const carsQuery = Car.aggregate([
      { $sort : { make : -1 }} 
    ]);
    if (pageSize && currentPage) {
      carsQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
    }
    carsQuery
      .then(documents => {
        fetchedCars = documents;
        return Car.count();
      })
      .then(count => {
        res.status(200).json({
          message: "Cars fetched successfully!",
          cars: fetchedCars,
          maxCars: count
        });
      })
      .catch(error => {
        res.status(500).json({
          message: "Fetching cars failed!"
        });
      });
  };

exports.deleteCar = (req, res, next) => {
  Car.deleteOne({ _id: req.params.id })
    .then(result => {
      console.log(result);
      if (result.n > 0) {
        res.status(200).json({ message: "Deletion successful!" });
      } else {
        res.status(401).json({ message: "Not authorized!" });
      }
    })
    .catch(error => {
      res.status(500).json({
        message: "Deleting car failed!"
      });
    });
};

exports.createCar = (req, res, next) => {
  const carsQuery = Car.find();
  carsQuery.then(documents => {
    for(i = 0; i < documents.length; i++) {
      if(documents[i].make == req.body.make && documents[i].model == req.body.model && documents[i].year == req.body.year) {
        return res.status(500).json({
          message: "Duplicate"
        });
      } 
    }
    const car = new Car({
      make: req.body.make,
      model: req.body.model,
      year: req.body.year
    });
    car.save(function(error) {
      if (error) {
        res.send(error);
      } else {
        res.json({ message: 'Car created!'});
      }
    });
  })
}

exports.getFilteredCars = (req, res, next) => {
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const make = req.query.make;
  const year = +req.query.year;
  const model = req.query.model;
  let fetchedCars;
  let foundCars;
  let carsQuery = [];

  /*Search by all*/
  if(make != '' && year != 0 && model != '') {
    carsQuery = Car.aggregate([{
      $match: {
          $or:[
            {year: {$eq: year}, make: {$eq: make}, model: {$eq: model}}
          ]}
    }]);
  }

  /*Year only*/
  else if(make == '' && year != 0 && model == '') {
    carsQuery = Car.aggregate([{
      $match: {
          $or:[
            {year: {$eq: year}}
          ]}
    }]);
  }

  /*Make only*/ 
  else if(make != '' && year == 0 && model == '') {
    carsQuery = Car.aggregate([{
      $match: {
          $or:[
            {make: {$eq: make}}
          ]}
    }]);
  } 

  /*Model only*/
  else if(make == '' && year == 0 && model != '') {
    carsQuery = Car.aggregate([{
      $match: {
          $or:[
            {model: {$eq: model}}
          ]}
    }]);
  }

  /*Make and model*/
  else if(make != '' && year == 0 && model != '') {
    carsQuery = Car.aggregate([{
      $match: {
          $or:[
            {model: {$eq: model}, make: {$eq: make}}
          ]}
    }]);
  } 

  /*Make and year*/
  else if(make != '' && year != 0 && model == '') {
    carsQuery = Car.aggregate([{
      $match: {
          $or:[
            {year: {$eq: year}, make: {$eq: make}}
          ]}
    }]);
  }

  /*Model and year*/
  else if(make == '' && year != 0 && model != '') {
    carsQuery = Car.aggregate([{
      $match: {
          $or:[
            {year: {$eq: year}, model: {$eq: model}}
          ]}
    }]);
  }
  if (pageSize && currentPage) {
    carsQuery.then(found => {
      foundCars = found.length;
      return carsQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
    }).then(documents => {
      fetchedCars = documents 
      return foundCars;
    }).then(count => {
      res.status(200).json({
        message: "Cars fetched successfully!",
        cars: fetchedCars,
        maxCars: count
      });
    }).catch(error => {
      res.status(500).json({
        message: "Fetching cars failed!"
      });
    });;
  }
};

