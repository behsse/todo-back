const bodyParser = require("body-parser");
const express = require("express");
const mysql = require("mysql");

const app = express();
const http = require("http");
const server = http.createServer(app);

const cors = require("cors");
const port = 8000;

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "todolist",
});

// Connexion à MySQL
connection.connect((err) => {
  if (err) throw err;
  console.log("Connecté à la base de données MySQL");
});

// Middleware pour gérer les requêtes JSON
app.use(bodyParser.json());

// Middleware pour éviter les problèmes de CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// Route pour récupérer les données du front-end et les enregistrer dans MySQL
app.post("/addTodo", (req, res) => {
  console.log(req.body);
  const content = req.body.content;
  const edit = req.body.edit;
  const done = req.body.done;

  const sql = `INSERT INTO todo (content, edit, done) VALUES ( ?, ?, ?)`;
  const values = [content, edit, done];

  connection.query(sql, values, (err, result) => {
    if (err) throw err;
    console.log("Todo ajouté à la base de données");
    connection.query(
      "SELECT * FROM todo order by id desc limit 1",
      (err, result) => {
        if (err) throw err;
        result[0].edit = false;
        result[0].done = false;
        res.send(JSON.stringify(result[0]));
      }
    );
  });
});

// Route pour supprimer un article de la BDD
app.post("/deleteTodo", (req, res) => {
  console.log(req.body);
  const id = req.body.id;
  const sql = `DELETE FROM todo WHERE id=${id}`;
  connection.query(sql, (err, result) => {
    if (err) throw err;
    console.log("Article supprimé de la base de données");
    res.send(JSON.stringify("Article supprimé de la base de données"));
  });
});

// route pour récupérer les données de la BDD et les envoyer sur le front
app.get("/getTodos", (req, res) => {
  const sql = `SELECT * FROM todo`;
  connection.query(sql, (err, result) => {
    if (err) throw err;
    console.log("Liste de todos récupérée");
    result.map(
      (r) => (
        r.edit == "0" ? (r.edit = false) : (r.edit = true),
        r.done == "0" ? (r.done = false) : (r.done = true)
      )
    );
    res.send(JSON.stringify(result));
  });
});

app.post("/modifyTodo", (req, res) => {
  console.log(req.body);
  const edit = req.body.edit === true ? "1" : "0";
  const done = req.body.done === true ? "1" : "0";
  const content = req.body.content;
  const id = req.body.id;

  const sql = `UPDATE todo SET content ="${content}", done ="${done}",
      edit ="${edit}" WHERE id = ${id}`;

  connection.query(sql, (err, result) => {
    if (err) throw err;
    console.log("Todo modifié en base de données");
    connection.query(`SELECT * FROM todo WHERE id=${id}`, (err, result) => {
      if (err) throw err;
      console.log(result);
      result[0].edit == 0 ? (result[0].edit = false) : (result[0].edit = true);
      result[0].done == 0 ? (result[0].done = false) : (result[0].done = true);
      res.send(JSON.stringify(result[0]));
    });
  });
});

// Lancement du serveur Node.js
app.listen(port, () => {
  console.log(`Serveur Node.js écoutant sur le port ${port}`);
});
