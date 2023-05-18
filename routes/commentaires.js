const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { AddCommentaire,GetCommentaire,GetCommentaires,DeleteCommentaire,UpdateCommentaire, } = require('../models/Commentaires.js')

var app = require('../app');

router.get('/', (req, res) => {
  GetCommentaires(req.query.take,req.query.skip)
    .then(Commentaires => res.json(Commentaires))
    .catch(err => {
      console.error(err)
      res.send('Erreur!!!!!!!!!!!!')
    })
});


router.get('/:id', async (req, res) => {
  try {
    const Commentaire = await GetCommentaire(+req.params.id);
    if (Commentaire) {
      res.send(Commentaire);
    } else {
      res.status(404).send('Commentaire not found');
    }
  } catch (err) {
    console.error(err)
    res.send('Erreur!!!!!!!!!!!!!!!!!!!!!!');
  }
});


router.post('/', async(req, res, next) => {
    try {
        let {email, content, articleId} = req.body;

        let nouvelcommentaire = await prisma.Commentaire.create({
            data: {
            email,
            content,
            article: {
              connect: { id: +articleId }, 
            },
            
          },
        });
res.status(201).json({ message: 'Commentaire créé avec succès !', Commentaire: nouvelcommentaire });
      } catch (error) {
        console.error(error);
res.status(500).json({ message: 'Une erreur s\'est produite lors de la création de commentaire.' });
      }
});


router.patch('/', async (req, res) => {
  try {
    const Commentaire = await GetCommentaire(+req.body.id);
    if (!Commentaire) {
      return res.status(404).send(`Commentaire with id ${req.body.id} not found`);
    }
    const updatedCommentaire = await UpdateCommentaire(req.body);
    res.send(updatedCommentaire);
  } catch (err) {
    console.error(err)
    res.send('Erreur!!!!!!!!!!!!!!!!!!!!!!');
  }
});



router.delete('/:id', async (req, res) => {
  
  try {
    const Commentaire = await prisma.Commentaire.findUnique({
      where: {
        id: +req.params.id,
      },
    });
    if (!Commentaire) {
      res.status(404).send(`Commentaire with ID ${req.params.id} not found`);
    }
    else {
      const deleteCommentaire = await DeleteCommentaire(+req.params.id);
      res.send(`Commentaire with ID ${req.params.id} has been deleted`);
    }
  } catch (err) {
    console.error(err)
    res.send('Erreur!!!!!!!!!!!!!!!!!!!!!!');
  }
});


module.exports = router;