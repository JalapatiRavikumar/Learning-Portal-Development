// ============================================================
// frontend/src/components/CodebaseTab.jsx
// Syntax-highlighted backend file explorer
// ============================================================
import React, { useState } from 'react';
import { FileCode, Server } from 'lucide-react';

const BACKEND_FILES = [
  {
    path: 'backend/server.js', lang: 'javascript',
    code: `import express from 'express';
import cors    from 'cors';
import helmet  from 'helmet';
import dotenv  from 'dotenv';
import connectDB      from './config/db.js';
import videoRoutes    from './routes/videoRoutes.js';
import bookmarkRoutes from './routes/bookmarkRoutes.js';
import userRoutes     from './routes/userRoutes.js';

dotenv.config();
connectDB();

const app = express();

// ── Security & Parsing Middleware ──────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '10kb' }));

// ── API Health Check ───────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'healthy' }));

// ── Mount Routes ───────────────────────────
app.use('/api/videos',    videoRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/users',     userRoutes);

// ── Global Error Handler ───────────────────
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message    = process.env.NODE_ENV === 'production'
    ? 'An unexpected error occurred.'
    : err.message;
  res.status(statusCode).json({ status: 'error', message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(\`🚀 Server running on port \${PORT}\`));`,
  },
  {
    path: 'backend/config/db.js', lang: 'javascript',
    code: `import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(\`✅  MongoDB Connected: \${conn.connection.host}\`);

    mongoose.connection.on('error', err =>
      console.error('❌  MongoDB runtime error:', err.message));

    mongoose.connection.on('disconnected', () =>
      console.warn('⚠️   MongoDB disconnected.'));

  } catch (error) {
    console.error('❌  MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

export default connectDB;`,
  },
  {
    path: 'backend/models/Bookmark.js', lang: 'javascript',
    code: `import mongoose from 'mongoose';

const bookmarkSchema = new mongoose.Schema({
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video', required: true, index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', required: true,
  },
  timestamp: { type: Number, required: true, min: 0 },
  title:     { type: String, required: true, trim: true, maxlength: 150 },
  notes:     { type: String, default: '',    maxlength: 2000 },
}, { timestamps: true });

// Compound index: most common query = user + video + ordered
bookmarkSchema.index({ userId: 1, videoId: 1, timestamp: 1 });

export default mongoose.model('Bookmark', bookmarkSchema);`,
  },
  {
    path: 'backend/models/Video.js', lang: 'javascript',
    code: `import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true, maxlength: 200 },
  category:    { type: String, required: true },
  duration:    { type: Number, required: true, min: 0 },
  videoUrl:    { type: String, required: true },
  thumbnail:   { type: String, default: '' },
  description: { type: String, default: '', maxlength: 2000 },
  instructor:  { type: String, default: 'GVCC Faculty' },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Intermediate',
  },
  isActive: { type: Boolean, default: true, index: true },
  views:    { type: Number, default: 0 },
  order:    { type: Number, default: 0 },
}, { timestamps: true });

// Full-text search index
videoSchema.index({ title: 'text', description: 'text', category: 'text' });
videoSchema.index({ isActive: 1, order: 1 });

export default mongoose.model('Video', videoSchema);`,
  },
  {
    path: 'backend/middleware/authMiddleware.js', lang: 'javascript',
    code: `import jwt  from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) return res.status(401).json({ message: 'Access token missing.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user    = await User.findById(decoded.id).select('-password');

    if (!user)          return res.status(401).json({ message: 'User not found.' });
    if (!user.isActive) return res.status(403).json({ message: 'Account deactivated.' });

    req.user = user;
    next();
  } catch (err) {
    const msg = err.name === 'TokenExpiredError'
      ? 'Session expired. Please log in again.'
      : 'Invalid token.';
    res.status(401).json({ message: msg });
  }
};

export const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: \`Required role: \${roles.join(' or ')}\` });
  }
  next();
};

export const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });`,
  },
  {
    path: 'backend/routes/bookmarkRoutes.js', lang: 'javascript',
    code: `import express from 'express';
import {
  getBookmarks,
  createBookmark,
  updateBookmark,
  deleteBookmark,
} from '../controllers/bookmarkController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect); // all bookmark routes require auth

router.get('/',       getBookmarks);    // GET    /api/bookmarks?videoId=xxx
router.post('/',      createBookmark);  // POST   /api/bookmarks
router.put('/:id',    updateBookmark);  // PUT    /api/bookmarks/:id
router.delete('/:id', deleteBookmark);  // DELETE /api/bookmarks/:id

export default router;`,
  },
  {
    path: 'backend/seed/seedData.js', lang: 'javascript',
    code: `import mongoose from 'mongoose';
import dotenv    from 'dotenv';
import User         from '../models/User.js';
import Video        from '../models/Video.js';
import Bookmark     from '../models/Bookmark.js';
import WatchHistory from '../models/WatchHistory.js';

dotenv.config({ path: '../.env' });

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅  Connected to MongoDB');

  await Promise.all([
    User.deleteMany({}), Video.deleteMany({}),
    Bookmark.deleteMany({}), WatchHistory.deleteMany({}),
  ]);

  const student = await User.create({
    name: 'Alex Mercer', email: 'alex.mercer@gvcc.edu',
    password: 'student123', role: 'student',
  });

  const videos = await Video.insertMany([/* ...4 course videos... */]);

  await Bookmark.insertMany([
    { userId: student._id, videoId: videos[0]._id, timestamp: 122,
      title: 'Auth Header Setup', notes: 'Express auth check pattern.' },
    { userId: student._id, videoId: videos[0]._id, timestamp: 345,
      title: 'JWT Expiry Strategy', notes: 'Refresh token rotation.' },
  ]);

  console.log('✅  Database seeded!');
  await mongoose.disconnect();
};

seed().catch(console.error);`,
  },
];

