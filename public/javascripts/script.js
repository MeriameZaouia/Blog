$(document).ready(function() {
  // Fonction pour récupérer les catégories depuis le serveur
  function fetchCategories() {
    return $.ajax({
      url: '/categories', // L'URL de votre endpoint pour récupérer les catégories
      method: 'GET',
      dataType: 'json',
    });
  }

  // Fonction pour afficher les catégories dans le DOM
  function displayCategories(categories) {
    const categorieList = $('#categorie-list');

    categories.forEach(function(category,index) {
      const listItem = $('<li></li>').addClass('list').text(category.nom);
      listItem.attr('data-filter', category.nom);
      categorieList.append(listItem);
      if (index < categories.length - 1) {
        categorieList.append('*');
      }
    });
  }

  // Récupérer les catégories depuis le serveur et les afficher
  fetchCategories()
    .done(function(categories) {
      displayCategories(categories);
    })
    .fail(function(error) {
      console.error('Error fetching categories:', error);
    });




/*********************************************************************** */

$('.blog-box').each(function() {
  var $blogBox = $(this);
  var articleId = $blogBox.attr('class').split(' ')[1]; // Récupérer la classe ajoutée (l'ID de l'article)
  
  // Store the reference to "this" in a separate variable
  var $this = $blogBox;

  // Faire une requête Ajax avec l'URL de l'article spécifique pour le récupérer
  $.ajax({
    url: '/articles/categories' + articleId,
    method: 'GET',
    dataType: 'json',
    success: function(categories) {
      var tab = Array.from(categories); // Convertir les catégories en un tableau

      // Ajouter les classes correspondant aux catégories à l'élément .blog-box
      $this.addClass(tab.join(' '));
    },
    error: function(error) {
      console.error('Erreur lors de la récupération de l\'article:', error);
    }
  });
});

/**************************************************** Afficher les articles de la categorie selectionné*/
$('.list').click(function() {
  const value = $(this).attr('data-filter');
  if (value == 'All') {
    $('.blog-box').show('1000');
  } else {
    $('.blog-box').hide('1000'); // Cacher tous les articles

    // Afficher les articles ayant une classe correspondant à la valeur
    $('.blog-box').filter(function() {
      const classes = $(this).attr('class').split(' ');
      return classes.some(function(className) {
        return className === value;
      });
    }).show('1000');
  }
});

});


$(document).on('click','.blog-filter li', function(){
      $(this).addClass('blog-filter-active').siblings().removeClass('blog-filter-active')
})


  