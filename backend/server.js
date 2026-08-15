const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const pool = require("./db");

const app = express();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
app.use(
  cors({
    origin: process.env.FRONTEND_URL || true,
    credentials: true,
  })
);
app.use(express.json());



// Test
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});
const uploadFolder = path.join(__dirname, "uploads");

// Create uploads folder automatically if it does not exist
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, {
    recursive: true
  });

  console.log("✅ Uploads folder created");
}

// Allow browser to access uploaded images
app.use(
  "/uploads",
  express.static(uploadFolder)
);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder);
  },

  filename: (req, file, cb) => {
    const fileExtension = path
      .extname(file.originalname)
      .toLowerCase();

    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      fileExtension;

    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp"
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only JPG, PNG and WEBP images are allowed"
      )
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});
// Customer Register
app.post("/register", async (req, res) => {
  try {
    const { full_name, email, password, phone } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newCustomer = await pool.query(
      `INSERT INTO customer
      (full_name, email, password, phone)
      VALUES ($1, $2, $3, $4)
      RETURNING customer_id, full_name, email, phone`,
      [full_name, email, hashedPassword, phone]
    );

    res.json(newCustomer.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Registration failed" });
  }
});

// Customer Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await pool.query(
      "SELECT * FROM customer WHERE email = $1",
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(401).json({ message: "Invalid Email" });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.rows[0].password
    );

    if (!validPassword) {
      return res.status(401).json({ message: "Invalid Password" });
    }

    res.json({
      message: "Login Successful",
      user: {
        customer_id: user.rows[0].customer_id,
        full_name: user.rows[0].full_name,
        email: user.rows[0].email,
        phone: user.rows[0].phone
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server Error" });
  }
});
// Get Customer Profile
app.get("/customer/profile/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params;

    const result = await pool.query(
      `
      SELECT
        customer_id,
        full_name,
        email,
        phone,
        nationality,
        ic_passport_no,
        address,
        license_no,
        license_photo,
        license_validity
      FROM customer
      WHERE customer_id = $1
      `,
      [customerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Customer not found"
      });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.log(err.message);

    res.status(500).json({
      message: err.message
    });
  }
});
app.put("/customer/change-password/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    const result = await pool.query(
      "SELECT password FROM customer WHERE customer_id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    const isMatch = await bcrypt.compare(
      currentPassword,
      result.rows[0].password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Current password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      "UPDATE customer SET password = $1 WHERE customer_id = $2",
      [hashedPassword, id]
    );

    res.json({
      message: "Password changed successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server Error",
    });
  }
});
// Update Customer Profile
app.put(
  "/customer/profile/:customerId",
  upload.single("license_photo"),
  async (req, res) => {
    try {
      const { customerId } = req.params;

      const {
        full_name,
        phone,
        nationality,
        ic_passport_no,
        address,
        license_no,
        license_validity,
      } = req.body;

      const existingCustomer = await pool.query(
        "SELECT * FROM customer WHERE customer_id = $1",
        [customerId]
      );

      if (existingCustomer.rows.length === 0) {
        return res.status(404).json({
          message: "Customer not found",
        });
      }

      const oldLicensePhoto =
        existingCustomer.rows[0].license_photo;

      const newLicensePhoto = req.file
        ? req.file.filename
        : oldLicensePhoto;

      const expiryDate =
        license_validity && license_validity.trim() !== ""
          ? license_validity
          : null;

      const result = await pool.query(
        `UPDATE customer
         SET full_name = $1,
             phone = $2,
             nationality = $3,
             ic_passport_no = $4,
             address = $5,
             license_no = $6,
             license_photo = $7,
             license_validity = $8
         WHERE customer_id = $9
         RETURNING *`,
        [
          full_name,
          phone,
          nationality,
          ic_passport_no,
          address,
          license_no,
          newLicensePhoto,
          expiryDate,
          customerId,
        ]
      );

      res.json({
        message: "Profile updated successfully",
        customer: result.rows[0],
      });
    } catch (err) {
      console.error("Profile update error:", err);

      res.status(500).json({
        message: "Failed to update profile",
        error: err.message,
      });
    }
  }
);
app.post("/contact-messages", async (req, res) => {
  try {
    const { full_name, email, subject, message } = req.body;

    if (!full_name || !email || !subject || !message) {
      return res.status(400).json({
        message: "Please fill in all fields",
      });
    }

    await pool.query(
      `INSERT INTO contact_messages
       (full_name, email, subject, message)
       VALUES ($1, $2, $3, $4)`,
      [full_name, email, subject, message]
    );

    res.status(201).json({
      message: "Message sent successfully",
    });
  } catch (error) {
    console.error("Contact message error:", error);

    res.status(500).json({
      message: "Failed to send message",
    });
  }
});
app.get("/admin/contact-messages", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM contact_messages
       ORDER BY created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Load contact messages error:", error);

    res.status(500).json({
      message: "Failed to load contact messages",
      error: error.message,
    });
  }
});
app.put(
  "/admin/contact-messages/:messageId/status",
  async (req, res) => {
    try {
      const { messageId } = req.params;
      const { status } = req.body;

      const allowedStatuses = [
        "Unread",
        "Read",
        "Replied",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid message status",
        });
      }

      const result = await pool.query(
        `UPDATE contact_messages
         SET status = $1
         WHERE message_id = $2
         RETURNING *`,
        [status, messageId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Contact message not found",
        });
      }

      res.json({
        message: "Message status updated",
        contact_message: result.rows[0],
      });
    } catch (error) {
      console.error("Update contact status error:", error);

      res.status(500).json({
        message: "Failed to update message status",
        error: error.message,
      });
    }
  }
);
app.delete(
  "/admin/contact-messages/:messageId",
  async (req, res) => {
    try {
      const { messageId } = req.params;

      const result = await pool.query(
        `DELETE FROM contact_messages
         WHERE message_id = $1
         RETURNING *`,
        [messageId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Contact message not found",
        });
      }

      res.json({
        message: "Contact message deleted successfully",
      });
    } catch (error) {
      console.error("Delete contact message error:", error);

      res.status(500).json({
        message: "Failed to delete contact message",
        error: error.message,
      });
    }
  }
);
// Cars
app.get("/cars", async (req, res) => {
  try {
    const allCars = await pool.query(
      "SELECT * FROM car ORDER BY car_id ASC"
    );

    res.json(allCars.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Single Car
app.get("/cars/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const car = await pool.query(
      "SELECT * FROM car WHERE car_id = $1",
      [id]
    );

    res.json(car.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
// Get one selected car
app.get("/car/:carId", async (req, res) => {
  try {
    const { carId } = req.params;

    const result = await pool.query(
      `
      SELECT
        car_id,
        vehicle_name,
        brand,
        model,
        vehicle_image,
        rental_price_per_day,
        seat_capacity,
        baggage_capacity
      FROM car
      WHERE car_id = $1
      `,
      [carId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Car not found."
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Get car error:", error);

    res.status(500).json({
      message: "Failed to load selected car."
    });
  }
});
// Booking
app.post("/booking", async (req, res) => {
  try {
    const {
      customer_id,
      car_id,
      service_type,
      pickup_option,
      pickup_date,
      pickup_time,
      return_date,
      pickup_location,
      dropoff_location,
      baggage_qty,
      large_baggage,
      special_instruction
    } = req.body;

    // Basic validation
    if (
      !customer_id ||
      !car_id ||
      !service_type ||
      !pickup_date ||
      !pickup_location ||
      !dropoff_location
    ) {
      return res.status(400).json({
        message: "Please complete all required booking details."
      });
    }
    // Check customer driving licence for Self Drive
if (service_type === "Self Drive") {
  const customerResult = await pool.query(
    `
    SELECT
      license_no,
      license_photo,
      license_validity
    FROM customer
    WHERE customer_id = $1
    `,
    [customer_id]
  );

  if (customerResult.rows.length === 0) {
    return res.status(404).json({
      message: "Customer profile was not found."
    });
  }

  const customerProfile = customerResult.rows[0];

  if (
    !customerProfile.license_no ||
    !customerProfile.license_photo ||
    !customerProfile.license_validity
  ) {
    return res.status(403).json({
      message:
        "Self Drive requires a driving licence number, licence photo and validity date. Please update My Profile."
    });
  }

  const expiryDate = new Date(
    customerProfile.license_validity
  );

  const todayDate = new Date();

  expiryDate.setHours(0, 0, 0, 0);
  todayDate.setHours(0, 0, 0, 0);

  if (
    Number.isNaN(expiryDate.getTime()) ||
    expiryDate < todayDate
  ) {
    return res.status(403).json({
      message:
        "Your driving licence has expired. Please update your licence validity date."
    });
  }
}
    if (
      service_type === "Delivery Only" &&
      (!baggage_qty || Number(baggage_qty) < 1)
    ) {
      return res.status(400).json({
        message: "Please enter a valid baggage quantity."
      });
    }
    // Get service charges from system settings
    const settingsResult = await pool.query(`
      SELECT setting_name, setting_value
      FROM system_settings
      WHERE setting_name IN (
        'driver_daily_charge',
        'delivery_fee'
      )
    `);

    const settings = {};

    settingsResult.rows.forEach((item) => {
      settings[item.setting_name] = Number(
        item.setting_value
      );
    });

    const driverDailyCharge =
      settings.driver_daily_charge || 0;

    const deliveryFee =
      settings.delivery_fee || 0;


    // Get selected car price
    const carResult = await pool.query(
      `
      SELECT
          rental_price_per_day,
          baggage_capacity
      FROM car
      WHERE car_id = $1
      `,
      [car_id]
    );

    if (carResult.rows.length === 0) {
      return res.status(404).json({
        message: "Selected car was not found."
      });
    }

    const pricePerDay = Number(
      carResult.rows[0].rental_price_per_day
    );
    const baggageCapacity = Number(
      carResult.rows[0].baggage_capacity || 0
    );
    let totalDays = 1;
    let carRentalAmount = 0;
    let driverCharge = 0;
    let deliveryCharge = 0;
    let driverEarning = 0;
    let totalAmount = 0;

    // Delivery Only calculation
    if (service_type === "Delivery Only") {
      const requestedBaggageQty = Number(baggage_qty);

      if (requestedBaggageQty > baggageCapacity) {
        return res.status(400).json({
          message:
            `This vehicle can carry only ${baggageCapacity} baggage item(s). ` +
            `You entered ${requestedBaggageQty} baggage item(s). ` +
            "Please choose another vehicle with a larger baggage capacity. " +
            "If the actual baggage exceeds the declared quantity during pickup, additional charges may apply."
        });
      }

      totalDays = 1;
      deliveryCharge = deliveryFee;
      driverEarning = deliveryCharge;
      totalAmount = deliveryCharge;
    } else {
      if (!return_date) {
        return res.status(400).json({
          message: "Please select a return date."
        });
      }

      const startDate = new Date(pickup_date);
      const endDate = new Date(return_date);

      if (endDate < startDate) {
        return res.status(400).json({
          message: "Return date cannot be before pickup date."
        });
      }

      const difference =
        endDate.getTime() - startDate.getTime();

      totalDays = Math.max(
        1,
        Math.ceil(
          difference / (1000 * 60 * 60 * 24)
        )
      );

      carRentalAmount = pricePerDay * totalDays;

      if (service_type === "Include Driver") {
        driverCharge = driverDailyCharge * totalDays;
        driverEarning = driverCharge;

      }

      totalAmount =
        carRentalAmount + driverCharge;
    }
    const bookingReference = `BK${Date.now()}`;
    const result = await pool.query(
      `
      INSERT INTO booking (
        booking_reference,
        customer_id,
        car_id,
        service_type,
        pickup_option,
        pickup_date,
        pickup_time,
        return_date,
        pickup_location,
        dropoff_location,
        baggage_qty,
        large_baggage,
        special_instruction,
        total_days,
        total_amount,
        driver_earning,
        booking_status
      )
      
      VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15,
        $16, $17
      )
      RETURNING *
      `,
      [
        bookingReference,
        customer_id,
        car_id,
        service_type,
        pickup_option,
        pickup_date,
        pickup_time,
        return_date,
        pickup_location,
        dropoff_location,

        service_type === "Delivery Only"
          ? Number(baggage_qty)
          : null,

        service_type === "Delivery Only"
          ? large_baggage
          : null,

        service_type === "Delivery Only"
          ? special_instruction
          : null,

        totalDays,
        totalAmount,
        driverEarning,
        "Pending"
      ]
    );

    res.status(201).json({
      message: "Booking created successfully",
      booking_id: result.rows[0].booking_id
    });
  } catch (error) {
    console.error("Booking error:", error);

    res.status(500).json({
      message: "Failed to create booking."
    });
  }
});
// Payment
app.post("/payment", async (req, res) => {
  try {
    const { booking_id, payment_method, payment_amount } = req.body;

    const result = await pool.query(
      `INSERT INTO payment
      (
        booking_id,
        payment_method,
        payment_amount,
        payment_status,
        transaction_reference
      )
      VALUES ($1,$2,$3,$4,$5)
      RETURNING *`,
      [
        booking_id,
        payment_method,
        payment_amount,
        "Paid",
        "TXN" + Date.now()
      ]
    );

    res.json({
      message: "Payment Successful",
      payment: result.rows[0]
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Payment failed" });
  }
});
// Booking Summary
app.get("/booking/:bookingId", async (req, res) => {
  try {
    const { bookingId } = req.params;

    const result = await pool.query(
      `
      SELECT
        b.booking_id,
        b.booking_reference,
        b.customer_id,
        b.car_id,
        b.service_type,
        b.pickup_option,
        b.pickup_date,
        b.pickup_time,
        b.return_date,
        b.pickup_location,
        b.dropoff_location,
        b.baggage_qty,
        b.large_baggage,
        b.special_instruction,
        b.total_days,
        b.total_amount,
        b.booking_status,
        COALESCE(p.payment_status, 'Unpaid') AS payment_status,

        c.full_name AS customer_name,

        car.vehicle_name,
        car.brand,
        car.model,
        car.vehicle_image,
        car.rental_price_per_day

      FROM booking b

      JOIN customer c
        ON b.customer_id = c.customer_id

      JOIN car
        ON b.car_id = car.car_id
      
      LEFT JOIN payment p
        ON b.booking_id = p.booking_id

      WHERE b.booking_id = $1
      `,
      [bookingId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Booking was not found."
      });
    }

    const booking = result.rows[0];

    const pricePerDay = Number(
      booking.rental_price_per_day || 0
    );

    const totalDays = Number(
      booking.total_days || 1
    );

    let carRentalAmount = 0;
    let driverCharge = 0;
    let deliveryCharge = 0;

    if (booking.service_type === "Delivery Only") {
      deliveryCharge = Number(
        booking.total_amount
      );
    } else {
      carRentalAmount =
        pricePerDay * totalDays;

      if (
        booking.service_type === "Include Driver"
      ) {
        driverCharge = Number(booking.total_amount) - carRentalAmount;
      }
    }
    res.json({
      ...booking,
      payment_status: booking.payment_status,
      car_rental_amount: carRentalAmount,
      driver_charge: driverCharge,
      delivery_charge: deliveryCharge
    });
  } catch (error) {
    console.error(
      "Booking summary error:",
      error
    );

    res.status(500).json({
      message: "Failed to load booking summary."
    });
  }
});
// My Bookings
app.get("/my-bookings/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params;

    const result = await pool.query(
      `
      SELECT
        b.booking_id,
        b.booking_reference,
        b.service_type,
        b.pickup_date,
        b.return_date,
        b.booking_status,
        b.total_amount,
        p.payment_status,
        car.vehicle_name,
        car.brand,
        car.model,
        car.vehicle_image
      FROM booking b

      JOIN car
      ON b.car_id = car.car_id

      LEFT JOIN payment p
      ON b.booking_id = p.booking_id

      WHERE b.customer_id = $1

      ORDER BY b.booking_id DESC
      `,
      [customerId]
    );

    res.json(result.rows);

  } catch (err) {
    console.log(err.message);

    res.status(500).json({
      message: "Failed to load bookings"
    });
  }
});
// Admin Register
app.post("/admin/register", async (req, res) => {
  try {
    const {
      full_name,
      email,
      password,
      phone
    } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({
        message: "Full name, email and password are required"
      });
    }

    const checkAdmin = await pool.query(
      "SELECT admin_id FROM admin WHERE email = $1",
      [email]
    );

    if (checkAdmin.rows.length > 0) {
      return res.status(400).json({
        message: "Admin already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `
      INSERT INTO admin
      (
        full_name,
        email,
        password,
        phone,
        role
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        admin_id,
        full_name,
        email,
        phone,
        role
      `,
      [
        full_name,
        email,
        hashedPassword,
        phone || null,
        "Admin"
      ]
    );

    res.status(201).json({
      message: "Admin created successfully",
      admin: result.rows[0]
    });

  } catch (err) {
    console.error("Admin registration error:", err);

    res.status(500).json({
      message: err.message
    });
  }
});
// Admin Login
app.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const result = await pool.query(
      "SELECT * FROM admin WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const admin = result.rows[0];

    const validPassword = await bcrypt.compare(
      password,
      admin.password
    );

    if (!validPassword) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    res.json({
      message: "Admin Login Successful",
      admin: {
        admin_id: admin.admin_id,
        full_name: admin.full_name,
        email: admin.email,
        phone: admin.phone,
        role: admin.role
      }
    });

  } catch (err) {
    console.error("Admin login error:", err);

    res.status(500).json({
      message: err.message
    });
  }
});
app.get("/admin/dashboard", async (req, res) => {
  try {
    const [
      cars,
      customers,
      bookings,
      revenue,
      pendingBookings,
      unreadMessages
    ] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM car"),
      pool.query("SELECT COUNT(*) FROM customer"),
      pool.query("SELECT COUNT(*) FROM booking"),
      pool.query(`
        SELECT COALESCE(SUM(payment_amount),0) AS total
        FROM payment
        WHERE payment_status='Paid'
      `),
      pool.query(`
        SELECT COUNT(*) 
        FROM booking
        WHERE booking_status='Pending'
      `),
      pool.query(`
        SELECT COUNT(*)
        FROM contact_messages
        WHERE status='Unread'
      `)
    ]);

    res.json({
      total_cars: Number(cars.rows[0].count),
      total_customers: Number(customers.rows[0].count),
      total_bookings: Number(bookings.rows[0].count),
      total_revenue: Number(revenue.rows[0].total),

      // NEW
      pending_bookings: Number(
        pendingBookings.rows[0].count
      ),

      unread_messages: Number(
        unreadMessages.rows[0].count
      )
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Failed to load dashboard"
    });
  }
});
// Get All Bookings (Admin)
app.get("/admin/bookings", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        b.booking_id,
        b.booking_reference,
        b.service_type,
        b.pickup_date,
        b.return_date,
        b.total_amount,
        b.booking_status,
        c.full_name AS customer_name,
        car.vehicle_name,
        p.payment_status
      FROM booking b
      JOIN customer c
        ON b.customer_id = c.customer_id
      JOIN car
        ON b.car_id = car.car_id
      LEFT JOIN payment p
        ON b.booking_id = p.booking_id
      ORDER BY b.booking_id DESC
    `);

    res.json(result.rows);

  } catch (err) {
    console.error("Load bookings error:", err.message);

    res.status(500).json({
      message: "Failed to load bookings"
    });
  }
});
app.put(
  "/admin/booking/approve/:bookingId",
  async (req, res) => {
    try {
      const { bookingId } = req.params;

      const payment = await pool.query(
        `
        SELECT payment_status
        FROM payment
        WHERE booking_id = $1
        ORDER BY payment_id DESC
        LIMIT 1
        `,
        [bookingId]
      );

      if (
        payment.rows.length === 0 ||
        payment.rows[0].payment_status !== "Paid"
      ) {
        return res.status(400).json({
          message:
            "Only paid bookings can be approved"
        });
      }

      const result = await pool.query(
        `
        UPDATE booking
        SET booking_status = 'Confirmed'
        WHERE booking_id = $1
        RETURNING *
        `,
        [bookingId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Booking not found"
        });
      }

      res.json({
        message:
          "Booking approved successfully",
        booking: result.rows[0]
      });
    } catch (err) {
      console.error(err.message);

      res.status(500).json({
        message: "Failed to approve booking"
      });
    }
  }
);

app.put("/admin/booking/reject/:bookingId", async (req,res)=>{

  try{

    const { bookingId } = req.params;

    await pool.query(
      "UPDATE booking SET booking_status='Cancelled' WHERE booking_id=$1",
      [bookingId]
    );

    res.json({
      message:"Booking Cancelled"
    });

  }catch(err){

    console.log(err.message);

    res.status(500).json({
      message:err.message
    });

  }

});
// Add Car
app.post("/admin/cars", async (req, res) => {
  try {
    const {
      vehicle_name,
      brand,
      model,
      plate_no,
      transmission_type,
      seat_capacity,
      rental_price_per_day,
      availability_status,
      vehicle_image
    } = req.body;

    if (
      !vehicle_name ||
      !brand ||
      !model ||
      !plate_no ||
      !transmission_type ||
      !seat_capacity ||
      !rental_price_per_day
    ) {
      return res.status(400).json({
        message: "Please complete all required car details"
      });
    }

    const existingCar = await pool.query(
      "SELECT car_id FROM car WHERE plate_no = $1",
      [plate_no]
    );

    if (existingCar.rows.length > 0) {
      return res.status(400).json({
        message: "Plate number already exists"
      });
    }

    const result = await pool.query(
      `
      INSERT INTO car
      (
        vehicle_name,
        brand,
        model,
        plate_no,
        transmission_type,
        seat_capacity,
        rental_price_per_day,
        availability_status,
        vehicle_image
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *
      `,
      [
        vehicle_name,
        brand,
        model,
        plate_no,
        transmission_type,
        Number(seat_capacity),
        Number(rental_price_per_day),
        availability_status || "Available",
        vehicle_image || null
      ]
    );

    res.status(201).json({
      message: "Car added successfully",
      car: result.rows[0]
    });
  } catch (err) {
    console.error("Add car error:", err.message);

    res.status(500).json({
      message: err.message
    });
  }
});

// Update Car
app.put("/admin/cars/:carId", async (req, res) => {
  try {
    const { carId } = req.params;

    const {
      vehicle_name,
      brand,
      model,
      plate_no,
      transmission_type,
      seat_capacity,
      rental_price_per_day,
      availability_status,
      vehicle_image
    } = req.body;

    const duplicatePlate = await pool.query(
      `
      SELECT car_id
      FROM car
      WHERE plate_no = $1
      AND car_id != $2
      `,
      [plate_no, carId]
    );

    if (duplicatePlate.rows.length > 0) {
      return res.status(400).json({
        message: "Plate number is used by another car"
      });
    }

    const result = await pool.query(
      `
      UPDATE car
      SET
        vehicle_name = $1,
        brand = $2,
        model = $3,
        plate_no = $4,
        transmission_type = $5,
        seat_capacity = $6,
        rental_price_per_day = $7,
        availability_status = $8,
        vehicle_image = $9
      WHERE car_id = $10
      RETURNING *
      `,
      [
        vehicle_name,
        brand,
        model,
        plate_no,
        transmission_type,
        Number(seat_capacity),
        Number(rental_price_per_day),
        availability_status,
        vehicle_image || null,
        carId
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Car not found"
      });
    }

    res.json({
      message: "Car updated successfully",
      car: result.rows[0]
    });
  } catch (err) {
    console.error("Update car error:", err.message);

    res.status(500).json({
      message: err.message
    });
  }
});

// Delete Car
app.delete("/admin/cars/:carId", async (req, res) => {
  try {
    const { carId } = req.params;

    const bookingCheck = await pool.query(
      `
      SELECT booking_id
      FROM booking
      WHERE car_id = $1
      LIMIT 1
      `,
      [carId]
    );

    if (bookingCheck.rows.length > 0) {
      return res.status(400).json({
        message:
          "This car has booking records and cannot be deleted. Set it as Unavailable instead."
      });
    }

    const result = await pool.query(
      `
      DELETE FROM car
      WHERE car_id = $1
      RETURNING *
      `,
      [carId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Car not found"
      });
    }

    res.json({
      message: "Car deleted successfully"
    });
  } catch (err) {
    console.error("Delete car error:", err.message);

    res.status(500).json({
      message: err.message
    });
  }
});
app.post(
  "/admin/upload-car-image",
  upload.single("image"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        message: "Please select an image"
      });
    }

    res.json({
      message: "Image uploaded successfully",
      filename: req.file.filename,
      image_url: `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
    });
  }
);
// Get all customers
app.get("/admin/customers", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        c.customer_id,
        c.full_name,
        c.email,
        c.phone,
        c.created_at,
        COUNT(b.booking_id)::INTEGER AS total_bookings
      FROM customer c
      LEFT JOIN booking b
        ON c.customer_id = b.customer_id
      GROUP BY
        c.customer_id,
        c.full_name,
        c.email,
        c.phone,
        c.created_at
      ORDER BY c.customer_id DESC
      `
    );

    res.json(result.rows);
  } catch (err) {
    console.error(
      "Load customers error:",
      err.message
    );

    res.status(500).json({
      message: err.message
    });
  }
});

// Update customer
app.put(
  "/admin/customers/:customerId",
  async (req, res) => {
    try {
      const { customerId } = req.params;

      const {
        full_name,
        email,
        phone
      } = req.body;

      if (
        !full_name?.trim() ||
        !email?.trim()
      ) {
        return res.status(400).json({
          message:
            "Full name and email are required"
        });
      }

      const normalizedEmail = email
        .trim()
        .toLowerCase();

      const duplicateEmail = await pool.query(
        `
        SELECT customer_id
        FROM customer
        WHERE LOWER(email) = $1
        AND customer_id != $2
        `,
        [normalizedEmail, customerId]
      );

      if (duplicateEmail.rows.length > 0) {
        return res.status(400).json({
          message:
            "Email is already used by another customer"
        });
      }

      const result = await pool.query(
        `
        UPDATE customer
        SET
          full_name = $1,
          email = $2,
          phone = $3
        WHERE customer_id = $4
        RETURNING
          customer_id,
          full_name,
          email,
          phone,
          created_at
        `,
        [
          full_name.trim(),
          normalizedEmail,
          phone?.trim() || null,
          customerId
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Customer not found"
        });
      }

      const bookingCount = await pool.query(
        `
        SELECT COUNT(*)::INTEGER AS total_bookings
        FROM booking
        WHERE customer_id = $1
        `,
        [customerId]
      );

      res.json({
        message:
          "Customer updated successfully",
        customer: {
          ...result.rows[0],
          total_bookings:
            bookingCount.rows[0].total_bookings
        }
      });
    } catch (err) {
      console.error(
        "Update customer error:",
        err.message
      );

      res.status(500).json({
        message: err.message
      });
    }
  }
);

// Delete customer
app.delete(
  "/admin/customers/:customerId",
  async (req, res) => {
    try {
      const { customerId } = req.params;

      const bookingCheck = await pool.query(
        `
        SELECT booking_id
        FROM booking
        WHERE customer_id = $1
        LIMIT 1
        `,
        [customerId]
      );

      if (bookingCheck.rows.length > 0) {
        return res.status(400).json({
          message:
            "This customer has booking records and cannot be deleted."
        });
      }

      const result = await pool.query(
        `
        DELETE FROM customer
        WHERE customer_id = $1
        RETURNING customer_id
        `,
        [customerId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Customer not found"
        });
      }

      res.json({
        message:
          "Customer deleted successfully"
      });
    } catch (err) {
      console.error(
        "Delete customer error:",
        err.message
      );

      res.status(500).json({
        message: err.message
      });
    }
  }
);
// Admin Payment Records
app.get("/admin/payments", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        p.payment_id,
        p.booking_id,
        p.payment_method,
        p.payment_amount,
        p.payment_status,
        p.transaction_reference,
        p.payment_date,
        b.booking_reference,
        c.full_name AS customer_name,
        car.vehicle_name
      FROM payment p
      JOIN booking b
        ON p.booking_id = b.booking_id
      JOIN customer c
        ON b.customer_id = c.customer_id
      JOIN car
        ON b.car_id = car.car_id
      ORDER BY p.payment_id DESC
      `
    );

    res.json(result.rows);
  } catch (err) {
    console.error(
      "Load payment records error:",
      err.message
    );

    res.status(500).json({
      message: err.message
    });
  }
});
// Get all drivers
app.get("/admin/drivers", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        driver_id,
        full_name,
        email,
        phone,
        address,
        nric_no,
        license_no,
        license_photo,
        license_validity,
        driver_photo,
        driver_fee_per_day,
        delivery_fee,
        status,
        created_at
      FROM driver
      ORDER BY driver_id DESC
      `
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Load drivers error:", err.message);

    res.status(500).json({
      message: err.message
    });
  }
});