// ── Lightweight syntax highlighter ─────────────────────────
function highlight(line) {
  return line
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/(\/\/.*$)/g, '<span class="token-comment">$1</span>')
    .replace(/\b(import|export|default|const|let|var|async|await|try|catch|return|new|if|else|from|function|class)\b/g, '<span class="token-keyword">$1</span>')
    .replace(/('[^']*'|`[^`]*`|"[^"]*")/g, '<span class="token-string">$1</span>')
    .replace(/\b(\d+)\b/g, '<span class="token-number">$1</span>');
}

export default function CodebaseTab() {
  const [activeFile, setActiveFile] = useState(BACKEND_FILES[0]);

  return (
    <div className="animate-fadeIn">
      <div
        className="grid grid-cols-1 lg:grid-cols-4 gap-5"
        style={{ height: 'calc(100vh - 10rem)' }}
      >
        {/* File tree */}
        <div className="lg:col-span-1 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2 shrink-0">
            <Server className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-xs font-bold text-slate-300">Backend Explorer</span>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            {BACKEND_FILES.map((file) => (
              <button
                key={file.path}
                id={`file-${file.path.replace(/[/.]/g, '-')}`}
                onClick={() => setActiveFile(file)}
                className={`w-full text-left px-4 py-2.5 text-[11px] font-mono transition-all flex items-center gap-2.5 ${
                  activeFile.path === file.path
                    ? 'bg-indigo-600/15 text-indigo-300 border-r-2 border-indigo-500'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'
                }`}
              >
                <FileCode className="w-3 h-3 shrink-0" />
                <span className="truncate">{file.path.split('/').pop()}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Code viewer */}
        <div className="lg:col-span-3 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/60" />
                <span className="w-3 h-3 rounded-full bg-amber-500/60" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/60" />
              </div>
              <span className="text-[11px] font-mono text-indigo-400">{activeFile.path}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-bold">
                {activeFile.lang}
              </span>
              <span className="text-[10px] text-slate-600 font-mono">
                {activeFile.code.split('\n').length} lines
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <pre className="p-5 text-[12px] leading-relaxed" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {activeFile.code.split('\n').map((line, i) => (
                <div key={i} className="flex hover:bg-slate-900/40 rounded group">
                  <span className="text-slate-700 select-none w-9 shrink-0 text-right pr-4 text-[10px] leading-[1.75rem] group-hover:text-slate-600">
                    {i + 1}
                  </span>
                  <code
                    className="text-slate-300 flex-1 leading-[1.75rem]"
                    dangerouslySetInnerHTML={{ __html: highlight(line) }}
                  />
                </div>
              ))}
            </pre>
          </div>
        </div>

      </div>
    </div>
  );
}
