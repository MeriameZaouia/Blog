const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sequelize, Op } = require('sequelize');
const { AddUser, GetUser, GetUsers, DeleteUser, UpdateUser, } = require('../models/users.js')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
var app = require('../app');

router.get('/', (req, res) => {
  GetUsers(req.query.take, req.query.skip)
    .then(Users => res.json(Users))
    .catch(err => {
      console.error(err)
      res.send('Erreur!!!!!!!!!!!!')
    })
});

router.get('/:id', async (req, res) => {
  try {
    const User = await GetUser(+req.params.id);
    if (User) {
      res.send(User);
    } else {
      res.status(404).send('User not found');
    }
  } catch (err) {
    console.error(err)
    res.send('Erreur!!!!!!!!!!!!!!!!!!!!!!');
  }
});


router.post('/', async (req, res) => {

  AddUser(req.body)
    .then(User => res.status(201).json({ message: 'User créé avec succès !', Utilisateur: User }))
    .catch(err => {
      console.log(err)
      if (err.code = "P2002") res.status(500).json({ message: 'Cet adresse mail déja existe' });
      else
        res.status(500).json({ message: 'Une erreur s\'est produite lors de la création de l\'User.' });
    })

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

router.patch('/', checkAuth, async (req, res) => {
  try {

    if (!req.isAuthenticated) {
      return res.status(401).send('Unauthorized');
    }


    const User = await GetUser(+req.body.id);


    if (!User) {
      return res.status(404).send(`User with id ${req.body.id} not found`);
    }

    // Vérification si l'utilisateur connecté est le propriétaire du compte
    if (req.userId !== User.id) {
      return res.status(403).send('You are not authorized to update this account');
    }

    const updatedUser = await UpdateUser(req.body);
    res.send(updatedUser);
  } catch (err) {
    console.error(err)
    if (err.code = "P2002") return res.status(500).json({ message: 'Cet adresse mail déja existe' });
    res.send('Erreur!!!!!!!!!!!!!!!!!!!!!!');
  }
});




router.delete('/:id', checkAuth, async (req, res) => {
  try {
    if (!req.isAuthenticated) {
      return res.status(401).send('Unauthorized');
    }
    const User = await prisma.Utilisateur.findUnique({
      where: {
        id: +req.params.id,
      },
    });
    if (!User) {
      return res.status(404).send(`User with ID ${req.params.id} not found`);
    }
    const User2 = await prisma.Utilisateur.findUnique({
      where: {
        id: +req.userId,
      },
    });

    // Vérification si l'utilisateur connecté est le propriétaire du compte ou bien c'est l'admin
    if (req.userId !== User.id && User2.role !== 'ADMIN') {
      return res.status(403).send('You are not authorized to delete this account');
    }
    await DeleteUser(+req.params.id);
    if (req.userId === User.id) {
      // Supprimer le token d'authentification
      res.clearCookie('token');
      return res.redirect('/form');
    }
    return res.send(`User with ID ${req.params.id} has been deleted`);

  } catch (err) {
    console.error(err)
    res.send('Erreur!!!!!!!!!!!!!!!!!!!!!!');
  }
});


module.exports = router;






