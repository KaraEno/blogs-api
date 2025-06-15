const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server");
const Blog = require("../model/blog");
const User = require("../model/user");

let token, blogId;

beforeAll(async () => {
  await mongoose.connect(process.env.TEST_DB_URI);

  // Create a test user and get JWT token
  const userRes = await request(app).post("/signup").send({
    firstname: "Test",
    lastname: "User",
    email: "testuser@example.com",
    password: "Test1234",
  });

  const loginRes = await request(app).post("/login").send({
    email: "testuser@example.com",
    password: "Test1234",
  });

  token = loginRes.body.token;
});

afterAll(async () => {
  await Blog.deleteMany({});
  await User.deleteMany({});
  await mongoose.connection.close();
});

describe("Blog Endpoints", () => {
  it("should create a new blog", async () => {
    const res = await request(app)
      .post("/blogs/new")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Test Blog",
        description: "Blog description",
        body: "This is a long blog body for reading time.",
        tags: ["test"],
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.post).toHaveProperty("_id");
    blogId = res.body.post._id;
  });

  it("should get all published blogs", async () => {
    const res = await request(app).get("/blogs/");
    expect(res.statusCode).toEqual(200);
    expect(res.body.blogs.length).toEqual(0);
  });

  it("should get the logged-in user's blogs", async () => {
    const res = await request(app)
      .get("/blogs/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.blogs.length).toBeGreaterThan(0);
  });

  it("should get a blog by ID and increment read_count", async () => {
    const res = await request(app).get(`/blogs/${blogId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.post.read_count).toBeGreaterThan(0);
  });

  it("should update a blog", async () => {
    const res = await request(app)
      .put(`/blogs/${blogId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Updated Title" });

    expect(res.statusCode).toEqual(200);
    expect(res.body.post.title).toEqual("Updated Title");
  });

  it("should delete a blog", async () => {
    const res = await request(app)
      .delete(`/blogs/${blogId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual("Deleted successfully");
  });
});
