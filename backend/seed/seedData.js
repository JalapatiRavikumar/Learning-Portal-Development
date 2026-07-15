// ============================================================
// backend/seed/seedData.js
// Run with: npm run seed
// Seeds the demo student account and 4 MERN curriculum videos
// ============================================================
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User    from '../models/User.js';
import Video   from '../models/Video.js';
import Bookmark from '../models/Bookmark.js';
import WatchHistory from '../models/WatchHistory.js';

dotenv.config({ path: '.env' });

// ── Demo Videos ──────────────────────────────────────────────
const VIDEOS = [
  {
    title: 'MERN Stack Architecture',
    category: 'Full Stack Development',
    duration: 3600,
    videoUrl: 'https://www.youtube.com/watch?v=7CqJlxBYj-M',
    thumbnail: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&w=600&q=80',
    description: 'Learn the complete MERN stack architecture from frontend to backend. Covers how React, Node.js, Express, and MongoDB fit together to form modern full-stack applications.',
    instructor: 'Traversy Media',
    difficulty: 'Intermediate',
    order: 1,
  },
  {
    title: 'JWT Authentication Deep-Dive',
    category: 'Backend Security',
    duration: 2400,
    videoUrl: 'https://www.youtube.com/watch?v=enopDSs3DRw',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
    description: 'A deep dive into JSON Web Tokens (JWT). Learn how to implement secure user authentication, token generation, and stateless session management in a Node.js REST API.',
    instructor: 'Traversy Media',
    difficulty: 'Advanced',
    order: 2,
  },
  {
    title: 'React Hooks Lifecycle',
    category: 'Frontend UI',
    duration: 1800,
    videoUrl: 'https://www.youtube.com/watch?v=TNhaISOUy6Q',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=600&q=80',
    description: 'Master the React Hooks lifecycle. Understand how useEffect, useState, and other core hooks manage component state, side effects, and re-renders in functional components.',
    instructor: 'Codevolution',
    difficulty: 'Intermediate',
    order: 3,
  },
  {
    title: 'State Synced Video Control Strategies',
    category: 'Frontend UI',
    duration: 1200,
    videoUrl: 'https://www.youtube.com/watch?v=3gHd5LRO5X8',
    thumbnail: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&w=600&q=80',
    description: 'Learn to build a custom React video player. Covers synchronizing state with HTML5 video properties, managing refs, and building robust playback control interfaces.',
    instructor: 'Web Dev Simplified',
    difficulty: 'Advanced',
    order: 4,
  },
  {
    title: 'Advanced Express Middleware',
    category: 'Backend Engineering',
    duration: 1500,
    videoUrl: 'https://www.youtube.com/watch?v=lY6icfhap2o',
    thumbnail: 'https://images.unsplash.com/photo-1623282033815-40b05d96c903?auto=format&fit=crop&w=600&q=80',
    description: 'Take your Express.js skills to the next level by building advanced custom middleware. Learn how to intercept requests, validate data, and create robust error handling pipelines.',
    instructor: 'Codevolution',
    difficulty: 'Intermediate',
    order: 5,
  },
  {
    title: 'Express Rate Limiting',
    category: 'Backend Security',
    duration: 900,
    videoUrl: 'https://www.youtube.com/watch?v=V3A6L2qM5V4',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
    description: 'Protect your APIs from brute force and DDoS attacks by implementing rate limiting in Express. Covers express-rate-limit configuration and best practices for endpoint security.',
    instructor: 'Coder One',
    difficulty: 'Intermediate',
    order: 6,
  }
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅  Connected to MongoDB\n');

    // ── Wipe existing data ──────────────────────────────────
    await Promise.all([
      User.deleteMany({}),
      Video.deleteMany({}),
      Bookmark.deleteMany({}),
      WatchHistory.deleteMany({}),
    ]);
    console.log('🗑️   Cleared existing collections\n');

    // ── Seed demo student ───────────────────────────────────
    const passwordHash = await bcrypt.hash('student123', 12);
    const student = await User.create({
      name: 'Alex Mercer',
      email: 'alex.mercer@gvcc.edu',
      password: 'student123', // Pre-save hook will hash this
      role: 'student',
    });
    console.log(`👤  Created student: ${student.email}`);

    // ── Seed admin ──────────────────────────────────────────
    const admin = await User.create({
      name: 'GVCC Admin',
      email: 'admin@gvcc.edu',
      password: 'admin123456',
      role: 'admin',
    });
    console.log(`👤  Created admin:   ${admin.email}`);

    // ── Seed videos ─────────────────────────────────────────
    const videos = await Video.insertMany(VIDEOS);
    console.log(`🎬  Seeded ${videos.length} videos\n`);

    // ── Seed sample bookmarks for the student ───────────────
    const sampleBookmarks = [
      { userId: student._id, videoId: videos[0]._id, timestamp: 122, title: 'Architecture Overview', notes: 'Review this for the high-level MERN diagram.' },
      { userId: student._id, videoId: videos[0]._id, timestamp: 345, title: 'Database Connectivity', notes: 'Connecting MongoDB using mongoose properly.' },
      { userId: student._id, videoId: videos[1]._id, timestamp: 88,  title: 'Token Signing Process', notes: "Understand how the JWT secret signs the payload." },
    ];
    await Bookmark.insertMany(sampleBookmarks);
    console.log(`🔖  Seeded ${sampleBookmarks.length} bookmarks`);

    // ── Seed watch history ───────────────────────────────────
    await WatchHistory.insertMany([
      { userId: student._id, videoId: videos[0]._id, lastTime: 122, maxTime: 122, percentage: 19 },
      { userId: student._id, videoId: videos[1]._id, lastTime: 45,  maxTime: 45,  percentage: 10 },
    ]);
    console.log('📊  Seeded watch history\n');

    console.log('────────────────────────────────────────');
    console.log('✅  Database seeded successfully!\n');
    console.log('   Login credentials:');
    console.log('   Student  → alex.mercer@gvcc.edu / student123');
    console.log('   Admin    → admin@gvcc.edu / admin123456');
    console.log('────────────────────────────────────────\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌  Seed failed:', err.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seed();
