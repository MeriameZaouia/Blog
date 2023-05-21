const {PrismaClient} = require('@prisma/client')

const prisma=new PrismaClient


function AddUser(user){
    
    return prisma.Utilisateur.create({data:user})
}


function GetUser(id){
    
    return prisma.Utilisateur.findUnique({where:{id}})
}


function GetUsers(take, skip) {
  const query = {};

  if (skip) {
    query.skip = +skip;
  }

  if (take) {
    query.take = +take;
  }

  return prisma.Utilisateur.findMany(query);
}




async function DeleteUser(id) {
  try {
    // Supprimer les commentaires de l'utilisateur
    await prisma.Commentaire.deleteMany({
      where: {
        email : GetUser(id).email,
      },
    });

    // Supprimer les articles de l'utilisateur
    await prisma.Article.deleteMany({
      where: {
        userId: +id,
      },
    });

    // Supprimer l'utilisateur
    await prisma.Utilisateur.delete({
      where: {
        id: +id,
      },
    });

    return true;
  } catch (error) {
    console.error(error);
    throw new Error('Une erreur s\'est produite lors de la suppression de l\'utilisateur');
  }
}



function UpdateUser(User) {
    return prisma.Utilisateur.update({
      where: {id:+User.id},
      data:User
    });
  }
  




module.exports={
    AddUser,
    GetUser,
    GetUsers,
    DeleteUser,
    UpdateUser,

}