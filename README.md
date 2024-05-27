<div align="center">
 <img src="https://www.stage.in/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fstage.3f6d9116.png&w=96&q=75&dpl=dpl_8xxerjsQPQUC5kgjLyoj4uaPTAey">
  <h1 align="center">Stage API</h1>
  <hr />
</div>

> Stage API is a REST API that provides the ability to manage a watch list and my list.

## 🚀 Getting Started

> **Important!** Stage API requires Node >= 14, Express >= 4 and TypeScript >= 4.

```batch
# install dependencies
$ yarn install

# copy the env.example file to .env
$ cp .env.example .env

# seed the database with sample data
$ yarn seed

# If you want to seed the watchlist
$ yarn seed --watchlist. (Make sure the database is empty)

# serve
$ yarn start

# run tests
$ yarn test
```

## Docker

```
# build docker image
docker compose build

# start docker image
docker compose up
```

## 📚 Documentation

API documentation is available at [Local](http://0.0.0.0:8083/doc/) [Hosted](https://stage-api-yv6m.onrender.com/doc)

API endpoints are protected with `x-user-id header`. This `x-user-id` can be any user id from mongo db.

Sample Request to add media to watch list

```
curl --location 'http://0.0.0.0:8083/api/watch-list' \
--header 'accept: */*' \
--header 'x-user-id: 66531427fe8602d172d006cd' \
--header 'Content-Type: application/json' \
--data '{
  "mediaId": "66531429fe8602d172d006ec"
}'
```

## 🔨 Design Choices

#### 1. Schema Design

Designing the schema for the watch list comes with two options.

1. **Create a single document and store the media ids in an array.**

   - **Benefits:**
     - Easier to query the watch list.
   - **Downsides:**
     - Not scalable.
     - If the watch list is large, document processing will take more time. Mutating a large array repeatedly degrades performance.
     - Pagination becomes problematic.
     - Sorting based on filters is limited. For example:
       - Sorting by release date requires fetching all media ids and then sorting them.
       - Sorting by genre requires fetching all media ids and then sorting them. This impacts performance negatively.

2. **Create a document for each media item in the collection.**
   - **Benefits:**
     - Scalable.
     - Better performance.
     - Operations are atomic.
   - **Downsides:**
     - More complex to query the watch list.

#### 2. Caching

1. We have a dedicated endpoint for fetching the recently added 10 media items for the home screen.
   This endpoint is cached with a very high ttl value.
   The cache is invalidated and regenerated when a new media item is added on the list. Server will respond blazingly fast ⚡️

   This makes the endpoint super fast to fetch and puts 0 load on the database.

Note:
Assuming multiple instances of application is running , for such scenario our choices for hosted cache service becomes prominent. Hosted cache adds some latency for sure, one way to reduce that is host the cache nearby to the application. Preferably inside vpc.

Note 2: Used redis as hosted cache, this free instance is hosted in us-east region, adding a bit of latency in the final response.

3.  Database Indexing
    Used database indexing to speed up the query performance. Check the schema for more details.

## 🌎 Hosting

1. Backend application is hosted at Render. Render provides integrated CI-CD feature.
   https://stage-api-yv6m.onrender.com

Note: Render spins down the application after 15 minutes of inactivity. The first request might take a long time to respond.
