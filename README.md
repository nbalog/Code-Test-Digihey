# Screenshots
## Signup
![Signup](https://github.com/nbalog/Code-Test-Digihey/blob/main/images/digihey-signup.png?raw=true)
## Login
![Login](https://github.com/nbalog/Code-Test-Digihey/blob/main/images/digihey-login.png?raw=true)
## Car list
![Car list](https://github.com/nbalog/Code-Test-Digihey/blob/main/images/digihey-list.png?raw=true)
## Search cars
![Search cars](https://github.com/nbalog/Code-Test-Digihey/blob/main/images/digihey-search.png?raw=true)
## Add car
![Add car](https://github.com/nbalog/Code-Test-Digihey/blob/main/images/digihey-create.png?raw=true)
# Installation
## Install project
``` git clone https://github.com/nbalog/Code-Test-Digihey.git ```
## Install NodeJS and Angular
``` apt-get install nodejs ```  
``` npm install -g @angular/cli ```     
Run ``` npm install" ``` inside this project folder to install all dependencies.

## Install MongoDB 
### Add key
``` curl -fsSL https://www.mongodb.org/static/pgp/server-4.4.asc | sudo apt-key add - ``` 
### Write to sources.list.d
``` echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.4.list ```
### Install MongoDB
``` sudo apt install mongodb-org ```
### Import JSON to MongoDB
``` mongoimport --jsonArray -d DATABASE_NAME --collection cars --file 'PATH TO VehicleInfo.json' ```

# Run
### Start MongoDB on localhost
``` sudo systemctl start mongod.service ```
### Run backend  
``` npm run start:server ```
### Run frontend
``` ng serve ``` 

# Routes
## Public
http://localhost:4200/auth/signup     
http://localhost:4200/auth/login  
http://localhost:4200/listCars  
http://localhost:4200/searchCars  

## Auth
http://localhost:4200/addCar

