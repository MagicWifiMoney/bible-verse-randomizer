"use strict";
/**
 * Load Bible Data Script
 * Loads all 31,102 verses with multiple translations into database
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var path = __importStar(require("path"));
var pg_1 = require("pg");
var dotenv = __importStar(require("dotenv"));
var bible_api_js_1 = require("../lib/bible-api.js");
dotenv.config({ path: path.join(__dirname, '../.env.local') });
var DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in .env.local');
    console.error('Please add your database connection string to .env.local');
    process.exit(1);
}
var pool = new pg_1.Pool({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL.includes('supabase.co') ? { rejectUnauthorized: false } : false
});
/**
 * Load all translations from local JSON files
 */
function loadAllTranslations() {
    return __awaiter(this, void 0, void 0, function () {
        var translations, allVerses, _i, translations_1, trans, verses, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('📖 Loading Bible translations from local files...');
                    translations = ['KJV', 'NIV', 'ESV', 'NLT', 'MSG', 'NASB'];
                    allVerses = [];
                    _i = 0, translations_1 = translations;
                    _a.label = 1;
                case 1:
                    if (!(_i < translations_1.length)) return [3 /*break*/, 6];
                    trans = translations_1[_i];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    console.log("   Loading ".concat(trans, "..."));
                    return [4 /*yield*/, (0, bible_api_js_1.loadTranslationFromFile)(trans)];
                case 3:
                    verses = _a.sent();
                    allVerses.push.apply(allVerses, verses);
                    console.log("   \u2705 ".concat(trans, ": ").concat(verses.length, " verses loaded"));
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    console.error("   \u26A0\uFE0F  Failed to load ".concat(trans, ": ").concat(error_1));
                    return [3 /*break*/, 5];
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6:
                    console.log("\n\uD83D\uDCCA Total verses loaded: ".concat(allVerses.length));
                    console.log('🔄 Grouping verses by reference...\n');
                    return [2 /*return*/, (0, bible_api_js_1.groupVersesByReference)(allVerses)];
            }
        });
    });
}
/**
 * Insert verses into database in batches
 */