// Add driver
app.post("/admin/drivers", async (req, res) => {
  try {
    const {
      full_name,
      email,
      password,
      phone,
      address,
      nric_no,
      license_no,
      license_photo,
      license_validity,
      driver_photo,
      driver_fee_per_day,
      delivery_fee,
      status
    } = req.body;

    if (
      !full_name ||
      !email ||
      !password ||
      !license_no
    ) {
      return res.status(400).json({
        message:
          "Full name, email, password and licence number are required"
      });
    }

    const existingDriver = await pool.query(
      `
      SELECT driver_id
      FROM driver
      WHERE LOWER(email) = LOWER($1)
      OR license_no = $2
      `,
      [email.trim(), license_no.trim()]
    );

    if (existingDriver.rows.length > 0) {
      return res.status(400).json({
        message:
          "Driver email or licence number already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const result = await pool.query(
      `
      INSERT INTO driver
      (
        full_name,
        email,
        password,
        phone,
        address,
        nric_no,
        license_no,
        license_photo,
        license_validity,
        driver_photo,
        driver_fee_per_day,
        delivery_fee,
        status
      )
      VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      RETURNING
        driver_id,
        full_name,
        email,
        phone,
        address,
        nric_no,
        license_no,
        license_photo,
        license_validity,
        driver_photo,
        driver_fee_per_day,
        delivery_fee,
        status,
        created_at
      `,
      [
        full_name.trim(),
        email.trim().toLowerCase(),
        hashedPassword,
        phone?.trim() || null,
        address?.trim() || null,
        nric_no?.trim() || null,
        license_no.trim(),
        license_photo || null,
        license_validity || null,
        driver_photo || null,
        Number(driver_fee_per_day || 0),
        Number(delivery_fee || 0),
        status || "Available"
      ]
    );

    res.status(201).json({
      message: "Driver added successfully",
      driver: result.rows[0]
    });
  } catch (err) {
    console.error("Add driver error:", err.message);

    res.status(500).json({
      message: err.message
    });
  }
});

// Update driver
app.put(
  "/admin/drivers/:driverId",
  async (req, res) => {
    try {
      const { driverId } = req.params;

      const {
        full_name,
        email,
        phone,
        address,
        nric_no,
        license_no,
        license_photo,
        license_validity,
        driver_photo,
        driver_fee_per_day,
        delivery_fee,
        status
      } = req.body;

      if (
        !full_name ||
        !email ||
        !license_no
      ) {
        return res.status(400).json({
          message:
            "Full name, email and licence number are required"
        });
      }

      const duplicateDriver = await pool.query(
        `
        SELECT driver_id
        FROM driver
        WHERE
        (
          LOWER(email) = LOWER($1)
          OR license_no = $2
        )
        AND driver_id != $3
        `,
        [
          email.trim(),
          license_no.trim(),
          driverId
        ]
      );

      if (duplicateDriver.rows.length > 0) {
        return res.status(400).json({
          message:
            "Driver email or licence number is already used"
        });
      }

      const result = await pool.query(
        `
        UPDATE driver
        SET
          full_name = $1,
          email = $2,
          phone = $3,
          address = $4,
          nric_no = $5,
          license_no = $6,
          license_photo = $7,
          license_validity = $8,
          driver_photo = $9,
          driver_fee_per_day = $10,
          delivery_fee = $11,
          status = $12
        WHERE driver_id = $13
        RETURNING
          driver_id,
          full_name,
          email,
          phone,
          address,
          nric_no,
          license_no,
          license_photo,
          license_validity,
          driver_photo,
          driver_fee_per_day,
          delivery_fee,
          status,
          created_at
        `,
        [
          full_name.trim(),
          email.trim().toLowerCase(),
          phone?.trim() || null,
          address?.trim() || null,
          nric_no?.trim() || null,
          license_no.trim(),
          license_photo || null,
          license_validity || null,
          driver_photo || null,
          Number(driver_fee_per_day || 0),
          Number(delivery_fee || 0),
          status || "Available",
          driverId
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Driver not found"
        });
      }

      res.json({
        message: "Driver updated successfully",
        driver: result.rows[0]
      });
    } catch (err) {
      console.error(
        "Update driver error:",
        err.message
      );

      res.status(500).json({
        message: err.message
      });
    }
  }
);

// Delete driver
app.delete(
  "/admin/drivers/:driverId",
  async (req, res) => {
    try {
      const { driverId } = req.params;

      const bookingCheck = await pool.query(
        `
        SELECT booking_id
        FROM booking
        WHERE driver_id = $1
        LIMIT 1
        `,
        [driverId]
      );

      if (bookingCheck.rows.length > 0) {
        return res.status(400).json({
          message:
            "This driver has booking records and cannot be deleted. Set the status to Off Duty instead."
        });
      }

      const result = await pool.query(
        `
        DELETE FROM driver
        WHERE driver_id = $1
        RETURNING driver_id
        `,
        [driverId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Driver not found"
        });
      }

      res.json({
        message: "Driver deleted successfully"
      });
    } catch (err) {
      console.error(
        "Delete driver error:",
        err.message
      );

      res.status(500).json({
        message: err.message
      });
    }
  }
);

