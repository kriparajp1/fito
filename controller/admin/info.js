const Info = require("../../models/extra/smallInfo");

const infoPageRender = async (req, res) => {
  try {
    const info = await Info.find({ block: true });
    res.render("admin/footerInfo", { info, menu: "smallInfo" });
  } catch (error) {
    console.log(error);
  }
};
const renderAddInfo = async (req, res) => {
  try {
    res.render("admin/addInfo", { menu: "smallInfo" });
  } catch (error) {
    console.log(error);
  }
};

const addInfo = async (req, res) => {
  try {
    const { heading, description } = req.body;
    const data = {
      heading,
      description,
    };
    await Info.create(data);
    res.redirect("/admin/infoPage");
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  infoPageRender,
  addInfo,
  renderAddInfo,
};
