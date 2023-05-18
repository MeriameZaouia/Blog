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




function DeleteUser(id){

    return prisma.Utilisateur.delete({
        where: {id:+id},
      });
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