const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');



// get all products
router.get('/', (req, res) => {
  // find all products
  Product.findAll({
      include: [
        {
          model: Category,
          attributes: [
            'id',
            'category_name'
          ]
        },
        {
            model: Tag,
            as: 'tags'
        }
      ]
  })
  .then(dbProducts => res.json(dbProducts))
  .catch(err => {
      console.log(err);
      res.status(500).json(err);
  });
});

// get one product
router.get('/:id', (req, res) => {
  // find a single product by its `id`
  Product.findOne({
    where: {
        id: req.params.id
    },
      attributes: [
          'id',
          'product_name',
          'price',
          'stock'
      ],
      include: [
          {
              model: Category
          },
          {
              model: Tag,
              as: 'tags'
          }
      ]
  })
  .then(dbProduct => res.json(dbProduct))
  .catch(err => {
      console.log(err);
      res.status(500).json(err);
  });
});

// create new product
router.post('/', (req, res) => {
  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4]
    }
  */
  Product.create(req.body)
    .then((product) => {
 
      if (req.body.tagIds.length) {
        const productTagArray = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id
          };
        });
        return ProductTag.bulkCreate(productTagArray);
      }

      res.status(200).json(product);
    })
    .then((proTagIds) => res.status(200).json(proTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// update product
router.put('/:id', (req, res) => {
  
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
   
      return ProductTag.findAll({ where: { product_id: req.params.id } });
    })
    .then((productTags) => {
      // get list of current tag ids
      const proTagIds = productTags.map(({ tag_id }) => tag_id);

      const newProTags = req.body.tagIds
        .filter((tag_id) => !proTagIds.includes(tag_id))
        .map((tag_id) => {
          return {
            product_id: req.params.id,
            tag_id,
          };
        });
      const productTagsRemove = productTags
        .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
        .map(({ id }) => id);

      // run both actions
      return Promise.all([
        ProductTag.destroy({ where: { id: productTagsRemove } }),
        ProductTag.bulkCreate(newProTags),
      ]);
    })
    .then((updatedTags) => res.json(updatedTags))
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

router.delete('/:id', (req, res) => {
  // delete one product by its `id` value
  Product.destroy({
    where: {
        id: req.params.id
    }
  })
  .then(dbProduct => {
      if(!dbProduct) {
          res.status(404).json({ message: 'There is no product with this id!'  });
          return;
      }
      res.json(dbProduct);
  })
  .catch(err => {
      console.log(err);
      res.status(500).json(err);
  });
});

module.exports = router;