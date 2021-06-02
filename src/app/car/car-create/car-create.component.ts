import { Component, OnInit, OnDestroy } from "@angular/core";
import { FormGroup, FormControl, Validators, FormBuilder, FormArray } from "@angular/forms";
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { CarService } from "../car.service";
import { Car} from "../car.model";
import { AuthService } from "../../auth/auth.service";
import AWN from "awesome-notifications";

@Component({
  selector: "app-cargo-create",
  templateUrl: "./car-create.component.html",
  styleUrls: ["./car-create.component.css"]
})
export class CarCreateComponent implements OnInit, OnDestroy {
  car: Car;
  isLoading = false;
  carForm: FormGroup;
  private authStatusSub: Subscription;
  submitted = false;
  notifier = new AWN();

  constructor(
    public carService: CarService,
    public route: ActivatedRoute,
    private authService: AuthService,
    private fb:FormBuilder,
    private router: Router
  ) {
    this.carForm= new FormGroup({
      make: new FormControl('', Validators.required),
      model: new FormControl('', Validators.required),
      year: new FormControl('', Validators.required)
    });
  }

  ngOnInit() {
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(authStatus => {
        this.isLoading = false;
      });
  }


  onSaveCar() {
    this.submitted = true;
    if (this.carForm.invalid) {
      return;
    }
    this.isLoading = true;
    this.carService.addCar(
      this.carForm.value.make,
      this.carForm.value.model,
      this.carForm.value.year,
    ).subscribe(()=> {
      this.router.navigate(["/listCars"]);
      this.notifier.success('Car added to DB');
    },
    (error) => {
      this.isLoading = false; 
    });
  }

  get f() {
    return this.carForm.controls;
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }
}
