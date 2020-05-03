// Getting packages
const express = require("express"),
bodyParser = require("body-parser"),
app = express(),
admin = require("firebase-admin"),
serviceAccount = require("./credentials/restful-blog-study-firebase-adminsdk.json");

// App's configuration
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine","ejs");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://restful-blog-study.firebaseio.com"
});

const db = admin.firestore();
const blogPostsCollection = db.collection("blog-posts");

// Blog model
// - title
// - imageURL
// - body
// - created

// RESTful routes

app.get("/", (req, res)=>{
    res.redirect("/blogs")
});

app.get("/blogs", (req, res)=>{
    blogPostsCollection.get().then(querySnapshot =>{
        // console.log(querySnapshot.docs[0].createTime);
        res.render("index.ejs", {blog_posts:querySnapshot.docs});
    });
});

app.get("/blogs/new", (req, res)=>{
    res.render("new.ejs")
});

app.get("/blogs/:id", (req, res)=>{
    //retrieve document with correct id
    blogPostsCollection.doc(req.params.id).get().then(documentSnapshot =>{
        res.render("show.ejs", {post:documentSnapshot})
    });
});

app.post("/blogs", (req, res)=>{
    //create blog object and save to db
    blogPostsCollection.add(req.body.blog).then(documentReference =>{
        console.log(`Added document with name: ${documentReference.id}`);
        res.redirect("/blogs")
    });
});

app.listen("3000", ()=>{
    console.log("Server is running!")
});