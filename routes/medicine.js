const express = require('express');
const router = express.Router();
const { uploadMedicine, updateMedicine, decrementMedicineStock, deleteMedicine, getAllMedicines } = require("./../controllers/medicinePharmacy");


const upload = require("./../utils/cloudinaryStorage");


router.post('/', upload.single('image'), uploadMedicine);

router.patch('/medicines/:id/decrement', decrementMedicineStock);

router.get('/', getAllMedicines);

router.put('/:id', upload.single('image'), updateMedicine);

router.delete('/:id', deleteMedicine);

module.exports = router;
