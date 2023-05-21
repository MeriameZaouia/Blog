const express = require('express');
const router = express.Router();
var path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
var app = require('../app');

const checkAuth = (req, res, next) => {
  try {
    const token = req.cookies.token; // Récupérer le jeton JWT à partir du cookie 'token'

    if (!token) {
      req.isAuthenticated = false; // L'utilisateur n'est pas connecté
      return next();
    }

    const decodedToken = jwt.verify(token, 'votre_secret_key');
    req.userId = decodedToken.userId;
    req.isAuthenticated = true; // L'utilisateur est connecté

    return next();
  } catch (error) {
    req.isAuthenticated = false; // Erreur lors de la vérification du jeton, l'utilisateur n'est pas connecté
    return next();
  }
};




router.get('/',checkAuth, async(req, res) => {
  if (!req.isAuthenticated) {
    res.redirect('/form');
  }
    const articles = await prisma.Article.findMany({
        include: {
          User: true,
          comments: true,
          categories: true,
        },
      });
    res.render('index',{articles})
       
});


router.get('/form',checkAuth, async(req, res) => {
  if (req.isAuthenticated) {
    res.redirect('/');
  }
  const parentDir = path.resolve(__dirname, '..');
  console.log(parentDir)
  const filePath = path.join(parentDir, 'public', 'login.html');
  res.sendFile(filePath);
});
// Route d'inscription
router.post('/signup', checkAuth, async (req, res) => {
  try {
    const { nom, email, password } = req.body;
    // Vérifiez si l'utilisateur existe déjà dans la base de données
    const existingUser = await prisma.Utilisateur.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'L\'utilisateur existe déjà.' });
    }
    // Hachez le mot de passe avant de le stocker dans la base de données
    const hashedPassword = await bcrypt.hash(password, 10);
    // Créez un nouvel utilisateur dans la base de données
    const newUser = await prisma.Utilisateur.create({
      data: {
        nom,
        email,
        password: hashedPassword,
      },
    });
    res.status(201).json({ message: 'Inscription réussie.' });
    res.render('index')
  } catch (error) {
    console.error('Erreur lors de l\'inscription :', error);
    res.status(500).json({ error: 'Erreur lors de l\'inscription.' });
  }
});



// Route de connexion
router.post('/login', checkAuth, async (req, res) => {
  try {
    if (req.isAuthenticated) {
      return res.status(403).json({ error: 'Already logged in' });
    }

    const { email, password } = req.body;

    // Recherchez l'utilisateur dans la base de données
    const user = await prisma.Utilisateur.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Adresse e-mail ou mot de passe incorrect.' });
    }

    // Vérifiez si le mot de passe correspond au mot de passe haché stocké
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Adresse e-mail ou mot de passe incorrect.' });
    }

    // Générez un jeton JWT pour l'utilisateur
    const token = jwt.sign({ userId: user.id }, 'votre_secret_key');
    res.cookie('token', token); // Définir le cookie 'token'

    res.status(200).json({ token: token });
  } catch (error) {
    console.error('Erreur lors de la connexion :', error);
    res.status(500).json({ error: 'Erreur lors de la connexion.' });
  }
});

// Route de déconnexion
router.post('/logout', (req, res) => {
  // Supprimer le jeton JWT côté client (par exemple, en supprimant le cookie ou en effaçant le stockage local)
  res.clearCookie('token'); // Supprime le cookie nommé 'token'
  
  res.json('Déconnexion réussie');
});




module.exports = router;
