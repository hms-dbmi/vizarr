## Feedback and Contribution

Thanks for your interest in `vizarr`! I welcome any input, feedback, bug reports, and contributions. 
Please do not hesitate to reach out if you have any questions!

### Setting up a development environment

In order to make changes to `vizarr`, you will need to fork the repository. Clone your fork
of the repository to your local machine and change directories:

```bash
git clone https://github.com/your-username/vizarr.git
cd vizarr
``` 

Set the `upstream` remote to the base `vizarr` repository:

```bash
git remote add upstream https://github.com/hms-dbmi/vizarr.git
```

Install the dependencies to develop and build `vizarr` via `npm`. 

```bash
npm install 
```

> Note: You need to have [Node.js](https://nodejs.org/en/) (v15.0 or later) to build
> and develop `vizarr`. I recommend using [`nvm`](https://github.com/nvm-sh/nvm) or 
> [`fnm`](https://github.com/Schniz/fnm) to manage different version of Node.js
> on your machine.

### Running the development server

```bash
npm start
```

The `start` command will start a development server on `http://localhost:8080` which you can navigate
to in your web browser. You can "live" edit the contents of any of the files within `src/` or `public/`
when running this server; changes are reflected instantly in the browser. Stop the development 
server when you are done making changes.

- `src/` - contains all TypeScript source code
- `public/` - contains all static assets required for the site

Have a look at the other `script` commands in `package.json` for the project. These are standard to any JS
build and can be executed by running `npm run <command>`.

### Making changes

Create a new feature branch:

```bash
git checkout master -b your-feature-branch-name
```

Add and commit your changed files.

### Sharing your changes

Update your remote branch:

```bash
git push -u origin your-feature-branch-name
```

You can then make a pull-request to `vizarr`'s `master` branch. When making a pull-request, 
your code will be checked for linting with `prettier`. Please run `npm run format`
to automatically format your code when making a pull-request. 


### (Note to self) Building and publishing `vizarr`

Build a production version of the site:

```bash
npm version [<new version> | major | minor | patch]
npm publish
```

