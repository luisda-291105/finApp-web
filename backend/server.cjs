const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

let fuentes = [];

const manejadorPostFuente = (req, res) => {
  const { idFuente, idUsuario, usuario, tipo, contenido, estado, fechaCreacion } = req.body;
  if (!tipo || !contenido) {
    return res.status(400).json({ error: 'tipo y contenido son requeridos' });
  }
  const idUsuarioFinal = idUsuario || (usuario && usuario.idUsuario) || null;
  const nueva = {
    idFuente: idFuente || uuidv4(),
    idUsuario: idUsuarioFinal,
    usuario: idUsuarioFinal ? { idUsuario: idUsuarioFinal } : null,
    tipo,
    contenido,
    estado: estado !== undefined ? estado : true,
    fechaCreacion: fechaCreacion || new Date().toISOString().split('T')[0], // yyyy-mm-dd
  };
  fuentes.push(nueva);
  res.status(201).json(nueva);
};

app.post('/api/fuentes', manejadorPostFuente);
app.post('/fuente', manejadorPostFuente);

const manejadorPutFuente = (req, res) => {
  const { id } = req.params;
  const fuente = fuentes.find(f => f.idFuente === id);
  if (!fuente) return res.status(404).json({ error: 'no encontrada' });
  const { tipo, contenido, estado } = req.body;
  if (tipo !== undefined) fuente.tipo = tipo;
  if (contenido !== undefined) fuente.contenido = contenido;
  if (estado !== undefined) fuente.estado = estado;
  res.json(fuente);
};

app.put('/api/fuentes/:id', manejadorPutFuente);
app.put('/fuente/:id', manejadorPutFuente);

const manejadorGetFuentes = (req, res) => {
  res.json(fuentes);
};

app.get('/api/fuentes', manejadorGetFuentes);
app.get('/fuente', manejadorGetFuentes);

const manejadorGetFuentePorId = (req, res) => {
  const { id } = req.params;
  const fuente = fuentes.find(f => f.idFuente === id);
  if (!fuente) return res.status(404).json({ error: 'no encontrada' });
  res.json(fuente);
};

app.get('/api/fuentes/:id', manejadorGetFuentePorId);
app.get('/fuente/:id', manejadorGetFuentePorId);

const manejadorDeleteFuente = (req, res) => {
  const { id } = req.params;
  const index = fuentes.findIndex(f => f.idFuente === id);
  if (index === -1) return res.status(404).json({ error: 'no encontrada' });
  fuentes.splice(index, 1);
  res.status(204).send();
};

app.delete('/api/fuentes/:id', manejadorDeleteFuente);
app.delete('/fuente/:id', manejadorDeleteFuente);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor mock de fuentes corriendo en puerto ${PORT}`));

