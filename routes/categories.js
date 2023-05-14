const express = require('express');
const router = express.Router();

router.get('/',(req,res)=>{   
  res.send(`Récuperer categories de ${req.query.skip} a ${req.query.take}`);
    }) 

router.get('/:id',(req,res)=>{
     res.send(`Récuprer la categorie ayant l\'ID ${req.params.id}`);
    })   

router.post('/',(req,res)=>{
     res.send('Ajouter une nouvelle categorie');
    }) 

router.patch('/',(req,res)=>{
     res.send('Mettre a jour la categorie');
    })   
router.delete('/:id',(req,res)=>{
       res.send(`Supprimer la categorie ayant l\'ID ${req.params.id}`);
    })

module.exports=router;