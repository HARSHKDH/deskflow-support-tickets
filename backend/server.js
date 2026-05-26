require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Ticket = require("./models/Ticket");

const app = express();
const PORT = process.env.PORT || 5000;

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());

// ─── DB CONNECTION ────────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

// ─── SLA TARGETS (minutes) ────────────────────────────────────────────────────
const SLA_TARGETS = { urgent: 60, high: 240, medium: 1440, low: 4320 };

// ─── STATUS ORDER + TRANSITION VALIDATOR ─────────────────────────────────────
const STATUS_ORDER = ["open", "in_progress", "resolved", "closed"];

function isValidTransition(from, to) {
  const fromIdx = STATUS_ORDER.indexOf(from);
  const toIdx = STATUS_ORDER.indexOf(to);
  if (fromIdx === -1 || toIdx === -1) return false;
  const diff = toIdx - fromIdx;
  return diff === 1 || diff === -1; // only one step forward OR one step back
}

// ─── DERIVE FIELDS ────────────────────────────────────────────────────────────
function deriveFields(ticket) {
  const t = ticket.toObject ? ticket.toObject() : { ...ticket };
  const now = new Date();
  const end = (t.status === "resolved" || t.status === "closed") && t.resolvedAt
    ? new Date(t.resolvedAt)
    : now;

  const ageMinutes = Math.floor((end - new Date(t.createdAt)) / 60000);
  const target = SLA_TARGETS[t.priority];

  let slaBreached = false;
  if (t.status === "resolved" || t.status === "closed") {
    if (t.resolvedAt) {
      const resolvedAge = Math.floor(
        (new Date(t.resolvedAt) - new Date(t.createdAt)) / 60000
      );
      slaBreached = resolvedAge > target;
    }
  } else {
    slaBreached = ageMinutes > target;
  }

  return { ...t, ageMinutes, slaBreached };
}

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => res.json({ status: "DeskFlow API running" }));

// ─── POST /tickets — Create ───────────────────────────────────────────────────
app.post("/tickets", async (req, res) => {
  try {
    const { subject, description, customerEmail, priority } = req.body;

    // Manual field-level validation for clear error messages
    const fields = {};
    if (!subject || !subject.trim()) fields.subject = "Subject is required";
    if (!description || !description.trim()) fields.description = "Description is required";
    if (!customerEmail) {
      fields.customerEmail = "Customer email is required";
    } else {
      const validator = require("validator");
      if (!validator.isEmail(customerEmail))
        fields.customerEmail = "Invalid email address";
    }
    if (!priority) {
      fields.priority = "Priority is required";
    } else if (!["low", "medium", "high", "urgent"].includes(priority)) {
      fields.priority = "Priority must be low, medium, high, or urgent";
    }

    if (Object.keys(fields).length > 0) {
      return res.status(400).json({ error: "Validation failed", fields });
    }

    const ticket = await Ticket.create({ subject, description, customerEmail, priority });
    return res.status(201).json(deriveFields(ticket));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── GET /tickets — List with combinable filters ──────────────────────────────
app.get("/tickets", async (req, res) => {
  try {
    const { status, priority, breached } = req.query;
    const query = {};

    if (status) {
      if (!["open", "in_progress", "resolved", "closed"].includes(status))
        return res.status(400).json({ error: "Invalid status filter" });
      query.status = status;
    }
    if (priority) {
      if (!["low", "medium", "high", "urgent"].includes(priority))
        return res.status(400).json({ error: "Invalid priority filter" });
      query.priority = priority;
    }

    const tickets = await Ticket.find(query).sort({ createdAt: -1 });
    let result = tickets.map(deriveFields);

    if (breached === "true") {
      result = result.filter((t) => t.slaBreached);
    }

    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── GET /tickets/stats — MUST be before /tickets/:id ────────────────────────
app.get("/tickets/stats", async (req, res) => {
  try {
    const all = await Ticket.find({});
    const derived = all.map(deriveFields);

    const byStatus = { open: 0, in_progress: 0, resolved: 0, closed: 0 };
    const byPriority = { low: 0, medium: 0, high: 0, urgent: 0 };
    let breachedOpenCount = 0;

    for (const t of derived) {
      if (byStatus[t.status] !== undefined) byStatus[t.status]++;
      if (byPriority[t.priority] !== undefined) byPriority[t.priority]++;
      if (t.slaBreached && t.status !== "resolved" && t.status !== "closed") {
        breachedOpenCount++;
      }
    }

    return res.json({ byStatus, byPriority, breachedOpenCount });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── PATCH /tickets/:id — Update status ──────────────────────────────────────
app.patch("/tickets/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status)
      return res.status(400).json({ error: "status field is required" });

    if (!["open", "in_progress", "resolved", "closed"].includes(status))
      return res.status(400).json({ error: `Invalid status: "${status}"` });

    const ticket = await Ticket.findById(id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    if (ticket.status === status)
      return res.json(deriveFields(ticket)); // no-op

    if (!isValidTransition(ticket.status, status)) {
      return res.status(400).json({
        error: `Invalid transition: "${ticket.status}" \u2192 "${status}". Only one step forward or one step backward is allowed.`,
      });
    }

    ticket.status = status;

    if (status === "resolved") {
      ticket.resolvedAt = new Date(); // set when resolved
    } else if (ticket.resolvedAt) {
      ticket.resolvedAt = null; // clear when moved back
    }

    await ticket.save();
    return res.json(deriveFields(ticket));
  } catch (err) {
    if (err.name === "CastError")
      return res.status(404).json({ error: "Ticket not found" });
    return res.status(500).json({ error: err.message });
  }
});

// ─── DELETE /tickets/:id ──────────────────────────────────────────────────────
app.delete("/tickets/:id", async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    return res.json({ message: "Ticket deleted successfully" });
  } catch (err) {
    if (err.name === "CastError")
      return res.status(404).json({ error: "Ticket not found" });
    return res.status(500).json({ error: err.message });
  }
});

// ─── START ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => console.log(`DeskFlow API running on port ${PORT}`));
