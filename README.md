### Getting started

Before getting started on writing code, you need to set up your Node environment. It is also highly recommended that you use VS Code (or another VS code fork such as Cursor) as your IDE.

If you are using a Windows machine, it is highly recommended that you install Windows Subsystem for Linux first before following any of the below steps. To do that, please follow the instructions here:  https://learn.microsoft.com/en-us/windows/wsl/install#install-wsl-command. After this, you can connect your VS code by following this guide: https://code.visualstudio.com/docs/remote/wsl.

#### Setting up Node.js

Node.js is the runtime environment that allows you to run JavaScript code through a terminal so that you do not need to write the code directly into a browser. Node.js has many, many versions and these can get a bit messy to manage. Luckly, some kinds souls have created tools such as **nvm (node version manager)** to make this easier. To get started, install nvm by following the instructions here: https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating. You should only need to run one of the first 2 commands on that page in a terminal to install nvm. Once that is done, **exit the terminal, and start a new one.**

Next, you’re gonna need to install a specific version of node using the newly installed nvm. To do this run **nvm install 24.13.0**. This will install node version 24.13.0. Alongside it, it will install **npm (Node package manager)**. npm is the tool that allows you to manage dependencies for a specific project, and it allows you to run node programs. Once node is installed run the following to make that version the default node version on your machine:

- **nvm use 24.13.0**
- **nvm alias default 24.13.0**

Now you should be ready to run node programs.

**Setting up mysql**

For this project, you will need a local MySQL database to connect to. Please follow one of the following guides to install MySQL Server:

- macOS: https://dev.mysql.com/doc/mysql-installation-excerpt/8.0/en/macos-installation-pkg.html
- Linux: https://dev.mysql.com/doc/mysql-installation-excerpt/8.0/en/linux-installation.html

**Please use V8.0**

It is also recommended that you use MySQL Workbench to interface with the MySQL server: https://dev.mysql.com/downloads/workbench/

I would also recommend that you install the MySQL CLI by following this guide: https://www.bytebase.com/reference/mysql/how-to/how-to-install-mysql-client-on-mac-ubuntu-centos-windows/.

Finally, for the creation of database schema and tracking changes to the database, use knex migrations: https://knexjs.org/guide/migrations.html

#### Setting up the database tables and data
You can download an SQL file containing the schema and 8 patients' worth of data from:
https://zerodash-dev.s3.ccia.org.au/mysqldump.20260302.sql?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=LKZGZ23AGCP8ZG7NR8L4/20260302/au-east-syd/s3/aws4_request&X-Amz-Date=20260302T042228Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=cd497a17817391c82fca96ae0f66f2322ba81c3430037b895c32f43476d92b62

Once you have downloaded it, you can load it to your database like so:
```bash
mysql -h localhost -u root -p < dump.sql
```

#### Setting up your environment
Create a new file called `.env`. Copy over all the secrets found in `.env.example` and update your mysql username and password.

#### Install Dependencies and run ZeroDash
Now you should be able to install the dependencies and run ZeroDash

```bash
git checkout main
npm i # install deps
npm run start:dev:core
```

If you have done everything correctly this command should launch a browser window and take you to http://localhost:3000. If the browser does not open automatically, but you see in the terminal a similar set of URLs where the server is running, you may need to navigate there manually in the browser.
