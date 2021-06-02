import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { PageEvent} from "@angular/material/paginator";
import { Car } from "../car.model";
import { CarService } from "../car.service";
import { AuthService } from "../../auth/auth.service";
import { Subscription } from "rxjs";
import AWN from "awesome-notifications";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";


@Component({
  selector: "app-car-search-list",
  templateUrl: "./car-search-list.component.html",
  styleUrls: ["./car-search-list.component.css"]
})
export class CarSearchListComponent implements OnInit, OnDestroy {
  cars: Car[] = [];
  isLoading = false;
  totalCars = 0;
  carsPerPage = 10;
  currentPage = 1;
  pageSizeOptions = [3, 20, 50, 100];
  userIsAuthenticated = false;
  userId: string;
  private carSub: Subscription;
  private authStatusSub: Subscription;
  notifier = new AWN();
  searchForm: FormGroup;
  make = '';
  model = '';
  year = 0;
  years = [];

  constructor(
    public carService: CarService,
    public route: ActivatedRoute,
    public authService: AuthService,
    private fb: FormBuilder
  ) {
    this.searchForm = this.fb.group({
      makeC: new FormControl(''),
      modelC: new FormControl(''),
      yearC: new FormControl('')
    });
  }

  ngOnInit() {
    this.years = this.generateArrayOfYears();
    this.carService.getCars(this.carsPerPage, this.currentPage);
    this.userId = this.authService.getUserId();
    this.carSub = this.carService
      .getCarUpdateListener()
      .subscribe((carData: { cars: Car[]; carCount: number }) => {
        this.isLoading = false;
        this.totalCars = carData.carCount;
        this.cars = carData.cars;
      });
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated;
      });
  }

  onChangedPage(pageData: PageEvent) {
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.carsPerPage = pageData.pageSize;
    this.carService.getFilteredCars(this.carsPerPage, this.currentPage, this.make, this.model, this.year);
  }

  ngOnDestroy() {
    this.carSub.unsubscribe();
    this.authStatusSub.unsubscribe();
  }

  onSearch() {
    this.isLoading = true;
    this.make = this.searchForm.value.makeC;
    this.model = this.searchForm.value.modelC;
    this.year = this.searchForm.value.yearC;
    console.log(this.year);
    this.carService.getFilteredCars(
      this.carsPerPage, 
      this.currentPage, 
      this.make,
      this.model,
      this.year
    );
    this.userId = this.authService.getUserId();
    this.carSub = this.carService
      .getCarUpdateListener()
      .subscribe((carData: { cars: Car[]; carCount: number }) => {
        this.isLoading = false;
        this.totalCars = carData.carCount;
        this.cars = carData.cars;
      });
  }

  generateArrayOfYears() {
    var max = new Date().getFullYear()
    var min = max - 70
    var years = []

    for (var i = max; i >= min; i--) {
      years.push(i)
    }
    return years
  }
}
