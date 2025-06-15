const express = require("express");
const passport = require("passport");
const blogController = require("../controller/blog");

const blogRouter = express.Router();

blogRouter.get("/", blogController.getAllPublishedBlogs);

blogRouter.get(
  "/me",
  passport.authenticate("jwt", { session: false }),
  blogController.myBlogs
);

blogRouter.post(
  "/new",
  passport.authenticate("jwt", { session: false }),
  blogController.createBlog
);

blogRouter.get("/:id", blogController.getBlogById);

blogRouter.put(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  blogController.updateBlog
);

blogRouter.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  blogController.deleteBlog
);

module.exports = blogRouter;
