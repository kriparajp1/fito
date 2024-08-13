const mongoose = require("mongoose");
const categoryCollection = require("../../models/category");

// get category page
const getCategory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = 6;
    const startIndex = (page - 1) * perPage;
    const category = await categoryCollection
      .find()
      .skip(startIndex)
      .limit(perPage);

    const totalCategory = await categoryCollection.countDocuments();
    const totalPages = Math.ceil(totalCategory / perPage);

    const sortOption = req.query.sortOption || null;
    const categories = req.query.categories || null;
    const search = req.query.search || null;

    const success = req.query.success || null;
    const error = req.query.error || null;

    res.render("admin/category", {
      menu: "categories",
      category,
      page,
      perPage, 
      totalPages,
      sortOption,
      categories,
      search,
      success, 
      error, 
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const addCategory = (req, res) => {
  try {
    res.render("admin/addCategory", {
      menu: "categories",
      categoryStatus: "new",
    });
  } catch (error) {
    console.log(Error);
  }
};

// post
const postAddCategory = async (req, res) => {
  try {
    const categoryName = req.body.categoryName;
    const check = await categoryCollection.findOne({
      categoryName: { $regex: new RegExp("^" + categoryName + "$", "i") },
    });
    if (check) {
      res.redirect("/admin/category?error=Category already exists");
    } else {
      const categoryData = {
        categoryName: req.body.categoryName,
        description: req.body.description,
      };
      await categoryCollection.insertMany([categoryData]);
      res.redirect("/admin/category?success=Category created successfully");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const getBlockCategory = async (req, res) => {
  try {
    const category = await categoryCollection.findOne({
      categoryName: req.query.categoryName,
    });
    if (category) {
      const block = category.blocked;
      if (block) {
        await categoryCollection.updateOne(
          { categoryName: req.query.categoryName },
          { $set: { blocked: false } }
        );
      } else {
        await categoryCollection.updateOne(
          { categoryName: req.query.categoryName },
          { $set: { blocked: true } }
        );
      }
    }
    res.redirect("/admin/category");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

// edit category
const editCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const category = await categoryCollection.findById(categoryId);
    const error = req.query.error || "";
    res.render("admin/addCategory", {
      category,
      error,
      menu: "categories",
      categoryStatus: "update",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const editCategoryPost = async (req, res) => {
  try {
    const categoryId = new mongoose.Types.ObjectId(req.params.id);
    const categoryName = req.body.categoryName.toLowerCase();
    const check = await categoryCollection.findOne({
      _id: { $ne: categoryId },
      categoryName: { $regex: new RegExp("^" + categoryName + "$", "i") },
    });
    if (check) {
      res.redirect(
        `/admin/editCategory/${categoryId}?error=Category name already exists`
      );
    } else {
      await categoryCollection.findByIdAndUpdate(
        categoryId,
        {
          categoryName: req.body.categoryName,
          description: req.body.description,
        },
        { new: true }
      );
      res.redirect(`/admin/category?success=Category updated successfully`);
    }
  } catch (error) {
    console.log("Error:", error);
    res.status(500).send("Error occurred");
  }
};
const checkCategoryExists = async (req, res) => {
  try {
    const categoryName = req.query.categoryName;
    const category = await categoryCollection.findOne({
      categoryName: { $regex: new RegExp("^" + categoryName + "$", "i") },
    });
    if (category) {
      res.json({ exists: true, categoryId: category._id });
    } else {
      res.json({ exists: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getCategory,
  postAddCategory,
  getBlockCategory,
  addCategory,
  editCategory,
  editCategoryPost,
  checkCategoryExists,
};
