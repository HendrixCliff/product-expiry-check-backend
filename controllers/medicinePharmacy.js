const asyncErrorHandler = require("./../utils/asyncErrorHandler")
const CustomError = require("./../utils/CustomError")
const Medicine = require("./../models/Medicine")

exports.uploadMedicine = asyncErrorHandler(async (req, res, next) => {
  const { name, expiryDate, quantity, email, pushSubscription } = req.body;
  const imagePath = req.file ? req.file.path : null;

  let parsedSubscription;

  // ✅ Step 1: Parse & validate pushSubscription
  try {
    parsedSubscription = JSON.parse(pushSubscription);

    // Enforce required fields
    if (
      !parsedSubscription ||
      typeof parsedSubscription !== 'object' ||
      !parsedSubscription.endpoint ||
      typeof parsedSubscription.endpoint !== 'string' ||
      !parsedSubscription.keys ||
      typeof parsedSubscription.keys !== 'object' ||
      typeof parsedSubscription.keys.p256dh !== 'string' ||
      typeof parsedSubscription.keys.auth !== 'string'
    ) {
      console.error('❌ pushSubscription is missing required fields');
      return res.status(400).json({ error: 'Invalid pushSubscription format' });
    }

    console.log('✅ Parsed and validated subscription:', parsedSubscription);
  } catch (err) {
    console.error('❌ Failed to parse pushSubscription:', err.message);
    return res.status(400).json({ error: 'Invalid pushSubscription JSON' });
  }

  // ✅ Step 2: Proceed with saving the medicine
  try {
    const med = new Medicine({
      name,
      expiryDate,
      quantity,
      email,
      pushSubscription: parsedSubscription,
      imagePath,
    });

    const savedMedicine = await med.save();

    res.status(201).json(savedMedicine);
  } catch (error) {
    console.error('❌ DB save failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});




exports.getAllMedicines = asyncErrorHandler(async (req, res, next) => {
    const { expiryBefore, expiryAfter, page = 1, limit = 10 } = req.query;

    const query = {};

    if (expiryBefore) {
        query.expiryDate = { ...query.expiryDate, $lt: new Date(expiryBefore) };
    }

    if (expiryAfter) {
        query.expiryDate = { ...query.expiryDate, $gt: new Date(expiryAfter) };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [total, medicines] = await Promise.all([
        Medicine.countDocuments(query),
        Medicine.find(query)
            .select('-email') 
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ expiryDate: 1 })
    ]);

    const baseUrl = `${req.protocol}://${req.get('host')}`;

    const enhancedMedicines = medicines.map(med => {
        const medObj = med.toObject();
        if (medObj.imagePath) {
            medObj.imageUrl = `${baseUrl}${medObj.imagePath}`;
        }
        return medObj;
    });

    res.status(200).json({
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
        results: enhancedMedicines
    });
});

 exports.decrementMedicineStock = asyncErrorHandler( async (req, res) => {
  const { id } = req.params;

  try {
    const medicine = await Medicine.findById(id);
    if (!medicine) {
      return res.status(404).json({ error: 'Medicine not found' });
    }

    if (medicine.quantity <= 0) {
      return res.status(400).json({ error: 'No stock available' });
    }

    medicine.quantity -= 1;
    await medicine.save();

    res.status(200).json(medicine);
  } catch (error) {
    console.error('Error decrementing medicine:', error);
    res.status(500).json({ error: 'Server error' });
  }
});





exports.updateMedicine = asyncErrorHandler(async (req, res, next) => {
    const { id } = req.params;
    const updateData = {
        ...req.body
    };

    // If a new image is uploaded
    if (req.file) {
        updateData.imagePath = req.file.path;
    }

    const updatedMedicine = await Medicine.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true
    });

    if (!updatedMedicine) {
        return res.status(404).json({ error: "Medicine not found" });
    }

    res.status(200).json(updatedMedicine);
});

exports.deleteMedicine = asyncErrorHandler(async (req, res, next) => {
    const { id } = req.params;

    const deleted = await Medicine.findByIdAndDelete(id);

    if (!deleted) {
        return res.status(404).json({ error: "Medicine not found" });
    }

    res.status(200).json({ message: "Medicine deleted successfully" });
});
