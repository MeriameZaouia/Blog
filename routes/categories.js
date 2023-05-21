const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { AddCategorie,GetCategorie,GetCategories,DeleteCategorie,UpdateCategorie, } = require('../models/Categories.js')
const jwt = require('jsonwebtoken');
var app = require('../app');







router.get('/', (req, res) => {
  GetCategories(req.query.take,req.query.skip)
    .then(Categories => res.json(Categories))
    .catch(err => {
      console.error(err)
      res.send('Erreur!!!!!!!!!!!!')
    })
});


router.get('/:id', async (req, res) => {
  try {
    const Categorie = await GetCategorie(+req.params.id);
    if (Categorie) {
      res.send(Categorie);
    } else {
      res.status(404).send('Categorie not found');
    }
  } catch (err) {
    console.error(err)
    res.send('Erreur!!!!!!!!!!!!!!!!!!!!!!');
  }
});


const checkAuth = (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      req.isAuthenticated = false;
      return next();
    }

    const decodedToken = jwt.verify(token, 'votre_secret_key');
    req.userId = decodedToken.userId;
    req.isAuthenticated = true;

    next();
  } catch (error) {
    req.isAuthenticated = false;
    next();
  }
};

router.post('/', checkAuth, async (req, res) => {
  try {
    if (!req.isAuthenticated) {
      console.log(req.isAuthenticated)
      return res.redirect('/form');
    }

    const user = await prisma.Utilisateur.findUnique({ where: { id: req.userId } });
    if (user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Seuls les utilisateurs avec le rôle ADMIN peuvent ajouter une catégorie.' });
    }

    const categorie = await AddCategorie(req.body);
    res.send(categorie);
  } catch (err) {
    console.error(err);
    res.status(500).send('Une erreur s\'est produite lors de l\'ajout de la catégorie');
  }
});



router.patch('/', checkAuth, async (req, res) => {
  try {
    if (!req.isAuthenticated) {
      return res.redirect('/form');
    }
    const categorie = await GetCategorie(+req.body.id);
    if (!categorie) {
      return res.status(404).send(`Catégorie avec l'ID ${req.body.id} introuvable`);
    }

    const user = await prisma.Utilisateur.findUnique({ where: { id: req.userId } });
    if (user.role !== 'ADMIN') {
      return res.status(403).send('Vous n\'êtes pas autorisé à modifier cette catégorie');
    }

    const updatedCategorie = await UpdateCategorie(req.body);
    res.send(updatedCategorie);
  } catch (err) {
    console.error(err);
    res.status(500).send('Une erreur s\'est produite lors de la mise à jour de la catégorie');
  }
});

router.delete('/:id', checkAuth, async (req, res) => {
  try {
    if (!req.isAuthenticated) {
      return res.redirect('/form');
    }
    const categorie = await prisma.Categorie.findUnique({
      where: {
        id: +req.params.id,
      },
    });
    if (!categorie) {
      return res.status(404).send(`Catégorie avec l'ID ${req.params.id} introuvable`);
    }

    const user = await prisma.Utilisateur.findUnique({ where: { id: req.userId } });
    if (user.role !== 'ADMIN') {
      return res.status(403).send('Vous n\'êtes pas autorisé à supprimer cette catégorie');
    }
    await DeleteCategorie(+req.params.id);
    res.send(`La catégorie avec l'ID ${req.params.id} a été supprimée`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Une erreur s\'est produite lors de la suppression de la catégorie');
  }
});



module.exports = router;

