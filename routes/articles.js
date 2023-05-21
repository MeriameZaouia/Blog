const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const { GetArticle, GetArticles, DeleteArticle, UpdateArticle } = require('../models/articles.js');

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

    return next();
  } catch (error) {
    req.isAuthenticated = false;
    return next();
  }
};

router.get('/', (req, res) => {
  GetArticles(req.query.take, req.query.skip)
    .then(articles => res.json(articles))
    .catch(err => {
      console.error(err);
      res.status(500).send('Une erreur s\'est produite lors de la récupération des articles.');
    });
});

router.get('/:id', async (req, res) => {
  try {
    const article = await GetArticle(+req.params.id);
    if (article) {
      res.send(article);
    } else {
      res.status(404).send('Article non trouvé.');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Une erreur s\'est produite lors de la récupération de l\'article.');
  }
});

router.get('/categories/:id', async (req, res) => {
  try {
    const article = await prisma.Article.findOne({ where: { id: +req.params.id }, include: { categories: true } });
    if (article) {
      res.send(article.categories);
    } else {
      res.status(404).send('Article non trouvé.');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Une erreur s\'est produite lors de la récupération des catégories de l\'article.');
  }
});

router.post('/', checkAuth, async (req, res) => {
  try {
    if (!req.isAuthenticated) {
      return res.redirect('/form');
    }
    const { title, content, image, categories } = req.body;

    const user = await prisma.Utilisateur.findUnique({ where: { id: req.userId } });
    if (user.role !== 'AUTHOR') {
      return res.status(403).json({ message: 'Seuls les utilisateurs avec le rôle AUTHOR peuvent créer des articles.' });
    }

    const categoriesCorrespondantes = await prisma.Categorie.findMany({ where: { id: { in: categories } } });

    const nouvelArticle = await prisma.Article.create({
      data: {
        title: title,
        content: content,
        image: image,
        userId: req.userId,
        categories: { connect: categoriesCorrespondantes.map(categorie => ({ id: categorie.id })) },
      },
    });

    res.status(201).json({ message: 'Article créé avec succès !', article: nouvelArticle });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Une erreur s\'est produite lors de la création de l\'article.' });
  }
});

router.patch('/', checkAuth, async (req, res) => {
  try {
    if (!req.isAuthenticated) {
      return res.redirect('/form');
    }

    const article = await GetArticle(+req.body.id);
    if (!article) {
      return res.status(404).send(`Article avec l'ID ${req.body.id} introuvable`);
    }

    const user = await prisma.Utilisateur.findUnique({ where: { id: req.userId } });
    if (article.userId !== user.id && user.role !== 'ADMIN') {
      return res.status(403).send('Vous n\'êtes pas autorisé à modifier cet article');
    }

    const updatedArticle = await UpdateArticle(req.body);
    res.send(updatedArticle);
  } catch (err) {
    console.error(err);
    res.status(500).send('Une erreur s\'est produite lors de la mise à jour de l\'article');
  }
});

router.delete('/:id', checkAuth, async (req, res) => {
  try {
    if (!req.isAuthenticated) {
      return res.redirect('/form');
    }

    const article = await prisma.Article.findUnique({
      where: {
        id: +req.params.id,
      },
    });
    if (!article) {
      return res.status(404).send(`Article avec l'ID ${req.params.id} introuvable`);
    }

    const user = await prisma.Utilisateur.findUnique({ where: { id: req.userId } });
    if (article.userId !== user.id && user.role !== 'ADMIN') {
      return res.status(403).send('Vous n\'êtes pas autorisé à supprimer cet article');
    }

    await DeleteArticle(+req.params.id);
    res.send(`L'article avec l'ID ${req.params.id} a été supprimé`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Une erreur s\'est produite lors de la suppression de l\'article');
  }
});

module.exports = router;

