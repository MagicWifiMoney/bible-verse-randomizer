"use strict";
/**
 * Bible API Wrapper
 * Provides access to Bible verse data from bolls.life API and local JSON files
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.TESTAMENT = exports.BOOK_NAMES = void 0;
exports.cleanVerseText = cleanVerseText;
exports.createSlug = createSlug;
exports.loadTranslationFromFile = loadTranslationFromFile;
exports.fetchVerse = fetchVerse;
exports.groupVersesByReference = groupVersesByReference;
exports.getUniqueReferences = getUniqueReferences;
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
// Book number to name mapping (1-66)
exports.BOOK_NAMES = {
    1: 'Genesis', 2: 'Exodus', 3: 'Leviticus', 4: 'Numbers', 5: 'Deuteronomy',
    6: 'Joshua', 7: 'Judges', 8: 'Ruth', 9: '1 Samuel', 10: '2 Samuel',
    11: '1 Kings', 12: '2 Kings', 13: '1 Chronicles', 14: '2 Chronicles', 15: 'Ezra',
    16: 'Nehemiah', 17: 'Esther', 18: 'Job', 19: 'Psalms', 20: 'Proverbs',
    21: 'Ecclesiastes', 22: 'Song of Solomon', 23: 'Isaiah', 24: 'Jeremiah', 25: 'Lamentations',
    26: 'Ezekiel', 27: 'Daniel', 28: 'Hosea', 29: 'Joel', 30: 'Amos',
    31: 'Obadiah', 32: 'Jonah', 33: 'Micah', 34: 'Nahum', 35: 'Habakkuk',
    36: 'Zephaniah', 37: 'Haggai', 38: 'Zechariah', 39: 'Malachi',
    40: 'Matthew', 41: 'Mark', 42: 'Luke', 43: 'John', 44: 'Acts',
    45: 'Romans', 46: '1 Corinthians', 47: '2 Corinthians', 48: 'Galatians', 49: 'Ephesians',
    50: 'Philippians', 51: 'Colossians', 52: '1 Thessalonians', 53: '2 Thessalonians', 54: '1 Timothy',
    55: '2 Timothy', 56: 'Titus', 57: 'Philemon', 58: 'Hebrews', 59: 'James',
    60: '1 Peter', 61: '2 Peter', 62: '1 John', 63: '2 John', 64: '3 John',
    65: 'Jude', 66: 'Revelation'
};
// Testament mapping
exports.TESTAMENT = __assign(__assign({}, Object.fromEntries(Array.from({ length: 39 }, function (_, i) { return [i + 1, 'Old Testament']; }))), Object.fromEntries(Array.from({ length: 27 }, function (_, i) { return [i + 40, 'New Testament']; })));
/**
 * Clean HTML tags from verse text (Strong's numbers, sup tags, etc.)
 */
function cleanVerseText(text) {
    return text
        .replace(/<S>\d+<\/S>/g, '') // Remove Strong's numbers
        .replace(/<sup>.*?<\/sup>/g, '') // Remove footnotes
        .replace(/<[^>]+>/g, '') // Remove any other HTML tags
        .trim();
}
/**
 * Create a slug from book, chapter, verse
 */
function createSlug(book, chapter, verse) {
    var bookName = typeof book === 'number' ? exports.BOOK_NAMES[book] : book;
    return "".concat(bookName.toLowerCase().replace(/\s+/g, '-'), "-").concat(chapter, "-").concat(verse);
}
/**
 * Load Bible translation from local JSON file
 */
function loadTranslationFromFile(translation) {
    return __awaiter(this, void 0, void 0, function () {
        var filePath, fileContent, verses;
        return __generator(this, function (_a) {
            filePath = path.join(process.cwd(), 'data', "".concat(translation, ".json"));
            if (!fs.existsSync(filePath)) {
                throw new Error("Translation file not found: ".concat(filePath));
            }
            fileContent = fs.readFileSync(filePath, 'utf-8');
            verses = JSON.parse(fileContent);
            return [2 /*return*/, verses];
        });
    });
}
/**
 * Fetch a single verse from bolls.life API
 */
function fetchVerse(translation, book, chapter, verse) {
    return __awaiter(this, void 0, void 0, function () {
        var url, response, data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = "https://bolls.life/get-verse/".concat(translation, "/").concat(book, "/").concat(chapter, "/").concat(verse, "/");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch(url)];
                case 2:
                    response = _a.sent();
                    if (!response.ok) {
                        console.error("Failed to fetch verse: ".concat(url));
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    return [2 /*return*/, data];
                case 4:
                    error_1 = _a.sent();
                    console.error("Error fetching verse: ".concat(error_1));
                    return [2 /*return*/, null];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get all verses grouped by reference (book, chapter, verse)
 * Returns a map of reference -> translations
 */
function groupVersesByReference(verses) {
    var grouped = new Map();
    for (var _i = 0, verses_1 = verses; _i < verses_1.length; _i++) {
        var verse = verses_1[_i];
        var key = "".concat(verse.book, "-").concat(verse.chapter, "-").concat(verse.verse);
        if (!grouped.has(key)) {
            grouped.set(key, new Map());
        }
        var translations = grouped.get(key);
        translations.set(verse.translation, cleanVerseText(verse.text));
    }
    return grouped;
}
/**
 * Get all unique verse references from a set of verses
 */
function getUniqueReferences(verses) {
    var seen = new Set();
    var references = [];
    for (var _i = 0, verses_2 = verses; _i < verses_2.length; _i++) {
        var verse = verses_2[_i];
        var key = "".concat(verse.book, "-").concat(verse.chapter, "-").concat(verse.verse);
        if (!seen.has(key)) {
            seen.add(key);
            var bookName = exports.BOOK_NAMES[verse.book];
            var slug = createSlug(verse.book, verse.chapter, verse.verse);
            var testament = exports.TESTAMENT[verse.book];
            references.push({
                book: bookName,
                bookNumber: verse.book,
                chapter: verse.chapter,
                verse: verse.verse,
                slug: slug
            });
        }
    }
    return references;
}
exports.default = {
    loadTranslationFromFile: loadTranslationFromFile,
    fetchVerse: fetchVerse,
    cleanVerseText: cleanVerseText,
    createSlug: createSlug,
    groupVersesByReference: groupVersesByReference,
    getUniqueReferences: getUniqueReferences,
    BOOK_NAMES: exports.BOOK_NAMES,
    TESTAMENT: exports.TESTAMENT
};
