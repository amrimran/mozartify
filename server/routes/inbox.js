require("dotenv").config();
const multer = require("multer");
const express = require("express"); 
const Feedback = require("../models/Feedback");
const Feedback2 = require("../models/Feedback2");

const router = express.Router();
const upload = multer();

router.get("/inbox-test", (req, res) => {
  console.log("🚀 INBOX TEST ROUTE HIT!");
  res.json({ message: "Inbox routes are working!", timestamp: new Date() });
});

router.post("/api/feedback", upload.none(), async (req, res) => {
  const { username, title, detail, user_id, attachment_url } = req.body;

  const feedback = new Feedback({
    username,
    title,
    detail,
    attachment_url,
    user_id,
    status: "pending", // Set default status
  });

  try {
    const savedFeedback = await feedback.save();
    res.status(201).json(savedFeedback);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/api/artwork-feedback", upload.none(), async (req, res) => {
  const { username, title, detail, user_id, attachment_url } = req.body;

  const feedback2 = new Feedback2({
    username,
    title,
    detail,
    attachment_url,
    user_id,
    status: "pending", // Set default status
  });

  try {
    const savedFeedback = await feedback2.save();
    res.status(201).json(savedFeedback);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get userID-based feedbacks endpoint for customer
router.get("/api/feedback", async (req, res) => {
  const { userId } = req.query;

  try {
    let feedbacks;
    if (userId) {
      feedbacks = await Feedback.find({ user_id: userId });
    } else {
      feedbacks = await Feedback.find();
    }
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

router.get("/api/artwork-feedback", async (req, res) => {
  const { userId } = req.query;

  try {
    let feedbacks;
    if (userId) {
      feedbacks = await Feedback2.find({ user_id: userId });
    } else {
      feedbacks = await Feedback2.find();
    }
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

// Get all feedbacks endpoint for admin
router.get("/api/feedback/all", async (req, res) => {
  try {
    const feedbacks = await Feedback.find(); // Fetch all feedbacks
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

// Delete feedback endpoint
router.delete("/api/feedback/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Feedback.findByIdAndDelete(id);
    res.status(200).json({ message: "Feedback deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete("/api/artwork-feedback/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Feedback2.findByIdAndDelete(id);
    res.status(200).json({ message: "Feedback deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update reply endpoint
router.post("/api/feedback/reply/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { message, sender } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const updateFields = {
      $push: {
        replies: {
          message,
          date: new Date(),
          sender: sender || "customer",
        },
      },
    };

    // Only update the unread status of the other party
    if (sender === "customer") {
      updateFields.$set = { isReadAdmin: false };
    } else if (sender === "admin") {
      updateFields.$set = { isReadCustomer: false };
    }

    const updatedFeedback = await Feedback.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    });

    if (!updatedFeedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.status(200).json(updatedFeedback);
  } catch (error) {
    console.error("Error in reply endpoint:", error);
    res.status(400).json({ message: error.message });
  }
});

router.post("/api/artwork-feedback/reply/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { message, sender } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const updateFields = {
      $push: {
        replies: {
          message,
          date: new Date(),
          sender: sender || "customer",
        },
      },
    };

    // Only update the unread status of the other party
    if (sender === "customer") {
      updateFields.$set = { isReadAdmin: false };
    } else if (sender === "admin") {
      updateFields.$set = { isReadCustomer: false };
    }

    const updatedFeedback = await Feedback2.findByIdAndUpdate(
      id,
      updateFields,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedFeedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.status(200).json(updatedFeedback);
  } catch (error) {
    console.error("Error in reply endpoint:", error);
    res.status(400).json({ message: error.message });
  }
});

// New endpoint to update feedback status (admin only)
router.patch("/api/feedback/status/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["pending", "resolved"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updatedFeedback = await Feedback.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedFeedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.status(200).json(updatedFeedback);
  } catch (error) {
    console.error("Error updating feedback status:", error);
    res.status(400).json({ message: error.message });
  }
});

router.patch("/api/artwork-feedback/status/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["pending", "resolved"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updatedFeedback = await Feedback2.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedFeedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.status(200).json(updatedFeedback);
  } catch (error) {
    console.error("Error updating feedback status:", error);
    res.status(400).json({ message: error.message });
  }
});

router.put("/api/feedback/:id/mark-read-customer", async (req, res) => {
  try {
    await Feedback.findByIdAndUpdate(req.params.id, { isReadCustomer: true });
    res.json({ message: "Feedback marked as read by customer" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

router.put("/api/artwork-feedback/:id/mark-read-customer", async (req, res) => {
  try {
    await Feedback2.findByIdAndUpdate(req.params.id, { isReadCustomer: true });
    res.json({ message: "Feedback marked as read by customer" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

router.put("/api/feedback/:id/mark-read-admin", async (req, res) => {
  try {
    await Feedback.findByIdAndUpdate(req.params.id, { isReadAdmin: true });
    res.json({ message: "Feedback marked as read by admin" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

router.put("/api/artwork-feedback/:id/mark-read-admin", async (req, res) => {
  try {
    await Feedback2.findByIdAndUpdate(req.params.id, { isReadAdmin: true });
    res.json({ message: "Feedback marked as read by admin" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

console.log("🔍 INBOX ROUTER DEBUG INFO:");
console.log("Router exists:", !!router);
console.log("Router stack length:", router.stack ? router.stack.length : 'undefined');
console.log("Router type:", typeof router);

if (router.stack) {
  console.log("Routes in stack:");
  router.stack.forEach((layer, index) => {
    console.log(`  ${index}: ${layer.route?.path || 'middleware'}`);
  });
}

module.exports = router;
