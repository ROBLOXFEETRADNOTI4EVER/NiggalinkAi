# Security Words Picker

![License: NIGGALINK](https://img.shields.io/badge/License-NIGGALINK-yellow.svg)
![npm](https://img.shields.io/npm/v/security-words-picker)
![Node.js](https://img.shields.io/badge/node-%3E%3D%2012.0.0-blue.svg)
![Size](https://img.shields.io/bundlephobia/min/security-words-picker)

**Security Words Picker** is a powerful and flexible utility designed to filter, select, and manage words from a predefined list. Whether you're developing applications for secure password recovery phrases, generating secure keys, or creating educational tools, this package offers the customization and reliability you need.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
  - [Basic Usage](#example-1-basic-usage)
  - [Filter by Length](#example-2-filter-by-length)
  - [Advanced Filtering](#example-3-advanced-filtering)
  - [Return as a String](#example-4-return-as-a-string)
  - [Custom Sorting and Case Transformation](#example-5-custom-sorting-and-case-transformation)
- [API Reference](#api-reference)
  - [getWords(options, amountOfWords, wordsArray)](#getwordoptions-number-amountofwords-array-wordsarray)
- [Options](#options)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## Features

Security Words Picker comes packed with a wide array of features to meet diverse requirements:

- **Flexible Word Selection:** Filter words based on minimum, maximum, or exact length.
- **Sorting Options:** Alphabetically sort words in ascending (`asc`) or descending (`desc`) order.
- **Reverse Order:** Retrieve words in reverse order if needed.
- **Substring Filters:**
  - Include words that start or end with specific substrings.
  - Exclude words containing certain substrings.
- **Character Control:**
  - Allow or exclude special characters, numbers, or ambiguous characters.
  - Enforce unique character constraints.
  - Limit the number of repeated letters in words.
- **Case Adjustments:** Transform words to uppercase, lowercase, or capitalize the first letter.
- **Whitelist and Blacklist:** Include only specific words or exclude certain words entirely.
- **Phonetic Distinctness:** Ensure selected words sound distinctly different for enhanced security.
- **History Tracking:** Avoid duplicates by maintaining a history of previously selected words.
- **Metadata Inclusion:** Optionally return word metadata such as length and entropy.
- **Entropy Filtering:** Filter words based on their calculated entropy.
- **Regex Filtering:** Use custom regex patterns to include or exclude words.
- **Custom Shuffling:** Apply your custom shuffle algorithm or use the default randomizer.
- **Batch Processing:** Efficiently process large word lists in customizable batches.

And much more to cater to your specific needs!

## Installation

Install **Security Words Picker** via [npm](https://www.npmjs.com/):

```bash
npm install security-words-picker
```

## Quick Start

Get up and running quickly by following the examples below.

### Example 1: Basic Usage

Retrieve five random words without any filters:

```javascript
const { getWords } = require('security-words-picker');
const wordsArray = require('./words'); // Replace with your word list array

const result = getWords({}, 5, wordsArray);
console.log(result);
// Output: ["randomWord1", "randomWord2", "randomWord3", "randomWord4", "randomWord5"]
```

### Example 2: Filter by Length

Retrieve words between 4 and 8 characters long:

```javascript
const options = {
  lengthMin: 4,
  lengthMax: 8
};

const result = getWords(options, 10, wordsArray);
console.log(result);
// Output: ["wordOne", "wordTwo", ..., "wordTen"]
```

### Example 3: Advanced Filtering

Retrieve 6 words that:
- Start with "a" or "b"
- End with "ing" or "ed"
- Exclude words containing "ion" or "xyz"
- Are phonetic distinct

```javascript
const options = {
  filterStartsWith: ["a", "b"],
  filterEndsWith: ["ing", "ed"],
  excludeSubstrings: ["ion", "xyz"],
  phoneticDistinct: true
};

const result = getWords(options, 6, wordsArray);
console.log(result);
// Output: ["acting", "baked", "bending", ...]
```

### Example 4: Return as a String

Retrieve 3 words as a comma-separated string:

```javascript
const options = {
  asString: true
};

const result = getWords(options, 3, wordsArray);
console.log(result);
// Output: "word1, word2, word3"
```

### Example 5: Custom Sorting and Case Transformation

Retrieve words sorted in descending order with all uppercase letters:

```javascript
const options = {
  sort: "desc",
  caseOption: "upper"
};

const result = getWords(options, 5, wordsArray);
console.log(result);
// Output: ["ZEBRA", "YELLOW", "XENON", "WHALE", "VIOLET"]
```

## API Reference

### `getWords(options, amountOfWords, wordsArray)`

Retrieves a specified number of words from the `wordsArray` based on optional constraints.

#### Parameters

- **`options`** `Object`  
  Configuration options to customize word selection. See [Options](#options) for detailed parameters.

- **`amountOfWords`** `number`  
  The number of words to retrieve. Must be a positive integer.

- **`wordsArray`** `Array`  
  Your array of words to select from. Can be an array of strings or objects with word properties.

#### Returns

- **`Array|string`**  
  Returns an array of words matching the specified criteria or a comma-separated string if `asString` is set to `true`.

#### Example Usage

```javascript
const options = {
  lengthMin: 5,
  excludeAmbiguous: true,
  sort: "asc",
  caseOption: "capitalize"
};

const selectedWords = getWords(options, 10, wordsArray);
console.log(selectedWords);
// Output: ["Apple", "Banana", "Cherry", ...]
```

## Options

Customize the behavior of `getWords` by passing an `options` object. Below are all available options:

- **`lengthMin`** `(number)`  
  Minimum length of words.

- **`lengthMax`** `(number)`  
  Maximum length of words.

- **`fixLength`** `(number)`  
  Exact length of words to retrieve.

- **`reverse`** `(boolean)`  
  If `true`, returns words in reverse order.

- **`asString`** `(boolean)`  
  If `true`, returns words as a comma-separated string.

- **`sort`** `(string)`  
  Sorts words alphabetically. Accepts `"asc"` for ascending or `"desc"` for descending.

- **`caseOption`** `(string)`  
  Adjusts the case of words. Options: `"upper"`, `"lower"`, or `"capitalize"`.

- **`filterStartsWith`** `(Array<string>)`  
  Only includes words starting with the specified substrings.

- **`filterEndsWith`** `(Array<string>)`  
  Only includes words ending with the specified substrings.

- **`excludeSubstrings`** `(Array<string>)`  
  Excludes words containing any of the specified substrings.

- **`blacklist`** `(Array<string>)`  
  Excludes specific words entirely.

- **`whitelist`** `(Array<string>)`  
  Only includes specific words, excluding all others.

- **`excludeAmbiguous`** `(boolean)`  
  Excludes words containing ambiguous characters like `l`, `1`, `I`, `0`, `O`.

- **`pattern`** `(RegExp)`  
  Uses a regex pattern to include or exclude words based on custom logic.

- **`phoneticDistinct`** `(boolean)`  
  Ensures selected words are phonetically distinct.

- **`includeMetadata`** `(boolean)`  
  Returns additional metadata for each word, such as length and entropy.

- **`history`** `(Set<string>)`  
  Maintains a history of previously selected words to avoid duplicates.

- **`seed`** `(number)`  
  Seed for reproducible randomness in word selection.

- **`weightedSelection`** `(Object)`  
  Assigns weights to words for weighted random selection. Example: `{ "apple": 2, "banana": 1 }`.

- **`customShuffle`** `(function)`  
  Provides a custom shuffle function for word ordering.

- **`batchSize`** `(number)`  
  Processes words in specified batch sizes for efficiency.

- **`validateWords`** `(function)`  
  Additional function to validate words based on custom criteria.

- **`uniqueCharacters`** `(boolean)`  
  Ensures each word has all unique characters.

- **`maxRepeatLetters`** `(number)`  
  Limits the number of times a single letter can appear in a word.

- **`allowNumbers`** `(boolean)`  
  Allows words to contain numbers if set to `true`.

- **`allowSpecialChars`** `(boolean)`  
  Allows words to contain special characters if set to `true`.

- **`minEntropy`** `(number)`  
  Sets a minimum entropy level for words to ensure complexity.

- **`returnEntropy`** `(boolean)`  
  Returns entropy values alongside words.

- **`customEntropyCalculator`** `(function)`  
  Provides a custom function to calculate word entropy.

- **`syllableCount`** `(number)`  
  Specifies the exact number of syllables a word should have.

- **`excludePartsOfSpeech`** `(Array<string>)`  
  Excludes words based on specified parts of speech.

- **`includePartsOfSpeech`** `(Array<string>)`  
  Includes only words of specified parts of speech.

- **`limitSyllables`** `(number)`  
  Sets a maximum number of syllables a word can have.

- **`excludeWordOrigins`** `(Array<string>)`  
  Excludes words from specified origins.

- **`includeWordOrigins`** `(Array<string>)`  
  Includes only words from specified origins.

- **`excludeProperNouns`** `(boolean)`  
  Excludes proper nouns if set to `true`.

- **`excludeSlang`** `(boolean)`  
  Excludes slang or informal words if set to `true`.

- **`includeDefinitions`** `(boolean)`  
  Returns definitions of each word alongside the word itself.

- **`includeExamples`** `(boolean)`  
  Returns example sentences for each word.

- **`synonyms`** `(Array<string>)`  
  Includes synonyms of the selected words.

- **`excludeHomonyms`** `(boolean)`  
  Excludes homonyms if set to `true`.

- **`includeHomonyms`** `(boolean)`  
  Includes only homonyms if set to `true`.

- **`excludeCompoundWords`** `(boolean)`  
  Excludes compound words if set to `true`.

- **`excludeAbbreviations`** `(boolean)`  
  Excludes abbreviations if set to `true`.

- **`onlyMonosyllabic`** `(boolean)`  
  Includes only monosyllabic words if set to `true`.

- **`onlyPolysyllabic`** `(boolean)`  
  Includes only polysyllabic words if set to `true`.

- **`limitVowels`** `(Array<string>)`  
  Includes words containing specific vowels.

- **`excludeSpecificVowels`** `(Array<string>)`  
  Excludes words containing certain vowels.

- **`includeRhymeWith`** `(string)`  
  Includes words that rhyme with the specified word.

- **`excludeRhymeWith`** `(string)`  
  Excludes words that rhyme with the specified word.

- **`scrabbleScoreRange`** `(Array<number>)`  
  Selects words with Scrabble scores within the specified range. Example: `[5, 15]`.

- **`excludeLetters`** `(Array<string>)`  
  Excludes words containing specific letters.

- **`includeLetters`** `(Array<string>)`  
  Includes only words containing specific letters.

- **`mustContainAllLetters`** `(Array<string>)`  
  Includes only words that contain all specified letters.

- **`mustContainAnyLetters`** `(Array<string>)`  
  Includes only words that contain any of the specified letters.

- **`excludeWordsWithRepeatingLetters`** `(boolean)`  
  Excludes words with repeating letters if set to `true`.

- **`minConsonants`** `(number)`  
  Sets a minimum number of consonants a word should have.

- **`minVowels`** `(number)`  
  Sets a minimum number of vowels a word should have.

- **`customFilter`** `(function)`  
  Provides a custom function to filter words based on bespoke logic.

## License

This project is licensed under the [NIGGALINK License](NIGGALINK).

## Acknowledgments

- **Creator:** GeorgeDroyd with NiggalinkAI.
- **Special Thanks:** To all contributors and users who have supported and improved this package.
- **Inspiration:** Inspired by the need for secure and customizable word selection in various applications.

Enjoy using **Security Words Picker** in your projects!

---

