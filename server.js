const http = require("http");
const Express = require("./lib/express");
const { read, write, hashPassword } = require("./utils/model");
const fs = require("fs");

const PORT = process.env.PORT || 5000;

function httpServer(req, res) {
  const app = new Express(req, res);

  app.get("/", (req, res) => {
    const buffer = fs.readFileSync("./index.html");
    res.setHeader("Content-Type", "text/html");
    res.end(buffer);
  });
  app.get("/docs", (req, res) => {
    const buffer = fs.readFileSync("./docs.html");
    res.setHeader("Content-Type", "text/html");
    res.end(buffer);
  });

  app.get("/index.css", (req, res) => {
    const bufferCss = fs.readFileSync("./index.css");
    res.setHeader("Content-Type", "text/css");
    res.end(bufferCss);
  });
  app.get("/docs.css", (req, res) => {
    const bufferCss = fs.readFileSync("./docs.css");
    res.setHeader("Content-Type", "text/css");
    res.end(bufferCss);
  });

  app.get("/admins", (req, res) => {
    const data = read("admins");
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(data));
  });

  app.get("/categories", (req, res) => {
    const categories = read("categories");
    const subcategories = read("subcategories");

    const category = categories.map((category) => {
      const subcategory = subcategories.filter(
        (subcategory) => subcategory.category_id == category.category_id
      );

      return {
        ...category,
        subcategory,
      };
    });
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(category));
  });

  app.post("/categories", async (req, res) => {
    const categories = read("categories");
    const id = categories.at(-1)?.category_id + 1 || 1;
    let { category_name } = await req.body;
    const newCategory = {
      category_id: id,
      category_name,
    };
    write("categories", [...categories, newCategory]);
    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: 201, success: true }));
  });

  app.put("/categories", async (req, res) => {
    const categories = read("categories");
    let { category_id, category_name } = await req.body;

    const editCategory = {
      category_id,
      category_name,
    };
    const newCategories = categories.map((category) => {
      if (category.category_id == category_id) {
        return editCategory;
      }
      return category;
    });
    write("categories", newCategories);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: 204, success: true }));
  });

  app.delete("/categories", async (req, res) => {
    const categories = read("categories");
    let { category_id } = await req.body;
    const DeleteCategory = {
      category_id,
    };
    const newCategories = categories.filter((category) => {
      if (category.category_id == category_id) {
        return false;
      }
      return true;
    });
    write("categories", newCategories);
    res.writeHead(204, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: 204, success: true }));
  });

  app.get("/subcategories", (req, res) => {
    const subcategories = read("subcategories");
    const product = read("products");

    const subcategory = subcategories.map((subcategory) => {
      const products = product.filter(
        (product) => product.sub_category_id == subcategory.sub_category_id
      );

      return {
        ...subcategory,
        products,
      };
    });
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(subcategory));
  });

  app.post("/subcategories", async (req, res) => {
    const subcategories = read("subcategories");
    const id = subcategories.at(-1)?.subcategories + 1 || 1;
    let { sub_category_name, category_id } = await req.body;
    const newSubCategory = {
      sub_category_id: id,
      category_id,
      sub_category_name,
    };
    write("subcategories", [...subcategories, newSubCategory]);
    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: 201, success: true }));
  });

  app.put("/subcategories", async (req, res) => {
    const subcategories = read("subcategories");
    let { sub_category_id, sub_category_name, category_id } = await req.body;

    const editSubCategory = {
      sub_category_id,
      category_id,
      sub_category_name,
    };
    const newSubCategories = subcategories.map((subcategory) => {
      if (subcategory.sub_category_id == sub_category_id) {
        return editSubCategory;
      }
      return subcategory;
    });
    write("subcategories", newSubCategories);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: 204, success: true }));
  });

  app.delete("/subcategories", async (req, res) => {
    const subcategories = read("subcategories");
    let { sub_category_id } = await req.body;
    const DeleteSubCategory = {
      sub_category_id,
    };
    const newSubCategories = subcategories.filter((subcategory) => {
      if (subcategory.sub_category_id == sub_category_id) {
        return false;
      }
      return true;
    });
    write("subcategories", newSubCategories);
    res.writeHead(204, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: 204, success: true }));
  });

  app.get("/products", (req, res) => {
    const data = read("products");

    const { model, subcategoryid} = req.query;
    const filteredmodel = data.filter((product) => product.model == model);
    const filteredsubcategoryid = data.filter(
      (product) => product.sub_category_id == subcategoryid
    );
    const filterAll = data.filter(
      (product) =>
        (product.sub_category_id == subcategoryid) & (product.model == model)
    );
    if (model) {
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(filteredmodel));
    } else if (subcategoryid) {
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(filteredsubcategoryid));
    } else if (subcategoryid & model) {
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(filterAll));
    } else {
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(data));
    }
  });

  app.post("/products", async (req, res) => {
    const products = read("products");
    const id = products.at(-1)?.products + 1 || 1;
    let { product_name, sub_category_id, model, color, price } = await req.body;
    const newProduct = {
      product_id: id,
      sub_category_id,
      model,
      product_name,
      color,
      price,
    };
    write("products", [...products, newProduct]);
    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: 201, success: true }));
  });

  app.put("/products", async (req, res) => {
    const products = read("products");
    let { product_id, product_name, sub_category_id, model, color, price } =
      await req.body;

    const editProduct = {
      product_id,
      sub_category_id,
      model,
      product_name,
      color,
      price,
    };
    const newProducts = products.map((product) => {
      if (product.product_id == product_id) {
        return editProduct;
      }
      return product;
    });
    write("products", newProducts);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: 204, success: true }));
  });

  app.delete("/products", async (req, res) => {
    const products = read("products");
    let { product_id } = await req.body;
    const DeleteProduct = {
      product_id,
    };
    const newProducts = products.filter((product) => {
      if (product.product_id == product_id) {
        return false;
      }
      return true;
    });
    write("products", newProducts);
    res.writeHead(204, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: 204, success: true }));
  });
}

http.createServer(httpServer).listen(PORT, () => console.log("server run"));
