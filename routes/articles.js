const express = require('express');
const router = express.Router();

router.get('/',(req,res)=>{   
  res.send(`Récuperer articles de ${req.query.skip} a ${req.query.take}`);
    }) 

router.get('/:id',(req,res)=>{
     res.send(`Récuprer l\'article ayant l\'ID ${req.params.id}`);
    })   

router.post('/',(req,res)=>{
     res.send('Ajouter un nouveau article');
    }) 

router.patch('/',(req,res)=>{
     res.send('Mettre a jour l\'article');
    })   
router.delete('/:id',(req,res)=>{
       res.send(`Supprimer l\'article ayant l\'ID ${req.params.id}`);
    })

module.exports=router;



