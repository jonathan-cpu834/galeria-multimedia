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
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

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
      res.status(500).send("Error al guardar");
    }
  }
);

app.get("/api/multimedia", async (req, res) => {
  try {
    const datos = await Multimedia.find();
    res.json(datos);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.listen(process.env.PORT, () => {
  console.log("Servidor activo en puerto " + process.env.PORT);
});