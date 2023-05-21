const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();



function AddCommentaire(commentaire){
    
    return prisma.Commentaire.create({data:commentaire})
}


function GetCommentaire(id){
    
    return prisma.Commentaire.findUnique({where:{id:id}})
}


function GetCommentaires(take, skip) {
  const query = {};

  if (skip) {
    query.skip = +skip;
  }

  if (take) {
    query.take = +take;
  }

  return prisma.Commentaire.findMany(query);
}



function DeleteCommentaire(id){

    return prisma.Commentaire.delete({
        where: {id:+id},
      });
}



function UpdateCommentaire(commentaire) {
    return prisma.Commentaire.update({
      where: {id:+commentaire.id},
      data:commentaire
    });
  }
  




module.exports={
    AddCommentaire,
    GetCommentaire,
    GetCommentaires,
    DeleteCommentaire,
    UpdateCommentaire,

}