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

# seed the database with sample data
$ yarn seed

# serve
$ yarn start

# build for production
$ yarn build
$ yarn start:prod
```

## Docker

```
# build docker image
docker compose build

# start docker image
docker compose up
```

## 📚 Documentation

API documentation is available at [http://0.0.0.0:8083/doc/](http://0.0.0.0:8083/doc/)

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
