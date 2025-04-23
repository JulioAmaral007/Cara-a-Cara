const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const session = require('express-session')
const path = require('path')
const User = require('./models/User')

const app = express()
const PORT = process.env.PORT || 3000

// // // Connect to MongoDB
// // mongoose
// //   .connect("mongodb://localhost:27017/cara_a_cara", {
// //     useNewUrlParser: true,
// //     useUnifiedTopology: true,
// //   })
// //   .then(() => console.log("MongoDB connected"))
// //   .catch((err) => console.error("MongoDB connection error:", err))

// // Middleware
// app.use(express.json())
// app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public/pages')))

// // Session configuration
// app.use(
//   session({
//     secret: "cara-a-cara-secret-key",
//     resave: false,
//     saveUninitialized: false,
//     cookie: { maxAge: 3600000 }, // 1 hour
//   }),
// )

// // Routes

// // Get current user
// app.get("/api/user", (req, res) => {
//   if (!req.session.userId) {
//     return res.status(401).json({ message: "Not authenticated" })
//   }

//   User.findById(req.session.userId)
//     .select("-password") // Don't send password
//     .then((user) => {
//       if (!user) {
//         return res.status(404).json({ message: "User not found" })
//       }
//       res.json(user)
//     })
//     .catch((err) => res.status(500).json({ message: "Server error", error: err.message }))
// })

// // Register new user
// app.post("/api/register", async (req, res) => {
//   const { username, password } = req.body

//   try {
//     // Check if user already exists
//     const existingUser = await User.findOne({ username })
//     if (existingUser) {
//       return res.status(400).json({ message: "Username already exists" })
//     }

//     // Hash password
//     const salt = await bcrypt.genSalt(10)
//     const hashedPassword = await bcrypt.hash(password, salt)

//     // Create new user
//     const newUser = new User({
//       username,
//       password: hashedPassword,
//       victories: 0,
//       gamesPlayed: 0,
//     })

//     await newUser.save()

//     // Set session
//     req.session.userId = newUser._id

//     // Return user without password
//     const userResponse = {
//       _id: newUser._id,
//       username: newUser.username,
//       victories: newUser.victories,
//       gamesPlayed: newUser.gamesPlayed,
//     }

//     res.status(201).json(userResponse)
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message })
//   }
// })

// // Login user
// app.post("/api/login", async (req, res) => {
//   const { username, password } = req.body

//   try {
//     // Find user
//     const user = await User.findOne({ username })
//     if (!user) {
//       return res.status(400).json({ message: "Invalid credentials" })
//     }

//     // Check password
//     const isMatch = await bcrypt.compare(password, user.password)
//     if (!isMatch) {
//       return res.status(400).json({ message: "Invalid credentials" })
//     }

//     // Set session
//     req.session.userId = user._id

//     // Return user without password
//     const userResponse = {
//       _id: user._id,
//       username: user.username,
//       victories: user.victories,
//       gamesPlayed: user.gamesPlayed,
//     }

//     res.json(userResponse)
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message })
//   }
// })

// // Logout user
// app.post("/api/logout", (req, res) => {
//   req.session.destroy((err) => {
//     if (err) {
//       return res.status(500).json({ message: "Logout failed" })
//     }
//     res.json({ message: "Logged out successfully" })
//   })
// })

// // Get online players
// app.get("/api/players/online", async (req, res) => {
//   if (!req.session.userId) {
//     return res.status(401).json({ message: "Not authenticated" })
//   }

//   try {
//     // In a real app, you would track online users with WebSockets
//     // For now, we'll just return all users except the current one
//     const users = await User.find({ _id: { $ne: req.session.userId } })
//       .select("-password")
//       .limit(10)

//     res.json(users)
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message })
//   }
// })

// // Update user victories
// app.put("/api/user/victory", async (req, res) => {
//   if (!req.session.userId) {
//     return res.status(401).json({ message: "Not authenticated" })
//   }

//   try {
//     const user = await User.findByIdAndUpdate(
//       req.session.userId,
//       { $inc: { victories: 1, gamesPlayed: 1 } },
//       { new: true },
//     ).select("-password")

//     res.json(user)
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message })
//   }
// })

// // Update games played (for losses)
// app.put("/api/user/loss", async (req, res) => {
//   if (!req.session.userId) {
//     return res.status(401).json({ message: "Not authenticated" })
//   }

//   try {
//     const user = await User.findByIdAndUpdate(req.session.userId, { $inc: { gamesPlayed: 1 } }, { new: true }).select(
//       "-password",
//     )

//     res.json(user)
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message })
//   }
// })

// // Serve the main app
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "public", "index.html"))
// })

// // Start server
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`)
// })
