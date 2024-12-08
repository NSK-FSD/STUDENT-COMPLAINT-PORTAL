const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

let complaints = [];
let users = [];

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your-email@gmail.com', // Replace with your Gmail address
        pass: 'your-password' // Replace with your Gmail password or app-specific password
    }
});

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

app.post('/api/signup', async (req, res) => {
    try {
        const { name, email, password, department } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = { name, email, password: hashedPassword, department };
        users.push(user);
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error creating user' });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ email: user.email, name: user.name, department: user.department }, JWT_SECRET);
        res.json({ token });
    } else {
        res.status(400).json({ message: 'Invalid email or password' });
    }
});

app.get('/api/user', authenticateToken, (req, res) => {
    res.json(req.user);
});

app.post('/api/complaints', authenticateToken, (req, res) => {
    const { name, email, department, complaint, headOfDepartmentEmail } = req.body;
    
    // Store the complaint
    complaints.push({ name, email, department, complaint });

    // Send email to the head of department
    const mailOptions = {
        from: 'your-email@gmail.com',
        to: headOfDepartmentEmail,
        subject: `New Complaint from ${name}`,
        text: `
            Name: ${name}
            Email: ${email}
            Department: ${department}
            Complaint: ${complaint}
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.status(500).json({ message: 'Error sending email' });
        } else {
            console.log('Email sent: ' + info.response);
            res.status(201).json({ message: 'Complaint submitted successfully' });
        }
    });
});

app.get('/api/complaints', authenticateToken, (req, res) => {
    res.json(complaints);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
