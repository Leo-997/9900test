# Set Up
## Setup your environment variables
1. Copy the example file using the following command ```shell script cp .env.example .env```
2. Update the example file according to your DB settings/credentials
## Install Packages
```npm install```

# Usage
## Linting
### Lint without AutoFix
```npm run lint```

### Lint with AutoFix
```npm run lint:fix```

## Run Dev
```npm run start:dev```

## Build and Run Prod
1. ```npm run build```
2. ```npm run start```

# Framework
[Nest](https://nestjs.com/) Framework was used. Documentation can be found [here](https://docs.nestjs.com/)

# Database Migrations 
## Documentation
Migration documentation for knex query builder can be found [here](http://knexjs.org/#Migrations)
## Usage
### 1. Migrations
Used to make changes to the database schema
#### Create Migration
```npm run migrate:make -- <migration_name>```
#### Run any migrations not run yet
```npm run migrate:latest```

### 2. Seeds
Add data into the database tables. Mainly used for initial data

#### Create Seed File
Try to number imports in order they should be run
```npm run seed:make -- <seed_name>```

#### Run Seed file
```npm run seed:run -- --specific=<seed_file_name_to_run>```

# Project Structure
```
database
└── migrations
└── seeds
dist
node_modules
src
└── Clients
└── Config
└── Controllers
└── Decorators
└── Errors
└── Filters
└── Guards
└── Models
└── Modules
└── Services
└── Utilities
└── Validators
└── main.ts
```