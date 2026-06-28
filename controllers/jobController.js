const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');

exports.createJob = async (req, res) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ success: false, message: 'Request body is required', data: null });
        }

        const { title, companyName, description, salary } = req.body;
        if (!title || !companyName || !description || !salary) {
            return res.status(400).json({ success: false, message: 'title, companyName, description and salary are required', data: null });
        }

        const job = await Job.create({
            title,
            companyName,
            description,
            salary,
            createdBy: req.user._id
        });

        return res.status(201).json({ success: true, message: 'Job created successfully', data: job });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message, data: null });
    }
};

exports.getJobs = async (req, res) => {
    try {
        const jobs = await Job.find().populate('createdBy', 'name').sort({ createdAt: -1 });
        return res.status(200).json({ success: true, message: 'Jobs fetched successfully', data: jobs });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message, data: null });
    }
};

exports.getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id).populate('createdBy', 'name email');
        if (!job) return res.status(404).json({ success: false, message: 'Job not found', data: null });
        return res.status(200).json({ success: true, message: 'Job fetched successfully', data: job });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message, data: null });
    }
};

exports.applyForJob = async (req, res) => {
    try {
        const { id: jobId } = req.params;

        const job = await Job.findById(jobId);
        if (!job) return res.status(404).json({ success: false, message: 'Job not found', data: null });

        // Prevent duplicate applications
        const existing = await JobApplication.findOne({ jobId, applicantId: req.user._id });
        if (existing) {
            return res.status(400).json({ success: false, message: 'You have already applied for this job', data: null });
        }

        const application = await JobApplication.create({
            jobId,
            applicantId: req.user._id,
            status: 'applied'
        });

        return res.status(201).json({ success: true, message: 'Application submitted successfully', data: application });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message, data: null });
    }
};

exports.getApplicationsForJob = async (req, res) => {
    try {
        const { id: jobId } = req.params;

        // Only the rep who created the job can see applications
        const job = await Job.findById(jobId);
        if (!job) return res.status(404).json({ success: false, message: 'Job not found', data: null });

        if (job.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Access denied', data: null });
        }

        const applications = await JobApplication.find({ jobId })
            .populate('applicantId', 'name email contactNumber role');

        return res.status(200).json({ success: true, message: 'Applications fetched successfully', data: applications });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message, data: null });
    }
};

exports.getMyApplications = async (req, res) => {
    try {
        const applications = await JobApplication.find({ applicantId: req.user._id })
            .populate('jobId', 'title companyName salary');

        return res.status(200).json({ success: true, message: 'Applications fetched successfully', data: applications });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message, data: null });
    }
};

exports.updateApplicationStatus = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { status } = req.body;

        if (!['reviewed', 'accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status', data: null });
        }

        const application = await JobApplication.findById(applicationId).populate('jobId');
        if (!application) return res.status(404).json({ success: false, message: 'Application not found', data: null });

        if (application.jobId.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Access denied', data: null });
        }

        application.status = status;
        await application.save();

        return res.status(200).json({ success: true, message: `Application marked as ${status}`, data: application });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message, data: null });
    }
};
