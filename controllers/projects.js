let express = require('express')
let db = require('../models')
let router = express.Router()
let async = require('async')

// POST /projects - create a new project
router.post('/', (req, res) => {
  let categories = []
  if (req.body.cn) {
    categories = req.body.cn.split(',')
  }
  db.project.create({
    name: req.body.name,
    githubLink: req.body.githubLink,
    deployLink: req.body.deployedLink,
    description: req.body.description
  })
    .then((project) => {
      async.forEach(categories, (cat, done) => {
        db.category.findOrCreate({
          where: { name: cat.trim() }
          })
          .then(([cat, wasCreated]) => {
            project.addCategory(cat)
            .then(() => {
              done()
            })
            .catch(err => {
              console.log('error')
              done()
            })
          })
          .catch(err => {
            console.log('error')
            done()
            res.status(400).render('main/404')
          })
      }),
      () => {
        res.redirect('/')
      }
    })
})

// GET /projects/new - display form for creating a new project
router.get('/new', (req, res) => {
  res.render('projects/new')
})

// GET /projects/:id - display a specific project
router.get('/:id', (req, res) => {
  db.project.findOne({
    where: { id: req.params.id },
    include: [db.category]
  })
    .then((project) => {
      // console.log('project categories-------' project.categories)
      if (!project) throw Error()

      res.render('projects/show', { project: project })
    })
    .catch((error) => {
      res.status(400).render('main/404')
    })
})

//delete project route
router.delete('/:id', (req, res) => {
  console.log('where the fuck are you!?--------------')
  // Delete from the join table
  db.categoriesProjects.destroy({
    where: { categoryId: req.params.id }
  })
  .then(() => {
    // Now I am free to delete the category itself
    db.category.destroy({
      where: { id: req.params.id }
    })
    .then(destroyedCategory => {
      res.redirect('/categories')
    })
    .catch(err => {
      console.log('Oh no what happened', err)
      res.render('main/404')
    })
  })
  .catch(err => {
    console.log('Oh no what happened', err)
    res.render('main/404')
  })
})

//edit a project



module.exports = router
