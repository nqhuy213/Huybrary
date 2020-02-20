const Book = require('../models/book')
const express = require('express')
const router = express.Router()
const Author = require('../models/author')
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']
const mongoose = require('mongoose')

//All Books Route
router.get('/', async (req,res)=> {
    let searchOptions  = {}
    queryTitle = req.query.title
    queryAuthor = req.query.author
    if (queryTitle != null && queryTitle !== '')
    {
        searchOptions.title = new RegExp(queryTitle, 'i')
    }
    if (queryAuthor != null && queryAuthor != '')
    {
        searchOptions.author = new mongoose.Types.ObjectId(queryAuthor)
    }
    try{
        const authors = await Author.find({})
        const books = await Book.find(searchOptions)
        res.render('books/index', {
            books: books,
            authors: authors,
            searchOptions: req.query
        })
    }catch{
        res.redirect('/')
    }
})

//New Book Route
router.get('/new', async (req,res)=> {
    try{
        const authors = await Author.find({})
        const book = new Book()
        res.render('books/new', {
            authors: authors,
            book: book
        })
    }catch{
        res.redirect('/')
    }
})

//Create Book Route
router.post('/', async (req,res) => {
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        description: req.body.description,
    })
    saveCover(book, req.body.cover)
    try{
        const newBook = await book.save()
        // res.render('books/${newBook.id}')
        res.redirect('books')
    }
    catch{
        renderNewPage(res,book, true)
    }
})

async function renderNewPage(res, book, hasError = fasle){
    try{
        const authors = await Author.find({})
        const params = {
            authors: authors,
            book: book
        }
        if(hasError) params.errorMessage = 'Error Creating Book'
        res.render('books/new', params )
    }catch{
        res.redirect('/books')
    }
}

function saveCover(book, coverEncoded){
    if(coverEncoded == null) return
    //Decode the coverEncoded into a JSON object
    const cover = JSON.parse(coverEncoded)
    if(cover != null && imageMimeTypes.includes(cover.type)){
        book.coverImage = new Buffer.from(cover.data, 'base64')
        book.coverImageType = cover.type
    }
}
module.exports = router