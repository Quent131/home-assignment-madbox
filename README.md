# home-assignment-madbox

This repository contains my work for the home assignment for Madbox. The project is using Yarn Workspace. Recommended package manager is `yarn@4.2.2` and recommended node version is `node@20.13.1`

## Installation and setup

### Transcrypt

First of all, you'll need to install [transcypt](https://github.com/elasticdog/transcrypt) to decrypt environment and sensible files. You can directly check out the [INSTALL.MD page](https://github.com/elasticdog/transcrypt/blob/main/INSTALL.md).<br/>
Once this is done, you can run `transcrypt -c aes-256-cbc -p 'password'` where password is the key used to crypt files. I'll send them to Mariana so they are not sotred publicly on Github.

### Docker

_Docker is optional. I used it to run a local instance of MySQL but any MySQL Database is fine, as long as you edit the `.env` file with the correct credentials_<br/>
If you want to use Docker though, you'll have to have it [installed](https://docs.docker.com/engine/install/) as well as [Docker Compose](https://docs.docker.com/compose/install/). <br/>
Go to `backend` folder and run `docker compose up`. It'll start and initialize the database instance.

### Packages

You can then run `yarn install` in both `frontend` and `backend` to generate `node_modules`

### Prisma

I decided to use [Prisma](https://www.prisma.io/) as ORM. To set it up, you'll need to run `yarn prisma migrate deploy`, in the `backend` folder, to deploy the changes to the database. Then you can run `yarn prisma generate` so that Prisma generates types.

### Seeding

Once you installed everything, I prepared a script to seed the database with the file of verbs. To run it, you can run `yarn prisma db seed` in the `backend` folder.

## Starting the application

### Frontend

I used Vite and React for the frontend. To launch it, you can either use `yarn dev` to launch it in dev mode. Otherwise, you can run `yarn build` and open the `index.html` file generated in the `dist` folder.

### Backend

The backend uses express. The same way as the frontend, you can run `yarn dev` to launch it in dev mode, using `ts-node`, or `yarn build` and `yarn start` to transpile the code and launch the compiled files.

## Technical choices

First of all, I decided to go with Yarn Workspaces to handle smoothly the presence of two different projects and the ability to share types across the whole repo. It was easier than using monorepo tools like Nx. I also decided to use Transcrypt to secure env files instead of having to send them through mails.

### Frontend

For the frontend, I chose to go with simple and fast setup so I decided to use React and [Vite](https://vitejs.dev/). <br/>
As I'm used to it, I chose to go with [Mantine](https://mantine.dev/) for component library. It has many good components and its installation is quite simple. <br/>
I chose to use it with [Tailwind](https://tailwindcss.com/), which gave me a few problems, but once the setup was done, everything was working well. <br/>
I used Axios to get the data from the backend, and [TanStack Query](https://tanstack.com/query/latest) to store the data and mutate it. I used TanStack Query because it is super useful, with the DevTool too to visualize the data.

### Backend

As addressed earlier, I chose to use Docker for simple and quick setup of the database, and MySQL for the same reason. Any relational database would have done the job the same way. <br/>
I used Express, as mentionned in the assignment, and would have chosen it for the simplicity and speed of setup. <br />
I also used Prisma because it cames in handy, allows to mutate database according to the schema, allows seeding, which I used to upload the verb file to the database and also the easy setup. The way of querying the databse is also very clear and concise. <br />
As for the tranlation API, two idea quickly came to my mind, which I feel like are the two biggest translation platforms : Google Translation and DeepL/Linguee. I chose [DeepL API](https://www.deepl.com/fr/pro-api) because it was free, had a dedicated SDK and an easy setup (only one API key was requisite to authenticate requests).

## Points of improvement

First and foremost, the thing that could be improved according to me is the translation API. As I mentionned before, I hesitated between DeepL and Google Translate API. I first tried DeepL and quickly realized that some verbs were just not translated because they would be unknown to DeepL. <br/>
I then tried to implement Google Translation API, which is Google Cloud Translation API, but the way Google authenticate requests through the SDK seems too complicated for the time and the efforts I wanted to put on the project. It also required the download of Google Cloud console, another util tools that would complicate the installation process. <br/>
The second improvement would be to store the player data in the backend instead of the frontend. For the same reason as before, I wanted to spare some time and make things faster. It would have required more frontend/backend communication, updating the score in the database after each guess. <br/>
The last improvement which is less important than the first two according to me, is about the way requests carries the whole data. For example I like to play to [SUTOM](https://sutom.nocle.fr/) which is a French clone of Worldle, but if you inspect the data, you can see that the request carries the answer of the word. This is the same in this game, I probably would change that so that frontend sends guess to backend which then compares it to the translation and return whether it is correct or not.

## Time to build

Finally, it took me around half of the weekend to build the project, probably something from 8 to 10 hours.
