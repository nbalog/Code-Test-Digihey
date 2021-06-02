import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "./auth/auth.guard";
import { CarListComponent } from "./car/car-list/car-list.component";
import { StartPageComponent } from "./pages/start-page/start-page.component";
import { CarCreateComponent} from "./car/car-create/car-create.component";
import { CarSearchListComponent } from "./car/car-search-list/car-search-list.component";

const routes: Routes = [
  { path: "", component: StartPageComponent },
  { path: "auth", loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)},
  { path: "listCars", component:CarListComponent },
  { path: "addCar", component: CarCreateComponent, canActivate: [AuthGuard] },
  { path: "searchCars", component: CarSearchListComponent},
];
@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule {}
