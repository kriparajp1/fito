const Offer = require("../../models/offerModel");
const Category = require("../../models/category");
const Product = require("../../models/productModel");

const offerGet = async (req, res) => {
  try {
    const offers = await Offer.find().populate("referenceId");
    res.render("admin/offer", { menu: "offer", offers });
  } catch (error) {
    console.error("Error fetching offers:", error);
    res.status(500).send("Server error");
  }
}; 

const addOffer = (req, res) => {
  try {
    res.render("admin/addOffer", { menu: "offer", status: "add" });
  } catch (error) {
    console.error("Error rendering add offer page:", error);
    res.status(500).send("Server error");
  }
};

const editOfferGet = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate("referenceId");
    const type =
      offer.offerType === "productdb"
        ? offer.referenceId.product_name
        : offer.referenceId.categoryName;

    res.render("admin/addOffer", {
      menu: "offer",
      offer,
      status: "edit",
      type,
      currentReference: {
        id: offer.referenceId._id,
        name: type,
      },
    });
  } catch (error) {
    console.error("Error fetching offer:", error);
    res.status(500).send("Server error");
  }
};

const getReference = async (req, res) => {
  try {
    const { offerType } = req.query;
    let references;

    if (offerType === "productdb") {
      references = await Product.find().select("_id product_name");
    } else if (offerType === "category") {
      references = await Category.find().select("_id categoryName");
    }

    res.json(references);
  } catch (error) {
    console.error("Error fetching references:", error);
    res.status(500).send("Server error");
  }
};

// const addOfferPost = async (req, res) => {
//     try {
//         const { offerType, referenceId, discountPercent } = req.body;
//         const newOffer = new Offer({
//             offerType,
//             referenceId,
//             discountPercent
//         });

//         await newOffer.save();
//         res.json({ message: 'Offer added successfully' });
//     } catch (error) {
//         console.error('Error adding offer:', error);
//         res.status(500).send('Server error');
//     }
// };
const addOfferPost = async (req, res) => {
  try {
    const { offerType, referenceId, discountPercent } = req.body;

    // Check if an offer already exists for the given reference
    const existingOffer = await Offer.findOne({ offerType, referenceId });
    if (existingOffer) {
      return res
        .status(400)
        .json({ message: "This product or category already has an offer" });
    }

    const newOffer = new Offer({
      offerType,
      referenceId,
      discountPercent,
    });

    await newOffer.save();
    res.json({ message: "Offer added successfully" });
  } catch (error) {
    console.error("Error adding offer:", error);
    res.status(500).send("Server error");
  }
};
// const editOfferPut = async (req, res) => {
//     try {
//         const { offerId } = req.params;
//         const { offerType, referenceId, discountPercent } = req.body;

//         const offer = await Offer.findById(offerId);
//         if (!offer) {
//             return res.status(404).send('Offer not found');
//         }

//         offer.offerType = offerType;
//         offer.referenceId = referenceId;
//         offer.discountPercent = discountPercent;

//         await offer.save();
//         res.json({ message: 'Offer edited successfully' });
//     } catch (error) {
//         console.error('Error editing offer:', error);
//         res.status(500).send('Server error');
//     }
// };
const editOfferPut = async (req, res) => {
  try {
    const { offerId } = req.params;
    const { offerType, referenceId, discountPercent } = req.body;

    // Check if an offer already exists for the given reference, excluding the current offer
    const existingOffer = await Offer.findOne({
      offerType,
      referenceId,
      _id: { $ne: offerId },
    });
    if (existingOffer) {
      return res
        .status(400)
        .json({ message: "This product or category already has an offer" });
    }

    const offer = await Offer.findById(offerId);
    if (!offer) {
      return res.status(404).send("Offer not found");
    }

    offer.offerType = offerType;
    offer.referenceId = referenceId;
    offer.discountPercent = discountPercent;

    await offer.save();
    res.json({ message: "Offer edited successfully" });
  } catch (error) {
    console.error("Error editing offer:", error);
    res.status(500).send("Server error");
  }
};
const removeOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    console.log(offerId);

    const offer = await Offer.findByIdAndDelete(offerId);

    res.json({ success: true, message: "Offer removed successfully" });
  } catch (error) {
    console.error("Error removing offer:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  offerGet,
  editOfferPut,
  addOfferPost,
  getReference,
  addOffer,
  editOfferGet,
  removeOffer,
};
