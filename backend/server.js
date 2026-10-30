const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

let fuentes = [];

app.post('/api/fuentes', (req, res) => {
  const { tipo, contenido } = req.body;
  if (!tipo || !contenido) {
    return res.status(400).json({ error: 'tipo y contenido son requeridos' });
  }
  const nueva = {
    idFuente: uuidv4(),
    tipo,
    contenido,
    estado: true,
    fechaCreacion: new Date().toISOString().split('T')[0], // yyyy-mm-dd
  };
  fuentes.push(nueva);
  res.status(201).json(nueva);
});

app.put('/api/fuentes/:id', (req, res) => {
  const { id } = req.params;
  const fuente = fuentes.find(f => f.idFuente === id);
  if (!fuente) return res.status(404).json({ error: 'no encontrada' });
  const { tipo, contenido, estado } = req.body;
  if (tipo !== undefined) fuente.tipo = tipo;
  if (contenido !== undefined) fuente.contenido = contenido;
  if (estado !== undefined) fuente.estado = estado;
  res.json(fuente);
});

app.get('/api/fuentes', (req, res) => {
  res.json(fuentes);
});

app.get('/api/fuentes/:id', (req, res) => {
  const { id } = req.params;
  const fuente = fuentes.find(f => f.idFuente === id);
  if (!fuente) return res.status(404).json({ error: 'no encontrada' });
  res.json(fuente);
});

app.delete('/api/fuentes/:id', (req, res) => {
  const { id } = req.params;
  const index = fuentes.findIndex(f => f.idFuente === id);
  if (index === -1) return res.status(404).json({ error: 'no encontrada' });
  fuentes.splice(index, 1);
  res.status(204).send();
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor mock de fuentes corriendo en puerto ${PORT}`));

