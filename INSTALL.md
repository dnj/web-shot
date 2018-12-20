# Requirements

### Nodejs
To install nodejs on ubuntu please run these commands as su:
```
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
apt install -y nodejs
```
### Build Essentials
This command install gcc g++ and some other tools to compile sharp in case it needed.
```
apt install -y build-essential
```

### Chrome requirements
Just install theses dependencies:
```
apt install gconf-service libx11-xcb1 libx11-6 libasound2 libatk1.0-0 libatk-bridge2.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libatk1.0-0 libatk-bridge2.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1  libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils
```

### Mysql
For managing data, Web-shot need Mysql which you can install simply by running this command:
```
apt install mysql-server
```

Or alternatily you can install Mariadb:
```
apt install mariadb-server
```

After successfull install of ethier packages, you could set a root password for your DBMS by running:
```
mysql_secure_installation
```

This process may ask you some questions about root access or test table which you should answer according to your needs.

# Install
You should clone the project from git to a user home directory:
```
git clone https://git.jeyserver.com/yeganemehr/web-shot.git app
```

After successfull deploy, also you need to install npm packages and compile some of them by running:
```
npm install
```

# Database
Please create a database (and also new user) and import database.sql located in `app` directory.
Set database credentials on `src/App.ts`:

```js
App.databaseManager = new DatabaseManager({
	host: "127.0.0.1",
	username: "YOUR_USER",
	password: "PASSWORD",
	database: "DATABASE_NAME",
	charset: "utf8mb4",
});
```

# Configuration
There is a number of options you can insert / modify on `options` table:
* `http_hostname` (string) is your domain which host your project.
* `http_port` (uint16) is port of built-in http server. (Default: 80)
* `puppeteer_args` (string[]) is options which sent to [puppter](https://github.com/GoogleChrome/puppeteer) for starting bundle chrome. If you want to run this by root user (which is very dangeruies) you should set it to `["--no-sandbox", "--disable-setuid-sandbox"]`.
* `puppeteer_headless` (boolean) make chrome headless by setting it to `false`. (Default: false)
* `puppeteer_max_pages` limit for max opened tabs on chrome. new requests should wait. (Default: 20, 0 = No Limit)
* `puppeteer_new_page_timeout` timeout for creating a new tab on chrome. (Default: 10, 0 = No timeout)
* `process_group` (string|int) new group of process after listen http server port.
* `process_user` (string|int) new user of process after listen http server port.
* `ssl` (object) a JSON string with `key` and `cert` file name parameters. Also you can use `port` (uint16) for non-standard port listening and `redirect` (default: true) cause client automaticlly redirected to https.
# Compilation
You need to compile server-side by running typescript compiler:
```
./node_modules/.bin/tsc
```

# Run as a Service
for running process in background and permently you should introduce a service to OS which kept app alive.
So first create a service file:
```
nano /etc/systemd/system/web-shot.service
```
Copy/paste the following into the file
```
[Unit]
Description=Web-shot WebApp Service

[Service]
WorkingDirectory=/home/web-shot/app/dist # PATH TO dist IN APP DIRECTORY
ExecStart=/usr/bin/node Run.js
TimeoutStopSec=10
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

reload service manager:
```
systemctl daemon-reload
```

mark our service to run in bootup process:
```
systemctl enable web-shot.service
```

and finally run the service:
```
systemctl start web-shot.service
```
you can always check status of service by running:

```
systemctl status web-shot.service
```