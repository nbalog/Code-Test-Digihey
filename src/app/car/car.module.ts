import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { AngularMaterialModule } from "../angular-material.module";
import { TimepickerModule } from "ngx-bootstrap/timepicker";
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";
import { SharedModule } from "../shared.module";
import { CarListComponent } from "./car-list/car-list.component";
import { CarCreateComponent } from "./car-create/car-create.component";
import { CarSearchListComponent } from "./car-search-list/car-search-list.component";

@NgModule({
  declarations: [CarListComponent, CarCreateComponent, CarSearchListComponent],
  imports: [
    CommonModule,
    AngularMaterialModule,
    RouterModule,
    TimepickerModule.forRoot(),
    BsDatepickerModule.forRoot(),
    ReactiveFormsModule,
    FormsModule,
    SharedModule
  ]
})
export class CarModule {}
