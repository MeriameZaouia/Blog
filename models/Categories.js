const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();



function AddCategorie(categorie){
    
    return prisma.Categorie.create({data:categorie})
}


function GetCategorie(id){
    
    return prisma.Categorie.findUnique({where:{id}})
}


function GetCategories(take, skip) {
  const query = {};

  if (skip) {
    query.skip = +skip;
  }

  if (take) {
    query.take = +take;
  }

  return prisma.Categorie.findMany(query);
}




function DeleteCategorie(id){

    return prisma.Categorie.delete({
        where: {id:+id},
      });
}



function UpdateCategorie(categorie) {
    return prisma.Categorie.update({
      where: {id:+categorie.id},
      data:categorie
    });
  }
  




module.exports={
    AddCategorie,
    GetCategorie,
    GetCategories,
    DeleteCategorie,
    UpdateCategorie,

}