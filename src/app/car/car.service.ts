import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Subject, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Router } from "@angular/router";
import { environment } from "../../environments/environment";
import { Car } from "./car.model";

const BACKEND_URL = environment.apiUrl + "/car/";

@Injectable({ providedIn: "root" })
export class CarService {
  private cars: Car[] = [];
  private carsUpdated = new Subject<{ cars: Car[]; carCount: number }>();
  private carStatusListener = new Subject<boolean>();

  constructor(private http: HttpClient) {}

  getCars(carsPerPage: number, currentPage: number) {
    const queryParams = `?pagesize=${carsPerPage}&page=${currentPage}`;
    this.http
      .get<{ message: string; cars: any; maxCars: number }>(
        BACKEND_URL + "getCars/" + queryParams
      )
      .pipe(
        map(carData => {
          return {
            cars: carData.cars.map(car => {
              return {
                make: car.make,
                model: car.model,
                year: car.year,
                id: car._id
              };
            }),
            maxCars: carData.maxCars
          };
        })
      )
      .subscribe(transformedCarData => {
        this.cars = transformedCarData.cars;
        this.carsUpdated.next({
          cars: [...this.cars],
          carCount: transformedCarData.maxCars
        });
      });
  }

  getFilteredCars(carsPerPage: number, currentPage: number, make: string, model: string, year: number) {
    const queryParams = `?pagesize=${carsPerPage}&page=${currentPage}&make=${make}&model=${model}&year=${year}`;
    this.http
      .get<{ message: string; cars: any; maxCars: number }>(
        BACKEND_URL + "getFilteredCars/" + queryParams
      )
      .pipe(
        map(carData => {
          return {
            cars: carData.cars.map(car => {
              return {
                make: car.make,
                model: car.model,
                year: car.year,
                id: car._id
              };
            }),
            maxCars: carData.maxCars
          };
        })
      )
      .subscribe(transformedCarData => {
        this.cars = transformedCarData.cars;
        this.carsUpdated.next({
          cars: [...this.cars],
          carCount: transformedCarData.maxCars
        });
      });
  }

  getCarUpdateListener() {
    return this.carsUpdated.asObservable();
  }

  getCarStatusListener() {
    return this.carStatusListener.asObservable();
  }

  deleteCar(carId: string) {
    return this.http.delete(BACKEND_URL + "deleteCar/" + carId);
  }

  addCar(make: string, model: string, year: number) {
    const car: Car = {
      make: make,
      model: model,
      year: year
    }
    return this.http.post(BACKEND_URL + "addCar/", car);
  }
}
