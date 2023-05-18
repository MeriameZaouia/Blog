const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { AddCategorie,GetCategorie,GetCategories,DeleteCategorie,UpdateCategorie, } = require('../models/Categories.js')

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





router.post('/', (req, res, next) => {
  AddCategorie(req.body)
    .then(categorie => res.send(categorie))
    .catch(err => {
      console.error(err)
      res.send('Erreur!!!!!!!!!!!!')
    })
});




router.patch('/', async (req, res) => {
  try {
    const Categorie = await GetCategorie(+req.body.id);
    if (!Categorie) {
      return res.status(404).send(`Categorie with id ${req.body.id} not found`);
    }
    const updatedCategorie = await UpdateCategorie(req.body);
    res.send(updatedCategorie);
  } catch (err) {
    console.error(err)
    res.send('Erreur!!!!!!!!!!!!!!!!!!!!!!');
  }
});



router.delete('/:id', async (req, res) => {
  
  try {
    const Categorie = await prisma.Categorie.findUnique({
      where: {
        id: +req.params.id,
      },
    });
    if (!Categorie) {
      res.status(404).send(`Categorie with ID ${req.params.id} not found`);
    }
    else {
      const deleteCategorie = await DeleteCategorie(+req.params.id);
      res.send(`Categorie with ID ${req.params.id} has been deleted`);
    }
  } catch (err) {
    console.error(err)
    res.send('Erreur!!!!!!!!!!!!!!!!!!!!!!');
  }
});


module.exports = router;

