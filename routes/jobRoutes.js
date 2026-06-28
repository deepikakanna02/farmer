const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    createJob,
    getJobs,
    getJobById,
    applyForJob,
    getApplicationsForJob,
    getMyApplications,
    updateApplicationStatus
} = require('../controllers/jobController');

router.post('/', protect, authorize('representative'), createJob);                              // Rep: post job
router.get('/', protect, getJobs);                                                              // All: browse jobs
router.get('/my-applications', protect, getMyApplications);                                    // All: my job applications
router.get('/:id', protect, getJobById);                                                        // All: job detail
router.post('/:id/apply', protect, authorize('farmer', 'buyer'), applyForJob);                 // Farmer/Buyer: apply
router.get('/:id/applications', protect, authorize('representative'), getApplicationsForJob);   // Rep: view applications
router.put('/applications/:applicationId', protect, authorize('representative'), updateApplicationStatus); // Rep: update status

module.exports = router;
