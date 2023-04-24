const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "moviesData.db");

const app = express();

app.use(express.json());

let dbObject = null;

const initializeDbAndServer = async () => {
  try {
    dbObject = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const convertDbObjectToResponeddirectorobject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getmovieQuery = `SELECT * FROM movie;`;
  const getmovies = await dbObject.all(getmovieQuery);
  response.send(
    getmovies.map((eachmovie) => ({ movieName: eachmovie.movie_name }))
  );
});

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const addmovieQuery = `INSERT INTO movie 
  (director_id,movie_name,lead_actor)
  VALUES
  (${directorId},'${movieName}','${leadActor}');`;

  const addmovie = await dbObject.run(addmovieQuery);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getmovieQuety = `SELECT * FROM movie WHERE movie_id LIKE ${movieId};`;
  const getmovie = await dbObject.get(getmovieQuety);
  response.send(convertDbObjectToResponseObject(getmovie));
});

app.put("/movies/:movieId/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;
  const updateQuery = `UPDATE movie 
     SET 
     director_id=${directorId},
     movie_name='${movieName}',
     lead_actor='${leadActor}'
     WHERE 
     movie_id=${movieId};`;
  await dbObject.run(updateQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deletemovieQuery = `DELETE FROM movie WHERE movie_id=${movieId};`;

  await dbObject.run(deletemovieQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const sqlQuery = `SELECT * FROM director;`;
  const getdirecters = await dbObject.all(sqlQuery);
  response.send(
    getdirecters.map((eachdirecter) =>
      convertDbObjectToResponeddirectorobject(eachdirecter)
    )
  );
});
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getddirectermoviesQuey = `SELECT * FROM movie WHERE director_id='${directorId}'`;
  const getmovies = await dbObject.all(getddirectermoviesQuey);
  response.send(
    getmovies.map((eachmovie) => ({
      movieName: eachmovie.movie_name,
    }))
  );
});

module.exports = app;
