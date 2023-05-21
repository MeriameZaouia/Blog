const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { AddCommentaire,GetCommentaire,GetCommentaires,DeleteCommentaire,UpdateCommentaire, } = require('../models/Commentaires.js')
const jwt = require('jsonwebtoken');
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
      return res.status(401).send('Unauthorized');
    }

    const {content, articleId } = req.body;
    const article = await prisma.Article.findUnique({ where: { id: +articleId } });
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    let user=await prisma.utilisateur.findUnique({where:{id:req.userId}})
    const email=user.email;
    const nouvelCommentaire = await prisma.Commentaire.create({
      data: {
        email,
        content,
        article: {
          connect: { id: +articleId },
        },
      },
    });

    res.status(201).json({ message: 'Commentaire créé avec succès !', Commentaire: nouvelCommentaire });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Une erreur s\'est produite lors de la création de commentaire.' });
  }
});


router.patch('/', checkAuth, async (req, res) => {
  try {
    if (!req.isAuthenticated) {
      return res.status(401).send('Unauthorized');
    }

    const Commentaire = await GetCommentaire(+req.body.id);
    if (!Commentaire) {
      return res.status(404).send(`Commentaire with id ${req.body.id} not found`);
    }

    // Vérification si l'utilisateur connecté est l'auteur du commentaire
    let user=await prisma.utilisateur.findUnique({where:{email:Commentaire.email}})
    if (req.userId !== user.id) {
      return res.status(403).send('You are not authorized to update this comment');
    }

    const updatedCommentaire = await UpdateCommentaire(req.body);
    res.send(updatedCommentaire);
  } catch (err) {
    console.error(err);
    res.send('Erreur!!!!!!!!!!!!!!!!!!!!!!');
  }
});




router.delete('/:id', checkAuth, async (req, res) => {
  try {
    if (!req.isAuthenticated) {
      return res.status(401).send('Unauthorized');
    }

    const Commentaire = await prisma.commentaire.findUnique({
      where: {
        id: +req.params.id,
      },
      include: {
        article: true,
      },
    });

    if (!Commentaire) {
      return res.status(404).send(`Commentaire with ID ${req.params.id} not found`);
    }

    // Vérification si l'utilisateur connecté est l'auteur du commentaire ou l'auteur de l'article
    let article=await prisma.Article.findUnique({where:{id:Commentaire.articleId}})
    let user=await prisma.utilisateur.findUnique({where:{email:Commentaire.email}})
    if (req.userId !== user.id && req.userId !== article.userId) {
      return res.status(403).send('You are not authorized to delete this comment');
    }

    await DeleteCommentaire(+req.params.id);
    res.send(`Commentaire with ID ${req.params.id} has been deleted`);
  } catch (err) {
    console.error(err);
    res.send('Erreur!!!!!!!!!!!!!!!!!!!!!!');
  }
});

module.exports = router;