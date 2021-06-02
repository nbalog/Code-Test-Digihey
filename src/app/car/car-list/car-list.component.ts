import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { PageEvent} from "@angular/material/paginator";
import { Car } from "../car.model";
import { CarService } from "../car.service";
import { AuthService } from "../../auth/auth.service";
import { Subscription } from "rxjs";
import AWN from "awesome-notifications";


@Component({
  selector: "app-car-list",
  templateUrl: "./car-list.component.html",
  styleUrls: ["./car-list.component.css"]
})
export class CarListComponent implements OnInit, OnDestroy {
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

  constructor(
    public carService: CarService,
    public route: ActivatedRoute,
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.isLoading = true;
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
    this.carService.getCars(this.carsPerPage, this.currentPage);
  }

  onDelete(carId: string) {
    let onOk = () => {
      this.isLoading = true;
      this.isLoading = true;
      this.carService.deleteCar(carId).subscribe(() => {
        this.notifier.success('Car deleted');
        this.carService.getCars(this.carsPerPage, this.currentPage);
      }, () => {
          this.isLoading = false;
      });
    };
    let onCancel = () => {
      this.isLoading = false;
    };
    this.notifier.confirm(
      'Are you sure you want to delete car?',
      onOk,
      onCancel,
      {
        labels: {
          confirm: 'Dangerous action'
        }
      }
    )
  }

  ngOnDestroy() {
    this.carSub.unsubscribe();
    this.authStatusSub.unsubscribe();
  }
}
