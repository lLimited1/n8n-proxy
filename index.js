const express = require('express');
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' }); // Carpeta temporal para los audios

// ¡IMPORTANTE! Reemplaza esto con tu clave de OpenAI
const OPENAI_API_KEY = 'sk-';

app.post('/transcribe', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No se subió ningún archivo.');
  }

  const formData = new FormData();
  formData.append('file', fs.createReadStream(req.file.path), req.file.originalname);
  formData.append('model', 'whisper-1');

  try {
    const config = {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        ...formData.getHeaders()
      }
    };

    const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, config);

    // Limpia el archivo temporal
    fs.unlinkSync(req.file.path);

    res.json(response.data);
  } catch (error) {
    // Limpia el archivo temporal incluso si hay un error
    fs.unlinkSync(req.file.path);

    console.error(error.response ? error.response.data : error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { error: "Error desconocido en el proxy" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy activo en puerto ${PORT}`));
