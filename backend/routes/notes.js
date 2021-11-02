const express = require('express');
const fetchuser = require('../middleware/fetchuser');
const Note = require('../models/Note');
const { body, validationResult } = require('express-validator');
const router = express.Router();

//route1: get all notes using : GET  --> localhost:5000/api/notes/getuser   login required
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id });
        res.json(notes);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("some error occured");
    }
})

//route2: add new notes using : POST  --> localhost:5000/api/notes/addnote   login required
router.post('/addnote', fetchuser, [
    body('title', 'enter valid title').isLength({ min: 3 }),
    body('description', 'description must be at least 5 charcter')
], async (req, res) => {
    try {


        const { title, description, tag } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const note = new Note({
            title, description, tag, user: req.user.id
        })
        const savedNote = await note.save();

        res.json(savedNote);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("some error occured");
    }
})

//route 3: update notes using : PUT  --> localhost:5000/api/notes/updatenote   login required
router.put('/updatenote/:id', fetchuser, async (req, res) => {
    try {
        const { title, description, tag } = req.body;
        //new object
        const newNote = {};
        if (title) { newNote.title = title };
        if (description) { newNote.description = description };
        if (tag) { newNote.tag = tag };

        //update
        let note = await Note.findById(req.params.id);
        if (!note) { return res.status(404).send("not found") }

        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("not allowed");
        }

        note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
        res.json({ note });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("some error occured");
    }
})

//route 4: delete notes using : DELETE  --> localhost:5000/api/notes/deletenote   login required
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    try {

        //delete
        let note = await Note.findById(req.params.id);
        if (!note) { return res.status(404).send("not found") }

        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("not allowed");
        }

        note = await Note.findByIdAndDelete(req.params.id);
        res.json({ "success": "note has been deleted", note: note });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("some error occured");
    }
})
module.exports = router