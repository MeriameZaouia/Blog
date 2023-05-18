const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sequelize, Op } = require('sequelize');
const {GetArticle, GetArticles, DeleteArticle, UpdateArticle, } = require('../models/articles.js')

var app = require('../app');

router.get('/', (req, res) => {
  GetArticles(req.query.take,req.query.skip)
    .then(articles => res.json(articles))
    .catch(err => {
      console.error(err)
      res.send('Erreur!!!!!!!!!!!!')
    })
});

router.get('/:id', async (req, res) => {
  try {
    const article = await GetArticle(+req.params.id);
    if (article) {
      res.send(article);
    } else {
      res.status(404).send('Article not found');
    }
  } catch (err) {
    console.error(err)
    res.send('Erreur!!!!!!!!!!!!!!!!!!!!!!');
  }
});



router.post('/', async (req, res) => {
  try {
    let { title, content, image, userId, categories } = req.body;
    let user = await prisma.Utilisateur.findUnique({ where: { id: userId } });
    if (user.role !== 'AUTHOR') {
      return res.status(403).json({ message: 'Seuls les utilisateurs avec le rôle AUTHOR peuvent créer des articles.' });
    }
    // Obtenez les catégories correspondantes
    let categoriesCorrespondantes = await prisma.Categorie.findMany({
      where: {
        id: {
          [Op.in]: categories,
        },
      },
    });
    // Créez un nouvel article
    let nouvelArticle = await prisma.Article.create({
        data: {
        title: title,
        content: content,
        image: image,
        User: {
          connect: { id: userId }, // Utilisez connect pour connecter l'utilisateur existant
        },
        categories: {
          connect: categoriesCorrespondantes.map((categorie) => ({ id: categorie.id })),
        },
      },
    });

    res.status(201).json({ message: 'Article créé avec succès !', article: nouvelArticle });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Une erreur s\'est produite lors de la création de l\'article.' });
  }
});




router.patch('/', async (req, res) => {
  try {
    const article = await GetArticle(+req.body.id);
    if (!article) {
      return res.status(404).send(`Article with id ${req.body.id} not found`);
    }
    const updatedArticle = await UpdateArticle(req.body);
    res.send(updatedArticle);
  } catch (err) {
    console.error(err)
    res.send('Erreur!!!!!!!!!!!!!!!!!!!!!!');
  }
});



router.delete('/:id', async (req, res) => {

  try {
    const article = await prisma.Article.findUnique({
      where: {
        id: +req.params.id,
      },
    });
    if (!article) {
      res.status(404).send(`Article with ID ${req.params.id} not found`);
    }
    else {
      const deleteArticle = await DeleteArticle(+req.params.id);
      res.send(`Article with ID ${req.params.id} has been deleted`);
    }
  } catch (err) {
    console.error(err)
    res.send('Erreur!!!!!!!!!!!!!!!!!!!!!!');
  }
});


module.exports = router;





