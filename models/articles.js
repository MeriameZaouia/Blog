const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();



function AddArticle(article){
    
    return prisma.Article.create({data:article})
}


function GetArticle(id){
    
    return prisma.Article.findUnique({where:{id:+id}})
}


function GetArticles(take, skip) {
  const query = {};

  if (skip) {
    query.skip = +skip;
  }

  if (take) {
    query.take = +take;
  }

  return prisma.Article.findMany(query);
}


function DeleteArticle(id){

    return prisma.Article.delete({
        where: {id:+id},
      });
}



function UpdateArticle(article) {
    return prisma.Article.update({
      where: {id:+article.id},
      data:article
    });
  }
  




module.exports={
    AddArticle,
    GetArticle,
    GetArticles,
    DeleteArticle,
    UpdateArticle,

}