const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs'); // To read and write data to the file system

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// Helper function to read books from the file
function readBooksFromFile() {
  try {
    const data = fs.readFileSync('./data.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading the data file:', error);
    return [];
  }
}

// Helper function to write books to the file
function writeBooksToFile(books) {
  try {
    fs.writeFileSync('./data.json', JSON.stringify(books, null, 2));
  } catch (error) {
    console.error('Error writing to the data file:', error);
  }
}

// Helper function to find a book by its ID
function findBookById(bookId) {
  const books = readBooksFromFile();
  return books.find(book => book.book_id === bookId);
}

// CREATE - Add a new book
app.post('/books', (req, res) => {
  const { book_id, title, author, genre, year, copies } = req.body;

  // Validation for missing fields
  if (!book_id || !title || !author || !genre || !year || !copies) {
    return res.status(400).json({ message: 'All book fields are required.' });
  }

  // Read current books from file
  const books = readBooksFromFile();

  // Create new book and add to books array
  const newBook = { book_id, title, author, genre, year, copies };
  books.push(newBook);

  // Write updated books array to the file
  writeBooksToFile(books);

  res.status(201).json({ message: 'Book added successfully', book: newBook });
});

// READ - Get all books
app.get('/books', (req, res) => {
  const books = readBooksFromFile();
  res.json({ books });
});

// READ - Get a book by its ID
app.get('/books/:id', (req, res) => {
  const bookId = req.params.id;
  const book = findBookById(bookId);

  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }

  res.json({ book });
});

// UPDATE - Update book information
app.put('/books/:id', (req, res) => {
  const bookId = req.params.id;
  const book = findBookById(bookId);

  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }

  // Update the book fields with the new values (only the fields present in the request body)
  const { title, author, genre, year, copies } = req.body;

  if (title) book.title = title;
  if (author) book.author = author;
  if (genre) book.genre = genre;
  if (year) book.year = year;
  if (copies) book.copies = copies;

  // Read current books from file
  const books = readBooksFromFile();

  // Update the book in the array
  const updatedBooks = books.map(b => (b.book_id === bookId ? book : b));

  // Write updated books array to the file
  writeBooksToFile(updatedBooks);

  res.json({ message: 'Book updated successfully', book });
});

// DELETE - Remove a book by ID
app.delete('/books/:id', (req, res) => {
  const bookId = req.params.id;
  const books = readBooksFromFile();

  const bookIndex = books.findIndex(book => book.book_id === bookId);

  if (bookIndex === -1) {
    return res.status(404).json({ message: 'Book not found' });
  }

  // Remove the book from the array
  books.splice(bookIndex, 1);

  // Write updated books array to the file
  writeBooksToFile(books);

  res.json({ message: 'Book deleted successfully' });
});

// Start the server on the correct port
app.listen(PORT, () => {
  console.log(`Library Management System API is running on http://localhost:${PORT}`);
});