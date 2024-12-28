// /word-picker/index.js

const fs = require('fs');
const path = require('path');

/**
 * Retrieves a specified number of words based on optional constraints.
 *
 * @param {Object} options - An object containing optional parameters.
 * @param {number} amountOfWords - Number of words to retrieve.
 * @param {Array<string>} [customWordsArray] - (Optional) Custom array of words to use instead of words.txt or words.js.
 * @param {function} [customErrorHandler] - (Optional) Custom function to handle errors.
 * @returns {Array|string} - An array or string of words matching the specified criteria.
 */
function getWords(options = {}, amountOfWords, customWordsArray = null, customErrorHandler = null) {
    // Validate 'amountOfWords' parameter
    if (typeof amountOfWords !== 'number' || amountOfWords <= 0) {
        throw new Error("'amountOfWords' must be a positive number.");
    }

    // Load words from words.txt if available, else use words.js, else use customWordsArray or throw error
    let defaultWords = [];

    const wordsTxtPath = path.join(__dirname, 'words', 'words.txt');
    const wordsJsPath = path.join(__dirname, 'words', 'words.js');

    try {
        if (customWordsArray && Array.isArray(customWordsArray)) {
            defaultWords = customWordsArray;
            console.log(`Using customWordsArray with ${defaultWords.length} words.`);
        } else if (fs.existsSync(wordsTxtPath)) {
            const data = fs.readFileSync(wordsTxtPath, 'utf8');
            // Split by newlines and remove any surrounding quotes and commas
            defaultWords = data.split('\n').map(line => line.trim().replace(/^["']|["']$/g, '')).filter(line => line.length > 0);
            console.log(`Loaded ${defaultWords.length} words from words.txt`);
        } else if (fs.existsSync(wordsJsPath)) {
            defaultWords = require(wordsJsPath);
            if (!Array.isArray(defaultWords)) {
                throw new Error('words.js must export an array of words.');
            }
            console.log(`Loaded ${defaultWords.length} words from words.js`);
        } else {
            throw new Error('No words.txt or words.js found in the /words directory, and no customWordsArray provided.');
        }
    } catch (err) {
        if (customErrorHandler && typeof customErrorHandler === 'function') {
            customErrorHandler(err);
        } else {
            console.error(`Error loading words: ${err.message}`);
            process.exit(1);
        }
    }

    // Destructure options with default values
    const {
        lengthMin,
        lengthMax,
        fixLength,
        reverse = false,
        asString = false,
        sort,
        caseOption,
        filterStartsWith,
        filterEndsWith,
        excludeSubstrings,
        blacklist,
        whitelist,
        languages,
        excludeAmbiguous = false,
        pattern,
        phoneticDistinct = true,
        includeMetadata = false,
        history = new Set(),
        seed,
        weightedSelection,
        customShuffle,
        batchSize,
        validateWords,
        uniqueCharacters = false,
        maxRepeatLetters,
        allowNumbers = false,
        allowSpecialChars = false,
        minEntropy,
        returnEntropy = false,
        customEntropyCalculator,
        syllableCount,
        excludePartsOfSpeech,
        includePartsOfSpeech,
        limitSyllables,
        excludeWordOrigins,
        includeWordOrigins,
        excludeProperNouns = false,
        excludeSlang = false,
        includeDefinitions = false,
        includeExamples = false,
        synonyms,
        excludeHomonyms = false,
        includeHomonyms = false,
        excludeCompoundWords = false,
        excludeAbbreviations = false,
        onlyMonosyllabic = false,
        onlyPolysyllabic = false,
        limitVowels,
        excludeSpecificVowels,
        includeRhymeWith,
        excludeRhymeWith,
        scrabbleScoreRange,
        excludeLetters,
        includeLetters,
        mustContainAllLetters,
        mustContainAnyLetters,
        excludeWordsWithRepeatingLetters = false,
        minConsonants,
        minVowels,
        customFilter
    } = options;

    // Early return if amountOfWords is zero
    if (amountOfWords === 0) return asString ? "" : [];

    // Initialize Sets for blacklist and whitelist for O(1) lookups
    const blacklistSet = blacklist ? new Set(blacklist.map(word => word.toLowerCase())) : null;
    const whitelistSet = whitelist ? new Set(whitelist.map(word => word.toLowerCase())) : null;

    // Characters considered ambiguous
    const ambiguousChars = /[l1I0O]/i;

    // Function to calculate entropy (simple estimation based on word length and uniqueness)
    const calculateEntropy = (word) => {
        if (customEntropyCalculator && typeof customEntropyCalculator === 'function') {
            return customEntropyCalculator(word);
        }
        // Simple entropy calculation: number of unique characters
        const uniqueChars = new Set(word.toLowerCase()).size;
        return uniqueChars * Math.log2(26);
    };

    // Function to check phonetic distinctness (simple implementation using Soundex)
    const soundex = (word) => {
        const a = word.toLowerCase().split('');
        const f = a.shift();
        const codes = {
            a: '', e: '', i: '', o: '', u: '',
            b: '1', f: '1', p: '1', v: '1',
            c: '2', g: '2', j: '2', k: '2', q: '2', s: '2', x: '2', z: '2',
            d: '3', t: '3',
            l: '4',
            m: '5', n: '5',
            r: '6'
        };
        const soundexArr = [f.toUpperCase()];
        let prev = '';
        a.forEach(char => {
            const code = codes[char];
            if (code && code !== prev) {
                soundexArr.push(code);
                prev = code;
            }
        });
        // Pad with zeros or truncate to ensure length 4
        while (soundexArr.length < 4) soundexArr.push('0');
        return soundexArr.slice(0, 4).join('');
    };

    let phoneticMap = {};

    // Start filtering
    let filteredWords = defaultWords.filter(word => {
        const lowerWord = word.toLowerCase();

        // Apply whitelist: if whitelist is present, only include those words
        if (whitelistSet && !whitelistSet.has(lowerWord)) {
            return false;
        }

        // Apply blacklist
        if (blacklistSet && blacklistSet.has(lowerWord)) {
            return false;
        }

        // Apply language filter (assuming words are objects with a language property)
        if (languages && Array.isArray(languages) && languages.length > 0) {
            // Since words are strings, cannot filter by language
            return false;
        }

        // Apply length filters
        if (fixLength !== undefined && word.length !== fixLength) {
            return false;
        }
        if (lengthMin !== undefined && word.length < lengthMin) {
            return false;
        }
        if (lengthMax !== undefined && word.length > lengthMax) {
            return false;
        }

        // Exclude words with ambiguous characters
        if (excludeAmbiguous && ambiguousChars.test(word)) {
            return false;
        }

        // Apply filterStartsWith
        if (filterStartsWith && Array.isArray(filterStartsWith) && filterStartsWith.length > 0) {
            const startsWithMatch = filterStartsWith.some(prefix => word.toLowerCase().startsWith(prefix.toLowerCase()));
            if (!startsWithMatch) return false;
        }

        // Apply filterEndsWith
        if (filterEndsWith && Array.isArray(filterEndsWith) && filterEndsWith.length > 0) {
            const endsWithMatch = filterEndsWith.some(suffix => word.toLowerCase().endsWith(suffix.toLowerCase()));
            if (!endsWithMatch) return false;
        }

        // Apply excludeSubstrings
        if (excludeSubstrings && Array.isArray(excludeSubstrings) && excludeSubstrings.length > 0) {
            const hasExcludedSub = excludeSubstrings.some(sub => word.toLowerCase().includes(sub.toLowerCase()));
            if (hasExcludedSub) return false;
        }

        // Apply pattern
        if (pattern instanceof RegExp && !pattern.test(word)) {
            return false;
        }

        // Exclude words already in history to ensure uniqueness across sessions
        if (history.has(lowerWord)) {
            return false;
        }

        // Apply uniqueCharacters
        if (uniqueCharacters) {
            const uniqueChars = new Set(word.toLowerCase()).size;
            if (uniqueChars !== word.length) {
                return false;
            }
        }

        // Apply maxRepeatLetters
        if (maxRepeatLetters !== undefined && maxRepeatLetters > 0) {
            const letterCounts = {};
            for (let char of word.toLowerCase()) {
                letterCounts[char] = (letterCounts[char] || 0) + 1;
                if (letterCounts[char] > maxRepeatLetters) {
                    return false;
                }
            }
        }

        // Apply allowNumbers and allowSpecialChars
        if (!allowNumbers && /\d/.test(word)) {
            return false;
        }
        if (!allowSpecialChars && /[^a-zA-Z]/.test(word)) {
            return false;
        }

        // Apply syllableCount
        if (syllableCount !== undefined && typeof syllableCount === 'number') {
            // Since words are strings, cannot filter by syllableCount
            return false;
        }

        // Apply excludePartsOfSpeech
        if (excludePartsOfSpeech && Array.isArray(excludePartsOfSpeech) && excludePartsOfSpeech.length > 0) {
            // Since words are strings, cannot filter by parts of speech
            return false;
        }

        // Apply includePartsOfSpeech
        if (includePartsOfSpeech && Array.isArray(includePartsOfSpeech) && includePartsOfSpeech.length > 0) {
            // Since words are strings, cannot filter by parts of speech
            return false;
        }

        // Apply limitSyllables
        if (limitSyllables !== undefined && typeof limitSyllables === 'number') {
            // Since words are strings, cannot filter by syllables
            return false;
        }

        // Apply excludeWordOrigins
        if (excludeWordOrigins && Array.isArray(excludeWordOrigins) && excludeWordOrigins.length > 0) {
            // Since words are strings, cannot filter by word origins
            return false;
        }

        // Apply includeWordOrigins
        if (includeWordOrigins && Array.isArray(includeWordOrigins) && includeWordOrigins.length > 0) {
            // Since words are strings, cannot filter by word origins
            return false;
        }

        // Apply excludeProperNouns
        if (excludeProperNouns) {
            // Since words are lowercase strings, assume no proper nouns
            return false;
        }

        // Apply excludeSlang
        if (excludeSlang) {
            // Since words are strings without slang info, cannot filter
            return false;
        }

        // Apply synonyms
        if (synonyms && Array.isArray(synonyms) && synonyms.length > 0) {
            // Since words are strings without synonyms, cannot filter
            return false;
        }

        // Apply excludeHomonyms
        if (excludeHomonyms) {
            // Since words are strings without homonym info, cannot filter
            return false;
        }

        // Apply includeHomonyms
        if (includeHomonyms) {
            // Since words are strings without homonym info, cannot filter
            return false;
        }

        // Apply excludeCompoundWords
        if (excludeCompoundWords) {
            // Since words are strings without compound word info, cannot filter
            return false;
        }

        // Apply excludeAbbreviations
        if (excludeAbbreviations) {
            // Since words are strings without abbreviation info, cannot filter
            return false;
        }

        // Apply onlyMonosyllabic
        if (onlyMonosyllabic) {
            // Since words are strings without syllable info, cannot filter
            return false;
        }

        // Apply onlyPolysyllabic
        if (onlyPolysyllabic) {
            // Since words are strings without syllable info, cannot filter
            return false;
        }

        // Apply limitVowels
        if (limitVowels && Array.isArray(limitVowels) && limitVowels.length > 0) {
            const hasVowels = limitVowels.some(vowel => word.toLowerCase().includes(vowel.toLowerCase()));
            if (!hasVowels) {
                return false;
            }
        }

        // Apply excludeSpecificVowels
        if (excludeSpecificVowels && Array.isArray(excludeSpecificVowels) && excludeSpecificVowels.length > 0) {
            const hasExcludedVowels = excludeSpecificVowels.some(vowel => word.toLowerCase().includes(vowel.toLowerCase()));
            if (hasExcludedVowels) {
                return false;
            }
        }

        // Apply includeRhymeWith
        if (includeRhymeWith && typeof includeRhymeWith === 'string') {
            // Simple rhyme matching: same ending sound (last two letters)
            const rhyme = includeRhymeWith.slice(-2).toLowerCase();
            if (!word.toLowerCase().endsWith(rhyme)) {
                return false;
            }
        }

        // Apply excludeRhymeWith
        if (excludeRhymeWith && typeof excludeRhymeWith === 'string') {
            const rhyme = excludeRhymeWith.slice(-2).toLowerCase();
            if (word.toLowerCase().endsWith(rhyme)) {
                return false;
            }
        }

        // Apply scrabbleScoreRange
        if (scrabbleScoreRange && Array.isArray(scrabbleScoreRange) && scrabbleScoreRange.length === 2) {
            const [minScore, maxScore] = scrabbleScoreRange;
            const scrabbleScore = calculateScrabbleScore(word);
            if (scrabbleScore < minScore || scrabbleScore > maxScore) {
                return false;
            }
        }

        // Apply excludeLetters
        if (excludeLetters && Array.isArray(excludeLetters) && excludeLetters.length > 0) {
            const hasExcludedLetter = excludeLetters.some(letter => word.toLowerCase().includes(letter.toLowerCase()));
            if (hasExcludedLetter) {
                return false;
            }
        }

        // Apply includeLetters
        if (includeLetters && Array.isArray(includeLetters) && includeLetters.length > 0) {
            const hasIncludedLetter = includeLetters.some(letter => word.toLowerCase().includes(letter.toLowerCase()));
            if (!hasIncludedLetter) {
                return false;
            }
        }

        // Apply mustContainAllLetters
        if (mustContainAllLetters && Array.isArray(mustContainAllLetters) && mustContainAllLetters.length > 0) {
            const containsAll = mustContainAllLetters.every(letter => word.toLowerCase().includes(letter.toLowerCase()));
            if (!containsAll) {
                return false;
            }
        }

        // Apply mustContainAnyLetters
        if (mustContainAnyLetters && Array.isArray(mustContainAnyLetters) && mustContainAnyLetters.length > 0) {
            const containsAny = mustContainAnyLetters.some(letter => word.toLowerCase().includes(letter.toLowerCase()));
            if (!containsAny) {
                return false;
            }
        }

        // Apply excludeWordsWithRepeatingLetters
        if (excludeWordsWithRepeatingLetters) {
            const letters = word.toLowerCase().split('');
            const uniqueLetters = new Set(letters);
            if (uniqueLetters.size !== letters.length) {
                return false;
            }
        }

        // Apply minConsonants
        if (minConsonants !== undefined && typeof minConsonants === 'number') {
            const consonants = word.toLowerCase().replace(/[aeiou]/g, '');
            if (consonants.length < minConsonants) {
                return false;
            }
        }

        // Apply minVowels
        if (minVowels !== undefined && typeof minVowels === 'number') {
            const vowels = word.toLowerCase().match(/[aeiou]/g) || [];
            if (vowels.length < minVowels) {
                return false;
            }
        }

        // Apply customFilter
        if (customFilter && typeof customFilter === 'function') {
            if (!customFilter(word)) {
                return false;
            }
        }

        // All filters passed
        return true;
    });

    // Apply phonetic distinctness
    if (phoneticDistinct) {
        filteredWords = filteredWords.filter(word => {
            const s = soundex(word);
            if (phoneticMap[s]) {
                return false;
            }
            phoneticMap[s] = true;
            return true;
        });
    }

    // Apply weighted selection
    if (weightedSelection && typeof weightedSelection === 'object') {
        const weightedWords = [];
        filteredWords.forEach(word => {
            const weight = weightedSelection[word.toLowerCase()] || 1;
            for (let i = 0; i < weight; i++) {
                weightedWords.push(word);
            }
        });
        filteredWords = weightedWords;
    }

    // Apply custom shuffle
    const shuffle = (array) => {
        if (customShuffle && typeof customShuffle === 'function') {
            customShuffle(array);
            return;
        }
        // Fisher-Yates Shuffle with simple randomness
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    };

    shuffle(filteredWords);

    // Apply sort if required
    if (sort === 'asc') {
        filteredWords.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    } else if (sort === 'desc') {
        filteredWords.sort((a, b) => b.toLowerCase().localeCompare(a.toLowerCase()));
    }

    // Limit maximum attempts to prevent infinite loops
    const maxAttempts = 1000;
    let attempts = 0;

    // Select the desired number of words
    let selectedWords = [];
    for (let word of filteredWords) {
        if (selectedWords.length >= amountOfWords) break;
        selectedWords.push(word);
        attempts++;
        if (attempts >= maxAttempts) break;
    }

    // Apply 'reverse' if needed
    if (reverse) {
        selectedWords = selectedWords.reverse();
    }

    // Apply 'caseOption' if needed
    if (caseOption === 'upper') {
        selectedWords = selectedWords.map(word => word.toUpperCase());
    } else if (caseOption === 'lower') {
        selectedWords = selectedWords.map(word => word.toLowerCase());
    } else if (caseOption === 'capitalize') {
        selectedWords = selectedWords.map(word => word.charAt(0).toUpperCase() + word.slice(1));
    }

    // Apply synonyms inclusion
    if (synonyms && Array.isArray(synonyms) && synonyms.length > 0) {
        const synonymSet = new Set(synonyms.map(syn => syn.toLowerCase()));
        selectedWords = selectedWords.flatMap(word => {
            // Since words are strings without synonyms, this feature will require word objects
            // For now, we'll skip as it's not applicable
            return [];
        });
    }

    // Update history to include selected words
    selectedWords.forEach(word => history.add(word.toLowerCase()));

    // Return as string if required
    if (asString) {
        return selectedWords.join(', ');
    }

    // Return as array, possibly with metadata
    if (includeMetadata) {
        return selectedWords.map(word => ({
            word: word,
            length: word.length,
            entropy: calculateEntropy(word),
            // Add more metadata as needed
        }));
    }

    return selectedWords;
}

// Helper function to calculate Scrabble score
function calculateScrabbleScore(word) {
    const scores = {
        a: 1, b: 3, c: 3, d: 2, e: 1, f: 4, g: 2, h: 4, i: 1,
        j: 8, k: 5, l: 1, m: 3, n: 1, o: 1, p: 3, q: 10,
        r: 1, s: 1, t: 1, u: 1, v: 4, w: 4, x: 8, y: 4,
        z: 10
    };
    return word.toLowerCase().split('').reduce((acc, char) => acc + (scores[char] || 0), 0);
}

// Export the function for use in other files
module.exports = { getWords };

