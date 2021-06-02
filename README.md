# Screenshots
## Signup
![Create movie](https://github.com/nbalog/Code-Test-Digihey/blob/main/images/digihey-signup.png?raw=true)
## List movies
![Get movies](https://github.com/nbalog/MEAN-form-example/blob/main/images/get-movies.png?raw=true)
# Installation
## Install project
``` git clone https://github.com/nbalog/MEAN-form-example.git ```
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

# Run
### Start MongoDB on localhost
``` sudo systemctl start mongod.service ```
### Run backend  
``` npm run start:server ```
### Run frontend
``` ng serve ``` 

# Routes
http://localhost:4200/createMovie    
http://localhost:4200/getMovies   
