require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");

const Multimedia = require("./models/Multimedia");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Mongo conectado"))
  .catch(err => console.log(err));

app.use(express.static("public"));

app.use(
  "/uploads",
  express.static(path.join(__dirname, "public/uploads"))
);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

/* CREATE */

app.post(
  "/api/multimedia",
  upload.fields([
    { name: "imagen", maxCount: 1 },
    { name: "audio", maxCount: 1 }
  ]),
  async (req, res) => {

    try {

      const imagenUrl =
        "/uploads/" + req.files.imagen[0].filename;

      const audioUrl =
        "/uploads/" + req.files.audio[0].filename;

      const nuevo = new Multimedia({
        titulo: req.body.titulo,
        descripcion: req.body.descripcion,
        imagenUrl,
        audioUrl
      });

      await nuevo.save();

      res.send("Elemento guardado correctamente");

    } catch (error) {

      console.error(error);

      res.status(500).send(error);

    }
  }
);

/* READ */

app.get("/api/multimedia", async (req, res) => {

  try {

    const datos = await Multimedia.find();

    res.json(datos);

  } catch (error) {

    res.status(500).send(error);

  }
});

/* UPDATE */

app.put("/api/multimedia/:id", async (req, res) => {

  try {

    const actualizado =
      await Multimedia.findByIdAndUpdate(

        req.params.id,

        {
          titulo: req.body.titulo,
          descripcion: req.body.descripcion
        },

        {
          new: true
        }

      );

    res.json(actualizado);

  } catch (error) {

    res.status(500).send(error);

  }
});

/* DELETE */

app.delete("/api/multimedia/:id", async (req, res) => {

  try {

    await Multimedia.findByIdAndDelete(
      req.params.id
    );

    res.send("Elemento eliminado");

  } catch (error) {

    res.status(500).send(error);

  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(
    `Servidor activo en puerto ${PORT}`
  );

});