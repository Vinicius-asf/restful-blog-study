// Getting packages
const express = require("express"),
bodyParser = require("body-parser"),
app = express(),
methodOverride = require("method-override"),
sanitizer = require("express-sanitizer"),
admin = require("firebase-admin"),
serviceAccount = require("./credentials/restful-blog-study-firebase-adminsdk.json");

// App's configuration
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(sanitizer());
app.use(methodOverride("_method"));
app.set("view engine","ejs");


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://restful-blog-study.firebaseio.com"
});

const db = admin.firestore();
const blogPostsCollection = db.collection("blog-posts");

process.on('SIGINT', ()=>{
    db.terminate().then(()=>{
        console.log(`Firestore has been teminated`);
        admin.app().delete().then(function() {
            console.log("App deleted successfully");
            process.exit()
        }).catch(function(error) {
            console.log("Error deleting app:", error);
            process.exit()
        });
    });
});

// Blog model
// - title
// - imageURL
// - body
// - created

// RESTful routes

// INDEX
app.get("/", (req, res)=>{
    res.redirect("/blogs")
});

// INDEX
app.get("/blogs", (req, res)=>{
    blogPostsCollection.get().then(querySnapshot =>{
        // console.log(querySnapshot.docs[0].createTime);
        res.render("index.ejs", {blog_posts:querySnapshot.docs});
    }).catch(error => {
        console.log(error);
        res.send("Couldn't load your page! ='(")
    });
});

// NEW
app.get("/blogs/new", (req, res)=>{
    res.render("new.ejs")
});

// SHOW
app.get("/blogs/:id", (req, res)=>{
    //retrieve document with correct id
    blogPostsCollection.doc(req.params.id).get().then(documentSnapshot =>{
        res.render("show.ejs", {post:documentSnapshot})
    }).catch(error =>{
        console.log(error)
        res.redirect("/blogs")
    });
});

// EDIT
app.get("/blogs/:id/edit", (req, res)=>{
    blogPostsCollection.doc(req.params.id).get().then(documentSnapshot =>{
        res.render("edit.ejs", {post:documentSnapshot})
    }).catch(error =>{
        console.log(error)
        res.redirect("/blogs")
    });
    // res.render("edit.ejs")
});

// CREATE
app.post("/blogs", (req, res)=>{
    //create blog object and save to db
    req.body.blog.body = req.sanitize(req.body.blog.body)

    blogPostsCollection.add(req.body.blog).then(documentReference =>{
        console.log(`Added document with name: ${documentReference.id}`);
        res.redirect("/blogs")
    }).catch(error => {
        console.log(error);
        res.redirect("/blogs/new")
    });
});

// UPDATE
app.put("/blogs/:id", (req,res)=>{
    req.body.blog.body = req.sanitize(req.body.blog.body)

    blogPostsCollection.doc(req.params.id).update(req.body.blog).then(writeResult =>{
        console.log(`Document written at: ${writeResult.writeTime.toDate()}`);
        res.redirect(`/blogs/${req.params.id}`)
    });
});

// DELETE
app.delete("/blogs/:id", (req, res)=>{
    blogPostsCollection.doc(req.params.id).delete().then(()=>{
        console.log('Document successfully deleted.');
        res.redirect("/blogs")
    });
});

app.listen("3000", ()=>{
    console.log("Server is running!")
});