// Upload driver photo
app.post(
  "/admin/upload-driver-photo",
  upload.single("image"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        message: "Please select a driver photo"
      });
    }

    res.json({
      message:
        "Driver photo uploaded successfully",
      filename: req.file.filename
    });
  }
);

// Upload licence photo
app.post(
  "/admin/upload-license-photo",
  upload.single("image"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        message:
          "Please select a driving licence photo"
      });
    }

    res.json({
      message:
        "Driving licence uploaded successfully",
      filename: req.file.filename
    });
  }
);
// Driver Login
app.post("/driver/login", async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const result = await pool.query(
      `
      SELECT *
      FROM driver
      WHERE LOWER(email) = $1
      `,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const driver = result.rows[0];

    const validPassword = await bcrypt.compare(
      password,
      driver.password
    );

    if (!validPassword) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    if (driver.status === "Off Duty") {
      return res.status(403).json({
        message: "Your driver account is currently off duty"
      });
    }

    res.json({
      message: "Driver Login Successful",
      driver: {
        driver_id: driver.driver_id,
        full_name: driver.full_name,
        email: driver.email,
        phone: driver.phone,
        address: driver.address,
        license_no: driver.license_no,
        license_validity: driver.license_validity,
        driver_photo: driver.driver_photo,
        driver_fee_per_day: driver.driver_fee_per_day,
        delivery_fee: driver.delivery_fee,
        status: driver.status
      }
    });
  } catch (err) {
    console.error("Driver login error:", err.message);

    res.status(500).json({
      message: "Driver login failed"
    });
  }
});
app.get(
  "/driver/dashboard/:driverId",
  async (req, res) => {
    try {
      const { driverId } = req.params;

      const result = await pool.query(
        `
        SELECT
          COUNT(*)::INTEGER AS total_jobs,

          COUNT(*) FILTER (
            WHERE COALESCE(trip_status, booking_status)
            IN ('Assigned', 'Pending')
          )::INTEGER AS pending_jobs,

          COUNT(*) FILTER (
            WHERE COALESCE(trip_status, booking_status)
            = 'Completed'
          )::INTEGER AS completed_jobs,

          COALESCE(
            SUM(
              CASE
                WHEN COALESCE(
                  trip_status,
                  booking_status
                ) = 'Completed'
                THEN COALESCE(driver_earning, 0)
                ELSE 0
              END
            ),
            0
          ) AS total_earnings

        FROM booking
        WHERE driver_id = $1
        `,
        [driverId]
      );

      res.json(result.rows[0]);
    } catch (err) {
      console.error(
        "Driver dashboard error:",
        err.message
      );

      res.status(500).json({
        message: err.message
      });
    }
  }
);
app.get("/driver/available-jobs", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        b.booking_id,
        b.booking_reference,
        b.service_type,
        b.pickup_date,
        b.pickup_time,
        b.return_date,
        b.pickup_location,
        b.dropoff_location,
        b.driver_earning,
        c.full_name AS customer_name,
        c.phone AS customer_phone,
        car.vehicle_name,
        car.plate_no

      FROM booking b

      JOIN customer c
        ON b.customer_id = c.customer_id

      JOIN car
        ON b.car_id = car.car_id

      WHERE b.service_type IN (
        'Include Driver',
        'Delivery Only'
      )
      AND b.driver_id IS NULL
      AND b.booking_status = 'Confirmed'

      ORDER BY b.booking_id DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Available jobs error:", err.message);

    res.status(500).json({
      message: "Failed to load available jobs",
      error: err.message
    });
  }
});
app.put("/driver/accept-job/:bookingId", async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { driver_id } = req.body;

    if (!driver_id) {
      return res.status(400).json({
        message: "Driver ID is required"
      });
    }

    const result = await pool.query(
      `
      UPDATE booking
      SET
        driver_id = $1,
        trip_status = 'Accepted',
        booking_status = 'Driver Accepted'
      WHERE booking_id = $2
        AND driver_id IS NULL
        AND service_type IN (
          'Include Driver',
          'Delivery Only'
        )
      RETURNING *
      `,
      [driver_id, bookingId]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        message:
          "This job has already been accepted or is unavailable"
      });
    }

    res.json({
      message: "Job accepted successfully",
      booking: result.rows[0]
    });
  } catch (err) {
    console.error("Accept job error:", err.message);

    res.status(500).json({
      message: "Failed to accept job"
    });
  }
});
app.get(
  "/driver/jobs/:driverId",
  async (req, res) => {
    try {
      const { driverId } = req.params;

      const result = await pool.query(
        `
        SELECT
          b.booking_id,
          b.booking_reference,
          b.service_type,
          b.pickup_date,
          b.pickup_time,
          b.return_date,
          b.pickup_location,
          b.dropoff_location,
          b.booking_status,
          b.trip_status,
          b.driver_earning,
          c.full_name AS customer_name,
          c.phone AS customer_phone,
          car.vehicle_name,
          car.plate_no
        FROM booking b
        JOIN customer c
          ON b.customer_id = c.customer_id
        JOIN car
          ON b.car_id = car.car_id
        WHERE b.driver_id = $1
        ORDER BY b.booking_id DESC
        `,
        [driverId]
      );

      res.json(result.rows);
    } catch (err) {
      console.error(
        "Load driver jobs error:",
        err.message
      );

      res.status(500).json({
        message: err.message
      });
    }
  }
);
// Update Driver Job Status
app.put("/driver/jobs/:bookingId/status", async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { driver_id, trip_status } = req.body;

    const allowedStatuses = [
      "Assigned",
      "Accepted",
      "On The Way",
      "Picked Up",
      "Completed",
      "Rejected"
    ];

    if (!driver_id || !trip_status) {
      return res.status(400).json({
        message: "Driver ID and trip status are required"
      });
    }

    if (!allowedStatuses.includes(trip_status)) {
      return res.status(400).json({
        message: "Invalid trip status"
      });
    }

    const bookingCheck = await pool.query(
      `
      SELECT booking_id, driver_id, trip_status
      FROM booking
      WHERE booking_id = $1
      `,
      [bookingId]
    );

    if (bookingCheck.rows.length === 0) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    const booking = bookingCheck.rows[0];

    if (Number(booking.driver_id) !== Number(driver_id)) {
      return res.status(403).json({
        message: "You are not assigned to this booking"
      });
    }

    let bookingStatus = "Confirmed";

    if (trip_status === "Assigned") {
      bookingStatus = "Confirmed";
    }

    if (trip_status === "Accepted") {
      bookingStatus = "Driver Accepted";
    }

    if (trip_status === "On The Way") {
      bookingStatus = "Driver On The Way";
    }

    if (trip_status === "Picked Up") {
      bookingStatus = "In Progress";
    }

    if (trip_status === "Completed") {
      bookingStatus = "Completed";
    }

    if (trip_status === "Rejected") {
      bookingStatus = "Driver Rejected";
    }

    const result = await pool.query(
      `
      UPDATE booking
      SET
        trip_status = $1,
        booking_status = $2
      WHERE booking_id = $3
        AND driver_id = $4
      RETURNING *
      `,
      [
        trip_status,
        bookingStatus,
        bookingId,
        driver_id
      ]
    );

    res.json({
      message: `Job status updated to ${trip_status}`,
      booking: result.rows[0]
    });
  } catch (err) {
    console.error("Update driver job error:", err.message);

    res.status(500).json({
      message: "Failed to update job status"
    });
  }
});
app.get("/driver/earnings/:driverId", async (req, res) => {
  try {
    const { driverId } = req.params;

    const summary = await pool.query(
      `
      SELECT
        COUNT(*) FILTER (
          WHERE trip_status='Completed'
        )::INTEGER AS completed_trips,

        COALESCE(
          SUM(driver_earning),0
        ) AS total_earnings,

        COALESCE(
          SUM(
            CASE
              WHEN service_type='Include Driver'
              THEN driver_earning
              ELSE 0
            END
          ),0
        ) AS driver_income,

        COALESCE(
          SUM(
            CASE
              WHEN service_type='Delivery Only'
              THEN driver_earning
              ELSE 0
            END
          ),0
        ) AS delivery_income

      FROM booking
      WHERE driver_id=$1
      `,
      [driverId]
    );

    const history = await pool.query(
      `
      SELECT
        booking_reference,
        service_type,
        pickup_date,
        trip_status,
        driver_earning
      FROM booking
      WHERE driver_id=$1
      ORDER BY booking_id DESC
      `,
      [driverId]
    );

    res.json({
      summary: summary.rows[0],
      history: history.rows
    });

  } catch(err) {

    console.log(err.message);

    res.status(500).json({
      message:"Failed to load earnings"
    });

  }
});
// Get Driver Profile
app.get("/driver/profile/:driverId", async (req, res) => {
  try {
    const { driverId } = req.params;

    const result = await pool.query(
      `
      SELECT
        driver_id,
        full_name,
        email,
        phone,
        address,
        nric_no,
        license_no,
        license_validity,
        license_photo,
        driver_photo,
        status,
        experience_years,
        emergency_contact,
        driver_fee_per_day,
        delivery_fee,
        created_at
      FROM driver
      WHERE driver_id = $1
      `,
      [driverId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Driver profile not found"
      });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Get driver profile error:", err.message);

    res.status(500).json({
      message: "Failed to load driver profile"
    });
  }
});


