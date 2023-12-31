// const express = require('express');
// const router = express.Router();
// const fetchuser = require('../middleware/fetchuser');
// const { body, validationResult } = require('express-validator')
// const Note = require('../models/Note');

// router.get('/fetchallnotes', fetchuser, async (req, res) => {
//     const notes = await Note.find({ user: req.user.id });
//     res.json(notes);
// })
// router.post('/addnote',fetchuser,
//     [body('title', 'Enter a Valid title').isLength({ min: 3 }),
//     body('description', 'Enter correct description').isLength({ min: 5 }),
//     ], async (req, res) => {
//         try {
//             const { title, description, tag } = req.body;
//             const errors = validationResult(req);
//             if (!errors.isEmpty()) {
//                 return res.status(400).json({ errors: errors.array() });
//             }
//             const note = new Note({
//                 title, description, tag, user: req.user.id
//             })
//             const savedNote = await note.save();
//             res.json(savedNote);
//         }
//         catch (e) {
//             console.log(e.message);
//             res.status(500).send("notes.js error");
//         }

//     })
// module.exports = router;

const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const Note = require('../models/Note');//importing Note model
const { body, validationResult } = require('express-validator');

// ROUTE 1: Get All the Notes using: GET "/api/notes/fetchallnotes". Login required
//sirf usi user ke corresponding notes fetch
//uske liye middleware fetchuser 
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id });
        res.json(notes)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

// // ROUTE 2: Add a new Note using: POST "/api/notes/addnote". Login required
router.post('/addnote', fetchuser, [
    body('title', 'Enter a valid title').isLength({ min: 3 }),
    body('description', 'Description must be atleast 5 characters').isLength({ min: 5 }),], async (req, res) => {
        try {
            const { title, description, tag } = req.body;

            // If there are errors, return Bad request and the errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) { //notes khali n ho 
                return res.status(400).json({ errors: errors.array() });
            }
            const note = new Note({
                title, description, tag, user: req.user.id
            })
            const savedNote = await note.save()

            res.json(savedNote)

        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal Server Error");
        }
    })

// // ROUTE 3: Update an existing Note using: PUT "/api/notes/updatenote:id". Login required
router.put('/updatenote/id', fetchuser, async (req, res) => { //kaun se note ko update kar rahe uski :id
    const { title, description, tag } = req.body; //destructing
    try {
        // Create a newNote object
        const newNote = {};
        if (title) { newNote.title = title }; //title update
        if (description) { newNote.description = description };
        if (tag) { newNote.tag = tag };

        // Find the note to be updated and update it
        //The req. params property is an object containing properties mapped to the named route “parameters”. 
        //For example, if you have the route /student/:id, then the “id” property is available as req.params.id.
        let note = await Note.findById(req.params.id);
        if (!note) { return res.status(404).send("Not Found") }
          
        //note ke user schema me jo id h user ki wo match karna chaiye req.user.id se
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }
        note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
        res.json({ note });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

// ROUTE 4: Delete an existing Note using: DELETE "/api/notes/deletenote". Login required
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    try {
        // Find the note to be delete and delete it
        let note = await Note.findById(req.params.id);
        if (!note) { return res.status(404).send("Not Found") }

        // Allow deletion only if user owns this Note
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }

        note = await Note.findByIdAndDelete(req.params.id)
        res.json({ "Success": "Note has been deleted", note: note });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})
module.exports = router