function insertVerses(versesData) {
    return __awaiter(this, void 0, void 0, function () {
        var placeholders, values, query, result, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (versesData.length === 0)
                        return [2 /*return*/, 0];
                    placeholders = versesData.map(function (_, i) {
                        var base = i * 12;
                        return "($".concat(base + 1, ", $").concat(base + 2, ", $").concat(base + 3, ", $").concat(base + 4, ", $").concat(base + 5, ", $").concat(base + 6, ", $").concat(base + 7, ", $").concat(base + 8, ", $").concat(base + 9, ", $").concat(base + 10, ", $").concat(base + 11, ", $").concat(base + 12, ")");
                    }).join(', ');
                    values = versesData.flatMap(function (v) { return [
                        v.book,
                        v.chapter,
                        v.verse,
                        v.text_kjv,
                        v.text_niv,
                        v.text_esv,
                        v.text_nlt,
                        v.text_msg,
                        v.text_nasb,
                        v.slug,
                        v.testament,
                        v.word_count
                    ]; });
                    query = "\n    INSERT INTO verses (\n      book, chapter, verse,\n      text_kjv, text_niv, text_esv, text_nlt, text_msg, text_nasb,\n      slug, testament, word_count\n    )\n    VALUES ".concat(placeholders, "\n    ON CONFLICT (slug) DO UPDATE SET\n      text_kjv = EXCLUDED.text_kjv,\n      text_niv = EXCLUDED.text_niv,\n      text_esv = EXCLUDED.text_esv,\n      text_nlt = EXCLUDED.text_nlt,\n      text_msg = EXCLUDED.text_msg,\n      text_nasb = EXCLUDED.text_nasb,\n      word_count = EXCLUDED.word_count,\n      updated_at = NOW()\n  ");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, pool.query(query, values)];
                case 2:
                    result = _a.sent();
                    return [2 /*return*/, result.rowCount || 0];
                case 3:
                    error_2 = _a.sent();
                    console.error('Error inserting batch:', error_2);
                    throw error_2;
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Main execution
 */
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var groupedVerses, versesToInsert, _i, _a, _b, ref, translations, _c, bookNum, chapter, verse, bookName, testament, slug, kjv, wordCount, BATCH_SIZE, inserted, i, batch, count, progress, verifyResult, stats, error_3;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    console.log('🚀 Bible Data Loader - Starting...\n');
                    console.log('================================================\n');
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 9, 10, 12]);
                    // Test database connection
                    console.log('🔌 Testing database connection...');
                    return [4 /*yield*/, pool.query('SELECT NOW()')];
                case 2:
                    _d.sent();
                    console.log('✅ Database connected!\n');
                    return [4 /*yield*/, loadAllTranslations()];
                case 3:
                    groupedVerses = _d.sent();
                    // Prepare verse data for insertion
                    console.log('📝 Preparing verse data for database insertion...');
                    versesToInsert = [];
                    for (_i = 0, _a = groupedVerses.entries(); _i < _a.length; _i++) {
                        _b = _a[_i], ref = _b[0], translations = _b[1];
                        _c = ref.split('-').map(Number), bookNum = _c[0], chapter = _c[1], verse = _c[2];
                        bookName = bible_api_js_1.BOOK_NAMES[bookNum];
                        testament = bible_api_js_1.TESTAMENT[bookNum];
                        slug = "".concat(bookName.toLowerCase().replace(/\s+/g, '-'), "-").concat(chapter, "-").concat(verse);
                        kjv = translations.get('KJV') || null;
                        wordCount = kjv ? kjv.split(/\s+/).length : 0;
                        versesToInsert.push({
                            book: bookName,
                            chapter: chapter,
                            verse: verse,
                            text_kjv: kjv,
                            text_niv: translations.get('NIV') || null,
                            text_esv: translations.get('ESV') || null,
                            text_nlt: translations.get('NLT') || null,
                            text_msg: translations.get('MSG') || null,
                            text_nasb: translations.get('NASB') || null,
                            slug: slug,
                            testament: testament,
                            word_count: wordCount,
                            character_count: kjv ? kjv.length : 0
                        });
                    }
                    console.log("\u2705 Prepared ".concat(versesToInsert.length, " unique verses\n"));
                    // Insert in batches
                    console.log('💾 Inserting verses into database...');
                    BATCH_SIZE = 100;
                    inserted = 0;
                    i = 0;
                    _d.label = 4;
                case 4:
                    if (!(i < versesToInsert.length)) return [3 /*break*/, 7];
                    batch = versesToInsert.slice(i, i + BATCH_SIZE);
                    return [4 /*yield*/, insertVerses(batch)];
                case 5:
                    count = _d.sent();
                    inserted += count;
                    progress = Math.round((i + batch.length) / versesToInsert.length * 100);
                    process.stdout.write("   Progress: ".concat(progress, "% (").concat(i + batch.length, "/").concat(versesToInsert.length, ")\r"));
                    _d.label = 6;
                case 6:
                    i += BATCH_SIZE;
                    return [3 /*break*/, 4];
                case 7:
                    console.log("\n\u2705 Successfully inserted/updated ".concat(inserted, " verses!\n"));
                    // Verify data
                    console.log('🔍 Verifying data in database...');
                    return [4 /*yield*/, pool.query("\n      SELECT \n        COUNT(*) as total,\n        COUNT(text_kjv) as kjv_count,\n        COUNT(text_niv) as niv_count,\n        COUNT(text_esv) as esv_count,\n        COUNT(text_nlt) as nlt_count,\n        COUNT(text_msg) as msg_count,\n        COUNT(text_nasb) as nasb_count\n      FROM verses\n    ")];
                case 8:
                    verifyResult = _d.sent();
                    stats = verifyResult.rows[0];
                    console.log('📊 Database Statistics:');
                    console.log("   Total verses: ".concat(stats.total));
                    console.log("   KJV: ".concat(stats.kjv_count));
                    console.log("   NIV: ".concat(stats.niv_count));
                    console.log("   ESV: ".concat(stats.esv_count));
                    console.log("   NLT: ".concat(stats.nlt_count));
                    console.log("   MSG: ".concat(stats.msg_count));
                    console.log("   NASB: ".concat(stats.nasb_count, "\n"));
                    console.log('================================================');
                    console.log('✅ CHECKPOINT 1 COMPLETE!');
                    console.log('   Bible API integrated: bolls.life');
                    console.log("   Verses loaded: ".concat(stats.total));
                    console.log('   Translations: KJV, NIV, ESV, NLT, MSG, NASB');
                    console.log('================================================\n');
                    return [3 /*break*/, 12];
                case 9:
                    error_3 = _d.sent();
                    console.error('❌ Error:', error_3);
                    process.exit(1);
                    return [3 /*break*/, 12];
                case 10: return [4 /*yield*/, pool.end()];
                case 11:
                    _d.sent();
                    return [7 /*endfinally*/];
                case 12: return [2 /*return*/];
            }
        });
    });
}
main();
