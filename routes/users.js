const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sequelize, Op } = require('sequelize');
const { AddUser, GetUser, GetUsers, DeleteUser, UpdateUser, } = require('../models/users.js')

var app = require('../app');

router.get('/', (req, res) => {
  GetUsers(req.query.take,req.query.skip)
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
      if(err.code="P2002") res.status(500).json({ message: 'Cet adresse mail déja existe' });
      else
      res.status(500).json({ message: 'Une erreur s\'est produite lors de la création de l\'User.' });
    })

});




router.patch('/', async (req, res) => {
  try {
    const User = await GetUser(+req.body.id);
    if (!User) {
      return res.status(404).send(`User with id ${req.body.id} not found`);
    }
    const updatedUser = await UpdateUser(req.body);
    res.send(updatedUser);
  } catch (err) {
    console.error(err)
    res.send('Erreur!!!!!!!!!!!!!!!!!!!!!!');
  }
});

router.delete('/:id', async (req, res) => {

  try {
    const User = await prisma.Utilisateur.findUnique({
      where: {
        id: +req.params.id,
      },
    });
    if (!User) {
      res.status(404).send(`User with ID ${req.params.id} not found`);
    }
    else {
      const deleteUser = await DeleteUser(+req.params.id);
      res.send(`User with ID ${req.params.id} has been deleted`);
    }
  } catch (err) {
    console.error(err)
    res.send('Erreur!!!!!!!!!!!!!!!!!!!!!!');
  }
});


module.exports = router;






