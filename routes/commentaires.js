const express = require('express');
const router = express.Router();

router.get('/',(req,res)=>{   
  res.send(`Récuperer commentaires de ${req.query.skip} a ${req.query.take}`);
    }) 

router.get('/:id',(req,res)=>{
     res.send(`Récuprer le commentaire ayant l\'ID ${req.params.id}`);
    })   

router.post('/',(req,res)=>{
     res.send('Ajouter un nouveau commentaire');
    }) 

router.patch('/',(req,res)=>{
     res.send('Mettre a jour le commentaire');
    })   
router.delete('/:id',(req,res)=>{
       res.send(`Supprimer le commentaire ayant l\'ID ${req.params.id}`);
    })

module.exports=router;