// Update Driver Personal Information
app.put("/driver/profile/:driverId", async (req, res) => {
  try {
    const { driverId } = req.params;

    const {
      phone,
      address,
      emergency_contact
    } = req.body;

    if (!phone || !phone.trim()) {
      return res.status(400).json({
        message: "Phone number is required"
      });
    }

    if (!address || !address.trim()) {
      return res.status(400).json({
        message: "Address is required"
      });
    }

    const driverCheck = await pool.query(
      `
      SELECT driver_id
      FROM driver
      WHERE driver_id = $1
      `,
      [driverId]
    );

    if (driverCheck.rows.length === 0) {
      return res.status(404).json({
        message: "Driver not found"
      });
    }

    const result = await pool.query(
      `
      UPDATE driver
      SET
        phone = $1,
        address = $2,
        emergency_contact = $3
      WHERE driver_id = $4
      RETURNING
        driver_id,
        full_name,
        email,
        phone,
        address,
        nric_no,
        license_no,
        license_validity,
        license_photo,
        driver_photo,
        status,
        experience_years,
        emergency_contact,
        driver_fee_per_day,
        delivery_fee
      `,
      [
        phone.trim(),
        address.trim(),
        emergency_contact
          ? emergency_contact.trim()
          : null,
        driverId
      ]
    );

    res.json({
      message: "Profile updated successfully",
      driver: result.rows[0]
    });
  } catch (err) {
    console.error("Update driver profile error:", err.message);

    res.status(500).json({
      message: "Failed to update driver profile"
    });
  }
});


