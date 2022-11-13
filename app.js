const express = require("express")
const app = express()
const mongoose = require("mongoose")
const bodyParser = require("body-parser")
const { defaults } = require("requests/requested")
const _ = require("lodash")
// const DB = "mongodb+srv://<toDoList>:<ZoLnmMfMYVONpCwS>@cluster0.sb3eua1.mongodb.net/toDoListDB?retryWrites=true&w=majority"


// from this we'll fetch the current date
const date = require(__dirname + "/date.js")



app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));   // inside this public folder you can have your own css and js files

// mongoose.connect(DB, {
//     useNewUrlParser:true,
//     useCreateIndex:true,
//     useUnifiedToplogy:true,
//     useFindAndModify:false

// }).then(()=>{
//     console.log(`Connection is successful`);
// }).catch((err)=> console.log(`no connections`));

// mongoose.connect()
mongoose.connect("mongodb+srv://admin-ayush:Test123@cluster0.7uilamf.mongodb.net/toDoListDB?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true}).then(()=>{
    console.log(`Connection is successful`);
}).catch((err)=> console.log(`no connections`));


const itemSchema = mongoose.Schema({
    name: String
});

const Item = mongoose.model("Item", itemSchema);
const bath = new Item({
    name: "Bath"
});
const brush = new Item({
    name: "brush your teeth"
});
const meditate = new Item({
    name: "Meditation"
});

const deafultItems = [bath, brush, meditate];


const listSchema = {
    name: String,
    items: [itemSchema]

}
const List = mongoose.model("List", listSchema);


// workEndshere

// Ending the item Schema

app.get("/", function(req, res) { 

    let day = date.getDate();

    
    Item.find({}, (err, foundItems)=>{
        if(foundItems.length == 0){
            Item.insertMany(deafultItems, (err) =>{
                if(err){
                    console.log(err);

                }
                else{
                    console.log("sab kuch set h bhai");
                }
            });
            res.redirect("/");
        }
       
        else{
        res.render("list", {listTitle: "Today", newListItems: foundItems})
        }
    })
});





// customListStarts

app.get("/:customListName", (req, res) =>{
    const customListName = _.capitalize(req.params.customListName);
    
    List.findOne({name: customListName}, (err, foundList) =>{
        if(!err){
            if(!foundList){
                // Create a new list as there is no list found with the name
                console.log("Doesn't Exist");
                const list = new List({
                    name: customListName,
                    items: deafultItems
                });
                list.save();
                res.redirect("/" + customListName);
            }
            else{
                console.log("Exist");
                // Show that already existing list
                res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
             }
        }
    })
});

app.post("/", function(req, res) {

    // console.log(req.body);
    const itemName = req.body.newItem;
    const listName = req.body.list;
    // console.log(listName)
    // console.log(date.getDay());
    // const del = req.body.deleteItem;

    const item = new Item({
        name: itemName
    });
if(itemName !== ""){
   if(listName === "Today"){
    // console.log("yes working")
    item.save();    
    res.redirect("/");
   }
   else{
    List.findOne({name: listName}, (err, foundList)=>{
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName)
    })


}
}
else{

    res.redirect("/")
}

   

});

app.post("/delete", function(req, res) {
  
  const checkedItemId = req.body.Miscellaneous_Item;
  const listName = req.body.listName;
//   console.log(listName);


  if (listName === "Today") {

    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (!err) {
        console.log("Successfully deleted item");
        res.redirect("/");
      }
    });


  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList) {
       if(!err) {
         res.redirect("/" + listName);
       }
    }) 
  }

    
});
let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}


app.listen(port, function() {
    console.log("Server has started on ")
})
