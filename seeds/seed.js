const express = require('express');
const { faker } = require('@faker-js/faker');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  try {
    // Créer 10 utilisateurs ayant le rôle "AUTHOR"
    const authorUsers = await Promise.all(
      Array.from({ length: 10 }).map(async () => {
        return prisma.utilisateur.create({
          data: {
            nom: faker.internet.userName(),
            email: faker.internet.email(),
            password: faker.internet.password(),
            role: 'AUTHOR',
          },
        });
      })
    );

    // Créer 1 utilisateur ayant le rôle "ADMIN"
    const adminUser = await prisma.utilisateur.create({
      data: {
        nom: faker.internet.userName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        role: 'ADMIN',
      },
    });

    const categoryDomains = [
      'Technologie',
      'Mode',
      'Voyage',
      'Cuisine',
      'Sport',
      'Musique',
      'Art',
      'Science',
      'Santé',
      'Actualités',
    ];
    // Créer 10 catégories
    let i = 0;
    const categories = await Promise.all(
      Array.from({ length: 10 }).map(async () => {
        const randomCategory = categoryDomains[i];
        i++;
    
        return prisma.Categorie.create({
          data: {
            nom: randomCategory,
          },
        });
      })
    );

    // Créer 100 articles
    const articles = await Promise.all(
      Array.from({ length: 100 }).map(async () => {
        const randomAuthor = authorUsers[Math.floor(Math.random() * authorUsers.length)];
        const randomCategories = categories.slice(0, Math.floor(Math.random() * 4) + 1);


        return prisma.Article.create({
          data: {
            title: faker.lorem.sentence(),
            content: faker.lorem.paragraphs(),
            image: faker.image.url(800, 400, 'loremflickr.com'),
            published: faker.datatype.boolean(),
            User: {
              connect: { id: randomAuthor.id },
            },
            categories: {
              connect: randomCategories.map((category) => ({ id: category.id })),
            },
          },
        });
      })
    );

    // Créer de 0 à 20 commentaires pour chaque article
    await Promise.all(
      articles.map(async (article) => {
        const numComments = faker.number.int({ min: 0, max: 20 });
        if (numComments > 0) {
          const comments = await Promise.all(
            Array.from({ length: numComments }).map(async () => {
              const randomAuthor = authorUsers[Math.floor(Math.random() * authorUsers.length)];

              return prisma.commentaire.create({
                data: {
                  content: faker.lorem.sentence(),
                  email: randomAuthor.email,
                  article: {
                    connect: { id: article.id },
                  },
                },
              });
            })
          );
          console.log(`Created ${numComments} comments for article "${article.title}".`);
          return comments;
        }
      })
    );

    console.log('Seeding completed successfully.');
  } catch (error) {
    console.error('Error seeding data:', error);
  } 
}

seed();