// Upload Driver Profile Photo
app.put(
  "/driver/profile/:driverId/photo",
  upload.single("driver_photo"),
  async (req, res) => {
    try {
      const { driverId } = req.params;

      if (!req.file) {
        return res.status(400).json({
          message: "Please select a driver photo"
        });
      }

      const result = await pool.query(
        `
        UPDATE driver
        SET driver_photo = $1
        WHERE driver_id = $2
        RETURNING
          driver_id,
          driver_photo
        `,
        [req.file.filename, driverId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Driver not found"
        });
      }

      res.json({
        message: "Driver photo updated successfully",
        driver_photo: result.rows[0].driver_photo
      });
    } catch (err) {
      console.error("Upload driver photo error:", err.message);

      res.status(500).json({
        message: "Failed to upload driver photo"
      });
    }
  }
);


// Upload Driver Licence Photo
app.put(
  "/driver/profile/:driverId/license-photo",
  upload.single("license_photo"),
  async (req, res) => {
    try {
      const { driverId } = req.params;

      if (!req.file) {
        return res.status(400).json({
          message: "Please select a licence photo"
        });
      }

      const result = await pool.query(
        `
        UPDATE driver
        SET license_photo = $1
        WHERE driver_id = $2
        RETURNING
          driver_id,
          license_photo
        `,
        [req.file.filename, driverId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Driver not found"
        });
      }

      res.json({
        message: "Licence photo updated successfully",
        license_photo: result.rows[0].license_photo
      });
    } catch (err) {
      console.error("Upload licence photo error:", err.message);

      res.status(500).json({
        message: "Failed to upload licence photo"
      });
    }
  }
);
app.get("/admin/system-settings", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        setting_id,
        setting_name,
        setting_value,
        description
      FROM system_settings
      ORDER BY setting_id
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err.message);

    res.status(500).json({
      message: "Failed to load system settings"
    });
  }
});
app.put("/admin/system-settings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { setting_value } = req.body;

    const result = await pool.query(
      `
      UPDATE system_settings
      SET setting_value = $1
      WHERE setting_id = $2
      RETURNING *
      `,
      [setting_value, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Setting not found"
      });
    }

    res.json({
      message: "Setting updated successfully",
      setting: result.rows[0]
    });

  } catch (err) {
    console.error(err.message);

    res.status(500).json({
      message: "Failed to update setting"
    });
  }
});
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      message: err.message
    });
  }

  if (err) {
    return res.status(400).json({
      message: err.message
    });
  }

  next();
});
// Start locally; Vercel imports the Express app as a serverless function.
if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  pool.query("SELECT NOW()")
    .then((result) => {
      console.log("✅ Database connected!");
      console.log(result.rows);

      app.listen(PORT, () => {
        console.log(`🚀 Server started on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.log("❌ Database connection failed:");
      console.log(err.message);
    });
}

module.exports = app;
