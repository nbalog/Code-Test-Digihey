import { Component, OnInit, OnDestroy} from "@angular/core";
import { NgForm,FormGroup, FormControl, FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import { AuthService } from "../auth.service";
import { Router } from "@angular/router";
import AWN from "awesome-notifications";

@Component({
  templateUrl: "./signup.component.html",
  styleUrls: ["./signup.component.css"]
})
export class SignupComponent implements OnInit, OnDestroy {
  isLoading = false;
  private authStatusSub: Subscription;
  submitted = false;
  notifier = new AWN();
  signupForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
    confirmPassword: new FormControl('', Validators.required)
  });

  constructor(private fb:FormBuilder, public authService: AuthService, private router: Router, private activatedRoute: ActivatedRoute) {

  }

  ngOnInit() {
    this.authStatusSub = this.authService.getAuthStatusListener().subscribe(
      authStatus => {
        this.isLoading = false;
      }
    );
  }

  onSignup() {
    this.submitted = true;
    if (this.signupForm.invalid) {
      return;
    }
    this.isLoading = true;
    this.authService.createUser(this.signupForm.value.email, this.signupForm.value.password).subscribe(()=> {
      this.isLoading = false;
      this.notifier.success('Activation email sent');
    })
  }

  get f() {
    return this.signupForm.controls;
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }
}
