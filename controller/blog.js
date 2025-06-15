const Blog = require("../model/blog");

const getAllPublishedBlogs = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 20;
  const skip = (page - 1) * limit;

  try {
    const blogs = await Blog.find({ state: "published" })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "author",
        select: "firstname lastname -_id",
      })
      .sort({ createdAt: -1 });

    res.json({ blogs });
  } catch (err) {
    console.error("Error fetching blogs:", err);
    res.status(500).send("Internal Server Error");
  }
};

const myBlogs = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const state = req.query.state;
  try {
    const query = { author: req.user._id };
    if (state) {
      query.state = state;
    }

    const blogs = await Blog.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Blog.countDocuments(query);

    res.status(200).json({
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      blogs,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch your blogs" });
  }
};

const calculateReadingTime = (text) => {
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
};

const createBlog = async (req, res) => {
  try {
    const { title, description, state, tags, body } = req.body;

    const reading_time = calculateReadingTime(body);

    const newPost = await Blog.create({
      title,
      description,
      state,
      tags,
      body,
      author: req.user._id,
      reading_time,
    });

    res.status(201).json({
      message: "Blog post created successfully",
      post: newPost,
    });
  } catch (err) {
    console.error("Error creating blog post:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $inc: { read_count: 1 } },
      { new: true }
    ).populate({
      path: "author",
      select: "firstname lastname email -_id",
    });

    if (!blog) return res.status(404).send("Blog post not found");

    res.status(200).json({ post: blog });
  } catch (err) {
    console.error("Error fetching blog post:", err);
    res.status(500).send("Internal Server Error");
  }
};

const updateBlog = async (req, res) => {
  const postId = req.params.id;
  const updatedPost = req.body;

  try {
    const post = await Blog.findById(postId);
    if (!post) return res.status(404).send("Blog post not found");

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).send("You are not authorized to edit this post");
    }

    const updated = await Blog.findByIdAndUpdate(postId, updatedPost, {
      new: true,
    });

    res.status(200).json({
      message: "Blog post updated successfully",
      post: updated,
    });
  } catch (err) {
    console.error("Error updating blog post:", err);
    res.status(500).send("Internal Server Error");
  }
};

const deleteBlog = async (req, res) => {
  const postId = req.params.id;

  try {
    const post = await Blog.findById(postId);
    if (!post) return res.status(404).send("Blog post not found");

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).send("You are not authorized to delete this post");
    }

    await Blog.findByIdAndDelete(postId);
    res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("Error deleting blog post:", err);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  getAllPublishedBlogs,
  myBlogs,
  createBlog,
  getBlogById,
  updateBlog,
  deleteBlog,
};
