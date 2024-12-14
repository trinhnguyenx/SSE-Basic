const express = require('express');
const app = express();
const cors = require('cors');
const mysql = require('mysql2');


app.use(express.json());
app.use(cors());  

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',        
    password: 'Trinh1406@',        
    database: 'mydb',     
    port: 3306  
  });

  db.connect((err) => {
    if (err) {
      console.error('Error connecting to MySQL:', err);
      return;
    }
    console.log('Connected to MySQL database');
  });

app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  const sendUpdate = () => {
    db.query('SELECT * FROM tasks', (err, results) => {
      if (err) {
        console.error('Error fetching tasks:', err);
        return;
      }
      res.write(`data: ${JSON.stringify(results)}\n\n`);
    });
  };

  sendUpdate(); 
  const interval = setInterval(sendUpdate, 2000); 

  req.on('close', () => {   
    clearInterval(interval);
  });
});

app.post('/update-task', (req, res) => {
  const { taskId, status } = req.body;

  db.query(
    'UPDATE tasks SET status = ? WHERE id = ?',
    [status, taskId],
    (err, results) => {
      if (err) {
        console.error('Error updating task:', err);
        res.status(500).json({ message: 'Error updating task' });
        return;
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'Task not found' });
      }

      res.json({ message: 'Task updated successfully' });
    }
  );
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
