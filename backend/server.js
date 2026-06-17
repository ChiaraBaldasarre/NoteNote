require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Conexión a MySQL - PRIMERO PROBAR SIN authPlugins
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: process.env.DB_PASSWORD,
  database: 'notenote_db'
});

// CONEXIÓN ALTERNATIVA (descomentar si la anterior falla)
/*
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'notenote_db',
  authPlugins: {
    mysql_clear_password: () => () => Buffer.from('', 'utf-8')
  }
});
*/

// Probar conexión a MySQL
connection.connect((err) => {
  if (err) {
    console.error('❌ Error de conexión a MySQL:', err.message);
    
    // Manejo de errores específicos
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('🔐 Error de autenticación');
      console.log('💡 Prueba descomentar la conexión alternativa con authPlugins');
    
    } else if (err.code === 'ER_BAD_DB_ERROR') {
      console.log('📊 La base de datos "notenote_db" no existe');
      console.log('💡 Ejecuta en MySQL Workbench:');
      console.log('   CREATE DATABASE notenote_db;');
      console.log('   USE notenote_db;');
    
    } else if (err.code === 'ECONNREFUSED') {
      console.log('🚫 MySQL no está corriendo');
      console.log('💡 Inicia el servicio MySQL desde XAMPP o Services');
    }
    return;
  }
  
  console.log('✅ Conectado a MySQL correctamente');
  console.log('📊 Base de datos:', connection.config.database);
  
});

// ==================== RUTAS DE LA API ====================

// Obtener todas las notas
app.get('/api/notas', (req, res) => {
  connection.query('SELECT * FROM notas ORDER BY fecha_creacion DESC', (error, results) => {
    if (error) {
      console.error('❌ Error en GET /api/notas:', error.message);
      res.status(500).json({ error: 'Error interno del servidor' });
      return;
    }
    console.log(`📋 Enviando ${results.length} notas al cliente`);
    res.json(results);
  });
});

// Obtener una nota por ID
app.get('/api/notas/:id', (req, res) => {
  const { id } = req.params;
  console.log(`🔍 Buscando nota con ID: ${id}`);
  
  connection.query('SELECT * FROM notas WHERE id = ?', [id], (error, results) => {
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    if (results.length === 0) {
      res.status(404).json({ error: 'Nota no encontrada' });
      return;
    }
    res.json(results[0]);
  });
});

// Crear nueva nota
app.post('/api/notas', (req, res) => {
  const { id, texto, color } = req.body;
  console.log(`➕ Creando nueva nota: ${texto.substring(0, 30)}...`);
  
  if (!id || !texto) {
    res.status(400).json({ error: 'ID y texto son requeridos' });
    return;
  }

  connection.query(
    'INSERT INTO notas (id, texto, color) VALUES (?, ?, ?)',
    [id, texto, color || '#FFF59D'],
    (error, results) => {
      if (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          res.status(409).json({ error: 'Ya existe una nota con este ID' });
        } else {
          res.status(500).json({ error: error.message });
        }
        return;
      }
      console.log('✅ Nota creada exitosamente');
      res.json({ id, texto, color: color || '#FFF59D' });
    }
  );
});

// Actualizar nota existente
app.put('/api/notas/:id', (req, res) => {
  const { id } = req.params;
  const { texto, color } = req.body;
  console.log(`✏️ Actualizando nota ID: ${id}`);

  connection.query(
    'UPDATE notas SET texto = ?, color = ? WHERE id = ?',
    [texto, color, id],
    (error, results) => {
      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }
      if (results.affectedRows === 0) {
        res.status(404).json({ error: 'Nota no encontrada' });
        return;
      }
      console.log('✅ Nota actualizada exitosamente');
      res.json({ id, texto, color });
    }
  );
});

// Eliminar nota
app.delete('/api/notas/:id', (req, res) => {
  const { id } = req.params;
  console.log(`🗑️ Eliminando nota ID: ${id}`);

  connection.query('DELETE FROM notas WHERE id = ?', [id], (error, results) => {
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    if (results.affectedRows === 0) {
      res.status(404).json({ error: 'Nota no encontrada' });
      return;
    }
    console.log('✅ Nota eliminada exitosamente');
    res.json({ message: 'Nota eliminada correctamente' });
  });
});

// Ruta de prueba e información
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 Servidor NoteNote funcionando correctamente!',
    database: {
      host: connection.config.host,
      database: connection.config.database,
      user: connection.config.user,
      status: 'Conectado'
    },
    endpoints: {
      'GET /api/notas': 'Obtener todas las notas',
      'POST /api/notas': 'Crear nueva nota (body: {id, texto, color})',
      'PUT /api/notas/:id': 'Actualizar nota',
      'DELETE /api/notas/:id': 'Eliminar nota'
    },
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/health', (req, res) => {
  connection.query('SELECT 1', (error) => {
    if (error) {
      res.status(500).json({ status: 'ERROR', database: 'Desconectado' });
      return;
    }
    res.json({ status: 'OK', database: 'Conectado' });
  });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    available_routes: ['GET /', '/health', '/api/notas', '/api/notas/:id']
  });
});

// Manejo de errores global
app.use((error, req, res, next) => {
  console.error('💥 Error no manejado:', error);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log('\n✨ ====================================== ✨');
  console.log('🚀 Servidor NoteNote INICIADO CORRECTAMENTE');
  console.log('✨ ====================================== ✨');
  console.log(`📍 URL Local: http://localhost:${PORT}`);
  console.log(`📍 URL Red: http://[TU_IP_LOCAL]:${PORT}`);
  console.log(`📊 MySQL: ${connection.config.host}:3306/${connection.config.database}`);
  console.log(`👤 Usuario: ${connection.config.user}`);
  console.log(`🔧 Modo: ${process.env.NODE_ENV || 'development'}`);
  console.log('✨ ====================================== ✨\n');
  
  console.log('📋 Endpoints disponibles:');
  console.log('   GET  /              - Información del servidor');
  console.log('   GET  /health        - Estado de la base de datos');
  console.log('   GET  /api/notas     - Obtener todas las notas');
  console.log('   POST /api/notas     - Crear nueva nota');
  console.log('   PUT  /api/notas/:id - Actualizar nota');
  console.log('   DELETE /api/notas/:id - Eliminar nota\n');
});

// Manejo graceful de cierre
process.on('SIGINT', () => {
  console.log('\n🛑 Cerrando servidor...');
  connection.end();
  process.exit(0);
});