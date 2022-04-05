const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', (req, res) => {
  // find all tags
  Tag.findAll({
      include: [
          {
              model: Product,
              attributes: [
                  'id',
                  'product_name',
                  'price',
                  'stock'
              ],
              as: 'products'
          }
      ]
  })
  .then(dbUser => res.json(dbUser))
  .catch(err => {
      console.log(err);
      res.status(500).json(err);
  })
});

router.get('/:id', (req, res) => {
  // find a single tag by its `id`
  Tag.findOne({
      where: {
        id: req.params.id
      },
      include: [
          {
            model: Product,
            attributes: [
                'id',
                'category_id',
                'product_name',
                'stock',
                'price'
            ],
            as: 'products'
          }
      ]
  })
  .then(dbUser => {
      if(!dbUser) {
          res.status(404).json({ message: "Can't find this tag" });
          return;
      }
      res.json(dbUser);
  })
  .catch(err => {
      console.log(err);
      res.status(500).json(err);
  });
});

router.post('/', (req, res) => {
  // create a new tag
  Tag.create({
      id: req.body.id,
      tag_name: req.body.tag_name
  })
  .then(dbTags => res.json(dbTags))
  .catch(err => {
      console.log(err);
      res.status(400).json(err);
  });
});

router.put('/:id', (req, res) => {
  // update a tag's name by its `id` value
  Tag.update({
        where: {
            id: req.params.id
        }
    },
    { 
      tag_name: req.body.tag_name
    },
  )
    .then(dbTags => {
      if (!dbTags) {
        res.status(404).json({ message: 'No tags with this id!' });
        return;
      }
      res.json(dbTags);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.delete('/:id', (req, res) => {
  // delete on tag by its `id` value
  Tag.destroy({
      where: {
          id: req.params.id
      }
  })
  .then(dbTags => {
      if(!dbTags) {
          res.status(404).json({ message: 'No tags found' });
          return;
      }
      res.json(dbTags);
  })
  .catch(err => {
      console.log(err);
      res.status(500).json(err);
  });
});

module.exports = router;