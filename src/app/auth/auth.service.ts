import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { Subject } from "rxjs";
import { environment } from "../../environments/environment";
import AWN from "awesome-notifications";


const BACKEND_URL = environment.apiUrl + "/user/";

@Injectable({ providedIn: "root" })
export class AuthService {
  private isAuthenticated = false;
  private token: string;
  private userId: string;
  private authStatusListener = new Subject<boolean>();
  notifier = new AWN();

  constructor(private http: HttpClient, private router: Router) {}

  getToken() {
    return this.token;
  }

  getIsAuth() {
    return this.isAuthenticated;
  }

  getUserId() {
    return this.userId;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  createUser(email: string, password: string) {
    const user = {
      email: email,
      password: password
    };
    return this.http.post(BACKEND_URL + "signup", user);
  }

  login(email: string, password: string) {
    const loginData = { email: email, password: password };
    this.http
      .post<{ token: string; userId: string; }>(
        BACKEND_URL + "/login",
        loginData
      )
      .subscribe(
        response => {
          const token = response.token;
          this.token = token;
          if (token) {
            this.isAuthenticated = true;
            this.userId = response.userId;
            this.authStatusListener.next(true);
            this.saveAuthData(token, this.userId);
            this.router.navigate(["/"]);
          }
        },
        error => {
          this.authStatusListener.next(false);
        }
      );
  }

  public getUser(userId: string) {
    return this.http.get<{
      _id: string;
      registrationStep: number;
      email: string;
      userType: string;
      isAdmin: boolean;
      isEmailVerified: boolean;
      isProfileCompleted: boolean;
      isTelephoneVerified: boolean;
      dialCode: string;
      telephone: string;
      companyName: string;
      address: string;
      city: string;
      country: string;
      postalCode: string;
    }>(BACKEND_URL+"getUserData/" + userId);
  }

  autoAuthUser() {
    const authInformation = this.getAuthData();
    if (!authInformation) {
      return;
    }
    this.token = authInformation.token;
    this.isAuthenticated = true;
    this.userId = authInformation.userId;
    this.authStatusListener.next(true);
  }

  logout() {
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    this.userId = null;
    this.clearAuthData();
    this.router.navigate(["/"]);
  }

  private saveAuthData(token: string, userId: string) {
    localStorage.setItem("token", token);
    localStorage.setItem("userId", userId);
  }

  private clearAuthData() {
    localStorage.removeItem("token");
    localStorage.removeItem("expiration");
    localStorage.removeItem("userId");
  }

  private getAuthData() {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    if (!token) {
      return;
    }
    return {
      token: token,
      userId: userId
    };
  }
}
