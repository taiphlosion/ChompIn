# Backend Setup for Development

## Prerequisites
Make sure you have the following installed on your system:
- [Docker](https://www.docker.com/get-started)
- [Node.js](https://nodejs.org/)

## Setup Instructions

1. Install dependencies:
```sh
npm i
```
2. Start the database and services using Docker:
```sh
docker-compose up -d
```
4. Verify that the database is running by connecting to it:
```sh
docker exec -it chompin-db psql -U admin -d chompin
```
5. Start the backend server:
```sh
npm start
```
## Prerequisites
Once you're done with your session, shut down the Docker container:
```sh
docker-compose down
```
This cleans the development environment for next session. 
